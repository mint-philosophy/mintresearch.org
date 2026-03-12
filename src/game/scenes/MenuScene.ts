import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT, LEVEL_THEMES } from '../constants';
import type { LevelNumber } from '../constants';
import { GameStateManager } from '../state/GameStateManager';
import { audioEngine } from '../systems/AudioEngine';
import { menuTrack } from '../audio/tracks/menu';
import { getTotalLevels } from '../levels/LevelRegistry';

export class MenuScene extends Phaser.Scene {
  private static readonly LEVEL_LIST_TOP = 258;
  private static readonly LEVEL_ROW_HEIGHT = 24;
  private static readonly LEVEL_VISIBLE_ROWS = 6;
  private stateManager!: GameStateManager;
  private selectedLevel: number = 1;
  private levelTexts: Phaser.GameObjects.Text[] = [];
  private levelListContainer!: Phaser.GameObjects.Container;
  private konamiBuffer: string[] = [];
  private static readonly KONAMI_SEQUENCE = ['UP','UP','DOWN','DOWN','LEFT','RIGHT','LEFT','RIGHT','Z','X','ENTER'];

  constructor() {
    super({ key: SCENES.MENU });
  }

  create(): void {
    this.stateManager = new GameStateManager();
    this.cameras.main.setBackgroundColor(COLORS.bg0);
    const totalLevels = getTotalLevels();

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
    const maxUnlocked = Math.min(this.stateManager.maxLevelUnlocked, totalLevels);
    const levelNames = this.getLevelNames();

    this.add.text(GAME_WIDTH / 2, 230, '── SELECT LEVEL ──', {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '10px',
      color: '#5c6370',
    }).setOrigin(0.5);

    this.levelListContainer = this.add.container(GAME_WIDTH / 2, MenuScene.LEVEL_LIST_TOP);

    const listMask = this.make.graphics({ x: 0, y: 0, add: false });
    listMask.fillRect(GAME_WIDTH / 2 - 180, MenuScene.LEVEL_LIST_TOP - 12, 360, MenuScene.LEVEL_ROW_HEIGHT * MenuScene.LEVEL_VISIBLE_ROWS + 24);
    this.levelListContainer.setMask(listMask.createGeometryMask());

    levelNames.forEach((name, i) => {
      const level = i + 1;
      const unlocked = level <= maxUnlocked;
      const y = i * MenuScene.LEVEL_ROW_HEIGHT;

      const text = this.add.text(0, y, unlocked ? name : `${level}. ????`, {
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

      this.levelListContainer.add(text);
      this.levelTexts.push(text);
    });

    this.add.text(GAME_WIDTH / 2, 410, '[ W/S, arrows, or mouse wheel ]', {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '10px',
      color: '#5c6370',
    }).setOrigin(0.5);

    // High score
    if (this.stateManager.highScore > 0) {
      this.add.text(GAME_WIDTH / 2, 434, `HIGH SCORE: ${this.stateManager.highScore}`, {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '10px',
        color: '#e5c07b',
      }).setOrigin(0.5);
    }

    // Start prompt
    const prompt = this.add.text(GAME_WIDTH / 2, 466, '[ Press ENTER to start ]', {
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
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: Phaser.GameObjects.GameObject[], _deltaX: number, deltaY: number) => {
      if (Math.abs(deltaY) < 4) return;
      this.changeSelection(deltaY > 0 ? 1 : -1);
    });

    // Konami code listener
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      const key = event.key.toUpperCase().replace('ARROW', '');
      this.konamiBuffer.push(key);
      if (this.konamiBuffer.length > MenuScene.KONAMI_SEQUENCE.length) {
        this.konamiBuffer.shift();
      }
      if (this.konamiBuffer.length === MenuScene.KONAMI_SEQUENCE.length &&
          this.konamiBuffer.every((k, i) => k === MenuScene.KONAMI_SEQUENCE[i])) {
        this.activateKonami();
      }
    });

    this.syncLevelListScroll();
  }

  private changeSelection(dir: number): void {
    const maxUnlocked = Math.min(this.stateManager.maxLevelUnlocked, getTotalLevels());
    this.selectedLevel = Phaser.Math.Clamp(this.selectedLevel + dir, 1, maxUnlocked);
    this.updateLevelHighlight();
  }

  private updateLevelHighlight(): void {
    const maxUnlocked = Math.min(this.stateManager.maxLevelUnlocked, getTotalLevels());
    this.levelTexts.forEach((text, i) => {
      const level = i + 1;
      if (level <= maxUnlocked) {
        text.setColor(level === this.selectedLevel ? '#2ec4b6' : '#abb2bf');
      }
    });
    this.syncLevelListScroll();
  }

  private syncLevelListScroll(): void {
    const maxUnlocked = Math.min(this.stateManager.maxLevelUnlocked, getTotalLevels());
    const maxStart = Math.max(0, maxUnlocked - MenuScene.LEVEL_VISIBLE_ROWS);
    const desiredStart = Phaser.Math.Clamp(
      this.selectedLevel - 1 - Math.floor(MenuScene.LEVEL_VISIBLE_ROWS / 2),
      0,
      maxStart
    );
    this.levelListContainer.y = MenuScene.LEVEL_LIST_TOP - desiredStart * MenuScene.LEVEL_ROW_HEIGHT;
  }

  private activateKonami(): void {
    // Unlock all levels
    const totalLevels = getTotalLevels();
    for (let i = 1; i <= totalLevels; i++) {
      this.stateManager.unlockLevel(i);
    }

    // Teal screen flash
    const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x2ec4b6, 0.6);
    flash.setDepth(100);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 600,
      onComplete: () => flash.destroy(),
    });

    // Victory jingle
    audioEngine.playSFX('victory');

    // "ALL LEVELS UNLOCKED" text
    const unlockText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'ALL LEVELS UNLOCKED', {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '18px',
      color: '#2ec4b6',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(101);

    this.tweens.add({
      targets: unlockText,
      y: GAME_HEIGHT / 2 - 30,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => unlockText.destroy(),
    });

    // Refresh level list highlighting
    this.updateLevelHighlight();
    // Rebuild level text colors to show newly unlocked
    this.levelTexts.forEach((text, i) => {
      const level = i + 1;
      text.setColor(level === this.selectedLevel ? '#2ec4b6' : '#abb2bf');
      text.setText(this.getLevelNames()[i]);
      text.removeInteractive();
      text.removeAllListeners();
      text.setInteractive({ useHandCursor: true });
      text.on('pointerover', () => {
        this.selectedLevel = level;
        this.updateLevelHighlight();
      });
      text.on('pointerdown', () => {
        this.startLevel(level);
      });
    });

    // Clear buffer
    this.konamiBuffer = [];
  }

  private startLevel(level: number): void {
    audioEngine.stopTrack();
    this.scene.start(SCENES.LEVEL, { level });
  }

  private getLevelNames(): string[] {
    const totalLevels = getTotalLevels();
    return Array.from({ length: totalLevels }, (_, index) => {
      const level = (index + 1) as LevelNumber;
      return `${level}. ${LEVEL_THEMES[level].name}`;
    });
  }
}
