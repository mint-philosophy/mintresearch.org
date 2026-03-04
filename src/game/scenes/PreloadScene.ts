import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../constants';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.PRELOAD });
  }

  create(): void {
    // Progress bar
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const bg = this.add.rectangle(cx, cy, 300, 20, COLORS.bg2);
    bg.setStrokeStyle(1, COLORS.accent);

    const bar = this.add.rectangle(cx - 148, cy, 0, 16, COLORS.accent);
    bar.setOrigin(0, 0.5);

    const text = this.add.text(cx, cy + 24, 'Generating sprites...', {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '10px',
      color: '#5c6370',
    }).setOrigin(0.5);

    // Generate all programmatic sprites
    this.time.delayedCall(100, () => {
      this.generateSprites();
      bar.width = 296;
      text.setText('Ready!');
      this.time.delayedCall(300, () => {
        this.scene.start(SCENES.MENU);
      });
    });
  }

  private generateSprites(): void {
    // Platform texture
    this.generatePlatform();
    // Paper collectible
    this.generatePaper();
    // Ink projectile
    this.generateInk();
    // Slop projectile
    this.generateSlop();
    // Power-up textures
    this.generatePowerUps();
    // Checkpoint flag
    this.generateCheckpoint();
    // Particle
    this.generateParticle();
  }

  private generatePlatform(): void {
    const g = this.add.graphics();
    g.fillStyle(0x333333);
    g.fillRect(0, 0, 64, 16);
    g.fillStyle(0x444444);
    g.fillRect(0, 0, 64, 4);
    g.fillStyle(0x2a2a2a);
    g.fillRect(0, 12, 64, 4);
    // Pixel detail
    g.fillStyle(0x555555);
    for (let x = 0; x < 64; x += 8) {
      g.fillRect(x, 2, 2, 1);
    }
    g.generateTexture('platform', 64, 16);
    g.destroy();
  }

  private generatePaper(): void {
    const g = this.add.graphics();
    // White paper
    g.fillStyle(0xffffff);
    g.fillRect(2, 0, 12, 16);
    // Fold corner
    g.fillStyle(0xcccccc);
    g.fillRect(10, 0, 4, 4);
    // Text lines
    g.fillStyle(0x888888);
    g.fillRect(4, 3, 6, 1);
    g.fillRect(4, 6, 8, 1);
    g.fillRect(4, 9, 5, 1);
    g.fillRect(4, 12, 7, 1);
    g.generateTexture('paper', 16, 16);
    g.destroy();

    // Gold paper variant
    const gg = this.add.graphics();
    gg.fillStyle(0xffd700);
    gg.fillRect(0, 0, 18, 18);
    gg.fillStyle(0xffffff);
    gg.fillRect(2, 2, 14, 14);
    gg.fillStyle(0x888888);
    gg.fillRect(4, 5, 8, 1);
    gg.fillRect(4, 8, 10, 1);
    gg.fillRect(4, 11, 6, 1);
    gg.generateTexture('paper-gold', 18, 18);
    gg.destroy();
  }

  private generateInk(): void {
    const g = this.add.graphics();
    g.fillStyle(0x2ec4b6);
    g.fillCircle(4, 4, 4);
    g.fillStyle(0x5de8da);
    g.fillRect(2, 2, 2, 2);
    g.generateTexture('ink', 8, 8);
    g.destroy();
  }

  private generateSlop(): void {
    const g = this.add.graphics();
    g.fillStyle(0x8b5e3c);
    g.fillCircle(5, 5, 5);
    g.fillStyle(0x6b4423);
    g.fillRect(3, 3, 3, 3);
    g.fillStyle(0xa07050);
    g.fillRect(6, 2, 2, 2);
    g.generateTexture('slop', 10, 10);
    g.destroy();
  }

  private generatePowerUps(): void {
    // Shield (orange)
    this.makePowerUpTexture('pu-shield', 0xf5a623, 'S');
    // Brain Boost (blue)
    this.makePowerUpTexture('pu-brain', 0x61afef, 'B');
    // Speed Bolt (green)
    this.makePowerUpTexture('pu-speed', 0x98c379, '⚡');
    // Time Freeze (white)
    this.makePowerUpTexture('pu-freeze', 0xffffff, 'T');
    // Clippy (blue powerdown)
    this.makePowerUpTexture('pd-clippy', 0x4488cc, '?');
    // Fog (gray)
    this.makePowerUpTexture('pd-fog', 0x888888, 'F');
    // Sludge (dark blue)
    this.makePowerUpTexture('pd-sludge', 0x3355aa, '~');
    // Data Leak (red)
    this.makePowerUpTexture('pd-leak', 0xe06c75, '!');
  }

  private makePowerUpTexture(key: string, color: number, label: string): void {
    const g = this.add.graphics();
    g.fillStyle(color, 0.3);
    g.fillRect(0, 0, 20, 20);
    g.lineStyle(2, color);
    g.strokeRect(1, 1, 18, 18);
    g.generateTexture(key, 20, 20);
    g.destroy();
  }

  private generateCheckpoint(): void {
    const g = this.add.graphics();
    // Flag pole
    g.fillStyle(0x888888);
    g.fillRect(2, 0, 2, 24);
    // Flag
    g.fillStyle(0x2ec4b6);
    g.fillTriangle(4, 0, 16, 6, 4, 12);
    g.generateTexture('checkpoint', 18, 24);
    g.destroy();
  }

  private generateParticle(): void {
    const g = this.add.graphics();
    g.fillStyle(0xffffff);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture('particle', 4, 4);
    g.destroy();
  }
}
