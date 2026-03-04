import type { TrackData } from '../../systems/AudioEngine';

// Level 3 — Bluesky: Airy, open, optimistic
export const level3Track: TrackData = {
  bpm: 120,
  loop: true,
  notes: [
    // Lead — light and airy
    [
      { freq: 659, duration: 0.5 },
      { freq: 784, duration: 0.25 },
      { freq: 880, duration: 0.75 },
      { freq: 784, duration: 0.5 },
      { freq: 659, duration: 0.5 },
      { freq: 784, duration: 0.25 },
      { freq: 659, duration: 0.25 },
      { freq: 523, duration: 0.5 },
      { freq: 659, duration: 0.5 },
      { freq: 784, duration: 0.75 },
      { freq: 1047, duration: 0.5 },
      { freq: 880, duration: 0.25 },
      { freq: 784, duration: 0.5 },
      { freq: 659, duration: 0.75 },
    ],
    // Bass
    [
      { freq: 131, duration: 1.5, type: 'triangle', volume: 0.3 },
      { freq: 165, duration: 1, type: 'triangle', volume: 0.3 },
      { freq: 131, duration: 1, type: 'triangle', volume: 0.3 },
      { freq: 175, duration: 1, type: 'triangle', volume: 0.3 },
      { freq: 131, duration: 1.5, type: 'triangle', volume: 0.3 },
    ],
  ],
};
