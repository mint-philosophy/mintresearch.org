import type { TrackData } from '../../systems/AudioEngine';

// Level 4 — ArXiv: Methodical, structured, library ambience
export const level4Track: TrackData = {
  bpm: 100,
  loop: true,
  notes: [
    // Lead — precise, methodical
    [
      { freq: 330, duration: 0.5 },
      { freq: 392, duration: 0.5 },
      { freq: 440, duration: 0.25 },
      { freq: 392, duration: 0.25 },
      { freq: 330, duration: 0.5 },
      { freq: 294, duration: 0.5 },
      { freq: 330, duration: 0.5 },
      { freq: 440, duration: 0.5 },
      { freq: 523, duration: 0.25 },
      { freq: 494, duration: 0.25 },
      { freq: 440, duration: 0.5 },
      { freq: 392, duration: 0.5 },
      { freq: 330, duration: 0.5 },
      { freq: 294, duration: 0.5 },
      { freq: 330, duration: 1 },
    ],
    // Bass
    [
      { freq: 82, duration: 1.5, type: 'triangle', volume: 0.35 },
      { freq: 73, duration: 1.5, type: 'triangle', volume: 0.35 },
      { freq: 82, duration: 1.5, type: 'triangle', volume: 0.35 },
      { freq: 98, duration: 1.5, type: 'triangle', volume: 0.35 },
      { freq: 82, duration: 1.5, type: 'triangle', volume: 0.35 },
    ],
  ],
};
