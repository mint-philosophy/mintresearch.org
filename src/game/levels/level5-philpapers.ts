import type { LevelConfig } from '../constants';
import { GAME_HEIGHT } from '../constants';

export function getLevel5Config(): LevelConfig {
  return {
    number: 5,
    name: 'PhilPapers',
    width: 4400,
    background: '#0a0a14',
    themeColor: 0x2C3E50,
    music: 'level5',
    playerStart: { x: 80, y: GAME_HEIGHT - 60 },
    platforms: [
      // Sparse void — very few platforms, tricky jumps
      { x: 200, y: GAME_HEIGHT - 120, width: 128 },
      { x: 500, y: GAME_HEIGHT - 200, width: 64 },
      { x: 750, y: GAME_HEIGHT - 280, width: 64 },
      { x: 950, y: GAME_HEIGHT - 180, width: 128 },
      { x: 1250, y: GAME_HEIGHT - 320, width: 64 },
      { x: 1500, y: GAME_HEIGHT - 240, width: 128 },
      { x: 1800, y: GAME_HEIGHT - 160, width: 64 },
      { x: 2050, y: GAME_HEIGHT - 300, width: 128 },
      { x: 2350, y: GAME_HEIGHT - 200, width: 64 },
      { x: 2600, y: GAME_HEIGHT - 340, width: 64 },
      { x: 2850, y: GAME_HEIGHT - 240, width: 128 },
      { x: 3150, y: GAME_HEIGHT - 160, width: 64 },
      { x: 3400, y: GAME_HEIGHT - 300, width: 128 },
      { x: 3700, y: GAME_HEIGHT - 200, width: 64 },
      { x: 3950, y: GAME_HEIGHT - 280, width: 128 },
    ],
    enemies: [
      // Sparse enemies — emphasis on platforming
      { type: 'octopus', x: 600, y: GAME_HEIGHT - 50, tier: 'red', patrolRange: 120 },
      { type: 'octopus', x: 1400, y: GAME_HEIGHT - 280, tier: 'red', patrolRange: 60 },
      { type: 'octopus', x: 2200, y: GAME_HEIGHT - 50, tier: 'orange', patrolRange: 100 },
      { type: 'octopus', x: 3000, y: GAME_HEIGHT - 50, tier: 'red', patrolRange: 80 },
      { type: 'octopus', x: 3600, y: GAME_HEIGHT - 50, tier: 'orange', patrolRange: 100 },
    ],
    papers: [
      { x: 240, y: GAME_HEIGHT - 150 },
      { x: 530, y: GAME_HEIGHT - 230 },
      { x: 780, y: GAME_HEIGHT - 310 },
      { x: 1010, y: GAME_HEIGHT - 210 },
      { x: 1280, y: GAME_HEIGHT - 350 },
      { x: 1560, y: GAME_HEIGHT - 270 },
      { x: 1840, y: GAME_HEIGHT - 190 },
      { x: 2100, y: GAME_HEIGHT - 330 },
      { x: 2400, y: GAME_HEIGHT - 230 },
      { x: 2640, y: GAME_HEIGHT - 370, isGold: true },
      { x: 2900, y: GAME_HEIGHT - 270 },
      { x: 3200, y: GAME_HEIGHT - 190 },
      { x: 3450, y: GAME_HEIGHT - 330 },
      { x: 3750, y: GAME_HEIGHT - 230 },
      { x: 4000, y: GAME_HEIGHT - 310, isGold: true },
    ],
    powerUps: [
      { type: 'shield', x: 950, y: GAME_HEIGHT - 220 },
      { type: 'dataLeak', x: 1800, y: GAME_HEIGHT - 200 },
      { type: 'ssi', x: 2850, y: GAME_HEIGHT - 280 },
      { type: 'grok', x: 3400, y: GAME_HEIGHT - 340 },
    ],
    npcs: [
      { color: 'red', x: 220, y: GAME_HEIGHT - 60, dialogueKey: 'l5-red' },
    ],
    checkpoints: [
      { x: 1250, y: GAME_HEIGHT - 50 },
      { x: 2600, y: GAME_HEIGHT - 50 },
      { x: 3700, y: GAME_HEIGHT - 50 },
    ],
    boss: {
      type: 'theVoid',
      x: 4200,
      y: GAME_HEIGHT - 80,
      phases: 3,
      hp: 18,
    },
  };
}
