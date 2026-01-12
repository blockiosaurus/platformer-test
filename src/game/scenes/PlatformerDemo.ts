import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { ParameterRegistry, getGlobalRegistry, setGlobalRegistry } from '../config/ParameterRegistry';
import { Player } from '../entities/Player';
import { InputManager } from '../systems/InputManager';
import { DebugRenderer } from '../systems/DebugRenderer';
import { LevelBuilder, LevelObjects, MovingPlatform } from '../levels/LevelBuilder';
import { TEST_LEVEL, getSpawnPosition } from '../levels/TestLevel';

export class PlatformerDemo extends Scene {
  private player!: Player;
  private inputManager!: InputManager;
  private debugRenderer!: DebugRenderer;
  private levelObjects!: LevelObjects;
  private paramRegistry!: ParameterRegistry;

  // Controls panel UI
  private controlsHeader!: Phaser.GameObjects.Text;
  private controlsBackground!: Phaser.GameObjects.Rectangle;
  private controlsText!: Phaser.GameObjects.Text;
  private controlsCollapsed: boolean = false;

  constructor() {
    super('PlatformerDemo');
  }

  init(): void {
    // Get or create the parameter registry
    this.paramRegistry = getGlobalRegistry();
  }

  preload(): void {
    this.load.setPath('assets');

    // Character sprites
    this.load.image('character_idle', 'character_0000.png');
    this.load.image('character_step', 'character_0001.png');

    // Background tiles
    this.load.image('bg_sky', 'background_0000.png');
    this.load.image('bg_cloud_top', 'background_0001.png');
    this.load.image('bg_cloud', 'background_0002.png');

    // Platform tiles (static)
    this.load.image('tile_single', 'tile_0000.png');
    this.load.image('tile_left', 'tile_0001.png');
    this.load.image('tile_mid', 'tile_0002.png');
    this.load.image('tile_right', 'tile_0003.png');

    // One-way platform tiles
    this.load.image('oneway_left', 'tile_0014.png');
    this.load.image('oneway_mid', 'tile_0013.png');
    this.load.image('oneway_right', 'tile_0015.png');

    // Moving platform tiles
    this.load.image('moving_left', 'tile_0041.png');
    this.load.image('moving_mid', 'tile_0042.png');
    this.load.image('moving_right', 'tile_0043.png');

    // Wall tile
    this.load.image('wall_tile', 'tile_0056.png');
  }

  create(): void {
    // Set background color
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Setup physics world bounds
    this.physics.world.setBounds(0, 0, TEST_LEVEL.bounds.width, TEST_LEVEL.bounds.height);

    // Build level
    const levelBuilder = new LevelBuilder(this);
    this.levelObjects = levelBuilder.buildLevel(TEST_LEVEL);

    // Create input manager
    this.inputManager = new InputManager(this);

    // Create debug renderer
    this.debugRenderer = new DebugRenderer(this);
    this.debugRenderer.setLevelObjects(this.levelObjects);

    // Create player
    const spawn = getSpawnPosition();
    this.player = new Player(this, spawn.x, spawn.y, this.paramRegistry);
    this.player.setInputManager(this.inputManager);
    this.player.start();

    // Setup collisions
    this.setupCollisions();

    // Setup camera
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, TEST_LEVEL.bounds.width, TEST_LEVEL.bounds.height);
    this.cameras.main.setZoom(1);

    // Add instructions text
    this.addInstructions();

    // Setup event listeners
    this.setupEventListeners();

    // Emit debug info periodically
    this.time.addEvent({
      delay: 50,
      callback: () => this.emitDebugInfo(),
      loop: true
    });

    // Notify React that scene is ready
    EventBus.emit('current-scene-ready', this);
  }

  private setupCollisions(): void {
    // Static platform collision
    this.physics.add.collider(this.player, this.levelObjects.platforms);

    // Wall collision
    this.physics.add.collider(this.player, this.levelObjects.walls);

    // One-way platform collision
    this.physics.add.collider(
      this.player,
      this.levelObjects.oneWayPlatforms,
      undefined,
      (player, platform) => {
        const playerBody = (player as Player).body as Phaser.Physics.Arcade.Body;
        const platformBody = (platform as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.StaticBody;

        // Only collide if player is falling and feet are above platform
        const playerBottom = playerBody.y + playerBody.height;
        const platformTop = platformBody.y;

        // Allow passing through if moving up or if bottom is below platform top
        if (playerBody.velocity.y < 0) {
          return false;
        }

        // Check if player is holding down to drop through
        if (this.inputManager.downPressed && playerBody.velocity.y >= 0) {
          return false;
        }

        // Scale tolerance with fall speed - faster falling = more penetration per frame
        const tolerance = Math.max(4, playerBody.velocity.y * 0.025);
        return playerBottom <= platformTop + tolerance;
      },
      this
    );

    // Moving platform collision
    this.physics.add.collider(
      this.player,
      this.levelObjects.movingPlatforms,
      (player, platform) => {
        const p = player as Player;
        const mp = platform as MovingPlatform;
        const playerBody = p.body as Phaser.Physics.Arcade.Body;

        // Carry player with platform if standing on it
        if (playerBody.touching.down) {
          p.x += mp.deltaX;
          p.y += mp.deltaY;
        }
      }
    );
  }

  private addInstructions(): void {
    const camWidth = this.cameras.main.width;

    // Create collapsible header (right-aligned)
    this.controlsHeader = this.add.text(camWidth - 10, 10, 'Controls [-]', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#000000cc',
      padding: { x: 6, y: 4 }
    });
    this.controlsHeader.setOrigin(1, 0);
    this.controlsHeader.setScrollFactor(0);
    this.controlsHeader.setDepth(102);
    this.controlsHeader.setInteractive({ useHandCursor: true });
    this.controlsHeader.on('pointerdown', () => this.toggleControls());

    // Create background
    const bgWidth = 180;
    const bgHeight = 130;
    this.controlsBackground = this.add.rectangle(
      camWidth - 10 - bgWidth,
      30,
      bgWidth,
      bgHeight,
      0x000000,
      0.75
    );
    this.controlsBackground.setOrigin(0, 0);
    this.controlsBackground.setScrollFactor(0);
    this.controlsBackground.setDepth(100);

    // Create controls text
    const instructions = [
      'Arrow Keys / WASD - Move',
      'Space / Up - Jump',
      'Shift - Dash',
      'S / Down - Drop through',
      'R - Reset position',
      'F1 - Toggle debug'
    ].join('\n');

    this.controlsText = this.add.text(
      camWidth - 18,
      38,
      instructions,
      {
        fontSize: '11px',
        color: '#cccccc',
        fontFamily: 'monospace',
        lineSpacing: 2
      }
    );
    this.controlsText.setOrigin(1, 0);
    this.controlsText.setScrollFactor(0);
    this.controlsText.setDepth(101);
  }

  private toggleControls(): void {
    this.controlsCollapsed = !this.controlsCollapsed;
    this.controlsHeader.setText(this.controlsCollapsed ? 'Controls [+]' : 'Controls [-]');
    this.controlsBackground.setVisible(!this.controlsCollapsed);
    this.controlsText.setVisible(!this.controlsCollapsed);
  }

  private setupEventListeners(): void {
    // Listen for parameter changes from React
    EventBus.on('update-parameter', (data: { key: string; value: number }) => {
      this.paramRegistry.set(data.key, data.value);
    });

    // Listen for preset loads
    EventBus.on('load-preset', (preset: Record<string, number>) => {
      this.paramRegistry.loadPreset(preset);
    });

    // Listen for reset requests
    EventBus.on('reset-parameters', () => {
      this.paramRegistry.reset();
    });

    // Listen for player reset requests
    EventBus.on('reset-player', () => {
      this.resetPlayer();
    });
  }

  update(time: number, delta: number): void {
    // Update input
    this.inputManager.update();

    // Handle debug toggle
    if (this.inputManager.debugJustPressed) {
      this.debugRenderer.toggle();
    }

    // Handle reset
    if (this.inputManager.resetJustPressed) {
      this.resetPlayer();
    }

    // Update player
    this.player.update(time, delta);

    // Update moving platforms (they update themselves via preUpdate)

    // Render debug
    this.debugRenderer.render(this.player, this.inputManager.getSnapshot());
  }

  private emitDebugInfo(): void {
    const debugInfo = {
      ...this.player.getDebugInfo(),
      fps: Math.round(this.game.loop.actualFps),
      inputs: this.inputManager.getSnapshot()
    };
    EventBus.emit('debug-info', debugInfo);
  }

  resetPlayer(): void {
    const spawn = getSpawnPosition();
    this.player.resetPosition(spawn.x, spawn.y);
  }

  getParameterRegistry(): ParameterRegistry {
    return this.paramRegistry;
  }
}
