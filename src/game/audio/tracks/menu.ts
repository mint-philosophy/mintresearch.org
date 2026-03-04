import type { TrackData } from '../../systems/AudioEngine';

// Menu theme — chill, inviting, slightly mysterious
export const menuTrack: TrackData = {
  bpm: 100,
  loop: true,
  notes: [
    // Lead (square wave)
    [
      { freq: 523, duration: 1 },
      { freq: 659, duration: 0.5 },
      { freq: 784, duration: 0.5 },
      { freq: 698, duration: 1 },
      { freq: 659, duration: 0.5 },
      { freq: 523, duration: 0.5 },
      { freq: 440, duration: 1 },
      { freq: 523, duration: 0.5 },
      { freq: 659, duration: 0.5 },
      { freq: 523, duration: 1 },
      { freq: 440, duration: 0.5 },
      { freq: 392, duration: 0.5 },
      { freq: 440, duration: 1 },
      { freq: 523, duration: 1 },
    ],
    // Bass (triangle wave)
    [
      { freq: 131, duration: 2, type: 'triangle', volume: 0.4 },
      { freq: 175, duration: 2, type: 'triangle', volume: 0.4 },
      { freq: 110, duration: 2, type: 'triangle', volume: 0.4 },
      { freq: 131, duration: 2, type: 'triangle', volume: 0.4 },
    ],
  ],
};
