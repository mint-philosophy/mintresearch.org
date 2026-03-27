import type {
  BossConfig,
  CheckpointData,
  EnemySpawn,
  EnemyTier,
  LevelConfig,
  MintyColor,
  NPCData,
  PaperSpawn,
  PlatformData,
  PowerUpSpawn,
} from '../constants';
import { GAME_HEIGHT } from '../constants';

function fromBottom(offset: number): number {
  return GAME_HEIGHT - offset;
}

function makePlatforms(
  heights: number[],
  widths: number[],
  startX: number = 160,
  gaps: number[] = [280, 300, 320]
): PlatformData[] {
  let x = startX;
  return heights.map((height, index) => {
    const platform = {
      x,
      y: fromBottom(height),
      width: widths[index % widths.length],
    };
    x += gaps[index % gaps.length];
    return platform;
  });
}

function platformPick(platforms: PlatformData[], index: number): PlatformData {
  return platforms[Math.max(0, Math.min(index, platforms.length - 1))];
}

function paperTrail(platforms: PlatformData[], goldIndexes: number[] = [], extraGroundXs: number[] = []): PaperSpawn[] {
  const gold = new Set(goldIndexes);
  const papers = platforms.map((platform, index) => ({
    x: platform.x + Math.max(40, Math.min(platform.width - 40, Math.round(platform.width * 0.38))),
    y: platform.y - 34 - (index % 4 === 0 ? 10 : 0),
    isGold: gold.has(index),
  }));

  extraGroundXs.forEach((x, index) => {
    papers.push({
      x,
      y: fromBottom(98 + (index % 2) * 18),
    });
  });

  return papers;
}

function powerPads(platforms: PlatformData[], indexes: number[]): PowerUpSpawn[] {
  return indexes.map((index, order) => {
    const platform = platformPick(platforms, index);
    return {
      type: order % 2 === 0 ? 'shield' : 'openai',
      x: platform.x + Math.max(36, Math.min(platform.width - 32, Math.round(platform.width * 0.45))),
      y: platform.y - 48,
    };
  });
}

function fixedPickup(platforms: PlatformData[], index: number, type: PowerUpSpawn['type']): PowerUpSpawn {
  const platform = platformPick(platforms, index);
  return {
    type,
    x: platform.x + Math.max(36, Math.min(platform.width - 32, Math.round(platform.width * 0.52))),
    y: platform.y - 54,
  };
}

function checkpoints(platforms: PlatformData[], indexes: number[]): CheckpointData[] {
  return indexes.map((index) => ({
    x: platformPick(platforms, index).x + 40,
    y: fromBottom(50),
  }));
}

function npc(color: MintyColor, x: number, dialogueKey: string): NPCData {
  return { color, x, y: fromBottom(60), dialogueKey };
}

function groundEnemy(type: EnemySpawn['type'], x: number, tier: EnemyTier = 'red', patrolRange: number = 120): EnemySpawn {
  return {
    type,
    x,
    y: fromBottom(64),
    tier,
    patrolRange,
  };
}

function platformEnemy(
  platforms: PlatformData[],
  index: number,
  type: EnemySpawn['type'],
  tier: EnemyTier = 'red',
  patrolRange: number = 90,
  xRatio: number = 0.45,
  yLift: number = 40
): EnemySpawn {
  const platform = platformPick(platforms, index);
  return {
    type,
    x: platform.x + Math.max(28, Math.min(platform.width - 28, Math.round(platform.width * xRatio))),
    y: platform.y - yLift,
    tier,
    patrolRange,
  };
}

function levelWidth(platforms: PlatformData[], bossPadding: number = 760): number {
  return platformPick(platforms, platforms.length - 1).x + bossPadding;
}

function config(
  number: LevelConfig['number'],
  name: string,
  background: string,
  themeColor: number,
  music: string,
  platforms: PlatformData[],
  enemies: EnemySpawn[],
  powerUps: PowerUpSpawn[],
  papers: PaperSpawn[],
  npcs: NPCData[],
  checkpointsList: CheckpointData[],
  boss: Omit<BossConfig, 'x' | 'y'>
): LevelConfig {
  const width = levelWidth(platforms);
  return {
    number,
    name,
    width,
    background,
    themeColor,
    music,
    playerStart: { x: 80, y: fromBottom(70) },
    platforms,
    enemies,
    powerUps,
    papers,
    npcs,
    checkpoints: checkpointsList,
    boss: {
      ...boss,
      x: width - 220,
      y: fromBottom(90),
    },
  };
}

export function getLevel11Config(): LevelConfig {
  const platforms = makePlatforms(
    [110, 220, 150, 280, 170, 250, 140, 300, 160, 240, 130, 290, 180, 260, 150, 320, 170, 250, 140, 300, 160, 230, 140, 290, 170, 240],
    [220, 180, 240, 200],
    170,
    [280, 310, 300]
  );
  return config(
    11,
    'Chip Foundry',
    '#061416',
    0x4fd1c5,
    'level11',
    platforms,
    [
      groundEnemy('octopus', 360, 'red', 150),
      platformEnemy(platforms, 1, 'paperFlood', 'peach', 0, 0.55, 44),
      platformEnemy(platforms, 3, 'macII', 'red', 80, 0.52, 44),
      groundEnemy('cloudflareWall', 1460, 'peach', 0),
      platformEnemy(platforms, 6, 'octopus', 'orange', 120, 0.48, 42),
      groundEnemy('paperFlood', 2320, 'red', 70),
      platformEnemy(platforms, 9, 'macII', 'red', 90, 0.5, 44),
      groundEnemy('octopus', 3180, 'orange', 160),
      platformEnemy(platforms, 13, 'paperFlood', 'red', 70, 0.48, 44),
      groundEnemy('cloudflareWall', 4300, 'peach', 0),
      platformEnemy(platforms, 17, 'octopus', 'orange', 130, 0.52, 42),
      groundEnemy('macII', 5480, 'red', 90),
      platformEnemy(platforms, 21, 'paperFlood', 'red', 80, 0.45, 44),
      groundEnemy('octopus', 6640, 'orange', 170),
      platformEnemy(platforms, 24, 'octopus', 'orange', 120, 0.5, 42),
    ],
    powerPads(platforms, [1, 5, 9, 13, 17, 21, 24]),
    paperTrail(platforms, [4, 8, 13, 18, 23], [1180, 3920, 6740]),
    [npc('green', 240, 'l11-green')],
    checkpoints(platforms, [4, 10, 16, 22]),
    { type: 'euvScanner', phases: 3, hp: 20 }
  );
}

export function getLevel12Config(): LevelConfig {
  const platforms = makePlatforms(
    [100, 200, 130, 250, 160, 290, 140, 220, 120, 280, 170, 240, 130, 300, 160, 220, 140, 270, 180, 230, 140, 310, 170, 250, 150, 290],
    [240, 170, 220, 190],
    160,
    [290, 320, 280]
  );
  return config(
    12,
    'Wall Street AI Bubble',
    '#081208',
    0x22c55e,
    'level12',
    platforms,
    [
      groundEnemy('ventureCapitalist', 340, 'red', 70),
      platformEnemy(platforms, 2, 'influencer', 'red', 90, 0.5, 42),
      groundEnemy('octopus', 1100, 'red', 160),
      platformEnemy(platforms, 5, 'ventureCapitalist', 'orange', 80, 0.48, 42),
      groundEnemy('paperFlood', 2040, 'red', 60),
      platformEnemy(platforms, 8, 'influencer', 'red', 90, 0.55, 42),
      groundEnemy('octopus', 2920, 'orange', 170),
      platformEnemy(platforms, 12, 'ventureCapitalist', 'orange', 80, 0.45, 42),
      groundEnemy('influencer', 3860, 'red', 90),
      platformEnemy(platforms, 16, 'octopus', 'orange', 120, 0.5, 42),
      groundEnemy('ventureCapitalist', 4820, 'orange', 70),
      platformEnemy(platforms, 20, 'paperFlood', 'red', 60, 0.48, 42),
      groundEnemy('octopus', 5880, 'orange', 160),
      platformEnemy(platforms, 24, 'ventureCapitalist', 'orange', 80, 0.52, 42),
    ],
    powerPads(platforms, [2, 6, 10, 14, 18, 22, 25]).concat([
      fixedPickup(platforms, 16, 'jetpack'),
    ]),
    paperTrail(platforms, [3, 9, 14, 19, 24], [1510, 4480, 7020]),
    [npc('yellow', 260, 'l12-yellow')],
    checkpoints(platforms, [4, 10, 16, 22]),
    { type: 'marketMaker', phases: 3, hp: 21 }
  );
}

export function getLevel13Config(): LevelConfig {
  const platforms = makePlatforms(
    [120, 230, 150, 300, 170, 240, 140, 310, 160, 220, 130, 290, 180, 250, 150, 320, 170, 230, 140, 300, 160, 240, 130, 290, 180, 250],
    [210, 180, 250, 200],
    170,
    [280, 320, 300]
  );
  return config(
    13,
    'Congressional Hearing',
    '#17110a',
    0xf59e0b,
    'level13',
    platforms,
    [
      groundEnemy('critic', 320, 'red', 90),
      platformEnemy(platforms, 1, 'troll', 'red', 80, 0.48, 42),
      groundEnemy('cloudflareWall', 1220, 'peach', 0),
      platformEnemy(platforms, 4, 'octopus', 'orange', 120, 0.52, 42),
      groundEnemy('critic', 2060, 'orange', 90),
      platformEnemy(platforms, 8, 'troll', 'red', 80, 0.46, 42),
      groundEnemy('cloudflareWall', 3020, 'peach', 0),
      platformEnemy(platforms, 11, 'octopus', 'orange', 130, 0.5, 42),
      groundEnemy('critic', 3980, 'orange', 90),
      platformEnemy(platforms, 15, 'troll', 'red', 80, 0.48, 42),
      groundEnemy('cloudflareWall', 4900, 'peach', 0),
      platformEnemy(platforms, 19, 'octopus', 'orange', 130, 0.52, 42),
      groundEnemy('critic', 5860, 'orange', 100),
      platformEnemy(platforms, 23, 'troll', 'red', 90, 0.45, 42),
    ],
    powerPads(platforms, [1, 5, 9, 13, 17, 21, 24]),
    paperTrail(platforms, [5, 10, 15, 20, 24], [920, 3520, 6280]),
    [npc('purple', 250, 'l13-purple')],
    checkpoints(platforms, [4, 10, 16, 22]),
    { type: 'hearingDais', phases: 3, hp: 22 }
  );
}

export function getLevel14Config(): LevelConfig {
  const platforms = makePlatforms(
    [110, 250, 140, 300, 170, 220, 150, 320, 180, 240, 130, 300, 170, 250, 140, 330, 160, 230, 150, 310, 180, 250, 140, 320, 170, 240],
    [190, 220, 170, 240],
    160,
    [280, 300, 310]
  );
  return config(
    14,
    'Brussels AI Act Maze',
    '#08111f',
    0x2563eb,
    'level14',
    platforms,
    [
      groundEnemy('cloudflareWall', 380, 'peach', 0),
      platformEnemy(platforms, 2, 'critic', 'red', 80, 0.5, 42),
      groundEnemy('octopus', 1240, 'red', 150),
      platformEnemy(platforms, 5, 'paperFlood', 'red', 70, 0.48, 44),
      groundEnemy('cloudflareWall', 2060, 'peach', 0),
      platformEnemy(platforms, 8, 'octopus', 'orange', 130, 0.5, 42),
      groundEnemy('critic', 2960, 'orange', 90),
      platformEnemy(platforms, 12, 'paperFlood', 'red', 70, 0.45, 44),
      groundEnemy('cloudflareWall', 3900, 'peach', 0),
      platformEnemy(platforms, 16, 'octopus', 'orange', 130, 0.52, 42),
      groundEnemy('critic', 4840, 'orange', 100),
      platformEnemy(platforms, 20, 'paperFlood', 'red', 70, 0.46, 44),
      groundEnemy('cloudflareWall', 5800, 'peach', 0),
      platformEnemy(platforms, 24, 'octopus', 'orange', 140, 0.5, 42),
    ],
    powerPads(platforms, [2, 6, 10, 14, 18, 22, 25]).concat([
      fixedPickup(platforms, 14, 'jetpack'),
    ]),
    paperTrail(platforms, [4, 9, 14, 19, 24], [1580, 4380, 7060]),
    [npc('indigo', 240, 'l14-indigo')],
    checkpoints(platforms, [4, 10, 16, 22]),
    { type: 'aiActBinder', phases: 4, hp: 24 }
  );
}

export function getLevel15Config(): LevelConfig {
  const platforms = makePlatforms(
    [120, 180, 140, 260, 150, 220, 130, 300, 170, 210, 140, 280, 160, 230, 130, 320, 180, 220, 150, 290, 170, 240, 140, 310, 180, 250],
    [230, 190, 250, 200],
    170,
    [290, 310, 300]
  );
  return config(
    15,
    'Desert Compute Campus',
    '#1b1107',
    0xf97316,
    'level15',
    platforms,
    [
      groundEnemy('waterWave', 360, 'peach', 0),
      platformEnemy(platforms, 1, 'gasBottle', 'red', 0, 0.5, 46),
      groundEnemy('octopus', 1260, 'orange', 160),
      platformEnemy(platforms, 5, 'ventureCapitalist', 'red', 80, 0.48, 42),
      groundEnemy('nuclearReactor', 2260, 'red', 0),
      platformEnemy(platforms, 8, 'octopus', 'orange', 140, 0.52, 42),
      groundEnemy('gasBottle', 3280, 'red', 0),
      platformEnemy(platforms, 12, 'ventureCapitalist', 'orange', 80, 0.46, 42),
      groundEnemy('waterWave', 4320, 'peach', 0),
      platformEnemy(platforms, 16, 'octopus', 'orange', 150, 0.5, 42),
      groundEnemy('nuclearReactor', 5360, 'red', 0),
      platformEnemy(platforms, 20, 'ventureCapitalist', 'orange', 80, 0.46, 42),
      groundEnemy('gasBottle', 6420, 'red', 0),
      platformEnemy(platforms, 24, 'octopus', 'orange', 150, 0.52, 42),
    ],
    powerPads(platforms, [1, 5, 9, 13, 17, 21, 25]),
    paperTrail(platforms, [3, 8, 13, 18, 23], [1080, 4100, 6880]),
    [npc('red', 250, 'l15-red')],
    checkpoints(platforms, [4, 10, 16, 22]),
    { type: 'mirrorTower', phases: 4, hp: 24 }
  );
}

export function getLevel16Config(): LevelConfig {
  const platforms = makePlatforms(
    [90, 170, 120, 210, 150, 180, 110, 240, 130, 200, 120, 260, 160, 190, 130, 280, 150, 210, 120, 260, 160, 190, 130, 280, 150, 220],
    [240, 180, 220, 200],
    170,
    [290, 300, 320]
  );
  return config(
    16,
    'Robotaxi City',
    '#11130a',
    0xfacc15,
    'level16',
    platforms,
    [
      groundEnemy('meanComment', 380, 'red', 0),
      platformEnemy(platforms, 2, 'octopus', 'orange', 140, 0.48, 42),
      groundEnemy('ventureCapitalist', 1300, 'red', 70),
      platformEnemy(platforms, 6, 'zuckerberg', 'red', 40, 0.5, 42),
      groundEnemy('meanComment', 2280, 'red', 0),
      platformEnemy(platforms, 10, 'octopus', 'orange', 150, 0.52, 42),
      groundEnemy('ventureCapitalist', 3300, 'orange', 70),
      platformEnemy(platforms, 14, 'zuckerberg', 'red', 40, 0.48, 42),
      groundEnemy('meanComment', 4340, 'red', 0),
      platformEnemy(platforms, 18, 'octopus', 'orange', 150, 0.5, 42),
      groundEnemy('ventureCapitalist', 5420, 'orange', 70),
      platformEnemy(platforms, 22, 'zuckerberg', 'red', 40, 0.52, 42),
      groundEnemy('meanComment', 6540, 'red', 0),
      platformEnemy(platforms, 25, 'octopus', 'orange', 150, 0.48, 42),
    ],
    powerPads(platforms, [2, 6, 10, 14, 18, 22, 25]).concat([
      fixedPickup(platforms, 18, 'jetpack'),
    ]),
    paperTrail(platforms, [4, 9, 14, 19, 24], [1460, 4600, 7260]),
    [npc('cool', 250, 'l16-cool')],
    checkpoints(platforms, [4, 10, 16, 22]),
    { type: 'robotaxi', phases: 4, hp: 26 }
  );
}

export function getLevel17Config(): LevelConfig {
  const platforms = makePlatforms(
    [130, 220, 170, 280, 180, 240, 150, 310, 190, 260, 160, 330, 180, 250, 150, 320, 190, 270, 170, 340, 190, 250, 150, 310, 180, 260],
    [210, 180, 240, 200],
    170,
    [290, 310, 300]
  );
  return config(
    17,
    'Undersea Cable Trench',
    '#02131b',
    0x06b6d4,
    'level17',
    platforms,
    [
      groundEnemy('waterWave', 340, 'peach', 0),
      platformEnemy(platforms, 1, 'gasBottle', 'red', 0, 0.5, 48),
      groundEnemy('octopus', 1280, 'red', 160),
      platformEnemy(platforms, 5, 'meanComment', 'red', 0, 0.48, 96),
      groundEnemy('waterWave', 2260, 'peach', 0),
      platformEnemy(platforms, 9, 'gasBottle', 'red', 0, 0.52, 48),
      groundEnemy('octopus', 3320, 'orange', 170),
      platformEnemy(platforms, 13, 'meanComment', 'red', 0, 0.46, 96),
      groundEnemy('waterWave', 4380, 'peach', 0),
      platformEnemy(platforms, 17, 'gasBottle', 'red', 0, 0.5, 48),
      groundEnemy('octopus', 5440, 'orange', 170),
      platformEnemy(platforms, 21, 'meanComment', 'red', 0, 0.48, 96),
      groundEnemy('waterWave', 6500, 'peach', 0),
      platformEnemy(platforms, 24, 'octopus', 'orange', 170, 0.52, 42),
    ],
    powerPads(platforms, [1, 5, 9, 13, 17, 21, 25]),
    paperTrail(platforms, [4, 9, 14, 19, 24], [1160, 4200, 7060]),
    [npc('teal', 250, 'l17-teal')],
    checkpoints(platforms, [4, 10, 16, 22]),
    { type: 'trawlerNet', phases: 4, hp: 28 }
  );
}

export function getLevel18Config(): LevelConfig {
  const platforms = makePlatforms(
    [150, 260, 200, 320, 210, 280, 180, 340, 220, 300, 170, 360, 210, 280, 180, 340, 220, 310, 170, 360, 220, 290, 180, 350, 230, 320],
    [200, 170, 220, 190],
    170,
    [300, 320, 310]
  );
  return config(
    18,
    'Low-Earth Orbit',
    '#030511',
    0x94a3b8,
    'level18',
    platforms,
    [
      platformEnemy(platforms, 1, 'parrot', 'red', 80, 0.5, 70),
      platformEnemy(platforms, 3, 'meanComment', 'red', 0, 0.48, 110),
      platformEnemy(platforms, 5, 'bciOctopus', 'orange', 0, 0.5, 42),
      platformEnemy(platforms, 7, 'octopus', 'orange', 150, 0.52, 42),
      platformEnemy(platforms, 10, 'parrot', 'orange', 90, 0.48, 70),
      platformEnemy(platforms, 12, 'meanComment', 'red', 0, 0.46, 110),
      platformEnemy(platforms, 14, 'bciOctopus', 'orange', 0, 0.5, 42),
      platformEnemy(platforms, 16, 'octopus', 'orange', 150, 0.52, 42),
      platformEnemy(platforms, 19, 'parrot', 'orange', 90, 0.48, 70),
      platformEnemy(platforms, 21, 'meanComment', 'red', 0, 0.5, 110),
      platformEnemy(platforms, 23, 'bciOctopus', 'orange', 0, 0.46, 42),
      platformEnemy(platforms, 25, 'octopus', 'orange', 150, 0.5, 42),
    ],
    powerPads(platforms, [2, 6, 10, 14, 18, 22, 25]).concat([
      fixedPickup(platforms, 17, 'jetpack'),
    ]),
    paperTrail(platforms, [3, 8, 13, 18, 23], [1720, 5000, 7620]),
    [npc('indigo', 250, 'l18-indigo')],
    checkpoints(platforms, [4, 10, 16, 22]),
    { type: 'launchVehicle', phases: 4, hp: 30 }
  );
}

export function getLevel19Config(): LevelConfig {
  const platforms = makePlatforms(
    [110, 230, 160, 300, 180, 240, 150, 320, 170, 230, 140, 310, 180, 250, 150, 330, 180, 240, 150, 320, 170, 260, 140, 310, 180, 240],
    [220, 180, 240, 200],
    170,
    [290, 310, 300]
  );
  return config(
    19,
    'Synthetic Media Studio',
    '#130612',
    0xec4899,
    'level19',
    platforms,
    [
      groundEnemy('influencer', 340, 'red', 90),
      platformEnemy(platforms, 1, 'meanComment', 'red', 0, 0.5, 96),
      groundEnemy('bciOctopus', 1260, 'orange', 0),
      platformEnemy(platforms, 5, 'troll', 'red', 80, 0.48, 42),
      groundEnemy('paperFlood', 2260, 'red', 70),
      platformEnemy(platforms, 9, 'influencer', 'orange', 90, 0.52, 42),
      groundEnemy('bciOctopus', 3300, 'orange', 0),
      platformEnemy(platforms, 13, 'meanComment', 'red', 0, 0.46, 96),
      groundEnemy('troll', 4340, 'orange', 80),
      platformEnemy(platforms, 17, 'paperFlood', 'red', 70, 0.5, 44),
      groundEnemy('influencer', 5400, 'orange', 90),
      platformEnemy(platforms, 21, 'meanComment', 'red', 0, 0.48, 96),
      groundEnemy('bciOctopus', 6460, 'orange', 0),
      platformEnemy(platforms, 24, 'troll', 'orange', 80, 0.52, 42),
    ],
    powerPads(platforms, [1, 5, 9, 13, 17, 21, 25]),
    paperTrail(platforms, [4, 9, 14, 19, 24], [1180, 4180, 7100]),
    [npc('purple', 250, 'l19-purple')],
    checkpoints(platforms, [4, 10, 16, 22]),
    { type: 'deepfakeDirector', phases: 4, hp: 30 }
  );
}

export function getLevel20Config(): LevelConfig {
  const platforms = makePlatforms(
    [120, 250, 170, 320, 180, 260, 150, 340, 190, 250, 160, 330, 180, 270, 150, 350, 190, 260, 170, 340, 190, 270, 160, 350, 200, 280],
    [220, 180, 240, 200],
    170,
    [300, 320, 310]
  );
  return config(
    20,
    'War Claude',
    '#110707',
    0xb91c1c,
    'level20',
    platforms,
    [
      groundEnemy('octopus', 360, 'orange', 170),
      platformEnemy(platforms, 1, 'parrot', 'orange', 90, 0.5, 70),
      groundEnemy('cloudflareWall', 1320, 'peach', 0),
      platformEnemy(platforms, 5, 'meanComment', 'red', 0, 0.48, 100),
      groundEnemy('octopus', 2360, 'orange', 180),
      platformEnemy(platforms, 9, 'parrot', 'orange', 90, 0.52, 70),
      groundEnemy('cloudflareWall', 3400, 'peach', 0),
      platformEnemy(platforms, 13, 'meanComment', 'red', 0, 0.46, 100),
      groundEnemy('octopus', 4460, 'orange', 180),
      platformEnemy(platforms, 17, 'parrot', 'orange', 90, 0.5, 70),
      groundEnemy('cloudflareWall', 5520, 'peach', 0),
      platformEnemy(platforms, 21, 'meanComment', 'red', 0, 0.48, 100),
      groundEnemy('octopus', 6620, 'orange', 190),
      platformEnemy(platforms, 24, 'parrot', 'orange', 90, 0.52, 70),
    ],
    powerPads(platforms, [2, 6, 10, 14, 18, 22, 25]).concat([
      fixedPickup(platforms, 20, 'jetpack'),
    ]),
    paperTrail(platforms, [4, 9, 14, 19, 24], [1660, 4740, 7720]),
    [npc('red', 250, 'l20-red')],
    checkpoints(platforms, [4, 10, 16, 22]),
    { type: 'warClaude', phases: 5, hp: 34 }
  );
}

export function getLevel21Config(): LevelConfig {
  const platforms = makePlatforms(
    [130, 270, 180, 330, 200, 260, 170, 360, 210, 280, 180, 350, 200, 290, 170, 370, 220, 300, 180, 360, 210, 290, 180, 370, 220, 320],
    [230, 180, 250, 200],
    170,
    [310, 330, 320]
  );
  return config(
    21,
    'The Weights',
    '#05050b',
    0xa855f7,
    'level21',
    platforms,
    [
      groundEnemy('octopus', 360, 'orange', 180),
      platformEnemy(platforms, 1, 'meanComment', 'red', 0, 0.5, 102),
      groundEnemy('ventureCapitalist', 1380, 'orange', 80),
      platformEnemy(platforms, 4, 'bciOctopus', 'orange', 0, 0.48, 42),
      groundEnemy('waterWave', 2440, 'peach', 0),
      platformEnemy(platforms, 7, 'parrot', 'orange', 90, 0.5, 70),
      groundEnemy('gasBottle', 3520, 'red', 0),
      platformEnemy(platforms, 10, 'octopus', 'orange', 180, 0.52, 42),
      groundEnemy('meanComment', 4580, 'red', 0),
      platformEnemy(platforms, 13, 'ventureCapitalist', 'orange', 80, 0.46, 42),
      groundEnemy('waterWave', 5660, 'peach', 0),
      platformEnemy(platforms, 16, 'bciOctopus', 'orange', 0, 0.5, 42),
      groundEnemy('gasBottle', 6740, 'red', 0),
      platformEnemy(platforms, 19, 'parrot', 'orange', 90, 0.48, 70),
      groundEnemy('meanComment', 7840, 'red', 0),
      platformEnemy(platforms, 22, 'octopus', 'orange', 190, 0.52, 42),
      groundEnemy('ventureCapitalist', 8920, 'orange', 80),
      platformEnemy(platforms, 25, 'bciOctopus', 'orange', 0, 0.48, 42),
    ],
    powerPads(platforms, [2, 6, 10, 14, 18, 22, 25]),
    paperTrail(platforms, [4, 9, 14, 19, 24], [1820, 5120, 8380]),
    [npc('cool', 260, 'l21-cool')],
    checkpoints(platforms, [4, 10, 16, 22]),
    { type: 'weightsCore', phases: 5, hp: 40 }
  );
}
