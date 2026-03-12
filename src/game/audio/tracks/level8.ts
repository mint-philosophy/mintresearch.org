import type { TrackData } from '../../systems/AudioEngine';

// Level 8 — NeurIPS
// Slow, glimmering minor key pulse with sparse glockenspiel taps
export const level8Track: TrackData = {
  bpm: 120,
  loop: true,
  notes: [
    [
      { freq: 392, duration: 1, type: 'triangle', volume: 0.28 },
      { freq: 330, duration: 1, type: 'triangle', volume: 0.28 },
      { freq: 294, duration: 1, type: 'triangle', volume: 0.28 },
      { freq: 0, duration: 1, volume: 0 },
      { freq: 330, duration: 0.5, type: 'triangle', volume: 0.22 },
      { freq: 294, duration: 0.5, type: 'triangle', volume: 0.22 },
      { freq: 262, duration: 1, type: 'triangle', volume: 0.24 },
      { freq: 0, duration: 1, volume: 0 },
      { freq: 294, duration: 0.5, type: 'triangle', volume: 0.22 },
      { freq: 330, duration: 0.5, type: 'triangle', volume: 0.22 },
      { freq: 392, duration: 1, type: 'triangle', volume: 0.28 },
      { freq: 0, duration: 1, volume: 0 },
      { freq: 440, duration: 1, type: 'triangle', volume: 0.2 },
      { freq: 392, duration: 1, type: 'triangle', volume: 0.2 },
      { freq: 349, duration: 1, type: 'triangle', volume: 0.2 },
      { freq: 0, duration: 1, volume: 0 },
    ],
    [
      { freq: 110, duration: 2, type: 'sine', volume: 0.35 },
      { freq: 123, duration: 2, type: 'sine', volume: 0.35 },
      { freq: 117, duration: 2, type: 'sine', volume: 0.35 },
      { freq: 104, duration: 2, type: 'sine', volume: 0.35 },
      { freq: 98, duration: 2, type: 'sine', volume: 0.35 },
      { freq: 110, duration: 2, type: 'sine', volume: 0.35 },
      { freq: 123, duration: 2, type: 'sine', volume: 0.35 },
      { freq: 117, duration: 2, type: 'sine', volume: 0.35 },
    ],
  ],
};
