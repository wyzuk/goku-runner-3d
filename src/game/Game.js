import * as THREE from 'three';
import { GameState, GAME_STATES } from './GameState.js';
import { GameLoop } from './GameLoop.js';
import { InputManager } from './InputManager.js';
import { ScoreManager } from './ScoreManager.js';
import { DifficultyManager } from './DifficultyManager.js';
import { PhysicsEngine } from '../physics/PhysicsEngine.js';
import { PhysicsDebug } from '../physics/PhysicsDebug.js';
import { DebugHUD } from '../ui/DebugHUD.js';
import { Player } from '../player/Player.js';
import { PlayerController } from '../player/PlayerController.js';
import { World } from '../world/World.js';
import { ObstacleManager } from '../obstacles/ObstacleManager.js';
import { CollectibleManager } from '../collectibles/CollectibleManager.js';
import { ParticleSystem } from '../effects/ParticleSystem.js';
import { SpeedLines } from '../effects/SpeedLines.js';
import { FollowCamera } from '../camera/FollowCamera.js';
import { AudioManager } from '../audio/AudioManager.js';
import { ProgressionManager } from '../progression/ProgressionManager.js';
import { ScoreMultiplier } from '../progression/ScoreMultiplier.js';
import { MilestoneManager } from '../progression/MilestoneManager.js';
import { AchievementManager } from '../progression/AchievementManager.js';
import { ChallengeManager } from '../progression/ChallengeManager.js';
import { UIManager } from '../ui/UIManager.js';
import { modelLoader } from '../utils/ModelAssetLoader.js';

export class Game {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.gameState = new GameState();

    // 1. Core Three.js Engine
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 350);
    this.scene.add(this.camera);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 2. Progression & Audio
    this.progression = new ProgressionManager();
    this.scoreMultiplier = new ScoreMultiplier();
    this.scoreManager = new ScoreManager(this.scoreMultiplier);
    this.difficulty = new DifficultyManager();
    this.milestones = new MilestoneManager(this.progression);
    this.achievements = new AchievementManager(this.progression);
    this.challenges = new ChallengeManager(this.progression);
    this.audio = new AudioManager();

    // 3. Physics & Player
    this.physics = new PhysicsEngine();
    this.player = new Player(this.physics);
    this.playerController = new PlayerController(this.player);
    this.scene.add(this.player.mesh);

    // Physics Debug wireframes & Dev Monitor
    this.physicsDebug = new PhysicsDebug(this.scene);
    this.debugHUD = new DebugHUD(this.container);

    // 4. World & Managers
    this.world = new World(this.scene);
    this.obstacleManager = new ObstacleManager(this.scene);
    this.collectibleManager = new CollectibleManager(this.scene);
    this.particles = new ParticleSystem(this.scene);
    this.followCamera = new FollowCamera(this.camera);
    this.speedLines = new SpeedLines(this.camera);

    // Hook World chunk generation to spawn obstacles & collectibles
    this.world.chunkManager.onChunkGenerated = (chunk, startZ, endZ, biome) => {
      if (this.gameState.is(GAME_STATES.PLAYING)) {
        this.obstacleManager.spawnForChunk(startZ, endZ, this.difficulty.currentStageIndex + 1);
        this.collectibleManager.spawnForChunk(startZ, endZ);
      }
    };

    // 5. Input System
    this.input = new InputManager();
    this.input.onAction((action) => this.handleAction(action));

    // 6. UI Manager
    this.ui = new UIManager(this);

    // 7. Setup Game Callbacks
    this.setupCallbacks();

    // 8. Game Loop
    this.loop = new GameLoop(
      (dt, totalTime) => this.update(dt, totalTime),
      () => this.render()
    );

    // 9. Resize & Focus Listeners
    window.addEventListener('resize', () => this.onResize());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.gameState.is(GAME_STATES.PLAYING)) {
        this.togglePause();
      }
    });

    // Footstep audio timing
    this.footstepTimer = 0;

    // Start in Menu state
    this.world.init();
    this.followCamera.init(this.player.position);
    this.ui.showMenu(this.progression.profile);
    this.loop.start();

    // Asynchronously preload all 3D environment & obstacle models
    modelLoader.preloadAll().then(() => {
      console.log('[Game] 3D Models loaded. Refreshing active world chunk geometries...');
      if (this.world && this.world.chunkManager) {
        this.world.chunkManager.refreshGeometries();
      }
      if (this.gameState.is(GAME_STATES.MENU)) {
        this.world.reset();
      }
    });
  }

  setPlayerSkin(skinName) {
    if (this.player && this.player.gokuModel) {
      this.player.gokuModel.setSkin(skinName);
      console.log(`[Game] Switched player skin to: ${skinName}`);
    }
  }

  setGraphicsQuality(preset = 'HIGH') {
    this.graphicsQuality = preset;
    const isLow = preset === 'LOW';
    const isMed = preset === 'MEDIUM';
    const isHigh = preset === 'HIGH';
    const isUltra = preset === 'ULTRA';

    if (isLow) {
      this.renderer.setPixelRatio(1.0);
      if (this.world && this.world.dirLight) {
        this.world.dirLight.castShadow = false;
        this.renderer.shadowMap.enabled = false;
      }
    } else {
      this.renderer.shadowMap.enabled = true;
      if (this.world && this.world.dirLight) {
        this.world.dirLight.castShadow = true;
        const mapSize = isMed ? 1024 : (isUltra ? 2048 : 1024);
        this.world.dirLight.shadow.mapSize.width = mapSize;
        this.world.dirLight.shadow.mapSize.height = mapSize;
      }
      if (isMed) {
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
      } else if (isHigh) {
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      } else if (isUltra) {
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
      }
    }

    if (this.world && this.world.chunkManager) {
      this.world.chunkManager.setQualityPreset(preset);
    }
    console.log(`[Game] Applied graphics preset: ${preset}`);
  }

  setupCallbacks() {
    // Collision Response
    this.physics.onCollision = (obstacle) => {
      if (this.player.powerUps.isInvulnerable()) {
        // Smash obstacle if in Super Saiyan or Nimbus/Senzu!
        obstacle.active = false;
        this.scene.remove(obstacle.group);
        if (this.obstacleManager && this.obstacleManager.factory) {
          this.obstacleManager.factory.createDebris(obstacle.position, this.scene);
        }
        this.particles.spawnBurst(obstacle.position, 'GOLD', 22);
        this.followCamera.triggerShake(0.35, 0.25);
        this.audio.playCrash();
        this.scoreManager.addObstacleAvoided();
        return;
      }

      // Lethal collision
      this.handleGameOver();
    };

    // Audio hooks for player movement
    this.player.onJumpCallback = () => this.audio.playJump();
    this.player.onSlideCallback = () => this.audio.playSlide();
    this.player.onLandCallback = () => {
      this.audio.playLand();
      this.particles.spawnBurst(this.player.position, 'DUST', 8);
    };

    // Collectibles collection callbacks
    this.collectibleManager.onDragonBallCollected = (starCount, pos) => {
      this.audio.playDragonBall();
      this.particles.spawnBurst(pos, 'GOLD', 16);
      this.scoreManager.addDragonBall(starCount, this.player.powerUps.getScoreMultiplier());
      this.achievements.unlock('DB_FIRST');
      if (this.scoreManager.dragonBalls >= 7) {
        this.achievements.unlock('DB_SEVEN');
      }
      if (this.progression.profile.totalDragonBalls >= 100) {
        this.achievements.unlock('DB_100_TOTAL');
      }
    };

    this.collectibleManager.onKiCollected = (pos) => {
      this.audio.playKi();
      this.particles.spawnBurst(pos, 'CYAN', 10);
      this.player.transformation.addKi(12);
      this.scoreManager.addKiOrb(this.player.powerUps.getScoreMultiplier());
      if (this.progression.profile.totalKiOrbs >= 1000) {
        this.achievements.unlock('KI_1000');
      }
    };

    this.collectibleManager.onPowerUpCollected = (type, pos) => {
      this.audio.playPowerUp();
      this.particles.spawnBurst(pos, 'GOLD', 20);
      this.player.powerUps.activate(type);
      if (type === 'NIMBUS') {
        this.achievements.unlock('NIMBUS_RIDER');
      }
    };

    // Super Saiyan Transformation Callbacks
    this.player.transformation.onTransformStart = () => {
      this.audio.playTransform();
      this.followCamera.triggerTransformationCinematic(0.85);
      this.particles.spawnBurst(this.player.position, 'GOLD', 30);
      this.achievements.unlock('SSJ_TRANSFORM');
    };

    this.player.transformation.onTransformComplete = () => {
      this.audio.setSuperSaiyanMusic(true);
      this.followCamera.triggerShake(0.5, 0.4);
    };

    this.player.transformation.onRevert = () => {
      this.audio.setSuperSaiyanMusic(false);
    };

    // Milestone Celebration
    this.milestones.onMilestoneReached = (ms) => {
      this.audio.playMilestone();
      this.ui.hud.showMilestone(ms);
      if (ms.distance >= 100) this.achievements.unlock('DIST_100');
      if (ms.distance >= 1000) this.achievements.unlock('DIST_1000');
      if (ms.distance >= 10000) this.achievements.unlock('DIST_10000');
    };

    // Combo Achievement check
    this.scoreMultiplier.onComboChange = (comboCount, multiplier) => {
      if (comboCount >= 10) this.achievements.unlock('COMBO_10X');
      if (multiplier >= 3.0) this.achievements.unlock('COMBO_20X');
    };
  }

  handleAction(action) {
    if (action === 'PAUSE') {
      if (this.gameState.is(GAME_STATES.PLAYING) || this.gameState.is(GAME_STATES.PAUSED)) {
        this.togglePause();
      }
      return;
    }

    if (action === 'TOGGLE_DEBUG') {
      this.physicsDebug.toggle();
      this.debugHUD.toggle();
      return;
    }

    if (this.gameState.is(GAME_STATES.PLAYING)) {
      this.playerController.handleAction(action);
    }
  }

  startRun() {
    this.audio.unlockAudio();
    this.gameState.set(GAME_STATES.PLAYING);
    this.resetRunState();
    this.ui.showGameplay();
    this.audio.startMusic(false);
  }

  restartRun() {
    this.startRun();
  }

  resumeRun() {
    this.gameState.set(GAME_STATES.PLAYING);
    this.ui.hidePause();
    this.input.setEnabled(true);
  }

  togglePause() {
    if (this.gameState.is(GAME_STATES.PLAYING)) {
      this.gameState.set(GAME_STATES.PAUSED);
      this.ui.showPause();
      this.input.setEnabled(false);
    } else if (this.gameState.is(GAME_STATES.PAUSED)) {
      this.resumeRun();
    }
  }

  returnToMenu() {
    this.gameState.set(GAME_STATES.MENU);
    this.audio.stopMusic();
    this.resetRunState();
    this.ui.showMenu(this.progression.profile);
    this.input.setEnabled(true);
  }

  resetRunState() {
    this.player.reset();
    this.world.reset();
    this.obstacleManager.reset();
    this.collectibleManager.reset();
    this.scoreManager.reset();
    this.scoreMultiplier.reset();
    this.difficulty.reset();
    this.milestones.reset();
    this.particles.reset();
    this.followCamera.init(this.player.position);
  }

  handleGameOver() {
    this.gameState.set(GAME_STATES.GAME_OVER);
    this.player.die();
    this.audio.playCrash();
    this.audio.stopMusic();
    this.followCamera.triggerShake(0.6, 0.5);

    const stats = this.scoreManager.getStats();
    const previousBest = this.progression.profile.highScore;

    // Record stats and calculate XP
    this.progression.recordRun({
      score: stats.score,
      distance: stats.distance,
      dragonBalls: stats.dragonBalls,
      kiOrbs: stats.kiOrbs,
      survivalTime: stats.survivalTime,
      obstaclesAvoided: stats.obstaclesAvoided
    });

    const gainedXp = Math.floor(stats.distance * 0.4 + stats.dragonBalls * 80 + stats.score * 0.05);
    this.progression.addXp(gainedXp);

    // Update daily challenges
    this.challenges.updateProgress(stats.distance, stats.dragonBalls, stats.kiOrbs, stats.obstaclesAvoided);

    setTimeout(() => {
      this.ui.showGameOver({
        score: stats.score,
        previousBest,
        distance: stats.distance,
        dragonBalls: stats.dragonBalls,
        maxCombo: stats.maxCombo
      });
    }, 1200);
  }

  update(dt, totalTime) {
    if (this.gameState.is(GAME_STATES.MENU)) {
      // Idle / preview Goku facing camera in Main Menu
      this.player.animation.update(dt, 0, true, false, 0);
      this.player.gokuModel.update(totalTime, dt);
      this.camera.position.set(0, 1.45, 3.4);
      this.camera.lookAt(0, 0.95, 0);
      return;
    }

    if (this.gameState.is(GAME_STATES.PAUSED)) {
      return;
    }

    // 1. Difficulty & Speed Progression
    const currentDist = this.player.position.z;
    const diffInfo = this.difficulty.update(currentDist);
    this.physics.setBaseSpeed(diffInfo.targetSpeed);

    // Check Max Speed Achievement
    if (this.physics.getCurrentSpeed() >= 30) {
      this.achievements.unlock('MAX_SPEED');
    }

    // 2. Player Update
    const activeObstacles = this.obstacleManager.getActiveObstacles();
    this.player.update(dt, totalTime, activeObstacles);

    // 3. Footstep Sound Generation
    if (!this.player.isDead && this.physics.isGrounded && !this.physics.isSliding) {
      this.footstepTimer += dt * this.physics.getCurrentSpeed();
      if (this.footstepTimer >= 4.0) {
        this.footstepTimer = 0;
        this.audio.playFootstep();
        this.particles.spawnFootstepDust(this.player.position);
      }
    }

    // 4. World & Managers
    this.world.update(dt, this.player.position.z);
    this.obstacleManager.update(dt, this.player.position.z);
    this.collectibleManager.update(
      dt,
      totalTime,
      this.player.position,
      this.player.powerUps.hasMagnet()
    );

    // 5. Score & Progression
    const deltaDistance = this.physics.getCurrentSpeed() * dt;
    this.scoreManager.addDistance(deltaDistance, this.player.powerUps.getScoreMultiplier());
    this.scoreManager.update(dt);
    this.scoreMultiplier.update(dt);
    this.milestones.checkDistance(this.player.position.z);

    // Survival duration achievement
    if (this.scoreManager.survivalTime >= 300) {
      this.achievements.unlock('SURVIVE_5MIN');
    }

    // 6. Camera & Visual FX
    this.followCamera.update(
      dt,
      this.player.position,
      this.physics.getCurrentSpeed(),
      this.physics.laneTilt
    );
    this.speedLines.update(
      dt,
      this.physics.getCurrentSpeed(),
      this.player.transformation.isSuperSaiyan
    );
    this.particles.update(
      dt,
      this.player.position,
      this.player.transformation.isSuperSaiyan
    );

    // 7. Physics Debug Update
    this.physicsDebug.update(
      this.player.position,
      this.physics.isSliding,
      activeObstacles
    );
    this.debugHUD.update(this);

    // 8. HUD Update
    const stats = this.scoreManager.getStats();
    stats.speed = this.physics.getCurrentSpeed();
    stats.comboCount = this.scoreMultiplier.comboCount;
    stats.multiplier = this.scoreMultiplier.getMultiplier();

    this.ui.hud.update(
      stats,
      this.player.transformation.ki,
      this.player.transformation.isSuperSaiyan,
      this.player.powerUps.activePowerUps,
      diffInfo.stageName
    );

    // Mobile SSJ button alert
    this.ui.touchControls.updateKiState(this.player.transformation.canTransform());
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }
}
