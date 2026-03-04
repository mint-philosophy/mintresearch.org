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
    this.generateParrotNoSprite();
    this.generateSlopPoopSprite();
    this.generatePowerUps();
    this.generateCheckpoint();
    this.generateParticle();
    this.generateEnemies();
    this.generateBossSprites();
    this.generateClawd();
    this.generateBackgroundSprites();
    this.generateLobsterSprite();
    this.generateRedBookSprite();
    this.generateGreenHatSprite();
    this.generateMacBombSprite();
    this.generateLipstickMintySprite();
    this.generateCreditsAshMinty();
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

  private generateParrotNoSprite(): void {
    const g = this.add.graphics();
    // White speech bubble shape
    g.fillStyle(0xffffff);
    g.fillCircle(7, 4, 4);  // main bubble
    g.fillRect(3, 1, 8, 7);
    // Bubble tail (bottom-left triangle)
    g.fillTriangle(3, 7, 1, 10, 6, 7);
    // "NO!" text in red (pixel letters)
    g.fillStyle(0xff0000);
    // N
    g.fillRect(3, 2, 1, 5);
    g.fillRect(4, 3, 1, 1);
    g.fillRect(5, 4, 1, 1);
    g.fillRect(6, 2, 1, 5);
    // O
    g.fillRect(8, 2, 1, 5);
    g.fillRect(9, 2, 1, 1);
    g.fillRect(9, 6, 1, 1);
    g.fillRect(10, 2, 1, 5);
    // !
    g.fillRect(12, 2, 1, 3);
    g.fillRect(12, 6, 1, 1);
    g.generateTexture('parrot-no', 14, 10);
    g.destroy();
  }

  private generateSlopPoopSprite(): void {
    const g = this.add.graphics();
    // Brown coil base (bottom to top)
    g.fillStyle(0x6b4423);
    g.fillRect(1, 8, 10, 3);  // base
    g.fillStyle(0x7a5030);
    g.fillRect(2, 5, 8, 4);   // mid section
    g.fillStyle(0x8b5e3c);
    g.fillRect(3, 2, 6, 4);   // top coil
    // Peak
    g.fillStyle(0x9b6e4c);
    g.fillRect(5, 1, 3, 2);
    g.fillRect(6, 0, 1, 1);
    // Eyes (white with pupils)
    g.fillStyle(0xffffff);
    g.fillRect(4, 4, 2, 2);
    g.fillRect(7, 4, 2, 2);
    g.fillStyle(0x000000);
    g.fillRect(5, 5, 1, 1);
    g.fillRect(8, 5, 1, 1);
    // Slight smile
    g.fillStyle(0x000000);
    g.fillRect(5, 7, 3, 1);
    g.generateTexture('slop-poop', 12, 12);
    g.destroy();
  }

  private generatePowerUps(): void {
    // Shield — Anthropic: Orange 5-arm starburst
    this.generateAnthropicLogo();
    // OpenAI: Black hexagonal knot
    this.generateOpenAILogo();
    // Speed Bolt — Google/Gemini: 4-pointed sparkle in 4 colors
    this.generateGeminiLogo();
    // SSI — Safe Superintelligence: White circle with "SSI"
    this.generateSSILogo();
    // Grok/xAI: Black circle + diagonal Saturn ring
    this.generateGrokLogo();
    // Clippy: Blue with paperclip shape
    this.generateClippyLogo();
    // Fog Cloud: Gray with cloud shape
    this.generateFogLogo();
    // Data Leak: Red with "!"
    this.generateDataLeakLogo();
    // Copilot: Blue + green figure-8
    this.generateCopilotLogo();
    // Meta power-down: Blue infinity loop
    this.generateMetaPDLogo();
    // Qwen: Indigo circle with Q
    this.generateQwenLogo();
    // OpenClaw: Red crab claw
    this.generateOpenClawLogo();
    // DeepSeek: Blue whale
    this.generateDeepSeekLogo();
  }

  private generateAnthropicLogo(): void {
    const g = this.add.graphics();
    const cx = 12, cy = 12;
    // Subtle glow circle behind
    g.fillStyle(0xC15F3C, 0.15);
    g.fillCircle(cx, cy, 11);
    g.fillStyle(0xC15F3C, 0.25);
    g.fillCircle(cx, cy, 8);
    // Angular "A" shape — two diagonal strokes meeting at a point, no crossbar, open bottom
    g.fillStyle(0xC15F3C);
    // Left stroke (going from top-center down-left)
    g.fillRect(11, 3, 2, 2);
    g.fillRect(10, 5, 2, 2);
    g.fillRect(9, 7, 2, 2);
    g.fillRect(8, 9, 2, 2);
    g.fillRect(7, 11, 2, 2);
    g.fillRect(6, 13, 2, 2);
    g.fillRect(5, 15, 2, 3);
    // Right stroke (going from top-center down-right)
    g.fillRect(13, 5, 2, 2);
    g.fillRect(14, 7, 2, 2);
    g.fillRect(15, 9, 2, 2);
    g.fillRect(16, 11, 2, 2);
    g.fillRect(17, 13, 2, 2);
    g.fillRect(18, 15, 2, 3);
    // Peak highlight
    g.fillStyle(0xd47a5a);
    g.fillRect(11, 3, 2, 1);
    g.generateTexture('pu-shield', 24, 24);
    g.destroy();
  }

  private generateOpenAILogo(): void {
    const g = this.add.graphics();
    const cx = 12, cy = 12;
    // Dark background circle
    g.fillStyle(0x111111, 0.3);
    g.fillCircle(cx, cy, 11);
    // Hexagonal rosette — 6 arcs in pinwheel pattern
    g.lineStyle(2, 0x333333);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const nextAngle = ((i + 1) / 6) * Math.PI * 2;
      const ax = cx + Math.cos(angle) * 7;
      const ay = cy + Math.sin(angle) * 7;
      const bx = cx + Math.cos(nextAngle) * 7;
      const by = cy + Math.sin(nextAngle) * 7;
      // Arc approximated as thick line between petal positions
      const midx = cx + Math.cos((angle + nextAngle) / 2) * 4;
      const midy = cy + Math.sin((angle + nextAngle) / 2) * 4;
      g.lineStyle(2, 0x444444);
      g.lineBetween(ax, ay, midx, midy);
      g.lineBetween(midx, midy, bx, by);
    }
    // Connecting spokes
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const sx = cx + Math.cos(angle) * 3;
      const sy = cy + Math.sin(angle) * 3;
      const ex = cx + Math.cos(angle) * 7;
      const ey = cy + Math.sin(angle) * 7;
      g.lineStyle(2, 0x333333);
      g.lineBetween(sx, sy, ex, ey);
    }
    // Center open (dark)
    g.fillStyle(0x111111);
    g.fillCircle(cx, cy, 3);
    g.generateTexture('pu-openai', 24, 24);
    g.destroy();
  }

  private generateGeminiLogo(): void {
    const g = this.add.graphics();
    const cx = 12, cy = 12;
    // 4-color sparkle: diamond/teardrop arms from center
    // Top arm — blue
    g.fillStyle(0x4285F4);
    g.fillTriangle(cx, cy - 10, cx - 3, cy, cx + 3, cy);
    // Right arm — red
    g.fillStyle(0xDB4437);
    g.fillTriangle(cx + 10, cy, cx, cy - 3, cx, cy + 3);
    // Bottom arm — yellow
    g.fillStyle(0xF4B400);
    g.fillTriangle(cx, cy + 10, cx - 3, cy, cx + 3, cy);
    // Left arm — green
    g.fillStyle(0x0F9D58);
    g.fillTriangle(cx - 10, cy, cx, cy - 3, cx, cy + 3);
    // White center dot
    g.fillStyle(0xffffff);
    g.fillCircle(cx, cy, 2);
    g.generateTexture('pu-speed', 24, 24);
    g.destroy();
  }

  private generateSSILogo(): void {
    const g = this.add.graphics();
    const cx = 12, cy = 12;
    // Pale blue outer glow ring
    g.fillStyle(0x88bbee, 0.3);
    g.fillCircle(cx, cy, 11);
    g.fillStyle(0x88bbee, 0.15);
    g.fillCircle(cx, cy, 12);
    // White circle body
    g.fillStyle(0xffffff);
    g.fillCircle(cx, cy, 9);
    // "SSI" in dark 3px pixel font
    g.fillStyle(0x222233);
    // S (x=4): 3px wide, 5px tall
    g.fillRect(4, 7, 3, 1);   // top bar
    g.fillRect(4, 8, 1, 1);   // left side
    g.fillRect(4, 9, 3, 1);   // middle bar
    g.fillRect(6, 10, 1, 1);  // right side
    g.fillRect(4, 11, 3, 1);  // bottom bar
    // S (x=8)
    g.fillRect(8, 7, 3, 1);
    g.fillRect(8, 8, 1, 1);
    g.fillRect(8, 9, 3, 1);
    g.fillRect(10, 10, 1, 1);
    g.fillRect(8, 11, 3, 1);
    // I (x=12)
    g.fillRect(12, 7, 3, 1);  // top serif
    g.fillRect(13, 8, 1, 3);  // vertical
    g.fillRect(12, 11, 3, 1); // bottom serif
    g.generateTexture('pu-ssi', 24, 24);
    g.destroy();
  }

  private generateGrokLogo(): void {
    const g = this.add.graphics();
    const cx = 12, cy = 12;
    // Black circle
    g.fillStyle(0x111111);
    g.fillCircle(cx, cy, 10);
    // White angular "X" with one stroke extending as "I" — minimalist xAI logo
    g.fillStyle(0xffffff);
    // Left-to-right diagonal (\)
    g.fillRect(5, 5, 2, 2);
    g.fillRect(7, 7, 2, 2);
    g.fillRect(9, 9, 2, 2);
    g.fillRect(11, 11, 2, 2);
    g.fillRect(13, 13, 2, 2);
    g.fillRect(15, 15, 2, 2);
    // Right-to-left diagonal (/)
    g.fillRect(15, 5, 2, 2);
    g.fillRect(13, 7, 2, 2);
    g.fillRect(11, 9, 2, 2);
    g.fillRect(9, 11, 2, 2);
    g.fillRect(7, 13, 2, 2);
    g.fillRect(5, 15, 2, 2);
    // "I" extending down from right side of X
    g.fillRect(17, 17, 2, 3);
    g.generateTexture('pd-grok', 24, 24);
    g.destroy();
  }

  private generateClippyLogo(): void {
    const g = this.add.graphics();
    // Blue background
    g.fillStyle(0x4488cc, 0.3);
    g.fillRect(0, 0, 24, 24);
    // Paperclip shape
    g.lineStyle(2, 0x4488cc);
    // Outer loop
    g.strokeRoundedRect(7, 2, 10, 19, 5);
    // Inner loop
    g.strokeRoundedRect(10, 7, 5, 10, 2);
    g.generateTexture('pd-clippy', 24, 24);
    g.destroy();
  }

  private generateFogLogo(): void {
    const g = this.add.graphics();
    // Gray background
    g.fillStyle(0x888888, 0.2);
    g.fillRect(0, 0, 24, 24);
    // Cloud shape: overlapping circles
    g.fillStyle(0x888888, 0.8);
    g.fillCircle(8, 12, 6);
    g.fillCircle(16, 12, 6);
    g.fillCircle(12, 8, 6);
    // Base
    g.fillRect(4, 12, 17, 6);
    g.generateTexture('pd-fog', 24, 24);
    g.destroy();
  }

  private generateDataLeakLogo(): void {
    const g = this.add.graphics();
    // Red background
    g.fillStyle(0xe06c75, 0.3);
    g.fillRect(0, 0, 24, 24);
    // Red border
    g.lineStyle(2, 0xe06c75);
    g.strokeRect(1, 1, 22, 22);
    // "!" exclamation
    g.fillStyle(0xe06c75);
    g.fillRect(10, 5, 5, 10);
    g.fillRect(10, 17, 5, 4);
    g.generateTexture('pd-leak', 24, 24);
    g.destroy();
  }

  private generateCopilotLogo(): void {
    const g = this.add.graphics();
    const cx = 12, cy = 12;
    // Two overlapping rounded shapes — blue + green forming figure-8
    // Blue shape (upper-left)
    g.fillStyle(0x3B82F6);
    g.fillCircle(cx - 3, cy - 2, 6);
    // Green shape (lower-right)
    g.fillStyle(0x10B981);
    g.fillCircle(cx + 3, cy + 2, 6);
    // Mixed color at overlap center
    g.fillStyle(0x259ED9, 0.8);
    g.fillCircle(cx, cy, 4);
    g.generateTexture('pd-copilot', 24, 24);
    g.destroy();
  }

  private generateMetaPDLogo(): void {
    const g = this.add.graphics();
    const cy = 12;
    // Blue infinity loop / figure-8 — two connected loops, thick at crossover
    g.fillStyle(0x0668E1);
    // Left loop
    g.fillCircle(7, cy, 5);
    // Right loop
    g.fillCircle(17, cy, 5);
    // Cut out inner loops to form ring shapes
    g.fillStyle(0x000000, 0);
    // Thick crossover at center
    g.fillStyle(0x0668E1);
    g.fillRect(10, cy - 3, 4, 6);
    // Inner cutouts for loop holes
    g.fillStyle(0x000000);
    g.fillCircle(7, cy, 2);
    g.fillCircle(17, cy, 2);
    // Redraw outer ring portions
    g.lineStyle(3, 0x0668E1);
    g.strokeCircle(7, cy, 5);
    g.strokeCircle(17, cy, 5);
    // Fill crossover solid
    g.fillStyle(0x0668E1);
    g.fillRect(10, cy - 2, 4, 4);
    g.generateTexture('pd-meta', 24, 24);
    g.destroy();
  }

  private generateQwenLogo(): void {
    const g = this.add.graphics();
    const cx = 12, cy = 12;
    // Indigo circle
    g.fillStyle(0x6366F1);
    g.fillCircle(cx, cy, 10);
    // Cutout for "Q" letter body
    g.fillStyle(0x000000);
    g.fillCircle(cx, cy, 6);
    // Restore ring
    g.fillStyle(0x6366F1);
    // Q ring
    g.lineStyle(3, 0xffffff);
    g.strokeCircle(cx, cy, 5);
    // Diagonal tick extending bottom-right
    g.lineStyle(3, 0xffffff);
    g.lineBetween(cx + 2, cy + 3, cx + 7, cy + 8);
    g.generateTexture('pd-qwen', 24, 24);
    g.destroy();
  }

  private generateOpenClawLogo(): void {
    const g = this.add.graphics();
    const cx = 12, cy = 12;
    // Red/orange crab claw — two curved open pincers
    g.fillStyle(0xEF4444);
    // Left pincer (curved arc)
    g.fillRect(2, 6, 3, 2);
    g.fillRect(1, 8, 3, 2);
    g.fillRect(1, 10, 3, 2);
    g.fillRect(2, 12, 3, 2);
    g.fillRect(4, 14, 3, 2);
    g.fillRect(6, 15, 3, 2);
    // Right pincer (curved arc)
    g.fillRect(19, 6, 3, 2);
    g.fillRect(20, 8, 3, 2);
    g.fillRect(20, 10, 3, 2);
    g.fillRect(19, 12, 3, 2);
    g.fillRect(17, 14, 3, 2);
    g.fillRect(15, 15, 3, 2);
    // Base connecting the pincers
    g.fillRect(8, 17, 8, 3);
    g.fillRect(6, 16, 4, 2);
    g.fillRect(14, 16, 4, 2);
    // Pincer tips (lighter, open)
    g.fillStyle(0xf87171);
    g.fillRect(1, 5, 3, 2);
    g.fillRect(20, 5, 3, 2);
    // Inner pincer edges
    g.fillStyle(0xdc2626);
    g.fillRect(4, 8, 2, 6);
    g.fillRect(18, 8, 2, 6);
    g.generateTexture('pd-openclaw', 24, 24);
    g.destroy();
  }

  private generateDeepSeekLogo(): void {
    const g = this.add.graphics();
    // Blue whale silhouette
    g.fillStyle(0x2563EB);
    // Body — main oval shape
    g.fillCircle(12, 13, 8);
    g.fillRect(4, 10, 16, 8);
    // Head (front, rounder)
    g.fillCircle(6, 12, 6);
    // Tail flukes
    g.fillTriangle(20, 12, 24, 8, 23, 14);
    g.fillTriangle(20, 14, 24, 18, 23, 12);
    // Flipper (small triangle on bottom)
    g.fillStyle(0x1d4ed8);
    g.fillTriangle(10, 16, 14, 16, 12, 20);
    // Lighter belly
    g.fillStyle(0x60a5fa);
    g.fillRect(4, 15, 14, 3);
    g.fillCircle(6, 15, 4);
    // Eye
    g.fillStyle(0xffffff);
    g.fillCircle(5, 11, 2);
    g.fillStyle(0x111111);
    g.fillCircle(5, 11, 1);
    // Water spout — 3 rising blue dots
    g.fillStyle(0x93c5fd);
    g.fillCircle(8, 5, 1.5);
    g.fillCircle(10, 3, 1.5);
    g.fillCircle(7, 1, 1.5);
    g.generateTexture('pu-deepseek', 24, 24);
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
    this.generateMacIISprite();
  }

  private generateOctopusSprites(): void {
    const tiers: Array<{ key: string; color: number; highlight: number; dark: number }> = [
      { key: 'enemy-octopus-peach', color: 0xffcba4, highlight: 0xffe0c0, dark: 0xcc9a74 },
      { key: 'enemy-octopus-red', color: 0xe06c75, highlight: 0xf08888, dark: 0xb04450 },
      { key: 'enemy-octopus-orange', color: 0xf5a623, highlight: 0xffc04a, dark: 0xc07810 },
    ];

    tiers.forEach(({ key, color, highlight, dark }) => {
      const g = this.add.graphics();
      // Dome head
      g.fillStyle(color);
      g.fillCircle(24, 14, 15);
      // Specular highlight
      g.fillStyle(highlight, 0.5);
      g.fillCircle(19, 10, 6);
      // White eyes
      g.fillStyle(0xffffff);
      g.fillCircle(18, 15, 4);
      g.fillCircle(30, 15, 4);
      // Pupils
      g.fillStyle(0x000000);
      g.fillCircle(19, 15, 2);
      g.fillCircle(31, 15, 2);
      // Smiling mouth
      g.fillStyle(dark);
      g.fillRect(21, 21, 6, 1);
      g.fillRect(20, 20, 1, 1);
      g.fillRect(27, 20, 1, 1);
      // 6 detailed tentacles with zigzag segments and suckers
      g.fillStyle(color);
      // Tentacle 1 (far left)
      g.fillRect(3, 26, 3, 4); g.fillRect(2, 30, 3, 4); g.fillRect(3, 34, 3, 4);
      g.fillStyle(dark); g.fillCircle(4, 28, 1); g.fillCircle(3, 32, 1); g.fillCircle(4, 36, 1);
      // Tentacle 2
      g.fillStyle(color);
      g.fillRect(9, 26, 3, 4); g.fillRect(10, 30, 3, 4); g.fillRect(9, 34, 3, 4);
      g.fillStyle(dark); g.fillCircle(10, 28, 1); g.fillCircle(11, 32, 1); g.fillCircle(10, 36, 1);
      // Tentacle 3 (center-left)
      g.fillStyle(color);
      g.fillRect(15, 26, 3, 4); g.fillRect(16, 30, 3, 4); g.fillRect(15, 34, 3, 4);
      g.fillStyle(dark); g.fillCircle(16, 28, 1); g.fillCircle(17, 32, 1); g.fillCircle(16, 36, 1);
      // Tentacle 4 (center-right)
      g.fillStyle(color);
      g.fillRect(28, 26, 3, 4); g.fillRect(29, 30, 3, 4); g.fillRect(28, 34, 3, 4);
      g.fillStyle(dark); g.fillCircle(29, 28, 1); g.fillCircle(30, 32, 1); g.fillCircle(29, 36, 1);
      // Tentacle 5
      g.fillStyle(color);
      g.fillRect(34, 26, 3, 4); g.fillRect(35, 30, 3, 4); g.fillRect(34, 34, 3, 4);
      g.fillStyle(dark); g.fillCircle(35, 28, 1); g.fillCircle(36, 32, 1); g.fillCircle(35, 36, 1);
      // Tentacle 6 (far right)
      g.fillStyle(color);
      g.fillRect(40, 26, 3, 4); g.fillRect(39, 30, 3, 4); g.fillRect(40, 34, 3, 4);
      g.fillStyle(dark); g.fillCircle(41, 28, 1); g.fillCircle(40, 32, 1); g.fillCircle(41, 36, 1);
      // Slop bucket between center tentacles
      g.fillStyle(0x6b4423);
      g.fillRect(19, 30, 10, 8);
      // Bucket rim
      g.fillStyle(0x8b5e3c);
      g.fillRect(18, 28, 12, 3);
      // Handle arc
      g.fillStyle(0x5a3a1a);
      g.fillRect(22, 26, 4, 2);
      // Slop inside (brownish liquid)
      g.fillStyle(0xa07050);
      g.fillRect(20, 31, 8, 3);
      g.fillStyle(0xb08060);
      g.fillRect(21, 31, 3, 1);
      g.generateTexture(key, 48, 48);
      g.destroy();
    });
  }

  private generateTrollSprite(): void {
    const g = this.add.graphics();
    // Body (hunched green figure)
    g.fillStyle(0x98c379);
    // Torso (hunched, larger)
    g.fillRect(14, 18, 18, 18);
    // Hunched shoulders
    g.fillRect(10, 20, 6, 10);
    g.fillRect(30, 20, 6, 10);
    // Head
    g.fillCircle(24, 13, 10);
    // Spiky hair/horns (more pronounced)
    g.fillStyle(0x7aa35e);
    g.fillTriangle(14, 6, 17, 0, 20, 6);
    g.fillTriangle(20, 5, 24, -2, 28, 5);
    g.fillTriangle(28, 6, 32, 0, 34, 7);
    g.fillTriangle(32, 8, 36, 3, 35, 9);
    // Angry eyebrows (thicker, angled)
    g.fillStyle(0x000000);
    g.fillRect(17, 9, 6, 2);
    g.fillRect(25, 9, 6, 2);
    // Angry eyes (red, 3x3)
    g.fillStyle(0xff3333);
    g.fillRect(18, 12, 3, 3);
    g.fillRect(26, 12, 3, 3);
    // Angry mouth (wider, showing teeth)
    g.fillStyle(0x000000);
    g.fillRect(18, 18, 10, 3);
    g.fillStyle(0xffffff);
    g.fillRect(19, 18, 2, 2);
    g.fillRect(22, 18, 2, 2);
    g.fillRect(25, 18, 2, 2);
    // Phone in hand (larger)
    g.fillStyle(0x333333);
    g.fillRect(32, 24, 7, 12);
    // Screen glow
    g.fillStyle(0x4488cc);
    g.fillRect(33, 25, 5, 9);
    // Text lines on screen
    g.fillStyle(0xaaddff);
    g.fillRect(34, 27, 3, 1);
    g.fillRect(34, 29, 4, 1);
    g.fillRect(34, 31, 2, 1);
    // Legs
    g.fillStyle(0x98c379);
    g.fillRect(16, 36, 5, 8);
    g.fillRect(25, 36, 5, 8);
    // Shoes (dark, wider than legs)
    g.fillStyle(0x333333);
    g.fillRect(14, 43, 9, 3);
    g.fillRect(23, 43, 9, 3);
    g.generateTexture('enemy-troll', 48, 48);
    g.destroy();
  }

  private generateInfluencerSprite(): void {
    const g = this.add.graphics();
    // Halo glow (behind head)
    g.fillStyle(0xffd700, 0.2);
    g.fillCircle(24, 2, 12);
    g.fillStyle(0xffd700, 0.4);
    g.fillCircle(24, 2, 8);
    // Body (upright purple figure, larger)
    g.fillStyle(0xc678dd);
    // Torso
    g.fillRect(15, 18, 16, 14);
    // Head
    g.fillCircle(24, 12, 9);
    // Hair (glamorous, multi-layer)
    g.fillStyle(0xd89ef0);
    g.fillCircle(24, 7, 6);
    g.fillRect(14, 6, 4, 10);
    g.fillRect(28, 6, 4, 10);
    // Lighter highlights
    g.fillStyle(0xe8b0ff, 0.6);
    g.fillRect(15, 7, 2, 5);
    g.fillRect(29, 7, 2, 5);
    // Sunglasses (thicker frames)
    g.fillStyle(0x111111);
    g.fillRect(16, 10, 6, 4);
    g.fillRect(24, 10, 6, 4);
    g.fillRect(22, 11, 2, 2);
    // Reflection shine on lenses
    g.fillStyle(0xffffff, 0.3);
    g.fillRect(17, 10, 2, 1);
    g.fillRect(25, 10, 2, 1);
    // Red lipstick
    g.fillStyle(0xff3355);
    g.fillRect(22, 16, 4, 1);
    // Selfie arm extended
    g.fillStyle(0xc678dd);
    g.fillRect(31, 16, 12, 4);
    // Phone at end of arm
    g.fillStyle(0x333333);
    g.fillRect(42, 13, 5, 10);
    g.fillStyle(0x5588ee);
    g.fillRect(43, 14, 3, 7);
    // Camera flash (white rect)
    g.fillStyle(0xffffff);
    g.fillRect(44, 14, 1, 1);
    // Camera lens (dark circle)
    g.fillStyle(0x111111);
    g.fillCircle(45, 18, 1);
    // Sparkle particles (white/gold)
    g.fillStyle(0xffffff, 0.8);
    g.fillRect(6, 5, 2, 2);
    g.fillRect(38, 3, 2, 2);
    g.fillRect(4, 20, 2, 2);
    g.fillStyle(0xffd700, 0.7);
    g.fillRect(10, 14, 2, 2);
    g.fillRect(36, 8, 2, 2);
    // Legs (longer)
    g.fillStyle(0xc678dd);
    g.fillRect(17, 32, 5, 10);
    g.fillRect(24, 32, 5, 10);
    // Heels (wedge shape)
    g.fillStyle(0x333333);
    g.fillRect(16, 41, 7, 3);
    g.fillRect(23, 41, 7, 3);
    g.fillStyle(0x555555);
    g.fillRect(22, 43, 2, 2);
    g.fillRect(29, 43, 2, 2);
    g.generateTexture('enemy-influencer', 48, 48);
    g.destroy();
  }

  private generateCriticSprite(): void {
    const g = this.add.graphics();
    // Dark robe (larger triangle)
    g.fillStyle(0x2a2a3a);
    g.fillTriangle(24, 8, 6, 46, 42, 46);
    // Fabric fold lines (darker vertical lines)
    g.fillStyle(0x1e1e2e);
    g.fillRect(16, 20, 1, 26);
    g.fillRect(24, 14, 1, 32);
    g.fillRect(32, 20, 1, 26);
    // Hood
    g.fillStyle(0x3a3a4a);
    g.fillCircle(24, 12, 10);
    g.fillStyle(0x2a2a3a);
    g.fillCircle(24, 11, 9);
    // Face in shadow
    g.fillStyle(0x1a1a2a);
    g.fillCircle(24, 15, 6);
    // Stern eyes (3x3 white)
    g.fillStyle(0xcccccc);
    g.fillRect(19, 13, 3, 3);
    g.fillRect(26, 13, 3, 3);
    // Furrowed thick brow line
    g.fillStyle(0x888888);
    g.fillRect(18, 11, 12, 2);
    // Quill in hand (right, longer with feather barbs)
    g.fillStyle(0xccaa66);
    g.fillRect(36, 4, 2, 24);
    // Feather barbs (cream/white, fanning from shaft)
    g.fillStyle(0xffeedd);
    g.fillTriangle(36, 3, 38, 3, 36, 8);
    g.fillTriangle(34, 5, 36, 4, 36, 9);
    g.fillTriangle(38, 5, 36, 4, 36, 9);
    g.fillStyle(0xffffee);
    g.fillTriangle(33, 7, 36, 6, 36, 11);
    // Inkwell (left hand, larger)
    g.fillStyle(0x111111);
    g.fillRect(4, 26, 8, 10);
    // Inkwell rim
    g.fillStyle(0x222233);
    g.fillRect(3, 24, 10, 3);
    // Ink level visible inside
    g.fillStyle(0x1a1a4a);
    g.fillRect(5, 29, 6, 5);
    // Ink drips down the side
    g.fillStyle(0x1a1a4a);
    g.fillRect(10, 30, 2, 3);
    g.fillRect(11, 33, 2, 2);
    g.fillRect(4, 32, 2, 3);
    g.generateTexture('enemy-critic', 48, 48);
    g.destroy();
  }

  private generateParrotSprite(): void {
    const g = this.add.graphics();
    // Body — bright tropical green
    g.fillStyle(0x22cc55);
    g.fillCircle(22, 20, 12);
    // Belly — lighter
    g.fillStyle(0x44ee77);
    g.fillCircle(22, 23, 8);
    // Head — slightly brighter
    g.fillStyle(0x33dd66);
    g.fillCircle(22, 10, 9);
    // Head crest — 3+ colored feather tufts
    g.fillStyle(0xee3333);
    g.fillTriangle(14, 5, 17, -2, 20, 5);
    g.fillStyle(0x3388ff);
    g.fillTriangle(18, 4, 21, -3, 24, 4);
    g.fillStyle(0xffcc00);
    g.fillTriangle(22, 5, 25, -1, 28, 5);
    // Eye — larger, white with black pupil and eye ring
    g.fillStyle(0xffffcc);
    g.fillCircle(27, 9, 4);
    g.fillStyle(0xffffff);
    g.fillCircle(27, 9, 3);
    g.fillStyle(0x000000);
    g.fillCircle(28, 9, 1.5);
    // Beak — hooked orange/yellow, larger
    g.fillStyle(0xf5a623);
    g.fillTriangle(31, 8, 40, 12, 31, 16);
    // Beak hook tip
    g.fillStyle(0xe09010);
    g.fillTriangle(38, 12, 40, 12, 37, 17);
    // Wing feathers — layered, 3 colors
    g.fillStyle(0x119944);
    g.fillRect(8, 16, 10, 12);
    g.fillStyle(0x0085FF);
    g.fillRect(8, 24, 10, 4);
    g.fillStyle(0xee3333);
    g.fillRect(8, 28, 10, 2);
    // Tail fan — 5+ feathers, 3 colors
    g.fillStyle(0x22cc55);
    g.fillRect(10, 32, 3, 8);
    g.fillRect(14, 33, 3, 7);
    g.fillRect(18, 32, 3, 8);
    g.fillRect(22, 33, 3, 7);
    g.fillRect(26, 32, 3, 8);
    g.fillStyle(0xee3333);
    g.fillRect(11, 37, 2, 4);
    g.fillRect(23, 37, 2, 4);
    g.fillStyle(0x3388ff);
    g.fillRect(15, 37, 2, 4);
    g.fillRect(27, 37, 2, 4);
    g.fillStyle(0xf5a623);
    g.fillRect(19, 37, 2, 4);
    // Perch bar
    g.fillStyle(0x666666);
    g.fillRect(14, 30, 18, 2);
    // Talons — grey, 3 toes each foot
    g.fillStyle(0x555555);
    g.fillRect(18, 30, 2, 3);
    g.fillRect(20, 31, 2, 2);
    g.fillRect(16, 31, 2, 2);
    g.fillRect(26, 30, 2, 3);
    g.fillRect(28, 31, 2, 2);
    g.fillRect(24, 31, 2, 2);
    // Speech bubble with "..." — top-right
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(40, 3, 6);
    g.fillStyle(0x888888, 0.6);
    g.fillRect(37, 2, 2, 2);
    g.fillRect(40, 2, 2, 2);
    g.fillRect(43, 2, 2, 2);
    g.generateTexture('enemy-parrot', 48, 48);
    g.destroy();
  }

  private generatePaperFloodSprite(): void {
    const g = this.add.graphics();
    // Machine body (larger)
    g.fillStyle(0x444444);
    g.fillRect(6, 12, 36, 28);
    // Panel lines (horizontal lighter lines every 8px)
    g.fillStyle(0x505050);
    g.fillRect(6, 20, 36, 1);
    g.fillRect(6, 28, 36, 1);
    g.fillRect(6, 36, 36, 1);
    // Top panel (distinct color)
    g.fillStyle(0x555555);
    g.fillRect(6, 12, 36, 6);
    // Red accent stripe (wider)
    g.fillStyle(0xb31b1b);
    g.fillRect(6, 18, 36, 3);
    // Paper slot at top
    g.fillStyle(0x222222);
    g.fillRect(10, 8, 28, 5);
    // Papers spewing from top slot (3-4 papers with text lines)
    g.fillStyle(0xffffff);
    g.fillRect(12, 1, 8, 10);
    g.fillRect(21, -2, 8, 8);
    g.fillRect(30, 2, 7, 8);
    g.fillRect(8, 3, 6, 7);
    // Text lines on papers
    g.fillStyle(0xbbbbbb);
    g.fillRect(13, 3, 5, 1);
    g.fillRect(13, 5, 4, 1);
    g.fillRect(22, 0, 5, 1);
    g.fillRect(22, 2, 6, 1);
    g.fillRect(31, 4, 4, 1);
    g.fillRect(31, 6, 5, 1);
    g.fillRect(9, 5, 4, 1);
    // Warning light at top (larger with yellow glow ring)
    g.fillStyle(0xffff00, 0.3);
    g.fillCircle(38, 8, 5);
    g.fillStyle(0xff0000, 0.8);
    g.fillCircle(38, 8, 3);
    // Paper tray at bottom (darker rect with white paper stack)
    g.fillStyle(0x333333);
    g.fillRect(8, 40, 32, 6);
    g.fillStyle(0xffffff, 0.6);
    g.fillRect(10, 41, 28, 4);
    g.generateTexture('enemy-paperFlood', 48, 48);
    g.destroy();
  }

  private generateCloudflareWallSprite(): void {
    const g = this.add.graphics();
    // Hexagonal shield shape (sharper, larger)
    g.fillStyle(0xf48120);
    g.fillRect(6, 8, 36, 32);
    g.fillTriangle(6, 8, 24, 0, 42, 8);
    g.fillTriangle(6, 40, 24, 48, 42, 40);
    // Inner shield area (gradient effect — slightly different orange)
    g.fillStyle(0xf09000, 0.5);
    g.fillRect(10, 12, 28, 24);
    // Second orange tone for outer vs inner
    g.fillStyle(0xffa030, 0.3);
    g.fillRect(12, 14, 24, 20);
    // Cloud icon — proper 3 overlapping circles + base rect
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(18, 20, 6);
    g.fillCircle(30, 20, 6);
    g.fillCircle(24, 15, 6);
    g.fillRect(14, 20, 20, 6);
    // Lock detail (larger, visible keyhole)
    g.fillStyle(0xffffff);
    g.fillRect(20, 30, 8, 7);
    // Keyhole
    g.fillStyle(0xf48120);
    g.fillCircle(24, 33, 2);
    g.fillRect(23, 33, 2, 3);
    // Lock shackle (thicker)
    g.lineStyle(2, 0xffffff);
    g.strokeCircle(24, 28, 4);
    g.generateTexture('enemy-cloudflareWall', 48, 48);
    g.destroy();
  }

  private generateMacIISprite(): void {
    const g = this.add.graphics();
    // Boxy beige Macintosh II body (larger)
    g.fillStyle(0xD2C6A5);
    g.fillRect(3, 3, 42, 30);
    // Lighter top edge
    g.fillStyle(0xddd4b8);
    g.fillRect(3, 3, 42, 3);
    // Darker bottom edge
    g.fillStyle(0xbfb495);
    g.fillRect(3, 31, 42, 2);
    // Screen area (larger)
    g.fillStyle(0x222222);
    g.fillRect(6, 6, 21, 18);
    // Screen bezel inner
    g.fillStyle(0x1a1a1a);
    g.fillRect(7, 7, 19, 16);
    // Sad Mac face (larger white rect for face area)
    g.fillStyle(0xffffff);
    g.fillRect(10, 8, 12, 12);
    g.fillStyle(0x222222);
    // Sad Mac X's above eyes
    g.fillRect(11, 9, 1, 1);
    g.fillRect(13, 9, 1, 1);
    g.fillRect(12, 10, 1, 1);
    g.fillRect(17, 9, 1, 1);
    g.fillRect(19, 9, 1, 1);
    g.fillRect(18, 10, 1, 1);
    // Eyes (3x3)
    g.fillRect(11, 11, 3, 3);
    g.fillRect(17, 11, 3, 3);
    // Frown (6px wide)
    g.fillRect(12, 17, 6, 1);
    g.fillRect(11, 16, 1, 1);
    g.fillRect(18, 16, 1, 1);
    // Rainbow Apple stripe — 6 bands each 2px high on right side
    g.fillStyle(0xff0000); g.fillRect(30, 7, 10, 2);   // red
    g.fillStyle(0xff8800); g.fillRect(30, 9, 10, 2);   // orange
    g.fillStyle(0xffff00); g.fillRect(30, 11, 10, 2);  // yellow
    g.fillStyle(0x00cc00); g.fillRect(30, 13, 10, 2);  // green
    g.fillStyle(0x0044ff); g.fillRect(30, 15, 10, 2);  // blue
    g.fillStyle(0x8800cc); g.fillRect(30, 17, 10, 2);  // purple
    // Floppy slot on right side of body
    g.fillStyle(0x333333);
    g.fillRect(31, 22, 8, 3);
    // Keyboard keys — grid of 2x2 rects with 1px gaps, 3 rows
    g.fillStyle(0xaaa48e);
    g.fillRect(6, 34, 36, 8);
    g.fillStyle(0x999384);
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 12; col++) {
        g.fillRect(7 + col * 3, 35 + row * 3, 2, 2);
      }
    }
    // Pixel feet/wheels at base (larger circles)
    g.fillStyle(0x888888);
    g.fillRect(8, 43, 5, 3);
    g.fillRect(35, 43, 5, 3);
    g.fillStyle(0x666666);
    g.fillCircle(10, 46, 2.5);
    g.fillCircle(37, 46, 2.5);
    g.generateTexture('enemy-macII', 48, 48);
    g.destroy();
  }

  // ── Boss Sprites ──

  private generateBossSprites(): void {
    this.generateBossAlgorithmVortex();
    this.generateBossEngagementKing();
    this.generateBossForkSwarm();
    this.generateBossPaperMill();
    this.generateBossTheVoid();
    this.generateBossShoggoth();
  }

  private generateBossAlgorithmVortex(): void {
    const g = this.add.graphics();
    const cx = 36, cy = 36;
    // Dome head — Twitter blue
    g.fillStyle(0x1DA1F2);
    g.fillCircle(cx, cy - 9, 21);
    // Head highlight
    g.fillStyle(0x4db8f7, 0.4);
    g.fillCircle(cx - 6, cy - 15, 9);
    // 8 tentacles curving out
    g.fillStyle(0x1DA1F2);
    const tentOffsets = [
      { x: -24, y: 12 }, { x: -18, y: 21 }, { x: -9, y: 27 }, { x: 0, y: 30 },
      { x: 9, y: 27 }, { x: 18, y: 21 }, { x: 24, y: 12 }, { x: -3, y: 24 },
    ];
    tentOffsets.forEach((t, i) => {
      const bx = cx + t.x;
      const by = cy + t.y;
      g.fillRect(bx - 2, by - 3, 5, 9);
      g.fillRect(bx + (i % 2 === 0 ? 2 : -2), by + 5, 5, 8);
      g.fillRect(bx + (i % 2 === 0 ? 3 : -3), by + 11, 5, 6);
      // Extra segment for more detail
      g.fillRect(bx + (i % 2 === 0 ? 4 : -4), by + 16, 4, 5);
      // Sucker dots
      g.fillStyle(0x0d8ddb);
      g.fillRect(bx, by + 2, 2, 2);
      g.fillRect(bx, by + 8, 2, 2);
      g.fillRect(bx, by + 14, 2, 2);
      g.fillStyle(0x1DA1F2);
    });
    // Large white eyes with red pupils
    g.fillStyle(0xffffff);
    g.fillCircle(cx - 9, cy - 9, 8);
    g.fillCircle(cx + 9, cy - 9, 8);
    g.fillStyle(0xff3333);
    g.fillCircle(cx - 8, cy - 9, 3);
    g.fillCircle(cx + 11, cy - 9, 3);
    // Small X logo on forehead
    g.fillStyle(0xffffff);
    g.fillRect(cx - 3, cy - 24, 2, 5);
    g.fillRect(cx + 2, cy - 24, 2, 5);
    g.fillRect(cx - 2, cy - 23, 5, 2);
    g.generateTexture('boss-algorithmVortex', 72, 72);
    g.destroy();
  }

  private generateBossEngagementKing(): void {
    const g = this.add.graphics();
    const cx = 42, cy = 42;
    // LinkedIn-blue body
    g.fillStyle(0x0A66C2);
    g.fillCircle(cx, cy - 6, 24);
    // Body highlight
    g.fillStyle(0x0d7ade, 0.3);
    g.fillCircle(cx - 8, cy - 12, 12);
    // Suit jacket on body
    g.fillStyle(0x1a2a40);
    g.fillRect(cx - 21, cy + 6, 42, 24);
    g.fillRect(cx - 18, cy, 36, 9);
    // Suit lapels
    g.fillStyle(0x203450);
    g.fillRect(cx - 6, cy + 3, 3, 12);
    g.fillRect(cx + 3, cy + 3, 3, 12);
    // White shirt strip
    g.fillStyle(0xeeeeee);
    g.fillRect(cx - 2, cy + 5, 3, 15);
    // Gold crown on head
    g.fillStyle(0xffd700);
    g.fillRect(cx - 12, cy - 33, 24, 6);
    g.fillTriangle(cx - 12, cy - 33, cx - 9, cy - 42, cx - 6, cy - 33);
    g.fillTriangle(cx - 3, cy - 33, cx, cy - 39, cx + 3, cy - 33);
    g.fillTriangle(cx + 6, cy - 33, cx + 9, cy - 42, cx + 12, cy - 33);
    // Crown jewels
    g.fillStyle(0xff3333);
    g.fillRect(cx - 9, cy - 38, 3, 3);
    g.fillStyle(0x3388ff);
    g.fillRect(cx - 2, cy - 36, 3, 3);
    g.fillStyle(0xff3333);
    g.fillRect(cx + 8, cy - 38, 3, 3);
    // 4 eyes (mutation starting)
    g.fillStyle(0xffffff);
    g.fillCircle(cx - 11, cy - 9, 5);
    g.fillCircle(cx - 3, cy - 6, 5);
    g.fillCircle(cx + 5, cy - 9, 5);
    g.fillCircle(cx + 12, cy - 6, 5);
    g.fillStyle(0x000000);
    g.fillCircle(cx - 11, cy - 9, 2);
    g.fillCircle(cx - 3, cy - 6, 2);
    g.fillCircle(cx + 5, cy - 9, 2);
    g.fillCircle(cx + 12, cy - 6, 2);
    // Tentacles holding tiny icons
    g.fillStyle(0x0A66C2);
    for (let i = 0; i < 4; i++) {
      const tx = cx - 27 + i * 18;
      const ty = cy + 27 + (i % 2) * 6;
      g.fillRect(tx, ty, 5, 12);
      g.fillRect(tx + (i % 2 === 0 ? 2 : -2), ty + 9, 5, 9);
    }
    // Tiny phone icon in one tentacle
    g.fillStyle(0x333333);
    g.fillRect(cx - 26, cy + 39, 5, 6);
    g.generateTexture('boss-engagementKing', 84, 84);
    g.destroy();
  }

  private generateBossForkSwarm(): void {
    const g = this.add.graphics();
    const cx = 42, cy = 42;
    // 3 octopus-shapes fused into one body — partially merged heads
    g.fillStyle(0x0085FF);
    // Head 1 (left)
    g.fillCircle(cx - 15, cy - 12, 15);
    // Head 2 (center, overlapping)
    g.fillCircle(cx, cy - 9, 17);
    // Head 3 (right)
    g.fillCircle(cx + 15, cy - 12, 15);
    // Merged body mass
    g.fillRect(cx - 24, cy - 3, 48, 21);
    // Shared tentacles
    g.fillStyle(0x0085FF);
    for (let i = 0; i < 8; i++) {
      const tx = cx - 21 + i * 6;
      const ty = cy + 18;
      g.fillRect(tx, ty, 5, 8);
      g.fillRect(tx + (i % 2 === 0 ? 2 : -2), ty + 6, 5, 8);
      g.fillRect(tx + (i % 2 === 0 ? 3 : -3), ty + 12, 5, 6);
    }
    // Multiple eyes scattered across merged heads
    g.fillStyle(0xffffff);
    const eyePositions = [
      { x: cx - 18, y: cy - 15 }, { x: cx - 9, y: cy - 18 },
      { x: cx - 3, y: cy - 12 }, { x: cx + 5, y: cy - 15 },
      { x: cx + 12, y: cy - 18 }, { x: cx + 20, y: cy - 14 },
      { x: cx, y: cy - 6 }, { x: cx + 9, y: cy - 5 },
    ];
    eyePositions.forEach(e => {
      g.fillStyle(0xffffff);
      g.fillCircle(e.x, e.y, 4);
      g.fillStyle(0x000000);
      g.fillCircle(e.x + 1, e.y, 2);
    });
    // Merge seam lines (darker blue where heads join)
    g.fillStyle(0x0066cc, 0.5);
    g.fillRect(cx - 8, cy - 18, 3, 15);
    g.fillRect(cx + 6, cy - 18, 3, 15);
    g.generateTexture('boss-forkSwarm', 84, 84);
    g.destroy();
  }

  private generateBossPaperMill(): void {
    const g = this.add.graphics();
    const cx = 48, cy = 48;
    // Metal grinder body
    g.fillStyle(0x444444);
    g.fillRect(cx - 30, cy - 24, 60, 48);
    // Body bevel top
    g.fillStyle(0x555555);
    g.fillRect(cx - 30, cy - 24, 60, 5);
    // Body bevel bottom
    g.fillStyle(0x333333);
    g.fillRect(cx - 30, cy + 20, 60, 5);
    // Gears visible on sides
    g.fillStyle(0x666666);
    g.fillCircle(cx - 21, cy, 9);
    g.fillCircle(cx + 21, cy, 9);
    g.fillStyle(0x555555);
    g.fillCircle(cx - 21, cy, 5);
    g.fillCircle(cx + 21, cy, 5);
    // Gear teeth
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      g.fillStyle(0x666666);
      g.fillRect(cx - 21 + Math.cos(angle) * 8, cy + Math.sin(angle) * 8, 3, 3);
      g.fillRect(cx + 21 + Math.cos(angle) * 8, cy + Math.sin(angle) * 8, 3, 3);
    }
    // Red LED eyes
    g.fillStyle(0xB31B1B);
    g.fillCircle(cx - 9, cy - 12, 6);
    g.fillCircle(cx + 9, cy - 12, 6);
    // Eye glow
    g.fillStyle(0xff3333, 0.4);
    g.fillCircle(cx - 9, cy - 12, 9);
    g.fillCircle(cx + 9, cy - 12, 9);
    // Eye pupils
    g.fillStyle(0xff0000);
    g.fillCircle(cx - 9, cy - 12, 3);
    g.fillCircle(cx + 9, cy - 12, 3);
    // Papers in maw (being consumed)
    g.fillStyle(0xffffff);
    g.fillRect(cx - 12, cy - 3, 8, 11);
    g.fillRect(cx - 3, cy - 6, 8, 12);
    g.fillRect(cx + 6, cy - 2, 8, 9);
    // Text lines on papers
    g.fillStyle(0xcccccc);
    g.fillRect(cx - 11, cy, 5, 2);
    g.fillRect(cx - 2, cy - 3, 5, 2);
    g.fillRect(cx + 8, cy + 2, 5, 2);
    // Living tentacles from slots
    g.fillStyle(0x555555);
    const slots = [-24, -12, 0, 12, 24];
    slots.forEach((sx, i) => {
      // Slot
      g.fillStyle(0x222222);
      g.fillRect(cx + sx - 3, cy + 24, 6, 3);
      // Tentacle emerging
      g.fillStyle(0x666666);
      g.fillRect(cx + sx - 2, cy + 26, 3, 9);
      g.fillRect(cx + sx + (i % 2 === 0 ? 0 : -2), cy + 33, 3, 8);
      g.fillRect(cx + sx + (i % 2 === 0 ? 2 : -3), cy + 39, 3, 6);
    });
    g.generateTexture('boss-paperMill', 96, 96);
    g.destroy();
  }

  private generateBossTheVoid(): void {
    const g = this.add.graphics();
    const cx = 54, cy = 54;
    // Dark amorphous mass — purple-dark coloring
    g.fillStyle(0x2C3E50);
    g.fillCircle(cx, cy, 42);
    g.fillCircle(cx - 12, cy + 8, 30);
    g.fillCircle(cx + 15, cy - 8, 33);
    g.fillCircle(cx - 8, cy - 15, 27);
    // Darker inner areas
    g.fillStyle(0x1a2a3a, 0.6);
    g.fillCircle(cx + 8, cy + 12, 23);
    g.fillCircle(cx - 15, cy - 8, 18);
    // Wispy shadow tendrils
    g.fillStyle(0x1a2535);
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const r = 36 + (i % 3) * 6;
      const tx = cx + Math.cos(angle) * r;
      const ty = cy + Math.sin(angle) * r;
      g.fillRect(tx - 2, ty - 2, 5, 12);
      g.fillRect(tx + (i % 2 === 0 ? 2 : -3), ty + 9, 3, 9);
    }
    // Dozens of eyes (various sizes, white and red)
    const voidEyes = [
      { x: -18, y: -21, r: 5, red: false }, { x: 6, y: -27, r: 3, red: true },
      { x: 21, y: -15, r: 5, red: false }, { x: -27, y: -6, r: 3, red: false },
      { x: -9, y: -9, r: 6, red: false }, { x: 12, y: -3, r: 5, red: true },
      { x: 27, y: 6, r: 3, red: false }, { x: -21, y: 12, r: 5, red: true },
      { x: -3, y: 9, r: 3, red: false }, { x: 15, y: 15, r: 5, red: false },
      { x: -12, y: 21, r: 3, red: true }, { x: 9, y: 24, r: 3, red: false },
      { x: -24, y: -15, r: 2, red: false }, { x: 30, y: -6, r: 2, red: true },
      { x: 0, y: -18, r: 4, red: false }, { x: -6, y: 27, r: 2, red: false },
    ];
    voidEyes.forEach(e => {
      g.fillStyle(e.red ? 0xff3333 : 0xffffff);
      g.fillCircle(cx + e.x, cy + e.y, e.r);
      g.fillStyle(0x000000);
      g.fillCircle(cx + e.x + 1, cy + e.y, e.r * 0.5);
    });
    // Visible mouths (dark slashes with teeth)
    g.fillStyle(0x111111);
    g.fillRect(cx - 12, cy + 3, 12, 5);
    g.fillStyle(0xffffff);
    g.fillRect(cx - 11, cy + 3, 2, 3);
    g.fillRect(cx - 8, cy + 3, 2, 3);
    g.fillRect(cx - 5, cy + 3, 2, 3);
    // Second mouth
    g.fillStyle(0x111111);
    g.fillRect(cx + 9, cy - 6, 9, 3);
    g.fillStyle(0xffffff);
    g.fillRect(cx + 11, cy - 6, 2, 2);
    g.fillRect(cx + 14, cy - 6, 2, 2);
    g.generateTexture('boss-theVoid', 108, 108);
    g.destroy();
  }

  private generateBossShoggoth(): void {
    const g = this.add.graphics();
    const cx = 60, cy = 60;
    // Massive blob — iridescent colors, no symmetry
    // Black base mass
    g.fillStyle(0x111111);
    g.fillCircle(cx, cy, 51);
    g.fillCircle(cx - 15, cy + 12, 42);
    g.fillCircle(cx + 18, cy - 6, 39);
    // Green patches
    g.fillStyle(0x1E4D2B, 0.7);
    g.fillCircle(cx - 21, cy - 12, 24);
    g.fillCircle(cx + 12, cy + 18, 21);
    // Purple patches
    g.fillStyle(0x6366F1, 0.5);
    g.fillCircle(cx + 24, cy - 15, 21);
    g.fillCircle(cx - 9, cy + 21, 18);
    g.fillCircle(cx - 27, cy + 6, 15);
    // Darker blobs
    g.fillStyle(0x0a0a0a, 0.4);
    g.fillCircle(cx + 6, cy - 18, 15);
    g.fillCircle(cx - 18, cy + 9, 12);
    // Pseudopods everywhere (irregular extensions)
    g.fillStyle(0x1E4D2B);
    g.fillRect(cx - 45, cy - 30, 6, 21);
    g.fillRect(cx - 48, cy - 15, 6, 15);
    g.fillRect(cx + 42, cy - 24, 6, 18);
    g.fillRect(cx + 45, cy - 12, 6, 15);
    g.fillStyle(0x6366F1, 0.6);
    g.fillRect(cx - 36, cy + 30, 6, 15);
    g.fillRect(cx + 30, cy + 33, 6, 12);
    g.fillRect(cx - 12, cy + 42, 6, 12);
    g.fillRect(cx + 15, cy + 39, 6, 15);
    g.fillStyle(0x111111);
    g.fillRect(cx - 27, cy - 36, 5, 15);
    g.fillRect(cx + 33, cy + 21, 5, 18);
    // 15-20 random eyes scattered
    const shoggothEyes = [
      { x: -24, y: -21 }, { x: -12, y: -27 }, { x: 3, y: -24 }, { x: 18, y: -18 },
      { x: 30, y: -9 }, { x: -30, y: -3 }, { x: -15, y: -6 }, { x: 6, y: -9 },
      { x: 21, y: 0 }, { x: -21, y: 9 }, { x: -6, y: 6 }, { x: 12, y: 12 },
      { x: 27, y: 15 }, { x: -27, y: 21 }, { x: -9, y: 21 }, { x: 9, y: 24 },
      { x: -18, y: 30 }, { x: 6, y: 33 }, { x: 24, y: 27 },
    ];
    shoggothEyes.forEach((e, i) => {
      const r = 2 + (i % 3) * 1.5;
      g.fillStyle(0xffffff);
      g.fillCircle(cx + e.x, cy + e.y, r);
      g.fillStyle(i % 4 === 0 ? 0xff3333 : 0x000000);
      g.fillCircle(cx + e.x + 1, cy + e.y, r * 0.5);
    });
    // Multiple toothed mouths
    const mouths = [
      { x: -15, y: -3, w: 15 }, { x: 9, y: 9, w: 12 },
      { x: -24, y: 15, w: 11 }, { x: 15, y: -12, w: 14 },
    ];
    mouths.forEach(m => {
      g.fillStyle(0x220000);
      g.fillRect(cx + m.x, cy + m.y, m.w, 5);
      // Teeth (white zigzag)
      g.fillStyle(0xeeeeee);
      for (let t = 0; t < m.w; t += 3) {
        g.fillRect(cx + m.x + t, cy + m.y, 2, 3);
        g.fillRect(cx + m.x + t, cy + m.y + 3, 2, 2);
      }
    });
    g.generateTexture('boss-shoggoth', 120, 120);
    g.destroy();
  }

  // ── Clawd the Crab ──

  private generateClawd(): void {
    const g = this.add.graphics();
    // Body (orange oval)
    g.fillStyle(0xC15F3C);
    g.fillCircle(12, 12, 9);
    // Left claw
    g.fillStyle(0xd47040);
    g.fillCircle(3, 8, 5);
    g.fillStyle(0xC15F3C);
    g.fillRect(2, 5, 3, 2);
    // Right claw
    g.fillStyle(0xd47040);
    g.fillCircle(21, 8, 5);
    g.fillStyle(0xC15F3C);
    g.fillRect(20, 5, 3, 2);
    // Eyes
    g.fillStyle(0xffffff);
    g.fillCircle(9, 9, 3);
    g.fillCircle(15, 9, 3);
    g.fillStyle(0x000000);
    g.fillCircle(9, 9, 2);
    g.fillCircle(15, 9, 2);
    // Legs (3 per side)
    g.fillStyle(0xC15F3C);
    g.fillRect(2, 15, 5, 3);
    g.fillRect(0, 18, 5, 3);
    g.fillRect(2, 21, 5, 3);
    g.fillRect(18, 15, 5, 3);
    g.fillRect(20, 18, 5, 3);
    g.fillRect(18, 21, 5, 3);
    g.generateTexture('clawd', 24, 24);
    g.destroy();

    // Clawd projectile (small orange dot)
    const gp = this.add.graphics();
    gp.fillStyle(0xC15F3C);
    gp.fillCircle(4, 4, 4);
    gp.fillStyle(0xd47040);
    gp.fillRect(3, 2, 3, 3);
    gp.generateTexture('clawd-projectile', 8, 8);
    gp.destroy();
  }

  // ── Effect Sprites ──

  private generateLobsterSprite(): void {
    const g = this.add.graphics();
    // Red lobster silhouette
    g.fillStyle(0xEF4444);
    // Body (central oval)
    g.fillRect(8, 8, 9, 12);
    // Tail fan
    g.fillRect(9, 20, 6, 3);
    g.fillTriangle(8, 23, 12, 23, 6, 24);
    g.fillTriangle(12, 23, 17, 23, 18, 24);
    g.fillTriangle(9, 23, 15, 23, 12, 24);
    // Left claw (open pincer)
    g.fillRect(2, 3, 5, 5);
    g.fillRect(0, 3, 2, 2);
    g.fillRect(0, 6, 2, 2);
    g.fillRect(5, 6, 3, 3);
    // Right claw (open pincer)
    g.fillRect(18, 3, 5, 5);
    g.fillRect(23, 3, 2, 2);
    g.fillRect(23, 6, 2, 2);
    g.fillRect(17, 6, 3, 3);
    // Antennae
    g.lineStyle(2, 0xEF4444);
    g.lineBetween(9, 8, 5, 0);
    g.lineBetween(15, 8, 20, 0);
    // Eyes
    g.fillStyle(0x000000);
    g.fillCircle(9, 8, 2);
    g.fillCircle(15, 8, 2);
    g.generateTexture('lobster', 24, 24);
    g.destroy();
  }

  private generateRedBookSprite(): void {
    const g = this.add.graphics();
    // Small red book
    g.fillStyle(0xEF4444);
    g.fillRect(1, 0, 8, 10);
    // Book spine (darker)
    g.fillStyle(0xdc2626);
    g.fillRect(1, 0, 2, 10);
    // Pages (white edge)
    g.fillStyle(0xeeeeee);
    g.fillRect(9, 1, 1, 8);
    // Gold star on cover
    g.fillStyle(0xffd700);
    g.fillRect(5, 3, 2, 1);
    g.fillRect(4, 4, 4, 1);
    g.fillRect(5, 5, 2, 1);
    g.fillRect(4, 6, 1, 1);
    g.fillRect(7, 6, 1, 1);
    g.generateTexture('red-book', 10, 10);
    g.destroy();
  }

  private generateGreenHatSprite(): void {
    const g = this.add.graphics();
    // Green military/communist style cap
    g.fillStyle(0x15803d);
    // Main cap body (flat top)
    g.fillRect(2, 2, 12, 6);
    // Top slightly rounded
    g.fillRect(3, 1, 10, 2);
    // Short brim/peak at front
    g.fillStyle(0x116b34);
    g.fillRect(0, 7, 10, 3);
    g.fillRect(1, 6, 8, 2);
    // Band
    g.fillStyle(0x116b34);
    g.fillRect(2, 6, 12, 1);
    // Red star on front
    g.fillStyle(0xff0000);
    g.fillRect(6, 3, 2, 1);
    g.fillRect(5, 4, 4, 1);
    g.fillRect(6, 5, 2, 1);
    g.generateTexture('green-hat', 16, 10);
    g.destroy();
  }

  private generateMacBombSprite(): void {
    const g = this.add.graphics();
    // Classic Mac bomb — small dark circle with lit fuse
    g.fillStyle(0x222222);
    g.fillCircle(4, 5, 3);
    // Fuse line going up-right
    g.lineStyle(1, 0x666666);
    g.lineBetween(5, 2, 7, 0);
    // Fuse spark
    g.fillStyle(0xff8800);
    g.fillRect(7, 0, 1, 1);
    g.fillStyle(0xffcc00);
    g.fillRect(6, 0, 1, 1);
    // Bomb highlight
    g.fillStyle(0x444444);
    g.fillRect(3, 4, 1, 1);
    g.generateTexture('mac-bomb', 8, 8);
    g.destroy();
  }

  private generateLipstickMintySprite(): void {
    const g = this.add.graphics();
    const cx = 24, cy = 30;
    // Teal squid body
    g.fillStyle(0x2ec4b6);
    g.fillCircle(cx, cy - 9, 15);
    // Body extension down
    g.fillRect(cx - 12, cy, 24, 9);
    // Tentacles (blocking/arms-out pose — spread wide)
    // Left tentacles (extended outward)
    g.fillRect(cx - 21, cy - 3, 9, 5);
    g.fillRect(cx - 24, cy - 6, 6, 5);
    g.fillRect(cx - 18, cy + 6, 8, 5);
    g.fillRect(cx - 21, cy + 9, 6, 5);
    // Right tentacles (extended outward)
    g.fillRect(cx + 12, cy - 3, 9, 5);
    g.fillRect(cx + 18, cy - 6, 6, 5);
    g.fillRect(cx + 11, cy + 6, 8, 5);
    g.fillRect(cx + 15, cy + 9, 6, 5);
    // Lower tentacles
    g.fillRect(cx - 6, cy + 9, 5, 12);
    g.fillRect(cx + 2, cy + 9, 5, 12);
    g.fillRect(cx - 11, cy + 9, 5, 9);
    g.fillRect(cx + 6, cy + 9, 5, 9);
    // Eyes with long eyelashes
    g.fillStyle(0xffffff);
    g.fillCircle(cx - 6, cy - 12, 5);
    g.fillCircle(cx + 6, cy - 12, 5);
    g.fillStyle(0x000000);
    g.fillCircle(cx - 6, cy - 12, 2);
    g.fillCircle(cx + 6, cy - 12, 2);
    // Long eyelashes above eyes
    g.fillStyle(0x000000);
    g.fillRect(cx - 11, cy - 20, 2, 5);
    g.fillRect(cx - 8, cy - 21, 2, 5);
    g.fillRect(cx - 5, cy - 20, 2, 5);
    g.fillRect(cx + 5, cy - 20, 2, 5);
    g.fillRect(cx + 8, cy - 21, 2, 5);
    g.fillRect(cx + 11, cy - 20, 2, 5);
    // Bright red lipstick lips (thick, kissing shape)
    g.fillStyle(0xff0000);
    g.fillRect(cx - 6, cy - 3, 12, 3);
    g.fillRect(cx - 5, cy - 5, 9, 2);
    g.fillRect(cx - 5, cy, 9, 2);
    // Lip highlight
    g.fillStyle(0xff4444);
    g.fillRect(cx - 3, cy - 5, 6, 2);
    g.generateTexture('lipstick-minty', 48, 60);
    g.destroy();
  }

  private generateCreditsAshMinty(): void {
    const g = this.add.graphics();
    // Left: Ash — human with sandy-blonde hair, smiling, ~60px tall
    // Ash body
    g.fillStyle(0x4477aa);
    g.fillRect(15, 30, 18, 21);
    // Ash legs
    g.fillStyle(0x2a2a3a);
    g.fillRect(17, 51, 6, 15);
    g.fillRect(26, 51, 6, 15);
    // Ash shoes
    g.fillStyle(0x222222);
    g.fillRect(15, 66, 8, 3);
    g.fillRect(26, 66, 8, 3);
    // Ash arms
    g.fillStyle(0x4477aa);
    g.fillRect(9, 32, 6, 15);
    g.fillRect(33, 32, 6, 15);
    // Ash hands
    g.fillStyle(0xffcba4);
    g.fillRect(9, 47, 6, 3);
    g.fillRect(33, 47, 6, 3);
    // Ash head
    g.fillStyle(0xffcba4);
    g.fillRect(15, 9, 18, 20);
    // Sandy-blonde hair with side parting
    g.fillStyle(0xd4a84a);
    g.fillRect(15, 5, 18, 8);
    g.fillRect(14, 8, 5, 9);
    // Side parting (darker line)
    g.fillStyle(0xb8923e);
    g.fillRect(21, 5, 2, 6);
    // Eyes
    g.fillStyle(0x222222);
    g.fillRect(18, 15, 3, 3);
    g.fillRect(27, 15, 3, 3);
    // Smile
    g.fillStyle(0xdd9980);
    g.fillRect(20, 21, 9, 2);
    g.fillRect(18, 20, 2, 2);
    g.fillRect(29, 20, 2, 2);
    // Nose
    g.fillStyle(0xeebb90);
    g.fillRect(23, 17, 3, 3);

    // Right: Minty squid with sunglasses, ~45px tall
    const mx = 75, my = 27;
    // Minty body (teal)
    g.fillStyle(0x2ec4b6);
    g.fillCircle(mx, my, 12);
    g.fillRect(mx - 9, my + 6, 18, 9);
    // Tentacles
    g.fillRect(mx - 8, my + 15, 5, 9);
    g.fillRect(mx - 2, my + 15, 5, 9);
    g.fillRect(mx + 5, my + 15, 5, 9);
    g.fillRect(mx - 11, my + 12, 5, 8);
    g.fillRect(mx + 8, my + 12, 5, 8);
    // Sunglasses
    g.fillStyle(0x111111);
    g.fillRect(mx - 9, my - 3, 8, 5);
    g.fillRect(mx + 2, my - 3, 8, 5);
    g.fillRect(mx - 2, my - 2, 3, 2);
    // Arms
    g.fillStyle(0x888888);
    g.fillRect(mx - 11, my - 3, 2, 5);
    g.fillRect(mx + 9, my - 3, 2, 5);
    // Lens reflection
    g.fillStyle(0x333333);
    g.fillRect(mx - 8, my - 2, 2, 2);
    g.fillRect(mx + 3, my - 2, 2, 2);
    // Mouth
    g.fillStyle(0x229988);
    g.fillRect(mx - 3, my + 5, 6, 2);

    g.generateTexture('credits-ash-minty', 120, 90);
    g.destroy();
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
    this.generateBgCrumblingBuilding();
    // GPU rack (used across levels)
    this.generateBgGpuRack();
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
    g.fillRect(6, 39, 6, 15);
    // Right leg
    g.fillRect(18, 39, 6, 15);
    // Shoes
    g.fillStyle(0x222222);
    g.fillRect(5, 54, 8, 5);
    g.fillRect(18, 54, 8, 5);
    // Shoe highlights
    g.fillStyle(0x333333);
    g.fillRect(5, 54, 8, 2);
    g.fillRect(18, 54, 8, 2);

    // === Body / shirt ===
    g.fillStyle(0x333344);
    g.fillRect(8, 21, 15, 20);
    // Shirt shadow right side
    g.fillStyle(0x2a2a3a);
    g.fillRect(20, 23, 3, 17);
    // Shirt highlight left
    g.fillStyle(0x3d3d50);
    g.fillRect(8, 21, 3, 18);
    // Collar
    g.fillStyle(0x3a3a4e);
    g.fillRect(11, 20, 9, 3);

    // === Arms ===
    // Left arm (down)
    g.fillStyle(0x333344);
    g.fillRect(3, 23, 5, 12);
    // Left hand
    g.fillStyle(0xffcba4);
    g.fillRect(3, 35, 5, 3);
    // Right arm (raised, cheering)
    g.fillStyle(0x333344);
    g.fillRect(23, 21, 5, 5);
    g.fillRect(24, 17, 5, 6);
    g.fillRect(26, 12, 5, 6);
    // Right hand (raised)
    g.fillStyle(0xffcba4);
    g.fillRect(26, 9, 5, 5);

    // === Head ===
    g.fillStyle(0xffcba4);
    g.fillRect(9, 6, 12, 14);
    // Head shadow (right side)
    g.fillStyle(0xeebb90);
    g.fillRect(18, 8, 3, 11);
    // Head highlight (left side)
    g.fillStyle(0xffddb8);
    g.fillRect(9, 6, 3, 12);
    // Eyes
    g.fillStyle(0x222222);
    g.fillRect(11, 11, 3, 3);
    g.fillRect(17, 11, 3, 3);
    // Mouth
    g.fillStyle(0xdd9980);
    g.fillRect(12, 15, 6, 2);
    // Nose
    g.fillStyle(0xeebb90);
    g.fillRect(14, 12, 3, 3);

    // === Red MAGA cap ===
    g.fillStyle(0xcc2222);
    g.fillRect(8, 3, 15, 6);
    g.fillRect(8, 2, 15, 3);
    // White front panel strip
    g.fillStyle(0xffffff);
    g.fillRect(11, 3, 8, 3);
    // Cap brim (overhangs left by 3px)
    g.fillStyle(0xcc2222);
    g.fillRect(5, 8, 17, 3);
    // Brim shadow
    g.fillStyle(0xaa1a1a);
    g.fillRect(5, 9, 17, 2);
    // Cap highlight
    g.fillStyle(0xdd3333);
    g.fillRect(9, 2, 6, 2);

    g.generateTexture('bg-maga-person', 30, 60);
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
    g.fillRect(8, 42, 6, 12);
    // Right leg (back)
    g.fillRect(17, 41, 6, 14);
    // Shoes
    g.fillStyle(0x222222);
    g.fillRect(6, 54, 8, 5);
    g.fillRect(17, 54, 8, 5);
    // Shoe highlights
    g.fillStyle(0x333333);
    g.fillRect(6, 54, 8, 2);
    g.fillRect(17, 54, 8, 2);

    // === Suit jacket ===
    g.fillStyle(0x1a2a40);
    g.fillRect(6, 21, 18, 21);
    // Jacket shadow (right)
    g.fillStyle(0x14223a);
    g.fillRect(21, 23, 3, 18);
    // Jacket highlight (left)
    g.fillStyle(0x203450);
    g.fillRect(6, 21, 3, 20);
    // Lapel lines (lighter V at chest)
    g.fillStyle(0x253a55);
    g.fillRect(11, 21, 2, 9);
    g.fillRect(12, 23, 2, 8);
    g.fillRect(18, 21, 2, 9);
    g.fillRect(17, 23, 2, 8);
    // White shirt strip
    g.fillStyle(0xeeeeee);
    g.fillRect(14, 23, 3, 12);
    // Blue tie
    g.fillStyle(0x0A66C2);
    g.fillRect(14, 24, 3, 2);
    g.fillRect(14, 26, 3, 12);
    // Tie highlight
    g.fillStyle(0x0d7ade);
    g.fillRect(14, 26, 2, 9);

    // === Arms ===
    // Left arm (carrying briefcase)
    g.fillStyle(0x1a2a40);
    g.fillRect(2, 23, 5, 15);
    // Left hand
    g.fillStyle(0xffcba4);
    g.fillRect(2, 38, 5, 3);
    // Right arm
    g.fillStyle(0x1a2a40);
    g.fillRect(24, 23, 5, 15);
    // Right hand
    g.fillStyle(0xffcba4);
    g.fillRect(24, 38, 5, 3);

    // === Briefcase ===
    g.fillStyle(0x4a3520);
    g.fillRect(0, 41, 9, 8);
    // Briefcase clasp
    g.fillStyle(0x8b7355);
    g.fillRect(3, 41, 3, 2);
    // Briefcase handle
    g.fillStyle(0x3a2a18);
    g.fillRect(2, 38, 6, 3);
    // Briefcase highlight
    g.fillStyle(0x5a4530);
    g.fillRect(0, 41, 2, 8);

    // === Head ===
    g.fillStyle(0xffcba4);
    g.fillRect(9, 5, 12, 15);
    // Head shadow
    g.fillStyle(0xeebb90);
    g.fillRect(18, 6, 3, 12);
    // Head highlight
    g.fillStyle(0xffddb8);
    g.fillRect(9, 5, 3, 14);
    // Hair
    g.fillStyle(0x3a2a18);
    g.fillRect(9, 2, 12, 5);
    g.fillRect(8, 3, 3, 6);
    // Eyes
    g.fillStyle(0x222222);
    g.fillRect(11, 11, 3, 3);
    g.fillRect(17, 11, 3, 3);
    // Mouth
    g.fillStyle(0xdd9980);
    g.fillRect(12, 15, 6, 2);

    g.generateTexture('bg-suited-person', 30, 60);
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
    g.fillRect(6, 24, 18, 3);  // chair seat
    g.fillRect(5, 15, 3, 12);  // chair back left
    g.fillRect(23, 15, 3, 12); // chair back right
    g.fillRect(5, 15, 21, 3);  // chair back top
    // Chair legs
    g.fillStyle(0x3a3a3a);
    g.fillRect(6, 45, 3, 9);
    g.fillRect(21, 45, 3, 9);
    // Chair wheels
    g.fillStyle(0x333333);
    g.fillCircle(8, 56, 3);
    g.fillCircle(23, 56, 3);

    // === Desk ===
    g.fillStyle(0x6b4423);
    g.fillRect(0, 42, 42, 5);
    // Desk legs
    g.fillStyle(0x5a3a1a);
    g.fillRect(2, 47, 3, 15);
    g.fillRect(38, 47, 3, 15);
    // Desk edge highlight
    g.fillStyle(0x7b5433);
    g.fillRect(0, 42, 42, 2);
    // Desk shadow
    g.fillStyle(0x5a3a1a);
    g.fillRect(0, 45, 42, 2);

    // === Monitor on desk ===
    // Monitor bezel
    g.fillStyle(0x333333);
    g.fillRect(21, 24, 20, 18);
    // Screen
    g.fillStyle(0x1a3050);
    g.fillRect(23, 26, 17, 15);
    // Green text lines on screen
    g.fillStyle(0x44cc44);
    g.fillRect(24, 27, 12, 2);
    g.fillRect(24, 30, 9, 2);
    g.fillRect(24, 33, 14, 2);
    g.fillRect(24, 36, 8, 2);
    // Monitor stand
    g.fillStyle(0x444444);
    g.fillRect(29, 42, 5, 2);
    g.fillRect(27, 41, 8, 2);

    // === Coffee mug ===
    g.fillStyle(0x8b5e3c);
    g.fillRect(3, 35, 6, 8);
    // Mug handle
    g.fillStyle(0x7a5030);
    g.fillRect(9, 36, 3, 2);
    g.fillRect(11, 36, 2, 5);
    g.fillRect(9, 39, 3, 2);
    // Coffee inside
    g.fillStyle(0x3a2010);
    g.fillRect(3, 35, 6, 3);
    // Steam
    g.fillStyle(0xcccccc);
    g.fillRect(5, 32, 2, 3);
    g.fillRect(8, 30, 2, 3);

    // === Figure (seated, hunched forward) ===
    // Body
    g.fillStyle(0x4a6080);
    g.fillRect(8, 27, 15, 15);
    // Body shadow
    g.fillStyle(0x3a5070);
    g.fillRect(20, 29, 3, 12);
    // Arms reaching to desk/keyboard
    g.fillStyle(0x4a6080);
    g.fillRect(6, 33, 5, 9);
    g.fillRect(20, 33, 5, 9);
    // Hands
    g.fillStyle(0xffcba4);
    g.fillRect(12, 41, 5, 3);
    g.fillRect(18, 41, 5, 3);

    // === Head ===
    g.fillStyle(0xffcba4);
    g.fillRect(9, 12, 12, 14);
    // Hair
    g.fillStyle(0x4a3020);
    g.fillRect(9, 9, 12, 5);
    g.fillRect(8, 11, 3, 6);
    // Head shadow
    g.fillStyle(0xeebb90);
    g.fillRect(18, 14, 3, 11);
    // Glasses frames
    g.fillStyle(0x333333);
    g.fillRect(11, 17, 5, 3);  // left lens
    g.fillRect(17, 17, 5, 3);  // right lens
    g.fillRect(15, 17, 2, 2);  // bridge
    // Glasses shine
    g.fillStyle(0x6688aa);
    g.fillRect(11, 17, 2, 2);
    g.fillRect(17, 17, 2, 2);
    // Eyes behind glasses
    g.fillStyle(0x222222);
    g.fillRect(12, 18, 2, 2);
    g.fillRect(18, 18, 2, 2);
    // Mouth
    g.fillStyle(0xdd9980);
    g.fillRect(14, 23, 5, 2);

    g.generateTexture('bg-scientist', 42, 66);
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
    g.fillTriangle(15, 18, 3, 54, 27, 54);
    g.fillRect(6, 45, 18, 9);
    // Robe fold lines (darker vertical stripes)
    g.fillStyle(0x4a3528);
    g.fillRect(11, 24, 2, 30);
    g.fillRect(15, 21, 2, 33);
    g.fillRect(20, 24, 2, 30);
    // Robe highlight (left side, top-left lighting)
    g.fillStyle(0x6b5040);
    g.fillRect(8, 27, 3, 24);
    // Robe shadow (right side)
    g.fillStyle(0x4a3528);
    g.fillRect(23, 27, 3, 24);

    // === Sandals ===
    g.fillStyle(0x8b7355);
    g.fillRect(6, 54, 6, 5);
    g.fillRect(18, 54, 6, 5);
    // Sandal straps
    g.fillStyle(0x7a6245);
    g.fillRect(8, 54, 3, 2);
    g.fillRect(20, 54, 3, 2);

    // === Head ===
    g.fillStyle(0xffcba4);
    g.fillRect(9, 3, 12, 14);
    // Face shadow
    g.fillStyle(0xeebb90);
    g.fillRect(18, 5, 3, 11);
    // Face highlight
    g.fillStyle(0xffddb8);
    g.fillRect(9, 3, 3, 12);
    // Eyes
    g.fillStyle(0x333333);
    g.fillRect(11, 8, 3, 3);
    g.fillRect(17, 8, 3, 3);
    // Eyebrows (furrowed, thinking)
    g.fillStyle(0x5a4030);
    g.fillRect(11, 6, 5, 2);
    g.fillRect(17, 6, 5, 2);
    // Nose
    g.fillStyle(0xeebb90);
    g.fillRect(14, 9, 3, 3);
    // Mouth (under beard)
    g.fillStyle(0xdd9980);
    g.fillRect(12, 14, 5, 2);

    // === Beard ===
    g.fillStyle(0x6b5040);
    g.fillRect(11, 14, 9, 3);
    g.fillRect(12, 17, 6, 3);
    g.fillRect(14, 20, 3, 2);
    // Beard highlight
    g.fillStyle(0x7a5f50);
    g.fillRect(11, 14, 3, 2);

    // === Hair (bald top with sides) ===
    g.fillStyle(0x6b5040);
    g.fillRect(8, 5, 3, 9);
    g.fillRect(20, 5, 3, 9);
    g.fillRect(9, 2, 12, 3);

    // === Hand raised to chin (thinking) ===
    g.fillStyle(0x5C4033);
    // Arm coming from robe
    g.fillRect(8, 21, 5, 6);
    g.fillRect(6, 18, 5, 6);
    // Hand near chin
    g.fillStyle(0xffcba4);
    g.fillRect(9, 15, 5, 5);
    // Fingers
    g.fillRect(8, 15, 2, 3);

    // === Book under other arm ===
    g.fillStyle(0x8b1a1a);
    g.fillRect(21, 27, 6, 9);
    // Book spine
    g.fillStyle(0x6b1010);
    g.fillRect(21, 27, 2, 9);
    // Book pages
    g.fillStyle(0xeeeedd);
    g.fillRect(23, 29, 3, 6);
    // Book highlight
    g.fillStyle(0x9b2a2a);
    g.fillRect(23, 27, 5, 2);

    g.generateTexture('bg-philosopher', 30, 60);
    g.destroy();
  }

  // ── Level 6: SSRN Background Sprites ──

  private generateBgSocialScientist(): void {
    const g = this.add.graphics();
    // === Legs ===
    g.fillStyle(0x2a2a3a);
    g.fillRect(8, 42, 6, 12);
    g.fillRect(17, 42, 6, 12);
    // Shoes
    g.fillStyle(0x222222);
    g.fillRect(6, 54, 8, 5);
    g.fillRect(17, 54, 8, 5);
    // Shoe highlights
    g.fillStyle(0x333333);
    g.fillRect(6, 54, 8, 2);
    g.fillRect(17, 54, 8, 2);

    // === Professional shirt ===
    g.fillStyle(0x4477aa);
    g.fillRect(6, 21, 18, 21);
    // Shirt shadow (right)
    g.fillStyle(0x366699);
    g.fillRect(21, 23, 3, 18);
    // Shirt highlight (left)
    g.fillStyle(0x5588bb);
    g.fillRect(6, 21, 3, 20);
    // Shirt collar
    g.fillStyle(0x5588bb);
    g.fillRect(11, 20, 9, 3);
    // Button line
    g.fillStyle(0x3366aa);
    g.fillRect(14, 24, 2, 15);
    // Buttons
    g.fillStyle(0xdddddd);
    g.fillRect(14, 26, 2, 2);
    g.fillRect(14, 30, 2, 2);
    g.fillRect(14, 35, 2, 2);
    // Pen in pocket
    g.fillStyle(0x222222);
    g.fillRect(9, 23, 2, 6);
    g.fillStyle(0xcccccc);
    g.fillRect(9, 23, 2, 2);

    // === Left arm (holding clipboard) ===
    g.fillStyle(0x4477aa);
    g.fillRect(2, 23, 5, 15);
    // Left hand
    g.fillStyle(0xffcba4);
    g.fillRect(2, 38, 5, 3);

    // === Clipboard ===
    g.fillStyle(0xddddaa);
    g.fillRect(0, 30, 8, 12);
    // Clipboard clip at top
    g.fillStyle(0x888888);
    g.fillRect(2, 29, 5, 3);
    // Chart marks on clipboard
    g.fillStyle(0x666666);
    g.fillRect(2, 33, 5, 2);
    g.fillRect(2, 36, 3, 2);
    g.fillRect(2, 39, 5, 2);
    // Small bar chart on clipboard
    g.fillStyle(0x4477aa);
    g.fillRect(2, 38, 2, 3);
    g.fillRect(5, 36, 2, 5);

    // === Right arm (extended, finger raised / lecturing) ===
    g.fillStyle(0x4477aa);
    g.fillRect(24, 23, 5, 8);
    g.fillRect(26, 21, 5, 5);
    // Hand
    g.fillStyle(0xffcba4);
    g.fillRect(27, 18, 3, 5);
    // Index finger pointing up
    g.fillRect(27, 14, 2, 5);

    // === Head ===
    g.fillStyle(0xffcba4);
    g.fillRect(9, 3, 12, 15);
    // Head shadow
    g.fillStyle(0xeebb90);
    g.fillRect(18, 5, 3, 12);
    // Head highlight
    g.fillStyle(0xffddb8);
    g.fillRect(9, 3, 3, 14);
    // Hair
    g.fillStyle(0x3a2a18);
    g.fillRect(9, 0, 12, 5);
    g.fillRect(8, 2, 3, 6);
    g.fillRect(20, 2, 3, 6);

    // === Glasses ===
    g.fillStyle(0x333333);
    g.fillRect(11, 8, 5, 3);  // left frame
    g.fillRect(17, 8, 5, 3);  // right frame
    g.fillRect(15, 8, 2, 2);  // bridge
    // Lens shine
    g.fillStyle(0x6688aa);
    g.fillRect(11, 8, 2, 2);
    g.fillRect(17, 8, 2, 2);
    // Eyes behind glasses
    g.fillStyle(0x222222);
    g.fillRect(12, 9, 2, 2);
    g.fillRect(18, 9, 2, 2);
    // Mouth
    g.fillStyle(0xdd9980);
    g.fillRect(12, 14, 6, 2);

    g.generateTexture('bg-social-scientist', 30, 60);
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

  private generateBgCrumblingBuilding(): void {
    const g = this.add.graphics();
    // Neoclassical building facade — crumbling
    // Base steps (some broken)
    g.fillStyle(0x3a3a3a);
    g.fillRect(2, 70, 44, 4);   // bottom step
    g.fillRect(5, 66, 38, 4);   // middle step
    g.fillRect(8, 62, 32, 4);   // top step (broken right side)
    g.fillStyle(0x2a2a2a);
    g.fillRect(32, 63, 8, 3);   // broken chunk missing from top step

    // Main building body
    g.fillStyle(0x4a4a4a);
    g.fillRect(8, 20, 32, 42);

    // 4 columns (2 intact, 2 broken)
    g.fillStyle(0x555555);
    // Column 1 — intact
    g.fillRect(10, 18, 4, 44);
    g.fillStyle(0x606060);
    g.fillRect(10, 18, 1, 44);  // highlight
    // Column 2 — broken stump
    g.fillStyle(0x555555);
    g.fillRect(18, 40, 4, 22);  // short stump
    g.fillStyle(0x4a4a4a);
    g.fillRect(17, 38, 6, 3);   // rubble on top
    // Column 3 — cracked but standing
    g.fillStyle(0x555555);
    g.fillRect(26, 18, 4, 44);
    g.fillStyle(0x606060);
    g.fillRect(26, 18, 1, 44);  // highlight
    // Crack lines on column 3
    g.fillStyle(0x333333);
    g.fillRect(27, 30, 2, 1);
    g.fillRect(28, 31, 1, 3);
    g.fillRect(27, 34, 2, 1);
    g.fillRect(26, 45, 2, 1);
    // Column 4 — broken stump (shorter)
    g.fillStyle(0x555555);
    g.fillRect(34, 48, 4, 14);
    g.fillStyle(0x4a4a4a);
    g.fillRect(33, 46, 6, 3);   // rubble on top

    // Triangular pediment with cracks
    g.fillStyle(0x4a4a4a);
    g.fillTriangle(24, 4, 6, 20, 42, 20);
    // Pediment cracks
    g.fillStyle(0x333333);
    g.fillRect(20, 10, 1, 6);
    g.fillRect(21, 15, 3, 1);
    g.fillRect(30, 8, 1, 8);
    g.fillRect(28, 12, 3, 1);

    // Fallen column pieces on ground
    g.fillStyle(0x444444);
    g.fillRect(0, 74, 8, 3);    // fallen column segment left
    g.fillRect(40, 72, 7, 3);   // fallen column segment right
    g.fillRect(16, 75, 5, 2);   // debris chunk

    // Green vegetation through cracks
    g.fillStyle(0x2d5a1e);
    g.fillRect(19, 37, 2, 3);   // vine on broken col 2
    g.fillRect(35, 45, 1, 3);   // vine on broken col 4
    g.fillRect(14, 60, 2, 2);   // moss on steps
    g.fillRect(30, 68, 3, 2);   // moss on steps

    // SSRN green tint overlay
    g.fillStyle(0x1E4D2B, 0.15);
    g.fillRect(0, 0, 48, 80);

    g.generateTexture('bg-crumbling-building', 48, 80);
    g.destroy();
  }

  private generateBgGpuRack(): void {
    const g = this.add.graphics();
    // Tall black server rack
    g.fillStyle(0x111111);
    g.fillRect(0, 0, 40, 80);
    // Rack frame edges
    g.fillStyle(0x222222);
    g.fillRect(0, 0, 2, 80);
    g.fillRect(38, 0, 2, 80);
    g.fillRect(0, 0, 40, 2);
    g.fillRect(0, 78, 40, 2);
    // GPU cards inside — 5 rows
    for (let i = 0; i < 5; i++) {
      const gy = 6 + i * 14;
      // Green PCB
      g.fillStyle(0x22cc55);
      g.fillRect(4, gy, 32, 10);
      // PCB darker traces
      g.fillStyle(0x1aaa44);
      g.fillRect(6, gy + 2, 20, 1);
      g.fillRect(6, gy + 5, 16, 1);
      g.fillRect(6, gy + 8, 22, 1);
      // Silver heatsink fins
      g.fillStyle(0x888888);
      g.fillRect(8, gy + 1, 12, 8);
      g.fillStyle(0x999999);
      for (let f = 0; f < 5; f++) {
        g.fillRect(9 + f * 2, gy + 1, 1, 8);
      }
      // GPU chip (darker rectangle on PCB)
      g.fillStyle(0x333333);
      g.fillRect(22, gy + 2, 8, 6);
      g.fillStyle(0x444444);
      g.fillRect(23, gy + 3, 6, 4);
      // Power connector dots
      g.fillStyle(0xffcc00);
      g.fillRect(32, gy + 3, 2, 2);
      g.fillRect(32, gy + 6, 2, 2);
    }
    // Blue LED strips (vertical on sides)
    g.fillStyle(0x3388ff);
    g.fillRect(2, 4, 1, 72);
    g.fillRect(37, 4, 1, 72);
    // LED glow
    g.fillStyle(0x3388ff, 0.3);
    g.fillRect(3, 4, 1, 72);
    g.fillRect(36, 4, 1, 72);
    // Cooling fan circles (2 at bottom)
    g.fillStyle(0x333333);
    g.fillCircle(14, 76, 4);
    g.fillCircle(26, 76, 4);
    // Fan center dots
    g.fillStyle(0x555555);
    g.fillCircle(14, 76, 1.5);
    g.fillCircle(26, 76, 1.5);
    // Fan blade hints
    g.lineStyle(1, 0x444444);
    g.lineBetween(12, 74, 16, 78);
    g.lineBetween(12, 78, 16, 74);
    g.lineBetween(24, 74, 28, 78);
    g.lineBetween(24, 78, 28, 74);
    // Cable bundles at top
    g.fillStyle(0x222222);
    g.fillRect(6, 0, 3, 5);
    g.fillRect(16, 0, 3, 5);
    g.fillRect(26, 0, 3, 5);
    // Cable bundles at bottom
    g.fillRect(10, 78, 3, 2);
    g.fillRect(20, 78, 3, 2);
    g.fillRect(30, 78, 3, 2);
    g.generateTexture('bg-gpu-rack', 40, 80);
    g.destroy();
  }
}
