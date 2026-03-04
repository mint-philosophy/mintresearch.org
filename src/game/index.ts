// ═══════════════════════════════════════════════════
// Data Dash — Phaser Game Factory
// ═══════════════════════════════════════════════════

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from './constants';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { LevelScene } from './scenes/LevelScene';
import { HUDScene } from './scenes/HUDScene';
import { DialogueScene } from './scenes/DialogueScene';
import { PauseScene } from './scenes/PauseScene';
import { GameOverScene } from './scenes/GameOverScene';

export function createGame(parentId: string): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: parentId,
    pixelArt: true,
    roundPixels: true,
    backgroundColor: '#0a0a0a',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 600 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [
      BootScene,
      PreloadScene,
      MenuScene,
      LevelScene,
      HUDScene,
      DialogueScene,
      PauseScene,
      GameOverScene,
    ],
  };

  return new Phaser.Game(config);
}
