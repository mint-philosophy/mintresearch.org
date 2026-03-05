import type { TrackData } from '../../systems/AudioEngine';

// Menu — Music Box Jingle
// BPM 90, C major pentatonic (C D E G A), 4-bar loop
// Gentle, inviting, music-box quality
export const menuTrack: TrackData = {
  bpm: 90,
  loop: true,
  notes: [
    // Lead — square wave, music box melody
    // 4 bars of 4/4 = 16 beats total
    [
      { freq: 1047, duration: 1 },    // C5
      { freq: 880, duration: 0.5 },   // A4
      { freq: 784, duration: 0.5 },   // G4
      { freq: 659, duration: 1 },     // E4
      { freq: 784, duration: 1 },     // G4
      // bar 2
      { freq: 880, duration: 0.5 },   // A4
      { freq: 1047, duration: 0.5 },  // C5
      { freq: 880, duration: 1 },     // A4
      { freq: 784, duration: 1 },     // G4
      { freq: 659, duration: 0.5 },   // E4
      { freq: 587, duration: 0.5 },   // D4
      // bar 3
      { freq: 523, duration: 1 },     // C4
      { freq: 587, duration: 0.5 },   // D4
      { freq: 659, duration: 0.5 },   // E4
      { freq: 784, duration: 1 },     // G4
      { freq: 880, duration: 1 },     // A4
      // bar 4
      { freq: 784, duration: 0.5 },   // G4
      { freq: 659, duration: 0.5 },   // E4
      { freq: 523, duration: 1 },     // C4
      { freq: 587, duration: 0.5 },   // D4
      { freq: 523, duration: 0.5 },   // C4
      { freq: 0, duration: 1, volume: 0 }, // rest
    ],
    // Bass — triangle wave
    // 16 beats total (4 bars, whole notes)
    [
      { freq: 131, duration: 2, type: 'triangle', volume: 0.3 },  // C3
      { freq: 131, duration: 2, type: 'triangle', volume: 0.3 },  // C3
      { freq: 196, duration: 2, type: 'triangle', volume: 0.3 },  // G3
      { freq: 165, duration: 2, type: 'triangle', volume: 0.3 },  // E3
      { freq: 131, duration: 2, type: 'triangle', volume: 0.3 },  // C3
      { freq: 196, duration: 2, type: 'triangle', volume: 0.3 },  // G3
      { freq: 220, duration: 2, type: 'triangle', volume: 0.3 },  // A3
      { freq: 131, duration: 2, type: 'triangle', volume: 0.3 },  // C3
    ],
  ],
};
