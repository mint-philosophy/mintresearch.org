import type { LevelConfig } from '../constants';
import { GAME_HEIGHT } from '../constants';

export function getLevel2Config(): LevelConfig {
  return {
    number: 2,
    name: 'LinkedIn',
    width: 3600,
    background: '#0a1628',
    themeColor: 0x0A66C2,
    music: 'level2',
    playerStart: { x: 80, y: GAME_HEIGHT - 60 },
    platforms: [
      // Corporate office — elevator platforms (vertical spacing)
      { x: 200, y: GAME_HEIGHT - 80, width: 256 },
      { x: 500, y: GAME_HEIGHT - 160, width: 128 },
      { x: 350, y: GAME_HEIGHT - 240, width: 192 },
      { x: 650, y: GAME_HEIGHT - 300, width: 128 },
      { x: 850, y: GAME_HEIGHT - 200, width: 192 },
      { x: 1050, y: GAME_HEIGHT - 120, width: 256 },
      { x: 1350, y: GAME_HEIGHT - 180, width: 128 },
      { x: 1550, y: GAME_HEIGHT - 260, width: 192 },
      { x: 1800, y: GAME_HEIGHT - 140, width: 256 },
      { x: 2050, y: GAME_HEIGHT - 220, width: 128 },
      { x: 2300, y: GAME_HEIGHT - 160, width: 192 },
      { x: 2550, y: GAME_HEIGHT - 240, width: 128 },
      { x: 2750, y: GAME_HEIGHT - 120, width: 256 },
      { x: 3050, y: GAME_HEIGHT - 200, width: 192 },
    ],
    enemies: [
      { type: 'octopus', x: 400, y: GAME_HEIGHT - 120, tier: 'peach', patrolRange: 80 },
      { type: 'influencer', x: 600, y: GAME_HEIGHT - 50, tier: 'peach', patrolRange: 60 },
      { type: 'octopus', x: 900, y: GAME_HEIGHT - 240, tier: 'peach', patrolRange: 100 },
      { type: 'influencer', x: 1200, y: GAME_HEIGHT - 50, tier: 'peach', patrolRange: 80 },
      { type: 'octopus', x: 1500, y: GAME_HEIGHT - 300, tier: 'red', patrolRange: 80 },
      { type: 'influencer', x: 1900, y: GAME_HEIGHT - 50, tier: 'peach', patrolRange: 100 },
      { type: 'octopus', x: 2200, y: GAME_HEIGHT - 200, tier: 'red', patrolRange: 80 },
      { type: 'octopus', x: 2600, y: GAME_HEIGHT - 280, tier: 'red', patrolRange: 60 },
      { type: 'influencer', x: 2900, y: GAME_HEIGHT - 50, tier: 'peach', patrolRange: 100 },
    ],
    papers: [
      { x: 280, y: GAME_HEIGHT - 110 },
      { x: 530, y: GAME_HEIGHT - 190 },
      { x: 400, y: GAME_HEIGHT - 270 },
      { x: 700, y: GAME_HEIGHT - 330 },
      { x: 920, y: GAME_HEIGHT - 230 },
      { x: 1150, y: GAME_HEIGHT - 150 },
      { x: 1400, y: GAME_HEIGHT - 210 },
      { x: 1620, y: GAME_HEIGHT - 290 },
      { x: 1880, y: GAME_HEIGHT - 170 },
      { x: 2100, y: GAME_HEIGHT - 250 },
      { x: 2370, y: GAME_HEIGHT - 190 },
      { x: 2620, y: GAME_HEIGHT - 270 },
      { x: 2830, y: GAME_HEIGHT - 150 },
      { x: 3100, y: GAME_HEIGHT - 230, isGold: true },
    ],
    powerUps: [
      { type: 'openai', x: 850, y: GAME_HEIGHT - 240 },
      { type: 'grok', x: 1550, y: GAME_HEIGHT - 300 },
      { type: 'shield', x: 2300, y: GAME_HEIGHT - 200 },
      { type: 'fogCloud', x: 2750, y: GAME_HEIGHT - 160 },
    ],
    npcs: [
      { color: 'purple', x: 250, y: GAME_HEIGHT - 60, dialogueKey: 'l2-purple' },
    ],
    checkpoints: [
      { x: 1050, y: GAME_HEIGHT - 50 },
      { x: 2100, y: GAME_HEIGHT - 50 },
    ],
    boss: {
      type: 'engagementKing',
      x: 3350,
      y: GAME_HEIGHT - 80,
      phases: 3,
      hp: 15,
    },
  };
}
