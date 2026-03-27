import * as THREE from 'three';

interface DataDash64Options {
  parentId: string;
  assetBase: string;
}

type Axis = 'x' | 'z';

interface Platform {
  mesh: THREE.Mesh;
  width: number;
  depth: number;
  topY: number;
  basePosition: THREE.Vector3;
  previousPosition: THREE.Vector3;
  moving?: {
    axis: Axis;
    amplitude: number;
    speed: number;
    phase: number;
  };
}

interface BoosterPad {
  group: THREE.Group;
  center: THREE.Vector3;
  radius: number;
  cooldown: number;
}

interface PaperPickup {
  group: THREE.Group;
  center: THREE.Vector3;
  collected: boolean;
  bobOffset: number;
}

interface Enemy {
  group: THREE.Group;
  velocity: THREE.Vector3;
  home: THREE.Vector3;
  health: number;
  cooldown: number;
  bobOffset: number;
  radius: number;
  dead: boolean;
}

interface Projectile {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  lifetime: number;
  friendly: boolean;
  radius: number;
  damage: number;
}

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  lifetime: number;
  maxLifetime: number;
}

interface BossState {
  group: THREE.Group;
  core: THREE.Mesh;
  ring: THREE.Mesh;
  health: number;
  maxHealth: number;
  attackCooldown: number;
  summonCooldown: number;
  active: boolean;
  defeated: boolean;
}

interface GroundSample {
  y: number;
  platform: Platform | null;
}

interface HudRefs {
  objective: HTMLElement;
  paperCount: HTMLElement;
  score: HTMLElement;
  best: HTMLElement;
  healthFill: HTMLElement;
  dashFill: HTMLElement;
  toast: HTMLElement;
  bossWrap: HTMLElement;
  bossFill: HTMLElement;
  finish: HTMLElement;
  finishHeading: HTMLElement;
  finishCopy: HTMLElement;
  restartButton: HTMLButtonElement;
}

function requireElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing required element #${id}`);
  }
  return element as T;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function damp(current: number, target: number, lambda: number, dt: number): number {
  return THREE.MathUtils.damp(current, target, lambda, dt);
}

class DataDash64Game {
  private readonly parent: HTMLElement;
  private readonly normalizedBase: string;
  private readonly hud: HudRefs;

  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(58, 16 / 9, 0.1, 500);
  private readonly renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  private readonly clock = new THREE.Clock();
  private readonly world = new THREE.Group();

  private readonly platforms: Platform[] = [];
  private readonly boosters: BoosterPad[] = [];
  private readonly papers: PaperPickup[] = [];
  private readonly enemies: Enemy[] = [];
  private readonly projectiles: Projectile[] = [];
  private readonly particles: Particle[] = [];

  private readonly keyState = new Set<string>();
  private readonly barrier = {
    mesh: null as THREE.Mesh | null,
    active: true,
    openAmount: 0,
  };

  private mintyTexture: THREE.Texture | null = null;
  private rafId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private destroyed = false;

  private readonly player = {
    group: new THREE.Group(),
    sprite: null as THREE.Sprite | null,
    shadow: null as THREE.Mesh | null,
    velocity: new THREE.Vector3(),
    facing: new THREE.Vector3(0, 0, -1),
    grounded: false,
    groundPlatform: null as Platform | null,
    health: 100,
    maxHealth: 100,
    dashCharge: 1,
    dashCooldown: 0,
    fireCooldown: 0,
    invulnerability: 0,
    fallGrace: 0,
    respawn: new THREE.Vector3(0, 2, 12),
  };

  private boss: BossState | null = null;
  private objective = 'Collect 12 signal papers to open the core gate.';
  private papersCollected = 0;
  private score = 0;
  private bestScore = 0;
  private victory = false;
  private gameOver = false;
  private toastTimer = 0;

  private readonly playerProjectileGeometry = new THREE.BoxGeometry(0.34, 0.12, 0.62);
  private readonly playerProjectileMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f7ff,
    emissive: 0x7fd7ff,
    emissiveIntensity: 0.8,
    metalness: 0.1,
    roughness: 0.25,
  });
  private readonly enemyProjectileGeometry = new THREE.SphereGeometry(0.28, 12, 12);
  private readonly enemyProjectileMaterial = new THREE.MeshStandardMaterial({
    color: 0xff7a3d,
    emissive: 0xff4d00,
    emissiveIntensity: 1.25,
    metalness: 0.2,
    roughness: 0.2,
  });

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    this.keyState.add(event.code);
    if (event.repeat) return;

    if (event.code === 'Space') {
      event.preventDefault();
      this.tryJump();
    }

    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
      this.tryDash();
    }

    if (event.code === 'KeyJ' || event.code === 'KeyZ') {
      this.firePaper();
    }

    if (event.code === 'KeyR') {
      this.restart();
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    this.keyState.delete(event.code);
  };

  constructor(options: DataDash64Options) {
    this.parent = requireElement<HTMLElement>(options.parentId);
    this.normalizedBase = options.assetBase.replace(/\/$/, '');
    this.hud = {
      objective: requireElement<HTMLElement>('dd64-objective'),
      paperCount: requireElement<HTMLElement>('dd64-paper-count'),
      score: requireElement<HTMLElement>('dd64-score'),
      best: requireElement<HTMLElement>('dd64-best'),
      healthFill: requireElement<HTMLElement>('dd64-health-fill'),
      dashFill: requireElement<HTMLElement>('dd64-dash-fill'),
      toast: requireElement<HTMLElement>('dd64-toast'),
      bossWrap: requireElement<HTMLElement>('dd64-boss-wrap'),
      bossFill: requireElement<HTMLElement>('dd64-boss-fill'),
      finish: requireElement<HTMLElement>('dd64-finish'),
      finishHeading: requireElement<HTMLElement>('dd64-finish-heading'),
      finishCopy: requireElement<HTMLElement>('dd64-finish-copy'),
      restartButton: requireElement<HTMLButtonElement>('dd64-restart'),
    };

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    this.parent.innerHTML = '';
    this.parent.appendChild(this.renderer.domElement);

    this.scene.background = new THREE.Color(0x04070f);
    this.scene.fog = new THREE.Fog(0x04070f, 48, 140);
    this.scene.add(this.world);

    this.bestScore = Number.parseInt(localStorage.getItem('data-dash-64-best') || '0', 10) || 0;
    this.camera.position.set(0, 10, 20);

    this.hud.restartButton.addEventListener('click', () => this.restart());
  }

  async init(): Promise<void> {
    this.mintyTexture = await this.loadTexture(`${this.normalizedBase || ''}/assets/minty-teal.png`);
    this.setupScene();
    this.setupPlayer();
    this.buildWorld();
    this.bindEvents();
    this.resize();
    this.updateHud();
    this.loop();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.renderer.dispose();
  }

  private async loadTexture(url: string): Promise<THREE.Texture> {
    const loader = new THREE.TextureLoader();
    const texture = await new Promise<THREE.Texture>((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
  }

  private setupScene(): void {
    const hemi = new THREE.HemisphereLight(0x98d5ff, 0x05111a, 1.35);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0x9fe4ff, 2.25);
    sun.position.set(18, 30, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 80;
    sun.shadow.camera.left = -36;
    sun.shadow.camera.right = 36;
    sun.shadow.camera.top = 36;
    sun.shadow.camera.bottom = -36;
    this.scene.add(sun);

    const glow = new THREE.PointLight(0x21d4fd, 28, 90, 2);
    glow.position.set(0, 16, -64);
    this.scene.add(glow);

    this.scene.add(this.createStarfield());
    this.scene.add(this.createBackdropBands());
    this.scene.add(this.createFarGrid());
  }

  private setupPlayer(): void {
    if (!this.mintyTexture) return;

    const spriteMaterial = new THREE.SpriteMaterial({
      map: this.mintyTexture,
      transparent: true,
      alphaTest: 0.2,
      color: 0xffffff,
    });

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(4.8, 5.3, 1);
    sprite.position.set(0, 2.8, 0);
    this.player.group.add(sprite);
    this.player.sprite = sprite;

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.4, 24),
      new THREE.MeshBasicMaterial({ color: 0x02060b, opacity: 0.35, transparent: true })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.03;
    this.player.group.add(shadow);
    this.player.shadow = shadow;

    const aura = new THREE.Mesh(
      new THREE.RingGeometry(1.7, 2.2, 32),
      new THREE.MeshBasicMaterial({
        color: 0x2ec4b6,
        opacity: 0.28,
        transparent: true,
        side: THREE.DoubleSide,
      })
    );
    aura.rotation.x = -Math.PI / 2;
    aura.position.y = 0.05;
    this.player.group.add(aura);

    this.player.group.position.copy(this.player.respawn);
    this.scene.add(this.player.group);
  }

  private buildWorld(): void {
    this.world.add(this.createAmbientArchitecture());

    this.addPlatform(0, 12, 28, 28, 0.6, 0x102637);
    this.addPlatform(-24, -8, 20, 20, 2.2, 0x1d3148);
    this.addPlatform(22, -12, 20, 18, 2.8, 0x1e263d);
    this.addPlatform(-38, -34, 20, 18, 4.6, 0x1e2731);
    this.addPlatform(34, -38, 18, 18, 5.2, 0x30233c);
    this.addPlatform(0, -34, 12, 12, 4.2, 0x182534, {
      axis: 'x',
      amplitude: 11,
      speed: 0.65,
      phase: 0.2,
    });
    this.addPlatform(-8, -56, 12, 12, 7.6, 0x1c2531, {
      axis: 'z',
      amplitude: 7,
      speed: 0.9,
      phase: 2.3,
    });
    this.addPlatform(12, -62, 12, 12, 8.2, 0x1c2d39);
    this.addPlatform(0, -86, 34, 30, 10.6, 0x121a28);

    this.addBooster(-11, 12.7, 1.4, 0x49dcb1);
    this.addBooster(18, -11.3, 1.6, 0x64d8ff);
    this.addBooster(-2, -34.1, 4.8, 0xffb347);

    this.addPaper(-7, 13.4, 0.8);
    this.addPaper(8, 12.8, 1.5);
    this.addPaper(-20, -6.2, 1.1);
    this.addPaper(-29, -12.5, 2.7);
    this.addPaper(14, -8.8, 0.2);
    this.addPaper(28, -16.3, 1.7);
    this.addPaper(-40, -30.6, 2.3);
    this.addPaper(-31, -39.5, 0.9);
    this.addPaper(33, -33.8, 1.4);
    this.addPaper(41, -41.6, 2.2);
    this.addPaper(-2, -34.4, 0.3);
    this.addPaper(0, -62.8, 1.8);

    this.addEnemy(-18, -5.5, 2.2, 0xff8a65);
    this.addEnemy(18, -13.2, 2.8, 0xff7f50);
    this.addEnemy(-35, -33.8, 4.6, 0xd16eff);
    this.addEnemy(30, -35.4, 5.2, 0x6ec8ff);
    this.addEnemy(-4, -55.8, 7.6, 0xe86b7a);
    this.addEnemy(10, -62.2, 8.2, 0xf4b860);

    this.createBarrier();
    this.createBoss();
  }

  private bindEvents(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.parent);
  }

  private resize(): void {
    const width = Math.max(this.parent.clientWidth, 1);
    const height = Math.max(this.parent.clientHeight, 1);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private loop = (): void => {
    if (this.destroyed) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.update(dt, this.clock.elapsedTime);
    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame(this.loop);
  };

  private update(dt: number, elapsed: number): void {
    if (this.gameOver || this.victory) {
      this.updateCamera(dt);
      this.updateFloatingObjects(dt, elapsed);
      return;
    }

    this.player.fireCooldown = Math.max(0, this.player.fireCooldown - dt);
    this.player.dashCooldown = Math.max(0, this.player.dashCooldown - dt);
    this.player.invulnerability = Math.max(0, this.player.invulnerability - dt);
    this.player.dashCharge = Math.min(1, this.player.dashCharge + dt * 0.28);
    this.toastTimer = Math.max(0, this.toastTimer - dt);

    this.updatePlatforms(elapsed);
    this.updateBoosters(dt, elapsed);
    this.updatePlayer(dt);
    this.updatePapers(elapsed);
    this.updateEnemies(dt, elapsed);
    this.updateBoss(dt, elapsed);
    this.updateProjectiles(dt);
    this.updateParticles(dt);
    this.updateBarrier(dt);
    this.updateFloatingObjects(dt, elapsed);
    this.updateCamera(dt);
    this.updateHud();
  }

  private updatePlatforms(elapsed: number): void {
    for (const platform of this.platforms) {
      platform.previousPosition.copy(platform.mesh.position);
      if (!platform.moving) continue;

      const offset = Math.sin(elapsed * platform.moving.speed + platform.moving.phase) * platform.moving.amplitude;
      const position = platform.basePosition.clone();
      position[platform.moving.axis] += offset;
      platform.mesh.position.copy(position);
    }
  }

  private updateBoosters(dt: number, elapsed: number): void {
    for (const booster of this.boosters) {
      booster.cooldown = Math.max(0, booster.cooldown - dt);
      booster.group.rotation.y += dt * 2.2;
      booster.group.position.y = booster.center.y + Math.sin(elapsed * 3 + booster.center.x) * 0.08;

      if (booster.cooldown > 0) continue;
      const distance = this.horizontalDistance(this.player.group.position, booster.center);
      if (distance > booster.radius) continue;
      if (!this.player.grounded) continue;

      const moveDirection = this.getMovementDirection();
      const boostDirection = moveDirection.lengthSq() > 0.01 ? moveDirection : this.player.facing.clone();
      this.player.velocity.x += boostDirection.x * 14;
      this.player.velocity.z += boostDirection.z * 14;
      this.player.velocity.y = Math.max(this.player.velocity.y, 10);
      this.player.dashCharge = Math.min(1, this.player.dashCharge + 0.35);
      booster.cooldown = 1.5;
      this.spawnBurst(booster.center.clone().add(new THREE.Vector3(0, 0.8, 0)), 0x5de8da, 14, 4.5);
      this.showToast('Boost pad primed Minty into the next lane.');
    }
  }

  private updatePlayer(dt: number): void {
    const moveDirection = this.getMovementDirection();
    const onGround = this.player.grounded;
    const targetSpeed = onGround ? 9.5 : 7.4;

    if (moveDirection.lengthSq() > 0) {
      const desiredX = moveDirection.x * targetSpeed;
      const desiredZ = moveDirection.z * targetSpeed;
      this.player.velocity.x = damp(this.player.velocity.x, desiredX, 10, dt);
      this.player.velocity.z = damp(this.player.velocity.z, desiredZ, 10, dt);
      this.player.facing.lerp(moveDirection, clamp01(dt * 8)).normalize();
      if (this.player.sprite) {
        const flip = this.player.facing.x < -0.05 ? -1 : 1;
        this.player.sprite.scale.x = Math.abs(this.player.sprite.scale.x) * flip;
      }
    } else {
      this.player.velocity.x = damp(this.player.velocity.x, 0, 8, dt);
      this.player.velocity.z = damp(this.player.velocity.z, 0, 8, dt);
    }

    if (!onGround) {
      this.player.velocity.y -= 28 * dt;
    } else {
      this.player.velocity.y = Math.max(this.player.velocity.y, 0);
    }

    if (this.player.groundPlatform?.moving) {
      const delta = this.player.groundPlatform.mesh.position.clone().sub(this.player.groundPlatform.previousPosition);
      this.player.group.position.add(delta);
    }

    this.player.group.position.addScaledVector(this.player.velocity, dt);
    const ground = this.sampleGround(this.player.group.position.x, this.player.group.position.z);
    const feetY = this.player.group.position.y;
    if (ground.platform && feetY <= ground.y + 0.01 && this.player.velocity.y <= 0) {
      this.player.group.position.y = ground.y;
      this.player.velocity.y = 0;
      this.player.grounded = true;
      this.player.groundPlatform = ground.platform;
    } else {
      this.player.grounded = false;
      this.player.groundPlatform = null;
    }

    if (this.barrier.active && this.barrier.mesh) {
      const nearBarrier = Math.abs(this.player.group.position.x - this.barrier.mesh.position.x) < 11;
      const hitBarrier = this.player.group.position.z < this.barrier.mesh.position.z + 1.4 && this.player.group.position.z > this.barrier.mesh.position.z - 3;
      const lowEnough = this.player.group.position.y < 11.5;
      if (nearBarrier && hitBarrier && lowEnough) {
        this.player.group.position.z = this.barrier.mesh.position.z + 1.4;
        this.player.velocity.z = Math.max(0, this.player.velocity.z);
        this.showToast('Core gate locked. Pull more papers out of the stack.');
      }
    }

    if (this.player.group.position.y < -16) {
      this.damagePlayer(16, 'Minty fell into the slop sea.');
      this.player.group.position.copy(this.player.respawn);
      this.player.velocity.set(0, 0, 0);
      this.player.grounded = false;
      this.player.groundPlatform = null;
    }

    const hover = this.player.sprite ? Math.sin(this.clock.elapsedTime * 5.4) * 0.16 : 0;
    if (this.player.sprite) {
      this.player.sprite.position.y = 2.8 + hover;
      this.player.sprite.material.opacity = this.player.invulnerability > 0 ? 0.45 + Math.sin(this.clock.elapsedTime * 32) * 0.2 : 1;
    }
    if (this.player.shadow) {
      this.player.shadow.scale.setScalar(1 + Math.min(Math.abs(this.player.velocity.y) * 0.03, 0.35));
      this.player.shadow.material.opacity = THREE.MathUtils.clamp(0.38 - Math.abs(hover) * 0.2, 0.14, 0.38);
    }
  }

  private updatePapers(elapsed: number): void {
    for (const paper of this.papers) {
      if (paper.collected) continue;
      paper.group.position.y = paper.center.y + Math.sin(elapsed * 2.3 + paper.bobOffset) * 0.32;
      paper.group.rotation.y += 0.018;
      if (this.player.group.position.distanceTo(paper.group.position) < 2.25) {
        paper.collected = true;
        paper.group.visible = false;
        this.papersCollected += 1;
        this.score += 220;
        this.player.health = Math.min(this.player.maxHealth, this.player.health + 6);
        this.player.dashCharge = Math.min(1, this.player.dashCharge + 0.24);
        this.spawnBurst(paper.group.position.clone(), 0xffffff, 16, 4.8);
        this.showToast(`Signal paper ${this.papersCollected}/12 secured.`);
        if (this.papersCollected === this.papers.length) {
          this.objective = 'Core gate open. Reach the inference crown and take it apart.';
          this.showToast('Core gate unlocked. Minty can push into the datacore.');
        }
      }
    }
  }

  private updateEnemies(dt: number, elapsed: number): void {
    for (const enemy of this.enemies) {
      if (enemy.dead) continue;

      enemy.cooldown = Math.max(0, enemy.cooldown - dt);
      const bob = Math.sin(elapsed * 2.4 + enemy.bobOffset) * 0.28;
      const toPlayer = this.player.group.position.clone().sub(enemy.group.position);
      const flatToPlayer = new THREE.Vector3(toPlayer.x, 0, toPlayer.z);
      const distance = flatToPlayer.length();

      let desired = new THREE.Vector3(
        Math.sin(elapsed * 0.9 + enemy.bobOffset) * 4,
        0,
        Math.cos(elapsed * 0.7 + enemy.bobOffset) * 4
      ).add(enemy.home);

      if (distance < 18) {
        desired = this.player.group.position.clone();
      }

      const chase = desired.sub(enemy.group.position);
      chase.y = 0;
      if (chase.lengthSq() > 0.001) {
        chase.normalize();
        enemy.velocity.x = damp(enemy.velocity.x, chase.x * 4.8, 6, dt);
        enemy.velocity.z = damp(enemy.velocity.z, chase.z * 4.8, 6, dt);
      }

      enemy.group.position.x += enemy.velocity.x * dt;
      enemy.group.position.z += enemy.velocity.z * dt;

      const ground = this.sampleGround(enemy.group.position.x, enemy.group.position.z);
      enemy.group.position.y = (ground.platform ? ground.y : enemy.home.y) + 1.6 + bob;

      enemy.group.rotation.y += dt * 1.4;

      if (distance < 16 && enemy.cooldown <= 0) {
        const direction = flatToPlayer.normalize();
        this.spawnProjectile(
          enemy.group.position.clone().add(new THREE.Vector3(0, 0.65, 0)),
          direction.multiplyScalar(12).add(new THREE.Vector3(0, 1.2, 0)),
          false,
          0xe66b3a
        );
        enemy.cooldown = THREE.MathUtils.randFloat(1.2, 2.2);
      }

      if (distance < 1.9 && this.player.invulnerability <= 0) {
        this.damagePlayer(10, 'A slop drone rammed Minty.');
      }
    }
  }

  private updateBoss(dt: number, elapsed: number): void {
    if (!this.boss) return;

    const shouldWake = this.papersCollected >= this.papers.length;
    this.boss.active = shouldWake && !this.boss.defeated;
    this.boss.group.visible = this.boss.active || this.boss.defeated;

    if (!this.boss.active) {
      this.hud.bossWrap.classList.remove('is-visible');
      return;
    }

    this.hud.bossWrap.classList.add('is-visible');
    this.boss.attackCooldown = Math.max(0, this.boss.attackCooldown - dt);
    this.boss.summonCooldown = Math.max(0, this.boss.summonCooldown - dt);

    this.boss.group.position.x = Math.sin(elapsed * 0.7) * 6.5;
    this.boss.group.position.z = -86 + Math.cos(elapsed * 0.5) * 4.8;
    this.boss.group.position.y = 15 + Math.sin(elapsed * 1.2) * 1.5;
    this.boss.group.rotation.y += dt * 0.55;
    this.boss.ring.rotation.x += dt * 1.8;
    this.boss.ring.rotation.z -= dt * 1.1;

    const toPlayer = this.player.group.position.clone().sub(this.boss.group.position);
    const flat = new THREE.Vector3(toPlayer.x, 0, toPlayer.z);

    if (this.boss.attackCooldown <= 0) {
      const baseDirection = flat.lengthSq() > 0.01 ? flat.normalize() : new THREE.Vector3(0, 0, 1);
      const spreads = [-0.26, 0, 0.26];
      spreads.forEach((spread) => {
        const direction = baseDirection.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), spread).multiplyScalar(13.5);
        direction.y = 0.8 + Math.abs(spread) * 0.4;
        this.spawnProjectile(this.boss.group.position.clone().add(new THREE.Vector3(0, 0.8, 0)), direction, false, 0xd770ff, 0.38, 12);
      });
      this.spawnBurst(this.boss.group.position.clone(), 0xc678dd, 10, 3.8);
      this.boss.attackCooldown = this.boss.health <= 10 ? 1.0 : 1.55;
    }

    if (this.boss.health <= 16 && this.boss.summonCooldown <= 0) {
      this.addEnemy(-8 + Math.random() * 16, -79 + Math.random() * 8, 10.6, 0xff9a56);
      this.addEnemy(-8 + Math.random() * 16, -92 + Math.random() * 8, 10.6, 0x6ec8ff);
      this.boss.summonCooldown = this.boss.health <= 9 ? 4.8 : 7.5;
      this.showToast('The crown is shedding more drones.');
    }

    const distance = this.player.group.position.distanceTo(this.boss.group.position);
    if (distance < 3.2 && this.player.invulnerability <= 0) {
      this.damagePlayer(18, 'Minty got clipped by the inference crown.');
    }
  }

  private updateProjectiles(dt: number): void {
    const removals: Projectile[] = [];

    for (const projectile of this.projectiles) {
      projectile.mesh.position.addScaledVector(projectile.velocity, dt);
      projectile.lifetime -= dt;

      if (projectile.friendly) {
        projectile.mesh.rotation.y += dt * 14;
      }

      if (projectile.lifetime <= 0) {
        removals.push(projectile);
        continue;
      }

      if (projectile.friendly) {
        let hit = false;
        for (const enemy of this.enemies) {
          if (enemy.dead) continue;
          if (enemy.group.position.distanceTo(projectile.mesh.position) > enemy.radius + projectile.radius) continue;
          enemy.health -= projectile.damage;
          this.spawnBurst(projectile.mesh.position.clone(), 0x8ad7ff, 8, 3.1);
          hit = true;
          if (enemy.health <= 0) {
            enemy.dead = true;
            enemy.group.visible = false;
            this.score += 140;
            this.spawnBurst(enemy.group.position.clone(), 0xffa25d, 18, 5.4);
          }
          break;
        }

        if (!hit && this.boss?.active && !this.boss.defeated) {
          if (this.boss.group.position.distanceTo(projectile.mesh.position) < 3.6) {
            this.boss.health -= projectile.damage;
            this.score += 90;
            this.spawnBurst(projectile.mesh.position.clone(), 0xc678dd, 12, 4.6);
            hit = true;
            if (this.boss.health <= 0) {
              this.boss.defeated = true;
              this.boss.active = false;
              this.victory = true;
              this.score += 1200;
              this.updateBestScore();
              this.finishRun(
                true,
                'Data Dash 64 Cleared',
                'Minty tore through the inference crown, stabilized the stack, and surfaced with the clean corpus.'
              );
            }
          }
        }

        if (hit) {
          removals.push(projectile);
          continue;
        }
      } else {
        if (this.player.group.position.distanceTo(projectile.mesh.position) < projectile.radius + 1.05 && this.player.invulnerability <= 0) {
          this.damagePlayer(projectile.damage, 'Minty got tagged by a hostile packet.');
          this.spawnBurst(projectile.mesh.position.clone(), 0xff9b74, 10, 3.2);
          removals.push(projectile);
          continue;
        }
      }

      const ground = this.sampleGround(projectile.mesh.position.x, projectile.mesh.position.z);
      if (ground.platform && projectile.mesh.position.y <= ground.y + 0.2) {
        removals.push(projectile);
      }
    }

    removals.forEach((projectile) => this.removeProjectile(projectile));
  }

  private updateParticles(dt: number): void {
    const removals: Particle[] = [];
    for (const particle of this.particles) {
      particle.lifetime -= dt;
      particle.mesh.position.addScaledVector(particle.velocity, dt);
      particle.velocity.y -= 6 * dt;

      const material = particle.mesh.material as THREE.MeshBasicMaterial;
      material.opacity = clamp01(particle.lifetime / particle.maxLifetime);
      particle.mesh.scale.setScalar(0.25 + (1 - material.opacity) * 0.35);

      if (particle.lifetime <= 0) {
        removals.push(particle);
      }
    }

    removals.forEach((particle) => {
      this.scene.remove(particle.mesh);
      particle.mesh.geometry.dispose();
      (particle.mesh.material as THREE.Material).dispose();
      this.particles.splice(this.particles.indexOf(particle), 1);
    });
  }

  private updateBarrier(dt: number): void {
    if (!this.barrier.mesh) return;

    const target = this.papersCollected >= this.papers.length ? 1 : 0;
    this.barrier.openAmount = damp(this.barrier.openAmount, target, 4.5, dt);
    this.barrier.active = this.barrier.openAmount < 0.96;
    this.barrier.mesh.position.y = 5.2 - this.barrier.openAmount * 9.5;
    this.barrier.mesh.material.opacity = clamp01(0.86 - this.barrier.openAmount * 0.82);
    this.barrier.mesh.visible = this.barrier.mesh.material.opacity > 0.04;
  }

  private updateFloatingObjects(dt: number, elapsed: number): void {
    this.world.rotation.y = Math.sin(elapsed * 0.06) * 0.02;
    if (this.toastTimer <= 0) {
      this.hud.toast.classList.remove('is-visible');
    }
  }

  private updateCamera(dt: number): void {
    const offset = new THREE.Vector3(this.player.facing.x * -5.6, 9.2, 17.8 + Math.abs(this.player.velocity.z) * 0.08);
    offset.z += this.victory ? 4.5 : 0;
    const desiredPosition = this.player.group.position.clone().add(offset);
    this.camera.position.lerp(desiredPosition, clamp01(dt * 3.8));

    const lookAhead = new THREE.Vector3(
      this.player.velocity.x * 0.18,
      this.victory ? 2.6 : 2.2,
      this.player.velocity.z * 0.18
    );
    const target = this.player.group.position.clone().add(lookAhead);
    this.camera.lookAt(target);
  }

  private tryJump(): void {
    if (this.gameOver || this.victory) return;
    if (!this.player.grounded) return;
    this.player.velocity.y = 12;
    this.player.grounded = false;
    this.spawnBurst(this.player.group.position.clone().add(new THREE.Vector3(0, 0.2, 0)), 0x5de8da, 7, 2.8);
  }

  private tryDash(): void {
    if (this.gameOver || this.victory) return;
    if (this.player.dashCooldown > 0 || this.player.dashCharge < 0.15) return;

    const direction = this.getMovementDirection();
    const dashDirection = direction.lengthSq() > 0.01 ? direction : this.player.facing.clone();
    this.player.velocity.x += dashDirection.x * 18;
    this.player.velocity.z += dashDirection.z * 18;
    this.player.velocity.y = Math.max(this.player.velocity.y, 2.5);
    this.player.dashCharge = Math.max(0, this.player.dashCharge - 0.45);
    this.player.dashCooldown = 0.24;
    this.spawnBurst(this.player.group.position.clone().add(new THREE.Vector3(0, 1.4, 0)), 0x2ec4b6, 12, 4.1);
    this.showToast('Minty kicked into a data dash.');
  }

  private firePaper(): void {
    if (this.gameOver || this.victory) return;
    if (this.player.fireCooldown > 0) return;

    const forward = this.player.facing.lengthSq() > 0.001 ? this.player.facing.clone() : new THREE.Vector3(0, 0, -1);
    const velocity = forward.multiplyScalar(24);
    velocity.y = 0.8;
    const spawnPosition = this.player.group.position.clone().add(new THREE.Vector3(0, 2.2, 0));
    this.spawnProjectile(spawnPosition, velocity, true, 0xffffff, 0.22, 1);
    this.player.fireCooldown = 0.2;
  }

  private spawnProjectile(
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    friendly: boolean,
    color: number,
    radius = 0.24,
    damage = 1
  ): void {
    const geometry = friendly ? this.playerProjectileGeometry : this.enemyProjectileGeometry;
    const material = friendly ? this.playerProjectileMaterial.clone() : this.enemyProjectileMaterial.clone();
    material.color = new THREE.Color(color);
    if ('emissive' in material) {
      material.emissive = new THREE.Color(color);
      material.emissiveIntensity = friendly ? 0.85 : 1.15;
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = friendly;
    mesh.receiveShadow = false;
    mesh.position.copy(position);
    this.scene.add(mesh);
    this.projectiles.push({
      mesh,
      velocity,
      lifetime: friendly ? 1.8 : 3.2,
      friendly,
      radius,
      damage,
    });
  }

  private removeProjectile(projectile: Projectile): void {
    const index = this.projectiles.indexOf(projectile);
    if (index >= 0) this.projectiles.splice(index, 1);
    this.scene.remove(projectile.mesh);
    if (projectile.mesh.material instanceof THREE.Material) {
      projectile.mesh.material.dispose();
    }
  }

  private sampleGround(x: number, z: number): GroundSample {
    let bestPlatform: Platform | null = null;
    let bestY = -Infinity;
    for (const platform of this.platforms) {
      const dx = Math.abs(x - platform.mesh.position.x);
      const dz = Math.abs(z - platform.mesh.position.z);
      if (dx <= platform.width / 2 && dz <= platform.depth / 2) {
        if (platform.topY > bestY) {
          bestY = platform.topY;
          bestPlatform = platform;
        }
      }
    }

    return {
      y: bestPlatform ? bestPlatform.topY : -Infinity,
      platform: bestPlatform,
    };
  }

  private getMovementDirection(): THREE.Vector3 {
    const direction = new THREE.Vector3();
    if (this.keyState.has('KeyW') || this.keyState.has('ArrowUp')) direction.z -= 1;
    if (this.keyState.has('KeyS') || this.keyState.has('ArrowDown')) direction.z += 1;
    if (this.keyState.has('KeyA') || this.keyState.has('ArrowLeft')) direction.x -= 1;
    if (this.keyState.has('KeyD') || this.keyState.has('ArrowRight')) direction.x += 1;
    if (direction.lengthSq() > 0) direction.normalize();
    return direction;
  }

  private damagePlayer(amount: number, reason: string): void {
    if (this.player.invulnerability > 0 || this.gameOver || this.victory) return;
    this.player.health = Math.max(0, this.player.health - amount);
    this.player.invulnerability = 0.85;
    this.spawnBurst(this.player.group.position.clone().add(new THREE.Vector3(0, 1.4, 0)), 0xff8973, 16, 4.2);
    this.showToast(reason);
    if (this.player.health <= 0) {
      this.gameOver = true;
      this.updateBestScore();
      this.finishRun(false, 'Minty Lost The Signal', 'The stack overwhelmed Minty before the datacore could be stabilized.');
      return;
    }

    const knockback = this.player.facing.clone().multiplyScalar(-6);
    this.player.velocity.x += knockback.x;
    this.player.velocity.z += knockback.z;
    this.player.velocity.y = Math.max(this.player.velocity.y, 6);
  }

  private finishRun(victory: boolean, heading: string, copy: string): void {
    this.hud.finishHeading.textContent = heading;
    this.hud.finishCopy.textContent = copy;
    this.hud.finish.classList.add('is-visible');
    this.hud.restartButton.textContent = victory ? 'Run It Again' : 'Restart Run';
  }

  private restart(): void {
    this.destroy();
    void createDataDash64({
      parentId: this.parent.id,
      assetBase: this.normalizedBase,
    });
  }

  private updateHud(): void {
    this.hud.objective.textContent = this.objective;
    this.hud.paperCount.textContent = `${this.papersCollected} / ${this.papers.length}`;
    this.hud.score.textContent = `${this.score}`;
    this.hud.best.textContent = `${Math.max(this.bestScore, this.score)}`;
    this.hud.healthFill.style.transform = `scaleX(${clamp01(this.player.health / this.player.maxHealth)})`;
    this.hud.dashFill.style.transform = `scaleX(${clamp01(this.player.dashCharge)})`;
    this.hud.bossFill.style.transform = `scaleX(${this.boss && this.boss.maxHealth > 0 ? clamp01(this.boss.health / this.boss.maxHealth) : 0})`;
  }

  private updateBestScore(): void {
    if (this.score <= this.bestScore) return;
    this.bestScore = this.score;
    localStorage.setItem('data-dash-64-best', String(this.bestScore));
  }

  private showToast(message: string): void {
    this.hud.toast.textContent = message;
    this.hud.toast.classList.add('is-visible');
    this.toastTimer = 2.2;
  }

  private addPlatform(
    x: number,
    z: number,
    width: number,
    depth: number,
    topY: number,
    color: number,
    moving?: Platform['moving']
  ): void {
    const thickness = 1.6;
    const geometry = new THREE.BoxGeometry(width, thickness, depth);
    const material = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.12,
      roughness: 0.44,
      emissive: new THREE.Color(color).multiplyScalar(0.08),
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, topY - thickness / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({ color: 0x5de8da, transparent: true, opacity: 0.48 })
    );
    mesh.add(edges);

    const platform: Platform = {
      mesh,
      width,
      depth,
      topY,
      basePosition: mesh.position.clone(),
      previousPosition: mesh.position.clone(),
      moving,
    };
    this.platforms.push(platform);
  }

  private addBooster(x: number, z: number, topY: number, color: number): void {
    const group = new THREE.Group();
    group.position.set(x, topY, z);

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.9, 0.32, 20),
      new THREE.MeshStandardMaterial({
        color: 0x111a24,
        emissive: new THREE.Color(color).multiplyScalar(0.4),
        emissiveIntensity: 0.9,
        metalness: 0.65,
        roughness: 0.25,
      })
    );
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.4, 0.14, 8, 24),
      new THREE.MeshBasicMaterial({ color })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.18;
    group.add(ring);

    const arrow = new THREE.Mesh(
      new THREE.ConeGeometry(0.42, 1.1, 5),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: new THREE.Color(color),
        emissiveIntensity: 1,
      })
    );
    arrow.rotation.z = -Math.PI / 2;
    arrow.position.set(0, 0.48, 0);
    group.add(arrow);

    this.scene.add(group);
    this.boosters.push({
      group,
      center: new THREE.Vector3(x, topY, z),
      radius: 1.9,
      cooldown: 0,
    });
  }

  private addPaper(x: number, z: number, topY: number): void {
    const group = new THREE.Group();
    group.position.set(x, topY + 1.2, z);

    const sheet = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.1, 0.12),
      new THREE.MeshStandardMaterial({
        color: 0xf6fbff,
        emissive: 0x9ed9ff,
        emissiveIntensity: 0.35,
        metalness: 0.08,
        roughness: 0.14,
      })
    );
    group.add(sheet);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.7, 0.98, 24),
      new THREE.MeshBasicMaterial({
        color: 0x5de8da,
        transparent: true,
        opacity: 0.42,
        side: THREE.DoubleSide,
      })
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = -0.42;
    group.add(halo);

    this.scene.add(group);
    this.papers.push({
      group,
      center: new THREE.Vector3(x, topY + 1.2, z),
      collected: false,
      bobOffset: Math.random() * Math.PI * 2,
    });
  }

  private addEnemy(x: number, z: number, topY: number, color: number): void {
    const group = new THREE.Group();
    group.position.set(x, topY + 1.6, z);

    const body = new THREE.Mesh(
      new THREE.SphereGeometry(1.1, 18, 18),
      new THREE.MeshStandardMaterial({
        color,
        emissive: new THREE.Color(color).multiplyScalar(0.32),
        emissiveIntensity: 0.8,
        roughness: 0.35,
        metalness: 0.18,
      })
    );
    body.castShadow = true;
    group.add(body);

    for (let index = 0; index < 6; index += 1) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.12, 1.1, 6),
        new THREE.MeshStandardMaterial({
          color: 0x111111,
          emissive: new THREE.Color(color).multiplyScalar(0.1),
        })
      );
      const angle = (index / 6) * Math.PI * 2;
      leg.position.set(Math.cos(angle) * 0.95, -0.9, Math.sin(angle) * 0.95);
      leg.rotation.z = Math.PI / 2.6;
      leg.rotation.y = angle;
      group.add(leg);
    }

    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    eye.position.set(0, 0.15, 0.95);
    group.add(eye);

    this.scene.add(group);
    this.enemies.push({
      group,
      velocity: new THREE.Vector3(),
      home: new THREE.Vector3(x, topY + 1.6, z),
      health: 3,
      cooldown: THREE.MathUtils.randFloat(0.8, 1.8),
      bobOffset: Math.random() * 10,
      radius: 1.4,
      dead: false,
    });
  }

  private createBarrier(): void {
    const material = new THREE.MeshBasicMaterial({
      color: 0x2ec4b6,
      transparent: true,
      opacity: 0.86,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(22, 12), material);
    mesh.position.set(0, 5.2, -72);
    this.scene.add(mesh);
    this.barrier.mesh = mesh;
  }

  private createBoss(): void {
    const group = new THREE.Group();
    group.visible = false;

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.6, 1),
      new THREE.MeshStandardMaterial({
        color: 0x0f1118,
        emissive: 0xc678dd,
        emissiveIntensity: 1.05,
        metalness: 0.42,
        roughness: 0.16,
      })
    );
    core.castShadow = true;
    group.add(core);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(4.1, 0.32, 12, 42),
      new THREE.MeshStandardMaterial({
        color: 0x79d6ff,
        emissive: 0x39bdf8,
        emissiveIntensity: 1.2,
        metalness: 0.75,
        roughness: 0.22,
      })
    );
    ring.rotation.x = Math.PI / 2.6;
    group.add(ring);

    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(1.8, 1.6, 6),
      new THREE.MeshStandardMaterial({
        color: 0xffc857,
        emissive: 0xffb347,
        emissiveIntensity: 0.85,
      })
    );
    crown.position.y = 3.2;
    group.add(crown);

    group.position.set(0, 15, -86);
    this.scene.add(group);

    this.boss = {
      group,
      core,
      ring,
      health: 24,
      maxHealth: 24,
      attackCooldown: 1.6,
      summonCooldown: 6.5,
      active: false,
      defeated: false,
    };
  }

  private createStarfield(): THREE.Points {
    const geometry = new THREE.BufferGeometry();
    const count = 1100;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = THREE.MathUtils.randFloatSpread(260);
      positions[i * 3 + 1] = THREE.MathUtils.randFloat(18, 120);
      positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(260);
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x90d9ff,
      size: 0.45,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    return new THREE.Points(geometry, material);
  }

  private createBackdropBands(): THREE.Group {
    const group = new THREE.Group();
    for (let index = 0; index < 8; index += 1) {
      const band = new THREE.Mesh(
        new THREE.PlaneGeometry(140, 1.8),
        new THREE.MeshBasicMaterial({
          color: index % 2 === 0 ? 0x123146 : 0x1a2244,
          transparent: true,
          opacity: 0.14,
          side: THREE.DoubleSide,
        })
      );
      band.position.set(0, 4 + index * 7, -110 - index * 16);
      group.add(band);
    }
    return group;
  }

  private createFarGrid(): THREE.LineSegments {
    const points: number[] = [];
    const size = 160;
    const step = 8;
    for (let i = -size; i <= size; i += step) {
      points.push(-size, -2.5, i, size, -2.5, i);
      points.push(i, -2.5, -size, i, -2.5, size);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    const material = new THREE.LineBasicMaterial({
      color: 0x14455b,
      transparent: true,
      opacity: 0.22,
    });
    return new THREE.LineSegments(geometry, material);
  }

  private createAmbientArchitecture(): THREE.Group {
    const group = new THREE.Group();
    const towerMaterial = new THREE.MeshStandardMaterial({
      color: 0x0d1622,
      emissive: 0x103044,
      emissiveIntensity: 0.35,
      metalness: 0.52,
      roughness: 0.48,
    });

    const towers = [
      new THREE.Vector3(-52, 6, 4),
      new THREE.Vector3(50, 7, -6),
      new THREE.Vector3(-58, 10, -52),
      new THREE.Vector3(56, 8, -68),
      new THREE.Vector3(0, 12, -112),
    ];

    towers.forEach((position, index) => {
      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(5 + (index % 2) * 2, 14 + index * 2, 5 + (index % 3)),
        towerMaterial
      );
      tower.position.copy(position);
      tower.castShadow = true;
      tower.receiveShadow = true;
      group.add(tower);

      const strips = new THREE.Mesh(
        new THREE.PlaneGeometry(1, tower.scale.y ? tower.scale.y : 14),
        new THREE.MeshBasicMaterial({
          color: index % 2 === 0 ? 0x5de8da : 0xffb347,
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide,
        })
      );
      strips.position.set(position.x + 2.6, position.y, position.z + 0.2);
      group.add(strips);
    });

    return group;
  }

  private horizontalDistance(a: THREE.Vector3, b: THREE.Vector3): number {
    return Math.hypot(a.x - b.x, a.z - b.z);
  }

  private spawnBurst(origin: THREE.Vector3, color: number, count: number, speed: number): void {
    for (let index = 0; index < count; index += 1) {
      const direction = new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(2),
        THREE.MathUtils.randFloat(0.4, 1.4),
        THREE.MathUtils.randFloatSpread(2)
      ).normalize();

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.08 + Math.random() * 0.07, 6, 6),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 1,
        })
      );
      mesh.position.copy(origin);
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: direction.multiplyScalar(speed * THREE.MathUtils.randFloat(0.4, 1.1)),
        lifetime: THREE.MathUtils.randFloat(0.45, 0.9),
        maxLifetime: 0.9,
      });
    }
  }
}

export async function createDataDash64(options: DataDash64Options): Promise<DataDash64Game> {
  const game = new DataDash64Game(options);
  await game.init();
  return game;
}
