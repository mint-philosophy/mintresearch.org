// RTS engine — pure reducer over GameState with seeded RNG for auditable rolls.
// No DOM, no I/O. UI layer dispatches Actions and renders state.

import type {
  Action,
  Card,
  GameState,
  LogEntry,
  RangeBand,
  Sector,
  Unit,
  UnitType,
} from "./types";

// ---------- RNG (mulberry32) ----------

export function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rollD10(rng: () => number): number {
  return Math.floor(rng() * 10) + 1;
}

// ---------- Dice targets ----------

export interface HitProfile {
  optimal: number;
  extended: number;
  melee: number;
}

const HIT_TABLE: Partial<Record<UnitType, HitProfile>> = {
  infantry: { optimal: 6, extended: 4, melee: 5 },
  cavalry: { optimal: 4, extended: 3, melee: 7 },
  skirmisher: { optimal: 7, extended: 5, melee: 3 },
  artillery: { optimal: 7, extended: 5, melee: 0 },
};

const LETHALITY_BASE = 5;

export function hitTarget(attacker: Unit, band: RangeBand, targetInCover: boolean, targetInBuilding: boolean): number {
  const profile = HIT_TABLE[attacker.type];
  if (!profile) return 0;
  let t = profile[band];
  if (targetInBuilding) t -= 2;
  else if (targetInCover) t -= 1;
  return Math.max(1, t);
}

export function lethalityTarget(target: Unit): number {
  const moraleSum = target.moraleMods.reduce((a, m) => a + m.pct, 0);
  // Positive sum = buff (harder to kill, lower target); negative = penalty.
  const shift = Math.round(moraleSum / 10);
  return Math.max(1, Math.min(9, LETHALITY_BASE - shift));
}

// ---------- Selectors ----------

export function unitById(state: GameState, id: string): Unit | undefined {
  return state.units[id] ?? state.enemyUnits[id];
}

export function cardEligibleUnits(state: GameState, card: Card): string[] {
  const a = card.authorization;
  if (a.kind === "move" || a.kind === "attack_only" || a.kind === "forced_march") {
    return Object.values(state.units)
      .filter(u => !u.routed && !u.activatedThisTurn)
      .filter(u => a.units[u.type] !== undefined || a.units.any !== undefined)
      .map(u => u.id);
  }
  if (a.kind === "move_sector") {
    return Object.values(state.units)
      .filter(u => !u.routed)
      .map(u => u.id);
  }
  if (a.kind === "resupply") {
    return Object.values(state.units)
      .filter(u => !u.routed && u.ammoMax > 0 && u.ammo < u.ammoMax)
      .map(u => u.id);
  }
  if (a.kind === "morale_buff" || a.kind === "entrench") {
    return Object.values(state.units).filter(u => !u.routed).map(u => u.id);
  }
  if (a.kind === "morale_break") {
    return Object.values(state.enemyUnits).filter(u => !u.routed).map(u => u.id);
  }
  if (a.kind === "commander_move") {
    return Object.values(state.units)
      .filter(u => u.type === "infantry_commander" || u.type === "cavalry_commander")
      .filter(u => !u.routed)
      .map(u => u.id);
  }
  if (a.kind === "counter_battery") {
    return Object.values(state.units)
      .filter(u => u.type === "artillery" && !u.routed)
      .map(u => u.id);
  }
  return [];
}

export function attackableTargets(state: GameState, attacker: Unit): { id: string; band: RangeBand }[] {
  if (attacker.ammo <= 0 && attacker.type !== "cavalry") return attacker.type === "cavalry" ? [] : [];
  const out: { id: string; band: RangeBand }[] = [];
  for (const t of Object.values(state.enemyUnits)) {
    if (t.routed) continue;
    const band = rangeBandBetween(attacker, t);
    if (band) out.push({ id: t.id, band });
  }
  return out;
}

// Very simple range-band check using sector Chebyshev distance.
// Adjacent (same sector) = melee; one step = optimal; two steps = extended (infantry/artillery/skirmisher).
function sectorDistance(a: Sector, b: Sector): number {
  const rankIdx = (r: Sector["rank"]) => (r === "vanguard" ? 0 : r === "center" ? 1 : 2);
  const fileIdx = (f: Sector["file"]) => (f === "left" ? 0 : f === "center" ? 1 : 2);
  return Math.max(Math.abs(rankIdx(a.rank) - rankIdx(b.rank)), Math.abs(fileIdx(a.file) - fileIdx(b.file)));
}

export function rangeBandBetween(attacker: Unit, target: Unit): RangeBand | null {
  const d = sectorDistance(attacker.sector, target.sector);
  if (d === 0) return "melee";
  if (d === 1) return "optimal";
  if (d === 2 && (attacker.type === "skirmisher" || attacker.type === "artillery")) return "extended";
  return null;
}

// ---------- Reducer ----------

export function reduce(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "select_card":
      return { ...state, selection: { ...state.selection, cardInstanceId: action.instanceId } };
    case "deselect_card":
      return { ...state, selection: { ...state.selection, cardInstanceId: null } };
    case "select_unit":
      return { ...state, selection: { ...state.selection, unitId: action.unitId } };
    case "play_card":
      return playCard(state, action.instanceId, action.targetUnitIds);
    case "propose_sector":
      return proposeSector(state, action.unitId, action.sector);
    case "confirm_sector":
      return confirmSector(state, action.unitId);
    case "cancel_sector":
      return cancelSector(state, action.unitId);
    case "attack":
      return resolveAttack(state, action.attackerId, action.targetId, action.rangeBand);
    case "end_turn":
      return endTurn(state);
  }
}

function playCard(state: GameState, instanceId: string, targetUnitIds: string[]): GameState {
  const cardIdx = state.hand.findIndex(c => c.instanceId === instanceId);
  if (cardIdx < 0) return state;
  const card = state.hand[cardIdx];
  const hand = [...state.hand.slice(0, cardIdx), ...state.hand.slice(cardIdx + 1)];
  const discard = [...state.discard, card];
  const units = { ...state.units };
  const enemyUnits = { ...state.enemyUnits };
  const pending = [...state.pendingOrders];
  const log: LogEntry[] = [...state.log];
  const a = card.authorization;

  const tag = (id: string, patch: Partial<Unit>) => {
    if (units[id]) units[id] = { ...units[id], ...patch };
    else if (enemyUnits[id]) enemyUnits[id] = { ...enemyUnits[id], ...patch };
  };

  switch (a.kind) {
    case "move": {
      for (const uid of targetUnitIds) {
        tag(uid, { activatedThisTurn: true });
        pending.push({ unitId: uid, kind: "move", fromCard: card.title, note: "Move authorized", done: false });
        if (a.post === "attack") {
          pending.push({ unitId: uid, kind: "attack", fromCard: card.title, note: "May attack after moving", done: false });
        }
      }
      break;
    }
    case "attack_only": {
      for (const uid of targetUnitIds) {
        tag(uid, { activatedThisTurn: true });
        pending.push({ unitId: uid, kind: "attack", fromCard: card.title, note: "Attack without moving", done: false });
      }
      break;
    }
    case "resupply": {
      for (const uid of targetUnitIds) {
        const u = units[uid];
        if (!u) continue;
        units[uid] = { ...u, ammo: u.ammoMax, moraleMods: u.moraleMods.filter(m => m.source !== "break") };
        pending.push({ unitId: uid, kind: "resupply", fromCard: card.title, note: `Ammo restored to ${u.ammoMax}`, done: true });
      }
      break;
    }
    case "morale_buff": {
      for (const uid of targetUnitIds) {
        const u = units[uid];
        if (!u) continue;
        units[uid] = { ...u, moraleMods: [...u.moraleMods, { label: card.title, pct: a.pct, source: "rally" }] };
        pending.push({ unitId: uid, kind: "morale_buff", fromCard: card.title, note: `+${a.pct}% morale`, done: true });
      }
      break;
    }
    case "morale_break": {
      for (const uid of targetUnitIds) {
        const u = enemyUnits[uid];
        if (!u) continue;
        enemyUnits[uid] = { ...u, moraleMods: [...u.moraleMods, { label: card.title, pct: -a.pct, source: "break" }] };
      }
      break;
    }
    case "entrench": {
      for (const uid of targetUnitIds) {
        const u = units[uid];
        if (!u) continue;
        units[uid] = { ...u, inCover: true };
        pending.push({ unitId: uid, kind: "entrench", fromCard: card.title, note: "Now in cover", done: true });
      }
      break;
    }
    case "commander_move": {
      for (const uid of targetUnitIds) {
        tag(uid, { activatedThisTurn: true });
        pending.push({ unitId: uid, kind: "move", fromCard: card.title, note: "Reposition commander", done: false });
      }
      break;
    }
    case "forced_march": {
      for (const uid of targetUnitIds) {
        tag(uid, { activatedThisTurn: true });
        pending.push({ unitId: uid, kind: "move", fromCard: card.title, note: `Force-march +${a.extraMove}S`, done: false });
      }
      break;
    }
    case "counter_battery": {
      for (const uid of targetUnitIds) {
        tag(uid, { activatedThisTurn: true });
        pending.push({ unitId: uid, kind: "attack", fromCard: card.title, note: "Counter-battery fire", done: false });
      }
      break;
    }
    case "move_sector":
    case "feigned_retreat":
    case "draw":
    case "composite":
      // Simplified for v1.
      break;
  }

  log.push({ turn: state.turn, phase: state.phase, text: `Played ${card.title}` });

  return {
    ...state,
    hand,
    discard,
    units,
    enemyUnits,
    pendingOrders: pending,
    log,
    selection: { cardInstanceId: null, unitId: null },
    phase: "move",
  };
}

function proposeSector(state: GameState, unitId: string, sector: Sector): GameState {
  const u = state.units[unitId];
  if (!u) return state;
  return {
    ...state,
    units: { ...state.units, [unitId]: { ...u, pendingSector: sector } },
  };
}

function confirmSector(state: GameState, unitId: string): GameState {
  const u = state.units[unitId];
  if (!u || !u.pendingSector) return state;
  const newSector = u.pendingSector;
  const pending = state.pendingOrders.map(p =>
    p.unitId === unitId && p.kind === "move" && !p.done ? { ...p, done: true } : p
  );
  return {
    ...state,
    units: {
      ...state.units,
      [unitId]: { ...u, sector: newSector, pendingSector: null, movedThisTurn: true },
    },
    pendingOrders: pending,
    log: [
      ...state.log,
      {
        turn: state.turn,
        phase: state.phase,
        text: `${u.name} → ${newSector.rank} · ${newSector.file}`,
      },
    ],
  };
}

function cancelSector(state: GameState, unitId: string): GameState {
  const u = state.units[unitId];
  if (!u) return state;
  return {
    ...state,
    units: { ...state.units, [unitId]: { ...u, pendingSector: null } },
  };
}

function resolveAttack(state: GameState, attackerId: string, targetId: string, band: RangeBand): GameState {
  const attacker = unitById(state, attackerId);
  const target = unitById(state, targetId);
  if (!attacker || !target) return state;

  const rng = makeRng(state.rngSeed);
  const hitT = hitTarget(attacker, band, target.inCover, target.inBuilding);
  const lethT = lethalityTarget(target);

  const hitRolls: number[] = [];
  for (let i = 0; i < attacker.figures; i++) hitRolls.push(rollD10(rng));
  const hits = hitRolls.filter(r => r <= hitT).length;

  const lethRolls: number[] = [];
  for (let i = 0; i < hits; i++) lethRolls.push(rollD10(rng));
  const casualties = lethRolls.filter(r => r <= lethT).length;

  const newFigures = Math.max(0, target.figures - casualties);
  const routed = newFigures === 0;

  const ammoSpent = band === "melee" ? 0 : 1;
  const attackerAfter: Unit = {
    ...attacker,
    ammo: Math.max(0, attacker.ammo - ammoSpent),
    firedThisTurn: true,
    activatedThisTurn: true,
  };
  const targetAfter: Unit = {
    ...target,
    figures: newFigures,
    routed,
  };

  // Bump seed forward deterministically.
  const newSeed = (state.rngSeed + hitRolls.length * 7 + lethRolls.length * 13 + 101) >>> 0;

  const log: LogEntry[] = [
    ...state.log,
    {
      turn: state.turn,
      phase: "attack",
      text: `${attacker.name} → ${target.name}: ${hits} hit${hits === 1 ? "" : "s"}, ${casualties} kill${casualties === 1 ? "" : "s"}${routed ? " · ROUTED" : ""}`,
      dice: { hit: hitRolls, hitTarget: hitT, lethality: lethRolls, lethalityTarget: lethT },
    },
  ];

  const isAttackerFriendly = !!state.units[attackerId];
  const isTargetFriendly = !!state.units[targetId];
  const next: GameState = {
    ...state,
    units: {
      ...state.units,
      ...(isAttackerFriendly ? { [attackerId]: attackerAfter } : {}),
      ...(isTargetFriendly ? { [targetId]: targetAfter } : {}),
    },
    enemyUnits: {
      ...state.enemyUnits,
      ...(!isAttackerFriendly ? { [attackerId]: attackerAfter } : {}),
      ...(!isTargetFriendly ? { [targetId]: targetAfter } : {}),
    },
    log,
    rngSeed: newSeed,
    pendingOrders: state.pendingOrders.map(p =>
      p.unitId === attackerId && p.kind === "attack" && !p.done ? { ...p, done: true } : p
    ),
  };

  if (routed) {
    if (isTargetFriendly) next.victory = { ...state.victory, csa: state.victory.csa + 1 };
    else next.victory = { ...state.victory, union: state.victory.union + 1 };
  }

  return recomputeMoraleMods(next);
}

function recomputeMoraleMods(state: GameState): GameState {
  const apply = (dict: Record<string, Unit>) => {
    const out: Record<string, Unit> = {};
    for (const [id, u] of Object.entries(dict)) {
      const mods = u.moraleMods.filter(m => m.source !== "casualties" && m.source !== "commander_oor");
      if (u.figuresMax > 0 && u.figures < u.figuresMax * 0.5) {
        mods.push({ label: "Under 50% strength", pct: -5, source: "casualties" });
      }
      if (u.attachedTo && !u.commanderInRange) {
        mods.push({ label: "Commander out of range", pct: -10, source: "commander_oor" });
      }
      out[id] = { ...u, moraleMods: mods };
    }
    return out;
  };
  return { ...state, units: apply(state.units), enemyUnits: apply(state.enemyUnits) };
}

function endTurn(state: GameState): GameState {
  // Reset flags, discard all pending orders, redraw back to hand cap.
  const rng = makeRng(state.rngSeed);
  let hand = [...state.hand];
  let deck = [...state.deck];
  let discard = [...state.discard];

  while (hand.length < state.handCap && (deck.length > 0 || discard.length > 0)) {
    if (deck.length === 0) {
      // Shuffle discard into deck.
      const shuffled = [...discard];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      deck = shuffled;
      discard = [];
    }
    const drawn = deck.shift();
    if (drawn) hand.push(drawn);
  }

  const clear = (dict: Record<string, Unit>): Record<string, Unit> => {
    const out: Record<string, Unit> = {};
    for (const [id, u] of Object.entries(dict)) {
      out[id] = {
        ...u,
        activatedThisTurn: false,
        movedThisTurn: false,
        firedThisTurn: false,
        pendingSector: null,
      };
    }
    return out;
  };

  const newSeed = (state.rngSeed + 1009) >>> 0;
  return {
    ...state,
    turn: state.turn + 1,
    phase: "play",
    hand,
    deck,
    discard,
    units: clear(state.units),
    enemyUnits: clear(state.enemyUnits),
    pendingOrders: [],
    selection: { cardInstanceId: null, unitId: null },
    rngSeed: newSeed,
    log: [
      ...state.log,
      { turn: state.turn, phase: "end", text: `End of turn ${state.turn}. Drew back to ${hand.length}.` },
    ],
  };
}
