import type { TrackData } from '../../systems/AudioEngine';

// Level 6 — Most Complex
// BPM 135, B minor (B C# D E F# G A), 8-bar loop
// Urgent, complex melody for the finale level
export const level6Track: TrackData = {
  bpm: 135,
  loop: true,
  notes: [
    // Lead — square wave, complex and urgent
    // 8 bars of 4/4 = 32 beats total
    [
      // bar 1 — opening statement
      { freq: 988, duration: 0.5 },   // B4
      { freq: 1109, duration: 0.5 },  // C#5
      { freq: 1175, duration: 0.5 },  // D5
      { freq: 0, duration: 0.5, volume: 0 }, // rest
      { freq: 1319, duration: 0.5 },  // E5
      { freq: 1175, duration: 0.5 },  // D5
      { freq: 1109, duration: 1 },    // C#5
      // bar 2 — descending response
      { freq: 988, duration: 0.5 },   // B4
      { freq: 880, duration: 0.5 },   // A4
      { freq: 784, duration: 0.5 },   // G4
      { freq: 880, duration: 0.5 },   // A4
      { freq: 988, duration: 1 },     // B4
      { freq: 0, duration: 1, volume: 0 }, // rest
      // bar 3 — high register push
      { freq: 1480, duration: 0.5 },  // F#5
      { freq: 1319, duration: 0.5 },  // E5
      { freq: 1175, duration: 0.5 },  // D5
      { freq: 1109, duration: 0.5 },  // C#5
      { freq: 1175, duration: 1 },    // D5
      { freq: 1319, duration: 0.5 },  // E5
      { freq: 1480, duration: 0.5 },  // F#5
      // bar 4 — syncopated descent
      { freq: 1319, duration: 0.5 },  // E5
      { freq: 0, duration: 0.5, volume: 0 }, // rest
      { freq: 1175, duration: 0.5 },  // D5
      { freq: 1109, duration: 0.5 },  // C#5
      { freq: 988, duration: 0.5 },   // B4
      { freq: 880, duration: 0.5 },   // A4
      { freq: 988, duration: 1 },     // B4
      // bar 5 — variation on bar 1
      { freq: 988, duration: 0.5 },   // B4
      { freq: 0, duration: 0.5, volume: 0 }, // rest
      { freq: 1175, duration: 0.5 },  // D5
      { freq: 1319, duration: 0.5 },  // E5
      { freq: 1480, duration: 0.5 },  // F#5
      { freq: 1319, duration: 0.5 },  // E5
      { freq: 1175, duration: 0.5 },  // D5
      { freq: 1109, duration: 0.5 },  // C#5
      // bar 6 — rhythmic drive
      { freq: 988, duration: 0.5 },   // B4
      { freq: 988, duration: 0.5 },   // B4
      { freq: 0, duration: 0.5, volume: 0 }, // rest
      { freq: 1109, duration: 0.5 },  // C#5
      { freq: 1175, duration: 0.5 },  // D5
      { freq: 1175, duration: 0.5 },  // D5
      { freq: 1109, duration: 0.5 },  // C#5
      { freq: 988, duration: 0.5 },   // B4
      // bar 7 — climactic phrase
      { freq: 1480, duration: 1 },    // F#5
      { freq: 1319, duration: 0.5 },  // E5
      { freq: 1175, duration: 0.5 },  // D5
      { freq: 1109, duration: 0.5 },  // C#5
      { freq: 1175, duration: 0.5 },  // D5
      { freq: 988, duration: 1 },     // B4
      // bar 8 — resolution
      { freq: 880, duration: 0.5 },   // A4
      { freq: 988, duration: 0.5 },   // B4
      { freq: 1109, duration: 0.5 },  // C#5
      { freq: 988, duration: 0.5 },   // B4
      { freq: 0, duration: 1, volume: 0 }, // rest
      { freq: 988, duration: 1 },     // B4
    ],
    // Bass — triangle wave
    // 32 beats total (8 bars)
    [
      { freq: 247, duration: 2, type: 'triangle', volume: 0.3 },  // B3
      { freq: 247, duration: 2, type: 'triangle', volume: 0.3 },  // B3
      { freq: 220, duration: 2, type: 'triangle', volume: 0.3 },  // A3
      { freq: 196, duration: 2, type: 'triangle', volume: 0.3 },  // G3
      { freq: 165, duration: 2, type: 'triangle', volume: 0.3 },  // E3
      { freq: 185, duration: 2, type: 'triangle', volume: 0.3 },  // F#3
      { freq: 196, duration: 2, type: 'triangle', volume: 0.3 },  // G3
      { freq: 220, duration: 2, type: 'triangle', volume: 0.3 },  // A3
      { freq: 247, duration: 2, type: 'triangle', volume: 0.3 },  // B3
      { freq: 196, duration: 2, type: 'triangle', volume: 0.3 },  // G3
      { freq: 165, duration: 2, type: 'triangle', volume: 0.3 },  // E3
      { freq: 185, duration: 2, type: 'triangle', volume: 0.3 },  // F#3
      { freq: 196, duration: 2, type: 'triangle', volume: 0.3 },  // G3
      { freq: 220, duration: 2, type: 'triangle', volume: 0.3 },  // A3
      { freq: 185, duration: 2, type: 'triangle', volume: 0.3 },  // F#3
      { freq: 247, duration: 2, type: 'triangle', volume: 0.3 },  // B3
    ],
  ],
};
