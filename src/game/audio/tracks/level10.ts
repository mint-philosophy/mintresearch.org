import type { TrackData } from '../../systems/AudioEngine';

// Level 10 — Mega Datacenter
// Industrial pulse, 140 BPM in A minor with layered synth racks
export const level10Track: TrackData = {
  bpm: 140,
  loop: true,
  notes: [
    [
      { freq: 440, duration: 0.5 },
      { freq: 523, duration: 0.5 },
      { freq: 587, duration: 0.5 },
      { freq: 659, duration: 0.5 },
      { freq: 587, duration: 0.5 },
      { freq: 523, duration: 0.5 },
      { freq: 440, duration: 1 },
      { freq: 0, duration: 0.5, volume: 0 },
      { freq: 392, duration: 0.5 },
      { freq: 523, duration: 0.5 },
      { freq: 659, duration: 0.5 },
      { freq: 740, duration: 0.5 },
      { freq: 659, duration: 0.5 },
      { freq: 523, duration: 0.5 },
      { freq: 440, duration: 1 },
    ],
    [
      { freq: 220, duration: 2, type: 'triangle', volume: 0.3 },
      { freq: 247, duration: 2, type: 'triangle', volume: 0.3 },
      { freq: 262, duration: 2, type: 'triangle', volume: 0.3 },
      { freq: 233, duration: 2, type: 'triangle', volume: 0.3 },
      { freq: 220, duration: 2, type: 'triangle', volume: 0.3 },
      { freq: 196, duration: 2, type: 'triangle', volume: 0.3 },
      { freq: 185, duration: 2, type: 'triangle', volume: 0.3 },
      { freq: 220, duration: 2, type: 'triangle', volume: 0.3 },
    ],
  ],
};
