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
  // Panicked firing: morale sum ≤ −20% → additional −1 to hit target.
  const moraleSum = attacker.moraleMods.reduce((a, m) => a + m.pct, 0);
  if (moraleSum <= -20) t -= 1;
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
  if (state.defeated) return state;
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
    case "discard_for_rout":
      return discardForRout(state, action.instanceId);
    case "dismiss_spy_reveal":
      return { ...state, enemyHandReveal: null };
    case "end_turn":
      return endTurn(state);
  }
}

function discardForRout(state: GameState, instanceId: string): GameState {
  if (!state.pendingDiscardOnRout) return state;
  const idx = state.hand.findIndex(c => c.instanceId === instanceId);
  if (idx < 0) return state;
  const card = state.hand[idx];
  const hand = [...state.hand.slice(0, idx), ...state.hand.slice(idx + 1)];
  const log: LogEntry[] = [
    ...state.log,
    { turn: state.turn, phase: state.phase, text: `Lost unit cost us "${card.title}" from hand.` },
  ];
  const next: GameState = {
    ...state,
    hand,
    discard: [...state.discard, card],
    log,
    pendingDiscardOnRout: false,
  };
  return checkDefeatAndStrain(recomputeMoraleMods(next));
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
    case "draw": {
      // Dispatch Rider / Courier — refill hand from deck.
      const rng = makeRng(state.rngSeed);
      const deckCopy = [...state.deck];
      let drawnCount = 0;
      for (let i = 0; i < a.count; i++) {
        if (deckCopy.length === 0 && discard.length > 0) {
          // Reshuffle discard into deck.
          for (let j = discard.length - 1; j > 0; j--) {
            const k = Math.floor(rng() * (j + 1));
            [discard[j], discard[k]] = [discard[k], discard[j]];
          }
          deckCopy.push(...discard);
          discard.length = 0;
        }
        const d = deckCopy.shift();
        if (d) { hand.push(d); drawnCount++; }
      }
      // Write back to state via closure replacement below.
      log.push({ turn: state.turn, phase: state.phase, text: `Played ${card.title} — drew ${drawnCount} card${drawnCount === 1 ? "" : "s"}.` });
      const withDraw: GameState = {
        ...state,
        hand,
        deck: deckCopy,
        discard,
        units,
        enemyUnits,
        pendingOrders: pending,
        log,
        selection: { cardInstanceId: null, unitId: null },
        phase: "move",
      };
      return checkDefeatAndStrain(recomputeMoraleMods(withDraw));
    }
    case "spy": {
      const reveal = state.enemyHand.map(c => ({ title: c.title, category: c.category }));
      log.push({ turn: state.turn, phase: state.phase, text: `Played ${card.title} — revealed ${reveal.length} enemy cards.` });
      const withSpy: GameState = {
        ...state,
        hand,
        discard,
        units,
        enemyUnits,
        pendingOrders: pending,
        log,
        selection: { cardInstanceId: null, unitId: null },
        phase: "move",
        enemyHandReveal: reveal,
      };
      return checkDefeatAndStrain(recomputeMoraleMods(withSpy));
    }
    case "move_sector":
    case "feigned_retreat":
    case "composite":
      // Simplified for v1.
      break;
  }

  log.push({ turn: state.turn, phase: state.phase, text: `Played ${card.title}` });

  const next: GameState = {
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
  return checkDefeatAndStrain(recomputeMoraleMods(next));
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
  let newSeed = (state.rngSeed + hitRolls.length * 7 + lethRolls.length * 13 + 101) >>> 0;

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
  const unitsPatch: Record<string, Unit> = {};
  const enemyUnitsPatch: Record<string, Unit> = {};
  if (isAttackerFriendly) unitsPatch[attackerId] = attackerAfter;
  else enemyUnitsPatch[attackerId] = attackerAfter;
  if (isTargetFriendly) unitsPatch[targetId] = targetAfter;
  else enemyUnitsPatch[targetId] = targetAfter;

  // Post-hit commander check: if target has a commander attached and in-range,
  // and any casualties were inflicted, roll one d10 ≤ 2 → commander team loses 1 figure.
  if (casualties > 0 && target.attachedTo) {
    const cmdrDict = isTargetFriendly ? state.units : state.enemyUnits;
    const commander = cmdrDict[target.attachedTo];
    if (commander && commander.commanderInRange && commander.figures > 0 && !commander.routed) {
      const cmdrRoll = rollD10(rng);
      const threshold = 2;
      newSeed = (newSeed + 37) >>> 0;
      if (cmdrRoll <= threshold) {
        const cmdrFigs = Math.max(0, commander.figures - 1);
        const cmdrRouted = cmdrFigs === 0;
        const cmdrAfter: Unit = { ...commander, figures: cmdrFigs, routed: cmdrRouted };
        if (isTargetFriendly) unitsPatch[commander.id] = cmdrAfter;
        else enemyUnitsPatch[commander.id] = cmdrAfter;
        log.push({
          turn: state.turn,
          phase: "attack",
          text: `Volume of fire reaches ${commander.name}: rolled ${cmdrRoll} ≤ ${threshold} → team loses 1 figure${cmdrRouted ? " · OFFICER DOWN" : ""}.`,
        });
      }
    }
  }

  const next: GameState = {
    ...state,
    units: { ...state.units, ...unitsPatch },
    enemyUnits: { ...state.enemyUnits, ...enemyUnitsPatch },
    log,
    rngSeed: newSeed,
    pendingOrders: state.pendingOrders.map(p =>
      p.unitId === attackerId && p.kind === "attack" && !p.done ? { ...p, done: true } : p
    ),
  };

  if (routed) {
    if (isTargetFriendly) next.victory = { ...state.victory, csa: state.victory.csa + 1 };
    else next.victory = { ...state.victory, union: state.victory.union + 1 };
    // Commander routs are worth 2 banners (extra +1 on top of the standard +1).
    const isCommander = target.type === "infantry_commander" || target.type === "cavalry_commander";
    if (isCommander) {
      if (isTargetFriendly) next.victory = { ...next.victory, csa: next.victory.csa + 1 };
      else next.victory = { ...next.victory, union: next.victory.union + 1 };
    }
    // Friendly unit routed → player must discard a card of their choice.
    if (isTargetFriendly && state.hand.length > 0) {
      next.pendingDiscardOnRout = true;
    }
  }

  return checkDefeatAndStrain(recomputeMoraleMods(next));
}

function recomputeMoraleMods(state: GameState): GameState {
  const friendlyStrain = state.hand.length < 3;
  const enemyStrain = state.enemyHand.length < 3;
  const apply = (dict: Record<string, Unit>, strain: boolean) => {
    const out: Record<string, Unit> = {};
    for (const [id, u] of Object.entries(dict)) {
      const mods = u.moraleMods.filter(
        m => m.source !== "casualties" && m.source !== "commander_oor" && m.source !== "command_strain"
      );
      if (u.figuresMax > 0 && u.figures < u.figuresMax * 0.5) {
        mods.push({ label: "Under 50% strength", pct: -5, source: "casualties" });
      }
      if (u.attachedTo && !u.commanderInRange) {
        mods.push({ label: "Commander out of range", pct: -10, source: "commander_oor" });
      }
      if (strain) {
        mods.push({ label: "Command strain (<3 cards)", pct: -20, source: "command_strain" });
      }
      out[id] = { ...u, moraleMods: mods };
    }
    return out;
  };
  return {
    ...state,
    units: apply(state.units, friendlyStrain),
    enemyUnits: apply(state.enemyUnits, enemyStrain),
  };
}

function checkDefeatAndStrain(state: GameState): GameState {
  if (state.defeated) return state;
  // Hand empty = command collapse = defeat.
  if (state.hand.length === 0 && !state.pendingDiscardOnRout) {
    return {
      ...state,
      defeated: "union",
      log: [
        ...state.log,
        { turn: state.turn, phase: state.phase, text: "Command has collapsed. The army disperses. Defeat." },
      ],
    };
  }
  // Victory by banners.
  if (state.victory.union >= state.victory.goal) {
    return {
      ...state,
      defeated: "csa",
      log: [...state.log, { turn: state.turn, phase: state.phase, text: "Banner threshold reached. The field is yours." }],
    };
  }
  return state;
}

function endTurn(state: GameState): GameState {
  // Reset per-turn flags. Hand does NOT auto-refill — it is the command capacity.
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
  const strained = state.hand.length < 3;
  const logEntry = strained
    ? `End of turn ${state.turn}. Hand at ${state.hand.length} — command strained, every unit at −20%.`
    : `End of turn ${state.turn}. Hand at ${state.hand.length}.`;
  const next: GameState = {
    ...state,
    turn: state.turn + 1,
    phase: "play",
    units: clear(state.units),
    enemyUnits: clear(state.enemyUnits),
    pendingOrders: [],
    selection: { cardInstanceId: null, unitId: null },
    rngSeed: newSeed,
    enemyHandReveal: null,
    log: [
      ...state.log,
      { turn: state.turn, phase: "end", text: logEntry },
    ],
  };
  return checkDefeatAndStrain(recomputeMoraleMods(next));
}
