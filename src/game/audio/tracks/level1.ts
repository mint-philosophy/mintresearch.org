import type { TrackData } from '../../systems/AudioEngine';

// Level 1 — Bright Simple
// BPM 110, C major (C D E F G A B), 4-bar loop
// Bright, cheerful, simple melody
export const level1Track: TrackData = {
  bpm: 110,
  loop: true,
  notes: [
    // Lead — square wave, bright and bouncy
    // 4 bars of 4/4 = 16 beats total
    [
      // bar 1
      { freq: 523, duration: 0.5 },   // C4
      { freq: 659, duration: 0.5 },   // E4
      { freq: 784, duration: 1 },     // G4
      { freq: 880, duration: 0.5 },   // A4
      { freq: 784, duration: 0.5 },   // G4
      { freq: 659, duration: 1 },     // E4
      // bar 2
      { freq: 587, duration: 0.5 },   // D4
      { freq: 659, duration: 0.5 },   // E4
      { freq: 523, duration: 1 },     // C4
      { freq: 587, duration: 0.5 },   // D4
      { freq: 523, duration: 0.5 },   // C4
      { freq: 698, duration: 1 },     // F4
      // bar 3
      { freq: 659, duration: 0.5 },   // E4
      { freq: 784, duration: 0.5 },   // G4
      { freq: 880, duration: 1 },     // A4
      { freq: 988, duration: 0.5 },   // B4
      { freq: 1047, duration: 0.5 },  // C5
      { freq: 988, duration: 0.5 },   // B4
      { freq: 880, duration: 0.5 },   // A4
      // bar 4
      { freq: 784, duration: 1 },     // G4
      { freq: 659, duration: 0.5 },   // E4
      { freq: 587, duration: 0.5 },   // D4
      { freq: 523, duration: 1 },     // C4
      { freq: 0, duration: 1, volume: 0 }, // rest
    ],
    // Bass — triangle wave
    // 16 beats total
    [
      { freq: 131, duration: 2, type: 'triangle', volume: 0.3 },  // C3
      { freq: 131, duration: 2, type: 'triangle', volume: 0.3 },  // C3
      { freq: 147, duration: 2, type: 'triangle', volume: 0.3 },  // D3
      { freq: 175, duration: 2, type: 'triangle', volume: 0.3 },  // F3
      { freq: 165, duration: 2, type: 'triangle', volume: 0.3 },  // E3
      { freq: 220, duration: 2, type: 'triangle', volume: 0.3 },  // A3
      { freq: 196, duration: 2, type: 'triangle', volume: 0.3 },  // G3
      { freq: 131, duration: 2, type: 'triangle', volume: 0.3 },  // C3
    ],
  ],
};
