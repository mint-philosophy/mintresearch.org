// RTS — American Civil War tabletop wargame helper
// Core types shared by engine, UI, and (later) server.

export type Side = "union" | "csa";

export type UnitType =
  | "infantry"
  | "cavalry"
  | "skirmisher"
  | "artillery"
  | "wagon"
  | "infantry_commander"
  | "cavalry_commander";

export type Rank = "vanguard" | "center" | "reserve";
export type File = "left" | "center" | "right";

export interface Sector {
  rank: Rank;
  file: File;
}

export type RangeBand = "optimal" | "extended" | "melee";

export interface Unit {
  id: string;
  side: Side;
  type: UnitType;
  name: string;
  figures: number;
  figuresMax: number;
  ammo: number;
  ammoMax: number;
  sector: Sector;
  pendingSector: Sector | null;
  moveAllowance: { long: number; short: number };
  rangeOptimal: { long: number; short: number };
  rangeExtended: { long: number; short: number };
  attachedTo: string | null;
  commanderInRange: boolean;
  inBuilding: boolean;
  inCover: boolean;
  activatedThisTurn: boolean;
  movedThisTurn: boolean;
  firedThisTurn: boolean;
  routed: boolean;
  moraleMods: MoraleMod[];
}

export interface MoraleMod {
  label: string;
  pct: number;
  source: "commander_oor" | "casualties" | "rally" | "break" | "cover" | "command_strain" | "flanked" | "other";
}

export interface Card {
  id: string;
  instanceId: string;
  title: string;
  category: CardCategory;
  body: string;
  authorization: Authorization;
}

export type CardCategory =
  | "movement"
  | "combined_arms"
  | "sector_order"
  | "attack_only"
  | "resupply"
  | "morale_buff"
  | "morale_break"
  | "commander"
  | "forced_march"
  | "entrench"
  | "feigned_retreat"
  | "counter_battery"
  | "draw"
  | "spy";

export type Authorization =
  | { kind: "move"; units: Partial<Record<UnitType, number>>; post?: "attack" | null }
  | { kind: "move_sector"; sector: Sector; post?: "attack" | null }
  | { kind: "attack_only"; units: Partial<Record<UnitType, number>>; mod?: number }
  | { kind: "resupply"; count: number }
  | { kind: "morale_buff"; count: number; pct: number }
  | { kind: "morale_break"; count: number; pct: number }
  | { kind: "draw"; count: number }
  | { kind: "commander_move"; count: number; extraMove?: number }
  | { kind: "forced_march"; units: Partial<Record<UnitType, number>>; extraMove: number }
  | { kind: "entrench"; count: number }
  | { kind: "feigned_retreat"; count: number }
  | { kind: "counter_battery"; count: number }
  | { kind: "spy" }
  | { kind: "composite"; steps: Authorization[] };

export type TurnPhase = "draw" | "play" | "move" | "attack" | "end";

export interface PendingOrder {
  unitId: string;
  kind: "move" | "attack" | "resupply" | "entrench" | "morale_buff" | "morale_break";
  fromCard: string;
  note: string;
  done: boolean;
}

export interface LogEntry {
  turn: number;
  phase: TurnPhase;
  text: string;
  dice?: {
    hit: number[];
    hitTarget: number;
    lethality: number[];
    lethalityTarget: number;
  };
}

export interface GameState {
  turn: number;
  phase: TurnPhase;
  active: Side;
  handStart: number;
  hand: Card[];
  deck: Card[];
  discard: Card[];
  units: Record<string, Unit>;
  unitOrder: string[];
  enemyUnits: Record<string, Unit>;
  enemyUnitOrder: string[];
  enemyHand: Card[];
  victory: { union: number; csa: number; goal: number };
  log: LogEntry[];
  selection: {
    cardInstanceId: string | null;
    unitId: string | null;
  };
  pendingOrders: PendingOrder[];
  rngSeed: number;
  defeated: Side | null;
  enemyHandReveal: { title: string; category: CardCategory }[] | null;
  pendingDiscardOnRout: boolean;
}

export type Action =
  | { type: "select_card"; instanceId: string }
  | { type: "deselect_card" }
  | { type: "play_card"; instanceId: string; targetUnitIds: string[] }
  | { type: "select_unit"; unitId: string }
  | { type: "propose_sector"; unitId: string; sector: Sector }
  | { type: "confirm_sector"; unitId: string }
  | { type: "cancel_sector"; unitId: string }
  | { type: "attack"; attackerId: string; targetId: string; rangeBand: RangeBand }
  | { type: "discard_for_rout"; instanceId: string }
  | { type: "dismiss_spy_reveal" }
  | { type: "end_turn" };
