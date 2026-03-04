import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED, PLAYER_JUMP,
  PLAYER_MAX_HEALTH, PLAYER_LIVES, PLAYER_INK_RANGE_BASE, PLAYER_INK_SPEED,
  PLAYER_INK_COOLDOWN, PLAYER_INK_RANGE_PER_5, PLAYER_INK_RANGE_CAP,
  PAPER_HEAL, PAPER_SCORE, SLOP_DAMAGE, CONTACT_DAMAGE,
  TILE_SIZE, ENEMY_TIERS } from '../constants';
import type { LevelConfig, LevelNumber, EnemyTier } from '../constants';
import { getLevelConfig } from '../levels/LevelRegistry';
import { StateMachine } from '../systems/StateMachine';
import { GameStateManager } from '../state/GameStateManager';
import { audioEngine } from '../systems/AudioEngine';
import { level1Track } from '../audio/tracks/level1';
import { level2Track } from '../audio/tracks/level2';
import { level3Track } from '../audio/tracks/level3';
import { level4Track } from '../audio/tracks/level4';
import { level5Track } from '../audio/tracks/level5';
import { level6Track } from '../audio/tracks/level6';
import { bossTrack } from '../audio/tracks/boss';
import type { TrackData } from '../systems/AudioEngine';

export class LevelScene extends Phaser.Scene {
  // State
  private levelNum: LevelNumber = 1;
  private config!: LevelConfig;
  private gsm!: GameStateManager;
  private fsm!: StateMachine;

  // Player
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerHealth: number = PLAYER_MAX_HEALTH;
  private playerLives: number = PLAYER_LIVES;
  private score: number = 0;
  private papersCollected: number = 0;
  private facing: number = 1; // 1 = right, -1 = left
  private lastInkTime: number = 0;
  private invincible: boolean = false;
  private lastCheckpoint: { x: number; y: number } | null = null;

  // Groups
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private papers!: Phaser.Physics.Arcade.Group;
  private powerUps!: Phaser.Physics.Arcade.Group;
  private inkGroup!: Phaser.Physics.Arcade.Group;
  private slopGroup!: Phaser.Physics.Arcade.Group;
  private npcs!: Phaser.Physics.Arcade.StaticGroup;
  private checkpoints!: Phaser.Physics.Arcade.StaticGroup;

  // Controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private keyZ!: Phaser.Input.Keyboard.Key;
  private keyX!: Phaser.Input.Keyboard.Key;

  // Boss
  private boss: Phaser.Physics.Arcade.Sprite | null = null;
  private bossHealth: number = 0;
  private bossMaxHealth: number = 0;
  private bossPhase: number = 0;
  private bossDefeated: boolean = false;

  // Active effects
  private activeEffects: Map<string, Phaser.Time.TimerEvent> = new Map();
  private speedMultiplier: number = 1;
  private controlsReversed: boolean = false;
  private fogOverlay: Phaser.GameObjects.Rectangle | null = null;

  constructor() {
    super({ key: SCENES.LEVEL });
  }

  init(data: { level: number }): void {
    this.levelNum = (data.level || 1) as LevelNumber;
  }

  create(): void {
    this.gsm = new GameStateManager();
    this.config = getLevelConfig(this.levelNum);
    this.playerHealth = PLAYER_MAX_HEALTH;
    this.score = 0;
    this.papersCollected = 0;
    this.bossDefeated = false;
    this.invincible = false;
    this.speedMultiplier = 1;
    this.controlsReversed = false;
    this.activeEffects.clear();
    this.lastCheckpoint = null;

    // Background
    this.cameras.main.setBackgroundColor(this.config.background);

    // Draw parallax background elements
    this.drawBackground();

    // Groups
    this.platforms = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.papers = this.physics.add.group();
    this.powerUps = this.physics.add.group();
    this.inkGroup = this.physics.add.group();
    this.slopGroup = this.physics.add.group();
    this.npcs = this.physics.add.staticGroup();
    this.checkpoints = this.physics.add.staticGroup();

    // World bounds
    this.physics.world.setBounds(0, 0, this.config.width, GAME_HEIGHT);

    // Build level
    this.buildPlatforms();
    this.spawnEnemies();
    this.spawnPapers();
    this.spawnPowerUps();
    this.spawnNPCs();
    this.spawnCheckpoints();

    // Player
    const ps = this.config.playerStart;
    this.player = this.physics.add.sprite(ps.x, ps.y, 'minty-teal');
    this.player.setScale(0.08);
    this.player.setCollideWorldBounds(true);
    this.player.body!.setSize(200, 300);
    this.player.body!.setOffset(150, 100);

    // Camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, this.config.width, GAME_HEIGHT);

    // Collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);

    // Overlaps
    this.physics.add.overlap(this.player, this.papers, this.collectPaper, undefined, this);
    this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, undefined, this);
    this.physics.add.overlap(this.player, this.slopGroup, this.hitBySlop, undefined, this);
    this.physics.add.overlap(this.inkGroup, this.enemies, this.inkHitEnemy, undefined, this);
    this.physics.add.overlap(this.player, this.npcs, this.touchNPC, undefined, this);
    this.physics.add.overlap(this.player, this.checkpoints, this.hitCheckpoint, undefined, this);
    this.physics.add.collider(this.inkGroup, this.platforms, (ink) => {
      (ink as Phaser.Physics.Arcade.Sprite).destroy();
    });

    // Controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey('W'),
      A: this.input.keyboard!.addKey('A'),
      S: this.input.keyboard!.addKey('S'),
      D: this.input.keyboard!.addKey('D'),
    };
    this.keyZ = this.input.keyboard!.addKey('Z');
    this.keyX = this.input.keyboard!.addKey('X');

    // Pause
    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.launch(SCENES.PAUSE, { levelScene: this });
      this.scene.pause();
    });

    // Launch HUD
    this.scene.launch(SCENES.HUD, {
      health: this.playerHealth,
      lives: this.playerLives,
      score: this.score,
      papers: this.papersCollected,
      level: this.levelNum,
      levelName: this.config.name,
    });

    // State machine
    this.fsm = new StateMachine();
    this.fsm.addState('playing', {
      update: (dt) => this.updatePlaying(dt),
    });
    this.fsm.addState('dead', {
      enter: () => this.onDeath(),
    });
    this.fsm.addState('bossIntro', {
      enter: () => this.startBossFight(),
    });
    this.fsm.addState('bossFight', {
      update: (dt) => this.updateBossFight(dt),
    });
    this.fsm.addState('victory', {
      enter: () => this.onVictory(),
    });
    this.fsm.setState('playing');

    // Spawn boss at end of level
    this.spawnBoss();

    // Start level music
    const tracks: Record<number, TrackData> = {
      1: level1Track, 2: level2Track, 3: level3Track,
      4: level4Track, 5: level5Track, 6: level6Track,
    };
    audioEngine.init();
    const track = tracks[this.levelNum];
    if (track) audioEngine.playTrack(track);

    this.events.emit('levelStarted', { level: this.levelNum, name: this.config.name });
  }

  update(_time: number, delta: number): void {
    this.fsm.update(delta);
  }

  private updatePlaying(_dt: number): void {
    if (!this.player?.active) return;

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const speed = PLAYER_SPEED * this.speedMultiplier;

    // Horizontal movement
    let moveDir = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) moveDir = -1;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) moveDir = 1;

    if (this.controlsReversed) moveDir *= -1;
    body.setVelocityX(moveDir * speed);

    if (moveDir !== 0) {
      this.facing = moveDir;
      this.player.setFlipX(moveDir < 0);
    }

    // Jump
    if ((this.cursors.up.isDown || this.wasd.W.isDown || this.cursors.space.isDown) && body.blocked.down) {
      body.setVelocityY(PLAYER_JUMP);
      audioEngine.playSFX('jump');
    }

    // Shoot ink
    if (Phaser.Input.Keyboard.JustDown(this.keyZ) || Phaser.Input.Keyboard.JustDown(this.keyX)) {
      this.shootInk();
    }

    // Update enemies
    this.updateEnemies();

    // Check boss trigger
    if (this.boss && !this.bossDefeated && !this.fsm.isState('bossFight') && !this.fsm.isState('bossIntro')) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.boss.x, this.boss.y);
      if (dist < 300) {
        this.fsm.setState('bossIntro');
      }
    }
  }

  private shootInk(): void {
    const now = this.time.now;
    if (now - this.lastInkTime < PLAYER_INK_COOLDOWN) return;
    this.lastInkTime = now;

    const ink = this.inkGroup.create(this.player.x + this.facing * 16, this.player.y, 'ink') as Phaser.Physics.Arcade.Sprite;
    ink.body!.allowGravity = false;
    ink.setVelocityX(this.facing * PLAYER_INK_SPEED);
    audioEngine.playSFX('shoot');

    // Destroy after range
    const range = Math.min(
      PLAYER_INK_RANGE_BASE + Math.floor(this.papersCollected / 5) * PLAYER_INK_RANGE_PER_5,
      PLAYER_INK_RANGE_CAP
    );
    const lifetime = (range / PLAYER_INK_SPEED) * 1000;
    this.time.delayedCall(lifetime, () => { if (ink.active) ink.destroy(); });
  }

  private buildPlatforms(): void {
    // Floor
    for (let x = 0; x < this.config.width; x += 64) {
      const plat = this.platforms.create(x + 32, GAME_HEIGHT - 8, 'platform') as Phaser.Physics.Arcade.Sprite;
      plat.setScale(1, 1).refreshBody();
    }

    // Level platforms
    this.config.platforms.forEach(p => {
      const numTiles = Math.ceil(p.width / 64);
      for (let i = 0; i < numTiles; i++) {
        const px = p.x + i * 64;
        const plat = this.platforms.create(px, p.y, 'platform') as Phaser.Physics.Arcade.Sprite;
        plat.refreshBody();
      }
    });
  }

  private spawnEnemies(): void {
    this.config.enemies.forEach(e => {
      const tier = e.tier || 'peach';
      const tierData = ENEMY_TIERS[tier];

      // Create enemy sprite — octopuses use emoji text, others use colored rectangles
      let enemy: Phaser.Physics.Arcade.Sprite;

      if (e.type === 'octopus') {
        // Generate a colored rectangle for octopus
        const colorMap: Record<string, number> = {
          peach: 0xffcba4, red: 0xe06c75, orange: 0xf5a623,
        };
        const texKey = `enemy-${e.type}-${tier}`;
        if (!this.textures.exists(texKey)) {
          const g = this.add.graphics();
          g.fillStyle(colorMap[tier] || 0xffcba4);
          // Octopus shape: round head with tentacles
          g.fillCircle(12, 8, 8);
          g.fillRect(4, 12, 4, 8);
          g.fillRect(10, 14, 4, 6);
          g.fillRect(16, 12, 4, 8);
          // Eyes
          g.fillStyle(0x000000);
          g.fillRect(8, 6, 3, 3);
          g.fillRect(14, 6, 3, 3);
          g.generateTexture(texKey, 24, 22);
          g.destroy();
        }
        enemy = this.enemies.create(e.x, e.y, texKey) as Phaser.Physics.Arcade.Sprite;
      } else {
        // Generic enemy rectangle
        const texKey = `enemy-${e.type}`;
        if (!this.textures.exists(texKey)) {
          const g = this.add.graphics();
          const colorMap: Record<string, number> = {
            troll: 0x98c379, influencer: 0xc678dd, critic: 0x5c6370,
            paperFlood: 0xb31b1b, cloudflareWall: 0xf5a623,
          };
          g.fillStyle(colorMap[e.type] || 0x888888);
          g.fillRect(0, 0, 24, 24);
          g.fillStyle(0x000000);
          g.fillRect(6, 6, 4, 4);
          g.fillRect(14, 6, 4, 4);
          g.fillRect(8, 14, 8, 3);
          g.generateTexture(texKey, 24, 24);
          g.destroy();
        }
        enemy = this.enemies.create(e.x, e.y, texKey) as Phaser.Physics.Arcade.Sprite;
      }

      enemy.setData('type', e.type);
      enemy.setData('tier', tier);
      enemy.setData('hp', tierData.hp);
      enemy.setData('speed', tierData.speed);
      enemy.setData('score', tierData.score);
      enemy.setData('patrolRange', e.patrolRange || 100);
      enemy.setData('originX', e.x);
      enemy.setData('patrolDir', 1);
      enemy.setData('lastSlop', 0);
      enemy.setData('slopInterval', tierData.slopInterval);

      enemy.setCollideWorldBounds(true);
    });
  }

  private updateEnemies(): void {
    this.enemies.getChildren().forEach((obj) => {
      const enemy = obj as Phaser.Physics.Arcade.Sprite;
      if (!enemy.active) return;

      const speed = enemy.getData('speed') as number;
      const originX = enemy.getData('originX') as number;
      const patrolRange = enemy.getData('patrolRange') as number;
      let dir = enemy.getData('patrolDir') as number;

      // Patrol
      if (enemy.x > originX + patrolRange) dir = -1;
      else if (enemy.x < originX - patrolRange) dir = 1;
      enemy.setData('patrolDir', dir);
      enemy.setVelocityX(speed * dir);

      // Throw slop
      const now = this.time.now;
      const lastSlop = enemy.getData('lastSlop') as number;
      const slopInterval = enemy.getData('slopInterval') as number;

      if (now - lastSlop > slopInterval && this.player?.active) {
        const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        if (dist < 400) {
          this.throwSlop(enemy);
          enemy.setData('lastSlop', now);
        }
      }
    });
  }

  private throwSlop(from: Phaser.Physics.Arcade.Sprite): void {
    const slop = this.slopGroup.create(from.x, from.y - 8, 'slop') as Phaser.Physics.Arcade.Sprite;
    const angle = Phaser.Math.Angle.Between(from.x, from.y, this.player.x, this.player.y);
    const speed = 180;
    slop.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed - 50);
    slop.body!.allowGravity = true;
    this.time.delayedCall(3000, () => { if (slop.active) slop.destroy(); });
  }

  private spawnPapers(): void {
    this.config.papers.forEach(p => {
      const key = p.isGold ? 'paper-gold' : 'paper';
      const paper = this.papers.create(p.x, p.y, key) as Phaser.Physics.Arcade.Sprite;
      paper.body!.allowGravity = false;
      paper.setData('isGold', !!p.isGold);
      // Float animation
      this.tweens.add({
        targets: paper,
        y: p.y - 6,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });
  }

  private spawnPowerUps(): void {
    const textureMap: Record<string, string> = {
      shield: 'pu-shield', brainBoost: 'pu-brain', speedBolt: 'pu-speed', timeFreeze: 'pu-freeze',
      clippy: 'pd-clippy', fogCloud: 'pd-fog', sludge: 'pd-sludge', dataLeak: 'pd-leak',
    };

    this.config.powerUps.forEach(p => {
      const tex = textureMap[p.type] || 'pu-shield';
      const item = this.powerUps.create(p.x, p.y, tex) as Phaser.Physics.Arcade.Sprite;
      item.body!.allowGravity = false;
      item.setData('puType', p.type);
      this.tweens.add({
        targets: item,
        y: p.y - 4,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });
  }

  private spawnNPCs(): void {
    this.config.npcs.forEach(n => {
      const npc = this.npcs.create(n.x, n.y, `minty-${n.color}`) as Phaser.Physics.Arcade.Sprite;
      npc.setScale(0.06);
      npc.setData('dialogueKey', n.dialogueKey);
      npc.setData('talked', false);
      npc.refreshBody();
    });
  }

  private spawnCheckpoints(): void {
    this.config.checkpoints.forEach(c => {
      const cp = this.checkpoints.create(c.x, c.y, 'checkpoint') as Phaser.Physics.Arcade.Sprite;
      cp.setData('activated', false);
      cp.refreshBody();
    });
  }

  private spawnBoss(): void {
    const bc = this.config.boss;
    const texKey = `boss-${bc.type}`;
    if (!this.textures.exists(texKey)) {
      const g = this.add.graphics();
      g.fillStyle(this.config.themeColor);
      // Larger boss shape
      g.fillCircle(24, 20, 20);
      g.fillRect(4, 30, 8, 12);
      g.fillRect(14, 32, 8, 10);
      g.fillRect(26, 30, 8, 12);
      g.fillRect(36, 32, 8, 10);
      // Eyes
      g.fillStyle(0xff0000);
      g.fillCircle(16, 16, 4);
      g.fillCircle(32, 16, 4);
      g.fillStyle(0x000000);
      g.fillCircle(16, 16, 2);
      g.fillCircle(32, 16, 2);
      g.generateTexture(texKey, 48, 44);
      g.destroy();
    }

    this.boss = this.enemies.create(bc.x, bc.y, texKey) as Phaser.Physics.Arcade.Sprite;
    this.boss.setData('isBoss', true);
    this.boss.setData('type', bc.type);
    this.boss.setData('hp', bc.hp);
    this.boss.setData('maxHp', bc.hp);
    this.boss.setData('phases', bc.phases);
    this.boss.setData('currentPhase', 0);
    this.boss.setData('score', 500);
    this.boss.setData('speed', 60);
    this.boss.setData('patrolRange', 150);
    this.boss.setData('originX', bc.x);
    this.boss.setData('patrolDir', 1);
    this.boss.setData('lastSlop', 0);
    this.boss.setData('slopInterval', 1500);
    this.boss.setData('tier', 'orange');
    this.bossMaxHealth = bc.hp;
    this.bossHealth = bc.hp;
  }

  private collectPaper(_player: any, paper: any): void {
    const p = paper as Phaser.Physics.Arcade.Sprite;
    p.destroy();
    this.papersCollected++;
    this.score += PAPER_SCORE;
    this.playerHealth = Math.min(PLAYER_MAX_HEALTH, this.playerHealth + PAPER_HEAL);
    this.emitHUDUpdate();
    audioEngine.playSFX('collect');

    // Collect particle effect
    this.spawnParticles(p.x, p.y, 0xffffff, 5);
  }

  private collectPowerUp(_player: any, item: any): void {
    const pu = item as Phaser.Physics.Arcade.Sprite;
    const type = pu.getData('puType') as string;
    pu.destroy();

    this.applyPowerUp(type);
  }

  private applyPowerUp(type: string): void {
    // Clear existing effect of same type
    if (this.activeEffects.has(type)) {
      this.activeEffects.get(type)!.remove();
      this.activeEffects.delete(type);
    }

    const isPowerDown = ['clippy', 'fogCloud', 'sludge', 'dataLeak'].includes(type);
    audioEngine.playSFX(isPowerDown ? 'powerdown' : 'powerup');

    switch (type) {
      case 'shield':
        this.invincible = true;
        this.activeEffects.set(type, this.time.delayedCall(8000, () => {
          this.invincible = false;
          this.activeEffects.delete(type);
        }));
        break;
      case 'brainBoost':
        this.player.setScale(0.24);
        this.activeEffects.set(type, this.time.delayedCall(10000, () => {
          this.player.setScale(0.08);
          this.activeEffects.delete(type);
        }));
        break;
      case 'speedBolt':
        this.speedMultiplier = 2;
        this.activeEffects.set(type, this.time.delayedCall(12000, () => {
          this.speedMultiplier = 1;
          this.activeEffects.delete(type);
        }));
        break;
      case 'timeFreeze':
        this.enemies.setVelocity(0, 0);
        this.enemies.getChildren().forEach(e => (e as Phaser.Physics.Arcade.Sprite).setData('frozen', true));
        this.activeEffects.set(type, this.time.delayedCall(5000, () => {
          this.enemies.getChildren().forEach(e => (e as Phaser.Physics.Arcade.Sprite).setData('frozen', false));
          this.activeEffects.delete(type);
        }));
        break;
      case 'clippy':
        this.controlsReversed = true;
        this.activeEffects.set(type, this.time.delayedCall(5000, () => {
          this.controlsReversed = false;
          this.activeEffects.delete(type);
        }));
        break;
      case 'fogCloud':
        this.fogOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
        this.fogOverlay.setScrollFactor(0).setDepth(100);
        this.activeEffects.set(type, this.time.delayedCall(5000, () => {
          this.fogOverlay?.destroy();
          this.fogOverlay = null;
          this.activeEffects.delete(type);
        }));
        break;
      case 'sludge':
        this.speedMultiplier = 0.5;
        this.activeEffects.set(type, this.time.delayedCall(5000, () => {
          this.speedMultiplier = 1;
          this.activeEffects.delete(type);
        }));
        break;
      case 'dataLeak':
        this.papersCollected = Math.max(0, this.papersCollected - 3);
        this.emitHUDUpdate();
        break;
    }
    this.emitHUDUpdate();
  }

  private hitEnemy(_player: any, enemy: any): void {
    if (this.invincible) return;
    const e = enemy as Phaser.Physics.Arcade.Sprite;
    audioEngine.playSFX('hit');
    this.takeDamage(CONTACT_DAMAGE);
    // Knockback
    const dir = this.player.x < e.x ? -1 : 1;
    this.player.setVelocity(dir * 200, -150);
  }

  private hitBySlop(_player: any, slop: any): void {
    if (this.invincible) return;
    (slop as Phaser.Physics.Arcade.Sprite).destroy();
    this.takeDamage(SLOP_DAMAGE);
  }

  private inkHitEnemy(ink: any, enemy: any): void {
    const i = ink as Phaser.Physics.Arcade.Sprite;
    const e = enemy as Phaser.Physics.Arcade.Sprite;
    i.destroy();

    const hp = (e.getData('hp') as number) - 1;
    e.setData('hp', hp);

    // Flash white
    e.setTintFill(0xffffff);
    this.time.delayedCall(100, () => { if (e.active) e.clearTint(); });

    if (hp <= 0) {
      const score = e.getData('score') as number;
      this.score += score;

      // Check if boss
      if (e.getData('isBoss')) {
        this.bossDefeated = true;
        this.fsm.setState('victory');
      }

      this.spawnParticles(e.x, e.y, this.config.themeColor, 8);
      e.destroy();
      this.emitHUDUpdate();
    }
  }

  private touchNPC(_player: any, npc: any): void {
    const n = npc as Phaser.Physics.Arcade.Sprite;
    if (n.getData('talked')) return;
    n.setData('talked', true);

    const dialogueKey = n.getData('dialogueKey') as string;
    this.scene.launch(SCENES.DIALOGUE, { dialogueKey, levelScene: this });
    this.scene.pause();
  }

  private hitCheckpoint(_player: any, cp: any): void {
    const checkpoint = cp as Phaser.Physics.Arcade.Sprite;
    if (checkpoint.getData('activated')) return;
    checkpoint.getData('activated');
    checkpoint.setData('activated', true);
    checkpoint.setTint(0x2ec4b6);
    this.lastCheckpoint = { x: checkpoint.x, y: checkpoint.y };
    audioEngine.playSFX('checkpoint');
  }

  private takeDamage(amount: number): void {
    if (this.invincible) return;
    this.playerHealth -= amount;
    this.emitHUDUpdate();

    // Brief invincibility
    this.invincible = true;
    this.player.setAlpha(0.5);
    this.time.delayedCall(1000, () => {
      this.invincible = false;
      if (this.player?.active) this.player.setAlpha(1);
    });

    if (this.playerHealth <= 0) {
      this.playerLives--;
      if (this.playerLives <= 0) {
        this.fsm.setState('dead');
      } else {
        // Respawn
        this.playerHealth = PLAYER_MAX_HEALTH;
        const respawn = this.lastCheckpoint || this.config.playerStart;
        this.player.setPosition(respawn.x, respawn.y);
        this.player.setVelocity(0, 0);
        this.emitHUDUpdate();
      }
    }
  }

  private onDeath(): void {
    audioEngine.stopTrack();
    audioEngine.playSFX('death');
    this.gsm.updateHighScore(this.score);
    this.gsm.addPapers(this.papersCollected);

    this.time.delayedCall(1500, () => {
      this.scene.stop(SCENES.HUD);
      this.scene.start(SCENES.GAMEOVER, {
        score: this.score,
        papers: this.papersCollected,
        level: this.levelNum,
        won: false,
      });
    });
  }

  private startBossFight(): void {
    audioEngine.stopTrack();
    audioEngine.playSFX('boss');
    audioEngine.playTrack(bossTrack);
    // Lock camera to boss arena
    this.cameras.main.stopFollow();
    this.cameras.main.pan(this.boss!.x, GAME_HEIGHT / 2, 1000, 'Power2');

    this.time.delayedCall(1500, () => {
      this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
      this.fsm.setState('bossFight');
    });
  }

  private updateBossFight(_dt: number): void {
    this.updatePlaying(_dt);

    if (this.boss?.active) {
      this.bossHealth = this.boss.getData('hp') as number;
      // Boss shoots slop more frequently
      const now = this.time.now;
      const lastSlop = this.boss.getData('lastSlop') as number;
      if (now - lastSlop > 1200) {
        this.throwSlop(this.boss);
        this.boss.setData('lastSlop', now);
      }
    }
  }

  private onVictory(): void {
    audioEngine.stopTrack();
    audioEngine.playSFX('victory');
    this.gsm.updateHighScore(this.score);
    this.gsm.addPapers(this.papersCollected);

    if (this.levelNum < 6) {
      this.gsm.unlockLevel(this.levelNum + 1);
    }

    this.time.delayedCall(2000, () => {
      this.scene.stop(SCENES.HUD);
      this.scene.start(SCENES.GAMEOVER, {
        score: this.score,
        papers: this.papersCollected,
        level: this.levelNum,
        won: true,
      });
    });
  }

  private emitHUDUpdate(): void {
    this.events.emit('hudUpdate', {
      health: this.playerHealth,
      lives: this.playerLives,
      score: this.score,
      papers: this.papersCollected,
    });

    // Also emit to HUD scene directly
    const hudScene = this.scene.get(SCENES.HUD);
    if (hudScene) {
      hudScene.events.emit('hudUpdate', {
        health: this.playerHealth,
        lives: this.playerLives,
        score: this.score,
        papers: this.papersCollected,
      });
    }
  }

  private spawnParticles(x: number, y: number, color: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const p = this.add.rectangle(x, y, 4, 4, color);
      this.tweens.add({
        targets: p,
        x: x + Phaser.Math.Between(-40, 40),
        y: y + Phaser.Math.Between(-40, 40),
        alpha: 0,
        duration: 500,
        onComplete: () => p.destroy(),
      });
    }
  }

  private drawBackground(): void {
    const w = this.config.width;
    // Distant buildings / theme-specific bg elements
    const g = this.add.graphics();
    g.setScrollFactor(0.2);

    // Generic city/level silhouette
    g.fillStyle(Phaser.Display.Color.IntegerToColor(this.config.themeColor).darken(60).color, 0.3);
    for (let x = 0; x < w; x += 80) {
      const h = Phaser.Math.Between(80, 200);
      g.fillRect(x, GAME_HEIGHT - h, 60, h);
    }

    // Mid-ground details
    const g2 = this.add.graphics();
    g2.setScrollFactor(0.5);
    g2.fillStyle(Phaser.Display.Color.IntegerToColor(this.config.themeColor).darken(40).color, 0.2);
    for (let x = 0; x < w; x += 120) {
      const h = Phaser.Math.Between(40, 120);
      g2.fillRect(x + 20, GAME_HEIGHT - h, 40, h);
    }
  }
}
