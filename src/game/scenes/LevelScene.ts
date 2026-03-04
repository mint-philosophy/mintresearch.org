import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED, PLAYER_JUMP,
  PLAYER_MAX_HEALTH, PLAYER_LIVES, PAPER_PROJECTILE_SPEED,
  PAPER_FIRE_COOLDOWN, PAPER_RANGE_PER_5, PAPER_RANGE_CAP,
  PAPER_AMMO_PER_COLLECT, PAPER_RANGE_BASE,
  MAX_JUMPS, DOUBLE_JUMP_FORCE_MULT,
  CLAWD_FIRE_INTERVAL, CLAWD_DURATION, CLAWD_RANGE, CLAWD_PROJECTILE_SPEED,
  PAPER_HEAL, PAPER_SCORE, SLOP_DAMAGE, CONTACT_DAMAGE,
  TILE_SIZE, ENEMY_TIERS, PLAYER_SCALE, PLAYER_BODY_WIDTH, PLAYER_BODY_HEIGHT,
  NPC_SCALE, LEVEL_PLATFORM_KEYS, DEATH_TEXTS, LEVEL_THEMES,
  MINTY_COLORS, POWERUP_DURATION, POWERDOWN_DURATION } from '../constants';
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
  private lastFireTime: number = 0;
  private invincible: boolean = false;
  private lastCheckpoint: { x: number; y: number } | null = null;
  private paperAmmo: number = 0;
  private jumpsRemaining: number = MAX_JUMPS;

  // Groups
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private papers!: Phaser.Physics.Arcade.Group;
  private powerUps!: Phaser.Physics.Arcade.Group;
  private paperGroup!: Phaser.Physics.Arcade.Group;
  private slopGroup!: Phaser.Physics.Arcade.Group;
  private npcs!: Phaser.Physics.Arcade.StaticGroup;
  private checkpoints!: Phaser.Physics.Arcade.StaticGroup;
  private clawdProjectiles!: Phaser.Physics.Arcade.Group;

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

  // Clawd companion
  private clawd: Phaser.Physics.Arcade.Sprite | null = null;
  private clawdTimer: Phaser.Time.TimerEvent | null = null;
  private clawdFireTimer: Phaser.Time.TimerEvent | null = null;

  // Idle sleep
  private lastMoveTime: number = 0;
  private idleSleeping: boolean = false;
  private idleZzz: Phaser.GameObjects.Text | null = null;

  // Level name flash
  private levelNameText: Phaser.GameObjects.Text | null = null;

  // New power-up/down state
  private jumpReversed: boolean = false;
  private mintySwarm: Phaser.GameObjects.Sprite[] = [];
  private lipstickMinty: Phaser.Physics.Arcade.Sprite | null = null;
  private deepseekActive: boolean = false;
  private lobsterSwarm: Phaser.Physics.Arcade.Sprite[] = [];
  private hatOverlay: Phaser.GameObjects.Sprite | null = null;

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
    this.paperAmmo = 0;
    this.jumpsRemaining = MAX_JUMPS;
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
    this.clawd = null;
    this.clawdTimer = null;
    this.clawdFireTimer = null;
    this.jumpReversed = false;
    this.mintySwarm = [];
    this.lipstickMinty = null;
    this.deepseekActive = false;
    this.lobsterSwarm = [];
    this.hatOverlay = null;

    // Background
    this.cameras.main.setBackgroundColor(this.config.background);

    // Draw parallax background elements
    this.drawBackground();

    // Groups
    this.platforms = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.papers = this.physics.add.group();
    this.powerUps = this.physics.add.group();
    this.paperGroup = this.physics.add.group();
    this.slopGroup = this.physics.add.group();
    this.npcs = this.physics.add.staticGroup();
    this.checkpoints = this.physics.add.staticGroup();
    this.clawdProjectiles = this.physics.add.group();

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
    this.physics.add.overlap(this.paperGroup, this.enemies, this.paperHitEnemy, undefined, this);
    this.physics.add.overlap(this.clawdProjectiles, this.enemies, this.paperHitEnemy, undefined, this);
    this.physics.add.overlap(this.player, this.npcs, this.touchNPC, undefined, this);
    this.physics.add.overlap(this.player, this.checkpoints, this.hitCheckpoint, undefined, this);
    this.physics.add.collider(this.paperGroup, this.platforms, (paper) => {
      (paper as Phaser.Physics.Arcade.Sprite).destroy();
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
      ammo: this.paperAmmo,
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

    // Reset jumps when grounded
    if (body.blocked.down) {
      this.jumpsRemaining = MAX_JUMPS;
    }

    // Jump (with double jump)
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up)
      || Phaser.Input.Keyboard.JustDown(this.wasd.W)
      || Phaser.Input.Keyboard.JustDown(this.cursors.space);

    if (jumpPressed && this.jumpsRemaining > 0) {
      if (this.jumpReversed) {
        // Copilot: backward launch instead of jump
        const body2 = this.player.body as Phaser.Physics.Arcade.Body;
        body2.setVelocityY(-PLAYER_JUMP * 1.5);  // Downward (positive = down, but PLAYER_JUMP is negative, so negate)
        body2.setVelocityX(-this.facing * PLAYER_SPEED * 2);
        this.jumpsRemaining--;
        audioEngine.playSFX('jump');
      } else {
        const isDoubleJump = !body.blocked.down;
        const force = isDoubleJump ? PLAYER_JUMP * DOUBLE_JUMP_FORCE_MULT : PLAYER_JUMP;
        body.setVelocityY(force);
        this.jumpsRemaining--;
        audioEngine.playSFX('jump');

        // Particle puff on double jump
        if (isDoubleJump) {
          this.spawnParticles(this.player.x, this.player.y + 10, 0xaaaaaa, 4);
        }
      }
    }

    // Fire paper projectile
    if (Phaser.Input.Keyboard.JustDown(this.keyZ) || Phaser.Input.Keyboard.JustDown(this.keyX)) {
      this.firePaper();
    }

    // Shield glow follows player
    if (this.shieldGlow) {
      this.shieldGlow.setPosition(this.player.x, this.player.y);
    }

    // Hat overlay follows player
    if (this.hatOverlay) {
      this.hatOverlay.setPosition(this.player.x, this.player.y - 18);
    }

    // Clawd follows player
    if (this.clawd?.active) {
      // Lerp follow with slight orbital bobbing
      const targetX = this.player.x - this.facing * 20;
      const targetY = this.player.y - 15 + Math.sin(this.time.now * 0.003) * 6;
      this.clawd.setPosition(
        Phaser.Math.Linear(this.clawd.x, targetX, 0.08),
        Phaser.Math.Linear(this.clawd.y, targetY, 0.08)
      );
    }

    // Idle sleep check
    if (moveDir !== 0 || jumpPressed) {
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

  private firePaper(): void {
    const now = this.time.now;
    if (now - this.lastFireTime < PAPER_FIRE_COOLDOWN) return;
    if (this.paperAmmo <= 0) return;

    this.lastFireTime = now;
    this.paperAmmo--;

    const proj = this.paperGroup.create(
      this.player.x + this.facing * 16, this.player.y, 'paper-projectile'
    ) as Phaser.Physics.Arcade.Sprite;
    proj.body!.allowGravity = false;
    proj.setVelocityX(this.facing * PAPER_PROJECTILE_SPEED);
    audioEngine.playSFX('shoot');

    // DeepSeek: use red-book texture with 2x damage
    if (this.deepseekActive) {
      proj.setTexture('red-book');
      proj.setData('damage', 2);
    }

    // Spinning rotation
    this.tweens.add({
      targets: proj,
      angle: this.facing * 360,
      duration: 500,
      repeat: -1,
    });

    // Destroy after range
    const range = Math.min(
      PAPER_RANGE_BASE + Math.floor(this.papersCollected / 5) * PAPER_RANGE_PER_5,
      PAPER_RANGE_CAP
    );
    const lifetime = (range / PAPER_PROJECTILE_SPEED) * 1000;
    this.time.delayedCall(lifetime, () => { if (proj.active) proj.destroy(); });

    this.emitHUDUpdate();
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

      // Use pre-generated textures from PreloadScene
      let texKey: string;
      if (e.type === 'octopus') {
        texKey = `enemy-${e.type}-${tier}`;
      } else {
        texKey = `enemy-${e.type}`;
      }

      const enemy = this.enemies.create(e.x, e.y, texKey) as Phaser.Physics.Arcade.Sprite;

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

      // Mac II: chase player when within 300px
      const enemyType = enemy.getData('type') as string;
      if (enemyType === 'macII' && this.player?.active) {
        const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        if (distToPlayer < 300) {
          const chaseDir = this.player.x > enemy.x ? 1 : -1;
          enemy.setVelocityX(speed * 1.2 * chaseDir);
        } else {
          enemy.setVelocityX(speed * dir);
        }
      } else {
        enemy.setVelocityX(speed * dir);
      }

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

  private throwMacBomb(from: Phaser.Physics.Arcade.Sprite): void {
    const bomb = this.slopGroup.create(from.x, from.y - 8, 'mac-bomb') as Phaser.Physics.Arcade.Sprite;
    const angle = Phaser.Math.Angle.Between(from.x, from.y, this.player.x, this.player.y);
    const speed = 200;
    bomb.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed - 40);
    bomb.body!.allowGravity = true;
    this.time.delayedCall(3000, () => { if (bomb.active) bomb.destroy(); });
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
      shield: 'pu-shield', openai: 'pu-openai', speedBolt: 'pu-speed',
      ssi: 'pu-ssi', deepseek: 'pu-deepseek',
      clippy: 'pd-clippy', fogCloud: 'pd-fog', grok: 'pd-grok', dataLeak: 'pd-leak',
      copilot: 'pd-copilot', meta: 'pd-meta', qwen: 'pd-qwen', openclaw: 'pd-openclaw',
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

    // Each collected paper gives ammo
    this.paperAmmo += PAPER_AMMO_PER_COLLECT * multiplier;

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

    const isPowerDown = ['clippy', 'fogCloud', 'grok', 'dataLeak', 'copilot', 'meta', 'qwen', 'openclaw'].includes(type);
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
        // Spawn Clawd companion
        this.spawnClawd();
        this.activeEffects.set(type, this.time.delayedCall(POWERUP_DURATION.shield, () => {
          this.invincible = false;
          this.shieldGlow?.destroy();
          this.shieldGlow = null;
          this.colorCycleTimer?.remove();
          this.colorCycleTimer = null;
          this.player.setTexture('minty-teal');
          this.activeEffects.delete(type);
        }));
        break;
      case 'openai':
        // Scale ×3
        this.player.setScale(PLAYER_SCALE * 3);
        this.activeEffects.set(type, this.time.delayedCall(POWERUP_DURATION.openai, () => {
          this.player.setScale(PLAYER_SCALE);
          this.activeEffects.delete(type);
        }));
        break;
      case 'speedBolt':
        this.speedMultiplier = 2;
        this.activeEffects.set(type, this.time.delayedCall(POWERUP_DURATION.speedBolt, () => {
          this.speedMultiplier = 1;
          this.activeEffects.delete(type);
        }));
        break;
      case 'ssi':
        this.enemies.setVelocity(0, 0);
        this.enemies.getChildren().forEach(e => (e as Phaser.Physics.Arcade.Sprite).setData('frozen', true));
        this.activeEffects.set(type, this.time.delayedCall(POWERUP_DURATION.ssi, () => {
          this.enemies.getChildren().forEach(e => (e as Phaser.Physics.Arcade.Sprite).setData('frozen', false));
          this.activeEffects.delete(type);
        }));
        break;
      case 'clippy':
        this.controlsReversed = true;
        this.activeEffects.set(type, this.time.delayedCall(POWERDOWN_DURATION.clippy, () => {
          this.controlsReversed = false;
          this.activeEffects.delete(type);
        }));
        break;
      case 'fogCloud':
        this.fogOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
        this.fogOverlay.setScrollFactor(0).setDepth(100);
        this.activeEffects.set(type, this.time.delayedCall(POWERDOWN_DURATION.fogCloud, () => {
          this.fogOverlay?.destroy();
          this.fogOverlay = null;
          this.activeEffects.delete(type);
        }));
        break;
      case 'grok':
        // Spawn lipstick-minty blocking sprite ahead of player
        this.lipstickMinty?.destroy();
        this.lipstickMinty = this.physics.add.sprite(
          this.player.x + this.facing * 150, this.player.y, 'lipstick-minty'
        );
        this.lipstickMinty.setCollideWorldBounds(true);
        (this.lipstickMinty.body as Phaser.Physics.Arcade.Body).immovable = false;
        (this.lipstickMinty.body as Phaser.Physics.Arcade.Body).setMass(50);
        this.physics.add.collider(this.player, this.lipstickMinty);
        this.physics.add.collider(this.lipstickMinty, this.platforms);
        // Slowly move toward player
        this.time.addEvent({
          delay: 100,
          loop: true,
          callback: () => {
            if (!this.lipstickMinty?.active || !this.player?.active) return;
            const dir = this.player.x > this.lipstickMinty.x ? 1 : -1;
            this.lipstickMinty.setVelocityX(dir * 30);
          },
        });
        this.activeEffects.set(type, this.time.delayedCall(POWERDOWN_DURATION.grok, () => {
          this.lipstickMinty?.destroy();
          this.lipstickMinty = null;
          this.activeEffects.delete(type);
        }));
        break;
      case 'dataLeak':
        this.papersCollected = Math.max(0, this.papersCollected - 3);
        this.emitHUDUpdate();
        break;
      case 'copilot':
        this.controlsReversed = true;
        this.jumpReversed = true;
        this.activeEffects.set(type, this.time.delayedCall(POWERDOWN_DURATION.copilot, () => {
          this.controlsReversed = false;
          this.jumpReversed = false;
          this.activeEffects.delete(type);
        }));
        break;
      case 'meta':
        // Spawn 20 flashing sunglasses Minties that swarm and push
        for (let i = 0; i < 20; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 20 + Math.random() * 60;
          const sx = this.player.x + Math.cos(angle) * dist;
          const sy = this.player.y + Math.sin(angle) * dist;
          const swarmMinty = this.physics.add.sprite(sx, sy, 'minty-shades');
          swarmMinty.setScale(0.12);
          swarmMinty.setBounce(1, 1);
          swarmMinty.setVelocity(
            Phaser.Math.Between(-100, 100),
            Phaser.Math.Between(-100, 100)
          );
          swarmMinty.body!.allowGravity = false;
          this.physics.add.collider(this.player, swarmMinty);
          // Flash alpha
          this.tweens.add({
            targets: swarmMinty,
            alpha: { from: 0.3, to: 1.0 },
            duration: 200,
            yoyo: true,
            repeat: -1,
          });
          this.mintySwarm.push(swarmMinty);
        }
        this.activeEffects.set(type, this.time.delayedCall(POWERDOWN_DURATION.meta, () => {
          this.mintySwarm.forEach(s => s.destroy());
          this.mintySwarm = [];
          this.activeEffects.delete(type);
        }));
        break;
      case 'qwen':
        // Instant explosion — lose a life
        // Particle burst
        this.spawnParticles(this.player.x, this.player.y, 0xEF4444, 20);
        this.cameras.main.shake(400, 0.03);
        this.cameras.main.flash(200, 255, 100, 100);
        // Lose a life
        this.playerLives--;
        if (this.playerLives <= 0) {
          this.fsm.setState('dead');
        } else {
          this.playerHealth = PLAYER_MAX_HEALTH;
          const respawn = this.lastCheckpoint || this.config.playerStart;
          this.player.setPosition(respawn.x, respawn.y);
          this.player.setVelocity(0, 0);
          // Swap to bandage texture for 5s
          this.player.setTexture('minty-bandage');
          this.player.setScale(PLAYER_SCALE);
          this.time.delayedCall(5000, () => {
            if (this.player?.active) this.player.setTexture('minty-teal');
          });
          // Brief invincibility
          this.invincible = true;
          this.player.setAlpha(0.5);
          this.time.delayedCall(2000, () => {
            this.invincible = false;
            if (this.player?.active) this.player.setAlpha(1);
          });
        }
        this.emitHUDUpdate();
        break;
      case 'openclaw':
        // Spawn 30 lobsters that block movement
        for (let i = 0; i < 30; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 30 + Math.random() * 170;
          const lx = this.player.x + Math.cos(angle) * dist;
          const ly = this.player.y + Math.sin(angle) * dist;
          const lobster = this.physics.add.sprite(lx, ly, 'lobster');
          lobster.setBounce(0.8, 0.8);
          lobster.setVelocity(
            Phaser.Math.Between(-40, 40),
            Phaser.Math.Between(-40, 40)
          );
          lobster.body!.allowGravity = false;
          this.physics.add.collider(this.player, lobster);
          this.lobsterSwarm.push(lobster);
        }
        this.activeEffects.set(type, this.time.delayedCall(POWERDOWN_DURATION.openclaw, () => {
          this.lobsterSwarm.forEach(l => l.destroy());
          this.lobsterSwarm = [];
          this.activeEffects.delete(type);
        }));
        break;
      case 'deepseek':
        // Green hat overlay + red book ammo (2x damage)
        this.deepseekActive = true;
        this.hatOverlay?.destroy();
        this.hatOverlay = this.add.sprite(this.player.x, this.player.y - 18, 'green-hat');
        this.hatOverlay.setDepth(this.player.depth + 2);
        this.activeEffects.set(type, this.time.delayedCall(POWERUP_DURATION.deepseek, () => {
          this.deepseekActive = false;
          this.hatOverlay?.destroy();
          this.hatOverlay = null;
          this.activeEffects.delete(type);
        }));
        break;
    }
    this.emitHUDUpdate();
  }

  // ── Clawd the Crab Companion ──

  private spawnClawd(): void {
    // Clean up existing Clawd
    this.despawnClawd();

    this.clawd = this.add.sprite(this.player.x - 20, this.player.y - 15, 'clawd') as any;
    // Clawd is a visual sprite, not physics — projectiles use the group
    this.clawd.setDepth(this.player.depth + 1);

    // Auto-fire at nearest enemy
    this.clawdFireTimer = this.time.addEvent({
      delay: CLAWD_FIRE_INTERVAL,
      loop: true,
      callback: () => {
        if (!this.clawd?.active || !this.player?.active) return;
        // Find nearest enemy within range
        let nearestEnemy: Phaser.Physics.Arcade.Sprite | null = null;
        let nearestDist = CLAWD_RANGE;
        this.enemies.getChildren().forEach((obj) => {
          const e = obj as Phaser.Physics.Arcade.Sprite;
          if (!e.active) return;
          const dist = Phaser.Math.Distance.Between(this.clawd!.x, this.clawd!.y, e.x, e.y);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestEnemy = e;
          }
        });
        if (nearestEnemy) {
          const proj = this.clawdProjectiles.create(
            this.clawd.x, this.clawd.y, 'clawd-projectile'
          ) as Phaser.Physics.Arcade.Sprite;
          proj.body!.allowGravity = false;
          const angle = Phaser.Math.Angle.Between(
            this.clawd.x, this.clawd.y,
            (nearestEnemy as Phaser.Physics.Arcade.Sprite).x,
            (nearestEnemy as Phaser.Physics.Arcade.Sprite).y
          );
          proj.setVelocity(
            Math.cos(angle) * CLAWD_PROJECTILE_SPEED,
            Math.sin(angle) * CLAWD_PROJECTILE_SPEED
          );
          this.time.delayedCall(2000, () => { if (proj.active) proj.destroy(); });
        }
      },
    });

    // Despawn after duration
    this.clawdTimer = this.time.delayedCall(CLAWD_DURATION, () => {
      this.despawnClawd();
    });
  }

  private despawnClawd(): void {
    this.clawd?.destroy();
    this.clawd = null;
    this.clawdFireTimer?.remove();
    this.clawdFireTimer = null;
    this.clawdTimer?.remove();
    this.clawdTimer = null;
  }

  // ── Stomp & Enemy Hit Logic ──

  private hitEnemy(_player: any, enemy: any): void {
    if (this.invincible) return;
    const e = enemy as Phaser.Physics.Arcade.Sprite;
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    // Stomp check: player is falling AND player's feet are above enemy's top
    const playerBottom = this.player.y + (PLAYER_BODY_HEIGHT / 2);
    const enemyTop = e.y - (e.height / 2);
    if (body.velocity.y > 0 && playerBottom < enemyTop + 10) {
      // Stomp! 1 damage + bounce
      this.damageEnemy(e, 1);
      body.setVelocityY(-250);
      audioEngine.playSFX('jump');
      return;
    }

    // Normal contact damage + knockback
    audioEngine.playSFX('hit');
    this.takeDamage(CONTACT_DAMAGE);
    const dir = this.player.x < e.x ? -1 : 1;
    this.player.setVelocity(dir * 200, -150);
  }

  private hitBySlop(_player: any, slop: any): void {
    if (this.invincible) return;
    (slop as Phaser.Physics.Arcade.Sprite).destroy();
    this.takeDamage(SLOP_DAMAGE);
  }

  private paperHitEnemy(projectile: any, enemy: any): void {
    const p = projectile as Phaser.Physics.Arcade.Sprite;
    const e = enemy as Phaser.Physics.Arcade.Sprite;
    const damage = (p.getData('damage') as number) || 1;
    p.destroy();
    this.damageEnemy(e, damage);
  }

  /** Shared enemy damage logic used by stomp, paper hit, and Clawd hit */
  private damageEnemy(e: Phaser.Physics.Arcade.Sprite, damage: number): void {
    const hp = (e.getData('hp') as number) - damage;
    e.setData('hp', hp);

    // Flash white
    e.setTintFill(0xffffff);
    this.time.delayedCall(100, () => { if (e.active) e.clearTint(); });

    if (hp <= 0) {
      this.killEnemy(e);
    } else if (e.getData('isBoss')) {
      this.cameras.main.shake(150, 0.01);
    }
  }

  /** Shared enemy death logic */
  private killEnemy(e: Phaser.Physics.Arcade.Sprite): void {
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

    if (isBoss) {
      this.spawnParticles(e.x, e.y, this.config.themeColor, 16);
      this.cameras.main.shake(300, 0.015);
      this.bossDefeated = true;
      this.fsm.setState('victory');
    } else {
      this.spawnParticles(e.x, e.y, this.config.themeColor, 8);
    }

    e.destroy();
    this.emitHUDUpdate();
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
    this.despawnClawd();

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
      const now = this.time.now;
      const lastSlop = this.boss.getData('lastSlop') as number;
      if (now - lastSlop > 1200) {
        this.throwSlop(this.boss);
        this.boss.setData('lastSlop', now);
        this.cameras.main.shake(80, 0.005);
      }
    }
  }

  private onVictory(): void {
    audioEngine.stopTrack();
    audioEngine.playSFX('victory');
    this.gsm.updateHighScore(this.score);
    this.gsm.addPapers(this.papersCollected);
    this.despawnClawd();

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
    const data = {
      health: this.playerHealth,
      lives: this.playerLives,
      score: this.score,
      papers: this.papersCollected,
      ammo: this.paperAmmo,
    };
    this.events.emit('hudUpdate', data);

    // Also emit to HUD scene directly
    const hudScene = this.scene.get(SCENES.HUD);
    if (hudScene) {
      hudScene.events.emit('hudUpdate', data);
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

  // ── Level 1: X/Twitter — Blue checks, SpaceX Falcon, MAGA crowd ──
  private drawBgTwitter(): void {
    const w = this.config.width;

    // Layer 0: Dark cityscape silhouette (inline graphics — simple enough)
    const g0 = this.add.graphics().setScrollFactor(0.1);
    g0.fillStyle(0x0a1520, 0.4);
    for (let x = 0; x < w; x += 70) {
      const h = Phaser.Math.Between(100, 250);
      g0.fillRect(x, GAME_HEIGHT - h, 50, h);
    }

    // SpaceX Falcon rocket (pre-baked sprite)
    const rocket = this.add.image(w * 0.7, 110, 'bg-rocket');
    rocket.setScrollFactor(0.08);
    rocket.setAlpha(0.12);

    // Scattered blue check badges (pre-baked sprites)
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(50, w - 50);
      const y = Phaser.Math.Between(30, 350);
      const check = this.add.image(x, y, 'bg-blue-check');
      check.setScrollFactor(0.3);
      check.setAlpha(Phaser.Math.FloatBetween(0.2, 0.3));
    }

    // Cheering MAGA crowd along bottom (pre-baked sprites)
    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(40, w - 40);
      const groundY = GAME_HEIGHT - Phaser.Math.Between(20, 50);
      const person = this.add.image(x, groundY - 20, 'bg-maga-person');
      person.setScrollFactor(0.15);
      person.setAlpha(Phaser.Math.FloatBetween(0.2, 0.3));
    }

    // Animated floating blue checks with tweens
    for (let i = 0; i < 10; i++) {
      const bx = Phaser.Math.Between(50, w - 50);
      const by = Phaser.Math.Between(30, 300);
      const badge = this.add.image(bx, by, 'bg-blue-check');
      badge.setScrollFactor(0.3);
      badge.setAlpha(0.2);
      this.tweens.add({
        targets: badge,
        y: by - 40,
        alpha: 0.02,
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 3000),
      });
    }

    // Floating tweet cards in mid-background
    for (let i = 0; i < 4; i++) {
      const tx = Phaser.Math.Between(100, w - 100);
      const ty = Phaser.Math.Between(80, 260);
      const card = this.add.image(tx, ty, 'bg-tweet-card');
      card.setScrollFactor(0.2);
      card.setAlpha(0.1);
    }

    // Large faded X logo in sky (inline graphics — simple pattern)
    const gx = this.add.graphics().setScrollFactor(0.05);
    gx.fillStyle(0x1DA1F2, 0.04);
    for (let i = 0; i < 50; i++) {
      gx.fillRect(w * 0.2 + i * 2, 40 + i * 3, 6, 4);
      gx.fillRect(w * 0.2 + 96 - i * 2, 40 + i * 3, 6, 4);
    }
  }

  // ── Level 2: LinkedIn — Premium banners, suited people rushing ──
  private drawBgLinkedIn(): void {
    const w = this.config.width;

    // Office buildings (pre-baked sprites)
    for (let i = 0; i < 10; i++) {
      const bx = Phaser.Math.Between(0, w - 40);
      const building = this.add.image(bx, GAME_HEIGHT - 36, 'bg-office-building');
      building.setOrigin(0.5, 1);
      building.setScrollFactor(0.1);
      building.setAlpha(Phaser.Math.FloatBetween(0.3, 0.5));
    }

    // Premium banners (pre-baked sprites)
    for (let i = 0; i < 6; i++) {
      const bx = Phaser.Math.Between(50, w - 100);
      const by = Phaser.Math.Between(40, 280);
      const banner = this.add.image(bx, by, 'bg-premium-banner');
      banner.setScrollFactor(0.2);
      banner.setAlpha(Phaser.Math.FloatBetween(0.15, 0.25));
    }

    // Suited people rushing (pre-baked sprites)
    for (let i = 0; i < 14; i++) {
      const x = Phaser.Math.Between(30, w - 30);
      const py = GAME_HEIGHT - Phaser.Math.Between(15, 45);
      const person = this.add.image(x, py - 20, 'bg-suited-person');
      person.setScrollFactor(0.18);
      person.setAlpha(Phaser.Math.FloatBetween(0.25, 0.35));
    }

    // LinkedIn "in" logos scattered (text — works fine)
    for (let i = 0; i < 6; i++) {
      const bx = Phaser.Math.Between(50, w - 50);
      const by = Phaser.Math.Between(30, 200);
      this.add.text(bx, by, 'in', {
        fontFamily: 'serif',
        fontSize: '36px',
        color: '#0A66C2',
        fontStyle: 'bold',
      }).setAlpha(0.04).setScrollFactor(0.12);
    }
  }

  // ── Level 3: Bluesky — Blue butterflies, white clouds ──
  private drawBgBluesky(): void {
    const w = this.config.width;

    // Background clouds (pre-baked sprites, far layer)
    for (let i = 0; i < 12; i++) {
      const cx = Phaser.Math.Between(0, w);
      const cy = Phaser.Math.Between(20, 250);
      const cloud = this.add.image(cx, cy, 'bg-cloud');
      cloud.setScrollFactor(0.12);
      cloud.setAlpha(Phaser.Math.FloatBetween(0.08, 0.15));
      cloud.setScale(Phaser.Math.FloatBetween(0.8, 1.5));
    }

    // Foreground clouds (pre-baked sprites, nearer layer)
    for (let i = 0; i < 6; i++) {
      const cx = Phaser.Math.Between(0, w);
      const cy = Phaser.Math.Between(40, 300);
      const cloud = this.add.image(cx, cy, 'bg-cloud');
      cloud.setScrollFactor(0.25);
      cloud.setAlpha(Phaser.Math.FloatBetween(0.12, 0.2));
    }

    // Animated blue butterflies (pre-baked sprites with tweens)
    for (let i = 0; i < 12; i++) {
      const bx = Phaser.Math.Between(50, w - 50);
      const by = Phaser.Math.Between(30, 350);
      const butterfly = this.add.image(bx, by, 'bg-butterfly');
      butterfly.setScrollFactor(0.35);
      butterfly.setAlpha(Phaser.Math.FloatBetween(0.2, 0.3));
      this.tweens.add({
        targets: butterfly,
        y: by - 30,
        x: bx + Phaser.Math.Between(-40, 40),
        duration: Phaser.Math.Between(4000, 8000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 3000),
      });
    }

    // Large Bluesky logos (pre-baked sprites, very faint)
    for (let i = 0; i < 4; i++) {
      const lx = Phaser.Math.Between(100, w - 100);
      const ly = Phaser.Math.Between(60, 200);
      const logo = this.add.image(lx, ly, 'bg-bsky-logo');
      logo.setScrollFactor(0.08);
      logo.setAlpha(Phaser.Math.FloatBetween(0.06, 0.1));
      logo.setScale(Phaser.Math.FloatBetween(2, 3));
    }
  }

  // ── Level 4: ArXiv — Computers and computer scientists ──
  private drawBgArxiv(): void {
    const w = this.config.width;

    // Server racks (pre-baked sprites)
    for (let i = 0; i < 12; i++) {
      const x = Phaser.Math.Between(0, w - 20);
      const rack = this.add.image(x, GAME_HEIGHT - 24, 'bg-server-rack');
      rack.setOrigin(0.5, 1);
      rack.setScrollFactor(0.1);
      rack.setAlpha(Phaser.Math.FloatBetween(0.3, 0.4));
    }

    // GPU racks (larger, pre-baked)
    for (let i = 0; i < 5; i++) {
      const gx = Phaser.Math.Between(50, w - 50);
      const gpuRack = this.add.image(gx, GAME_HEIGHT - 40, 'bg-gpu-rack');
      gpuRack.setOrigin(0.5, 1);
      gpuRack.setScrollFactor(0.08);
      gpuRack.setAlpha(0.2);
    }

    // Seated computer scientists (pre-baked sprites)
    for (let i = 0; i < 6; i++) {
      const x = Phaser.Math.Between(60, w - 60);
      const dy = GAME_HEIGHT - Phaser.Math.Between(60, 100);
      const scientist = this.add.image(x, dy - 10, 'bg-scientist');
      scientist.setScrollFactor(0.2);
      scientist.setAlpha(Phaser.Math.FloatBetween(0.25, 0.35));
    }

    // Terminal screens floating in background (pre-baked sprites)
    for (let i = 0; i < 5; i++) {
      const tx = Phaser.Math.Between(50, w - 50);
      const ty = Phaser.Math.Between(40, 280);
      const terminal = this.add.image(tx, ty, 'bg-terminal');
      terminal.setScrollFactor(0.15);
      terminal.setAlpha(Phaser.Math.FloatBetween(0.15, 0.2));
    }

    // Floating LaTeX/math symbols (text — works fine)
    const symbols = ['∑', '∫', '∂', '∇', 'λ', 'θ', 'π', '≈'];
    for (let i = 0; i < 10; i++) {
      const sx = Phaser.Math.Between(30, w - 30);
      const sy = Phaser.Math.Between(30, 350);
      this.add.text(sx, sy, symbols[i % symbols.length], {
        fontFamily: 'serif',
        fontSize: `${Phaser.Math.Between(16, 32)}px`,
        color: '#B31B1B',
      }).setAlpha(0.06).setScrollFactor(0.25);
    }

    // Floating paper silhouettes (inline graphics — simple rectangles)
    const g2 = this.add.graphics().setScrollFactor(0.3);
    for (let i = 0; i < 14; i++) {
      const px = Phaser.Math.Between(20, w - 20);
      const py = Phaser.Math.Between(40, 380);
      g2.fillStyle(0xffffff, 0.06);
      g2.fillRect(px, py, 16, 20);
      g2.fillStyle(0x888888, 0.04);
      g2.fillRect(px + 3, py + 4, 10, 1);
      g2.fillRect(px + 3, py + 7, 8, 1);
      g2.fillRect(px + 3, py + 10, 11, 1);
    }
  }

  // ── Level 5: PhilPapers — Ivory towers, philosophers with heads in clouds ──
  private drawBgPhilpapers(): void {
    const w = this.config.width;

    // Starfield background (inline graphics — simple dots)
    const g0 = this.add.graphics().setScrollFactor(0.05);
    g0.fillStyle(0x080810);
    g0.fillRect(0, 0, w, GAME_HEIGHT);
    for (let i = 0; i < 50; i++) {
      const sx = Phaser.Math.Between(0, w);
      const sy = Phaser.Math.Between(0, GAME_HEIGHT);
      g0.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.03, 0.12));
      g0.fillCircle(sx, sy, Phaser.Math.Between(1, 2));
    }

    // Ivory towers (pre-baked sprites)
    for (let i = 0; i < 4; i++) {
      const x = Phaser.Math.Between(100, w - 100);
      const tower = this.add.image(x, GAME_HEIGHT - 44, 'bg-ivory-tower');
      tower.setOrigin(0.5, 1);
      tower.setScrollFactor(0.12);
      tower.setAlpha(Phaser.Math.FloatBetween(0.15, 0.25));
    }

    // Philosophers (pre-baked sprites) with inline thought bubbles
    const gb = this.add.graphics().setScrollFactor(0.18);
    for (let i = 0; i < 7; i++) {
      const x = Phaser.Math.Between(60, w - 60);
      const py = GAME_HEIGHT - Phaser.Math.Between(30, 80);
      const philosopher = this.add.image(x, py - 20, 'bg-philosopher');
      philosopher.setScrollFactor(0.18);
      philosopher.setAlpha(Phaser.Math.FloatBetween(0.2, 0.3));
      // Thought bubble rising (inline — too simple to prebake)
      gb.fillStyle(0xffffff, 0.06);
      gb.fillCircle(x + 8, py - 30, 3);
      gb.fillCircle(x + 12, py - 40, 4);
      gb.fillCircle(x + 10, py - 52, 6);
    }

    // Greek philosophical symbols (text — works fine)
    const symbols = ['?', 'φ', '∴', '¬', '∃', '∀', '⊢', '⊨'];
    for (let i = 0; i < 8; i++) {
      const qx = Phaser.Math.Between(50, w - 50);
      const qy = Phaser.Math.Between(60, 300);
      this.add.text(qx, qy, symbols[i], {
        fontFamily: 'serif',
        fontSize: `${Phaser.Math.Between(24, 48)}px`,
        color: '#2C3E50',
      }).setAlpha(0.05).setScrollFactor(0.2);
    }
  }

  // ── Level 6: SSRN — Social scientists measuring, wagging fingers ──
  private drawBgSSRN(): void {
    const w = this.config.width;

    // Institutional buildings (inline graphics — simple brick pattern)
    const g0 = this.add.graphics().setScrollFactor(0.1);
    for (let bx = 0; bx < w; bx += 80) {
      const bh = Phaser.Math.Between(120, 320);
      g0.fillStyle(0x0a200f, 0.6);
      g0.fillRect(bx, GAME_HEIGHT - bh, 60, bh);
      g0.lineStyle(1, 0x153d20, 0.3);
      for (let wy = GAME_HEIGHT - bh; wy < GAME_HEIGHT; wy += 16) {
        g0.strokeRect(bx, wy, 30, 16);
        g0.strokeRect(bx + 30, wy + 8, 30, 16);
      }
    }

    // Social scientists (pre-baked sprites)
    for (let i = 0; i < 9; i++) {
      const x = Phaser.Math.Between(50, w - 50);
      const py = GAME_HEIGHT - Phaser.Math.Between(25, 60);
      const scientist = this.add.image(x, py - 20, 'bg-social-scientist');
      scientist.setScrollFactor(0.2);
      scientist.setAlpha(Phaser.Math.FloatBetween(0.2, 0.3));
    }

    // Bar charts (pre-baked sprites)
    for (let i = 0; i < 5; i++) {
      const cx = Phaser.Math.Between(80, w - 80);
      const cy = Phaser.Math.Between(100, 300);
      const chart = this.add.image(cx, cy, 'bg-bar-chart');
      chart.setScrollFactor(0.15);
      chart.setAlpha(Phaser.Math.FloatBetween(0.12, 0.2));
    }

    // Paywall locks (pre-baked sprites with gentle bobbing tween)
    for (let i = 0; i < 6; i++) {
      const lx = Phaser.Math.Between(80, w - 80);
      const ly = Phaser.Math.Between(40, 250);
      const lock = this.add.image(lx, ly, 'bg-paywall-lock');
      lock.setScrollFactor(0.2);
      lock.setAlpha(Phaser.Math.FloatBetween(0.1, 0.15));
      this.tweens.add({
        targets: lock,
        y: ly - 8,
        duration: Phaser.Math.Between(3000, 5000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }
}
