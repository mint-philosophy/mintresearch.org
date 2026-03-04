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
    // Level-specific platform textures
    this.generateLevelPlatforms();
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

  private generateLevelPlatforms(): void {
    // Level 1 — Twitter: dark card with blue top accent
    const g1 = this.add.graphics();
    g1.fillStyle(0x15202b);
    g1.fillRect(0, 0, 64, 16);
    g1.fillStyle(0x1DA1F2);
    g1.fillRect(0, 0, 64, 3);
    g1.fillStyle(0x1a2d3d, 0.5);
    g1.fillRect(8, 7, 20, 1);
    g1.fillRect(8, 10, 30, 1);
    g1.fillRect(8, 13, 15, 1);
    g1.generateTexture('platform-twitter', 64, 16);
    g1.destroy();

    // Level 2 — LinkedIn: white-ish card with blue left border
    const g2 = this.add.graphics();
    g2.fillStyle(0x2a2a2e);
    g2.fillRect(0, 0, 64, 16);
    g2.fillStyle(0x0A66C2);
    g2.fillRect(0, 0, 3, 16);
    g2.fillStyle(0x3a3a3e);
    g2.fillRect(0, 0, 64, 2);
    g2.generateTexture('platform-linkedin', 64, 16);
    g2.destroy();

    // Level 3 — Bluesky: cloud-like with soft blue glow on top
    const g3 = this.add.graphics();
    g3.fillStyle(0x1a2a3a);
    g3.fillRect(0, 0, 64, 16);
    g3.fillStyle(0x0085FF, 0.3);
    g3.fillRect(0, 0, 64, 4);
    g3.fillStyle(0x2a3a4a);
    g3.fillCircle(10, 2, 8);
    g3.fillCircle(30, 3, 10);
    g3.fillCircle(50, 2, 7);
    g3.generateTexture('platform-bluesky', 64, 16);
    g3.destroy();

    // Level 4 — ArXiv: red-maroon bookshelf
    const g4 = this.add.graphics();
    g4.fillStyle(0x4a1515);
    g4.fillRect(0, 0, 64, 16);
    g4.fillStyle(0x6b2020);
    g4.fillRect(0, 0, 64, 3);
    g4.fillStyle(0x3a0e0e);
    g4.fillRect(0, 13, 64, 3);
    // Shelf detail lines
    g4.fillStyle(0x5a1818);
    for (let x = 0; x < 64; x += 16) {
      g4.fillRect(x, 4, 1, 8);
    }
    g4.generateTexture('platform-arxiv', 64, 16);
    g4.destroy();

    // Level 5 — PhilPapers: faded parchment with dark border
    const g5 = this.add.graphics();
    g5.fillStyle(0x2a2820);
    g5.fillRect(0, 0, 64, 16);
    g5.fillStyle(0x3a3830);
    g5.fillRect(1, 1, 62, 14);
    g5.lineStyle(1, 0x1a1815);
    g5.strokeRect(0, 0, 64, 16);
    // Aged texture
    g5.fillStyle(0x32302a);
    g5.fillRect(5, 4, 24, 1);
    g5.fillRect(10, 8, 30, 1);
    g5.fillRect(8, 12, 18, 1);
    g5.generateTexture('platform-philpapers', 64, 16);
    g5.destroy();

    // Level 6 — SSRN: green brick
    const g6 = this.add.graphics();
    g6.fillStyle(0x1E4D2B);
    g6.fillRect(0, 0, 64, 16);
    // Brick pattern
    g6.lineStyle(1, 0x153d20);
    g6.strokeRect(0, 0, 32, 8);
    g6.strokeRect(32, 0, 32, 8);
    g6.strokeRect(16, 8, 32, 8);
    g6.strokeRect(48, 8, 16, 8);
    g6.strokeRect(0, 8, 16, 8);
    // Highlight
    g6.fillStyle(0x256b38, 0.3);
    g6.fillRect(0, 0, 64, 2);
    g6.generateTexture('platform-ssrn', 64, 16);
    g6.destroy();
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
