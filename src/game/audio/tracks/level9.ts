import type { TrackData } from '../../systems/AudioEngine';

// Level 9 — San Francisco
// BPM 110, brighter arpeggio with suspension
export const level9Track: TrackData = {
  bpm: 110,
  loop: true,
  notes: [
    [
      { freq: 440, duration: 0.5 },
      { freq: 494, duration: 0.5 },
      { freq: 523, duration: 0.5 },
      { freq: 587, duration: 0.5 },
      { freq: 659, duration: 0.75 },
      { freq: 0, duration: 0.25, volume: 0 },
      { freq: 523, duration: 0.5 },
      { freq: 587, duration: 0.5 },
      { freq: 659, duration: 0.5 },
      { freq: 740, duration: 0.5 },
      { freq: 880, duration: 0.75 },
      { freq: 0, duration: 0.25, volume: 0 },
    ],
    [
      { freq: 220, duration: 2, type: 'triangle', volume: 0.3 },
      { freq: 247, duration: 2, type: 'triangle', volume: 0.3 },
      { freq: 275, duration: 2, type: 'triangle', volume: 0.3 },
      { freq: 247, duration: 2, type: 'triangle', volume: 0.3 },
      { freq: 220, duration: 2, type: 'triangle', volume: 0.3 },
      { freq: 196, duration: 2, type: 'triangle', volume: 0.28 },
      { freq: 220, duration: 2, type: 'triangle', volume: 0.28 },
      { freq: 247, duration: 2, type: 'triangle', volume: 0.28 },
    ],
  ],
};
