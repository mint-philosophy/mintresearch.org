import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../constants';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAMEOVER });
  }

  create(data: { score: number; papers: number; level: number; won: boolean }): void {
    this.cameras.main.setBackgroundColor(COLORS.bg0);

    const title = data.won ? 'LEVEL COMPLETE!' : 'GAME OVER';
    const titleColor = data.won ? '#2ec4b6' : '#e06c75';

    this.add.text(GAME_WIDTH / 2, 100, title, {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '28px',
      color: titleColor,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Stats
    const style = {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '12px',
      color: '#abb2bf',
    };

    this.add.text(GAME_WIDTH / 2, 180, `Score: ${data.score}`, style).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 205, `Papers Collected: ${data.papers}`, style).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 230, `Level: ${data.level}`, style).setOrigin(0.5);

    if (data.won && data.level < 6) {
      const next = this.add.text(GAME_WIDTH / 2, 300, '[ ENTER — Next Level ]', {
        ...style, color: '#2ec4b6',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      next.on('pointerdown', () => {
        this.scene.start(SCENES.LEVEL, { level: data.level + 1 });
      });

      this.input.keyboard!.on('keydown-ENTER', () => {
        this.scene.start(SCENES.LEVEL, { level: data.level + 1 });
      });
    } else if (data.won && data.level === 6) {
      this.add.text(GAME_WIDTH / 2, 290, 'YOU DEFEATED THE SHOGGOTH!', {
        ...style, fontSize: '14px', color: '#e5c07b',
      }).setOrigin(0.5);

      this.add.text(GAME_WIDTH / 2, 320, 'Research integrity preserved.', {
        ...style, fontSize: '11px', color: '#5c6370',
      }).setOrigin(0.5);

      this.input.keyboard!.on('keydown-ENTER', () => {
        this.scene.start(SCENES.MENU);
      });
    } else {
      this.input.keyboard!.on('keydown-ENTER', () => {
        this.scene.start(SCENES.MENU);
      });
    }

    // Menu option
    const menu = this.add.text(GAME_WIDTH / 2, 380, '[ M — Menu ]', {
      ...style, fontSize: '10px', color: '#5c6370',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menu.on('pointerdown', () => this.scene.start(SCENES.MENU));
    this.input.keyboard!.on('keydown-M', () => this.scene.start(SCENES.MENU));

    // Retry option
    const retry = this.add.text(GAME_WIDTH / 2, 405, '[ R — Retry Level ]', {
      ...style, fontSize: '10px', color: '#5c6370',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    retry.on('pointerdown', () => this.scene.start(SCENES.LEVEL, { level: data.level }));
    this.input.keyboard!.on('keydown-R', () => this.scene.start(SCENES.LEVEL, { level: data.level }));
  }
}
