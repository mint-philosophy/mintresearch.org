import type { TrackData } from '../../systems/AudioEngine';

// Level 3 — Rhythmic Variety
// BPM 120, D major (D E F# G A B C#), 4-bar loop
// Syncopated, rhythmic variety
export const level3Track: TrackData = {
  bpm: 120,
  loop: true,
  notes: [
    // Lead — square wave, syncopated melody
    // 4 bars of 4/4 = 16 beats total
    [
      // bar 1 — syncopated opening
      { freq: 587, duration: 0.5 },   // D4
      { freq: 0, duration: 0.5, volume: 0 }, // rest
      { freq: 740, duration: 0.5 },   // F#4
      { freq: 784, duration: 0.5 },   // G4
      { freq: 880, duration: 0.5 },   // A4
      { freq: 0, duration: 0.5, volume: 0 }, // rest
      { freq: 740, duration: 1 },     // F#4
      // bar 2 — call and response
      { freq: 988, duration: 0.5 },   // B4
      { freq: 880, duration: 0.5 },   // A4
      { freq: 0, duration: 0.5, volume: 0 }, // rest
      { freq: 784, duration: 0.5 },   // G4
      { freq: 740, duration: 0.5 },   // F#4
      { freq: 659, duration: 0.5 },   // E4
      { freq: 587, duration: 1 },     // D4
      // bar 3 — ascending run with syncopation
      { freq: 659, duration: 0.5 },   // E4
      { freq: 740, duration: 0.5 },   // F#4
      { freq: 880, duration: 0.5 },   // A4
      { freq: 0, duration: 0.5, volume: 0 }, // rest
      { freq: 1109, duration: 0.5 },  // C#5
      { freq: 1175, duration: 0.5 },  // D5
      { freq: 1109, duration: 0.5 },  // C#5
      { freq: 988, duration: 0.5 },   // B4
      // bar 4 — resolution with pickup
      { freq: 880, duration: 1 },     // A4
      { freq: 0, duration: 0.5, volume: 0 }, // rest
      { freq: 740, duration: 0.5 },   // F#4
      { freq: 587, duration: 1 },     // D4
      { freq: 0, duration: 1, volume: 0 }, // rest
    ],
    // Bass — triangle wave, rhythmic
    // 16 beats total
    [
      { freq: 147, duration: 1, type: 'triangle', volume: 0.3 },  // D3
      { freq: 147, duration: 1, type: 'triangle', volume: 0.3 },  // D3
      { freq: 220, duration: 1, type: 'triangle', volume: 0.3 },  // A3
      { freq: 196, duration: 1, type: 'triangle', volume: 0.3 },  // G3
      { freq: 247, duration: 1, type: 'triangle', volume: 0.3 },  // B3
      { freq: 220, duration: 1, type: 'triangle', volume: 0.3 },  // A3
      { freq: 196, duration: 1, type: 'triangle', volume: 0.3 },  // G3
      { freq: 165, duration: 1, type: 'triangle', volume: 0.3 },  // E3
      { freq: 147, duration: 1, type: 'triangle', volume: 0.3 },  // D3
      { freq: 165, duration: 1, type: 'triangle', volume: 0.3 },  // E3
      { freq: 220, duration: 2, type: 'triangle', volume: 0.3 },  // A3
      { freq: 147, duration: 2, type: 'triangle', volume: 0.3 },  // D3
      { freq: 220, duration: 2, type: 'triangle', volume: 0.3 },  // A3
    ],
  ],
};
