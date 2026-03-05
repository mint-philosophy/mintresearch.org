import type { TrackData } from '../../systems/AudioEngine';

// Level 4 — Minor Mood Shift
// BPM 125, A minor pentatonic (A C D E G), 4-bar loop
// Mood shift to minor, slightly tense
export const level4Track: TrackData = {
  bpm: 125,
  loop: true,
  notes: [
    // Lead — square wave, minor and tense
    // 4 bars of 4/4 = 16 beats total
    [
      // bar 1
      { freq: 880, duration: 1 },     // A4
      { freq: 1047, duration: 0.5 },  // C5
      { freq: 1175, duration: 0.5 },  // D5
      { freq: 1319, duration: 0.5 },  // E5
      { freq: 1175, duration: 0.5 },  // D5
      { freq: 1047, duration: 1 },    // C5
      // bar 2
      { freq: 880, duration: 0.5 },   // A4
      { freq: 0, duration: 0.5, volume: 0 }, // rest
      { freq: 784, duration: 0.5 },   // G4
      { freq: 880, duration: 0.5 },   // A4
      { freq: 1047, duration: 1 },    // C5
      { freq: 880, duration: 0.5 },   // A4
      { freq: 784, duration: 0.5 },   // G4
      // bar 3
      { freq: 659, duration: 1 },     // E4
      { freq: 784, duration: 0.5 },   // G4
      { freq: 880, duration: 0.5 },   // A4
      { freq: 1047, duration: 0.5 },  // C5
      { freq: 0, duration: 0.5, volume: 0 }, // rest
      { freq: 1175, duration: 0.5 },  // D5
      { freq: 1047, duration: 0.5 },  // C5
      // bar 4
      { freq: 880, duration: 1 },     // A4
      { freq: 784, duration: 0.5 },   // G4
      { freq: 659, duration: 0.5 },   // E4
      { freq: 587, duration: 0.5 },   // D4
      { freq: 523, duration: 0.5 },   // C4
      { freq: 880, duration: 1 },     // A4
    ],
    // Bass — triangle wave
    // 16 beats total
    [
      { freq: 220, duration: 2, type: 'triangle', volume: 0.3 },  // A3
      { freq: 220, duration: 2, type: 'triangle', volume: 0.3 },  // A3
      { freq: 131, duration: 2, type: 'triangle', volume: 0.3 },  // C3
      { freq: 165, duration: 2, type: 'triangle', volume: 0.3 },  // E3
      { freq: 147, duration: 2, type: 'triangle', volume: 0.3 },  // D3
      { freq: 196, duration: 2, type: 'triangle', volume: 0.3 },  // G3
      { freq: 220, duration: 2, type: 'triangle', volume: 0.3 },  // A3
      { freq: 220, duration: 2, type: 'triangle', volume: 0.3 },  // A3
    ],
  ],
};
