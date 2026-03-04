// ═══════════════════════════════════════════════════
// Data Dash — Web Audio Chiptune Engine
// ═══════════════════════════════════════════════════

export interface NoteData {
  freq: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
}

export interface TrackData {
  bpm: number;
  notes: NoteData[][];  // Array of channels, each with notes
  loop?: boolean;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted: boolean = false;
  private currentTrack: number[] = [];  // timeout IDs
  private sfxQueue: number[] = [];

  init(): void {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.15;
      this.masterGain.connect(this.ctx.destination);
    } catch (_) {}
  }

  private ensureContext(): AudioContext | null {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.15;
    }
  }

  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  // Play a single note
  playNote(freq: number, duration: number, type: OscillatorType = 'square', volume: number = 0.5): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = type;
    osc.frequency.value = freq;

    const t = ctx.currentTime;
    gain.gain.setValueAtTime(volume * 0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.start(t);
    osc.stop(t + duration);
  }

  // SFX: short sound effects
  playSFX(name: string): void {
    switch (name) {
      case 'jump':
        this.playNote(200, 0.08, 'square', 0.3);
        setTimeout(() => this.playNote(400, 0.08, 'square', 0.3), 40);
        break;
      case 'shoot':
        this.playNote(800, 0.05, 'sawtooth', 0.4);
        setTimeout(() => this.playNote(600, 0.05, 'sawtooth', 0.3), 30);
        break;
      case 'collect':
        this.playNote(523, 0.08, 'square', 0.4);
        setTimeout(() => this.playNote(659, 0.08, 'square', 0.4), 60);
        setTimeout(() => this.playNote(784, 0.1, 'square', 0.5), 120);
        break;
      case 'hit':
        this.playNote(150, 0.15, 'sawtooth', 0.5);
        this.playNote(100, 0.2, 'square', 0.3);
        break;
      case 'death':
        this.playNote(400, 0.15, 'square', 0.5);
        setTimeout(() => this.playNote(300, 0.15, 'square', 0.4), 150);
        setTimeout(() => this.playNote(200, 0.15, 'square', 0.3), 300);
        setTimeout(() => this.playNote(100, 0.3, 'square', 0.2), 450);
        break;
      case 'powerup':
        [523, 659, 784, 1047].forEach((f, i) => {
          setTimeout(() => this.playNote(f, 0.1, 'square', 0.4), i * 80);
        });
        break;
      case 'powerdown':
        [784, 659, 523, 392].forEach((f, i) => {
          setTimeout(() => this.playNote(f, 0.1, 'sawtooth', 0.3), i * 80);
        });
        break;
      case 'boss':
        this.playNote(100, 0.3, 'sawtooth', 0.5);
        setTimeout(() => this.playNote(80, 0.4, 'sawtooth', 0.4), 200);
        break;
      case 'victory':
        [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => {
          setTimeout(() => this.playNote(f, 0.15, 'square', 0.5), i * 100);
        });
        break;
      case 'checkpoint':
        this.playNote(523, 0.1, 'triangle', 0.4);
        setTimeout(() => this.playNote(784, 0.15, 'triangle', 0.5), 80);
        break;
    }
  }

  // Play a chiptune track (looping)
  playTrack(track: TrackData): void {
    this.stopTrack();
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const beatDuration = 60 / track.bpm;

    const playChannel = (channel: NoteData[], channelIndex: number) => {
      let time = 0;
      channel.forEach((note, noteIndex) => {
        const id = window.setTimeout(() => {
          this.playNote(
            note.freq,
            note.duration * beatDuration,
            note.type || (channelIndex === 0 ? 'square' : 'triangle'),
            note.volume || (channelIndex === 0 ? 0.5 : 0.3)
          );
        }, time * 1000);
        this.currentTrack.push(id);
        time += note.duration * beatDuration;
      });

      // Loop
      if (track.loop !== false) {
        const totalTime = time * 1000;
        const loopId = window.setTimeout(() => {
          this.playTrack(track);
        }, totalTime);
        this.currentTrack.push(loopId);
      }
    };

    track.notes.forEach((channel, i) => playChannel(channel, i));
  }

  stopTrack(): void {
    this.currentTrack.forEach(id => window.clearTimeout(id));
    this.currentTrack = [];
  }

  stopAll(): void {
    this.stopTrack();
    this.sfxQueue.forEach(id => window.clearTimeout(id));
    this.sfxQueue = [];
  }
}

// Singleton
export const audioEngine = new AudioEngine();
