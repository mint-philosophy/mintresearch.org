import type { TrackData } from '../../systems/AudioEngine';

// Boss fight theme — intense, dramatic, looping
export const bossTrack: TrackData = {
  bpm: 160,
  loop: true,
  notes: [
    // Lead — dramatic, intense
    [
      { freq: 196, duration: 0.25, type: 'square' },
      { freq: 233, duration: 0.25, type: 'square' },
      { freq: 262, duration: 0.25, type: 'square' },
      { freq: 294, duration: 0.25, type: 'square' },
      { freq: 262, duration: 0.5, type: 'square' },
      { freq: 196, duration: 0.25, type: 'square' },
      { freq: 175, duration: 0.25, type: 'square' },
      { freq: 196, duration: 0.5, type: 'square' },
      { freq: 262, duration: 0.25, type: 'square' },
      { freq: 294, duration: 0.25, type: 'square' },
      { freq: 349, duration: 0.5, type: 'square' },
      { freq: 294, duration: 0.25, type: 'square' },
      { freq: 262, duration: 0.25, type: 'square' },
      { freq: 196, duration: 0.5, type: 'square' },
    ],
    // Bass — pounding
    [
      { freq: 49, duration: 0.25, type: 'sawtooth', volume: 0.5 },
      { freq: 49, duration: 0.25, type: 'sawtooth', volume: 0.3 },
      { freq: 49, duration: 0.25, type: 'sawtooth', volume: 0.5 },
      { freq: 49, duration: 0.25, type: 'sawtooth', volume: 0.3 },
      { freq: 65, duration: 0.25, type: 'sawtooth', volume: 0.5 },
      { freq: 65, duration: 0.25, type: 'sawtooth', volume: 0.3 },
      { freq: 44, duration: 0.5, type: 'sawtooth', volume: 0.5 },
      { freq: 49, duration: 0.25, type: 'sawtooth', volume: 0.5 },
      { freq: 49, duration: 0.25, type: 'sawtooth', volume: 0.3 },
      { freq: 58, duration: 0.5, type: 'sawtooth', volume: 0.5 },
      { freq: 49, duration: 0.5, type: 'sawtooth', volume: 0.5 },
    ],
  ],
};
