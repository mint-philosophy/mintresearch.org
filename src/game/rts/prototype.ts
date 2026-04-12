// Interactive prototype — vanilla-TS renderer + event wiring over the RTS engine.
// One root node, full re-render on each action. Modals for sector picker and
// attack target picker.

import type {
  Action,
  Card,
  File,
  GameState,
  Rank,
  RangeBand,
  Sector,
  Unit,
  UnitType,
} from "./types";
import {
  attackableTargets,
  cardEligibleUnits,
  hitTarget,
  lethalityTarget,
  rangeBandBetween,
  reduce,
  unitById,
} from "./engine";
import { seedInitialState } from "./seed";

// ---------- Store ----------

let state: GameState = seedInitialState();
const subscribers: (() => void)[] = [];

function dispatch(action: Action) {
  state = reduce(state, action);
  for (const fn of subscribers) fn();
}

type Modal =
  | { kind: "none" }
  | { kind: "sector_picker"; unitId: string }
  | { kind: "attack_target"; attackerId: string }
  | { kind: "detail"; unitId: string }
  | { kind: "dice_result"; text: string };

let modal: Modal = { kind: "none" };
function setModal(m: Modal) {
  modal = m;
  rerender();
}

// ---------- Helpers ----------

const RANKS: Rank[] = ["vanguard", "center", "reserve"];
const FILES: File[] = ["left", "center", "right"];

function unitTypeLabel(t: UnitType): string {
  return (
    {
      infantry: "Infantry",
      cavalry: "Cavalry",
      skirmisher: "Skirmishers",
      artillery: "Artillery",
      wagon: "Wagon",
      infantry_commander: "Inf. Commander",
      cavalry_commander: "Cav. Commander",
    } as Record<UnitType, string>
  )[t];
}

function unitTypeClass(t: UnitType): string {
  if (t === "cavalry" || t === "cavalry_commander") return "cav";
  if (t === "skirmisher") return "skr";
  if (t === "artillery") return "art";
  if (t === "wagon") return "sup";
  if (t === "infantry_commander") return "cmd";
  return "";
}

function unitTypeBadge(t: UnitType): string {
  return (
    {
      infantry: "I",
      cavalry: "C",
      skirmisher: "S",
      artillery: "A",
      wagon: "W",
      infantry_commander: "★",
      cavalry_commander: "★",
    } as Record<UnitType, string>
  )[t];
}

function cellUnits(side: "friendly" | "enemy", sector: Sector): Unit[] {
  const dict = side === "friendly" ? state.units : state.enemyUnits;
  return Object.values(dict).filter(
    u => !u.routed && u.sector.rank === sector.rank && u.sector.file === sector.file
  );
}

function netMorale(u: Unit): number {
  return u.moraleMods.reduce((a, m) => a + m.pct, 0);
}

function moraleClass(pct: number): string {
  if (pct > 0) return "buff";
  if (pct < 0) return "penalty";
  return "";
}

function rulerHint(long: number, short: number): string {
  const parts: string[] = [];
  if (long > 0) parts.push(`${long}L`);
  if (short > 0) parts.push(`${short}S`);
  if (parts.length === 0) return "—";
  return parts.join(" + ");
}

function eligibleUnitSet(): Set<string> {
  const sel = state.selection.cardInstanceId;
  if (!sel) return new Set();
  const card = state.hand.find(c => c.instanceId === sel);
  if (!card) return new Set();
  return new Set(cardEligibleUnits(state, card));
}

function currentPendingForUnit(unitId: string, kind: "move" | "attack") {
  return state.pendingOrders.find(p => p.unitId === unitId && p.kind === kind && !p.done);
}

// ---------- Render ----------

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function renderTopBar(): string {
  const youSide = state.active === "union" ? "Union" : "CSA";
  return `
    <div class="topbar">
      <div>
        <div class="turn">Turn ${toRoman(state.turn)}</div>
        <div class="phase"><span class="your-turn-dot"></span>Your Turn · ${phaseLabel(state.phase)}</div>
      </div>
      <div class="player-col">
        <div class="player">Maj. Gen. Pope</div>
        <div class="side">${youSide} · Army of the Potomac</div>
      </div>
    </div>
  `;
}

function phaseLabel(p: GameState["phase"]): string {
  return { draw: "Draw", play: "Command Phase", move: "Movement", attack: "Combat", end: "End Phase" }[p];
}

function renderVictory(): string {
  const row = (count: number, goal: number, csa: boolean) => {
    const banners = [];
    for (let i = 0; i < goal; i++) {
      banners.push(`<span class="banner ${i < count ? "taken" + (csa ? " csa" : "") : ""}"></span>`);
    }
    return banners.join("");
  };
  return `
    <div class="victory">
      <div class="victory-side">
        <span class="victory-label">You routed</span>
        <span class="banner-row">${row(state.victory.union, state.victory.goal, false)}</span>
        <span>${state.victory.union} / ${state.victory.goal}</span>
      </div>
      <div class="victory-side">
        <span>${state.victory.csa} / ${state.victory.goal + 2}</span>
        <span class="banner-row">${row(state.victory.csa, state.victory.goal + 2, true)}</span>
        <span class="victory-label">CSA routed</span>
      </div>
    </div>
  `;
}

function renderPrompt(): string {
  const sel = state.selection.cardInstanceId;
  const card = sel ? state.hand.find(c => c.instanceId === sel) : null;
  const text = card
    ? `Selected <b>${esc(card.title)}</b> — tap a glowing unit to authorize.`
    : state.pendingOrders.some(p => !p.done && p.kind === "move")
    ? "Units await movement — tap their pending sector to place them."
    : state.pendingOrders.some(p => !p.done && p.kind === "attack")
    ? "Units may attack — tap Attack on a unit in range."
    : "Play a card to authorize unit actions this turn.";
  return `
    <div class="prompt">
      <div class="prompt-header">Your orders</div>
      <div class="prompt-text">${text}</div>
    </div>
  `;
}

function renderHand(): string {
  const eligible = eligibleUnitSet();
  const cards = state.hand
    .map(c => {
      const selected = state.selection.cardInstanceId === c.instanceId;
      const anyEligible = selected ? eligible.size > 0 : false;
      const icons = renderCardIcons(c);
      return `
        <div class="card ${selected ? "selected" : ""} ${selected && !anyEligible ? "no-targets" : ""}" data-card-id="${c.instanceId}">
          <div class="card-type">${esc(c.category.replace(/_/g, " "))}</div>
          <div class="card-title">${esc(c.title)}</div>
          <div class="card-authorization">${esc(c.body)}</div>
          <div class="card-icons">${icons}</div>
          <div class="card-footer">${esc(c.id.toUpperCase())}</div>
        </div>
      `;
    })
    .join("");
  return `
    <div class="hand">
      <div class="hand-header">
        <span class="section-title">Hand</span>
        <span class="section-meta">${state.hand.length} / ${state.handCap} · Deck ${state.deck.length} · Discard ${state.discard.length}</span>
      </div>
      <div class="card-scroll">${cards}</div>
    </div>
  `;
}

function renderCardIcons(c: Card): string {
  const a = c.authorization;
  const icon = (t: UnitType | "any", count: number) => {
    const letter = t === "any" ? "★" : unitTypeBadge(t as UnitType);
    const cls = t === "any" ? "any" : unitTypeClass(t as UnitType);
    return Array.from({ length: Math.min(count, 3) }, () => `<span class="unit-icon ${cls}">${letter}</span>`).join("");
  };
  if (a.kind === "move" || a.kind === "attack_only" || a.kind === "forced_march") {
    return Object.entries(a.units)
      .map(([t, n]) => icon(t as UnitType, Math.max(1, Number(n))))
      .join("");
  }
  if (a.kind === "resupply" || a.kind === "morale_buff" || a.kind === "entrench") return icon("any", a.count);
  if (a.kind === "morale_break") return `<span class="unit-icon" style="background:#8b2f2f">!</span>`;
  if (a.kind === "commander_move") return `<span class="unit-icon cmd">★</span>`;
  if (a.kind === "counter_battery") return icon("artillery", 1);
  return "";
}

function renderUnitRow(u: Unit, opts: { enemy?: boolean; glow?: boolean } = {}): string {
  const badge = unitTypeBadge(u.type);
  const cls = unitTypeClass(u.type);
  const strength = u.figuresMax > 0 ? (u.figures / u.figuresMax) * 100 : 0;
  const barCls = strength < 50 ? "danger" : strength < 80 ? "warn" : "";
  const pending = currentPendingForUnit(u.id, "move");
  const pendingAttack = currentPendingForUnit(u.id, "attack");
  const net = netMorale(u);
  const isCommander = u.type === "infantry_commander" || u.type === "cavalry_commander";
  const activated = u.activatedThisTurn || u.movedThisTurn || u.firedThisTurn;

  const sectorChip = u.pendingSector
    ? `<span class="sector-chip pending" data-action="pick-sector" data-unit="${u.id}">${esc(cap(u.pendingSector.rank))} · ${esc(cap(u.pendingSector.file))} — tap to place</span>`
    : pending
    ? `<span class="sector-chip pending" data-action="pick-sector" data-unit="${u.id}">Pick new sector ✦</span>`
    : `<span class="sector-chip" data-action="pick-sector" data-unit="${u.id}">${esc(cap(u.sector.rank))} · ${esc(cap(u.sector.file))}</span>`;

  const subRow = [
    `<span>${esc(unitTypeLabel(u.type))}</span>`,
    sectorChip,
    net !== 0 ? `<span class="morale-mod ${moraleClass(net)}">${net > 0 ? "+" : ""}${net}%</span>` : "",
    u.ammoMax > 0 && u.ammo === 0 ? `<span class="unit-tag dry">No ammo</span>` : "",
    u.inBuilding ? `<span class="unit-tag building">Building</span>` : "",
    activated ? `<span class="unit-tag activated">Activated</span>` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const attackBtn =
    pendingAttack && !opts.enemy
      ? `<button class="mini-btn danger" data-action="attack" data-unit="${u.id}">Attack ▸</button>`
      : "";

  const statsBlock = u.ammoMax > 0
    ? `<div class="strength-bar"><div class="strength-bar-fill ${barCls}" style="width:${strength}%"></div></div>
       <div>${u.figures}/${u.figuresMax}</div>`
    : `<div>${u.figures}/${u.figuresMax}</div>`;

  return `
    <div class="unit ${isCommander ? "commander" : ""} ${opts.glow ? "glow" : ""} ${u.routed ? "routed" : ""}" data-unit="${u.id}" data-action="detail">
      <div class="unit-badge ${cls} ${opts.enemy ? "enemy-side" : ""}">${badge}</div>
      <div class="unit-info">
        <div class="unit-name">${esc(u.name)}</div>
        <div class="unit-sub">${subRow}</div>
      </div>
      <div class="unit-stats">${statsBlock}${attackBtn}</div>
    </div>
  `;
}

function renderArmy(): string {
  const eligible = eligibleUnitSet();
  const rows = state.unitOrder
    .map(id => state.units[id])
    .map(u => renderUnitRow(u, { glow: eligible.has(u.id) }))
    .join("");
  return `
    <div class="section">
      <div class="section-header">
        <span class="section-title">Your Army</span>
        <span class="section-meta">${state.unitOrder.length} units</span>
      </div>
      ${rows}
    </div>
  `;
}

function renderEnemy(): string {
  const rows = state.enemyUnitOrder
    .map(id => state.enemyUnits[id])
    .map(u => renderUnitRow(u, { enemy: true }))
    .join("");
  const total = state.enemyUnitOrder.filter(id => !state.enemyUnits[id].routed).length;
  const figures = state.enemyUnitOrder.reduce((a, id) => a + state.enemyUnits[id].figures, 0);
  return `
    <details class="enemy-panel" ${modal.kind === "attack_target" ? "open" : ""}>
      <summary>
        <div>
          <div class="section-title">Enemy Dispositions</div>
          <div class="enemy-summary-stats">
            <span class="pair"><b>${total}</b> units</span>
            <span class="pair"><b>${figures}</b> figures</span>
          </div>
        </div>
        <span class="chev">▸</span>
      </summary>
      <div class="enemy-body">${rows}</div>
    </details>
  `;
}

function renderLog(): string {
  const recent = state.log.slice(-8).reverse();
  const rows = recent
    .map(e => {
      const dice = e.dice
        ? `<div class="log-dice">hit d10 [${e.dice.hit.join(",")}] ≤${e.dice.hitTarget} · leth d10 [${e.dice.lethality.join(",")}] ≤${e.dice.lethalityTarget}</div>`
        : "";
      return `<div class="log-entry"><span class="log-time">T${e.turn} ${e.phase.slice(0, 3)}</span><span>${e.text}${dice}</span></div>`;
    })
    .join("");
  return `<div class="log"><div class="log-label">Battle Log</div>${rows}</div>`;
}

function renderActions(): string {
  return `
    <div class="actions">
      <button class="action-btn" data-action="restart">↻ Restart</button>
      <button class="action-btn" data-action="deselect">Cancel</button>
      <button class="action-btn primary" data-action="end-turn">End Turn ▸</button>
    </div>
  `;
}

// ---------- Modals ----------

function renderModal(): string {
  if (modal.kind === "sector_picker") return renderSectorPicker(modal.unitId);
  if (modal.kind === "attack_target") return renderAttackTarget(modal.attackerId);
  if (modal.kind === "detail") return renderDetailDrawer(modal.unitId);
  if (modal.kind === "dice_result") return `<div class="scrim"><div class="dice-card">${modal.text}<button class="picker-btn primary" data-action="close-modal">OK</button></div></div>`;
  return "";
}

function renderSectorPicker(unitId: string): string {
  const u = state.units[unitId];
  if (!u) return "";
  const pending = u.pendingSector;
  const current = u.sector;

  let grid = `
    <div class="grid-wrap">
      <div></div>
      <div class="grid-col-header">Left</div>
      <div class="grid-col-header">Center</div>
      <div class="grid-col-header">Right</div>
  `;
  for (const rank of RANKS) {
    grid += `<div class="grid-row-header">${cap(rank)}</div>`;
    for (const file of FILES) {
      const friendlies = cellUnits("friendly", { rank, file });
      const enemies = cellUnits("enemy", { rank, file });
      const isCurrent = current.rank === rank && current.file === file;
      const isPending = pending && pending.rank === rank && pending.file === file;
      const hasEnemy = enemies.length > 0;
      const tokens = [
        ...friendlies.filter(f => f.id !== unitId).map(f => `<span class="token ${unitTypeClass(f.type)}">${unitTypeBadge(f.type)}</span>`),
        ...enemies.map(e => `<span class="token foe ${unitTypeClass(e.type) ? "foe-" + unitTypeClass(e.type) : ""}">${unitTypeBadge(e.type)}</span>`),
        isPending ? `<span class="token ${unitTypeClass(u.type)} moving">${unitTypeBadge(u.type)}</span>` : "",
      ].filter(Boolean).join("");
      grid += `
        <div class="grid-cell ${isCurrent ? "current" : ""} ${isPending ? "selected" : ""} ${hasEnemy ? "enemy-zone" : ""}"
             data-action="propose" data-unit="${unitId}" data-rank="${rank}" data-file="${file}">
          <div class="cell-tokens">${tokens}</div>
          <div class="cell-note">${enemies.length > 0 ? "enemy here" : friendlies.length > 0 ? `${friendlies.length} friendly` : "empty"}</div>
        </div>
      `;
    }
  }
  grid += `</div>`;

  const confirm = pending
    ? `<button class="picker-btn primary" data-action="confirm-sector" data-unit="${unitId}">✦ Confirm ${esc(cap(pending.rank))} · ${esc(cap(pending.file))}</button>`
    : `<button class="picker-btn primary" disabled>Tap a sector</button>`;

  return `
    <div class="scrim">
      <div class="picker">
        <div class="picker-header">
          <div class="eyebrow">Confirm New Sector</div>
          <div class="title">${esc(u.name)}</div>
          <div class="sub">${esc(unitTypeLabel(u.type))} · ${u.figures} fig · move ${rulerHint(u.moveAllowance.long, u.moveAllowance.short)}</div>
        </div>
        <div class="compass"><span class="arrow">▲</span> FACING ENEMY</div>
        ${grid}
        <div class="picker-footer">
          <div class="picker-actions">
            <button class="picker-btn ghost" data-action="close-modal">Cancel</button>
            ${confirm}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAttackTarget(attackerId: string): string {
  const attacker = state.units[attackerId];
  if (!attacker) return "";
  const targets = attackableTargets(state, attacker);
  const list = targets.length === 0
    ? `<div class="no-targets-msg">No enemies in range with line of sight.</div>`
    : targets
        .map(({ id, band }) => {
          const t = state.enemyUnits[id];
          const hitT = hitTarget(attacker, band, t.inCover, t.inBuilding);
          const lethT = lethalityTarget(t);
          return `
            <div class="target-row" data-action="fire" data-attacker="${attackerId}" data-target="${id}" data-band="${band}">
              <div class="unit-badge ${unitTypeClass(t.type)} enemy-side">${unitTypeBadge(t.type)}</div>
              <div class="target-info">
                <div class="target-name">${esc(t.name)}</div>
                <div class="target-sub">${esc(cap(t.sector.rank))} · ${esc(cap(t.sector.file))} · ${t.figures} fig · ${band}</div>
                <div class="target-odds">${attacker.figures} × d10 ≤ <b>${hitT}</b> to hit · each hit d10 ≤ <b>${lethT}</b> = kill</div>
              </div>
              <div class="target-go">FIRE ▸</div>
            </div>
          `;
        })
        .join("");

  return `
    <div class="scrim">
      <div class="picker">
        <div class="picker-header">
          <div class="eyebrow">Attack</div>
          <div class="title">${esc(attacker.name)}</div>
          <div class="sub">${esc(unitTypeLabel(attacker.type))} · ${attacker.figures} figures · ammo ${attacker.ammo}/${attacker.ammoMax}</div>
        </div>
        <div class="target-list">${list}</div>
        <div class="picker-footer">
          <div class="picker-actions">
            <button class="picker-btn ghost" data-action="close-modal">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderDetailDrawer(unitId: string): string {
  const u = unitById(state, unitId);
  if (!u) return "";
  const enemy = !!state.enemyUnits[unitId];
  const net = netMorale(u);
  const figureDots = Array.from({ length: u.figuresMax }, (_, i) =>
    i < u.figures ? `<span class="figure-dot"></span>` : `<span class="figure-dot dead"></span>`
  ).join("");
  const ammoDots = Array.from({ length: u.ammoMax }, (_, i) =>
    i < u.ammo ? `<span class="ammo-dot"></span>` : `<span class="ammo-dot spent"></span>`
  ).join("");
  const moraleRows = u.moraleMods.length > 0
    ? u.moraleMods.map(m => `<span class="pill ${m.pct < 0 ? "hot" : "good"}">${m.pct > 0 ? "+" : ""}${m.pct}% ${esc(m.label)}</span>`).join("")
    : `<span class="pill">No modifiers</span>`;

  const pending = state.pendingOrders.filter(p => p.unitId === unitId);
  const pendingRows = pending.length > 0
    ? pending.map(p => `<div class="order-item ${p.done ? "done" : ""}"><span class="step-num">${p.done ? "✓" : "•"}</span><span>${esc(p.note)}</span><span class="from-card">${esc(p.fromCard)}</span></div>`).join("")
    : `<div class="order-item ghost">No pending orders.</div>`;

  const eligible: string[] = [];
  if (!enemy) {
    for (const c of state.hand) {
      if (cardEligibleUnits(state, c).includes(unitId)) eligible.push(c.title);
    }
  }

  return `
    <div class="scrim">
      <div class="picker detail">
        <div class="picker-header">
          <div class="eyebrow">${enemy ? "Enemy" : "Friendly"} · Detail</div>
          <div class="title">${esc(u.name)}</div>
          <div class="sub">${esc(unitTypeLabel(u.type))} · ${esc(cap(u.sector.rank))} · ${esc(cap(u.sector.file))}</div>
        </div>

        <div class="drawer">
          <div class="drawer-section">
            <div class="drawer-label">Composition</div>
            <div class="drawer-row"><span class="k">Figures</span><span class="v"><span class="figures">${figureDots}</span> <b>${u.figures} of ${u.figuresMax}</b></span></div>
            ${u.ammoMax > 0 ? `<div class="drawer-row"><span class="k">Ammo</span><span class="v"><span class="ammo-dots">${ammoDots}</span> ${u.ammo === 0 ? `<b style="color:var(--danger)">Depleted</b>` : `${u.ammo}/${u.ammoMax}`}</span></div>` : ""}
            <div class="drawer-row"><span class="k">Move</span><span class="v"><span class="ruler-hint">${rulerHint(u.moveAllowance.long, u.moveAllowance.short)}</span></span></div>
            <div class="drawer-row"><span class="k">Range</span><span class="v"><span class="ruler-hint">${rulerHint(u.rangeOptimal.long, u.rangeOptimal.short)}</span> opt · <span class="ruler-hint">${rulerHint(u.rangeExtended.long, u.rangeExtended.short)}</span> ext</span></div>
          </div>

          <div class="drawer-section">
            <div class="drawer-label">Position</div>
            <div class="drawer-row"><span class="k">Sector</span><span class="v"><span class="sector-chip">${esc(cap(u.sector.rank))} · ${esc(cap(u.sector.file))}</span></span></div>
            <div class="drawer-row"><span class="k">Terrain</span><span class="v">${u.inBuilding ? `<span class="pill good">Building</span>` : u.inCover ? `<span class="pill good">Cover</span>` : `<span class="pill warn">Open</span>`}</span></div>
          </div>

          <div class="drawer-section">
            <div class="drawer-label">Morale · Net ${net > 0 ? "+" : ""}${net}%</div>
            <div class="pill-row">${moraleRows}</div>
          </div>

          <div class="drawer-section">
            <div class="drawer-label">This Turn</div>
            <div class="pill-row">
              <span class="pill ${u.movedThisTurn ? "warn" : ""}">${u.movedThisTurn ? "Moved" : "Not moved"}</span>
              <span class="pill ${u.firedThisTurn ? "warn" : ""}">${u.firedThisTurn ? "Fired" : "Not fired"}</span>
              <span class="pill ${u.activatedThisTurn ? "hot" : "good"}">${u.activatedThisTurn ? "Activated" : "Free"}</span>
            </div>
          </div>

          ${!enemy ? `
          <div class="drawer-section">
            <div class="drawer-label">Pending Orders</div>
            <div class="order-queue">${pendingRows}</div>
          </div>

          <div class="drawer-section">
            <div class="drawer-label">Cards in hand that can target</div>
            <div class="pill-row">
              ${eligible.length > 0 ? eligible.slice(0, 6).map(t => `<span class="pill gold">${esc(t)}</span>`).join("") : `<span class="pill">None currently</span>`}
            </div>
          </div>
          ` : ""}
        </div>

        <div class="picker-footer">
          <div class="picker-actions">
            <button class="picker-btn ghost" data-action="close-modal">Close</button>
            ${!enemy && currentPendingForUnit(unitId, "attack") ? `<button class="picker-btn primary" data-action="attack" data-unit="${unitId}">Attack ▸</button>` : ""}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ---------- Event wiring ----------

function bindEvents(root: HTMLElement) {
  root.addEventListener("click", e => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-action], [data-card-id]");
    if (!el) return;
    if (el.hasAttribute("data-card-id")) {
      const id = el.getAttribute("data-card-id")!;
      onCardClick(id);
      e.stopPropagation();
      return;
    }
    const action = el.getAttribute("data-action")!;
    const unitId = el.getAttribute("data-unit") ?? undefined;

    if (action === "detail") {
      // Only open detail if not in card-select mode.
      if (state.selection.cardInstanceId) {
        onUnitSelect(unitId!);
      } else {
        setModal({ kind: "detail", unitId: unitId! });
      }
      e.stopPropagation();
      return;
    }
    if (action === "pick-sector") {
      e.stopPropagation();
      setModal({ kind: "sector_picker", unitId: unitId! });
      return;
    }
    if (action === "propose") {
      const rank = el.getAttribute("data-rank") as Rank;
      const file = el.getAttribute("data-file") as File;
      dispatch({ type: "propose_sector", unitId: unitId!, sector: { rank, file } });
      return;
    }
    if (action === "confirm-sector") {
      dispatch({ type: "confirm_sector", unitId: unitId! });
      setModal({ kind: "none" });
      return;
    }
    if (action === "close-modal") {
      setModal({ kind: "none" });
      return;
    }
    if (action === "attack") {
      setModal({ kind: "attack_target", attackerId: unitId! });
      e.stopPropagation();
      return;
    }
    if (action === "fire") {
      const attackerId = el.getAttribute("data-attacker")!;
      const targetId = el.getAttribute("data-target")!;
      const band = el.getAttribute("data-band") as RangeBand;
      dispatch({ type: "attack", attackerId, targetId, rangeBand: band });
      setModal({ kind: "none" });
      return;
    }
    if (action === "deselect") {
      dispatch({ type: "deselect_card" });
      setModal({ kind: "none" });
      return;
    }
    if (action === "end-turn") {
      dispatch({ type: "end_turn" });
      return;
    }
    if (action === "restart") {
      state = seedInitialState(Math.floor(Math.random() * 1e9));
      setModal({ kind: "none" });
      return;
    }
  });
}

function onCardClick(instanceId: string) {
  if (state.selection.cardInstanceId === instanceId) {
    dispatch({ type: "deselect_card" });
  } else {
    dispatch({ type: "select_card", instanceId });
  }
}

function onUnitSelect(unitId: string) {
  const sel = state.selection.cardInstanceId;
  if (!sel) return;
  const card = state.hand.find(c => c.instanceId === sel);
  if (!card) return;
  const eligible = cardEligibleUnits(state, card);
  if (!eligible.includes(unitId)) return;

  // For v1, a single tap authorizes this unit. Multi-target cards authorize the
  // first tapped unit and keep the card selected for the next tap.
  const a = card.authorization;
  const allowedCount = (() => {
    if (a.kind === "move" || a.kind === "attack_only" || a.kind === "forced_march") {
      return Object.values(a.units).reduce((s, n) => s + (n ?? 0), 0);
    }
    if (a.kind === "resupply" || a.kind === "morale_buff" || a.kind === "morale_break" || a.kind === "entrench" || a.kind === "commander_move" || a.kind === "counter_battery") {
      return a.count;
    }
    return 1;
  })();

  // Track accumulated targets in window scratch (simple for v1).
  accumulated.push(unitId);
  if (accumulated.length >= allowedCount) {
    dispatch({ type: "play_card", instanceId: sel, targetUnitIds: [...accumulated] });
    accumulated = [];
  } else {
    rerender();
  }
}

let accumulated: string[] = [];

// ---------- Utilities ----------

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function toRoman(n: number): string {
  const map: [number, string][] = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  for (const [v, r] of map) while (n >= v) { out += r; n -= v; }
  return out || "I";
}

// ---------- Mount ----------

function rerender() {
  const root = document.getElementById("rts-root");
  if (!root) return;
  root.innerHTML = `
    <div class="phone">
      ${renderTopBar()}
      ${renderVictory()}
      ${renderPrompt()}
      ${renderHand()}
      ${renderArmy()}
      ${renderEnemy()}
      ${renderLog()}
      ${renderActions()}
    </div>
    ${renderModal()}
  `;
}

export function mount() {
  const root = document.getElementById("rts-root");
  if (!root) return;
  subscribers.push(rerender);
  bindEvents(document.body);
  rerender();
}
