// ═══════════════════════════════════════════════════
// Data Dash — localStorage Persistence
// ═══════════════════════════════════════════════════

const STORAGE_KEY = 'data-dash-state';

export interface GameSaveData {
  highScore: number;
  maxLevelUnlocked: number;
  totalPapersCollected: number;
  muted: boolean;
}

const DEFAULT_STATE: GameSaveData = {
  highScore: 0,
  maxLevelUnlocked: 1,
  totalPapersCollected: 0,
  muted: false,
};

export class GameStateManager {
  private data: GameSaveData;

  constructor() {
    this.data = this.load();
  }

  private load(): GameSaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch (_) {}
    return { ...DEFAULT_STATE };
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (_) {}
  }

  get highScore(): number { return this.data.highScore; }
  get maxLevelUnlocked(): number { return this.data.maxLevelUnlocked; }
  get totalPapersCollected(): number { return this.data.totalPapersCollected; }
  get muted(): boolean { return this.data.muted; }

  updateHighScore(score: number): void {
    if (score > this.data.highScore) {
      this.data.highScore = score;
      this.save();
    }
  }

  unlockLevel(level: number): void {
    if (level > this.data.maxLevelUnlocked) {
      this.data.maxLevelUnlocked = level;
      this.save();
    }
  }

  addPapers(count: number): void {
    this.data.totalPapersCollected += count;
    this.save();
  }

  toggleMute(): boolean {
    this.data.muted = !this.data.muted;
    this.save();
    return this.data.muted;
  }

  setMuted(muted: boolean): void {
    this.data.muted = muted;
    this.save();
  }

  reset(): void {
    this.data = { ...DEFAULT_STATE };
    this.save();
  }
}
