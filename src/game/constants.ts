// ═══════════════════════════════════════════════════
// Data Dash — Shared Constants & Types
// ═══════════════════════════════════════════════════

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 500;
export const TILE_SIZE = 32;

// Player
export const PLAYER_SCALE = 0.35;
export const PLAYER_BODY_WIDTH = 30;
export const PLAYER_BODY_HEIGHT = 38;
export const NPC_SCALE = 0.25;
export const PLAYER_SPEED = 160;
export const PLAYER_JUMP = -350;
export const PLAYER_MAX_HEALTH = 100;
export const PLAYER_LIVES = 3;
export const PLAYER_INK_RANGE_BASE = 100;
export const PLAYER_INK_RANGE_PER_5 = 20;
export const PLAYER_INK_RANGE_CAP = 300;
export const PLAYER_INK_SPEED = 400;
export const PLAYER_INK_COOLDOWN = 300;

// Papers
export const PAPER_HEAL = 5;
export const PAPER_SCORE = 100;

// Damage
export const SLOP_DAMAGE = 15;
export const CONTACT_DAMAGE = 10;

// Enemies
export const ENEMY_TIERS = {
  peach: { hp: 1, speed: 40, slopInterval: 3000, score: 10 },
  red:   { hp: 2, speed: 70, slopInterval: 2000, score: 25 },
  orange:{ hp: 3, speed: 100, slopInterval: 2500, score: 50 },
} as const;

// Power-ups
export const POWERUP_DURATION = {
  shield: 8000,
  brainBoost: 10000,
  speedBolt: 12000,
  timeFreeze: 5000,
} as const;

// Power-downs
export const POWERDOWN_DURATION = {
  clippy: 5000,
  fogCloud: 5000,
  sludge: 5000,
} as const;

export const POWERDOWN_PAPER_LOSS = 3;

// Colors (matching site CSS vars)
export const COLORS = {
  bg0: 0x0a0a0a,
  bg1: 0x111111,
  bg2: 0x1a1a1a,
  accent: 0x2ec4b6,
  accentBright: 0x5de8da,
  red: 0xe06c75,
  cyan: 0x56b6c2,
  green: 0x98c379,
  purple: 0xc678dd,
  yellow: 0xe5c07b,
  blue: 0x61afef,
  indigo: 0x818cf8,
  teal: 0x2dd4bf,
  amber: 0xf5a623,
  white: 0xffffff,
  textBright: 0xd4d4d4,
  text1: 0xabb2bf,
  text2: 0x7f848e,
  text3: 0x5c6370,
} as const;

// Level themes
export const LEVEL_THEMES = {
  1: { name: 'X (Twitter)',    color: 0x1DA1F2, bg: '#0d1117' },
  2: { name: 'LinkedIn',       color: 0x0A66C2, bg: '#0a1628' },
  3: { name: 'Bluesky',        color: 0x0085FF, bg: '#0a1a2e' },
  4: { name: 'ArXiv',          color: 0xB31B1B, bg: '#1a0a0a' },
  5: { name: 'PhilPapers',     color: 0x2C3E50, bg: '#0a0a14' },
  6: { name: 'SSRN',           color: 0x1E4D2B, bg: '#0a140a' },
} as const;

// Minty sprite colors for power-up cycling
export const MINTY_COLORS = [
  'teal', 'green', 'purple', 'yellow', 'indigo', 'red', 'brown', 'cool',
] as const;

// Level platform texture keys
export const LEVEL_PLATFORM_KEYS: Record<number, string> = {
  1: 'platform-twitter',
  2: 'platform-linkedin',
  3: 'platform-bluesky',
  4: 'platform-arxiv',
  5: 'platform-philpapers',
  6: 'platform-ssrn',
};

// Enemy death text per level
export const DEATH_TEXTS: Record<number, string[]> = {
  1: ['RATIO\'D', 'BLOCKED', 'MUTED', 'L + RATIO', 'REPORTED'],
  2: ['ENDORSED', 'OUT OF NETWORK', 'CONNECTION REMOVED', 'UNFOLLOWED'],
  3: ['DEFEDERATED', 'SKEET DELETED', 'MODLISTED', 'BLOCKED'],
  4: ['RETRACTED', 'DESK REJECT', 'PEER REVIEWED', 'REJECTED'],
  5: ['REFUTED', 'COUNTEREXAMPLE', 'MODUS TOLLENS', 'REDUCTIO'],
  6: ['403 FORBIDDEN', 'RATE LIMITED', 'CAPTCHA FAILED', 'IP BANNED'],
};

// Scene keys
export const SCENES = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  MENU: 'MenuScene',
  LEVEL: 'LevelScene',
  HUD: 'HUDScene',
  DIALOGUE: 'DialogueScene',
  PAUSE: 'PauseScene',
  GAMEOVER: 'GameOverScene',
} as const;

// Types
export type MintyColor = typeof MINTY_COLORS[number];
export type EnemyTier = keyof typeof ENEMY_TIERS;
export type PowerUpType = keyof typeof POWERUP_DURATION;
export type PowerDownType = keyof typeof POWERDOWN_DURATION | 'dataLeak';
export type LevelNumber = 1 | 2 | 3 | 4 | 5 | 6;

export interface PlatformData {
  x: number;
  y: number;
  width: number;
  type?: 'normal' | 'moving' | 'crumbling' | 'quicksand';
  moveRange?: number;
  moveSpeed?: number;
}

export interface EnemySpawn {
  type: 'octopus' | 'troll' | 'influencer' | 'critic' | 'paperFlood' | 'cloudflareWall';
  x: number;
  y: number;
  tier?: EnemyTier;
  patrolRange?: number;
}

export interface NPCData {
  color: MintyColor;
  x: number;
  y: number;
  dialogueKey: string;
}

export interface PowerUpSpawn {
  type: PowerUpType | PowerDownType;
  x: number;
  y: number;
}

export interface PaperSpawn {
  x: number;
  y: number;
  isGold?: boolean;
}

export interface CheckpointData {
  x: number;
  y: number;
}

export interface BossConfig {
  type: string;
  x: number;
  y: number;
  phases: number;
  hp: number;
}

export interface LevelConfig {
  number: LevelNumber;
  name: string;
  width: number;
  platforms: PlatformData[];
  enemies: EnemySpawn[];
  npcs: NPCData[];
  powerUps: PowerUpSpawn[];
  papers: PaperSpawn[];
  checkpoints: CheckpointData[];
  boss: BossConfig;
  playerStart: { x: number; y: number };
  background: string;
  themeColor: number;
  music: string;
}
