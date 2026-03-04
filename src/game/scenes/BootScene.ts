import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  preload(): void {
    // Load essential assets (Minty sprites)
    const base = document.querySelector('meta[name="base"]')?.getAttribute('content') || '';
    const colors = ['teal', 'green', 'purple', 'yellow', 'indigo', 'red', 'brown', 'cool'];
    colors.forEach(c => {
      this.load.image(`minty-${c}`, `${base}/assets/minty-${c}.png`);
    });
    this.load.image('minty-shades', `${base}/assets/minty-shades-scan.png`);
    this.load.image('minty-cool-scan', `${base}/assets/minty-cool-scan.png`);
  }

  create(): void {
    this.scene.start(SCENES.PRELOAD);
  }
}
