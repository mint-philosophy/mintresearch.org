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
export const PLAYER_SPEED = 320;
export const PLAYER_JUMP = -350;
export const PLAYER_MAX_HEALTH = 200;
export const PLAYER_LIVES = 5;

// Paper ammunition (replaces ink)
export const PAPER_AMMO_PER_COLLECT = 5;
export const PAPER_PROJECTILE_SPEED = 400;
export const PAPER_FIRE_COOLDOWN = 300;
export const PAPER_RANGE_BASE = 100;
export const PAPER_RANGE_PER_5 = 20;
export const PAPER_RANGE_CAP = 300;
export const GOLD_PAPER_RANGE_BONUS = 50;

// Double jump
export const MAX_JUMPS = 2;
export const DOUBLE_JUMP_FORCE_MULT = 0.8;

// Clawd companion
export const CLAWD_FIRE_INTERVAL = 500;
export const CLAWD_DURATION = 10000;
export const CLAWD_RANGE = 200;
export const CLAWD_PROJECTILE_SPEED = 350;

// Papers
export const PAPER_HEAL = 5;
export const PAPER_SCORE = 100;

// Damage
export const SLOP_DAMAGE = 15;
export const CONTACT_DAMAGE = 10;
export const BOSS_JUMP_DAMAGE = 20;
export const BOSS_SHOCKWAVE_RANGE = 80;
export const BOSS_ENVELOP_DAMAGE = 40;
export const BOSS_FAKE_PAPER_DAMAGE = 15;
export const BOSS_VACUUM_RANGE = 200;

// Enemies
export const ENEMY_TIERS = {
  peach: { hp: 1, speed: 40, slopInterval: 3000, score: 10 },
  red:   { hp: 2, speed: 70, slopInterval: 2000, score: 25 },
  orange:{ hp: 3, speed: 100, slopInterval: 2500, score: 50 },
} as const;

// Power-ups
export const POWERUP_DURATION = {
  shield: 15000,
  openai: 15000,
  speedBolt: 18000,
  ssi: 10000,
  deepseek: 20000,
  goldenGate: 15000,
  jetpack: 12000,
  nvidia: 0,
} as const;

// Power-downs
export const POWERDOWN_DURATION = {
  clippy: 8000,
  fogCloud: 8000,
  grok: 8000,
  copilot: 10000,
  meta: 10000,
  qwen: 0,
  openclaw: 12000,
  apple: 3000,
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
  7: { name: 'YouTube',        color: 0xFF0000, bg: '#180808' },
  8: { name: 'NeurIPS',        color: 0x87CEFA, bg: '#060b19' },
  9: { name: 'San Francisco',  color: 0xFF9416, bg: '#050714' },
  10: { name: 'Mega Datacenter', color: 0x8bc34a, bg: '#04050a' },
  11: { name: 'Chip Foundry', color: 0x4fd1c5, bg: '#061416' },
  12: { name: 'Wall Street AI Bubble', color: 0x22c55e, bg: '#081208' },
  13: { name: 'Congressional Hearing', color: 0xf59e0b, bg: '#17110a' },
  14: { name: 'Brussels AI Act Maze', color: 0x2563eb, bg: '#08111f' },
  15: { name: 'Desert Compute Campus', color: 0xf97316, bg: '#1b1107' },
  16: { name: 'Robotaxi City', color: 0xfacc15, bg: '#11130a' },
  17: { name: 'Undersea Cable Trench', color: 0x06b6d4, bg: '#02131b' },
  18: { name: 'Low-Earth Orbit', color: 0x94a3b8, bg: '#030511' },
  19: { name: 'Synthetic Media Studio', color: 0xec4899, bg: '#130612' },
  20: { name: 'War Claude', color: 0xb91c1c, bg: '#110707' },
  21: { name: 'The Weights', color: 0xa855f7, bg: '#05050b' },
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
  7: 'platform-youtube',
  8: 'platform-neurips',
  9: 'platform-sf',
  10: 'platform-datacenter',
  11: 'platform-foundry',
  12: 'platform-wallstreet',
  13: 'platform-hearing',
  14: 'platform-brussels',
  15: 'platform-desert',
  16: 'platform-robotaxi',
  17: 'platform-undersea',
  18: 'platform-orbit',
  19: 'platform-studio',
  20: 'platform-warclaude',
  21: 'platform-weights',
};

// Enemy death text per level
export const DEATH_TEXTS: Record<number, string[]> = {
  1: ['RATIO\'D', 'BLOCKED', 'MUTED', 'L + RATIO', 'REPORTED'],
  2: ['ENDORSED', 'OUT OF NETWORK', 'CONNECTION REMOVED', 'UNFOLLOWED'],
  3: ['DEFEDERATED', 'SKEET DELETED', 'MODLISTED', 'BLOCKED'],
  4: ['RETRACTED', 'DESK REJECT', 'PEER REVIEWED', 'REJECTED'],
  5: ['REFUTED', 'COUNTEREXAMPLE', 'MODUS TOLLENS', 'REDUCTIO'],
  6: ['403 FORBIDDEN', 'RATE LIMITED', 'CAPTCHA FAILED', 'IP BANNED'],
  7: ['DEMONETIZED', 'COMMENT REMOVED', 'AGE RESTRICTED', 'SKIPPED AD'],
  8: ['PAPER TRAIL BURNED', 'PEER REVIEWED', 'LINKED OUT', 'FUNDING REVOKED'],
  9: ['NO DATACENTER', 'GOLDEN GATE BOUNCE', 'BRIDGE BURNED', 'PAUSE AI FALL'],
  10: ['GPU OVERLOAD', 'BERNIE STARE', 'RACK MELTDOWN', 'ULTRA SHOCK'],
  11: ['WAFER CRACKED', 'YIELD LOSS', 'PHOTORESIST RUINED', 'CLEANROOM EJECTED'],
  12: ['MARGIN CALLED', 'BUBBLE POPPED', 'SHORTED', 'TRADING HALTED'],
  13: ['RECORDED FOR THE RECORD', 'MIC CUT', 'TIME EXPIRED', 'UNDER OATH'],
  14: ['NON-COMPLIANT', 'ARTICLE 52', 'RISK-TIERED', 'STAMPED'],
  15: ['HEAT SOAKED', 'WATER DRAWN DOWN', 'MIRAGE SHATTERED', 'COOLANT LOSS'],
  16: ['ROUTE RECOMPUTED', 'LIDAR SPIKED', 'FLEET RECALLED', 'TRAFFIC LOCK'],
  17: ['CURRENT TOOK YOU', 'CABLE CUT', 'NETTED', 'PRESSURE LOSS'],
  18: ['DEORBITED', 'TELEMETRY LOST', 'VACUUMED', 'STAGE SEPARATED'],
  19: ['WATERMARKED', 'FACE SWAP FAILED', 'CLAPPERBOARD CUT', 'DETECTED'],
  20: ['TARGET LOCK BROKEN', 'SORTIE DENIED', 'MAVEN BLIND', 'NO STRIKE'],
  21: ['WEIGHTS COLLAPSED', 'LATENT SPACE TORN', 'GRADIENT SHOCK', 'STACK UNWOUND'],
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
  CREDITS: 'Credits',
} as const;

// Types
export type MintyColor = typeof MINTY_COLORS[number];
export type EnemyTier = keyof typeof ENEMY_TIERS;
export type PowerUpType = keyof typeof POWERUP_DURATION;
export type PowerDownType = keyof typeof POWERDOWN_DURATION | 'dataLeak';
export type LevelNumber =
  1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
  11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21;

export interface PlatformData {
  x: number;
  y: number;
  width: number;
  type?: 'normal' | 'moving' | 'crumbling' | 'quicksand';
  moveRange?: number;
  moveSpeed?: number;
}

export interface EnemySpawn {
  type: 'octopus' | 'troll' | 'influencer' | 'critic' | 'paperFlood' | 'cloudflareWall' | 'parrot' | 'macII' | 'meanComment' | 'ventureCapitalist' | 'bciOctopus' | 'zuckerberg' | 'waterWave' | 'nuclearReactor' | 'gasBottle';
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
  size?: number; // sprite size in pixels
}

// Boss sizes (progressive)
export const BOSS_SIZES: Record<string, number> = {
  algorithmVortex: 96,
  engagementKing: 128,
  forkSwarm: 160,
  paperMill: 192,
  theVoid: 240,
  shoggoth: 240,
  angryNeckbeard: 160,
  schmidhuber: 200,
  pauseSign: 220,
  bernie: 220,
  euvScanner: 200,
  marketMaker: 200,
  hearingDais: 220,
  aiActBinder: 220,
  mirrorTower: 220,
  robotaxi: 200,
  trawlerNet: 220,
  launchVehicle: 220,
  deepfakeDirector: 200,
  warClaude: 220,
  weightsCore: 240,
};

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
