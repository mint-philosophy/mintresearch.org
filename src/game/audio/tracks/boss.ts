import type { TrackData } from '../../systems/AudioEngine';

// Boss — Urgent Ostinato
// BPM 150, A minor (A B C D E F G), 4-bar loop
// Driving, relentless ostinato pattern
export const bossTrack: TrackData = {
  bpm: 150,
  loop: true,
  notes: [
    // Lead — square wave, relentless driving ostinato
    // 4 bars of 4/4 = 16 beats total
    [
      // bar 1 — driving ostinato
      { freq: 880, duration: 0.5 },   // A4
      { freq: 880, duration: 0.5 },   // A4
      { freq: 1047, duration: 0.5 },  // C5
      { freq: 880, duration: 0.5 },   // A4
      { freq: 1175, duration: 0.5 },  // D5
      { freq: 1047, duration: 0.5 },  // C5
      { freq: 880, duration: 0.5 },   // A4
      { freq: 784, duration: 0.5 },   // G4
      // bar 2 — variation
      { freq: 880, duration: 0.5 },   // A4
      { freq: 1047, duration: 0.5 },  // C5
      { freq: 1175, duration: 0.5 },  // D5
      { freq: 1319, duration: 0.5 },  // E5
      { freq: 1175, duration: 0.5 },  // D5
      { freq: 1047, duration: 0.5 },  // C5
      { freq: 988, duration: 0.5 },   // B4
      { freq: 880, duration: 0.5 },   // A4
      // bar 3 — higher tension
      { freq: 1047, duration: 0.5 },  // C5
      { freq: 1175, duration: 0.5 },  // D5
      { freq: 1319, duration: 0.5 },  // E5
      { freq: 1397, duration: 0.5 },  // F5
      { freq: 1319, duration: 0.5 },  // E5
      { freq: 1175, duration: 0.5 },  // D5
      { freq: 1047, duration: 0.5 },  // C5
      { freq: 0, duration: 0.5, volume: 0 }, // rest
      // bar 4 — resolution to repeat
      { freq: 880, duration: 0.5 },   // A4
      { freq: 0, duration: 0.5, volume: 0 }, // rest
      { freq: 784, duration: 0.5 },   // G4
      { freq: 880, duration: 0.5 },   // A4
      { freq: 1047, duration: 0.5 },  // C5
      { freq: 880, duration: 0.5 },   // A4
      { freq: 784, duration: 0.5 },   // G4
      { freq: 659, duration: 0.5 },   // E4
    ],
    // Bass — triangle wave, pounding eighth notes
    // 16 beats total
    [
      { freq: 220, duration: 1, type: 'triangle', volume: 0.35 }, // A3
      { freq: 220, duration: 1, type: 'triangle', volume: 0.25 }, // A3
      { freq: 220, duration: 1, type: 'triangle', volume: 0.35 }, // A3
      { freq: 196, duration: 1, type: 'triangle', volume: 0.25 }, // G3
      { freq: 220, duration: 1, type: 'triangle', volume: 0.35 }, // A3
      { freq: 131, duration: 1, type: 'triangle', volume: 0.25 }, // C3
      { freq: 147, duration: 1, type: 'triangle', volume: 0.35 }, // D3
      { freq: 165, duration: 1, type: 'triangle', volume: 0.25 }, // E3
      { freq: 131, duration: 1, type: 'triangle', volume: 0.35 }, // C3
      { freq: 147, duration: 1, type: 'triangle', volume: 0.25 }, // D3
      { freq: 165, duration: 1, type: 'triangle', volume: 0.35 }, // E3
      { freq: 175, duration: 1, type: 'triangle', volume: 0.25 }, // F3
      { freq: 220, duration: 1, type: 'triangle', volume: 0.35 }, // A3
      { freq: 196, duration: 1, type: 'triangle', volume: 0.25 }, // G3
      { freq: 220, duration: 1, type: 'triangle', volume: 0.35 }, // A3
      { freq: 220, duration: 1, type: 'triangle', volume: 0.25 }, // A3
    ],
  ],
};
