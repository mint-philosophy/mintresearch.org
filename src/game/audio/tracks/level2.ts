import type { TrackData } from '../../systems/AudioEngine';

// Level 2 — Slightly Busier
// BPM 115, G major (G A B C D E F#), 4-bar loop
// More rhythmic than L1, busier eighth-note patterns
export const level2Track: TrackData = {
  bpm: 115,
  loop: true,
  notes: [
    // Lead — square wave, busier rhythm
    // 4 bars of 4/4 = 16 beats total
    [
      // bar 1
      { freq: 784, duration: 0.5 },   // G4
      { freq: 880, duration: 0.5 },   // A4
      { freq: 988, duration: 0.5 },   // B4
      { freq: 880, duration: 0.5 },   // A4
      { freq: 784, duration: 0.5 },   // G4
      { freq: 659, duration: 0.5 },   // E4
      { freq: 740, duration: 1 },     // F#4
      // bar 2
      { freq: 587, duration: 0.5 },   // D4
      { freq: 659, duration: 0.5 },   // E4
      { freq: 784, duration: 0.5 },   // G4
      { freq: 0, duration: 0.5, volume: 0 }, // rest
      { freq: 880, duration: 0.5 },   // A4
      { freq: 988, duration: 0.5 },   // B4
      { freq: 1047, duration: 1 },    // C5
      // bar 3
      { freq: 988, duration: 0.5 },   // B4
      { freq: 1047, duration: 0.5 },  // C5
      { freq: 1175, duration: 0.5 },  // D5
      { freq: 1047, duration: 0.5 },  // C5
      { freq: 988, duration: 0.5 },   // B4
      { freq: 880, duration: 0.5 },   // A4
      { freq: 784, duration: 0.5 },   // G4
      { freq: 740, duration: 0.5 },   // F#4
      // bar 4
      { freq: 784, duration: 1 },     // G4
      { freq: 659, duration: 0.5 },   // E4
      { freq: 587, duration: 0.5 },   // D4
      { freq: 784, duration: 1 },     // G4
      { freq: 0, duration: 1, volume: 0 }, // rest
    ],
    // Bass — triangle wave
    // 16 beats total
    [
      { freq: 196, duration: 2, type: 'triangle', volume: 0.3 },  // G3
      { freq: 196, duration: 2, type: 'triangle', volume: 0.3 },  // G3
      { freq: 147, duration: 2, type: 'triangle', volume: 0.3 },  // D3
      { freq: 131, duration: 2, type: 'triangle', volume: 0.3 },  // C3
      { freq: 165, duration: 2, type: 'triangle', volume: 0.3 },  // E3
      { freq: 147, duration: 2, type: 'triangle', volume: 0.3 },  // D3
      { freq: 196, duration: 2, type: 'triangle', volume: 0.3 },  // G3
      { freq: 196, duration: 2, type: 'triangle', volume: 0.3 },  // G3
    ],
  ],
};
