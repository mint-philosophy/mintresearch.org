import type { TrackData } from '../../systems/AudioEngine';

// Level 6 — SSRN: Dark, industrial, intense, final fortress
export const level6Track: TrackData = {
  bpm: 150,
  loop: true,
  notes: [
    // Lead — aggressive, urgent
    [
      { freq: 220, duration: 0.25, type: 'sawtooth' },
      { freq: 220, duration: 0.25, type: 'sawtooth' },
      { freq: 262, duration: 0.25, type: 'sawtooth' },
      { freq: 220, duration: 0.25, type: 'sawtooth' },
      { freq: 196, duration: 0.5, type: 'sawtooth' },
      { freq: 220, duration: 0.25, type: 'sawtooth' },
      { freq: 262, duration: 0.25, type: 'sawtooth' },
      { freq: 294, duration: 0.25, type: 'sawtooth' },
      { freq: 262, duration: 0.25, type: 'sawtooth' },
      { freq: 220, duration: 0.5, type: 'sawtooth' },
      { freq: 196, duration: 0.25, type: 'sawtooth' },
      { freq: 175, duration: 0.25, type: 'sawtooth' },
      { freq: 196, duration: 0.5, type: 'sawtooth' },
      { freq: 220, duration: 0.5, type: 'sawtooth' },
    ],
    // Bass — heavy, driving
    [
      { freq: 55, duration: 0.25, type: 'sawtooth', volume: 0.5 },
      { freq: 55, duration: 0.25, type: 'sawtooth', volume: 0.3 },
      { freq: 55, duration: 0.25, type: 'sawtooth', volume: 0.5 },
      { freq: 55, duration: 0.25, type: 'sawtooth', volume: 0.3 },
      { freq: 49, duration: 0.5, type: 'sawtooth', volume: 0.5 },
      { freq: 55, duration: 0.25, type: 'sawtooth', volume: 0.5 },
      { freq: 55, duration: 0.25, type: 'sawtooth', volume: 0.3 },
      { freq: 65, duration: 0.5, type: 'sawtooth', volume: 0.5 },
      { freq: 55, duration: 0.25, type: 'sawtooth', volume: 0.5 },
      { freq: 55, duration: 0.25, type: 'sawtooth', volume: 0.3 },
      { freq: 49, duration: 0.5, type: 'sawtooth', volume: 0.5 },
      { freq: 55, duration: 0.5, type: 'sawtooth', volume: 0.5 },
    ],
  ],
};
