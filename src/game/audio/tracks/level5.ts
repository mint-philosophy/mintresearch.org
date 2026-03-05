import type { TrackData } from '../../systems/AudioEngine';

// Level 5 — Tense Sparse
// BPM 130, E minor (E F# G A B C D), 4-bar loop
// Tense, sparse lead with rests
export const level5Track: TrackData = {
  bpm: 130,
  loop: true,
  notes: [
    // Lead — square wave, sparse and tense
    // 4 bars of 4/4 = 16 beats total
    [
      // bar 1 — sparse, ominous
      { freq: 659, duration: 1 },     // E4
      { freq: 0, duration: 0.5, volume: 0 }, // rest
      { freq: 784, duration: 0.5 },   // G4
      { freq: 0, duration: 1, volume: 0 }, // rest
      { freq: 740, duration: 0.5 },   // F#4
      { freq: 659, duration: 0.5 },   // E4
      // bar 2
      { freq: 0, duration: 1, volume: 0 }, // rest
      { freq: 880, duration: 0.5 },   // A4
      { freq: 988, duration: 0.5 },   // B4
      { freq: 880, duration: 1 },     // A4
      { freq: 0, duration: 1, volume: 0 }, // rest
      // bar 3
      { freq: 1047, duration: 0.5 },  // C5
      { freq: 988, duration: 0.5 },   // B4
      { freq: 0, duration: 1, volume: 0 }, // rest
      { freq: 880, duration: 0.5 },   // A4
      { freq: 784, duration: 0.5 },   // G4
      { freq: 0, duration: 0.5, volume: 0 }, // rest
      { freq: 740, duration: 0.5 },   // F#4
      // bar 4
      { freq: 659, duration: 1 },     // E4
      { freq: 0, duration: 1, volume: 0 }, // rest
      { freq: 587, duration: 0.5 },   // D4
      { freq: 659, duration: 1 },     // E4
      { freq: 0, duration: 0.5, volume: 0 }, // rest
    ],
    // Bass — triangle wave, steady pulse against sparse lead
    // 16 beats total
    [
      { freq: 165, duration: 1, type: 'triangle', volume: 0.3 },  // E3
      { freq: 165, duration: 1, type: 'triangle', volume: 0.3 },  // E3
      { freq: 196, duration: 1, type: 'triangle', volume: 0.3 },  // G3
      { freq: 165, duration: 1, type: 'triangle', volume: 0.3 },  // E3
      { freq: 220, duration: 1, type: 'triangle', volume: 0.3 },  // A3
      { freq: 247, duration: 1, type: 'triangle', volume: 0.3 },  // B3
      { freq: 220, duration: 1, type: 'triangle', volume: 0.3 },  // A3
      { freq: 165, duration: 1, type: 'triangle', volume: 0.3 },  // E3
      { freq: 131, duration: 1, type: 'triangle', volume: 0.3 },  // C3
      { freq: 247, duration: 1, type: 'triangle', volume: 0.3 },  // B3
      { freq: 220, duration: 1, type: 'triangle', volume: 0.3 },  // A3
      { freq: 196, duration: 1, type: 'triangle', volume: 0.3 },  // G3
      { freq: 165, duration: 2, type: 'triangle', volume: 0.3 },  // E3
      { freq: 165, duration: 2, type: 'triangle', volume: 0.3 },  // E3
    ],
  ],
};
