import type { TrackData } from '../../systems/AudioEngine';

// Level 5 — PhilPapers: Contemplative, sparse, haunting
export const level5Track: TrackData = {
  bpm: 72,
  loop: true,
  notes: [
    // Lead — sparse, contemplative, lots of space
    [
      { freq: 262, duration: 2 },
      { freq: 294, duration: 1 },
      { freq: 262, duration: 1 },
      { freq: 247, duration: 2 },
      { freq: 220, duration: 1 },
      { freq: 247, duration: 1 },
      { freq: 262, duration: 2 },
      { freq: 330, duration: 1 },
      { freq: 294, duration: 1 },
      { freq: 262, duration: 2 },
      { freq: 220, duration: 2 },
    ],
    // Bass — very minimal
    [
      { freq: 65, duration: 4, type: 'triangle', volume: 0.25 },
      { freq: 55, duration: 4, type: 'triangle', volume: 0.25 },
      { freq: 65, duration: 4, type: 'triangle', volume: 0.25 },
      { freq: 55, duration: 4, type: 'triangle', volume: 0.25 },
    ],
  ],
};
