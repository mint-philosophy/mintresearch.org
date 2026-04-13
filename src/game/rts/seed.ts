// Starting state for the prototype — one Union army, a CSA opposing force,
// and a shuffled 10-card hand drawn from the catalog.

import type { GameState, Unit } from "./types";
import { CARD_CATALOG } from "./cards";
import { makeRng } from "./engine";

function u(partial: Partial<Unit> & Pick<Unit, "id" | "side" | "type" | "name" | "figures" | "figuresMax" | "sector">): Unit {
  return {
    ammo: 3,
    ammoMax: 3,
    pendingSector: null,
    moveAllowance: { long: 0, short: 1 },
    rangeOptimal: { long: 0, short: 1 },
    rangeExtended: { long: 1, short: 0 },
    attachedTo: null,
    commanderInRange: true,
    inBuilding: false,
    inCover: false,
    activatedThisTurn: false,
    movedThisTurn: false,
    firedThisTurn: false,
    routed: false,
    moraleMods: [],
    ...partial,
  };
}

export function seedInitialState(seed: number = 20260412): GameState {
  const rng = makeRng(seed);

  // Shuffle the catalog for the player; build a separate shuffle for the enemy hand.
  const shuffled = [...CARD_CATALOG];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const hand = shuffled.slice(0, 10);
  const deck = shuffled.slice(10, shuffled.length - 10);
  const enemyHand = shuffled.slice(shuffled.length - 10);

  const friendlies: Unit[] = [
    u({
      id: "u_1ma",
      side: "union",
      type: "infantry",
      name: "1st Massachusetts",
      figures: 22,
      figuresMax: 24,
      sector: { rank: "vanguard", file: "left" },
      attachedTo: "u_reynolds",
      commanderInRange: true,
      rangeOptimal: { long: 1, short: 0 },
    }),
    u({
      id: "u_2ma",
      side: "union",
      type: "infantry",
      name: "2nd Massachusetts",
      figures: 14,
      figuresMax: 24,
      sector: { rank: "vanguard", file: "center" },
      ammo: 0,
      attachedTo: "u_reynolds",
      commanderInRange: false,
      rangeOptimal: { long: 1, short: 0 },
      moraleMods: [{ label: "Commander out of range", pct: -10, source: "commander_oor" }],
    }),
    u({
      id: "u_reynolds",
      side: "union",
      type: "infantry_commander",
      name: "Col. Reynolds",
      figures: 3,
      figuresMax: 3,
      sector: { rank: "vanguard", file: "left" },
      ammo: 0,
      ammoMax: 0,
      moveAllowance: { long: 0, short: 2 },
    }),
    u({
      id: "u_5pa",
      side: "union",
      type: "cavalry",
      name: "5th Pennsylvania",
      figures: 7,
      figuresMax: 7,
      sector: { rank: "reserve", file: "center" },
      moveAllowance: { long: 1, short: 1 },
      rangeOptimal: { long: 1, short: 0 },
      attachedTo: "u_stoneman",
      commanderInRange: true,
    }),
    u({
      id: "u_stoneman",
      side: "union",
      type: "cavalry_commander",
      name: "Col. Stoneman",
      figures: 3,
      figuresMax: 3,
      sector: { rank: "reserve", file: "center" },
      ammo: 0,
      ammoMax: 0,
      moveAllowance: { long: 1, short: 1 },
    }),
    u({
      id: "u_sharps",
      side: "union",
      type: "skirmisher",
      name: "1st U.S. Sharpshooters",
      figures: 13,
      figuresMax: 16,
      sector: { rank: "vanguard", file: "right" },
      ammo: 5,
      ammoMax: 6,
      rangeOptimal: { long: 1, short: 0 },
      rangeExtended: { long: 2, short: 0 },
    }),
    u({
      id: "u_batb",
      side: "union",
      type: "artillery",
      name: "Battery B, 4th U.S.",
      figures: 4,
      figuresMax: 5,
      sector: { rank: "center", file: "center" },
      ammo: 2,
      ammoMax: 3,
      inBuilding: true,
      rangeOptimal: { long: 1, short: 0 },
      rangeExtended: { long: 2, short: 0 },
    }),
    u({
      id: "u_supply",
      side: "union",
      type: "wagon",
      name: "Supply Train A",
      figures: 3,
      figuresMax: 3,
      sector: { rank: "reserve", file: "center" },
      ammo: 0,
      ammoMax: 0,
      moveAllowance: { long: 0, short: 1 },
    }),
  ];

  const enemies: Unit[] = [
    u({
      id: "e_15al",
      side: "csa",
      type: "infantry",
      name: "15th Alabama",
      figures: 20,
      figuresMax: 24,
      sector: { rank: "vanguard", file: "center" },
      rangeOptimal: { long: 1, short: 0 },
    }),
    u({
      id: "e_1va",
      side: "csa",
      type: "cavalry",
      name: "1st Virginia Cavalry",
      figures: 5,
      figuresMax: 7,
      sector: { rank: "center", file: "left" },
      moveAllowance: { long: 1, short: 1 },
      rangeOptimal: { long: 1, short: 0 },
      moraleMods: [{ label: "Recent casualties", pct: -20, source: "casualties" }],
    }),
    u({
      id: "e_hampton",
      side: "csa",
      type: "skirmisher",
      name: "Hampton's Legion",
      figures: 12,
      figuresMax: 14,
      sector: { rank: "vanguard", file: "right" },
      rangeOptimal: { long: 1, short: 0 },
      rangeExtended: { long: 2, short: 0 },
    }),
    u({
      id: "e_wb",
      side: "csa",
      type: "artillery",
      name: "Washington Battery",
      figures: 4,
      figuresMax: 5,
      sector: { rank: "reserve", file: "left" },
      rangeOptimal: { long: 1, short: 0 },
      rangeExtended: { long: 2, short: 0 },
    }),
    u({
      id: "e_19ga",
      side: "csa",
      type: "infantry",
      name: "19th Georgia",
      figures: 18,
      figuresMax: 24,
      sector: { rank: "center", file: "right" },
      rangeOptimal: { long: 1, short: 0 },
    }),
  ];

  const unitsDict: Record<string, Unit> = {};
  for (const x of friendlies) unitsDict[x.id] = x;
  const enemiesDict: Record<string, Unit> = {};
  for (const x of enemies) enemiesDict[x.id] = x;

  return {
    turn: 1,
    phase: "play",
    active: "union",
    handStart: 10,
    hand,
    deck,
    discard: [],
    units: unitsDict,
    unitOrder: friendlies.map(x => x.id),
    enemyUnits: enemiesDict,
    enemyUnitOrder: enemies.map(x => x.id),
    enemyHand,
    victory: { union: 0, csa: 0, goal: 6 },
    log: [{ turn: 1, phase: "play", text: "Engagement begins. Army of the Potomac deploys on the ridge." }],
    selection: { cardInstanceId: null, unitId: null },
    pendingOrders: [],
    rngSeed: seed,
    defeated: null,
    enemyHandReveal: null,
    pendingDiscardOnRout: false,
  };
}
