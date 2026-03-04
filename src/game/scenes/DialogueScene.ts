import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { getDialogue } from '../dialogue/index';

export class DialogueScene extends Phaser.Scene {
  private dialogueLines: string[] = [];
  private currentLine: number = 0;
  private textDisplay!: Phaser.GameObjects.Text;
  private nameDisplay!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENES.DIALOGUE });
  }

  create(data: { dialogueKey: string; levelScene: Phaser.Scene }): void {
    const dialogue = getDialogue(data.dialogueKey);
    this.dialogueLines = dialogue.lines;
    this.currentLine = 0;

    // Semi-transparent background
    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 60, GAME_WIDTH - 40, 100, 0x0a0a0a, 0.9);
    bg.setStrokeStyle(1, 0x2ec4b6);

    // Speaker name
    this.nameDisplay = this.add.text(30, GAME_HEIGHT - 105, dialogue.speaker, {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '10px',
      color: '#2ec4b6',
      fontStyle: 'bold',
    });

    // Text
    this.textDisplay = this.add.text(30, GAME_HEIGHT - 88, '', {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '10px',
      color: '#abb2bf',
      wordWrap: { width: GAME_WIDTH - 80 },
    });

    // Continue prompt
    this.promptText = this.add.text(GAME_WIDTH - 30, GAME_HEIGHT - 20, '[ENTER]', {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '8px',
      color: '#5c6370',
    }).setOrigin(1, 1);

    this.tweens.add({
      targets: this.promptText,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    this.showLine();

    this.input.keyboard!.on('keydown-ENTER', () => this.advance());
    this.input.keyboard!.on('keydown-SPACE', () => this.advance());
  }

  private showLine(): void {
    if (this.currentLine < this.dialogueLines.length) {
      this.textDisplay.setText(this.dialogueLines[this.currentLine]);
    }
  }

  private advance(): void {
    this.currentLine++;
    if (this.currentLine >= this.dialogueLines.length) {
      this.close();
    } else {
      this.showLine();
    }
  }

  private close(): void {
    const levelScene = this.scene.get(SCENES.LEVEL);
    this.scene.stop();
    this.scene.resume(SCENES.LEVEL);
  }
}
