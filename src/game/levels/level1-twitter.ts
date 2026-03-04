import type { LevelConfig } from '../constants';
import { GAME_HEIGHT } from '../constants';

export function getLevel1Config(): LevelConfig {
  return {
    number: 1,
    name: 'X (Twitter)',
    width: 3200,
    background: '#0d1117',
    themeColor: 0x1DA1F2,
    music: 'level1',
    playerStart: { x: 80, y: GAME_HEIGHT - 60 },
    platforms: [
      { x: 200, y: GAME_HEIGHT - 100, width: 192 },
      { x: 450, y: GAME_HEIGHT - 160, width: 128 },
      { x: 650, y: GAME_HEIGHT - 120, width: 192 },
      { x: 900, y: GAME_HEIGHT - 200, width: 128 },
      { x: 1100, y: GAME_HEIGHT - 140, width: 256 },
      { x: 1400, y: GAME_HEIGHT - 180, width: 128 },
      { x: 1600, y: GAME_HEIGHT - 100, width: 192 },
      { x: 1850, y: GAME_HEIGHT - 220, width: 128 },
      { x: 2050, y: GAME_HEIGHT - 160, width: 256 },
      { x: 2350, y: GAME_HEIGHT - 200, width: 128 },
      { x: 2550, y: GAME_HEIGHT - 120, width: 192 },
      { x: 2800, y: GAME_HEIGHT - 180, width: 256 },
    ],
    enemies: [
      { type: 'octopus', x: 500, y: GAME_HEIGHT - 200, tier: 'peach', patrolRange: 80 },
      { type: 'troll', x: 750, y: GAME_HEIGHT - 50, tier: 'peach', patrolRange: 60 },
      { type: 'octopus', x: 1000, y: GAME_HEIGHT - 50, tier: 'peach', patrolRange: 100 },
      { type: 'troll', x: 1250, y: GAME_HEIGHT - 50, tier: 'peach', patrolRange: 80 },
      { type: 'octopus', x: 1500, y: GAME_HEIGHT - 50, tier: 'red', patrolRange: 100 },
      { type: 'octopus', x: 1900, y: GAME_HEIGHT - 260, tier: 'peach', patrolRange: 60 },
      { type: 'troll', x: 2200, y: GAME_HEIGHT - 50, tier: 'peach', patrolRange: 100 },
      { type: 'octopus', x: 2600, y: GAME_HEIGHT - 160, tier: 'red', patrolRange: 80 },
    ],
    papers: [
      { x: 250, y: GAME_HEIGHT - 130 },
      { x: 480, y: GAME_HEIGHT - 190 },
      { x: 700, y: GAME_HEIGHT - 150 },
      { x: 950, y: GAME_HEIGHT - 230 },
      { x: 1200, y: GAME_HEIGHT - 170 },
      { x: 1450, y: GAME_HEIGHT - 210 },
      { x: 1700, y: GAME_HEIGHT - 130 },
      { x: 1900, y: GAME_HEIGHT - 250 },
      { x: 2100, y: GAME_HEIGHT - 190 },
      { x: 2400, y: GAME_HEIGHT - 230 },
      { x: 2600, y: GAME_HEIGHT - 150 },
      { x: 2850, y: GAME_HEIGHT - 210, isGold: true },
    ],
    powerUps: [
      { type: 'shield', x: 900, y: GAME_HEIGHT - 240 },
      { type: 'clippy', x: 1600, y: GAME_HEIGHT - 140 },
      { type: 'speedBolt', x: 2350, y: GAME_HEIGHT - 240 },
    ],
    npcs: [
      { color: 'green', x: 350, y: GAME_HEIGHT - 60, dialogueKey: 'l1-green' },
    ],
    checkpoints: [
      { x: 1100, y: GAME_HEIGHT - 50 },
      { x: 2200, y: GAME_HEIGHT - 50 },
    ],
    boss: {
      type: 'algorithmVortex',
      x: 3000,
      y: GAME_HEIGHT - 80,
      phases: 3,
      hp: 10,
    },
  };
}
