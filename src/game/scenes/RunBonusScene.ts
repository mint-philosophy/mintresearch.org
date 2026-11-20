import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, PLAYER_SPEED, SCENES } from '../constants';
import { GameStateManager } from '../state/GameStateManager';
import { audioEngine } from '../systems/AudioEngine';

export const RUN_UNLOCK_LEVEL = 10;

const START = 200;
const FINISH = 3540;
const GROUND = 419;
const RUN_SPEED = PLAYER_SPEED;
const WAVE_START = 18;
const FONT = '"JetBrains Mono", monospace';

type Stack = { x: number; height: number; width: number };
const STACKS: Stack[] = [
  { x: 675, height: 30, width: 43 },
  { x: 1000, height: 49, width: 45 },
  { x: 1395, height: 36, width: 60 },
  { x: 1770, height: 56, width: 39 },
  { x: 2120, height: 35, width: 49 },
  { x: 2520, height: 44, width: 51 },
  { x: 2840, height: 55, width: 46 },
  { x: 3240, height: 38, width: 53 },
];
const WAVE_COLOURS = [0xe3e4ff, 0xffecc4, 0xffd4df, 0xd2f2ef];

export class RunBonusScene extends Phaser.Scene {
  private layer!: Phaser.GameObjects.Graphics;
  private minty!: Phaser.GameObjects.Image;
  private distance!: Phaser.GameObjects.Text;
  private controls!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: { A: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key; W: Phaser.Input.Keyboard.Key; R: Phaser.Input.Keyboard.Key };
  private x = START;
  private y = GROUND;
  private velocityY = 0;
  private waveX = WAVE_START;
  private age = 0;
  private state: 'running' | 'caught' | 'won' = 'running';
  private retryAt = 0;
  private assist = true;
  private sceneInputUsed = false;

  constructor() { super(SCENES.RUN_BONUS); }

  preload(): void {
    if (!this.textures.exists('run-rainbow-67')) {
      const base = document.querySelector('meta[name="base"]')?.getAttribute('content') || '';
      this.load.svg('run-rainbow-67', `${base}/assets/run-rainbow-67.svg`);
    }
  }

  create(): void {
    const save = new GameStateManager();
    if (save.maxLevelUnlocked < RUN_UNLOCK_LEVEL) {
      this.scene.start(SCENES.MENU);
      return;
    }
    this.assist = save.invincibleMinty;
    this.state = 'running';
    this.sceneInputUsed = false;
    this.age = 0;
    this.x = START;
    this.y = GROUND;
    this.velocityY = 0;
    this.waveX = WAVE_START;
    this.cameras.main.setBackgroundColor(0x11182b);
    this.layer = this.add.graphics();
    this.minty = this.add.image(START, GROUND, 'minty-teal').setOrigin(.5, 1).setDisplaySize(40, 44);
    this.add.text(25, 19, 'RUN!', { fontFamily: FONT, color: '#ffdc80', fontSize: '26px', fontStyle: 'bold' });
    this.add.text(25, 53, 'THE PAPERWORK IS COMING!', { fontFamily: FONT, color: '#f3dfef', fontSize: '11px' });
    this.distance = this.add.text(GAME_WIDTH - 24, 28, '', { fontFamily: FONT, color: '#a8f5e6', fontSize: '13px' }).setOrigin(1, 0);
    this.add.text(GAME_WIDTH / 2, 453, '← → / A D  Run   ·   ↑ / W / Space  Jump   ·   Esc  Menu', {
      fontFamily: FONT, color: '#e3e4f5', fontSize: '12px',
    }).setOrigin(.5, 0);
    const keyboard = this.input.keyboard!;
    this.controls = keyboard.createCursorKeys();
    this.keys = keyboard.addKeys('A,D,W,R') as typeof this.keys;
    keyboard.on('keydown-ESC', () => this.backToMenu());
    keyboard.on('keydown-ENTER', () => this.retry());
    keyboard.on('keydown-R', () => this.retry());
    this.renderCourse();
  }

  update(_time: number, elapsed: number): void {
    if (this.state !== 'running') return;
    // Clamp elapsed time so an unfocused tab can never cause an instant catch.
    const dt = Math.min(elapsed, 50) / 1000;
    this.age += dt;
    if (this.age > .65) {
      // Keep the pursuing edge just inside the camera even on a clean run.
      this.waveX = Math.max(this.waveX + (153 + 63 * (this.x / FINISH)) * dt, this.x - 245);
    }
    const direction = Number(this.controls.right.isDown || this.keys.D.isDown) -
      Number(this.controls.left.isDown || this.keys.A.isDown);
    const jump = Phaser.Input.Keyboard.JustDown(this.controls.up) ||
      Phaser.Input.Keyboard.JustDown(this.controls.space) ||
      Phaser.Input.Keyboard.JustDown(this.keys.W);
    if (jump && this.y >= GROUND) this.velocityY = -445;
    this.velocityY += 1050 * dt;
    this.y = Math.min(GROUND, this.y + this.velocityY * dt);
    if (this.y >= GROUND) this.velocityY = 0;

    const nextX = Math.max(38, this.x + direction * RUN_SPEED * dt);
    const blocked = STACKS.some(s => nextX + 14 > s.x && nextX - 14 < s.x + s.width && this.y > GROUND - s.height + 3);
    if (!blocked) this.x = nextX;
    if (direction !== 0) this.minty.setFlipX(direction < 0);
    this.renderCourse();
    if (this.x >= FINISH) this.showResult('won');
    else if (this.waveX + 14 >= this.x) this.showResult('caught');
  }

  private renderCourse(): void {
    const g = this.layer;
    const offset = Phaser.Math.Clamp(this.x - 280, 0, FINISH - GAME_WIDTH + 130);
    const wave = this.waveX - offset;
    g.clear();
    g.fillStyle(0x1b2441, 1).fillRect(0, 92, GAME_WIDTH, GROUND - 92);
    for (let i = 0; i < 20; i++) {
      const bx = ((i * 97 - offset * .25) % (GAME_WIDTH + 110) + GAME_WIDTH + 110) % (GAME_WIDTH + 110) - 65;
      const high = 83 + (i * 47) % 142;
      g.fillStyle(i % 2 ? 0x273153 : 0x202947, 1).fillRoundedRect(bx, GROUND - high, 64, high, 7);
      for (let line = 0; line < 3; line++) {
        g.fillStyle(0x798ab0, .26).fillRect(bx + 11, GROUND - high + 19 + line * 17, 42, 4);
      }
    }
    g.fillStyle(0x06baff, .22).fillRect(0, GROUND - 5, GAME_WIDTH, 5);
    g.fillStyle(0x11182b, 1).fillRect(0, GROUND, GAME_WIDTH, GAME_HEIGHT - GROUND);
    g.fillStyle(0x8bc7e5, .8).fillRect(0, GROUND, GAME_WIDTH, 3);
    for (let i = 0; i < 27; i++) {
      const xx = i * 36 - offset % 36;
      g.fillStyle(0x304d66, .9).fillRect(xx, GROUND + 11, 16, 3);
    }

    for (const stack of STACKS) {
      const xx = stack.x - offset;
      if (xx > GAME_WIDTH || xx + stack.width < 0) continue;
      for (let h = 0; h < stack.height; h += 6) {
        g.fillStyle(h % 12 ? 0xe1e8ff : 0xfff0cf, 1).fillRoundedRect(xx, GROUND - h - 6, stack.width, 6, 2);
        g.fillStyle(0x6d7296, 1).fillRect(xx + 5, GROUND - h - 2, stack.width - 10, 1);
      }
    }

    const flag = FINISH - offset;
    if (flag < GAME_WIDTH + 70) {
      g.fillStyle(0xeaf3ff).fillRect(flag, 210, 5, GROUND - 210);
      for (let row = 0; row < 4; row++) for (let col = 0; col < 5; col++) {
        g.fillStyle((row + col) % 2 ? 0x1d2641 : 0xa2f6cc).fillRect(flag + 5 + col * 11, 210 + row * 11, 11, 11);
      }
    }
    // A continuous front plus tumbling pages keeps the chase readable.
    if (wave > -65) {
      g.fillStyle(0x8978bf, .9).fillRect(0, 100, Math.max(0, wave - 12), GROUND - 100);
      for (let i = 0; i < 42; i++) {
        const px = wave - (i * 37 % 156) + Math.sin(this.age * 7 + i) * 14;
        const py = 106 + (i * 43 % 279) + Math.cos(this.age * 8 + i) * 13;
        const ww = 24 + i % 10;
        if (px < -ww) continue;
        g.fillStyle(0x665785, .63).fillRoundedRect(px + 3, py + 3, ww, 24, 3);
        g.fillStyle(WAVE_COLOURS[i % 4], 1).fillRoundedRect(px, py, ww, 24, 3);
        g.fillStyle(0x796f93, .8).fillRect(px + 4, py + 6, ww - 8, 2);
        g.fillRect(px + 4, py + 11, ww - 12, 2).fillRect(px + 4, py + 16, ww - 8, 2);
      }
    }
    this.minty.setPosition(this.x - offset, this.y);
    const progress = Phaser.Math.Clamp(Math.floor((this.x - START) * 100 / (FINISH - START)), 0, 100);
    this.distance.setText(`${progress}% TO FINISH`);
    g.fillStyle(0x3b4867).fillRoundedRect(GAME_WIDTH - 182, 49, 158, 8, 4);
    if (progress) g.fillStyle(0x77ebc2).fillRoundedRect(GAME_WIDTH - 182, 49, 158 * progress / 100, 8, 4);
  }

  private showResult(result: 'won' | 'caught'): void {
    this.state = result;
    this.retryAt = this.time.now + 300;
    const won = result === 'won';
    const cx = GAME_WIDTH / 2;
    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x090c1e, .9).setDepth(10);
    const title = won ? 'YOU OUTRAN THE PAPERWORK!' : 'PAPERWORK CAUGHT UP!';
    this.add.text(cx, won ? 71 : 178, title, {
      fontFamily: FONT, color: won ? '#fff1c3' : '#ffd2df', fontSize: '25px', fontStyle: 'bold',
    }).setOrigin(.5).setDepth(11);
    if (won) {
      this.addFlying67s();
      audioEngine.playSFX('victory');
      this.add.image(cx, 232, 'run-rainbow-67').setDepth(11);
      this.add.text(cx, 360, 'Bonus level complete!', { fontFamily: FONT, color: '#acf4e7', fontSize: '15px' }).setOrigin(.5).setDepth(11);
    } else {
      this.add.text(cx, 227, this.assist
        ? 'Invincible Minty: no lives or health lost.'
        : 'This bonus run doesn’t cost campaign lives.', {
        fontFamily: FONT, color: '#a8f5e6', fontSize: '13px',
      }).setOrigin(.5).setDepth(11);
      this.add.text(cx, 260, 'Keep moving and jump over the file stacks.', {
        fontFamily: FONT, color: '#e4e7f4', fontSize: '13px',
      }).setOrigin(.5).setDepth(11);
    }
    const actionY = won ? 419 : 328;
    this.button(cx - 115, actionY, won ? 'REPLAY [R]' : 'TRY AGAIN [R]', () => this.retry());
    this.button(cx + 115, actionY, 'MENU [ESC]', () => this.backToMenu());
  }

  private addFlying67s(): void {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    // Small numbers loop around the outside; the central 67 and actions stay still.
    const orbit = (phase: number) => ({
      x: GAME_WIDTH / 2 + Math.cos(phase) * 321,
      y: GAME_HEIGHT / 2 + Math.sin(phase) * 128,
    });
    for (let i = 0; i < 8; i++) {
      const phase = (i + 0.35) * Math.PI / 4;
      const start = orbit(phase);
      const bubble = this.add.image(start.x, start.y, 'run-rainbow-67')
        .setName(`flying-67-${i}`)
        .setScale(0.106 + (i % 3) * 0.025)
        .setRotation(Math.sin(phase) * 0.19)
        .setAlpha(0.73)
        .setDepth(10.5);
      if (reduceMotion) continue;
      this.tweens.addCounter({
        from: phase,
        to: phase + Math.PI * 2,
        duration: 11300,
        repeat: -1,
        onUpdate: tween => {
          const current = tween.getValue() ?? phase;
          const point = orbit(current);
          bubble.setPosition(point.x, point.y).setRotation(Math.sin(current * 2) * 0.22);
        },
      });
    }
  }

  private button(x: number, y: number, label: string, action: () => void): void {
    const b = this.add.text(x, y, label, {
      fontFamily: FONT, color: '#13253a', backgroundColor: '#b6f2e3', fontSize: '13px',
      padding: { left: 16, right: 16, top: 9, bottom: 9 },
    }).setOrigin(.5).setDepth(11).setInteractive({ useHandCursor: true });
    b.on('pointerdown', action);
  }

  private retry(): void {
    if (this.state === 'running' || this.sceneInputUsed || this.time.now < this.retryAt) return;
    this.sceneInputUsed = true;
    this.scene.restart();
  }

  private backToMenu(): void {
    if (this.sceneInputUsed) return;
    this.sceneInputUsed = true;
    this.scene.start(SCENES.MENU);
  }
}
