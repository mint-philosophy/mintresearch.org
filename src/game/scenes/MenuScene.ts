import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT, MINTY_COLORS } from '../constants';
import { GameStateManager } from '../state/GameStateManager';
import { audioEngine } from '../systems/AudioEngine';
import { menuTrack } from '../audio/tracks/menu';

export class MenuScene extends Phaser.Scene {
  private stateManager!: GameStateManager;
  private selectedLevel: number = 1;
  private levelTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: SCENES.MENU });
  }

  create(): void {
    this.stateManager = new GameStateManager();
    this.cameras.main.setBackgroundColor(COLORS.bg0);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 60, 'DATA DASH', {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '32px',
      color: '#2ec4b6',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 95, 'A MINT Lab Adventure', {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '11px',
      color: '#5c6370',
    }).setOrigin(0.5);

    // Minty mascot
    if (this.textures.exists('minty-cool')) {
      const minty = this.add.image(GAME_WIDTH / 2, 170, 'minty-cool');
      minty.setScale(0.3);
      minty.setAlpha(0.8);
      this.tweens.add({
        targets: minty,
        y: 165,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Level select
    const maxUnlocked = this.stateManager.maxLevelUnlocked;
    const levelNames = [
      '1. X (Twitter)',
      '2. LinkedIn',
      '3. Bluesky',
      '4. ArXiv',
      '5. PhilPapers',
      '6. SSRN',
    ];

    this.add.text(GAME_WIDTH / 2, 230, '── SELECT LEVEL ──', {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '10px',
      color: '#5c6370',
    }).setOrigin(0.5);

    levelNames.forEach((name, i) => {
      const level = i + 1;
      const unlocked = level <= maxUnlocked;
      const y = 260 + i * 24;

      const text = this.add.text(GAME_WIDTH / 2, y, unlocked ? name : `${level}. ????`, {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '12px',
        color: unlocked ? (level === this.selectedLevel ? '#2ec4b6' : '#abb2bf') : '#333333',
      }).setOrigin(0.5);

      if (unlocked) {
        text.setInteractive({ useHandCursor: true });
        text.on('pointerover', () => {
          this.selectedLevel = level;
          this.updateLevelHighlight();
        });
        text.on('pointerdown', () => {
          this.startLevel(level);
        });
      }

      this.levelTexts.push(text);
    });

    // High score
    if (this.stateManager.highScore > 0) {
      this.add.text(GAME_WIDTH / 2, 420, `HIGH SCORE: ${this.stateManager.highScore}`, {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '10px',
        color: '#e5c07b',
      }).setOrigin(0.5);
    }

    // Start prompt
    const prompt = this.add.text(GAME_WIDTH / 2, 460, '[ Press ENTER to start ]', {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '11px',
      color: '#2ec4b6',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Start music on first interaction
    this.input.once('pointerdown', () => {
      audioEngine.init();
      audioEngine.playTrack(menuTrack);
    });

    // Keyboard controls
    this.input.keyboard!.on('keydown-ENTER', () => this.startLevel(this.selectedLevel));
    this.input.keyboard!.on('keydown-SPACE', () => this.startLevel(this.selectedLevel));
    this.input.keyboard!.on('keydown-UP', () => this.changeSelection(-1));
    this.input.keyboard!.on('keydown-DOWN', () => this.changeSelection(1));
    this.input.keyboard!.on('keydown-W', () => this.changeSelection(-1));
    this.input.keyboard!.on('keydown-S', () => this.changeSelection(1));
  }

  private changeSelection(dir: number): void {
    const maxUnlocked = this.stateManager.maxLevelUnlocked;
    this.selectedLevel = Phaser.Math.Clamp(this.selectedLevel + dir, 1, maxUnlocked);
    this.updateLevelHighlight();
  }

  private updateLevelHighlight(): void {
    const maxUnlocked = this.stateManager.maxLevelUnlocked;
    this.levelTexts.forEach((text, i) => {
      const level = i + 1;
      if (level <= maxUnlocked) {
        text.setColor(level === this.selectedLevel ? '#2ec4b6' : '#abb2bf');
      }
    });
  }

  private startLevel(level: number): void {
    audioEngine.stopTrack();
    this.scene.start(SCENES.LEVEL, { level });
  }
}
