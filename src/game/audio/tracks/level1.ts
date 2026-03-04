import type { TrackData } from '../../systems/AudioEngine';

// Level 1 — Twitter: Energetic, slightly anxious, algorithm storm
export const level1Track: TrackData = {
  bpm: 140,
  loop: true,
  notes: [
    // Lead
    [
      { freq: 440, duration: 0.25 },
      { freq: 523, duration: 0.25 },
      { freq: 659, duration: 0.5 },
      { freq: 587, duration: 0.25 },
      { freq: 523, duration: 0.25 },
      { freq: 440, duration: 0.5 },
      { freq: 392, duration: 0.25 },
      { freq: 440, duration: 0.25 },
      { freq: 523, duration: 0.5 },
      { freq: 659, duration: 0.25 },
      { freq: 784, duration: 0.25 },
      { freq: 659, duration: 0.5 },
      { freq: 523, duration: 0.5 },
      { freq: 440, duration: 0.5 },
    ],
    // Bass
    [
      { freq: 110, duration: 0.5, type: 'triangle', volume: 0.4 },
      { freq: 110, duration: 0.5, type: 'triangle', volume: 0.4 },
      { freq: 147, duration: 0.5, type: 'triangle', volume: 0.4 },
      { freq: 147, duration: 0.5, type: 'triangle', volume: 0.4 },
      { freq: 131, duration: 0.5, type: 'triangle', volume: 0.4 },
      { freq: 131, duration: 0.5, type: 'triangle', volume: 0.4 },
      { freq: 110, duration: 1, type: 'triangle', volume: 0.4 },
    ],
  ],
};
