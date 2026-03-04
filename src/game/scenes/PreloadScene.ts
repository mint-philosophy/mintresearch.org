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
    this.generateBackgroundSprites();
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
    this.generateParrotSprite();
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

  private generateParrotSprite(): void {
    const g = this.add.graphics();
    // Body — bright tropical green
    g.fillStyle(0x22cc55);
    g.fillCircle(16, 14, 8);
    // Belly — lighter
    g.fillStyle(0x44ee77);
    g.fillCircle(16, 16, 5);
    // Head — slightly brighter
    g.fillStyle(0x33dd66);
    g.fillCircle(16, 8, 6);
    // Beak — hooked orange/yellow
    g.fillStyle(0xf5a623);
    g.fillTriangle(22, 7, 28, 9, 22, 11);
    // Beak hook
    g.fillStyle(0xe09010);
    g.fillTriangle(26, 9, 28, 9, 26, 12);
    // Eye — white with black pupil
    g.fillStyle(0xffffff);
    g.fillCircle(19, 7, 2.5);
    g.fillStyle(0x000000);
    g.fillCircle(19, 7, 1);
    // Head crest — red/blue feathers
    g.fillStyle(0xee3333);
    g.fillTriangle(12, 4, 14, 0, 16, 4);
    g.fillStyle(0x3388ff);
    g.fillTriangle(14, 3, 16, -1, 18, 3);
    // Wing — darker green
    g.fillStyle(0x119944);
    g.fillRect(8, 12, 6, 8);
    g.fillStyle(0x0085FF); // Bluesky blue accent
    g.fillRect(8, 18, 6, 2);
    // Tail feathers — fanned out
    g.fillStyle(0x22cc55);
    g.fillRect(10, 22, 3, 6);
    g.fillRect(14, 23, 3, 5);
    g.fillRect(18, 22, 3, 6);
    g.fillStyle(0xee3333);
    g.fillRect(11, 26, 2, 3);
    g.fillStyle(0x3388ff);
    g.fillRect(15, 26, 2, 3);
    g.fillStyle(0xf5a623);
    g.fillRect(19, 26, 2, 3);
    // Feet
    g.fillStyle(0x555555);
    g.fillRect(13, 22, 2, 3);
    g.fillRect(17, 22, 2, 3);
    // Speech bubble (echo chamber!) — small "..." bubble
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(26, 2, 4);
    g.fillStyle(0x888888, 0.5);
    g.fillRect(24, 1, 1, 1);
    g.fillRect(26, 1, 1, 1);
    g.fillRect(28, 1, 1, 1);
    g.generateTexture('enemy-parrot', 32, 32);
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

  // ── Background Sprites ──

  private generateBackgroundSprites(): void {
    // Level 1: X/Twitter
    this.generateBgBlueCheck();
    this.generateBgRocket();
    this.generateBgMagaPerson();
    this.generateBgTweetCard();
    // Level 2: LinkedIn
    this.generateBgSuitedPerson();
    this.generateBgPremiumBanner();
    this.generateBgOfficeBuilding();
    // Level 3: Bluesky
    this.generateBgButterfly();
    this.generateBgCloud();
    this.generateBgBskyLogo();
    // Level 4: ArXiv
    this.generateBgScientist();
    this.generateBgServerRack();
    this.generateBgTerminal();
    // Level 5: PhilPapers
    this.generateBgIvoryTower();
    this.generateBgPhilosopher();
    // Level 6: SSRN
    this.generateBgSocialScientist();
    this.generateBgBarChart();
    this.generateBgPaywallLock();
  }

  // ── Level 1: X/Twitter Background Sprites ──

  private generateBgBlueCheck(): void {
    const g = this.add.graphics();
    // Blue filled circle
    g.fillStyle(0x1DA1F2);
    g.fillCircle(12, 12, 11);
    // Darker blue edge shading (bottom-right shadow)
    g.fillStyle(0x0d8ddb);
    g.fillCircle(13, 13, 11);
    // Re-fill main circle on top for proper layering
    g.fillStyle(0x1DA1F2);
    g.fillCircle(12, 12, 10);
    // Light highlight arc upper-left
    g.fillStyle(0x4db8f7);
    g.fillCircle(9, 9, 6);
    // Restore main blue in center
    g.fillStyle(0x1DA1F2);
    g.fillCircle(11, 11, 5);
    // Gold highlight arc upper-left (small shimmer)
    g.fillStyle(0xffd700);
    g.fillRect(4, 5, 2, 1);
    g.fillRect(3, 6, 2, 1);
    g.fillRect(3, 7, 1, 1);
    g.fillRect(5, 4, 1, 1);
    // White checkmark — L-shaped, 3px stroke
    // Descending stroke (short arm going down-right)
    g.fillStyle(0xffffff);
    g.fillRect(6, 11, 3, 3);
    g.fillRect(7, 13, 3, 3);
    g.fillRect(8, 14, 3, 3);
    // Ascending stroke (long arm going up-right)
    g.fillRect(10, 13, 3, 3);
    g.fillRect(11, 11, 3, 3);
    g.fillRect(12, 9, 3, 3);
    g.fillRect(13, 7, 3, 3);
    g.fillRect(14, 5, 3, 3);
    // Checkmark shadow (subtle depth)
    g.fillStyle(0xd0e8f8);
    g.fillRect(7, 16, 2, 1);
    g.fillRect(15, 8, 1, 1);
    // Inner highlight on checkmark
    g.fillStyle(0xffffff);
    g.fillRect(9, 14, 1, 1);
    g.fillRect(13, 8, 1, 1);
    g.generateTexture('bg-blue-check', 24, 24);
    g.destroy();
  }

  private generateBgRocket(): void {
    const g = this.add.graphics();
    // === Exhaust plume at bottom ===
    // Outer plume glow (yellow)
    g.fillStyle(0xffcc00);
    g.fillRect(10, 82, 12, 4);
    g.fillRect(11, 86, 10, 3);
    g.fillRect(12, 89, 8, 3);
    g.fillRect(13, 92, 6, 2);
    g.fillRect(14, 94, 4, 2);
    // Inner plume (bright orange)
    g.fillStyle(0xff8800);
    g.fillRect(12, 82, 8, 3);
    g.fillRect(13, 85, 6, 3);
    g.fillRect(14, 88, 4, 3);
    // Hot core (white-yellow)
    g.fillStyle(0xffeeaa);
    g.fillRect(14, 80, 4, 3);
    g.fillRect(15, 83, 2, 3);

    // === Landing legs (deployed, angled) ===
    g.fillStyle(0x555555);
    // Left leg
    g.fillRect(8, 72, 2, 10);
    g.fillRect(6, 78, 3, 4);
    g.fillRect(5, 80, 2, 2);
    // Right leg
    g.fillRect(22, 72, 2, 10);
    g.fillRect(23, 78, 3, 4);
    g.fillRect(25, 80, 2, 2);
    // Leg struts
    g.fillStyle(0x444444);
    g.fillRect(9, 70, 1, 4);
    g.fillRect(22, 70, 1, 4);

    // === Main body ===
    // Shadow side (right)
    g.fillStyle(0xbbbbbb);
    g.fillRect(19, 20, 5, 52);
    // Main body (light grey)
    g.fillStyle(0xdddddd);
    g.fillRect(10, 20, 12, 52);
    // Highlight side (left)
    g.fillStyle(0xeeeeee);
    g.fillRect(10, 20, 3, 52);

    // === Panel seam lines ===
    g.fillStyle(0xaaaaaa);
    g.fillRect(10, 32, 14, 1);
    g.fillRect(10, 44, 14, 1);
    g.fillRect(10, 56, 14, 1);
    g.fillRect(10, 68, 14, 1);

    // === Interstage band (black, ~1/3 up from bottom) ===
    g.fillStyle(0x222222);
    g.fillRect(9, 48, 14, 5);
    g.fillStyle(0x333333);
    g.fillRect(9, 48, 14, 1);

    // === Nose cone ===
    // Darker cap color
    g.fillStyle(0xaaaaaa);
    g.fillTriangle(16, 2, 8, 20, 24, 20);
    // Highlight on left of nose
    g.fillStyle(0xcccccc);
    g.fillTriangle(16, 2, 9, 20, 16, 20);
    // Tip
    g.fillStyle(0x999999);
    g.fillRect(15, 2, 2, 3);
    // Nose cone base seam
    g.fillStyle(0x888888);
    g.fillRect(8, 19, 16, 1);

    // === Grid fins (2 visible near top) ===
    g.fillStyle(0x888888);
    // Left grid fin
    g.fillRect(5, 22, 5, 2);
    g.fillRect(5, 25, 5, 2);
    g.fillStyle(0x777777);
    g.fillRect(6, 24, 4, 1);
    // Right grid fin
    g.fillStyle(0x888888);
    g.fillRect(22, 22, 5, 2);
    g.fillRect(22, 25, 5, 2);
    g.fillStyle(0x777777);
    g.fillRect(22, 24, 4, 1);

    // === SpaceX-style logo area (small dark rectangle on body) ===
    g.fillStyle(0xbbbbbb);
    g.fillRect(12, 36, 8, 6);
    g.fillStyle(0x999999);
    g.fillRect(13, 37, 6, 1);
    g.fillRect(13, 39, 4, 1);

    // === Engine bells at bottom ===
    g.fillStyle(0x666666);
    g.fillRect(11, 72, 3, 4);
    g.fillRect(15, 72, 3, 4);
    g.fillRect(19, 72, 3, 4);
    // Engine nozzle rims
    g.fillStyle(0x555555);
    g.fillRect(10, 76, 5, 2);
    g.fillRect(14, 76, 5, 2);
    g.fillRect(18, 76, 5, 2);
    // Nozzle glow
    g.fillStyle(0xff6600);
    g.fillRect(12, 78, 2, 2);
    g.fillRect(16, 78, 2, 2);
    g.fillRect(20, 78, 2, 2);

    g.generateTexture('bg-rocket', 32, 96);
    g.destroy();
  }

  private generateBgMagaPerson(): void {
    const g = this.add.graphics();
    // === Legs (apart, standing pose) ===
    g.fillStyle(0x2a2a3a);
    // Left leg
    g.fillRect(4, 26, 4, 10);
    // Right leg
    g.fillRect(12, 26, 4, 10);
    // Shoes
    g.fillStyle(0x222222);
    g.fillRect(3, 36, 5, 3);
    g.fillRect(12, 36, 5, 3);
    // Shoe highlights
    g.fillStyle(0x333333);
    g.fillRect(3, 36, 5, 1);
    g.fillRect(12, 36, 5, 1);

    // === Body / shirt ===
    g.fillStyle(0x333344);
    g.fillRect(5, 14, 10, 13);
    // Shirt shadow right side
    g.fillStyle(0x2a2a3a);
    g.fillRect(13, 15, 2, 11);
    // Shirt highlight left
    g.fillStyle(0x3d3d50);
    g.fillRect(5, 14, 2, 12);
    // Collar
    g.fillStyle(0x3a3a4e);
    g.fillRect(7, 13, 6, 2);

    // === Arms ===
    // Left arm (down)
    g.fillStyle(0x333344);
    g.fillRect(2, 15, 3, 8);
    // Left hand
    g.fillStyle(0xffcba4);
    g.fillRect(2, 23, 3, 2);
    // Right arm (raised, cheering)
    g.fillStyle(0x333344);
    g.fillRect(15, 14, 3, 3);
    g.fillRect(16, 11, 3, 4);
    g.fillRect(17, 8, 3, 4);
    // Right hand (raised)
    g.fillStyle(0xffcba4);
    g.fillRect(17, 6, 3, 3);

    // === Head ===
    g.fillStyle(0xffcba4);
    g.fillRect(6, 4, 8, 9);
    // Head shadow (right side)
    g.fillStyle(0xeebb90);
    g.fillRect(12, 5, 2, 7);
    // Head highlight (left side)
    g.fillStyle(0xffddb8);
    g.fillRect(6, 4, 2, 8);
    // Eyes
    g.fillStyle(0x222222);
    g.fillRect(7, 7, 2, 2);
    g.fillRect(11, 7, 2, 2);
    // Mouth
    g.fillStyle(0xdd9980);
    g.fillRect(8, 10, 4, 1);
    // Nose
    g.fillStyle(0xeebb90);
    g.fillRect(9, 8, 2, 2);

    // === Red MAGA cap ===
    g.fillStyle(0xcc2222);
    g.fillRect(5, 2, 10, 4);
    g.fillRect(5, 1, 10, 2);
    // White front panel strip
    g.fillStyle(0xffffff);
    g.fillRect(7, 2, 5, 2);
    // Cap brim (overhangs left by 2px)
    g.fillStyle(0xcc2222);
    g.fillRect(3, 5, 11, 2);
    // Brim shadow
    g.fillStyle(0xaa1a1a);
    g.fillRect(3, 6, 11, 1);
    // Cap highlight
    g.fillStyle(0xdd3333);
    g.fillRect(6, 1, 4, 1);

    g.generateTexture('bg-maga-person', 20, 40);
    g.destroy();
  }

  private generateBgTweetCard(): void {
    const g = this.add.graphics();
    // === Card background ===
    g.fillStyle(0x15202b);
    g.fillRect(0, 0, 60, 40);
    // Rounded corner illusion — lighter pixels at corners
    g.fillStyle(0x192733);
    g.fillRect(0, 0, 2, 2);
    g.fillRect(58, 0, 2, 2);
    g.fillRect(0, 38, 2, 2);
    g.fillRect(58, 38, 2, 2);
    // Subtle top border
    g.fillStyle(0x1c2e3f);
    g.fillRect(2, 0, 56, 1);
    // Left border subtle
    g.fillStyle(0x1a2938);
    g.fillRect(0, 2, 1, 36);

    // === Avatar circle (blue) ===
    g.fillStyle(0x1DA1F2);
    g.fillCircle(8, 8, 5);
    // Avatar highlight
    g.fillStyle(0x3db8ff);
    g.fillCircle(7, 7, 2);

    // === Display name (white bar) ===
    g.fillStyle(0xd9d9d9);
    g.fillRect(16, 5, 18, 2);
    // Handle (grey, shorter)
    g.fillStyle(0x5c6370);
    g.fillRect(36, 5, 12, 2);
    // Timestamp
    g.fillStyle(0x5c6370);
    g.fillRect(50, 5, 6, 2);

    // === Text lines ===
    g.fillStyle(0x8b949e);
    g.fillRect(16, 11, 38, 2);
    g.fillRect(16, 15, 30, 2);
    g.fillRect(16, 19, 35, 2);

    // === Engagement icons row ===
    // Reply bubble (grey)
    g.fillStyle(0x5c6370);
    g.fillCircle(10, 33, 3);
    g.fillStyle(0x15202b);
    g.fillCircle(10, 33, 1.5);
    g.fillStyle(0x5c6370);
    g.fillRect(8, 35, 2, 2);

    // Retweet arrows (teal)
    g.fillStyle(0x2ec4b6);
    // Left arrow
    g.fillRect(22, 32, 6, 2);
    g.fillTriangle(21, 33, 23, 31, 23, 35);
    // Right arrow
    g.fillRect(24, 35, 6, 2);
    g.fillTriangle(31, 36, 29, 34, 29, 38);

    // Heart (red)
    g.fillStyle(0xe06c75);
    g.fillCircle(40, 32, 2);
    g.fillCircle(43, 32, 2);
    g.fillTriangle(38, 33, 45, 33, 41, 37);

    // Share arrow (grey)
    g.fillStyle(0x5c6370);
    g.fillTriangle(52, 31, 56, 34, 52, 37);
    g.fillRect(50, 33, 3, 2);

    // === Engagement counts (small text) ===
    g.fillStyle(0x5c6370);
    g.fillRect(13, 33, 4, 1);
    g.fillRect(33, 33, 3, 1);
    g.fillRect(46, 33, 4, 1);

    g.generateTexture('bg-tweet-card', 60, 40);
    g.destroy();
  }

  // ── Level 2: LinkedIn Background Sprites ──

  private generateBgSuitedPerson(): void {
    const g = this.add.graphics();
    // === Legs (walking stride) ===
    g.fillStyle(0x1a2a40);
    // Left leg (forward)
    g.fillRect(5, 28, 4, 8);
    // Right leg (back)
    g.fillRect(11, 27, 4, 9);
    // Shoes
    g.fillStyle(0x222222);
    g.fillRect(4, 36, 5, 3);
    g.fillRect(11, 36, 5, 3);
    // Shoe highlights
    g.fillStyle(0x333333);
    g.fillRect(4, 36, 5, 1);
    g.fillRect(11, 36, 5, 1);

    // === Suit jacket ===
    g.fillStyle(0x1a2a40);
    g.fillRect(4, 14, 12, 14);
    // Jacket shadow (right)
    g.fillStyle(0x14223a);
    g.fillRect(14, 15, 2, 12);
    // Jacket highlight (left)
    g.fillStyle(0x203450);
    g.fillRect(4, 14, 2, 13);
    // Lapel lines (lighter V at chest)
    g.fillStyle(0x253a55);
    g.fillRect(7, 14, 1, 6);
    g.fillRect(8, 15, 1, 5);
    g.fillRect(12, 14, 1, 6);
    g.fillRect(11, 15, 1, 5);
    // White shirt strip
    g.fillStyle(0xeeeeee);
    g.fillRect(9, 15, 2, 8);
    // Blue tie
    g.fillStyle(0x0A66C2);
    g.fillRect(9, 16, 2, 1);
    g.fillRect(9, 17, 2, 8);
    // Tie highlight
    g.fillStyle(0x0d7ade);
    g.fillRect(9, 17, 1, 6);

    // === Arms ===
    // Left arm (carrying briefcase)
    g.fillStyle(0x1a2a40);
    g.fillRect(1, 15, 3, 10);
    // Left hand
    g.fillStyle(0xffcba4);
    g.fillRect(1, 25, 3, 2);
    // Right arm
    g.fillStyle(0x1a2a40);
    g.fillRect(16, 15, 3, 10);
    // Right hand
    g.fillStyle(0xffcba4);
    g.fillRect(16, 25, 3, 2);

    // === Briefcase ===
    g.fillStyle(0x4a3520);
    g.fillRect(0, 27, 6, 5);
    // Briefcase clasp
    g.fillStyle(0x8b7355);
    g.fillRect(2, 27, 2, 1);
    // Briefcase handle
    g.fillStyle(0x3a2a18);
    g.fillRect(1, 25, 4, 2);
    // Briefcase highlight
    g.fillStyle(0x5a4530);
    g.fillRect(0, 27, 1, 5);

    // === Head ===
    g.fillStyle(0xffcba4);
    g.fillRect(6, 3, 8, 10);
    // Head shadow
    g.fillStyle(0xeebb90);
    g.fillRect(12, 4, 2, 8);
    // Head highlight
    g.fillStyle(0xffddb8);
    g.fillRect(6, 3, 2, 9);
    // Hair
    g.fillStyle(0x3a2a18);
    g.fillRect(6, 1, 8, 3);
    g.fillRect(5, 2, 2, 4);
    // Eyes
    g.fillStyle(0x222222);
    g.fillRect(7, 7, 2, 2);
    g.fillRect(11, 7, 2, 2);
    // Mouth
    g.fillStyle(0xdd9980);
    g.fillRect(8, 10, 4, 1);

    g.generateTexture('bg-suited-person', 20, 40);
    g.destroy();
  }

  private generateBgPremiumBanner(): void {
    const g = this.add.graphics();
    // === Gold rectangle with darker border ===
    g.fillStyle(0xc4a010);
    g.fillRect(0, 0, 56, 18);
    g.fillStyle(0xf5c518);
    g.fillRect(1, 1, 54, 16);
    // Subtle highlight (top edge)
    g.fillStyle(0xfad54a);
    g.fillRect(1, 1, 54, 2);
    // Shadow (bottom edge)
    g.fillStyle(0xd4b316);
    g.fillRect(1, 15, 54, 2);

    // === Crown icon on left ===
    g.fillStyle(0x8a6b00);
    // Crown base
    g.fillRect(4, 11, 8, 3);
    // Crown points (3 triangular)
    g.fillTriangle(4, 11, 5, 5, 6, 11);
    g.fillTriangle(7, 11, 8, 4, 9, 11);
    g.fillTriangle(10, 11, 11, 5, 12, 11);
    // Crown jewels (tiny dots)
    g.fillStyle(0xff3333);
    g.fillRect(5, 8, 1, 1);
    g.fillStyle(0x3344ff);
    g.fillRect(8, 7, 1, 1);
    g.fillStyle(0xff3333);
    g.fillRect(11, 8, 1, 1);

    // === "PREMIUM" in 3px-tall pixel letters ===
    g.fillStyle(0x8a6b00);
    // P (x=16)
    g.fillRect(16, 7, 1, 5);
    g.fillRect(17, 7, 2, 1);
    g.fillRect(18, 8, 1, 1);
    g.fillRect(17, 9, 2, 1);
    // R (x=20)
    g.fillRect(20, 7, 1, 5);
    g.fillRect(21, 7, 2, 1);
    g.fillRect(22, 8, 1, 1);
    g.fillRect(21, 9, 1, 1);
    g.fillRect(22, 10, 1, 2);
    // E (x=24)
    g.fillRect(24, 7, 1, 5);
    g.fillRect(25, 7, 2, 1);
    g.fillRect(25, 9, 1, 1);
    g.fillRect(25, 11, 2, 1);
    // M (x=28)
    g.fillRect(28, 7, 1, 5);
    g.fillRect(29, 8, 1, 1);
    g.fillRect(30, 9, 1, 1);
    g.fillRect(31, 8, 1, 1);
    g.fillRect(32, 7, 1, 5);
    // I (x=34)
    g.fillRect(34, 7, 1, 5);
    // U (x=36)
    g.fillRect(36, 7, 1, 4);
    g.fillRect(37, 11, 2, 1);
    g.fillRect(39, 7, 1, 4);
    // M (x=41)
    g.fillRect(41, 7, 1, 5);
    g.fillRect(42, 8, 1, 1);
    g.fillRect(43, 9, 1, 1);
    g.fillRect(44, 8, 1, 1);
    g.fillRect(45, 7, 1, 5);

    g.generateTexture('bg-premium-banner', 56, 18);
    g.destroy();
  }

  private generateBgOfficeBuilding(): void {
    const g = this.add.graphics();
    // === Building facade ===
    g.fillStyle(0x0a1628);
    g.fillRect(0, 0, 40, 72);
    // Left edge highlight (lighter blue strip)
    g.fillStyle(0x0f2040);
    g.fillRect(0, 0, 2, 72);
    // Right edge shadow
    g.fillStyle(0x080f1c);
    g.fillRect(38, 0, 2, 72);
    // Top edge highlight
    g.fillStyle(0x0f2040);
    g.fillRect(0, 0, 40, 2);

    // === Antenna on roof ===
    g.fillStyle(0x556677);
    g.fillRect(19, 0, 2, 8);
    // Antenna tip
    g.fillStyle(0xff3333);
    g.fillRect(19, 0, 2, 2);

    // === Windows: 3 columns x 8 rows ===
    const winColors = [0xffe088, 0xeeeeff, 0xffe088, 0xeeeeff, 0xffe088, 0xeeeeff, 0xffe088, 0xeeeeff];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 3; col++) {
        const wx = 5 + col * 12;
        const wy = 10 + row * 7;
        // Window alternate between yellow and white
        const colorIdx = (row + col) % 2;
        g.fillStyle(colorIdx === 0 ? 0xffe088 : 0xeeeeff);
        g.fillRect(wx, wy, 6, 4);
        // Window frame (subtle)
        g.fillStyle(0x0c1a30);
        g.fillRect(wx + 3, wy, 1, 4); // vertical divider
        g.fillRect(wx, wy + 2, 6, 1); // horizontal divider
      }
    }

    // === Some windows dark (unlit) ===
    g.fillStyle(0x0a1628);
    g.fillRect(5, 24, 6, 4);    // Row 3, col 1
    g.fillRect(29, 38, 6, 4);   // Row 5, col 3

    // === Entrance at base ===
    g.fillStyle(0x060c18);
    g.fillRect(14, 62, 12, 10);
    // Door frame
    g.fillStyle(0x0c1a30);
    g.fillRect(13, 61, 14, 1);
    g.fillRect(13, 61, 1, 11);
    g.fillRect(26, 61, 1, 11);
    // Door handle
    g.fillStyle(0xccaa44);
    g.fillRect(23, 67, 2, 2);

    // === Structural lines (floor dividers) ===
    g.fillStyle(0x0c1a30);
    for (let row = 0; row < 8; row++) {
      g.fillRect(0, 8 + row * 7, 40, 1);
    }

    g.generateTexture('bg-office-building', 40, 72);
    g.destroy();
  }

  // ── Level 3: Bluesky Background Sprites ──

  private generateBgButterfly(): void {
    const g = this.add.graphics();
    const cx = 14;
    const cy = 12;

    // === Body (thin center line) ===
    g.fillStyle(0x111111);
    g.fillRect(cx, 4, 1, 14);
    // Abdomen taper
    g.fillRect(cx, 16, 1, 3);

    // === Antennae ===
    g.fillStyle(0x222222);
    // Left antenna
    g.fillRect(cx - 1, 3, 1, 1);
    g.fillRect(cx - 2, 2, 1, 1);
    g.fillRect(cx - 3, 1, 1, 1);
    g.fillRect(cx - 4, 0, 2, 1);
    // Right antenna
    g.fillRect(cx + 1, 3, 1, 1);
    g.fillRect(cx + 2, 2, 1, 1);
    g.fillRect(cx + 3, 1, 1, 1);
    g.fillRect(cx + 3, 0, 2, 1);

    // === Left upper wing ===
    g.fillStyle(0x0060cc);
    // Outline using overlapping shapes
    g.fillCircle(cx - 5, 7, 5);
    g.fillCircle(cx - 4, 5, 4);
    g.fillCircle(cx - 3, 9, 4);
    // Fill inner area
    g.fillStyle(0x0085FF);
    g.fillCircle(cx - 5, 7, 4);
    g.fillCircle(cx - 4, 6, 3);
    g.fillCircle(cx - 3, 8, 3);
    // White spots
    g.fillStyle(0xffffff);
    g.fillCircle(cx - 6, 6, 1);
    g.fillCircle(cx - 4, 9, 1);

    // === Right upper wing ===
    g.fillStyle(0x0060cc);
    g.fillCircle(cx + 5, 7, 5);
    g.fillCircle(cx + 4, 5, 4);
    g.fillCircle(cx + 3, 9, 4);
    g.fillStyle(0x0085FF);
    g.fillCircle(cx + 5, 7, 4);
    g.fillCircle(cx + 4, 6, 3);
    g.fillCircle(cx + 3, 8, 3);
    // White spots
    g.fillStyle(0xffffff);
    g.fillCircle(cx + 6, 6, 1);
    g.fillCircle(cx + 4, 9, 1);

    // === Left lower wing (smaller) ===
    g.fillStyle(0x0060cc);
    g.fillCircle(cx - 4, 14, 4);
    g.fillCircle(cx - 3, 13, 3);
    g.fillStyle(0x0085FF);
    g.fillCircle(cx - 4, 14, 3);
    g.fillCircle(cx - 3, 13, 2);
    // White spot
    g.fillStyle(0xffffff);
    g.fillCircle(cx - 5, 14, 1);

    // === Right lower wing (smaller) ===
    g.fillStyle(0x0060cc);
    g.fillCircle(cx + 4, 14, 4);
    g.fillCircle(cx + 3, 13, 3);
    g.fillStyle(0x0085FF);
    g.fillCircle(cx + 4, 14, 3);
    g.fillCircle(cx + 3, 13, 2);
    // White spot
    g.fillStyle(0xffffff);
    g.fillCircle(cx + 5, 14, 1);

    // === Body re-draw on top ===
    g.fillStyle(0x111111);
    g.fillRect(cx, 4, 1, 14);

    g.generateTexture('bg-butterfly', 28, 22);
    g.destroy();
  }

  private generateBgCloud(): void {
    const g = this.add.graphics();
    // === Deep shadow layer on underside ===
    g.fillStyle(0xbbbbbb);
    g.fillCircle(14, 20, 9);
    g.fillCircle(28, 21, 11);
    g.fillCircle(42, 20, 8);
    g.fillRect(8, 22, 40, 4);

    // === Mid-shadow on underside ===
    g.fillStyle(0xcccccc);
    g.fillCircle(14, 18, 10);
    g.fillCircle(28, 19, 12);
    g.fillCircle(42, 18, 9);
    g.fillRect(6, 20, 44, 5);

    // === Main cloud body — overlapping circles ===
    // Slight off-white base layer
    g.fillStyle(0xe8e8e8);
    g.fillCircle(8, 16, 8);
    g.fillCircle(48, 16, 7);
    // Off-white side bubbles
    g.fillStyle(0xf0f0f0);
    g.fillCircle(12, 14, 10);
    g.fillCircle(44, 14, 9);
    // Main white upper bubbles
    g.fillStyle(0xffffff);
    g.fillCircle(20, 10, 11);
    g.fillCircle(28, 8, 14);
    g.fillCircle(36, 10, 11);
    // Smaller accent bubbles on sides
    g.fillStyle(0xffffff);
    g.fillCircle(10, 16, 8);
    g.fillCircle(46, 16, 7);
    // Extra volume bumps
    g.fillStyle(0xfafafa);
    g.fillCircle(16, 12, 7);
    g.fillCircle(40, 12, 7);

    // === Flat bottom edge ===
    g.fillStyle(0xffffff);
    g.fillRect(4, 18, 48, 4);
    // Bottom shadow strip
    g.fillStyle(0xcccccc);
    g.fillRect(4, 22, 48, 3);
    // Slightly lighter inner shadow
    g.fillStyle(0xdddddd);
    g.fillRect(8, 22, 40, 2);
    // Subtle shadow gradient at very bottom
    g.fillStyle(0xc0c0c0);
    g.fillRect(10, 24, 36, 2);

    // === Highlight bumps on top ===
    g.fillStyle(0xffffff);
    g.fillCircle(22, 6, 5);
    g.fillCircle(34, 6, 5);
    // Extra bright highlights (top-left lighting)
    g.fillStyle(0xffffff);
    g.fillCircle(18, 5, 3);
    g.fillCircle(26, 3, 4);
    g.fillCircle(32, 5, 3);

    g.generateTexture('bg-cloud', 56, 28);
    g.destroy();
  }

  private generateBgBskyLogo(): void {
    const g = this.add.graphics();
    const cx = 14;
    const cy = 14;

    // === Left wing shadow (darker, offset) ===
    g.fillStyle(0x0055aa);
    g.fillCircle(cx - 5, cy - 2, 6);
    g.fillCircle(cx - 4, cy - 4, 5);
    g.fillCircle(cx - 3, cy + 1, 5);

    // === Right wing shadow ===
    g.fillCircle(cx + 5, cy - 2, 6);
    g.fillCircle(cx + 4, cy - 4, 5);
    g.fillCircle(cx + 3, cy + 1, 5);

    // === Left wing (wider at top, tapered at bottom) ===
    g.fillStyle(0x0085FF);
    // Build wing from overlapping circles and rects
    g.fillCircle(cx - 5, cy - 3, 6);
    g.fillCircle(cx - 4, cy - 5, 5);
    g.fillCircle(cx - 3, cy, 5);
    g.fillRect(cx - 9, cy - 4, 7, 6);
    // Taper bottom
    g.fillCircle(cx - 2, cy + 3, 3);
    // Wing inner shape
    g.fillCircle(cx - 6, cy - 2, 4);

    // === Right wing (mirror) ===
    g.fillStyle(0x0085FF);
    g.fillCircle(cx + 5, cy - 3, 6);
    g.fillCircle(cx + 4, cy - 5, 5);
    g.fillCircle(cx + 3, cy, 5);
    g.fillRect(cx + 2, cy - 4, 7, 6);
    // Taper bottom
    g.fillCircle(cx + 2, cy + 3, 3);
    // Wing inner shape
    g.fillCircle(cx + 6, cy - 2, 4);

    // === Body line between wings ===
    g.fillStyle(0x0060cc);
    g.fillRect(cx, cy - 6, 1, 16);
    g.fillRect(cx - 1, cy - 4, 3, 12);

    // === Stem/stalk below ===
    g.fillStyle(0x0060cc);
    g.fillRect(cx - 1, cy + 6, 3, 6);
    // Stem base widens
    g.fillRect(cx - 2, cy + 10, 5, 2);
    // Stem shadow
    g.fillStyle(0x004499);
    g.fillRect(cx + 1, cy + 7, 1, 5);

    // === Wing highlights (top-left lighting) ===
    g.fillStyle(0x33aaff);
    g.fillCircle(cx - 5, cy - 5, 3);
    g.fillCircle(cx + 5, cy - 5, 3);
    // Extra bright spots
    g.fillStyle(0x55ccff);
    g.fillCircle(cx - 6, cy - 4, 2);
    g.fillCircle(cx + 4, cy - 6, 2);
    // Subtle inner glow
    g.fillStyle(0x44bbff);
    g.fillCircle(cx - 3, cy - 2, 2);
    g.fillCircle(cx + 3, cy - 2, 2);

    g.generateTexture('bg-bsky-logo', 28, 28);
    g.destroy();
  }

  // ── Level 4: ArXiv Background Sprites ──

  private generateBgScientist(): void {
    const g = this.add.graphics();
    // === Chair (behind figure) ===
    g.fillStyle(0x444444);
    g.fillRect(4, 16, 12, 2);  // chair seat
    g.fillRect(3, 10, 2, 8);   // chair back left
    g.fillRect(15, 10, 2, 8);  // chair back right
    g.fillRect(3, 10, 14, 2);  // chair back top
    // Chair legs
    g.fillStyle(0x3a3a3a);
    g.fillRect(4, 30, 2, 6);
    g.fillRect(14, 30, 2, 6);
    // Chair wheels
    g.fillStyle(0x333333);
    g.fillCircle(5, 37, 2);
    g.fillCircle(15, 37, 2);

    // === Desk ===
    g.fillStyle(0x6b4423);
    g.fillRect(0, 28, 28, 3);
    // Desk legs
    g.fillStyle(0x5a3a1a);
    g.fillRect(1, 31, 2, 10);
    g.fillRect(25, 31, 2, 10);
    // Desk edge highlight
    g.fillStyle(0x7b5433);
    g.fillRect(0, 28, 28, 1);
    // Desk shadow
    g.fillStyle(0x5a3a1a);
    g.fillRect(0, 30, 28, 1);

    // === Monitor on desk ===
    // Monitor bezel
    g.fillStyle(0x333333);
    g.fillRect(14, 16, 13, 12);
    // Screen
    g.fillStyle(0x1a3050);
    g.fillRect(15, 17, 11, 10);
    // Green text lines on screen
    g.fillStyle(0x44cc44);
    g.fillRect(16, 18, 8, 1);
    g.fillRect(16, 20, 6, 1);
    g.fillRect(16, 22, 9, 1);
    g.fillRect(16, 24, 5, 1);
    // Monitor stand
    g.fillStyle(0x444444);
    g.fillRect(19, 28, 3, 1);
    g.fillRect(18, 27, 5, 1);

    // === Coffee mug ===
    g.fillStyle(0x8b5e3c);
    g.fillRect(2, 23, 4, 5);
    // Mug handle
    g.fillStyle(0x7a5030);
    g.fillRect(6, 24, 2, 1);
    g.fillRect(7, 24, 1, 3);
    g.fillRect(6, 26, 2, 1);
    // Coffee inside
    g.fillStyle(0x3a2010);
    g.fillRect(2, 23, 4, 2);
    // Steam
    g.fillStyle(0xcccccc);
    g.fillRect(3, 21, 1, 2);
    g.fillRect(5, 20, 1, 2);

    // === Figure (seated, hunched forward) ===
    // Body
    g.fillStyle(0x4a6080);
    g.fillRect(5, 18, 10, 10);
    // Body shadow
    g.fillStyle(0x3a5070);
    g.fillRect(13, 19, 2, 8);
    // Arms reaching to desk/keyboard
    g.fillStyle(0x4a6080);
    g.fillRect(4, 22, 3, 6);
    g.fillRect(13, 22, 3, 6);
    // Hands
    g.fillStyle(0xffcba4);
    g.fillRect(8, 27, 3, 2);
    g.fillRect(12, 27, 3, 2);

    // === Head ===
    g.fillStyle(0xffcba4);
    g.fillRect(6, 8, 8, 9);
    // Hair
    g.fillStyle(0x4a3020);
    g.fillRect(6, 6, 8, 3);
    g.fillRect(5, 7, 2, 4);
    // Head shadow
    g.fillStyle(0xeebb90);
    g.fillRect(12, 9, 2, 7);
    // Glasses frames
    g.fillStyle(0x333333);
    g.fillRect(7, 11, 3, 2);   // left lens
    g.fillRect(11, 11, 3, 2);  // right lens
    g.fillRect(10, 11, 1, 1);  // bridge
    // Glasses shine
    g.fillStyle(0x6688aa);
    g.fillRect(7, 11, 1, 1);
    g.fillRect(11, 11, 1, 1);
    // Eyes behind glasses
    g.fillStyle(0x222222);
    g.fillRect(8, 12, 1, 1);
    g.fillRect(12, 12, 1, 1);
    // Mouth
    g.fillStyle(0xdd9980);
    g.fillRect(9, 15, 3, 1);

    g.generateTexture('bg-scientist', 28, 44);
    g.destroy();
  }

  private generateBgServerRack(): void {
    const g = this.add.graphics();
    // === Outer frame ===
    g.fillStyle(0x333333);
    g.fillRect(0, 0, 20, 48);
    // Inner panel slightly lighter
    g.fillStyle(0x3a3a3a);
    g.fillRect(1, 1, 18, 46);

    // === Mounting rails on sides ===
    g.fillStyle(0x666666);
    g.fillRect(0, 0, 1, 48);
    g.fillRect(19, 0, 1, 48);
    // Rail screw holes
    g.fillStyle(0x555555);
    for (let y = 2; y < 48; y += 8) {
      g.fillRect(0, y, 1, 1);
      g.fillRect(19, y, 1, 1);
    }

    // === 6 server units ===
    for (let i = 0; i < 6; i++) {
      const sy = 2 + i * 7;
      // Server unit body
      g.fillStyle(0x444444);
      g.fillRect(2, sy, 16, 6);
      // Unit face plate
      g.fillStyle(0x4a4a4a);
      g.fillRect(2, sy, 16, 1);
      // Unit bottom edge shadow
      g.fillStyle(0x3a3a3a);
      g.fillRect(2, sy + 5, 16, 1);

      // LEDs — green and amber
      g.fillStyle(0x44ff44);
      g.fillRect(3, sy + 2, 2, 2);
      g.fillStyle(0xffaa00);
      g.fillRect(6, sy + 2, 2, 2);
      // Third LED alternating
      g.fillStyle(i % 2 === 0 ? 0x44ff44 : 0xff4444);
      g.fillRect(9, sy + 2, 2, 2);

      // Drive activity indicator (small rect)
      g.fillStyle(0x555555);
      g.fillRect(12, sy + 1, 5, 4);
      g.fillStyle(0x4a4a4a);
      g.fillRect(13, sy + 2, 3, 2);

      // LED glow effect (subtle bright pixel next to LED)
      g.fillStyle(0x44ff44);
      g.fillRect(5, sy + 2, 1, 1);
    }

    // === Ventilation grille at bottom ===
    g.fillStyle(0x555555);
    for (let y = 44; y < 47; y++) {
      g.fillRect(3, y, 14, 1);
      g.fillStyle(0x3a3a3a);
      g.fillRect(3, y + 1, 14, 1);
      g.fillStyle(0x555555);
    }

    // === Power cables on right side ===
    g.fillStyle(0x222222);
    g.fillRect(17, 4, 2, 40);
    g.fillStyle(0x2a2a2a);
    g.fillRect(18, 4, 1, 40);

    // === Top vent ===
    g.fillStyle(0x555555);
    g.fillRect(4, 0, 12, 1);

    g.generateTexture('bg-server-rack', 20, 48);
    g.destroy();
  }

  private generateBgTerminal(): void {
    const g = this.add.graphics();
    // === Monitor bezel ===
    g.fillStyle(0x333333);
    g.fillRect(0, 0, 28, 18);
    // Bezel highlight (top-left)
    g.fillStyle(0x444444);
    g.fillRect(0, 0, 28, 1);
    g.fillRect(0, 0, 1, 18);
    // Bezel shadow (bottom-right)
    g.fillStyle(0x2a2a2a);
    g.fillRect(0, 17, 28, 1);
    g.fillRect(27, 0, 1, 18);

    // === Screen ===
    g.fillStyle(0x0a0a0a);
    g.fillRect(2, 2, 24, 14);
    // Subtle screen border glow
    g.fillStyle(0x112211);
    g.fillRect(2, 2, 24, 1);
    g.fillRect(2, 2, 1, 14);

    // === Green text lines ===
    g.fillStyle(0x44cc44);
    g.fillRect(4, 4, 12, 1);    // line 1
    g.fillRect(4, 6, 18, 1);    // line 2
    g.fillRect(4, 8, 14, 1);    // line 3
    g.fillRect(4, 10, 16, 1);   // line 4
    g.fillRect(4, 12, 8, 1);    // line 5 (shorter, prompt)
    // Cursor block at end of last line
    g.fillStyle(0x66ff66);
    g.fillRect(13, 12, 2, 2);
    // Prompt symbol
    g.fillStyle(0x33aa33);
    g.fillRect(4, 12, 2, 1);

    // === Green power LED ===
    g.fillStyle(0x44ff44);
    g.fillRect(24, 16, 2, 1);
    // LED glow
    g.fillStyle(0x338833);
    g.fillRect(23, 16, 1, 1);

    // === Keyboard below ===
    g.fillStyle(0x888888);
    g.fillRect(2, 19, 24, 4);
    // Key grid pattern
    g.fillStyle(0x666666);
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 7; col++) {
        g.fillRect(3 + col * 3, 19 + row * 2, 2, 1);
      }
    }
    // Spacebar
    g.fillStyle(0x666666);
    g.fillRect(8, 22, 12, 1);
    // Keyboard highlight
    g.fillStyle(0x999999);
    g.fillRect(2, 19, 24, 1);

    g.generateTexture('bg-terminal', 28, 24);
    g.destroy();
  }

  // ── Level 5: PhilPapers Background Sprites ──

  private generateBgIvoryTower(): void {
    const g = this.add.graphics();
    // === Stone steps at base ===
    g.fillStyle(0xb8ac90);
    g.fillRect(4, 82, 20, 3);
    g.fillStyle(0xc0b490);
    g.fillRect(2, 85, 24, 3);

    // === Main tower body ===
    g.fillStyle(0xd4c8a0);
    g.fillRect(6, 18, 16, 64);
    // Left highlight
    g.fillStyle(0xddd4b0);
    g.fillRect(6, 18, 3, 64);
    // Right shadow
    g.fillStyle(0xc0b490);
    g.fillRect(19, 18, 3, 64);

    // === Masonry block texture (horizontal lines with offset joints) ===
    g.fillStyle(0xc0b490);
    for (let y = 0; y < 8; y++) {
      const by = 22 + y * 8;
      g.fillRect(6, by, 16, 1);
      // Offset vertical joints
      const offset = y % 2 === 0 ? 0 : 4;
      g.fillRect(10 + offset, by - 7, 1, 7);
      g.fillRect(18 + offset, by - 7, 1, 7);
    }

    // === 3 Gothic arched windows with warm glow ===
    for (let i = 0; i < 3; i++) {
      const wy = 28 + i * 18;
      // Window recess (dark)
      g.fillStyle(0x8a7e60);
      g.fillRect(11, wy, 6, 10);
      // Pointed arch top
      g.fillTriangle(11, wy, 14, wy - 3, 17, wy);
      // Warm yellow glow fill
      g.fillStyle(0xffe8a0);
      g.fillRect(12, wy + 1, 4, 8);
      // Pointed arch glow
      g.fillTriangle(12, wy + 1, 14, wy - 1, 16, wy + 1);
      // Window mullion (center vertical bar)
      g.fillStyle(0xb0a480);
      g.fillRect(13, wy, 1, 9);
      // Window sill
      g.fillStyle(0xc8bc90);
      g.fillRect(10, wy + 9, 8, 1);
    }

    // === Crenellated parapet ===
    g.fillStyle(0xd4c8a0);
    g.fillRect(4, 14, 20, 5);
    // Crenellations (alternating filled/empty 3px squares)
    g.fillStyle(0xd4c8a0);
    g.fillRect(4, 10, 3, 4);
    g.fillRect(10, 10, 3, 4);
    g.fillRect(16, 10, 3, 4);
    g.fillRect(22, 10, 2, 4);
    // Parapet highlight
    g.fillStyle(0xddd4b0);
    g.fillRect(4, 10, 3, 1);
    g.fillRect(10, 10, 3, 1);
    g.fillRect(16, 10, 3, 1);

    // === Pointed spire above parapet ===
    g.fillStyle(0xc8bc90);
    g.fillTriangle(14, 0, 8, 10, 20, 10);
    // Spire highlight (left face)
    g.fillStyle(0xd4c8a0);
    g.fillTriangle(14, 0, 8, 10, 14, 10);
    // Spire tip
    g.fillStyle(0xb0a480);
    g.fillRect(13, 0, 2, 3);

    // === Wispy cloud wreath around upper third ===
    g.fillStyle(0xffffff);
    g.fillCircle(3, 22, 4);
    g.fillCircle(7, 20, 3);
    g.fillCircle(25, 24, 4);
    g.fillCircle(22, 21, 3);
    g.fillCircle(1, 26, 3);
    g.fillCircle(27, 27, 3);

    // === Door at base ===
    g.fillStyle(0x5a4e38);
    g.fillRect(11, 76, 6, 6);
    // Door arch
    g.fillTriangle(11, 76, 14, 74, 17, 76);
    // Door handle
    g.fillStyle(0xccaa44);
    g.fillRect(15, 79, 1, 1);

    g.generateTexture('bg-ivory-tower', 28, 88);
    g.destroy();
  }

  private generateBgPhilosopher(): void {
    const g = this.add.graphics();
    // === Robe (trapezoid widening from shoulders to feet) ===
    g.fillStyle(0x5C4033);
    g.fillTriangle(10, 12, 2, 36, 18, 36);
    g.fillRect(4, 30, 12, 6);
    // Robe fold lines (darker vertical stripes)
    g.fillStyle(0x4a3528);
    g.fillRect(7, 16, 1, 20);
    g.fillRect(10, 14, 1, 22);
    g.fillRect(13, 16, 1, 20);
    // Robe highlight (left side, top-left lighting)
    g.fillStyle(0x6b5040);
    g.fillRect(5, 18, 2, 16);
    // Robe shadow (right side)
    g.fillStyle(0x4a3528);
    g.fillRect(15, 18, 2, 16);

    // === Sandals ===
    g.fillStyle(0x8b7355);
    g.fillRect(4, 36, 4, 3);
    g.fillRect(12, 36, 4, 3);
    // Sandal straps
    g.fillStyle(0x7a6245);
    g.fillRect(5, 36, 2, 1);
    g.fillRect(13, 36, 2, 1);

    // === Head ===
    g.fillStyle(0xffcba4);
    g.fillRect(6, 2, 8, 9);
    // Face shadow
    g.fillStyle(0xeebb90);
    g.fillRect(12, 3, 2, 7);
    // Face highlight
    g.fillStyle(0xffddb8);
    g.fillRect(6, 2, 2, 8);
    // Eyes
    g.fillStyle(0x333333);
    g.fillRect(7, 5, 2, 2);
    g.fillRect(11, 5, 2, 2);
    // Eyebrows (furrowed, thinking)
    g.fillStyle(0x5a4030);
    g.fillRect(7, 4, 3, 1);
    g.fillRect(11, 4, 3, 1);
    // Nose
    g.fillStyle(0xeebb90);
    g.fillRect(9, 6, 2, 2);
    // Mouth (under beard)
    g.fillStyle(0xdd9980);
    g.fillRect(8, 9, 3, 1);

    // === Beard ===
    g.fillStyle(0x6b5040);
    g.fillRect(7, 9, 6, 2);
    g.fillRect(8, 11, 4, 2);
    g.fillRect(9, 13, 2, 1);
    // Beard highlight
    g.fillStyle(0x7a5f50);
    g.fillRect(7, 9, 2, 1);

    // === Hair (bald top with sides) ===
    g.fillStyle(0x6b5040);
    g.fillRect(5, 3, 2, 6);
    g.fillRect(13, 3, 2, 6);
    g.fillRect(6, 1, 8, 2);

    // === Hand raised to chin (thinking) ===
    g.fillStyle(0x5C4033);
    // Arm coming from robe
    g.fillRect(5, 14, 3, 4);
    g.fillRect(4, 12, 3, 4);
    // Hand near chin
    g.fillStyle(0xffcba4);
    g.fillRect(6, 10, 3, 3);
    // Fingers
    g.fillRect(5, 10, 1, 2);

    // === Book under other arm ===
    g.fillStyle(0x8b1a1a);
    g.fillRect(14, 18, 4, 6);
    // Book spine
    g.fillStyle(0x6b1010);
    g.fillRect(14, 18, 1, 6);
    // Book pages
    g.fillStyle(0xeeeedd);
    g.fillRect(15, 19, 2, 4);
    // Book highlight
    g.fillStyle(0x9b2a2a);
    g.fillRect(15, 18, 3, 1);

    g.generateTexture('bg-philosopher', 20, 40);
    g.destroy();
  }

  // ── Level 6: SSRN Background Sprites ──

  private generateBgSocialScientist(): void {
    const g = this.add.graphics();
    // === Legs ===
    g.fillStyle(0x2a2a3a);
    g.fillRect(5, 28, 4, 8);
    g.fillRect(11, 28, 4, 8);
    // Shoes
    g.fillStyle(0x222222);
    g.fillRect(4, 36, 5, 3);
    g.fillRect(11, 36, 5, 3);
    // Shoe highlights
    g.fillStyle(0x333333);
    g.fillRect(4, 36, 5, 1);
    g.fillRect(11, 36, 5, 1);

    // === Professional shirt ===
    g.fillStyle(0x4477aa);
    g.fillRect(4, 14, 12, 14);
    // Shirt shadow (right)
    g.fillStyle(0x366699);
    g.fillRect(14, 15, 2, 12);
    // Shirt highlight (left)
    g.fillStyle(0x5588bb);
    g.fillRect(4, 14, 2, 13);
    // Shirt collar
    g.fillStyle(0x5588bb);
    g.fillRect(7, 13, 6, 2);
    // Button line
    g.fillStyle(0x3366aa);
    g.fillRect(9, 16, 1, 10);
    // Buttons
    g.fillStyle(0xdddddd);
    g.fillRect(9, 17, 1, 1);
    g.fillRect(9, 20, 1, 1);
    g.fillRect(9, 23, 1, 1);
    // Pen in pocket
    g.fillStyle(0x222222);
    g.fillRect(6, 15, 1, 4);
    g.fillStyle(0xcccccc);
    g.fillRect(6, 15, 1, 1);

    // === Left arm (holding clipboard) ===
    g.fillStyle(0x4477aa);
    g.fillRect(1, 15, 3, 10);
    // Left hand
    g.fillStyle(0xffcba4);
    g.fillRect(1, 25, 3, 2);

    // === Clipboard ===
    g.fillStyle(0xddddaa);
    g.fillRect(0, 20, 5, 8);
    // Clipboard clip at top
    g.fillStyle(0x888888);
    g.fillRect(1, 19, 3, 2);
    // Chart marks on clipboard
    g.fillStyle(0x666666);
    g.fillRect(1, 22, 3, 1);
    g.fillRect(1, 24, 2, 1);
    g.fillRect(1, 26, 3, 1);
    // Small bar chart on clipboard
    g.fillStyle(0x4477aa);
    g.fillRect(1, 25, 1, 2);
    g.fillRect(3, 24, 1, 3);

    // === Right arm (extended, finger raised / lecturing) ===
    g.fillStyle(0x4477aa);
    g.fillRect(16, 15, 3, 5);
    g.fillRect(17, 14, 3, 3);
    // Hand
    g.fillStyle(0xffcba4);
    g.fillRect(18, 12, 2, 3);
    // Index finger pointing up
    g.fillRect(18, 9, 1, 3);

    // === Head ===
    g.fillStyle(0xffcba4);
    g.fillRect(6, 2, 8, 10);
    // Head shadow
    g.fillStyle(0xeebb90);
    g.fillRect(12, 3, 2, 8);
    // Head highlight
    g.fillStyle(0xffddb8);
    g.fillRect(6, 2, 2, 9);
    // Hair
    g.fillStyle(0x3a2a18);
    g.fillRect(6, 0, 8, 3);
    g.fillRect(5, 1, 2, 4);
    g.fillRect(13, 1, 2, 4);

    // === Glasses ===
    g.fillStyle(0x333333);
    g.fillRect(7, 5, 3, 2);   // left frame
    g.fillRect(11, 5, 3, 2);  // right frame
    g.fillRect(10, 5, 1, 1);  // bridge
    // Lens shine
    g.fillStyle(0x6688aa);
    g.fillRect(7, 5, 1, 1);
    g.fillRect(11, 5, 1, 1);
    // Eyes behind glasses
    g.fillStyle(0x222222);
    g.fillRect(8, 6, 1, 1);
    g.fillRect(12, 6, 1, 1);
    // Mouth
    g.fillStyle(0xdd9980);
    g.fillRect(8, 9, 4, 1);

    g.generateTexture('bg-social-scientist', 20, 40);
    g.destroy();
  }

  private generateBgBarChart(): void {
    const g = this.add.graphics();
    // === L-shaped axes ===
    g.fillStyle(0x222222);
    // Y-axis (vertical left edge)
    g.fillRect(3, 1, 1, 21);
    // X-axis (horizontal bottom edge)
    g.fillRect(3, 21, 27, 1);
    // Axis tick marks on Y
    g.fillRect(2, 4, 1, 1);
    g.fillRect(2, 9, 1, 1);
    g.fillRect(2, 14, 1, 1);
    g.fillRect(2, 19, 1, 1);
    // Axis tick marks on X
    g.fillRect(7, 22, 1, 1);
    g.fillRect(12, 22, 1, 1);
    g.fillRect(17, 22, 1, 1);
    g.fillRect(22, 22, 1, 1);
    g.fillRect(27, 22, 1, 1);

    // === 5 bars of different heights ===
    // Bar 1 — blue
    g.fillStyle(0x4477aa);
    g.fillRect(5, 12, 4, 9);
    g.fillStyle(0x5588bb);
    g.fillRect(5, 12, 1, 9);   // highlight
    g.fillStyle(0x336699);
    g.fillRect(8, 12, 1, 9);   // shadow

    // Bar 2 — orange
    g.fillStyle(0xcc6644);
    g.fillRect(10, 8, 4, 13);
    g.fillStyle(0xdd7755);
    g.fillRect(10, 8, 1, 13);
    g.fillStyle(0xbb5533);
    g.fillRect(13, 8, 1, 13);

    // Bar 3 — green
    g.fillStyle(0x44aa66);
    g.fillRect(15, 14, 4, 7);
    g.fillStyle(0x55bb77);
    g.fillRect(15, 14, 1, 7);
    g.fillStyle(0x339955);
    g.fillRect(18, 14, 1, 7);

    // Bar 4 — rose
    g.fillStyle(0xaa4466);
    g.fillRect(20, 6, 4, 15);
    g.fillStyle(0xbb5577);
    g.fillRect(20, 6, 1, 15);
    g.fillStyle(0x993355);
    g.fillRect(23, 6, 1, 15);

    // Bar 5 — purple
    g.fillStyle(0x8866aa);
    g.fillRect(25, 10, 4, 11);
    g.fillStyle(0x9977bb);
    g.fillRect(25, 10, 1, 11);
    g.fillStyle(0x775599);
    g.fillRect(28, 10, 1, 11);

    // === Dotted red trend line (going upward left to right) ===
    g.fillStyle(0xe06c75);
    // Dots: alternating 2px on, 2px off, roughly going from (6,11) to (27,5)
    g.fillRect(6, 11, 2, 1);
    g.fillRect(10, 10, 2, 1);
    g.fillRect(14, 9, 2, 1);
    g.fillRect(18, 7, 2, 1);
    g.fillRect(22, 6, 2, 1);
    g.fillRect(26, 5, 2, 1);

    g.generateTexture('bg-bar-chart', 32, 24);
    g.destroy();
  }

  private generateBgPaywallLock(): void {
    const g = this.add.graphics();
    // === U-shaped shackle arch at top ===
    // Left vertical bar of shackle
    g.fillStyle(0x999999);
    g.fillRect(3, 4, 3, 8);
    // Right vertical bar of shackle
    g.fillRect(12, 4, 3, 8);
    // Top connecting bar
    g.fillRect(3, 2, 12, 3);
    // Inner cutout of shackle (background/empty space)
    g.fillStyle(0x000000);
    g.fillRect(6, 4, 6, 6);
    // Shackle round top (approximate curve)
    g.fillStyle(0x999999);
    g.fillRect(5, 1, 8, 2);
    g.fillRect(4, 2, 2, 2);
    g.fillRect(12, 2, 2, 2);
    // Shackle highlight (left side - top-left lighting)
    g.fillStyle(0xaaaaaa);
    g.fillRect(3, 3, 1, 8);
    g.fillRect(4, 1, 1, 3);
    g.fillRect(5, 0, 3, 1);
    // Shackle shadow (right side)
    g.fillStyle(0x777777);
    g.fillRect(14, 3, 1, 9);
    g.fillRect(13, 1, 1, 3);
    g.fillRect(12, 0, 2, 1);

    // === Lock body ===
    g.fillStyle(0x888888);
    g.fillRect(3, 11, 12, 10);
    // 3D bevel — highlight on top and left
    g.fillStyle(0xbbbbbb);
    g.fillRect(3, 11, 12, 1);
    g.fillRect(3, 11, 1, 10);
    // 3D bevel — shadow on bottom and right
    g.fillStyle(0x555555);
    g.fillRect(3, 20, 12, 1);
    g.fillRect(14, 11, 1, 10);
    // Lighter left side (top-left lighting)
    g.fillStyle(0xaaaaaa);
    g.fillRect(4, 12, 4, 8);
    // Darker right side
    g.fillStyle(0x666666);
    g.fillRect(11, 12, 3, 8);

    // === Keyhole ===
    // Circle part
    g.fillStyle(0x333333);
    g.fillCircle(9, 15, 2);
    // Slot below circle
    g.fillRect(8, 16, 2, 3);
    // Keyhole highlight (subtle metallic sheen)
    g.fillStyle(0x444444);
    g.fillRect(8, 14, 1, 1);

    // === Lock face plate lines ===
    g.fillStyle(0x7a7a7a);
    g.fillRect(4, 14, 2, 1);
    g.fillRect(12, 14, 2, 1);

    g.generateTexture('bg-paywall-lock', 18, 24);
    g.destroy();
  }
}
