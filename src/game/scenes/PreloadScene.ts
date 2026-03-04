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
    this.generatePlatform();
    this.generateLevelPlatforms();
    this.generatePaper();
    this.generatePaperProjectile();
    this.generateSlop();
    this.generatePowerUps();
    this.generateCheckpoint();
    this.generateParticle();
    this.generateEnemies();
    this.generateClawd();
  }

  private generatePlatform(): void {
    const g = this.add.graphics();
    g.fillStyle(0x333333);
    g.fillRect(0, 0, 64, 16);
    g.fillStyle(0x444444);
    g.fillRect(0, 0, 64, 4);
    g.fillStyle(0x2a2a2a);
    g.fillRect(0, 12, 64, 4);
    g.fillStyle(0x555555);
    for (let x = 0; x < 64; x += 8) {
      g.fillRect(x, 2, 2, 1);
    }
    g.generateTexture('platform', 64, 16);
    g.destroy();
  }

  private generateLevelPlatforms(): void {
    // Level 1 — Twitter
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

    // Level 2 — LinkedIn
    const g2 = this.add.graphics();
    g2.fillStyle(0x2a2a2e);
    g2.fillRect(0, 0, 64, 16);
    g2.fillStyle(0x0A66C2);
    g2.fillRect(0, 0, 3, 16);
    g2.fillStyle(0x3a3a3e);
    g2.fillRect(0, 0, 64, 2);
    g2.generateTexture('platform-linkedin', 64, 16);
    g2.destroy();

    // Level 3 — Bluesky
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

    // Level 4 — ArXiv
    const g4 = this.add.graphics();
    g4.fillStyle(0x4a1515);
    g4.fillRect(0, 0, 64, 16);
    g4.fillStyle(0x6b2020);
    g4.fillRect(0, 0, 64, 3);
    g4.fillStyle(0x3a0e0e);
    g4.fillRect(0, 13, 64, 3);
    g4.fillStyle(0x5a1818);
    for (let x = 0; x < 64; x += 16) {
      g4.fillRect(x, 4, 1, 8);
    }
    g4.generateTexture('platform-arxiv', 64, 16);
    g4.destroy();

    // Level 5 — PhilPapers
    const g5 = this.add.graphics();
    g5.fillStyle(0x2a2820);
    g5.fillRect(0, 0, 64, 16);
    g5.fillStyle(0x3a3830);
    g5.fillRect(1, 1, 62, 14);
    g5.lineStyle(1, 0x1a1815);
    g5.strokeRect(0, 0, 64, 16);
    g5.fillStyle(0x32302a);
    g5.fillRect(5, 4, 24, 1);
    g5.fillRect(10, 8, 30, 1);
    g5.fillRect(8, 12, 18, 1);
    g5.generateTexture('platform-philpapers', 64, 16);
    g5.destroy();

    // Level 6 — SSRN
    const g6 = this.add.graphics();
    g6.fillStyle(0x1E4D2B);
    g6.fillRect(0, 0, 64, 16);
    g6.lineStyle(1, 0x153d20);
    g6.strokeRect(0, 0, 32, 8);
    g6.strokeRect(32, 0, 32, 8);
    g6.strokeRect(16, 8, 32, 8);
    g6.strokeRect(48, 8, 16, 8);
    g6.strokeRect(0, 8, 16, 8);
    g6.fillStyle(0x256b38, 0.3);
    g6.fillRect(0, 0, 64, 2);
    g6.generateTexture('platform-ssrn', 64, 16);
    g6.destroy();
  }

  private generatePaper(): void {
    const g = this.add.graphics();
    g.fillStyle(0xffffff);
    g.fillRect(2, 0, 12, 16);
    g.fillStyle(0xcccccc);
    g.fillRect(10, 0, 4, 4);
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

  private generatePaperProjectile(): void {
    // Small paper with fold corner for firing
    const g = this.add.graphics();
    g.fillStyle(0xffffff);
    g.fillRect(1, 0, 7, 10);
    // Fold corner
    g.fillStyle(0xcccccc);
    g.fillRect(6, 0, 2, 3);
    // Tiny text lines
    g.fillStyle(0xaaaaaa);
    g.fillRect(2, 3, 4, 1);
    g.fillRect(2, 5, 5, 1);
    g.fillRect(2, 7, 3, 1);
    g.generateTexture('paper-projectile', 10, 10);
    g.destroy();
  }

  private generateSlop(): void {
    // Upgraded slop: small bucket shape with splash
    const g = this.add.graphics();
    // Bucket body
    g.fillStyle(0x6b4423);
    g.fillRect(2, 3, 8, 7);
    // Bucket rim
    g.fillStyle(0x8b5e3c);
    g.fillRect(1, 2, 10, 2);
    // Handle
    g.fillStyle(0x5a3a1a);
    g.fillRect(4, 0, 4, 2);
    // Splash blobs
    g.fillStyle(0xa07050);
    g.fillCircle(1, 4, 2);
    g.fillCircle(11, 5, 2);
    // Drip
    g.fillStyle(0x8b5e3c);
    g.fillRect(5, 10, 2, 2);
    g.generateTexture('slop', 12, 12);
    g.destroy();
  }

  private generatePowerUps(): void {
    // Shield — Anthropic: Orange 5-arm starburst
    this.generateAnthropicLogo();
    // OpenAI: Black hexagonal knot
    this.generateOpenAILogo();
    // Speed Bolt — Google/Gemini: 4-pointed sparkle in 4 colors
    this.generateGeminiLogo();
    // Time Freeze — Meta: Blue circle with white "m"
    this.generateMetaLogo();
    // Grok/xAI: Black circle + diagonal Saturn ring
    this.generateGrokLogo();
    // Clippy: Blue with paperclip shape
    this.generateClippyLogo();
    // Fog Cloud: Gray with cloud shape
    this.generateFogLogo();
    // Data Leak: Red with "!"
    this.generateDataLeakLogo();
  }

  private generateAnthropicLogo(): void {
    const g = this.add.graphics();
    const cx = 10, cy = 10;
    // Background glow
    g.fillStyle(0xC15F3C, 0.2);
    g.fillCircle(cx, cy, 10);
    // 5-arm starburst
    g.fillStyle(0xC15F3C);
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const ex = cx + Math.cos(angle) * 8;
      const ey = cy + Math.sin(angle) * 8;
      // Draw arm as thick line from center
      g.fillRect(
        Math.min(cx, ex) - 1,
        Math.min(cy, ey) - 1,
        Math.abs(ex - cx) + 2,
        Math.abs(ey - cy) + 2
      );
    }
    // Center dot
    g.fillCircle(cx, cy, 3);
    g.generateTexture('pu-shield', 20, 20);
    g.destroy();
  }

  private generateOpenAILogo(): void {
    const g = this.add.graphics();
    const cx = 10, cy = 10;
    // Black background
    g.fillStyle(0x111111, 0.3);
    g.fillCircle(cx, cy, 10);
    // Hexagonal knot: 6 overlapping circles
    g.lineStyle(2, 0x333333);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = cx + Math.cos(angle) * 5;
      const y = cy + Math.sin(angle) * 5;
      g.strokeCircle(x, y, 4);
    }
    // Center fill
    g.fillStyle(0x444444);
    g.fillCircle(cx, cy, 3);
    g.generateTexture('pu-openai', 20, 20);
    g.destroy();
  }

  private generateGeminiLogo(): void {
    const g = this.add.graphics();
    const cx = 10, cy = 10;
    // 4-pointed sparkle in Google colors
    const colors = [0x4285F4, 0xDB4437, 0xF4B400, 0x0F9D58]; // blue, red, yellow, green
    const arms = [
      { dx: 0, dy: -8 },  // up
      { dx: 8, dy: 0 },   // right
      { dx: 0, dy: 8 },   // down
      { dx: -8, dy: 0 },  // left
    ];
    arms.forEach((arm, i) => {
      g.fillStyle(colors[i]);
      // Diamond-shaped arm
      g.fillTriangle(
        cx, cy,
        cx + arm.dx, cy + arm.dy,
        cx + (arm.dy !== 0 ? 3 : 0), cy + (arm.dx !== 0 ? 3 : 0)
      );
      g.fillTriangle(
        cx, cy,
        cx + arm.dx, cy + arm.dy,
        cx + (arm.dy !== 0 ? -3 : 0), cy + (arm.dx !== 0 ? -3 : 0)
      );
    });
    // White center
    g.fillStyle(0xffffff);
    g.fillCircle(cx, cy, 2);
    g.generateTexture('pu-speed', 20, 20);
    g.destroy();
  }

  private generateMetaLogo(): void {
    const g = this.add.graphics();
    const cx = 10, cy = 10;
    // Blue circle
    g.fillStyle(0x0668E1);
    g.fillCircle(cx, cy, 9);
    // White "m" shape (infinity-like)
    g.fillStyle(0xffffff);
    // Left arch
    g.fillRect(3, 8, 2, 6);
    g.fillRect(3, 6, 4, 2);
    g.fillRect(7, 8, 2, 2);
    // Right arch
    g.fillRect(9, 6, 4, 2);
    g.fillRect(9, 8, 2, 2);
    g.fillRect(13, 8, 2, 6);
    // Center dip
    g.fillRect(7, 10, 4, 2);
    g.generateTexture('pu-freeze', 20, 20);
    g.destroy();
  }

  private generateGrokLogo(): void {
    const g = this.add.graphics();
    const cx = 10, cy = 10;
    // Black circle body
    g.fillStyle(0x222222);
    g.fillCircle(cx, cy, 8);
    // Diagonal Saturn ring
    g.lineStyle(2, 0x666666);
    // Approximate ring with filled rects at angle
    for (let i = -8; i <= 8; i++) {
      const rx = cx + i;
      const ry = cy - i * 0.4;
      g.fillStyle(0x555555, 0.7);
      g.fillRect(rx, ry, 2, 1);
    }
    // Eye
    g.fillStyle(0xffffff);
    g.fillCircle(cx, cy - 1, 2);
    g.generateTexture('pd-grok', 20, 20);
    g.destroy();
  }

  private generateClippyLogo(): void {
    const g = this.add.graphics();
    // Blue background
    g.fillStyle(0x4488cc, 0.3);
    g.fillRect(0, 0, 20, 20);
    // Paperclip shape
    g.lineStyle(2, 0x4488cc);
    // Outer loop
    g.strokeRoundedRect(6, 2, 8, 16, 4);
    // Inner loop
    g.strokeRoundedRect(8, 6, 4, 8, 2);
    g.generateTexture('pd-clippy', 20, 20);
    g.destroy();
  }

  private generateFogLogo(): void {
    const g = this.add.graphics();
    // Gray background
    g.fillStyle(0x888888, 0.2);
    g.fillRect(0, 0, 20, 20);
    // Cloud shape: overlapping circles
    g.fillStyle(0x888888, 0.8);
    g.fillCircle(7, 10, 5);
    g.fillCircle(13, 10, 5);
    g.fillCircle(10, 7, 5);
    // Base
    g.fillRect(3, 10, 14, 5);
    g.generateTexture('pd-fog', 20, 20);
    g.destroy();
  }

  private generateDataLeakLogo(): void {
    const g = this.add.graphics();
    // Red background
    g.fillStyle(0xe06c75, 0.3);
    g.fillRect(0, 0, 20, 20);
    // Red border
    g.lineStyle(2, 0xe06c75);
    g.strokeRect(1, 1, 18, 18);
    // "!" exclamation
    g.fillStyle(0xe06c75);
    g.fillRect(8, 4, 4, 8);
    g.fillRect(8, 14, 4, 3);
    g.generateTexture('pd-leak', 20, 20);
    g.destroy();
  }

  private generateCheckpoint(): void {
    const g = this.add.graphics();
    g.fillStyle(0x888888);
    g.fillRect(2, 0, 2, 24);
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

  // ── 32×32 Detailed Enemy Sprites ──

  private generateEnemies(): void {
    this.generateOctopusSprites();
    this.generateTrollSprite();
    this.generateInfluencerSprite();
    this.generateCriticSprite();
    this.generatePaperFloodSprite();
    this.generateCloudflareWallSprite();
  }

  private generateOctopusSprites(): void {
    const tiers: Array<{ key: string; color: number; highlight: number }> = [
      { key: 'enemy-octopus-peach', color: 0xffcba4, highlight: 0xffe0c0 },
      { key: 'enemy-octopus-red', color: 0xe06c75, highlight: 0xf08888 },
      { key: 'enemy-octopus-orange', color: 0xf5a623, highlight: 0xffc04a },
    ];

    tiers.forEach(({ key, color, highlight }) => {
      const g = this.add.graphics();
      const s = 32;
      // Dome head
      g.fillStyle(color);
      g.fillCircle(16, 10, 10);
      // Head highlight
      g.fillStyle(highlight, 0.5);
      g.fillCircle(13, 7, 4);
      // White eyes
      g.fillStyle(0xffffff);
      g.fillCircle(12, 10, 3);
      g.fillCircle(20, 10, 3);
      // Pupils
      g.fillStyle(0x000000);
      g.fillCircle(13, 10, 1.5);
      g.fillCircle(21, 10, 1.5);
      // 4 wavy tentacles
      g.fillStyle(color);
      // Tentacle 1 (left)
      g.fillRect(6, 18, 3, 4);
      g.fillRect(5, 22, 3, 4);
      g.fillRect(6, 26, 3, 4);
      // Tentacle 2
      g.fillRect(11, 18, 3, 4);
      g.fillRect(12, 22, 3, 4);
      g.fillRect(11, 26, 3, 4);
      // Tentacle 3
      g.fillRect(17, 18, 3, 4);
      g.fillRect(18, 22, 3, 4);
      g.fillRect(17, 26, 3, 4);
      // Tentacle 4 (right)
      g.fillRect(23, 18, 3, 4);
      g.fillRect(22, 22, 3, 4);
      g.fillRect(23, 26, 3, 4);
      // Slop bucket between tentacles
      g.fillStyle(0x6b4423);
      g.fillRect(13, 20, 6, 5);
      g.fillStyle(0x8b5e3c);
      g.fillRect(12, 19, 8, 2);
      g.generateTexture(key, s, s);
      g.destroy();
    });
  }

  private generateTrollSprite(): void {
    const g = this.add.graphics();
    // Body (hunched green figure)
    g.fillStyle(0x98c379);
    // Torso (hunched)
    g.fillRect(10, 12, 12, 12);
    g.fillRect(8, 14, 4, 8);
    // Head
    g.fillCircle(16, 9, 7);
    // Spiky hair/horns
    g.fillStyle(0x7aa35e);
    g.fillTriangle(10, 4, 12, 0, 14, 4);
    g.fillTriangle(16, 3, 18, -1, 20, 3);
    g.fillTriangle(20, 5, 23, 1, 22, 6);
    // Angry eyebrows
    g.fillStyle(0x000000);
    g.fillRect(12, 6, 4, 1);
    g.fillRect(18, 6, 4, 1);
    // Angry eyes
    g.fillStyle(0xff3333);
    g.fillRect(13, 8, 2, 2);
    g.fillRect(19, 8, 2, 2);
    // Angry mouth
    g.fillStyle(0x000000);
    g.fillRect(13, 12, 6, 2);
    g.fillStyle(0xffffff);
    g.fillRect(14, 12, 1, 1);
    g.fillRect(17, 12, 1, 1);
    // Phone in hand
    g.fillStyle(0x333333);
    g.fillRect(22, 16, 5, 8);
    g.fillStyle(0x4488cc);
    g.fillRect(23, 17, 3, 5);
    // Legs
    g.fillStyle(0x98c379);
    g.fillRect(11, 24, 4, 6);
    g.fillRect(17, 24, 4, 6);
    g.generateTexture('enemy-troll', 32, 32);
    g.destroy();
  }

  private generateInfluencerSprite(): void {
    const g = this.add.graphics();
    // Body (upright purple figure)
    g.fillStyle(0xc678dd);
    // Torso
    g.fillRect(11, 12, 10, 10);
    // Head
    g.fillCircle(16, 8, 6);
    // Hair (glamorous)
    g.fillStyle(0xd89ef0);
    g.fillCircle(16, 5, 4);
    g.fillRect(10, 4, 3, 6);
    g.fillRect(19, 4, 3, 6);
    // Sunglasses
    g.fillStyle(0x111111);
    g.fillRect(11, 6, 4, 3);
    g.fillRect(17, 6, 4, 3);
    g.fillRect(15, 7, 2, 1);
    // Halo glow
    g.fillStyle(0xffd700, 0.4);
    g.fillCircle(16, 1, 6);
    g.fillStyle(0xffd700, 0.2);
    g.fillCircle(16, 1, 8);
    // Selfie arm extended
    g.fillStyle(0xc678dd);
    g.fillRect(21, 10, 8, 3);
    // Phone at end of arm
    g.fillStyle(0x333333);
    g.fillRect(28, 8, 3, 6);
    g.fillStyle(0x5588ee);
    g.fillRect(29, 9, 1, 4);
    // Sparkle effects
    g.fillStyle(0xffffff, 0.8);
    g.fillRect(5, 4, 2, 2);
    g.fillRect(26, 2, 2, 2);
    g.fillRect(3, 14, 2, 2);
    // Legs
    g.fillStyle(0xc678dd);
    g.fillRect(12, 22, 4, 8);
    g.fillRect(17, 22, 4, 8);
    g.generateTexture('enemy-influencer', 32, 32);
    g.destroy();
  }

  private generateCriticSprite(): void {
    const g = this.add.graphics();
    // Dark robe
    g.fillStyle(0x2a2a3a);
    g.fillTriangle(16, 6, 4, 30, 28, 30);
    // Hood
    g.fillStyle(0x3a3a4a);
    g.fillCircle(16, 8, 7);
    g.fillStyle(0x2a2a3a);
    g.fillCircle(16, 7, 6);
    // Face in shadow
    g.fillStyle(0x1a1a2a);
    g.fillCircle(16, 10, 4);
    // Stern eyes
    g.fillStyle(0xcccccc);
    g.fillRect(13, 9, 2, 2);
    g.fillRect(18, 9, 2, 2);
    // Furrowed brow line
    g.fillStyle(0x888888);
    g.fillRect(13, 8, 7, 1);
    // Quill in hand (right)
    g.fillStyle(0xccaa66);
    g.fillRect(24, 4, 1, 16);
    g.fillStyle(0xffffff);
    g.fillTriangle(24, 3, 25, 3, 24, 7);
    // Inkwell (left hand)
    g.fillStyle(0x111111);
    g.fillRect(4, 18, 5, 6);
    g.fillStyle(0x222233);
    g.fillRect(3, 17, 7, 2);
    // Ink level
    g.fillStyle(0x1a1a4a);
    g.fillRect(5, 20, 3, 3);
    g.generateTexture('enemy-critic', 32, 32);
    g.destroy();
  }

  private generatePaperFloodSprite(): void {
    const g = this.add.graphics();
    // Printer/machine body
    g.fillStyle(0x444444);
    g.fillRect(4, 8, 24, 18);
    // Top panel
    g.fillStyle(0x555555);
    g.fillRect(4, 8, 24, 4);
    // Red accent stripe
    g.fillStyle(0xb31b1b);
    g.fillRect(4, 12, 24, 2);
    // Paper slot
    g.fillStyle(0x222222);
    g.fillRect(8, 6, 16, 3);
    // Papers spewing from slot
    g.fillStyle(0xffffff);
    g.fillRect(10, 2, 5, 6);
    g.fillRect(16, 0, 5, 5);
    g.fillRect(22, 3, 4, 4);
    // Text on papers
    g.fillStyle(0xcccccc);
    g.fillRect(11, 3, 3, 1);
    g.fillRect(17, 1, 3, 1);
    // Warning light (top right)
    g.fillStyle(0xff0000, 0.8);
    g.fillCircle(25, 6, 2);
    // Feed tray (bottom)
    g.fillStyle(0x333333);
    g.fillRect(6, 26, 20, 4);
    g.fillStyle(0xffffff, 0.5);
    g.fillRect(8, 27, 16, 2);
    g.generateTexture('enemy-paperFlood', 32, 32);
    g.destroy();
  }

  private generateCloudflareWallSprite(): void {
    const g = this.add.graphics();
    // Hexagonal shield shape
    g.fillStyle(0xf48120);
    // Approximate hexagon
    g.fillRect(4, 6, 24, 20);
    g.fillTriangle(4, 6, 16, 0, 28, 6);
    g.fillTriangle(4, 26, 16, 32, 28, 26);
    // Inner shield
    g.fillStyle(0xf09000, 0.5);
    g.fillRect(8, 8, 16, 16);
    // Cloud icon
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(13, 14, 4);
    g.fillCircle(19, 14, 4);
    g.fillCircle(16, 11, 4);
    g.fillRect(10, 14, 12, 4);
    // Lock icon below cloud
    g.fillStyle(0xffffff);
    g.fillRect(14, 20, 4, 4);
    g.fillStyle(0xf48120);
    g.fillRect(15, 22, 2, 1);
    // Lock shackle
    g.lineStyle(1, 0xffffff);
    g.strokeCircle(16, 19, 2);
    g.generateTexture('enemy-cloudflareWall', 32, 32);
    g.destroy();
  }

  // ── Clawd the Crab ──

  private generateClawd(): void {
    const g = this.add.graphics();
    // Body (orange oval)
    g.fillStyle(0xC15F3C);
    g.fillCircle(8, 8, 6);
    // Left claw
    g.fillStyle(0xd47040);
    g.fillCircle(2, 5, 3);
    g.fillStyle(0xC15F3C);
    g.fillRect(1, 3, 2, 1);
    // Right claw
    g.fillStyle(0xd47040);
    g.fillCircle(14, 5, 3);
    g.fillStyle(0xC15F3C);
    g.fillRect(13, 3, 2, 1);
    // Eyes
    g.fillStyle(0xffffff);
    g.fillCircle(6, 6, 2);
    g.fillCircle(10, 6, 2);
    g.fillStyle(0x000000);
    g.fillCircle(6, 6, 1);
    g.fillCircle(10, 6, 1);
    // Legs (3 per side)
    g.fillStyle(0xC15F3C);
    g.fillRect(1, 10, 3, 2);
    g.fillRect(0, 12, 3, 2);
    g.fillRect(1, 14, 3, 2);
    g.fillRect(12, 10, 3, 2);
    g.fillRect(13, 12, 3, 2);
    g.fillRect(12, 14, 3, 2);
    g.generateTexture('clawd', 16, 16);
    g.destroy();

    // Clawd projectile (small orange dot)
    const gp = this.add.graphics();
    gp.fillStyle(0xC15F3C);
    gp.fillCircle(3, 3, 3);
    gp.fillStyle(0xd47040);
    gp.fillRect(2, 1, 2, 2);
    gp.generateTexture('clawd-projectile', 6, 6);
    gp.destroy();
  }
}
