import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, PLAYER_MAX_HEALTH } from '../constants';

export class HUDScene extends Phaser.Scene {
  private healthBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private papersText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private muteBtn!: Phaser.GameObjects.Text;
  private muted: boolean = false;
  private bossBar: Phaser.GameObjects.Graphics | null = null;
  private bossNameText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: SCENES.HUD });
  }

  create(data: { health: number; lives: number; score: number; papers: number; ammo: number; level: number; levelName: string }): void {
    const style = {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '10px',
      color: '#abb2bf',
    };

    // Level name
    this.levelText = this.add.text(GAME_WIDTH / 2, 6, `L${data.level} — ${data.levelName}`, {
      ...style, fontSize: '9px', color: '#5c6370',
    }).setOrigin(0.5, 0);

    // Health bar
    this.healthBar = this.add.graphics();
    this.add.text(8, 20, 'INTEGRITY', { ...style, fontSize: '8px', color: '#5c6370' });
    this.healthText = this.add.text(80, 20, `${data.health}%`, { ...style, fontSize: '8px' });

    // Score
    this.scoreText = this.add.text(8, 34, `SCORE: ${data.score}`, style);

    // Papers
    this.papersText = this.add.text(8, 48, `PAPERS: ${data.papers}`, style);

    // Ammo
    this.ammoText = this.add.text(8, 62, `AMMO: ${data.ammo}`, style);

    // Lives
    this.livesText = this.add.text(GAME_WIDTH - 8, 20, `♥ ${data.lives}`, {
      ...style, color: '#e06c75',
    }).setOrigin(1, 0);

    // Mute button
    this.muteBtn = this.add.text(GAME_WIDTH - 8, 34, '♪ ON', {
      ...style, fontSize: '9px', color: '#5c6370',
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    this.muteBtn.on('pointerdown', () => {
      this.muted = !this.muted;
      this.muteBtn.setText(this.muted ? '♪ OFF' : '♪ ON');
    });

    this.drawHealthBar(data.health);

    // Listen for updates from LevelScene
    this.events.on('hudUpdate', (d: { health: number; lives: number; score: number; papers: number; ammo: number }) => {
      this.healthText.setText(`${Math.max(0, d.health)}%`);
      this.scoreText.setText(`SCORE: ${d.score}`);
      this.papersText.setText(`PAPERS: ${d.papers}`);
      this.ammoText.setText(`AMMO: ${d.ammo}`);
      this.livesText.setText(`♥ ${d.lives}`);
      this.drawHealthBar(d.health);
    });

    // Boss health bar
    this.events.on('bossHealthUpdate', (d: { hp: number; maxHp: number; name: string }) => {
      if (!this.bossBar) {
        this.bossBar = this.add.graphics();
        const bossNames: Record<string, string> = {
          algorithmVortex: 'ALGORITHM VORTEX',
          engagementKing: 'ENGAGEMENT KING',
          forkSwarm: 'FORK SWARM',
          paperMill: 'PAPER MILL',
          theVoid: 'THE VOID',
          shoggoth: 'SHOGGOTH',
        };
        this.bossNameText = this.add.text(GAME_WIDTH / 2, 76, bossNames[d.name] || d.name.toUpperCase(), {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '8px',
          color: '#e06c75',
          fontStyle: 'bold',
        }).setOrigin(0.5, 0);
      }
      this.drawBossBar(d.hp, d.maxHp);
    });
  }

  private drawBossBar(hp: number, maxHp: number): void {
    if (!this.bossBar) return;
    this.bossBar.clear();
    const pct = Math.max(0, hp / maxHp);
    const barWidth = 200;
    const barHeight = 8;
    const x = GAME_WIDTH / 2 - barWidth / 2;
    const y = 88;

    // Background
    this.bossBar.fillStyle(0x333333);
    this.bossBar.fillRect(x, y, barWidth, barHeight);

    // Fill (red)
    this.bossBar.fillStyle(0xe06c75);
    this.bossBar.fillRect(x, y, barWidth * pct, barHeight);

    // Border
    this.bossBar.lineStyle(1, 0x888888);
    this.bossBar.strokeRect(x, y, barWidth, barHeight);
  }

  private drawHealthBar(health: number): void {
    this.healthBar.clear();
    const pct = Math.max(0, health / PLAYER_MAX_HEALTH);
    const barWidth = 60;
    const barHeight = 6;
    const x = 8;
    const y = 30;

    // Background
    this.healthBar.fillStyle(0x333333);
    this.healthBar.fillRect(x, y, barWidth, barHeight);

    // Fill
    const color = pct > 0.5 ? 0x98c379 : pct > 0.25 ? 0xe5c07b : 0xe06c75;
    this.healthBar.fillStyle(color);
    this.healthBar.fillRect(x, y, barWidth * pct, barHeight);

    // Border
    this.healthBar.lineStyle(1, 0x555555);
    this.healthBar.strokeRect(x, y, barWidth, barHeight);
  }
}
