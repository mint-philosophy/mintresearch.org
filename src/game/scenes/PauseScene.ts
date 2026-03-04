import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../constants';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.PAUSE });
  }

  create(): void {
    // Dark overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);

    // Pause text
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 'PAUSED', {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '24px',
      color: '#2ec4b6',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Resume hint
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, 'Press ESC to resume', {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '11px',
      color: '#5c6370',
    }).setOrigin(0.5);

    // Quit hint
    const quit = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 35, '[ Q — Quit to Menu ]', {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '10px',
      color: '#e06c75',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    quit.on('pointerdown', () => this.quitToMenu());

    this.input.keyboard!.on('keydown-ESC', () => this.resume());
    this.input.keyboard!.on('keydown-Q', () => this.quitToMenu());
  }

  private resume(): void {
    this.scene.stop();
    this.scene.resume(SCENES.LEVEL);
  }

  private quitToMenu(): void {
    this.scene.stop(SCENES.LEVEL);
    this.scene.stop(SCENES.HUD);
    this.scene.stop();
    this.scene.start(SCENES.MENU);
  }
}
