// ═══════════════════════════════════════════════════
// Data Dash — SFX Definitions
// ═══════════════════════════════════════════════════
// SFX are handled by the AudioEngine.playSFX() method
// This file documents the available SFX names.

export const SFX_NAMES = [
  'jump',
  'shoot',
  'collect',
  'hit',
  'death',
  'powerup',
  'powerdown',
  'boss',
  'victory',
  'checkpoint',
] as const;

export type SFXName = typeof SFX_NAMES[number];
