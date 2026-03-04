import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED, PLAYER_JUMP,
  PLAYER_MAX_HEALTH, PLAYER_LIVES, PLAYER_INK_RANGE_BASE, PLAYER_INK_SPEED,
  PLAYER_INK_COOLDOWN, PLAYER_INK_RANGE_PER_5, PLAYER_INK_RANGE_CAP,
  PAPER_HEAL, PAPER_SCORE, SLOP_DAMAGE, CONTACT_DAMAGE,
  TILE_SIZE, ENEMY_TIERS, PLAYER_SCALE, PLAYER_BODY_WIDTH, PLAYER_BODY_HEIGHT,
  NPC_SCALE, LEVEL_PLATFORM_KEYS, DEATH_TEXTS, LEVEL_THEMES,
  MINTY_COLORS } from '../constants';
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

  // Shield visual
  private shieldGlow: Phaser.GameObjects.Arc | null = null;
  private colorCycleTimer: Phaser.Time.TimerEvent | null = null;

  // Idle sleep
  private lastMoveTime: number = 0;
  private idleSleeping: boolean = false;
  private idleZzz: Phaser.GameObjects.Text | null = null;

  // Level name flash
  private levelNameText: Phaser.GameObjects.Text | null = null;

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
    this.playerLives = PLAYER_LIVES;
    this.activeEffects.clear();
    this.lastCheckpoint = null;
    this.shieldGlow = null;
    this.colorCycleTimer = null;
    this.fogOverlay = null;
    this.idleZzz = null;
    this.levelNameText = null;
    this.boss = null;

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
    this.player.setScale(PLAYER_SCALE);
    this.player.setCollideWorldBounds(true);
    // Size physics body to match visual at scale
    this.player.body!.setSize(
      PLAYER_BODY_WIDTH / PLAYER_SCALE,
      PLAYER_BODY_HEIGHT / PLAYER_SCALE
    );
    this.player.body!.setOffset(
      (this.player.width - PLAYER_BODY_WIDTH / PLAYER_SCALE) / 2,
      this.player.height - PLAYER_BODY_HEIGHT / PLAYER_SCALE
    );

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

    // Initialize idle timer
    this.lastMoveTime = this.time.now;
    this.idleSleeping = false;

    // Fade-in transition
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Level name flash
    const themeName = LEVEL_THEMES[this.levelNum]?.name || '';
    this.levelNameText = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20,
      `LEVEL ${this.levelNum} — ${themeName.toUpperCase()}`,
      {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '22px',
        color: `#${this.config.themeColor.toString(16).padStart(6, '0')}`,
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    this.tweens.add({
      targets: this.levelNameText,
      alpha: 0,
      duration: 800,
      delay: 2000,
      onComplete: () => { this.levelNameText?.destroy(); this.levelNameText = null; },
    });
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

    // Shield glow follows player
    if (this.shieldGlow) {
      this.shieldGlow.setPosition(this.player.x, this.player.y);
    }

    // Idle sleep check
    if (moveDir !== 0 || (this.cursors.up.isDown || this.wasd.W.isDown)) {
      this.lastMoveTime = this.time.now;
      if (this.idleSleeping) {
        this.idleSleeping = false;
        this.player.clearTint();
        this.idleZzz?.destroy();
        this.idleZzz = null;
      }
    } else if (this.time.now - this.lastMoveTime > 30000 && !this.idleSleeping) {
      this.idleSleeping = true;
      this.player.setTint(0x6688aa);
      this.idleZzz = this.add.text(this.player.x + 15, this.player.y - 25, 'zzz', {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '10px',
        color: '#8899bb',
      });
      this.tweens.add({
        targets: this.idleZzz,
        y: this.player.y - 45,
        alpha: 0,
        duration: 2000,
        yoyo: true,
        repeat: -1,
      });
    }
    // Update zzz position
    if (this.idleZzz && this.idleSleeping) {
      this.idleZzz.setX(this.player.x + 15);
    }

    // Update enemies
    this.updateEnemies();

    // L5 Easter Egg: screen wobble near platform edges over void
    if (this.levelNum === 5 && body.blocked.down) {
      // Check if player is near platform edge
      let nearEdge = false;
      this.platforms.getChildren().forEach((obj) => {
        const plat = obj as Phaser.Physics.Arcade.Sprite;
        const dx = Math.abs(this.player.x - plat.x);
        if (dx > 28 && dx < 36 && Math.abs(this.player.y - plat.y) < 30) {
          nearEdge = true;
        }
      });
      if (nearEdge) {
        this.cameras.main.shake(50, 0.002);
      }
    }

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
    const platKey = LEVEL_PLATFORM_KEYS[this.levelNum] || 'platform';

    // Floor
    for (let x = 0; x < this.config.width; x += 64) {
      const plat = this.platforms.create(x + 32, GAME_HEIGHT - 8, platKey) as Phaser.Physics.Arcade.Sprite;
      plat.setScale(1, 1).refreshBody();
    }

    // Level platforms
    this.config.platforms.forEach(p => {
      const numTiles = Math.ceil(p.width / 64);
      for (let i = 0; i < numTiles; i++) {
        const px = p.x + i * 64;
        const plat = this.platforms.create(px, p.y, platKey) as Phaser.Physics.Arcade.Sprite;
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
      if (enemy.getData('frozen')) return;

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

    // L1 Easter Egg: hidden blue check paper worth 5× at a hard-to-reach spot
    if (this.levelNum === 1) {
      // Place near top of level, far right — requires skillful platforming
      const bcx = this.config.width - 200;
      const bcy = 60;
      const blueCheck = this.papers.create(bcx, bcy, 'paper-gold') as Phaser.Physics.Arcade.Sprite;
      blueCheck.body!.allowGravity = false;
      blueCheck.setData('isBlueCheck', true);
      blueCheck.setTint(0x1DA1F2);
      this.tweens.add({
        targets: blueCheck,
        y: bcy - 8,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
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
      npc.setScale(NPC_SCALE);
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

      if (this.levelNum === 1) {
        // Level 1: Algorithm Vortex with X logo
        // Swirling vortex body
        g.fillStyle(0x1DA1F2, 0.3);
        g.fillCircle(24, 22, 22);
        g.fillStyle(this.config.themeColor, 0.5);
        g.fillCircle(24, 22, 16);
        // X logo in center
        g.fillStyle(0xffffff, 0.4);
        for (let i = 0; i < 12; i++) {
          g.fillRect(12 + i * 2, 14 + i * 1.5, 4, 3);
          g.fillRect(34 - i * 2, 14 + i * 1.5, 4, 3);
        }
        // Red eyes
        g.fillStyle(0xff0000);
        g.fillCircle(16, 18, 4);
        g.fillCircle(32, 18, 4);
        g.fillStyle(0x000000);
        g.fillCircle(16, 18, 2);
        g.fillCircle(32, 18, 2);
        // Verification badge ring (small circles around perimeter)
        g.fillStyle(0x1DA1F2, 0.4);
        for (let a = 0; a < 8; a++) {
          const angle = (a / 8) * Math.PI * 2;
          g.fillCircle(24 + Math.cos(angle) * 20, 22 + Math.sin(angle) * 20, 3);
        }
      } else {
        // Generic boss shape for other levels
        g.fillStyle(this.config.themeColor);
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
      }
      g.generateTexture(texKey, 48, 44);
      g.destroy();
    }

    this.boss = this.enemies.create(bc.x, bc.y, texKey) as Phaser.Physics.Arcade.Sprite;

    // Orbital particles for L1 boss
    if (this.levelNum === 1) {
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const orb = this.add.circle(
          bc.x + Math.cos(angle) * 35,
          bc.y + Math.sin(angle) * 35,
          4, 0x1DA1F2, 0.5
        );
        this.tweens.add({
          targets: orb,
          angle: 360,
          duration: 3000,
          repeat: -1,
        });
        // Orbit around boss — update position each frame
        const orbData = { angle: angle, speed: 0.002 };
        this.time.addEvent({
          delay: 16,
          loop: true,
          callback: () => {
            if (!this.boss?.active) { orb.destroy(); return; }
            orbData.angle += orbData.speed * 16;
            orb.setPosition(
              this.boss.x + Math.cos(orbData.angle) * 35,
              this.boss.y + Math.sin(orbData.angle) * 35
            );
          },
        });
      }
    }
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
    const isBlueCheck = p.getData('isBlueCheck');
    p.destroy();

    // Blue check paper worth 5×
    const multiplier = isBlueCheck ? 5 : 1;
    this.papersCollected += multiplier;
    this.score += PAPER_SCORE * multiplier;
    this.playerHealth = Math.min(PLAYER_MAX_HEALTH, this.playerHealth + PAPER_HEAL);
    this.emitHUDUpdate();
    audioEngine.playSFX('collect');

    // Collect particle effect
    this.spawnParticles(p.x, p.y, isBlueCheck ? 0x1DA1F2 : 0xffffff, isBlueCheck ? 10 : 5);

    // 42 papers easter egg
    if (this.papersCollected === 42) {
      const answerText = this.add.text(
        this.player.x, this.player.y - 40,
        'The Answer to Life, the Universe, and Everything',
        {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '9px',
          color: '#ffd700',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 2,
        }
      ).setOrigin(0.5).setDepth(50);
      this.tweens.add({
        targets: answerText,
        y: this.player.y - 80,
        alpha: 0,
        duration: 3000,
        ease: 'Power2',
        onComplete: () => answerText.destroy(),
      });
    }
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
        // Teal glow ring
        this.shieldGlow?.destroy();
        this.shieldGlow = this.add.circle(this.player.x, this.player.y, 28, 0x2ec4b6, 0.25);
        this.shieldGlow.setStrokeStyle(2, 0x2ec4b6, 0.6);
        this.shieldGlow.setDepth(this.player.depth - 1);
        // Color cycling during shield
        let colorIdx = 0;
        this.colorCycleTimer?.remove();
        this.colorCycleTimer = this.time.addEvent({
          delay: 150,
          loop: true,
          callback: () => {
            const col = MINTY_COLORS[colorIdx % MINTY_COLORS.length];
            if (this.textures.exists(`minty-${col}`)) {
              this.player.setTexture(`minty-${col}`);
            }
            colorIdx++;
          },
        });
        this.activeEffects.set(type, this.time.delayedCall(8000, () => {
          this.invincible = false;
          this.shieldGlow?.destroy();
          this.shieldGlow = null;
          this.colorCycleTimer?.remove();
          this.colorCycleTimer = null;
          this.player.setTexture('minty-teal');
          this.activeEffects.delete(type);
        }));
        break;
      case 'brainBoost':
        this.player.setScale(PLAYER_SCALE * 2);
        this.activeEffects.set(type, this.time.delayedCall(10000, () => {
          this.player.setScale(PLAYER_SCALE);
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

      const isBoss = e.getData('isBoss');

      // Floating death text
      const texts = DEATH_TEXTS[this.levelNum] || ['DEFEATED'];
      const deathText = texts[Phaser.Math.Between(0, texts.length - 1)];
      const floatText = this.add.text(e.x, e.y - 10, deathText, {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: isBoss ? '14px' : '10px',
        color: `#${this.config.themeColor.toString(16).padStart(6, '0')}`,
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5).setDepth(50);
      this.tweens.add({
        targets: floatText,
        y: e.y - 50,
        alpha: 0,
        duration: 1200,
        ease: 'Power2',
        onComplete: () => floatText.destroy(),
      });

      // Check if boss
      if (isBoss) {
        // Boss death: 16-particle burst + screen shake
        this.spawnParticles(e.x, e.y, this.config.themeColor, 16);
        this.cameras.main.shake(300, 0.015);
        this.bossDefeated = true;
        this.fsm.setState('victory');
      } else {
        // Normal death: themed particles
        this.spawnParticles(e.x, e.y, this.config.themeColor, 8);
      }

      e.destroy();
      this.emitHUDUpdate();
    } else if (e.getData('isBoss')) {
      // Screen shake on boss damage (subtle)
      this.cameras.main.shake(150, 0.01);
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
        // Subtle screen shake on boss attack
        this.cameras.main.shake(80, 0.005);
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

    // LinkedIn victory easter egg
    if (this.levelNum === 2) {
      const linkedinNotif = this.add.text(
        GAME_WIDTH / 2, 60,
        '🎉 Congrats on the new position!',
        {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '12px',
          color: '#0A66C2',
          backgroundColor: '#ffffff',
          padding: { left: 12, right: 12, top: 6, bottom: 6 },
        }
      ).setOrigin(0.5).setScrollFactor(0).setDepth(200);
      this.tweens.add({
        targets: linkedinNotif,
        y: 40,
        alpha: 0,
        delay: 2500,
        duration: 1000,
        onComplete: () => linkedinNotif.destroy(),
      });
    }

    // Fade-out transition
    this.cameras.main.fadeOut(800, 0, 0, 0);

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
    switch (this.levelNum) {
      case 1: this.drawBgTwitter(); break;
      case 2: this.drawBgLinkedIn(); break;
      case 3: this.drawBgBluesky(); break;
      case 4: this.drawBgArxiv(); break;
      case 5: this.drawBgPhilpapers(); break;
      case 6: this.drawBgSSRN(); break;
    }
  }

  // ── Level 1: Twitter/X ──
  private drawBgTwitter(): void {
    const w = this.config.width;

    // Layer 0 (0.1): Dark cityscape + giant faded X logo silhouette
    const g0 = this.add.graphics().setScrollFactor(0.1);
    g0.fillStyle(0x0a1520, 0.4);
    for (let x = 0; x < w; x += 70) {
      const h = Phaser.Math.Between(100, 250);
      g0.fillRect(x, GAME_HEIGHT - h, 50, h);
    }
    // Giant X logo in sky
    g0.fillStyle(0x1DA1F2, 0.06);
    g0.fillRect(w * 0.35, 30, 8, 120);
    g0.fillRect(w * 0.35 - 40, 30, 88, 8);
    g0.fillRect(w * 0.35 - 40, 142, 88, 8);
    // Diagonal strokes of X
    for (let i = 0; i < 60; i++) {
      g0.fillRect(w * 0.35 - 40 + i * 1.4, 30 + i * 2, 6, 4);
      g0.fillRect(w * 0.35 + 44 - i * 1.4, 30 + i * 2, 6, 4);
    }

    // Layer 1 (0.2): Tweet card silhouettes
    const g1 = this.add.graphics().setScrollFactor(0.2);
    for (let x = 80; x < w; x += 300) {
      const cy = Phaser.Math.Between(60, 300);
      g1.fillStyle(0x15202b, 0.25);
      // Card body
      g1.fillRoundedRect(x, cy, 160, 90, 8);
      // Avatar circle
      g1.fillStyle(0x1DA1F2, 0.12);
      g1.fillCircle(x + 20, cy + 20, 10);
      // Text line placeholders
      g1.fillStyle(0x1a2d3d, 0.2);
      g1.fillRect(x + 38, cy + 14, 80, 3);
      g1.fillRect(x + 38, cy + 22, 50, 3);
      g1.fillRect(x + 12, cy + 40, 136, 3);
      g1.fillRect(x + 12, cy + 48, 100, 3);
      g1.fillRect(x + 12, cy + 56, 120, 3);
      // Engagement icons row
      g1.fillStyle(0x1DA1F2, 0.08);
      g1.fillRect(x + 15, cy + 72, 8, 6);
      g1.fillRect(x + 50, cy + 72, 8, 6);
      g1.fillRect(x + 85, cy + 72, 8, 6);
      g1.fillRect(x + 120, cy + 72, 8, 6);
    }

    // Layer 2 (0.3): Floating blue verification checkmarks
    const g2 = this.add.graphics().setScrollFactor(0.3);
    for (let x = 50; x < w; x += 200) {
      const cy = Phaser.Math.Between(40, 350);
      g2.fillStyle(0x1DA1F2, 0.15);
      g2.fillCircle(x, cy, 8);
      g2.fillStyle(0xffffff, 0.15);
      // Simple checkmark
      g2.fillRect(x - 3, cy, 3, 6);
      g2.fillRect(x - 1, cy + 3, 6, 3);
    }

    // Layer 3 (0.5): Floating hashtag symbols
    for (let x = 30; x < w; x += 250) {
      const cy = Phaser.Math.Between(80, 380);
      const ht = this.add.text(x, cy, '#', {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '24px',
        color: '#1DA1F2',
      }).setAlpha(0.08).setScrollFactor(0.5);
    }

    // Animated verification badges
    for (let i = 0; i < 7; i++) {
      const bx = Phaser.Math.Between(100, w - 100);
      const by = Phaser.Math.Between(40, 350);
      const badge = this.add.circle(bx, by, 6, 0x1DA1F2, 0.12);
      badge.setScrollFactor(0.3);
      this.tweens.add({
        targets: badge,
        y: by - 30,
        alpha: 0,
        duration: Phaser.Math.Between(3000, 5000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }

  // ── Level 2: LinkedIn ──
  private drawBgLinkedIn(): void {
    const w = this.config.width;

    // Office window grid
    const g0 = this.add.graphics().setScrollFactor(0.1);
    for (let bx = 0; bx < w; bx += 100) {
      const bh = Phaser.Math.Between(150, 300);
      g0.fillStyle(0x0a1628, 0.5);
      g0.fillRect(bx, GAME_HEIGHT - bh, 80, bh);
      // Windows
      g0.fillStyle(0x1a3050, 0.3);
      for (let wy = GAME_HEIGHT - bh + 15; wy < GAME_HEIGHT - 20; wy += 25) {
        for (let wx = bx + 10; wx < bx + 70; wx += 20) {
          g0.fillRect(wx, wy, 12, 15);
        }
      }
    }

    // LinkedIn post card silhouettes
    const g1 = this.add.graphics().setScrollFactor(0.2);
    for (let x = 60; x < w; x += 350) {
      const cy = Phaser.Math.Between(80, 280);
      g1.fillStyle(0x0a1628, 0.2);
      g1.fillRoundedRect(x, cy, 180, 100, 4);
      g1.fillStyle(0x0A66C2, 0.15);
      g1.fillRect(x, cy, 3, 100);
      // Profile placeholder
      g1.fillCircle(x + 22, cy + 22, 12);
      // Text lines
      g1.fillStyle(0x1a3050, 0.15);
      g1.fillRect(x + 42, cy + 14, 90, 3);
      g1.fillRect(x + 42, cy + 22, 60, 2);
      g1.fillRect(x + 12, cy + 45, 156, 3);
      g1.fillRect(x + 12, cy + 53, 130, 3);
      // Like bar
      g1.fillStyle(0x0A66C2, 0.08);
      g1.fillRect(x + 12, cy + 82, 156, 1);
    }

    // Floating "in" logos
    for (let i = 0; i < 5; i++) {
      const ix = Phaser.Math.Between(50, w - 50);
      const iy = Phaser.Math.Between(50, 350);
      const logo = this.add.text(ix, iy, 'in', {
        fontFamily: 'serif',
        fontSize: '18px',
        color: '#0A66C2',
        fontStyle: 'bold',
      }).setAlpha(0.08).setScrollFactor(0.4);
    }
  }

  // ── Level 3: Bluesky ──
  private drawBgBluesky(): void {
    const w = this.config.width;

    // Cloud shapes (overlapping circles)
    const g0 = this.add.graphics().setScrollFactor(0.15);
    for (let x = 0; x < w; x += 180) {
      const cy = Phaser.Math.Between(40, 200);
      g0.fillStyle(0x1a3050, 0.15);
      g0.fillCircle(x, cy, 30);
      g0.fillCircle(x + 25, cy - 10, 25);
      g0.fillCircle(x + 50, cy, 28);
      g0.fillCircle(x + 20, cy + 5, 22);
      g0.fillCircle(x + 40, cy + 8, 20);
    }

    // Butterfly silhouettes
    const g1 = this.add.graphics().setScrollFactor(0.3);
    for (let i = 0; i < 6; i++) {
      const bx = Phaser.Math.Between(80, w - 80);
      const by = Phaser.Math.Between(50, 350);
      g1.fillStyle(0x0085FF, 0.1);
      // Left wing
      g1.fillEllipse(bx - 6, by - 3, 10, 8);
      // Right wing
      g1.fillEllipse(bx + 6, by - 3, 10, 8);
      // Body
      g1.fillRect(bx - 1, by - 5, 2, 10);
    }

    // Blue gradient sky effect — horizontal bands
    const g2 = this.add.graphics().setScrollFactor(0.05);
    for (let y = 0; y < GAME_HEIGHT; y += 50) {
      const alpha = 0.03 + (1 - y / GAME_HEIGHT) * 0.05;
      g2.fillStyle(0x0085FF, alpha);
      g2.fillRect(0, y, w, 50);
    }

    // Floating @ symbols
    for (let i = 0; i < 5; i++) {
      const ax = Phaser.Math.Between(50, w - 50);
      const ay = Phaser.Math.Between(60, 380);
      this.add.text(ax, ay, '@', {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '16px',
        color: '#0085FF',
      }).setAlpha(0.06).setScrollFactor(0.4);
    }
  }

  // ── Level 4: ArXiv ──
  private drawBgArxiv(): void {
    const w = this.config.width;

    // Library shelf lines
    const g0 = this.add.graphics().setScrollFactor(0.1);
    for (let y = 60; y < GAME_HEIGHT; y += 80) {
      g0.fillStyle(0x3a1010, 0.3);
      g0.fillRect(0, y, w, 4);
      // Book spines on shelves
      for (let x = 0; x < w; x += Phaser.Math.Between(12, 25)) {
        const bh = Phaser.Math.Between(30, 65);
        const colors = [0x4a1515, 0x6b2020, 0x2a0a0a, 0x8b3030, 0x3a1515];
        g0.fillStyle(colors[Phaser.Math.Between(0, colors.length - 1)], 0.2);
        g0.fillRect(x, y - bh, Phaser.Math.Between(8, 15), bh);
      }
    }

    // Faint LaTeX fragments
    const fragments = ['∇', '∫', 'Σ', 'P(A|B)', '∂', 'λ', '∞', 'π'];
    for (let i = 0; i < 8; i++) {
      const fx = Phaser.Math.Between(50, w - 50);
      const fy = Phaser.Math.Between(30, 400);
      this.add.text(fx, fy, fragments[i % fragments.length], {
        fontFamily: 'serif',
        fontSize: `${Phaser.Math.Between(14, 28)}px`,
        color: '#B31B1B',
      }).setAlpha(0.06).setScrollFactor(0.3);
    }

    // Floating paper sheets
    for (let i = 0; i < 5; i++) {
      const px = Phaser.Math.Between(80, w - 80);
      const py = Phaser.Math.Between(40, 350);
      const paper = this.add.rectangle(px, py, 16, 20, 0xffffff, 0.04);
      paper.setScrollFactor(0.4);
      this.tweens.add({
        targets: paper,
        y: py - 20,
        angle: Phaser.Math.Between(-10, 10),
        duration: Phaser.Math.Between(4000, 7000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  // ── Level 5: PhilPapers ──
  private drawBgPhilpapers(): void {
    const w = this.config.width;

    // Sparse void — very subtle gradient
    const g0 = this.add.graphics().setScrollFactor(0.05);
    for (let y = 0; y < GAME_HEIGHT; y += 100) {
      g0.fillStyle(0x0a0a14, 0.03 + y / GAME_HEIGHT * 0.04);
      g0.fillRect(0, y, w, 100);
    }

    // Floating thought bubbles
    const g1 = this.add.graphics().setScrollFactor(0.2);
    for (let i = 0; i < 5; i++) {
      const bx = Phaser.Math.Between(80, w - 80);
      const by = Phaser.Math.Between(40, 350);
      g1.fillStyle(0x2C3E50, 0.08);
      g1.fillCircle(bx, by, 18);
      g1.fillCircle(bx - 14, by + 18, 5);
      g1.fillCircle(bx - 20, by + 26, 3);
    }

    // Trolley problem track diagrams
    const g2 = this.add.graphics().setScrollFactor(0.3);
    for (let tx = 100; tx < w; tx += 500) {
      const ty = Phaser.Math.Between(300, 420);
      g2.lineStyle(1, 0x2C3E50, 0.1);
      // Main track
      g2.lineBetween(tx, ty, tx + 100, ty);
      // Fork
      g2.lineBetween(tx + 60, ty, tx + 100, ty - 20);
      // Stick figures
      g2.fillStyle(0x2C3E50, 0.08);
      g2.fillCircle(tx + 90, ty - 6, 3);
      g2.fillCircle(tx + 90, ty - 26, 3);
      g2.fillCircle(tx + 95, ty - 26, 3);
    }

    // Logic symbols
    const symbols = ['∀', '∃', '¬', '→', '⊢', '⊥', '◻', '◇'];
    for (let i = 0; i < 8; i++) {
      const sx = Phaser.Math.Between(30, w - 30);
      const sy = Phaser.Math.Between(20, 420);
      this.add.text(sx, sy, symbols[i], {
        fontFamily: 'serif',
        fontSize: `${Phaser.Math.Between(16, 30)}px`,
        color: '#2C3E50',
      }).setAlpha(0.06).setScrollFactor(0.35);
    }
  }

  // ── Level 6: SSRN ──
  private drawBgSSRN(): void {
    const w = this.config.width;

    // Brick fortress walls
    const g0 = this.add.graphics().setScrollFactor(0.1);
    for (let bx = 0; bx < w; bx += 200) {
      const bh = Phaser.Math.Between(200, 380);
      g0.fillStyle(0x1E4D2B, 0.2);
      g0.fillRect(bx, GAME_HEIGHT - bh, 160, bh);
      // Brick pattern
      g0.lineStyle(1, 0x153d20, 0.15);
      for (let y = GAME_HEIGHT - bh; y < GAME_HEIGHT; y += 12) {
        g0.lineBetween(bx, y, bx + 160, y);
        const offset = (Math.floor((y - (GAME_HEIGHT - bh)) / 12) % 2) * 20;
        for (let x = bx + offset; x < bx + 160; x += 40) {
          g0.lineBetween(x, y, x, y + 12);
        }
      }
      // Barbed wire atop
      g0.lineStyle(1, 0x888888, 0.15);
      const topY = GAME_HEIGHT - bh;
      g0.lineBetween(bx, topY, bx + 160, topY);
      for (let x = bx; x < bx + 160; x += 12) {
        g0.lineBetween(x, topY - 3, x + 6, topY + 3);
        g0.lineBetween(x + 6, topY - 3, x, topY + 3);
      }
    }

    // Cloudflare spinner silhouettes
    for (let i = 0; i < 4; i++) {
      const cx = Phaser.Math.Between(100, w - 100);
      const cy = Phaser.Math.Between(60, 300);
      const spinner = this.add.circle(cx, cy, 12, 0xf5a623, 0.06);
      spinner.setScrollFactor(0.3);
      this.tweens.add({
        targets: spinner,
        angle: 360,
        duration: 3000,
        repeat: -1,
      });
    }

    // CAPTCHA grid hints
    const g1 = this.add.graphics().setScrollFactor(0.25);
    for (let cx = 150; cx < w; cx += 400) {
      const cy = Phaser.Math.Between(80, 250);
      g1.lineStyle(1, 0x1E4D2B, 0.1);
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          g1.strokeRect(cx + c * 18, cy + r * 18, 18, 18);
        }
      }
    }

    // "I'm not a robot" text near walls — flashes when player approaches
    for (let bx = 100; bx < w; bx += 400) {
      const robotText = this.add.text(bx, GAME_HEIGHT - 220, "I'm not a robot", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '8px',
        color: '#1E4D2B',
      }).setAlpha(0);
      // Check proximity each frame
      this.time.addEvent({
        delay: 200,
        loop: true,
        callback: () => {
          if (!this.player?.active) return;
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, robotText.x, robotText.y);
          robotText.setAlpha(dist < 120 ? 0.3 : 0);
        },
      });
    }
  }
}
