import type { TrackData } from '../../systems/AudioEngine';

// Level 2 — LinkedIn: Corporate elevator music, smooth jazz chiptune
export const level2Track: TrackData = {
  bpm: 110,
  loop: true,
  notes: [
    // Lead — smooth, jazzy
    [
      { freq: 392, duration: 0.5 },
      { freq: 440, duration: 0.25 },
      { freq: 523, duration: 0.75 },
      { freq: 494, duration: 0.25 },
      { freq: 440, duration: 0.25 },
      { freq: 392, duration: 0.5 },
      { freq: 349, duration: 0.5 },
      { freq: 392, duration: 0.5 },
      { freq: 440, duration: 0.75 },
      { freq: 523, duration: 0.25 },
      { freq: 587, duration: 0.5 },
      { freq: 523, duration: 0.5 },
      { freq: 440, duration: 0.5 },
      { freq: 392, duration: 1 },
    ],
    // Bass
    [
      { freq: 98, duration: 1, type: 'triangle', volume: 0.35 },
      { freq: 131, duration: 1, type: 'triangle', volume: 0.35 },
      { freq: 87, duration: 1, type: 'triangle', volume: 0.35 },
      { freq: 98, duration: 1, type: 'triangle', volume: 0.35 },
      { freq: 110, duration: 1, type: 'triangle', volume: 0.35 },
      { freq: 98, duration: 1.5, type: 'triangle', volume: 0.35 },
    ],
  ],
};
