import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED, PLAYER_JUMP,
  PLAYER_MAX_HEALTH, PLAYER_LIVES, PAPER_PROJECTILE_SPEED,
  PAPER_FIRE_COOLDOWN, PAPER_RANGE_PER_5, PAPER_RANGE_CAP,
  PAPER_AMMO_PER_COLLECT, PAPER_RANGE_BASE, GOLD_PAPER_RANGE_BONUS,
  MAX_JUMPS, DOUBLE_JUMP_FORCE_MULT,
  CLAWD_FIRE_INTERVAL, CLAWD_DURATION, CLAWD_RANGE, CLAWD_PROJECTILE_SPEED,
  PAPER_HEAL, PAPER_SCORE, SLOP_DAMAGE, CONTACT_DAMAGE,
  BOSS_JUMP_DAMAGE, BOSS_SHOCKWAVE_RANGE, BOSS_ENVELOP_DAMAGE,
  BOSS_FAKE_PAPER_DAMAGE, BOSS_VACUUM_RANGE, BOSS_SIZES,
  TILE_SIZE, ENEMY_TIERS, PLAYER_SCALE, PLAYER_BODY_WIDTH, PLAYER_BODY_HEIGHT,
  NPC_SCALE, LEVEL_PLATFORM_KEYS, DEATH_TEXTS, LEVEL_THEMES,
  MINTY_COLORS, POWERUP_DURATION, POWERDOWN_DURATION } from '../constants';
import type { LevelConfig, LevelNumber, EnemyTier, EnemySpawn } from '../constants';
import { getLevelConfig, getTotalLevels } from '../levels/LevelRegistry';
import { StateMachine } from '../systems/StateMachine';
import { GameStateManager } from '../state/GameStateManager';
import { audioEngine } from '../systems/AudioEngine';
import { level1Track } from '../audio/tracks/level1';
import { level2Track } from '../audio/tracks/level2';
import { level3Track } from '../audio/tracks/level3';
import { level4Track } from '../audio/tracks/level4';
import { level5Track } from '../audio/tracks/level5';
import { level6Track } from '../audio/tracks/level6';
import { level7Track } from '../audio/tracks/level7';
import { level8Track } from '../audio/tracks/level8';
import { level9Track } from '../audio/tracks/level9';
import { level10Track } from '../audio/tracks/level10';
import { bossTrack } from '../audio/tracks/boss';
import type { TrackData } from '../systems/AudioEngine';

type ControlAction = 'left' | 'right' | 'jump' | 'fire';

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
  private goldPapersCollected: number = 0;
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
  private bossType: string = '';
  private bossLastAttack: number = 0;
  private bossLastSpecial: number = 0;
  private bossClones: Phaser.Physics.Arcade.Sprite[] = [];
  private bossInvincible: boolean = false;

  // Envelop mechanic
  private enveloped: boolean = false;
  private envelopOverlay: Phaser.GameObjects.Rectangle | null = null;
  private envelopText: Phaser.GameObjects.Text | null = null;
  private envelopMeter: number = 0;
  private envelopStartTime: number = 0;
  private envelopLastDir: string = '';
  private envelopMeterBar: Phaser.GameObjects.Graphics | null = null;

  // Active effects
  private activeEffects: Map<string, Phaser.Time.TimerEvent> = new Map();
  private speedMultiplier: number = 1;
  private controlsReversed: boolean = false;
  private fogOverlay: Phaser.GameObjects.Rectangle | null = null;
  private controlShuffleTimer: Phaser.Time.TimerEvent | null = null;
  private controlBindings: Record<ControlAction, ControlAction> = {
    left: 'left',
    right: 'right',
    jump: 'jump',
    fire: 'fire',
  };
  private glueTimer: Phaser.Time.TimerEvent | null = null;
  private glueSlowFactor: number = 1;
  private glueJumpFactor: number = 1;
  private shockSourceIds: Set<number> = new Set();
  private nextShockSourceId: number = 1;
  private lastShockTick: number = 0;
  private appleMelting: boolean = false;
  private appleMeltTimer: Phaser.Time.TimerEvent | null = null;

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
  private reinforcementTimer: Phaser.Time.TimerEvent | null = null;
  private reinforcementWave: number = 0;
  private stompGraceUntil: number = 0;

  // Level name flash
  private levelNameText: Phaser.GameObjects.Text | null = null;

  // New power-up/down state
  private jumpReversed: boolean = false;
  private mintySwarm: Phaser.Physics.Arcade.Sprite[] = [];
  private lipstickMinty: Phaser.Physics.Arcade.Sprite | null = null;
  private deepseekActive: boolean = false;
  private lobsterSwarm: Phaser.Physics.Arcade.Sprite[] = [];
  private hatOverlay: Phaser.GameObjects.Sprite | null = null;
  private bridgeRideSprite: Phaser.GameObjects.Sprite | null = null;
  private bridgeRideTimer: Phaser.Time.TimerEvent | null = null;
  private bridgeRideActive: boolean = false;
  private bridgeLandingRisk: boolean = false;
  private bridgeDropStartY: number = 0;
  private bridgeDropMaxSpeed: number = 0;
  private bridgeVelocityX: number = 0;
  private bridgeVelocityY: number = 0;

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
    this.goldPapersCollected = 0;
    this.jumpsRemaining = MAX_JUMPS;
    this.bossDefeated = false;
    this.invincible = false;
    this.speedMultiplier = 1;
    this.controlsReversed = false;
    this.controlShuffleTimer?.remove();
    this.controlShuffleTimer = null;
    this.resetControlBindings();
    this.glueTimer?.remove();
    this.glueTimer = null;
    this.glueSlowFactor = 1;
    this.glueJumpFactor = 1;
    this.shockSourceIds.clear();
    this.nextShockSourceId = 1;
    this.lastShockTick = 0;
    this.appleMelting = false;
    this.appleMeltTimer?.remove();
    this.appleMeltTimer = null;
    this.playerLives = PLAYER_LIVES;
    this.activeEffects.clear();
    this.lastCheckpoint = null;
    this.shieldGlow = null;
    this.colorCycleTimer = null;
    this.fogOverlay = null;
    this.idleZzz = null;
    this.reinforcementTimer = null;
    this.reinforcementWave = 0;
    this.stompGraceUntil = 0;
    this.levelNameText = null;
    this.boss = null;
    this.bossType = '';
    this.bossLastAttack = 0;
    this.bossLastSpecial = 0;
    this.bossClones = [];
    this.bossInvincible = false;
    this.enveloped = false;
    this.envelopOverlay = null;
    this.envelopText = null;
    this.envelopMeter = 0;
    this.envelopStartTime = 0;
    this.envelopLastDir = '';
    this.envelopMeterBar = null;
    this.clawd = null;
    this.clawdTimer = null;
    this.clawdFireTimer = null;
    this.jumpReversed = false;
    this.mintySwarm = [];
    this.lipstickMinty = null;
    this.deepseekActive = false;
    this.lobsterSwarm = [];
    this.hatOverlay = null;
    this.bridgeRideSprite = null;
    this.bridgeRideTimer = null;
    this.bridgeRideActive = false;
    this.bridgeLandingRisk = false;
    this.bridgeDropStartY = 0;
    this.bridgeDropMaxSpeed = 0;
    this.bridgeVelocityX = 0;
    this.bridgeVelocityY = 0;

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
    this.player.setCollideWorldBounds(true);
    this.resizePlayerVisual();

    // Camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, this.config.width, GAME_HEIGHT);

    // Collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms, undefined, (enemyObj, platObj) => {
      const e = enemyObj as Phaser.Physics.Arcade.Sprite;
      const eType = e.getData('type') as string;
      // Only trolls/influencers get one-way platforms (jump through from below)
      if (eType !== 'troll' && eType !== 'influencer') return true;
      // One-way: only collide when enemy's previous bottom was at or above platform top
      const eBody = e.body as Phaser.Physics.Arcade.Body;
      const pBody = (platObj as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.StaticBody;
      return (eBody.prev.y + eBody.height) <= pBody.position.y + 4;
    }, this);

    // Overlaps
    this.physics.add.overlap(this.player, this.papers, this.collectPaper, this.canCollectPaper, this);
    this.physics.add.overlap(this.slopGroup, this.papers, this.slopHitPaper, undefined, this);
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

    this.reinforcementTimer = this.time.addEvent({
      delay: 30000,
      loop: true,
      callback: () => {
        if (!this.fsm.isState('playing')) return;
        this.spawnReinforcementWave();
      },
    });

    // Spawn boss at end of level
    this.spawnBoss();

    // Start level music
    const tracks: Record<number, TrackData> = {
      1: level1Track, 2: level2Track, 3: level3Track,
      4: level4Track, 5: level5Track, 6: level6Track, 7: level7Track, 8: level8Track, 9: level9Track, 10: level10Track,
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

  private getBaseMintyDisplaySize(): { width: number; height: number } {
    const source = this.textures.get('minty-teal').getSourceImage() as { width: number; height: number };
    return {
      width: source.width * PLAYER_SCALE,
      height: source.height * PLAYER_SCALE,
    };
  }

  private refreshPlayerBodyBounds(): void {
    if (!this.player?.body) return;

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(
      PLAYER_BODY_WIDTH / PLAYER_SCALE,
      PLAYER_BODY_HEIGHT / PLAYER_SCALE
    );
    body.setOffset(
      (this.player.width - PLAYER_BODY_WIDTH / PLAYER_SCALE) / 2,
      this.player.height - PLAYER_BODY_HEIGHT / PLAYER_SCALE
    );
  }

  private resizePlayerVisual(scaleMultiplier: number = 1, preserveFeet: boolean = true): void {
    if (!this.player?.active) return;

    const previousBottom = this.player.y + (this.player.displayHeight / 2);
    const baseSize = this.getBaseMintyDisplaySize();
    this.player.setDisplaySize(baseSize.width * scaleMultiplier, baseSize.height * scaleMultiplier);
    if (preserveFeet) {
      this.player.y = previousBottom - (this.player.displayHeight / 2);
    }
    this.refreshPlayerBodyBounds();
  }

  private setPlayerVisual(textureKey: string, scaleMultiplier: number = 1, preserveFeet: boolean = true): void {
    if (!this.player?.active) return;

    this.player.setTexture(textureKey);
    this.resizePlayerVisual(scaleMultiplier, preserveFeet);
  }

  private resetControlBindings(): void {
    this.controlBindings = {
      left: 'left',
      right: 'right',
      jump: 'jump',
      fire: 'fire',
    };
  }

  private isPhysicalActionDown(action: ControlAction): boolean {
    switch (action) {
      case 'left':
        return this.cursors.left.isDown || this.wasd.A.isDown;
      case 'right':
        return this.cursors.right.isDown || this.wasd.D.isDown;
      case 'jump':
        return this.cursors.up.isDown || this.wasd.W.isDown || this.cursors.space.isDown;
      case 'fire':
        return this.keyZ.isDown || this.keyX.isDown;
    }
  }

  private isPhysicalActionJustPressed(action: ControlAction): boolean {
    switch (action) {
      case 'left':
        return Phaser.Input.Keyboard.JustDown(this.cursors.left)
          || Phaser.Input.Keyboard.JustDown(this.wasd.A);
      case 'right':
        return Phaser.Input.Keyboard.JustDown(this.cursors.right)
          || Phaser.Input.Keyboard.JustDown(this.wasd.D);
      case 'jump':
        return Phaser.Input.Keyboard.JustDown(this.cursors.up)
          || Phaser.Input.Keyboard.JustDown(this.wasd.W)
          || Phaser.Input.Keyboard.JustDown(this.cursors.space);
      case 'fire':
        return Phaser.Input.Keyboard.JustDown(this.keyZ)
          || Phaser.Input.Keyboard.JustDown(this.keyX);
    }
  }

  private isActionDown(action: ControlAction): boolean {
    const physicalActions = Object.keys(this.controlBindings) as ControlAction[];
    return physicalActions.some((physical) => (
      this.controlBindings[physical] === action && this.isPhysicalActionDown(physical)
    ));
  }

  private isActionJustPressed(action: ControlAction): boolean {
    const physicalActions = Object.keys(this.controlBindings) as ControlAction[];
    return physicalActions.some((physical) => (
      this.controlBindings[physical] === action && this.isPhysicalActionJustPressed(physical)
    ));
  }

  private scrambleControls(duration: number = 6000): void {
    const actions: ControlAction[] = ['left', 'right', 'jump', 'fire'];
    let shuffled = [...actions];

    for (let attempt = 0; attempt < 6; attempt++) {
      shuffled = Phaser.Utils.Array.Shuffle([...actions]);
      if (actions.some((action, index) => shuffled[index] !== action)) break;
    }

    this.controlBindings = {
      left: shuffled[0],
      right: shuffled[1],
      jump: shuffled[2],
      fire: shuffled[3],
    };

    this.controlShuffleTimer?.remove();
    this.controlShuffleTimer = this.time.delayedCall(duration, () => {
      this.resetControlBindings();
      this.controlShuffleTimer = null;
    });

    const warning = this.add.text(GAME_WIDTH / 2, 118, 'CONFUSED: CONTROLS SCRAMBLED', {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '10px',
      color: '#ffd166',
      backgroundColor: '#1b1b1b',
      padding: { left: 8, right: 8, top: 4, bottom: 4 },
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(210);
    this.tweens.add({
      targets: warning,
      alpha: 0,
      y: 98,
      duration: 1400,
      onComplete: () => warning.destroy(),
    });
  }

  private showStatusBanner(message: string, color: string = '#ffd166'): void {
    const banner = this.add.text(GAME_WIDTH / 2, 118, message, {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '10px',
      color,
      backgroundColor: '#1b1b1b',
      padding: { left: 8, right: 8, top: 4, bottom: 4 },
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(210);
    this.tweens.add({
      targets: banner,
      alpha: 0,
      y: 98,
      duration: 1400,
      onComplete: () => banner.destroy(),
    });
  }

  private applyGlueDebuff(duration: number = 4500): void {
    this.glueSlowFactor = 0.42;
    this.glueJumpFactor = 0.6;
    this.glueTimer?.remove();
    this.glueTimer = this.time.delayedCall(duration, () => {
      this.glueSlowFactor = 1;
      this.glueJumpFactor = 1;
      this.glueTimer = null;
    });
    this.showStatusBanner('GLUED: MOVEMENT SLOWED', '#ffcf8a');
  }

  private addShockSource(enemy: Phaser.Physics.Arcade.Sprite): void {
    let shockId = enemy.getData('shockId') as number | undefined;
    if (!shockId) {
      shockId = this.nextShockSourceId++;
      enemy.setData('shockId', shockId);
    }
    this.shockSourceIds.add(shockId);
    this.showStatusBanner('SHOCKED', '#7dd3fc');
  }

  private removeShockSource(enemy: Phaser.Physics.Arcade.Sprite): void {
    const shockId = enemy.getData('shockId') as number | undefined;
    if (shockId) {
      this.shockSourceIds.delete(shockId);
    }
  }

  private clearShockSources(): void {
    this.shockSourceIds.clear();
    this.lastShockTick = 0;
    if (this.player?.active && !this.idleSleeping) {
      this.player.clearTint();
    }
  }

  private applyShockDrain(amount: number): void {
    if (!this.player?.active) return;
    this.playerHealth -= amount;
    this.emitHUDUpdate();

    if (this.playerHealth <= 0) {
      this.clearShockSources();
      this.endGoldenGateRide(true);
      this.playerLives--;
      if (this.playerLives <= 0) {
        this.fsm.setState('dead');
      } else {
        this.playerHealth = PLAYER_MAX_HEALTH;
        const respawn = this.lastCheckpoint || this.config.playerStart;
        this.player.setPosition(respawn.x, respawn.y);
        this.player.setVelocity(0, 0);
        this.emitHUDUpdate();
      }
    }
  }

  private updateShockEffect(): void {
    if (!this.player?.active || this.appleMelting) return;

    if (this.shockSourceIds.size === 0) {
      if (!this.idleSleeping) {
        this.player.clearTint();
      }
      return;
    }

    const shockColors = [0x7dd3fc, 0xfef08a, 0xf472b6, 0x93c5fd];
    const color = shockColors[Math.floor(this.time.now / 120) % shockColors.length];
    this.player.setTint(color);

    const interval = 650;
    if (this.time.now - this.lastShockTick >= interval) {
      this.lastShockTick = this.time.now;
      this.applyShockDrain(3 * this.shockSourceIds.size);
    }
  }

  private startAppleMeltdown(): void {
    if (!this.player?.active || this.appleMelting) return;

    this.appleMelting = true;
    this.endGoldenGateRide(true);
    this.appleMeltTimer?.remove();
    this.clearShockSources();
    this.invincible = true;

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setAllowGravity(false);
    this.player.clearTint();
    this.setPlayerVisual('minty-teal');

    this.tweens.add({
      targets: this.player,
      scaleX: PLAYER_SCALE * 0.7,
      scaleY: PLAYER_SCALE * 0.08,
      y: this.player.y + 16,
      angle: 0,
      duration: 3000,
      ease: 'Sine.easeInOut',
    });
    this.time.delayedCall(1600, () => {
      if (!this.player?.active || !this.appleMelting) return;
      this.player.setTexture('minty-puddle');
      this.player.setScale(1);
    });
    this.showStatusBanner('APPLE MELTDOWN', '#f87171');

    this.appleMeltTimer = this.time.delayedCall(3000, () => {
      if (!this.player?.active) return;
      const start = this.config.playerStart;
      this.appleMelting = false;
      this.setPlayerVisual('minty-teal', 1, false);
      this.player.setPosition(start.x, start.y);
      this.player.setVelocity(0, 0);
      body.setAllowGravity(true);
      this.invincible = false;
      this.appleMeltTimer = null;
      this.showStatusBanner('BACK TO START', '#fca5a5');
    });
  }

  private hasNearbyLandingZone(maxDrop: number = 72): boolean {
    if (this.player.y >= GAME_HEIGHT - 90) return true;

    let safe = false;
    this.platforms.getChildren().forEach((obj) => {
      if (safe) return;
      const platform = obj as Phaser.Physics.Arcade.Sprite;
      const bounds = platform.getBounds();
      const horizontalMargin = 24;
      const withinX = this.player.x >= bounds.left - horizontalMargin && this.player.x <= bounds.right + horizontalMargin;
      const dropDistance = bounds.top - this.player.y;
      if (withinX && dropDistance >= 0 && dropDistance <= maxDrop) {
        safe = true;
      }
    });
    return safe;
  }

  private startGoldenGateRide(): void {
    this.endGoldenGateRide(true);

    this.bridgeRideActive = true;
    this.bridgeRideSprite = this.add.sprite(this.player.x, this.player.y + 14, 'golden-gate-helper');
    this.bridgeRideSprite.setDepth(this.player.depth - 1);
    this.bridgeVelocityX = 0;
    this.bridgeVelocityY = 0;
    this.bridgeLandingRisk = false;
    this.bridgeDropStartY = 0;
    this.bridgeDropMaxSpeed = 0;

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocity(0, 0);

    this.bridgeRideTimer?.remove();
    const timer = this.time.delayedCall(POWERUP_DURATION.goldenGate, () => {
      this.endGoldenGateRide();
    });
    this.bridgeRideTimer = timer;
    this.activeEffects.set('goldenGate', timer);
    this.showStatusBanner('GOLDEN GATE LIFT-OFF', '#ffb347');
  }

  private endGoldenGateRide(forceCleanup: boolean = false): void {
    if (!this.bridgeRideActive && !this.bridgeRideSprite && !this.bridgeRideTimer) return;

    this.bridgeRideActive = false;
    this.bridgeRideTimer?.remove();
    this.bridgeRideTimer = null;
    this.activeEffects.delete('goldenGate');

    const body = this.player?.body as Phaser.Physics.Arcade.Body | undefined;
    if (body) {
      body.setAllowGravity(true);
      body.setVelocity(this.bridgeVelocityX, Math.max(0, this.bridgeVelocityY));
    }

    this.bridgeRideSprite?.destroy();
    this.bridgeRideSprite = null;

    if (!forceCleanup && this.player?.active) {
      if (!this.hasNearbyLandingZone() && this.player.y < GAME_HEIGHT - 90) {
        this.bridgeLandingRisk = true;
        this.bridgeDropStartY = this.player.y;
        this.bridgeDropMaxSpeed = 0;
        this.showStatusBanner('LAND SAFELY', '#ffd166');
      } else {
        this.bridgeLandingRisk = false;
        this.bridgeDropStartY = 0;
        this.bridgeDropMaxSpeed = 0;
      }
    } else {
      this.bridgeLandingRisk = false;
      this.bridgeDropStartY = 0;
      this.bridgeDropMaxSpeed = 0;
    }

    this.bridgeVelocityX = 0;
    this.bridgeVelocityY = 0;
  }

  private updateGoldenGateRide(moveDir: number): void {
    if (!this.bridgeRideActive || !this.bridgeRideSprite || !this.player?.active) return;

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const ascend = this.isActionDown('jump');
    const descend = this.cursors.down.isDown || this.wasd.S.isDown;
    const rideSpeedX = PLAYER_SPEED * 1.35;
    const rideSpeedY = 145;

    this.bridgeVelocityX = moveDir * rideSpeedX;
    if (ascend && !descend) this.bridgeVelocityY = -rideSpeedY;
    else if (descend) this.bridgeVelocityY = rideSpeedY;
    else this.bridgeVelocityY = Math.sin(this.time.now * 0.006) * 28;

    this.bridgeRideSprite.x = Phaser.Math.Clamp(
      this.bridgeRideSprite.x + this.bridgeVelocityX * (1 / 60),
      50,
      this.config.width - 50
    );
    this.bridgeRideSprite.y = Phaser.Math.Clamp(
      this.bridgeRideSprite.y + this.bridgeVelocityY * (1 / 60),
      70,
      GAME_HEIGHT - 60
    );

    this.player.setPosition(this.bridgeRideSprite.x, this.bridgeRideSprite.y - 20);
    body.setVelocity(0, 0);
    body.setAllowGravity(false);
  }

  private updatePlaying(_dt: number): void {
    if (!this.player?.active) return;

    const body = this.player.body as Phaser.Physics.Arcade.Body;

    if (this.appleMelting) {
      body.setVelocity(0, 0);
      this.updateShockEffect();
      return;
    }

    const speed = PLAYER_SPEED * this.speedMultiplier * this.glueSlowFactor;

    if (this.bridgeLandingRisk) {
      if (!body.blocked.down && body.velocity.y > 0) {
        this.bridgeDropMaxSpeed = Math.max(this.bridgeDropMaxSpeed, body.velocity.y);
      } else if (body.blocked.down) {
        if (this.bridgeDropMaxSpeed > 250 || this.player.y - this.bridgeDropStartY > 130) {
          this.takeDamage(CONTACT_DAMAGE);
        }
        this.bridgeLandingRisk = false;
        this.bridgeDropStartY = 0;
        this.bridgeDropMaxSpeed = 0;
      }
    }

    // Horizontal movement
    let moveDir = 0;
    if (this.isActionDown('left')) moveDir = -1;
    else if (this.isActionDown('right')) moveDir = 1;

    if (this.controlsReversed) moveDir *= -1;
    if (this.bridgeRideActive) {
      this.updateGoldenGateRide(moveDir);
    } else {
      body.setVelocityX(moveDir * speed);
    }

    if (moveDir !== 0) {
      this.facing = moveDir;
      this.player.setFlipX(moveDir < 0);
    }

    // Reset jumps when grounded
    if (body.blocked.down && !this.bridgeRideActive) {
      this.jumpsRemaining = MAX_JUMPS;
    }

    // Jump (with double jump)
    const jumpPressed = this.isActionJustPressed('jump');

    if (!this.bridgeRideActive && jumpPressed && this.jumpsRemaining > 0) {
      if (this.jumpReversed) {
        // Copilot: backward launch instead of jump
        const body2 = this.player.body as Phaser.Physics.Arcade.Body;
        body2.setVelocityY(-PLAYER_JUMP * 1.5);  // Downward (positive = down, but PLAYER_JUMP is negative, so negate)
        body2.setVelocityX(-this.facing * PLAYER_SPEED * 2);
        this.jumpsRemaining--;
        audioEngine.playSFX('jump');
      } else {
        const isDoubleJump = !body.blocked.down;
        const forceBase = isDoubleJump ? PLAYER_JUMP * DOUBLE_JUMP_FORCE_MULT : PLAYER_JUMP;
        const force = forceBase * this.glueJumpFactor;
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
    if (this.isActionJustPressed('fire')) {
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
    if (moveDir !== 0 || jumpPressed || this.bridgeRideActive) {
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

    this.updateShockEffect();

    // Update enemies
    this.updateEnemies();
    this.updateHostileProjectiles();

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
    proj.setData('sourceKind', 'paper');
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

    // Destroy after range (gold papers give permanent range bonus)
    const range = Math.min(
      PAPER_RANGE_BASE + Math.floor(this.papersCollected / 5) * PAPER_RANGE_PER_5
        + this.goldPapersCollected * GOLD_PAPER_RANGE_BONUS,
      PAPER_RANGE_CAP + this.goldPapersCollected * GOLD_PAPER_RANGE_BONUS
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
    this.config.enemies.forEach((enemy) => {
      this.spawnEnemy(enemy);
    });
  }

  private spawnEnemy(enemyData: EnemySpawn, options: { x?: number; y?: number; fromSky?: boolean } = {}): Phaser.Physics.Arcade.Sprite {
    const tier = enemyData.tier || 'peach';
    const tierData = ENEMY_TIERS[tier];
    const x = options.x ?? enemyData.x;
    const y = options.y ?? enemyData.y;
    const fromSky = options.fromSky ?? false;

    const texKey = enemyData.type === 'octopus'
      ? `enemy-${enemyData.type}-${tier}`
      : `enemy-${enemyData.type}`;
    const enemy = this.enemies.create(x, y, texKey) as Phaser.Physics.Arcade.Sprite;

    enemy.setData('type', enemyData.type);
    enemy.setData('tier', tier);
    enemy.setData('hp', tierData.hp);
    enemy.setData('speed', tierData.speed);
    enemy.setData('score', tierData.score);
    enemy.setData('patrolRange', enemyData.patrolRange || 100);
    enemy.setData('originX', x);
    enemy.setData('patrolDir', Phaser.Math.Between(0, 1) === 0 ? -1 : 1);
    enemy.setData('lastSlop', -Phaser.Math.Between(0, tierData.slopInterval));
    enemy.setData('slopInterval', tierData.slopInterval);
    enemy.setData('fireCount', 0);
    enemy.setCollideWorldBounds(true);

    if (enemyData.type === 'meanComment') {
      const body = enemy.body as Phaser.Physics.Arcade.Body;
      const initialSpeed = Math.max(120, tierData.speed * 1.4);
      const vx = (Phaser.Math.Between(0, 1) === 0 ? -1 : 1) * Phaser.Math.Between(initialSpeed - 20, initialSpeed + 40);
      const vy = fromSky
        ? Phaser.Math.Between(140, 220)
        : (Phaser.Math.Between(0, 1) === 0 ? -1 : 1) * Phaser.Math.Between(90, 180);
      body.allowGravity = false;
      enemy.setBounce(1, 1);
      enemy.setVelocity(vx, vy);
      enemy.setData('lastTrap', -Phaser.Math.Between(0, 1800));
      enemy.setData('trapInterval', tier === 'red' ? 1800 : 2400);
      enemy.setData('hoverMinY', 50);
      enemy.setData('hoverMaxY', GAME_HEIGHT - 110);
    } else if (enemyData.type === 'ventureCapitalist') {
      enemy.setData('slopInterval', Math.max(900, tierData.slopInterval - 700));
      enemy.setData('score', tierData.score + 15);
    } else if (enemyData.type === 'bciOctopus') {
      enemy.setData('hp', Math.max(2, tierData.hp));
      enemy.setData('score', tierData.score + 20);
      enemy.setData('brainWeakspot', true);
    } else if (enemyData.type === 'zuckerberg') {
      enemy.setData('hp', Math.max(2, tierData.hp));
      enemy.setData('speed', tierData.speed + 18);
      enemy.setData('score', tierData.score + 25);
      enemy.setData('stealReadyAt', 0);
    } else if (enemyData.type === 'waterWave' || enemyData.type === 'nuclearReactor' || enemyData.type === 'gasBottle') {
      const body = enemy.body as Phaser.Physics.Arcade.Body;
      body.allowGravity = false;
      enemy.setData('hp', enemyData.type === 'waterWave' ? 1 : 2);
      enemy.setData('speed', enemyData.type === 'waterWave' ? 210 : (enemyData.type === 'gasBottle' ? 235 : 185));
      enemy.setData('score', tierData.score + 30);
      enemy.setData('shockChaser', true);
      enemy.setData('shockDamage', enemyData.type === 'waterWave' ? 5 : 7);
      enemy.setData('hoverOffset', Phaser.Math.FloatBetween(0, Math.PI * 2));
      enemy.setData('patrolRange', 0);
    } else if (fromSky) {
      enemy.setVelocityY(Phaser.Math.Between(120, 220));
    }

    if (enemyData.type === 'octopus' && this.levelNum === 10) {
      enemy.setScale(1.5);
      enemy.setData('speed', tierData.speed + 28);
      enemy.setData('slopInterval', Math.max(700, tierData.slopInterval - 900));
      enemy.setData('airLeapCooldown', Phaser.Math.Between(1200, 2100));
      enemy.setData('lastAirLeap', -Phaser.Math.Between(0, 1600));
    }

    return enemy;
  }

  private spawnReinforcementWave(): void {
    if (!this.player?.active || this.bossDefeated) return;

    const candidates = this.config.enemies.filter((enemy) => enemy.type !== 'cloudflareWall');
    if (candidates.length === 0) return;

    const waveSize = 2;
    const left = Math.max(80, this.cameras.main.scrollX + 40);
    const right = Math.min(this.config.width - 80, this.cameras.main.scrollX + GAME_WIDTH - 40);

    for (let i = 0; i < waveSize; i++) {
      const template = Phaser.Utils.Array.GetRandom(candidates);
      const spawnX = Phaser.Math.Between(left, right);
      const spawnY = -70 - i * 40;
      this.spawnEnemy(template, { x: spawnX, y: spawnY, fromSky: true });
    }

    this.reinforcementWave++;
  }

  private updateEnemies(): void {
    this.enemies.getChildren().forEach((obj) => {
      const enemy = obj as Phaser.Physics.Arcade.Sprite;
      if (!enemy.active) return;
      if (enemy.getData('frozen')) return;
      if (enemy.getData('isBoss')) return;

      const speed = enemy.getData('speed') as number;
      const originX = enemy.getData('originX') as number;
      const patrolRange = enemy.getData('patrolRange') as number;
      let dir = enemy.getData('patrolDir') as number;

      // Patrol
      if (enemy.x > originX + patrolRange) dir = -1;
      else if (enemy.x < originX - patrolRange) dir = 1;
      enemy.setData('patrolDir', dir);

      const enemyType = enemy.getData('type') as string;

      // Signature enemies: paper-targeting behaviors
      if (enemyType === 'troll' || enemyType === 'influencer') {
        const pursuing = this.updateWalkToPaper(enemy, enemyType);
        // Only set patrol velocity if not actively pursuing a paper
        if (!pursuing) {
          enemy.setVelocityX(speed * dir);
        }
      } else if ((enemyType === 'waterWave' || enemyType === 'nuclearReactor' || enemyType === 'gasBottle') && this.player?.active) {
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        const chaseSpeed = speed + (enemyType === 'gasBottle' ? 30 : 0);
        enemy.setVelocity(
          Math.cos(angle) * chaseSpeed,
          Math.sin(angle) * chaseSpeed + Math.sin((this.time.now * 0.008) + (enemy.getData('hoverOffset') as number)) * 18
        );
      } else if (enemyType === 'parrot' || enemyType === 'paperFlood') {
        enemy.setVelocityX(speed * dir);
        // Ranged paper attack (alternating with player)
        this.updateRangedPaperAttack(enemy, enemyType);
      } else if (enemyType === 'meanComment') {
        this.updateMeanComment(enemy);
      } else if (enemyType === 'zuckerberg' && this.player?.active) {
        const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        if (distToPlayer < 460) {
          const chaseDir = this.player.x > enemy.x ? 1 : -1;
          enemy.setVelocityX(speed * 1.35 * chaseDir);
          const body = enemy.body as Phaser.Physics.Arcade.Body;
          const verticalGap = this.player.y - enemy.y;
          if (verticalGap < -40 && body.blocked.down) {
            body.setVelocityY(-220);
          }
        } else {
          enemy.setVelocityX(speed * dir);
        }
      } else if (enemyType === 'macII' && this.player?.active) {
        // Mac II: chase player when within 300px
        const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        if (distToPlayer < 300) {
          const chaseDir = this.player.x > enemy.x ? 1 : -1;
          enemy.setVelocityX(speed * 1.2 * chaseDir);
        } else {
          enemy.setVelocityX(speed * dir);
        }
      } else if (enemyType === 'octopus' && this.levelNum === 10 && this.player?.active) {
        const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        const chaseDir = this.player.x > enemy.x ? 1 : -1;
        const body = enemy.body as Phaser.Physics.Arcade.Body;
        enemy.setVelocityX(speed * chaseDir);
        const lastAirLeap = (enemy.getData('lastAirLeap') as number) || 0;
        const airLeapCooldown = (enemy.getData('airLeapCooldown') as number) || 1600;
        if (body.blocked.down && distToPlayer < 360 && this.time.now - lastAirLeap > airLeapCooldown) {
          body.setVelocityX(chaseDir * speed * 1.35);
          body.setVelocityY(-240);
          enemy.setData('lastAirLeap', this.time.now);
        }
      } else {
        enemy.setVelocityX(speed * dir);
      }

      // Throw slop at player (for enemies not handled by ranged paper attack)
      if (
        enemyType !== 'parrot'
        && enemyType !== 'paperFlood'
        && enemyType !== 'meanComment'
        && enemyType !== 'zuckerberg'
        && enemyType !== 'waterWave'
        && enemyType !== 'nuclearReactor'
        && enemyType !== 'gasBottle'
      ) {
        const now = this.time.now;
        const lastSlop = enemy.getData('lastSlop') as number;
        const slopInterval = enemy.getData('slopInterval') as number;

        if (now - lastSlop > slopInterval && this.player?.active) {
          const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
          const fireRange = enemyType === 'ventureCapitalist'
            ? 520
            : (enemyType === 'octopus' && this.levelNum === 9 ? 620 : (enemyType === 'octopus' && this.levelNum === 10 ? 560 : 400));
          const canFireLaterally = enemyType === 'octopus' && this.levelNum === 9
            ? Math.abs(enemy.y - this.player.y) < 85
            : true;
          if (dist < fireRange && canFireLaterally) {
            this.throwSlop(enemy);
            enemy.setData('lastSlop', now);
          }
        }
      }
    });

    // Update cloudflare shield visuals
    this.updateCloudflareShields();
  }

  private updateMeanComment(enemy: Phaser.Physics.Arcade.Sprite): void {
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    const now = this.time.now;
    const speed = enemy.getData('speed') as number;
    const minY = enemy.getData('hoverMinY') as number;
    const maxY = enemy.getData('hoverMaxY') as number;

    if (enemy.y < minY && body.velocity.y < 0) {
      body.setVelocityY(Math.abs(body.velocity.y));
    } else if (enemy.y > maxY && body.velocity.y > 0) {
      body.setVelocityY(-Math.abs(body.velocity.y));
    }

    const currentSpeed = Math.hypot(body.velocity.x, body.velocity.y);
    if (currentSpeed < speed * 1.1) {
      const vx = body.velocity.x === 0 ? speed : body.velocity.x;
      const vy = body.velocity.y === 0 ? speed : body.velocity.y;
      body.setVelocity(
        Phaser.Math.Clamp(vx * 1.03, -220, 220),
        Phaser.Math.Clamp(vy * 1.03, -220, 220)
      );
    }

    const lastTrap = (enemy.getData('lastTrap') as number) || 0;
    const trapInterval = (enemy.getData('trapInterval') as number) || 2200;
    if (now - lastTrap > trapInterval && this.player?.active) {
      this.fireMeanCommentTrap(enemy);
      enemy.setData('lastTrap', now);
    }
  }

  private fireMeanCommentTrap(enemy: Phaser.Physics.Arcade.Sprite): void {
    if (!this.player?.active) return;

    const trap = this.slopGroup.create(enemy.x, enemy.y, 'paper-projectile') as Phaser.Physics.Arcade.Sprite;
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    const speed = enemy.getData('tier') === 'red' ? 240 : 200;

    trap.setData('sourceType', 'meanCommentTrap');
    trap.body!.allowGravity = false;
    trap.setTint(0xff6666);
    trap.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.tweens.add({
      targets: trap,
      angle: 360,
      duration: 700,
      repeat: -1,
    });
    this.time.delayedCall(3500, () => {
      if (trap.active) trap.destroy();
    });
  }

  private updateHostileProjectiles(): void {
    if (!this.player?.active) return;

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.slopGroup.getChildren().forEach((obj) => {
      const projectile = obj as Phaser.Physics.Arcade.Sprite;
      if (!projectile.active) return;
      if (projectile.getData('sourceType') !== 'meanCommentTrap') return;

      const dx = projectile.x - this.player.x;
      const dy = projectile.y - this.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= 170 && dist > 0) {
        playerBody.setVelocity(
          playerBody.velocity.x + Phaser.Math.Clamp(dx * 0.05, -12, 12),
          playerBody.velocity.y + Phaser.Math.Clamp(dy * 0.03, -10, 10)
        );
      }
    });
  }

  private throwSlop(from: Phaser.Physics.Arcade.Sprite): void {
    const enemyType = from.getData('type') as string;
    if (enemyType === 'ventureCapitalist') {
      this.throwMoneyProjectile(from);
      return;
    }
    if (enemyType === 'octopus' && this.levelNum === 10) {
      this.throwDatacenterProjectile(from);
      return;
    }
    if (enemyType === 'octopus' && this.levelNum === 9) {
      this.throwPeaceProjectile(from);
      return;
    }

    const texture = enemyType === 'parrot' ? 'parrot-no' : 'slop-poop';
    const slop = this.slopGroup.create(from.x, from.y - 8, texture) as Phaser.Physics.Arcade.Sprite;
    slop.setData('sourceType', enemyType);

    // Check if enemy has a specific target (paper targeting)
    const slopTarget = from.getData('slopTarget') as { x: number; y: number } | null;
    let angle: number;
    if (slopTarget) {
      angle = Phaser.Math.Angle.Between(from.x, from.y, slopTarget.x, slopTarget.y);
      from.setData('slopTarget', null);
    } else {
      angle = Phaser.Math.Angle.Between(from.x, from.y, this.player.x, this.player.y);
    }

    const speed = 180;
    slop.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed - 50);
    slop.body!.allowGravity = true;
    this.time.delayedCall(3000, () => { if (slop.active) slop.destroy(); });
  }

  private throwMoneyProjectile(from: Phaser.Physics.Arcade.Sprite): void {
    if (!this.player?.active) return;

    const money = this.slopGroup.create(from.x, from.y - 10, 'money-projectile') as Phaser.Physics.Arcade.Sprite;
    money.setData('sourceType', 'ventureCapitalistMoney');
    const angle = Phaser.Math.Angle.Between(from.x, from.y, this.player.x, this.player.y);
    const spread = Phaser.Math.FloatBetween(-0.12, 0.12);
    const speed = 240;
    money.body!.allowGravity = false;
    money.setVelocity(Math.cos(angle + spread) * speed, Math.sin(angle + spread) * speed);
    this.tweens.add({
      targets: money,
      angle: 360,
      duration: 450,
      repeat: -1,
    });
    this.time.delayedCall(3200, () => {
      if (money.active) money.destroy();
    });
  }

  private throwPeaceProjectile(from: Phaser.Physics.Arcade.Sprite): void {
    const peace = this.slopGroup.create(from.x, from.y - 10, 'peace-projectile') as Phaser.Physics.Arcade.Sprite;
    const dir = this.player.x >= from.x ? 1 : -1;
    peace.setData('sourceType', 'peaceSign');
    peace.body!.allowGravity = false;
    peace.setVelocity(dir * 260, 0);
    peace.setAngularVelocity(dir * 140);
    this.time.delayedCall(2600, () => {
      if (peace.active) peace.destroy();
    });
  }

  private throwDatacenterProjectile(from: Phaser.Physics.Arcade.Sprite): void {
    if (!this.player?.active) return;

    const texture = this.textures.exists('datacenter-projectile') ? 'datacenter-projectile' : 'boss-projectile';
    const shot = this.slopGroup.create(from.x, from.y - 14, texture) as Phaser.Physics.Arcade.Sprite;
    const body = from.body as Phaser.Physics.Arcade.Body;
    const aimY = body.velocity.y < -30 ? this.player.y + 26 : this.player.y - 8;
    const angle = Phaser.Math.Angle.Between(from.x, from.y - 14, this.player.x, aimY);
    shot.setData('sourceType', 'datacenterOctopus');
    shot.body!.allowGravity = false;
    shot.setVelocity(Math.cos(angle) * 270, Math.sin(angle) * 270);
    shot.setAngularVelocity(from.flipX ? -220 : 220);
    this.time.delayedCall(2600, () => {
      if (shot.active) shot.destroy();
    });
  }

  private throwMacBomb(from: Phaser.Physics.Arcade.Sprite): void {
    const bomb = this.slopGroup.create(from.x, from.y - 8, 'mac-bomb') as Phaser.Physics.Arcade.Sprite;
    const angle = Phaser.Math.Angle.Between(from.x, from.y, this.player.x, this.player.y);
    const speed = 200;
    bomb.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed - 40);
    bomb.body!.allowGravity = true;
    this.time.delayedCall(3000, () => { if (bomb.active) bomb.destroy(); });
  }

  // ── Enemy paper-targeting systems ──

  private slopHitPaper(slop: any, paper: any): void {
    const s = slop as Phaser.Physics.Arcade.Sprite;
    const p = paper as Phaser.Physics.Arcade.Sprite;
    const sourceType = s.getData('sourceType') as string;

    if (sourceType === 'parrot') {
      s.destroy();
      this.destroyPaperByEnemy(p, 0x0085FF); // Bluesky blue particles
    } else if (sourceType === 'paperFlood') {
      s.destroy();
      if (!p.getData('contaminated')) {
        p.setData('contaminated', true);
        p.setTint(0x666666);
        p.setAlpha(0.7);
      }
    }
    // Other enemy slop that hits papers: just destroy the slop, leave paper alone
    else {
      s.destroy();
    }
  }

  private destroyPaperByEnemy(paper: Phaser.Physics.Arcade.Sprite, particleColor: number = 0xff0000): void {
    this.spawnParticles(paper.x, paper.y, particleColor, 6);
    paper.destroy();
    // Papers destroyed by enemies are gone permanently — real stakes
  }

  private updateWalkToPaper(enemy: Phaser.Physics.Arcade.Sprite, type: string): boolean {
    // Find nearest active, unshielded paper within 400px
    let nearest: Phaser.Physics.Arcade.Sprite | null = null;
    let nearestDist = 400;

    this.papers.getChildren().forEach((obj) => {
      const paper = obj as Phaser.Physics.Arcade.Sprite;
      if (!paper.active) return;
      if (this.isPaperShielded(paper)) return;
      const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, paper.x, paper.y);
      if (dist < nearestDist) {
        nearest = paper;
        nearestDist = dist;
      }
    });

    if (!nearest) {
      // No paper in range: clear any countdown, resume patrol
      enemy.setData('targetPaper', null);
      enemy.setData('paperCountdown', 0);
      return false;
    }

    const paper = nearest as Phaser.Physics.Arcade.Sprite;
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    const speed = enemy.getData('speed') as number;
    const paperAbove = paper.y < enemy.y - 20;

    if (paperAbove && body.blocked.down) {
      // Paper is on a higher platform — find a reachable stepping-stone platform
      // Max jump height with v=-350, g=600: ~102px. Use 100px as safe limit.
      let bestPlat: { x: number; y: number } | null = null;
      let bestScore = Infinity;

      this.platforms.getChildren().forEach((obj) => {
        const plat = obj as Phaser.Physics.Arcade.Sprite;
        const platTop = plat.y - 8; // standing surface
        const heightAbove = enemy.y - platTop;
        // Must be above us (>15px) and within jump reach (<200px)
        if (heightAbove < 15 || heightAbove > 200) return;
        // Must be horizontally reachable during a jump arc (~120px)
        if (Math.abs(plat.x - enemy.x) > 120) return;
        // Score: prefer the platform that brings us closest to the paper
        const distToPaper = Phaser.Math.Distance.Between(plat.x, platTop, paper.x, paper.y);
        if (distToPaper < bestScore) {
          bestScore = distToPaper;
          bestPlat = { x: plat.x, y: platTop };
        }
      });

      if (bestPlat) {
        // Walk toward the target platform
        const platDir = bestPlat.x > enemy.x ? 1 : -1;
        enemy.setVelocityX(speed * platDir);
        // Jump when roughly underneath (within 30px)
        if (Math.abs(enemy.x - bestPlat.x) < 30) {
          enemy.setVelocityY(-500);
        }
      } else {
        // No stepping-stone found — walk toward paper and jump to try
        const walkDir = paper.x > enemy.x ? 1 : -1;
        enemy.setVelocityX(speed * walkDir);
        enemy.setVelocityY(-350);
      }
    } else {
      // Paper is at same height or we're mid-air — walk directly toward it
      const walkDir = paper.x > enemy.x ? 1 : -1;
      enemy.setVelocityX(speed * walkDir * 0.8);

      // Jump if blocked horizontally while walking
      if (body.blocked.down) {
        const blockedH = (walkDir > 0 && body.blocked.right) || (walkDir < 0 && body.blocked.left);
        if (blockedH) {
          enemy.setVelocityY(-500);
        }
      }
    }

    // Check contact (within 24px — accounts for float tween drift)
    if (nearestDist < 24) {
      const currentTarget = enemy.getData('targetPaper');
      if (currentTarget !== paper) {
        // Start countdown
        enemy.setData('targetPaper', paper);
        enemy.setData('paperCountdown', this.time.now);
        const countdownKey = type === 'troll' ? 'beingRatioed' : 'beingReposted';
        paper.setData(countdownKey, true);
      }

      // Check countdown elapsed
      const startTime = enemy.getData('paperCountdown') as number;
      const duration = type === 'troll' ? 3000 : 4000;
      const elapsed = this.time.now - startTime;

      // Visual pulse: tint paper
      const tintColor = type === 'troll' ? 0xff4444 : 0x0A66C2;
      const pulse = Math.sin(elapsed * 0.008) > 0;
      if (pulse) {
        paper.setTint(tintColor);
      } else {
        paper.clearTint();
      }

      if (elapsed >= duration) {
        // Paper destroyed
        const particleColor = type === 'troll' ? 0xff4444 : 0x0A66C2;
        this.destroyPaperByEnemy(paper, particleColor);
        enemy.setData('targetPaper', null);
        enemy.setData('paperCountdown', 0);
      }
    }

    return true; // Actively pursuing a paper
  }

  private updateRangedPaperAttack(enemy: Phaser.Physics.Arcade.Sprite, _type: string): void {
    // Strict alternation: odd fires → paper, even fires → player
    const now = this.time.now;
    const lastSlop = enemy.getData('lastSlop') as number;
    const slopInterval = enemy.getData('slopInterval') as number;
    if (now - lastSlop < slopInterval) return;

    const fireCount = (enemy.getData('fireCount') as number) || 0;
    const targetPaper = fireCount % 2 === 0; // even = paper, odd = player

    if (targetPaper) {
      // Find nearest paper within 400px
      let nearest: Phaser.Physics.Arcade.Sprite | null = null;
      let nearestDist = 400;

      this.papers.getChildren().forEach((obj) => {
        const paper = obj as Phaser.Physics.Arcade.Sprite;
        if (!paper.active) return;
        const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, paper.x, paper.y);
        if (dist < nearestDist) {
          nearest = paper;
          nearestDist = dist;
        }
      });

      if (nearest) {
        const paper = nearest as Phaser.Physics.Arcade.Sprite;
        enemy.setData('slopTarget', { x: paper.x, y: paper.y });
        this.throwSlop(enemy);
        enemy.setData('lastSlop', now);
        enemy.setData('fireCount', fireCount + 1);
        return;
      }
      // No paper found — fall through to fire at player
    }

    // Fire at player
    if (this.player?.active) {
      const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      if (dist < 400) {
        this.throwSlop(enemy);
        enemy.setData('lastSlop', now);
      }
    }
    enemy.setData('fireCount', fireCount + 1);
  }

  private updateCloudflareShields(): void {
    // Update paper tints based on cloudflare wall proximity
    this.papers.getChildren().forEach((obj) => {
      const paper = obj as Phaser.Physics.Arcade.Sprite;
      if (!paper.active) return;
      if (paper.getData('contaminated')) return; // Don't override contamination visual
      if (paper.getData('beingRatioed') || paper.getData('beingReposted')) return; // Don't override countdown visual

      if (this.isPaperShielded(paper)) {
        paper.setTint(0xff8c00); // Orange tint for paywalled
      } else {
        paper.clearTint();
        // Restore gold tint if applicable
        if (paper.getData('isGold')) {
          // Gold papers don't have a tint — their texture is already gold
        }
      }
    });
  }

  private spawnPapers(): void {
    this.config.papers.forEach(p => {
      const key = p.isGold ? 'paper-gold' : 'paper';
      const paper = this.papers.create(p.x, p.y, key) as Phaser.Physics.Arcade.Sprite;
      paper.body!.allowGravity = false;
      paper.setData('isGold', !!p.isGold);
      paper.setData('origX', p.x);
      paper.setData('origY', p.y);
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
      ssi: 'pu-ssi', deepseek: 'pu-deepseek', nvidia: 'pu-nvidia',
      clippy: 'pd-clippy', fogCloud: 'pd-fog', grok: 'pd-grok', dataLeak: 'pd-leak',
      copilot: 'pd-copilot', meta: 'pd-meta', qwen: 'pd-qwen', openclaw: 'pd-openclaw', apple: 'pd-apple',
      goldenGate: 'pu-goldenGate',
    };
    const spawnPickup = (x: number, y: number, type: string) => {
      const tex = textureMap[type] || 'pu-shield';
      const item = this.powerUps.create(x, y, tex) as Phaser.Physics.Arcade.Sprite;
      item.body!.allowGravity = false;
      item.setData('puType', type);
      this.tweens.add({
        targets: item,
        y: y - 4,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    };

    const fixedTypes = new Set(['goldenGate']);
    const fixedSpawns = this.config.powerUps.filter((powerUp) => fixedTypes.has(powerUp.type));
    const flexiblePositions = this.config.powerUps.filter((powerUp) => !fixedTypes.has(powerUp.type));

    // Randomize power-up types across positions
    const allTypes: string[] = [
      'shield', 'openai', 'speedBolt', 'ssi', 'deepseek', 'nvidia',
      'clippy', 'fogCloud', 'grok', 'dataLeak', 'copilot', 'meta', 'qwen', 'openclaw', 'apple',
    ];
    const positions = flexiblePositions.map((p) => ({ x: p.x, y: p.y }));
    const count = positions.length;

    // Build randomized type list with constraints
    const types: string[] = [];
    const remaining = [...allTypes];

    // Guarantee useful and requested pickups in every level
    ['shield', 'deepseek', 'nvidia', 'apple'].forEach((type) => {
      if (types.length < count) {
        types.push(type);
        const idx = remaining.indexOf(type);
        if (idx >= 0) remaining.splice(idx, 1);
      }
    });

    // Fill remaining slots from shuffled pool
    while (types.length < count) {
      if (remaining.length === 0) {
        // Reset pool if we need more than the current pool size
        remaining.push(...allTypes);
      }
      const idx = Phaser.Math.Between(0, remaining.length - 1);
      const pick = remaining.splice(idx, 1)[0];
      // No qwen (instant death) in L1 or L2
      if (pick === 'qwen' && this.levelNum <= 2) continue;
      types.push(pick);
    }

    // Shuffle the types array
    for (let i = types.length - 1; i > 0; i--) {
      const j = Phaser.Math.Between(0, i);
      [types[i], types[j]] = [types[j], types[i]];
    }

    positions.forEach((pos, i) => {
      spawnPickup(pos.x, pos.y, types[i]);
    });

    fixedSpawns.forEach((powerUp) => {
      spawnPickup(powerUp.x, powerUp.y, powerUp.type);
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
    const bossSize = BOSS_SIZES[bc.type] || 96;

    // Most bosses spawn near ground; flying bosses start high.
    const bossY = bc.type === 'bernie' ? 140 : GAME_HEIGHT - 8 - (bossSize / 2);
    this.boss = this.enemies.create(bc.x, bossY, texKey) as Phaser.Physics.Arcade.Sprite;
    this.boss.setCollideWorldBounds(true);
    if (bc.type === 'bernie') {
      this.boss.body!.allowGravity = false;
    }

    // Orbital particles for L1 boss
    if (this.levelNum === 1) {
      const orbRadius = bossSize * 0.5;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const orb = this.add.circle(
          bc.x + Math.cos(angle) * orbRadius,
          bossY + Math.sin(angle) * orbRadius,
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
              this.boss.x + Math.cos(orbData.angle) * orbRadius,
              this.boss.y + Math.sin(orbData.angle) * orbRadius
            );
          },
        });
      }
    }
    this.bossType = bc.type;
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

  private canCollectPaper(_player: any, paper: any): boolean {
    const p = paper as Phaser.Physics.Arcade.Sprite;
    if (this.isPaperShielded(p)) {
      // Show "PAYWALLED" flash on first rejection
      if (!p.getData('paywallFlashed')) {
        p.setData('paywallFlashed', true);
        const flash = this.add.text(p.x, p.y - 20, 'PAYWALLED', {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '8px',
          color: '#ff8c00',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 2,
        }).setOrigin(0.5).setDepth(50);
        this.tweens.add({
          targets: flash,
          y: p.y - 50,
          alpha: 0,
          duration: 1500,
          onComplete: () => {
            flash.destroy();
            if (p.active) p.setData('paywallFlashed', false);
          },
        });
      }
      return false;
    }
    return true;
  }

  private isPaperShielded(paper: Phaser.Physics.Arcade.Sprite): boolean {
    let shielded = false;
    this.enemies.getChildren().forEach((obj) => {
      const enemy = obj as Phaser.Physics.Arcade.Sprite;
      if (!enemy.active) return;
      if (enemy.getData('type') !== 'cloudflareWall') return;
      const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, paper.x, paper.y);
      if (dist < 150) shielded = true;
    });
    return shielded;
  }

  private collectPaper(_player: any, paper: any): void {
    const p = paper as Phaser.Physics.Arcade.Sprite;
    const isBlueCheck = p.getData('isBlueCheck');
    const isContaminated = p.getData('contaminated');
    const isGold = p.getData('isGold');
    const isFake = p.getData('isFakePaper');

    // Fake papers from Paper Mill boss explode on touch
    if (isFake) {
      p.destroy();
      this.spawnParticles(p.x, p.y, 0xff4444, 10);
      this.cameras.main.shake(200, 0.01);
      if (!this.invincible) {
        this.takeDamage(BOSS_FAKE_PAPER_DAMAGE);
      }
      return;
    }

    p.destroy();

    if (isContaminated) {
      // Contaminated: ammo only, no score, no heal
      this.paperAmmo += PAPER_AMMO_PER_COLLECT;
      this.emitHUDUpdate();
      audioEngine.playSFX('collect');
      this.spawnParticles(p.x, p.y, 0x666666, 5);
      return;
    }

    // Track gold paper collection for range bonus
    if (isGold) {
      this.goldPapersCollected++;
    }

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

    const isPowerDown = ['clippy', 'fogCloud', 'grok', 'dataLeak', 'copilot', 'meta', 'qwen', 'openclaw', 'apple'].includes(type);
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
              this.setPlayerVisual(`minty-${col}`);
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
          this.setPlayerVisual('minty-teal');
          this.activeEffects.delete(type);
        }));
        break;
      case 'openai':
        // Scale ×3
        this.resizePlayerVisual(3);
        this.activeEffects.set(type, this.time.delayedCall(POWERUP_DURATION.openai, () => {
          this.resizePlayerVisual();
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
      case 'nvidia':
        this.playerHealth = PLAYER_MAX_HEALTH;
        this.emitHUDUpdate();
        this.spawnParticles(this.player.x, this.player.y, 0x76b900, 16);
        this.showStatusBanner('INTEGRITY RESTORED', '#a3e635');
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
          this.physics.add.overlap(swarmMinty, this.enemies, (_swarm, enemy) => {
            const e = enemy as Phaser.Physics.Arcade.Sprite;
            if (!e.active) return;
            if (e.getData('isBoss')) return;
            this.killEnemy(e);
            swarmMinty.setVelocity(
              -swarmMinty.body!.velocity.x,
              -swarmMinty.body!.velocity.y
            );
          }, undefined, this);
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
          this.setPlayerVisual('minty-bandage', 1, false);
          this.time.delayedCall(5000, () => {
            if (this.player?.active) this.setPlayerVisual('minty-teal');
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
          this.physics.add.overlap(this.player, lobster, () => {
            if (this.invincible || !this.player?.active) return;
            this.takeDamage(Math.ceil(CONTACT_DAMAGE / 2));
            const dir = this.player.x < lobster.x ? -1 : 1;
            this.player.setVelocity(dir * 120, -80);
          }, undefined, this);
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
      case 'goldenGate':
        this.startGoldenGateRide();
        break;
      case 'apple':
        this.startAppleMeltdown();
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
          proj.setData('sourceKind', 'clawd');
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
    const e = enemy as Phaser.Physics.Arcade.Sprite;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const enemyBody = e.body as Phaser.Physics.Arcade.Body;
    const enemyType = e.getData('type') as string;

    // Stomp check uses physics bodies so texture swaps and scaled enemies stay consistent.
    const playerBottom = body.position.y + body.height;
    const enemyTop = enemyBody.position.y;
    const stompWindow = Math.max(12, enemyBody.height * 0.35);
    if (this.time.now >= this.stompGraceUntil && body.velocity.y > 0 && playerBottom <= enemyTop + stompWindow) {
      // Stomp! 1 damage + bounce
      this.stompGraceUntil = this.time.now + 180;
      const stompDamage = enemyType === 'bciOctopus'
        ? Math.max(1, e.getData('hp') as number)
        : 1;
      this.damageEnemy(e, stompDamage, 'stomp');
      this.player.y = enemyTop - (body.height / 2) + 4;
      body.setVelocityY(-280);
      audioEngine.playSFX('jump');
      return;
    }

    if (this.invincible || this.time.now < this.stompGraceUntil) return;

    if (enemyType === 'zuckerberg') {
      const readyAt = (e.getData('stealReadyAt') as number) || 0;
      if (this.time.now >= readyAt) {
        const stolen = Math.min(3, this.papersCollected);
        if (stolen > 0) {
          this.papersCollected -= stolen;
          this.score = Math.max(0, this.score - stolen * PAPER_SCORE);
          this.emitHUDUpdate();
          const theft = this.add.text(this.player.x, this.player.y - 32, `-${stolen} PAPERS`, {
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '9px',
            color: '#ff9416',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2,
          }).setOrigin(0.5).setDepth(60);
          this.tweens.add({
            targets: theft,
            y: theft.y - 24,
            alpha: 0,
            duration: 1000,
            onComplete: () => theft.destroy(),
          });
        }
        e.setData('stealReadyAt', this.time.now + 3000);
      }
      const dir = this.player.x < e.x ? -1 : 1;
      this.player.setVelocity(dir * 180, -120);
      audioEngine.playSFX('hit');
      return;
    }

    if (enemyType === 'waterWave' || enemyType === 'nuclearReactor' || enemyType === 'gasBottle') {
      this.addShockSource(e);
      audioEngine.playSFX('hit');
      this.takeDamage((e.getData('shockDamage') as number) || Math.ceil(CONTACT_DAMAGE / 2));
      const dir = this.player.x < e.x ? -1 : 1;
      this.player.setVelocity(dir * 220, -120);
      return;
    }

    // Normal contact damage + knockback
    audioEngine.playSFX('hit');
    this.takeDamage(CONTACT_DAMAGE);
    const dir = this.player.x < e.x ? -1 : 1;
    this.player.setVelocity(dir * 200, -150);
  }

  private hitBySlop(_player: any, slop: any): void {
    const s = slop as Phaser.Physics.Arcade.Sprite;
    const sourceType = s.getData('sourceType') as string;

    if (sourceType === 'meanCommentTrap') {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      const dx = s.x - this.player.x;
      const dy = s.y - this.player.y;
      body.setVelocity(
        body.velocity.x + Phaser.Math.Clamp(dx * 1.6, -200, 200),
        body.velocity.y + Phaser.Math.Clamp(dy * 1.2, -140, 140)
      );
      s.destroy();
      return;
    }

    if (sourceType === 'ventureCapitalistMoney') {
      s.destroy();
      if (this.invincible) return;
      this.cameras.main.flash(80, 255, 245, 180);
      this.takeDamage(SLOP_DAMAGE);
      return;
    }

    if (sourceType === 'pauseGlue') {
      s.destroy();
      if (this.invincible) return;
      this.applyGlueDebuff();
      this.takeDamage(Math.ceil(SLOP_DAMAGE / 2));
      return;
    }

    if (sourceType === 'datacenterOctopus') {
      s.destroy();
      if (this.invincible) return;
      this.takeDamage(SLOP_DAMAGE + 5);
      return;
    }

    if (this.invincible) return;
    s.destroy();
    this.takeDamage(SLOP_DAMAGE);
  }

  private paperHitEnemy(projectile: any, enemy: any): void {
    const p = projectile as Phaser.Physics.Arcade.Sprite;
    const e = enemy as Phaser.Physics.Arcade.Sprite;
    const damage = (p.getData('damage') as number) || 1;
    const sourceKind = (p.getData('sourceKind') as string) || 'paper';

    if (e.getData('isBoss') && e.getData('type') === 'angryNeckbeard' && sourceKind === 'paper') {
      this.reflectPaperAtPlayer(p, e);
      return;
    }

    p.destroy();
    this.damageEnemy(e, damage, sourceKind === 'clawd' ? 'clawd' : 'projectile');
  }

  /** Shared enemy damage logic used by stomp, paper hit, and Clawd hit */
  private damageEnemy(e: Phaser.Physics.Arcade.Sprite, damage: number, source: 'stomp' | 'projectile' | 'clawd' = 'projectile'): void {
    // Boss invincibility check
    if (e.getData('isBoss') && this.bossInvincible) return;
    if (e.getData('isBoss') && e.getData('type') === 'angryNeckbeard' && source !== 'stomp') {
      e.setTint(0xffffff);
      this.time.delayedCall(80, () => { if (e.active) e.clearTint(); });
      return;
    }

    const currentHp = e.getData('hp') as number;
    const appliedDamage = e.getData('type') === 'bciOctopus' && source === 'stomp'
      ? currentHp
      : damage;
    const hp = currentHp - appliedDamage;
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
    this.removeShockSource(e);
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
      // Kill any boss clones
      this.bossClones.forEach(c => { if (c.active) c.destroy(); });
      this.bossClones = [];
      this.fsm.setState('victory');
    } else if (e.getData('isBossClone')) {
      // Clones don't trigger victory
      this.spawnParticles(e.x, e.y, this.config.themeColor, 10);
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

    // Bandage visual after being hit
    this.setPlayerVisual('minty-bandage');
    this.time.delayedCall(5000, () => {
      if (this.player?.active && !this.invincible) {
        this.setPlayerVisual('minty-teal');
      }
    });

    if (this.playerHealth <= 0) {
      this.clearShockSources();
      this.endGoldenGateRide(true);
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
    this.endGoldenGateRide(true);
    this.clearShockSources();

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
    // Handle envelop state separately
    if (this.enveloped) {
      this.updateEnvelop();
      return;
    }

    this.updatePlaying(_dt);

    if (!this.boss?.active) return;
    if (this.bossInvincible) return;

    this.bossHealth = this.boss.getData('hp') as number;
    const now = this.time.now;
    const phases = this.boss.getData('phases') as number;
    const maxHp = this.boss.getData('maxHp') as number;
    const newPhase = Math.floor((1 - this.bossHealth / maxHp) * phases);
    const currentPhase = this.boss.getData('currentPhase') as number;

    // Phase transition
    if (newPhase > currentPhase) {
      this.boss.setData('currentPhase', newPhase);
      this.bossPhase = newPhase;
      this.cameras.main.flash(200, 255, 255, 255);
      // Boss invincible during transition
      this.bossInvincible = true;
      this.time.addEvent({
        delay: 100,
        repeat: 14,
        callback: () => {
          if (this.boss?.active) {
            this.boss.setAlpha(this.boss.alpha < 0.8 ? 1 : 0.3);
          }
        },
      });
      this.time.delayedCall(1500, () => {
        this.bossInvincible = false;
        if (this.boss?.active) this.boss.setAlpha(1);
      });
      // Speed increase per phase
      const speed = this.boss.getData('speed') as number;
      this.boss.setData('speed', speed * 1.15);
    }

    // Dispatch to per-boss update
    switch (this.bossType) {
      case 'algorithmVortex': this.updateBossVortex(now); break;
      case 'engagementKing': this.updateBossEngagement(now); break;
      case 'forkSwarm': this.updateBossFork(now); break;
      case 'paperMill': this.updateBossPaperMill(now); break;
      case 'theVoid': this.updateBossVoid(now); break;
      case 'shoggoth': this.updateBossShoggoth(now); break;
      case 'angryNeckbeard': this.updateBossNeckbeard(now); break;
      case 'schmidhuber': this.updateBossSchmidhuber(now); break;
      case 'pauseSign': this.updateBossPauseSign(now); break;
      case 'bernie': this.updateBossBernie(now); break;
    }

    // Update boss health bar in HUD
    this.emitBossHealthUpdate();
  }

  // ── L1 Boss: Algorithm Vortex — "The Pull" ──
  private updateBossVortex(now: number): void {
    if (!this.boss?.active || !this.player?.active) return;
    const phase = this.boss.getData('currentPhase') as number;
    const pullInterval = [6000, 4000, 2000][phase] || 2000;

    // Pull player toward boss periodically
    if (now - this.bossLastSpecial > pullInterval) {
      this.bossLastSpecial = now;
      // Apply pull force for 1.5s
      const pullTimer = this.time.addEvent({
        delay: 50,
        repeat: 29, // 1.5s
        callback: () => {
          if (!this.boss?.active || !this.player?.active) return;
          const dir = this.boss.x > this.player.x ? 1 : -1;
          const body = this.player.body as Phaser.Physics.Arcade.Body;
          body.setVelocityX(body.velocity.x + dir * 8);
        },
      });
    }

    // Fire fan of 3 projectiles
    const fireInterval = Math.max(800, 1200 - phase * 200);
    if (now - this.bossLastAttack > fireInterval) {
      this.bossLastAttack = now;
      for (let i = -1; i <= 1; i++) {
        this.throwBossProjectile('boss-projectile', this.boss.x, this.boss.y,
          this.player.x + i * 60, this.player.y, 200);
      }
      this.cameras.main.shake(60, 0.004);
    }
  }

  // ── L2 Boss: Engagement King — "Head Bounce" ──
  private updateBossEngagement(now: number): void {
    if (!this.boss?.active || !this.player?.active) return;
    const phase = this.boss.getData('currentPhase') as number;
    const jumpInterval = [5000, 3500, 2500][phase] || 2500;

    // Jump attack
    if (now - this.bossLastSpecial > jumpInterval) {
      this.bossLastSpecial = now;
      this.bossJumpAttack();
    }

    // Fire single targeted shots
    const fireInterval = Math.max(600, 1000 - phase * 150);
    if (now - this.bossLastAttack > fireInterval) {
      this.bossLastAttack = now;
      this.throwBossProjectile('boss-projectile', this.boss.x, this.boss.y,
        this.player.x, this.player.y, 220);
    }

    // Phase 2+: spawn minion endorsers
    if (phase >= 2 && now - this.bossLastSpecial > jumpInterval * 0.5) {
      // Check if we already spawned minions this phase transition
      if (!this.boss.getData('minionsSpawned_' + phase)) {
        this.boss.setData('minionsSpawned_' + phase, true);
        for (let i = 0; i < 2; i++) {
          const mx = this.boss.x + (i === 0 ? -60 : 60);
          const minion = this.enemies.create(mx, this.boss.y, 'enemy-octopus-peach') as Phaser.Physics.Arcade.Sprite;
          minion.setData('type', 'octopus');
          minion.setData('tier', 'peach');
          minion.setData('hp', 3);
          minion.setData('speed', 50);
          minion.setData('score', 25);
          minion.setData('patrolRange', 80);
          minion.setData('originX', mx);
          minion.setData('patrolDir', i === 0 ? -1 : 1);
          minion.setData('lastSlop', now);
          minion.setData('slopInterval', 2000);
          minion.setCollideWorldBounds(true);
        }
      }
    }
  }

  private bossJumpAttack(): void {
    if (!this.boss?.active || !this.player?.active) return;
    const body = this.boss.body as Phaser.Physics.Arcade.Body;
    // Jump high
    body.setVelocityY(-400);
    // Track player X mid-air
    const trackTimer = this.time.addEvent({
      delay: 50,
      repeat: 15,
      callback: () => {
        if (!this.boss?.active || !this.player?.active) return;
        const bBody = this.boss.body as Phaser.Physics.Arcade.Body;
        if (bBody.velocity.y < 0) {
          // Moving up — track player X
          const dir = this.player.x > this.boss.x ? 1 : -1;
          bBody.setVelocityX(dir * 120);
        }
      },
    });
    // Landing shockwave
    this.time.delayedCall(1200, () => {
      if (!this.boss?.active || !this.player?.active) return;
      this.cameras.main.shake(200, 0.015);
      // Shockwave damage check
      const dist = Math.abs(this.player.x - this.boss!.x);
      if (dist < BOSS_SHOCKWAVE_RANGE && !this.invincible) {
        this.takeDamage(BOSS_JUMP_DAMAGE);
      }
      this.spawnParticles(this.boss!.x, this.boss!.y + 30, 0xffffff, 8);
    });
  }

  // ── L3 Boss: Fork Swarm — "The Splitter" ──
  private updateBossFork(now: number): void {
    if (!this.boss?.active || !this.player?.active) return;
    const phase = this.boss.getData('currentPhase') as number;

    // Spawn clones at 66% and 33% HP
    const hp = this.boss.getData('hp') as number;
    const maxHp = this.boss.getData('maxHp') as number;
    const hpPct = hp / maxHp;
    if (hpPct <= 0.66 && !this.boss.getData('clone1')) {
      this.boss.setData('clone1', true);
      this.spawnBossClone();
    }
    if (hpPct <= 0.33 && !this.boss.getData('clone2')) {
      this.boss.setData('clone2', true);
      this.spawnBossClone();
    }

    // Fire projectiles that split
    const fireInterval = Math.max(600, 1000 - phase * 150);
    if (now - this.bossLastAttack > fireInterval) {
      this.bossLastAttack = now;
      this.throwBossProjectile('boss-projectile', this.boss.x, this.boss.y,
        this.player.x, this.player.y, 180);
    }

    // Move boss toward player slowly
    const speed = this.boss.getData('speed') as number;
    const dir = this.player.x > this.boss.x ? 1 : -1;
    this.boss.setVelocityX(speed * 0.5 * dir);
  }

  private spawnBossClone(): void {
    if (!this.boss?.active) return;
    const cx = this.boss.x + Phaser.Math.Between(-80, 80);
    const clone = this.enemies.create(cx, this.boss.y, `boss-${this.bossType}`) as Phaser.Physics.Arcade.Sprite;
    clone.setScale(0.5);
    clone.setData('isBossClone', true);
    clone.setData('type', this.bossType);
    clone.setData('hp', 4);
    clone.setData('maxHp', 4);
    clone.setData('score', 100);
    clone.setData('speed', 80);
    clone.setData('patrolRange', 100);
    clone.setData('originX', cx);
    clone.setData('patrolDir', 1);
    clone.setData('lastSlop', 0);
    clone.setData('slopInterval', 2000);
    clone.setData('tier', 'orange');
    clone.setCollideWorldBounds(true);
    this.bossClones.push(clone);
    this.spawnParticles(cx, this.boss.y, 0x0085FF, 8);
  }

  // ── L4 Boss: Paper Mill — "The Grinder" ──
  private updateBossPaperMill(now: number): void {
    if (!this.boss?.active || !this.player?.active) return;
    const phase = this.boss.getData('currentPhase') as number;
    const vacuumInterval = [4000, 3000, 2000, 1500][phase] || 1500;

    // Vacuum nearby papers
    if (now - this.bossLastSpecial > vacuumInterval) {
      this.bossLastSpecial = now;
      this.bossPaperVacuum();
    }

    // Spawn fake grey papers periodically
    if (now - this.bossLastAttack > 3000) {
      this.bossLastAttack = now;
      const fx = this.player.x + Phaser.Math.Between(-100, 100);
      const fy = this.player.y - Phaser.Math.Between(40, 80);
      const fakePaper = this.papers.create(fx, fy, 'paper') as Phaser.Physics.Arcade.Sprite;
      fakePaper.body!.allowGravity = false;
      fakePaper.setTint(0x666666);
      fakePaper.setData('isFakePaper', true);
      fakePaper.setData('isGold', false);
      this.tweens.add({
        targets: fakePaper,
        y: fy - 6,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Slow pursuit
    const speed = this.boss.getData('speed') as number;
    const dir = this.player.x > this.boss.x ? 1 : -1;
    this.boss.setVelocityX(speed * 0.4 * dir);
  }

  private bossPaperVacuum(): void {
    if (!this.boss?.active) return;
    // Find uncollected papers within vacuum range
    this.papers.getChildren().forEach((obj) => {
      const paper = obj as Phaser.Physics.Arcade.Sprite;
      if (!paper.active) return;
      const dist = Phaser.Math.Distance.Between(this.boss!.x, this.boss!.y, paper.x, paper.y);
      if (dist < BOSS_VACUUM_RANGE) {
        // Vacuum animation — paper flies toward boss
        this.tweens.add({
          targets: paper,
          x: this.boss!.x,
          y: this.boss!.y,
          duration: 400,
          onComplete: () => {
            if (!paper.active) return;
            this.spawnParticles(paper.x, paper.y, 0xB31B1B, 4);
            paper.destroy();
            // Boss fires consumed paper back at player
            if (this.player?.active && this.boss?.active) {
              this.throwBossProjectile('paper-projectile', this.boss.x, this.boss.y,
                this.player.x, this.player.y, 300);
            }
          },
        });
      }
    });
  }

  // ── L5 Boss: The Void — "The Enveloper" ──
  private updateBossVoid(now: number): void {
    if (!this.boss?.active || !this.player?.active) return;
    const phase = this.boss.getData('currentPhase') as number;
    const teleportInterval = [5000, 3000, 2000][phase] || 2000;
    const envelopInterval = [12000, 9000, 7000][phase] || 7000;

    // Teleport
    if (now - this.bossLastSpecial > teleportInterval) {
      this.bossLastSpecial = now;
      // Fade out
      this.tweens.add({
        targets: this.boss,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          if (!this.boss?.active || !this.player?.active) return;
          // Reappear within 300px of player
          const nx = this.player.x + Phaser.Math.Between(-300, 300);
          const ny = GAME_HEIGHT - 8 - (BOSS_SIZES['theVoid'] / 2);
          this.boss.setPosition(
            Phaser.Math.Clamp(nx, 50, this.config.width - 50),
            ny
          );
          this.tweens.add({
            targets: this.boss,
            alpha: 1,
            duration: 300,
          });
        },
      });
    }

    // Fire bursts of 5 slow homing void tendrils
    if (now - this.bossLastAttack > 2000) {
      this.bossLastAttack = now;
      for (let i = 0; i < 5; i++) {
        this.time.delayedCall(i * 150, () => {
          if (!this.boss?.active || !this.player?.active) return;
          this.throwBossProjectile('boss-projectile', this.boss.x, this.boss.y,
            this.player.x + Phaser.Math.Between(-30, 30),
            this.player.y + Phaser.Math.Between(-30, 30), 120);
        });
      }
    }

    // Envelop attempt
    const lastEnvelop = this.boss.getData('lastEnvelop') as number || 0;
    if (now - lastEnvelop > envelopInterval) {
      this.boss.setData('lastEnvelop', now);
      this.startEnvelopCharge();
    }
  }

  // ── L6 Boss: Shoggoth — "The Chaos" (combines all mechanics) ──
  private updateBossShoggoth(now: number): void {
    if (!this.boss?.active || !this.player?.active) return;
    const phase = this.boss.getData('currentPhase') as number;

    // Direct pursuit
    const speed = this.boss.getData('speed') as number;
    const dir = this.player.x > this.boss.x ? 1 : -1;
    this.boss.setVelocityX(Math.min(speed, 70) * dir);

    // Mixed projectiles, fires every 800ms
    if (now - this.bossLastAttack > 800) {
      this.bossLastAttack = now;
      this.throwBossProjectile('boss-projectile', this.boss.x, this.boss.y,
        this.player.x, this.player.y, 220);
    }

    // Phase-based mechanic additions
    // Phase 0+: Vortex pull (every 5s)
    if (phase >= 0 && now % 5000 < 50) {
      const pBody = this.player.body as Phaser.Physics.Arcade.Body;
      const pullDir = this.boss.x > this.player.x ? 1 : -1;
      pBody.setVelocityX(pBody.velocity.x + pullDir * 12);
    }

    // Phase 1+: Head bounce (every 6s)
    if (phase >= 1) {
      const lastJump = this.boss.getData('lastJump') as number || 0;
      if (now - lastJump > 6000) {
        this.boss.setData('lastJump', now);
        this.bossJumpAttack();
      }
    }

    // Phase 2+: Fork clone (once)
    if (phase >= 2 && !this.boss.getData('shoggothClone')) {
      this.boss.setData('shoggothClone', true);
      this.spawnBossClone();
    }

    // Phase 3+: Paper vacuum (every 4s)
    if (phase >= 3) {
      const lastVac = this.boss.getData('lastVacuum') as number || 0;
      if (now - lastVac > 4000) {
        this.boss.setData('lastVacuum', now);
        this.bossPaperVacuum();
      }
    }

    // Phase 4+: Envelop (every 10s)
    if (phase >= 4) {
      const lastEnvelop = this.boss.getData('lastEnvelop') as number || 0;
      if (now - lastEnvelop > 10000) {
        this.boss.setData('lastEnvelop', now);
        this.startEnvelopCharge();
      }
    }
  }

  // ── L7 Boss: Angry Neckbeard — "The Reply Guy" ──
  private updateBossNeckbeard(now: number): void {
    if (!this.boss?.active || !this.player?.active) return;

    const phase = this.boss.getData('currentPhase') as number;
    const speed = [26, 36, 48][phase] || 48;
    const originX = this.boss.getData('originX') as number;
    const patrolRange = 140;
    let dir = this.boss.getData('patrolDir') as number;

    if (this.boss.x > originX + patrolRange) dir = -1;
    else if (this.boss.x < originX - patrolRange) dir = 1;
    this.boss.setData('patrolDir', dir);
    this.boss.setVelocityX(speed * dir);

    const fireInterval = [1850, 1450, 1100][phase] || 1100;
    if (now - this.bossLastAttack > fireInterval) {
      this.bossLastAttack = now;
      const spread = phase >= 2 ? 1 : 0;
      for (let i = -spread; i <= spread; i++) {
        this.throwBossProjectile(
          'comment-projectile',
          this.boss.x,
          this.boss.y - 20,
          this.player.x + i * 45,
          this.player.y - 10,
          175 + phase * 15
        );
      }
    }

    const burstInterval = [5200, 4100, 3200][phase] || 3200;
    if (now - this.bossLastSpecial > burstInterval) {
      this.bossLastSpecial = now;
      for (let i = 0; i < 2 + phase; i++) {
        this.time.delayedCall(i * 160, () => {
          if (!this.boss?.active || !this.player?.active) return;
          this.throwBossProjectile(
            'comment-projectile',
            this.boss.x,
            this.boss.y - 20,
            this.player.x + Phaser.Math.Between(-90, 90),
            this.player.y + Phaser.Math.Between(-60, 24),
            190 + phase * 12
          );
        });
      }
    }
  }

  // ── L8 Boss: Schmidhuber — "The Citation Cannon" ──
  private updateBossSchmidhuber(now: number): void {
    if (!this.boss?.active || !this.player?.active) return;

    const phase = this.boss.getData('currentPhase') as number;
    const speed = [42, 58, 74][phase] || 74;
    const dir = this.player.x > this.boss.x ? 1 : -1;
    this.boss.setVelocityX(speed * dir * 0.75);

    const fireInterval = [1500, 1100, 800][phase] || 800;
    if (now - this.bossLastAttack > fireInterval) {
      this.bossLastAttack = now;
      const volleySize = 2 + phase;
      for (let i = 0; i < volleySize; i++) {
        this.time.delayedCall(i * 110, () => {
          if (!this.boss?.active || !this.player?.active) return;
          const year = Phaser.Math.Between(1991, 2012);
          this.throwReferenceTweet(
            this.boss.x,
            this.boss.y - 18,
            this.player.x + Phaser.Math.Between(-35, 35),
            this.player.y + Phaser.Math.Between(-25, 20),
            year,
            220 + phase * 18
          );
        });
      }
    }

    const burstInterval = [4200, 3200, 2400][phase] || 2400;
    if (now - this.bossLastSpecial > burstInterval) {
      this.bossLastSpecial = now;
      const spread = phase >= 2 ? 2 : 1;
      for (let i = -spread; i <= spread; i++) {
        const year = Phaser.Math.Between(1991, 2012);
        this.throwReferenceTweet(
          this.boss.x,
          this.boss.y - 24,
          this.player.x + i * 85,
          this.player.y - 20 + Math.abs(i) * 12,
          year,
          200 + phase * 15
        );
      }
    }
  }

  // ── L9 Boss: Pause Sign — "The Sticky Slogan" ──
  private updateBossPauseSign(now: number): void {
    if (!this.boss?.active || !this.player?.active) return;

    const phase = this.boss.getData('currentPhase') as number;
    const originX = this.boss.getData('originX') as number;
    const sway = Math.sin(now * 0.0015) * (36 + phase * 10);
    this.boss.setX(originX + sway);
    this.boss.setVelocity(0, 0);

    const fireInterval = [1600, 1200, 900][phase] || 900;
    if (now - this.bossLastAttack > fireInterval) {
      this.bossLastAttack = now;
      const spread = phase >= 2 ? 1 : 0;
      for (let i = -spread; i <= spread; i++) {
        this.throwGlueProjectile(
          this.boss.x,
          this.boss.y - 30,
          this.player.x + i * 55,
          this.player.y - 10,
          180 + phase * 18
        );
      }
    }

    const burstInterval = [4200, 3200, 2600][phase] || 2600;
    if (now - this.bossLastSpecial > burstInterval) {
      this.bossLastSpecial = now;
      const targets = 4 + phase;
      for (let i = 0; i < targets; i++) {
        this.time.delayedCall(i * 100, () => {
          if (!this.boss?.active || !this.player?.active) return;
          this.throwGlueProjectile(
            this.boss.x,
            this.boss.y - 24,
            this.player.x + Phaser.Math.Between(-90, 90),
            this.player.y + Phaser.Math.Between(-40, 20),
            190 + phase * 12
          );
        });
      }
    }
  }

  // ── L10 Boss: Bernie — "The Flying Spectacles" ──
  private updateBossBernie(now: number): void {
    if (!this.boss?.active || !this.player?.active) return;

    const phase = this.boss.getData('currentPhase') as number;
    const hoverRadiusX = [90, 120, 155][phase] || 155;
    const hoverRadiusY = [45, 60, 78][phase] || 78;
    const baseY = 120;
    const targetX = this.player.x + Math.sin(now * 0.0018 + phase) * hoverRadiusX;
    const targetY = baseY + Math.cos(now * 0.0026 + phase) * hoverRadiusY;
    this.boss.setVelocity(
      Phaser.Math.Clamp((targetX - this.boss.x) * 2.3, -220, 220),
      Phaser.Math.Clamp((targetY - this.boss.y) * 2.6, -180, 180)
    );
    this.boss.setFlipX(this.player.x < this.boss.x);

    const fireInterval = [1500, 1050, 760][phase] || 760;
    if (now - this.bossLastAttack > fireInterval) {
      this.bossLastAttack = now;
      const volley = 2 + phase;
      for (let i = 0; i < volley; i++) {
        this.time.delayedCall(i * 95, () => {
          if (!this.boss?.active || !this.player?.active) return;
          this.throwSpectaclesProjectile(
            this.boss.x,
            this.boss.y + 4,
            this.player.x + Phaser.Math.Between(-40, 40),
            this.player.y + Phaser.Math.Between(-30, 24),
            240 + phase * 20
          );
        });
      }
    }

    const burstInterval = [3800, 3000, 2200][phase] || 2200;
    if (now - this.bossLastSpecial > burstInterval) {
      this.bossLastSpecial = now;
      const spread = phase >= 2 ? 2 : 1;
      for (let i = -spread; i <= spread; i++) {
        this.throwSpectaclesProjectile(
          this.boss.x,
          this.boss.y + 8,
          this.player.x + i * 90,
          this.player.y - 24 + Math.abs(i) * 20,
          200 + phase * 18
        );
      }
    }
  }

  // ── Envelop Mechanic ──
  private startEnvelopCharge(): void {
    if (!this.boss?.active || !this.player?.active) return;
    // Boss charges at player
    const chargeTimer = this.time.addEvent({
      delay: 50,
      repeat: 40, // 2s charge window
      callback: () => {
        if (!this.boss?.active || !this.player?.active || this.enveloped) {
          chargeTimer.remove();
          return;
        }
        const dir = this.player.x > this.boss!.x ? 1 : -1;
        this.boss!.setVelocityX(dir * 250);
        // Check overlap
        const dist = Phaser.Math.Distance.Between(
          this.boss!.x, this.boss!.y, this.player.x, this.player.y
        );
        if (dist < 50) {
          chargeTimer.remove();
          this.startEnvelop();
        }
      },
    });
  }

  private startEnvelop(): void {
    this.enveloped = true;
    this.envelopMeter = 0;
    this.envelopStartTime = this.time.now;
    this.envelopLastDir = '';

    // Lock player
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setAllowGravity(false);

    // Dark overlay
    this.envelopOverlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85
    ).setScrollFactor(0).setDepth(300);

    // Escape text
    this.envelopText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'MASH ← → TO ESCAPE!', {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '16px',
      color: '#ff4444',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    // Meter bar
    this.envelopMeterBar = this.add.graphics().setScrollFactor(0).setDepth(301);
  }

  private updateEnvelop(): void {
    if (!this.enveloped) return;
    const now = this.time.now;
    const elapsed = now - this.envelopStartTime;

    // Drain meter over time (4%/s)
    this.envelopMeter = Math.max(0, this.envelopMeter - 0.04 * (1 / 60));

    // Check L/R input for escape
    if (this.isActionDown('left')) {
      if (this.envelopLastDir !== 'left') {
        this.envelopLastDir = 'left';
        this.envelopMeter = Math.min(100, this.envelopMeter + 8);
      }
    } else if (this.isActionDown('right')) {
      if (this.envelopLastDir !== 'right') {
        this.envelopLastDir = 'right';
        this.envelopMeter = Math.min(100, this.envelopMeter + 8);
      }
    }

    // Draw meter
    if (this.envelopMeterBar) {
      this.envelopMeterBar.clear();
      const barW = 200;
      const barH = 12;
      const bx = GAME_WIDTH / 2 - barW / 2;
      const by = GAME_HEIGHT / 2;
      // Background
      this.envelopMeterBar.fillStyle(0x333333);
      this.envelopMeterBar.fillRect(bx, by, barW, barH);
      // Fill
      const pct = this.envelopMeter / 100;
      this.envelopMeterBar.fillStyle(pct > 0.7 ? 0x00ff00 : 0xffaa00);
      this.envelopMeterBar.fillRect(bx, by, barW * pct, barH);
      // Border
      this.envelopMeterBar.lineStyle(1, 0xffffff);
      this.envelopMeterBar.strokeRect(bx, by, barW, barH);
    }

    // Success: meter hits 100%
    if (this.envelopMeter >= 100) {
      this.cleanupEnvelop(true);
      return;
    }

    // Failure: 5s time limit
    if (elapsed >= 5000) {
      this.cleanupEnvelop(false);
      return;
    }
  }

  private cleanupEnvelop(escaped: boolean): void {
    this.enveloped = false;
    this.envelopOverlay?.destroy();
    this.envelopOverlay = null;
    this.envelopText?.destroy();
    this.envelopText = null;
    this.envelopMeterBar?.destroy();
    this.envelopMeterBar = null;

    // Restore player physics
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true);

    if (escaped) {
      // Boss stunned 2s, player thrown back with invincibility
      if (this.boss?.active) {
        this.boss.setTint(0x888888);
        this.boss.setVelocity(0, 0);
        this.bossInvincible = true;
        this.time.delayedCall(2000, () => {
          if (this.boss?.active) this.boss.clearTint();
          this.bossInvincible = false;
        });
      }
      // Throw player back
      const dir = this.player.x < (this.boss?.x || 0) ? -1 : 1;
      body.setVelocity(dir * 200, -200);
      this.invincible = true;
      this.player.setAlpha(0.5);
      this.time.delayedCall(2000, () => {
        this.invincible = false;
        if (this.player?.active) this.player.setAlpha(1);
      });
    } else {
      // Failure: 40 damage + knockback
      this.takeDamage(BOSS_ENVELOP_DAMAGE);
      const dir = this.player.x < (this.boss?.x || 0) ? -1 : 1;
      body.setVelocity(dir * 250, -200);
    }
  }

  // ── Boss Helper Methods ──

  private throwBossProjectile(texture: string, fromX: number, fromY: number,
    toX: number, toY: number, speed: number): void {
    const proj = this.slopGroup.create(fromX, fromY, texture) as Phaser.Physics.Arcade.Sprite;
    proj.setData('sourceType', 'boss');
    const angle = Phaser.Math.Angle.Between(fromX, fromY, toX, toY);
    proj.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    proj.body!.allowGravity = false;
    this.time.delayedCall(4000, () => { if (proj.active) proj.destroy(); });
  }

  private throwGlueProjectile(fromX: number, fromY: number, toX: number, toY: number, speed: number): void {
    const proj = this.slopGroup.create(fromX, fromY, 'glue-projectile') as Phaser.Physics.Arcade.Sprite;
    proj.setData('sourceType', 'pauseGlue');
    const angle = Phaser.Math.Angle.Between(fromX, fromY, toX, toY);
    proj.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed - 10);
    proj.body!.allowGravity = false;
    this.tweens.add({
      targets: proj,
      scaleX: { from: 0.9, to: 1.15 },
      scaleY: { from: 0.9, to: 1.15 },
      alpha: { from: 0.9, to: 0.7 },
      duration: 220,
      yoyo: true,
      repeat: -1,
    });
    this.time.delayedCall(3200, () => {
      if (proj.active) proj.destroy();
    });
  }

  private throwReferenceTweet(fromX: number, fromY: number, toX: number, toY: number, year: number, speed: number): void {
    const proj = this.slopGroup.create(fromX, fromY, 'tweet-projectile') as Phaser.Physics.Arcade.Sprite;
    proj.setData('sourceType', 'boss');
    const angle = Phaser.Math.Angle.Between(fromX, fromY, toX, toY);
    proj.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    proj.body!.allowGravity = false;
    proj.setAngularVelocity(90);

    const yearLabel = this.add.text(fromX, fromY - 20, `${year}`, {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '8px',
      color: '#c9d1d9',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(55);
    this.tweens.add({
      targets: yearLabel,
      y: fromY - 38,
      alpha: 0,
      duration: 600,
      onComplete: () => yearLabel.destroy(),
    });

    this.time.delayedCall(4200, () => {
      if (proj.active) proj.destroy();
    });
  }

  private throwSpectaclesProjectile(fromX: number, fromY: number, toX: number, toY: number, speed: number): void {
    const texture = this.textures.exists('spectacles-projectile') ? 'spectacles-projectile' : 'boss-projectile';
    const proj = this.slopGroup.create(fromX, fromY, texture) as Phaser.Physics.Arcade.Sprite;
    proj.setData('sourceType', 'boss');
    const angle = Phaser.Math.Angle.Between(fromX, fromY, toX, toY);
    proj.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    proj.body!.allowGravity = false;
    proj.setAngularVelocity(240);
    this.time.delayedCall(3600, () => {
      if (proj.active) proj.destroy();
    });
  }

  private reflectPaperAtPlayer(projectile: Phaser.Physics.Arcade.Sprite, enemy: Phaser.Physics.Arcade.Sprite): void {
    const reflected = this.slopGroup.create(enemy.x, enemy.y - 10, projectile.texture.key) as Phaser.Physics.Arcade.Sprite;
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    reflected.setData('sourceType', 'boss');
    reflected.body!.allowGravity = false;
    reflected.setVelocity(Math.cos(angle) * 320, Math.sin(angle) * 320);
    this.tweens.add({
      targets: reflected,
      angle: 360,
      duration: 400,
      repeat: -1,
    });
    projectile.destroy();
    enemy.setTint(0xffffff);
    this.time.delayedCall(100, () => { if (enemy.active) enemy.clearTint(); });
    this.time.delayedCall(2500, () => {
      if (reflected.active) reflected.destroy();
    });
  }

  private emitBossHealthUpdate(): void {
    if (!this.boss?.active) return;
    const hudScene = this.scene.get(SCENES.HUD);
    if (hudScene) {
      hudScene.events.emit('bossHealthUpdate', {
        hp: this.bossHealth,
        maxHp: this.bossMaxHealth,
        name: this.bossType,
      });
    }
  }

  private onVictory(): void {
    audioEngine.stopTrack();
    audioEngine.playSFX('victory');
    this.gsm.updateHighScore(this.score);
    this.gsm.addPapers(this.papersCollected);
    this.despawnClawd();
    this.endGoldenGateRide(true);
    this.clearShockSources();

    if (this.levelNum < getTotalLevels()) {
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
      case 7: this.drawBgYouTube(); break;
      case 8: this.drawBgNeurips(); break;
      case 9: this.drawBgSanFrancisco(); break;
      case 10: this.drawBgDatacenter(); break;
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

    // Crumbling neoclassical buildings
    for (let bx = 0; bx < w; bx += Phaser.Math.Between(100, 160)) {
      const building = this.add.image(bx, GAME_HEIGHT - 80, 'bg-crumbling-building');
      building.setOrigin(0, 0);
      building.setScrollFactor(0.1);
      building.setAlpha(Phaser.Math.FloatBetween(0.25, 0.45));
      building.setScale(Phaser.Math.FloatBetween(1.5, 2.5));
    }

    // Fallen pillar debris scattered along ground
    const g0 = this.add.graphics().setScrollFactor(0.15);
    g0.fillStyle(0x3a3a3a, 0.3);
    for (let dx = 0; dx < w; dx += Phaser.Math.Between(60, 120)) {
      const dw = Phaser.Math.Between(12, 30);
      const dh = Phaser.Math.Between(4, 8);
      g0.fillRect(dx, GAME_HEIGHT - Phaser.Math.Between(10, 25), dw, dh);
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

  // ── Level 7: YouTube — play buttons, comment swarms, glowing creator caves ──
  private drawBgYouTube(): void {
    const w = this.config.width;

    const skyline = this.add.graphics().setScrollFactor(0.08);
    skyline.fillStyle(0x120707, 0.7);
    for (let x = 0; x < w; x += 90) {
      const h = Phaser.Math.Between(110, 240);
      skyline.fillRect(x, GAME_HEIGHT - h, 68, h);
      skyline.fillStyle(0x220b0b, 0.5);
      skyline.fillRect(x + 10, GAME_HEIGHT - h + 14, 10, 10);
      skyline.fillRect(x + 28, GAME_HEIGHT - h + 28, 12, 12);
      skyline.fillRect(x + 46, GAME_HEIGHT - h + 18, 8, 8);
      skyline.fillStyle(0x120707, 0.7);
    }

    const plays = this.add.graphics().setScrollFactor(0.16);
    for (let i = 0; i < 9; i++) {
      const x = Phaser.Math.Between(80, w - 120);
      const y = Phaser.Math.Between(40, 260);
      plays.fillStyle(0xff0000, Phaser.Math.FloatBetween(0.08, 0.16));
      plays.fillRoundedRect(x, y, 64, 44, 10);
      plays.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.06, 0.12));
      plays.fillTriangle(x + 24, y + 12, x + 24, y + 32, x + 44, y + 22);
    }

    const comments = this.add.graphics().setScrollFactor(0.24);
    for (let i = 0; i < 16; i++) {
      const x = Phaser.Math.Between(30, w - 90);
      const y = Phaser.Math.Between(30, 320);
      comments.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.04, 0.08));
      comments.fillRoundedRect(x, y, 54, 22, 6);
      comments.fillTriangle(x + 10, y + 22, x + 16, y + 22, x + 8, y + 30);
      comments.fillStyle(0xff6666, Phaser.Math.FloatBetween(0.05, 0.09));
      comments.fillRect(x + 8, y + 6, 24, 2);
      comments.fillRect(x + 8, y + 11, 34, 2);
      comments.fillRect(x + 8, y + 16, 18, 2);
    }

    for (let i = 0; i < 7; i++) {
      const x = Phaser.Math.Between(90, w - 90);
      const y = Phaser.Math.Between(70, 250);
      const badge = this.add.text(x, y, '▶', {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: `${Phaser.Math.Between(28, 48)}px`,
        color: '#ff0000',
      }).setAlpha(0.07).setScrollFactor(0.12);
      this.tweens.add({
        targets: badge,
        y: y - 18,
        alpha: 0.02,
        duration: Phaser.Math.Between(2800, 4600),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private drawBgNeurips(): void {
    const w = this.config.width;

    const hall = this.add.graphics().setScrollFactor(0.08);
    hall.fillStyle(0x140f1e, 0.7);
    hall.fillRect(0, 58, w, GAME_HEIGHT - 58);
    hall.fillStyle(0x25163a, 0.45);
    for (let x = 0; x < w; x += 120) {
      hall.fillRect(x, 70, 88, 220);
    }

    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(60, w - 60);
      const y = Phaser.Math.Between(38, 170);
      const banner = this.add.text(x, y, 'NeurIPS', {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: `${Phaser.Math.Between(18, 28)}px`,
        color: '#7c5cff',
        fontStyle: 'bold',
      }).setAlpha(0.06).setScrollFactor(0.12);
      this.tweens.add({
        targets: banner,
        alpha: 0.02,
        y: y - 16,
        duration: Phaser.Math.Between(2600, 4200),
        yoyo: true,
        repeat: -1,
      });
    }

    for (let i = 0; i < 16; i++) {
      const x = Phaser.Math.Between(30, w - 30);
      const y = GAME_HEIGHT - Phaser.Math.Between(20, 70);
      const tex = Phaser.Math.Between(0, 1) === 0 ? 'bg-journalist' : 'bg-journalist-camera';
      const journalist = this.add.image(x, y, tex);
      journalist.setOrigin(0.5, 1);
      journalist.setScrollFactor(0.18);
      journalist.setAlpha(Phaser.Math.FloatBetween(0.2, 0.34));

      if (tex === 'bg-journalist-camera') {
        const flash = this.add.image(x + 10, y - 42, 'bg-flashbulb');
        flash.setScrollFactor(0.2);
        flash.setAlpha(0.05);
        this.tweens.add({
          targets: flash,
          alpha: { from: 0.03, to: 0.2 },
          scale: { from: 0.6, to: 1.15 },
          duration: Phaser.Math.Between(160, 260),
          yoyo: true,
          repeat: -1,
          repeatDelay: Phaser.Math.Between(1400, 2600),
          delay: Phaser.Math.Between(0, 1800),
        });
      }
    }

    for (let i = 0; i < 12; i++) {
      const x = Phaser.Math.Between(40, w - 40);
      const y = Phaser.Math.Between(70, 270);
      const orb = this.add.circle(x, y, Phaser.Math.Between(10, 18), 0x7c5cff, 0.05);
      orb.setScrollFactor(0.24);
      this.tweens.add({
        targets: orb,
        y: y - Phaser.Math.Between(16, 32),
        alpha: 0.01,
        duration: Phaser.Math.Between(2400, 4200),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private drawBgSanFrancisco(): void {
    const w = this.config.width;

    const sky = this.add.graphics().setScrollFactor(0.06);
    sky.fillStyle(0x0a1020, 0.55);
    sky.fillRect(0, 0, w, GAME_HEIGHT);
    sky.fillStyle(0x101833, 0.45);
    for (let x = 0; x < w; x += 110) {
      const h = Phaser.Math.Between(100, 220);
      sky.fillRect(x, GAME_HEIGHT - h, 80, h);
    }

    for (let i = 0; i < 5; i++) {
      const bridge = this.add.image(800 + i * 1450, 180 + Phaser.Math.Between(-14, 14), 'bg-golden-gate');
      bridge.setScrollFactor(0.1);
      bridge.setAlpha(0.18);
      bridge.setScale(1.2);
    }

    const slogans = ['NO DATACENTERS', 'STOP AI', 'PAUSE TRAINING', 'SAVE WATER'];
    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(30, w - 30);
      const y = GAME_HEIGHT - Phaser.Math.Between(18, 55);
      const protester = this.add.image(x, y, 'bg-protester');
      protester.setOrigin(0.5, 1);
      protester.setScrollFactor(0.18);
      protester.setAlpha(Phaser.Math.FloatBetween(0.22, 0.34));

      const slogan = slogans[i % slogans.length];
      const sign = this.add.text(x, y - 38, slogan, {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '7px',
        color: '#f3f4f6',
        backgroundColor: '#1f2937',
        padding: { left: 3, right: 3, top: 2, bottom: 2 },
      }).setOrigin(0.5).setScrollFactor(0.19).setAlpha(0.34);
      this.tweens.add({
        targets: [protester, sign],
        y: '-=3',
        duration: Phaser.Math.Between(1200, 2200),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 900),
      });
    }

    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(60, w - 60);
      const y = Phaser.Math.Between(40, 220);
      const cloud = this.add.circle(x, y, Phaser.Math.Between(18, 28), 0xff9416, 0.05);
      cloud.setScrollFactor(0.14);
      this.tweens.add({
        targets: cloud,
        x: x + Phaser.Math.Between(-40, 40),
        alpha: 0.015,
        duration: Phaser.Math.Between(2800, 4600),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private drawBgDatacenter(): void {
    const w = this.config.width;

    const glow = this.add.graphics().setScrollFactor(0.04);
    glow.fillStyle(0x03060d, 0.85);
    glow.fillRect(0, 0, w, GAME_HEIGHT);
    glow.fillStyle(0x0f1728, 0.4);
    for (let y = 18; y < GAME_HEIGHT - 40; y += 68) {
      glow.fillRect(0, y, w, 2);
    }

    const layerConfigs = [
      { count: Math.ceil(w / 130), spacing: 130, y: GAME_HEIGHT - 38, alpha: 0.24, scale: 1.28, scroll: 0.12 },
      { count: Math.ceil(w / 160), spacing: 160, y: GAME_HEIGHT - 116, alpha: 0.18, scale: 1.1, scroll: 0.08 },
      { count: Math.ceil(w / 210), spacing: 210, y: GAME_HEIGHT - 196, alpha: 0.12, scale: 0.92, scroll: 0.05 },
    ];

    layerConfigs.forEach((layer) => {
      for (let i = 0; i < layer.count; i++) {
        const rack = this.add.image(60 + i * layer.spacing, layer.y, 'bg-gpu-rack');
        rack.setOrigin(0.5, 1);
        rack.setScrollFactor(layer.scroll);
        rack.setScale(layer.scale);
        rack.setAlpha(layer.alpha);
      }
    });

    for (let i = 0; i < 16; i++) {
      const x = Phaser.Math.Between(40, w - 40);
      const y = Phaser.Math.Between(32, GAME_HEIGHT - 70);
      const spark = this.add.circle(x, y, Phaser.Math.Between(2, 4), 0x76b900, 0.08);
      spark.setScrollFactor(0.18);
      this.tweens.add({
        targets: spark,
        alpha: { from: 0.02, to: 0.16 },
        scale: { from: 0.7, to: 1.3 },
        duration: Phaser.Math.Between(900, 1800),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 1200),
      });
    }
  }
}
