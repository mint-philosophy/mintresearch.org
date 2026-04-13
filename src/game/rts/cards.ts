// Representative card catalog — subset of rts-cards.yaml for prototype.
// Real catalog (~250 copies) lives in that yaml; this slice is enough to exercise UI.

import type { Card, Authorization } from "./types";

let counter = 0;
function makeInstances(id: string, title: string, category: Card["category"], body: string, auth: Authorization, copies: number): Card[] {
  const out: Card[] = [];
  for (let i = 0; i < copies; i++) {
    out.push({
      id,
      instanceId: `${id}_${++counter}`,
      title,
      category,
      body,
      authorization: auth,
    });
  }
  return out;
}

export const CARD_CATALOG: Card[] = [
  // Movement — core flow
  ...makeInstances(
    "inf_move_3",
    "Press the Line",
    "movement",
    "Move up to 3 Infantry. Each may attack after moving.",
    { kind: "move", units: { infantry: 3 }, post: "attack" },
    6
  ),
  ...makeInstances(
    "inf_move_2",
    "Advance",
    "movement",
    "Move up to 2 Infantry. Each may attack after moving.",
    { kind: "move", units: { infantry: 2 }, post: "attack" },
    6
  ),
  ...makeInstances(
    "cav_move_2",
    "Cavalry Sweep",
    "movement",
    "Move up to 2 Cavalry. May charge into melee.",
    { kind: "move", units: { cavalry: 2 }, post: "attack" },
    4
  ),
  ...makeInstances(
    "skr_move_2",
    "Skirmish Forward",
    "movement",
    "Move up to 2 Skirmishers. Each may attack after moving.",
    { kind: "move", units: { skirmisher: 2 }, post: "attack" },
    4
  ),
  ...makeInstances(
    "art_move_1",
    "Limber Up",
    "movement",
    "Move 1 Artillery piece. May not fire this turn.",
    { kind: "move", units: { artillery: 1 }, post: null },
    3
  ),

  // Combined arms
  ...makeInstances(
    "combined_cav_skr",
    "Screen & Sweep",
    "combined_arms",
    "Move 2 Cavalry + 1 Skirmisher. Each may attack after moving.",
    { kind: "move", units: { cavalry: 2, skirmisher: 1 }, post: "attack" },
    3
  ),
  ...makeInstances(
    "combined_inf_art",
    "Line with Guns",
    "combined_arms",
    "Move 2 Infantry + 1 Artillery. Each may attack after moving.",
    { kind: "move", units: { infantry: 2, artillery: 1 }, post: "attack" },
    3
  ),

  // Attack-only
  ...makeInstances(
    "fire_all_art",
    "Forward the Guns",
    "attack_only",
    "All Artillery may fire without moving.",
    { kind: "attack_only", units: { artillery: 9 } },
    3
  ),
  ...makeInstances(
    "volley_fire",
    "Volley Fire",
    "attack_only",
    "Up to 2 Infantry may fire without moving.",
    { kind: "attack_only", units: { infantry: 2 } },
    4
  ),

  // Resupply
  ...makeInstances(
    "resupply_1",
    "Quartermaster's Wagons",
    "resupply",
    "Restore ammo to 1 unit.",
    { kind: "resupply", count: 1 },
    3
  ),

  // Morale
  ...makeInstances(
    "rally_15",
    "Rally the Colors",
    "morale_buff",
    "Grant +15% lethality defense to 1 unit.",
    { kind: "morale_buff", count: 1, pct: 15 },
    3
  ),
  ...makeInstances(
    "break_10",
    "Scatter the Flanks",
    "morale_break",
    "Inflict −10% morale on 1 enemy unit.",
    { kind: "morale_break", count: 1, pct: 10 },
    3
  ),

  // Commander
  ...makeInstances(
    "cmdr_reposition",
    "Ride to the Sound of the Guns",
    "commander",
    "Reposition 1 commander with +1S move.",
    { kind: "commander_move", count: 1, extraMove: 1 },
    3
  ),

  // Entrench
  ...makeInstances(
    "entrench_1",
    "Dig In",
    "entrench",
    "1 unit goes into cover.",
    { kind: "entrench", count: 1 },
    3
  ),

  // Forced march
  ...makeInstances(
    "forced_march_inf_2",
    "Forced March",
    "forced_march",
    "2 Infantry move with +1S. No attack after.",
    { kind: "forced_march", units: { infantry: 2 }, extraMove: 1 },
    2
  ),

  // Counter-battery
  ...makeInstances(
    "counter_battery_1",
    "Counter-Battery",
    "counter_battery",
    "1 Artillery fires at enemy artillery. +1 hit threshold.",
    { kind: "counter_battery", count: 1 },
    2
  ),

  // Dispatch — rebuild command capacity.
  ...makeInstances(
    "dispatch_2",
    "Dispatch Rider",
    "draw",
    "A courier cuts through the smoke. Draw 2 cards.",
    { kind: "draw", count: 2 },
    2
  ),
  ...makeInstances(
    "dispatch_1",
    "Courier",
    "draw",
    "A runner arrives with orders. Draw 1 card.",
    { kind: "draw", count: 1 },
    3
  ),

  // Spy — reveal enemy hand.
  ...makeInstances(
    "spy_reveal",
    "Partisan Intelligence",
    "spy",
    "A local sympathizer shows you every card in the enemy's hand.",
    { kind: "spy" },
    2
  ),
];
