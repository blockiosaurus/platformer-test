import Phaser from 'phaser';
import { LevelData, PlatformData } from '../config/types';

export interface LevelObjects {
  platforms: Phaser.Physics.Arcade.StaticGroup;
  movingPlatforms: Phaser.GameObjects.Group;
  walls: Phaser.Physics.Arcade.StaticGroup;
  oneWayPlatforms: Phaser.Physics.Arcade.StaticGroup;
}

// Constants for tile rendering
const TILE_SIZE = 18;
const TILE_SCALE = 2;

// Helper to create tiled texture with scaling
function createTiledPlatformTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  leftTile: string,
  midTile: string,
  rightTile: string,
  singleTile?: string
): void {
  if (scene.textures.exists(key)) return;

  // Calculate tiles needed at original size, then scale final result
  const tilesNeeded = Math.max(1, Math.ceil(width / (TILE_SIZE * TILE_SCALE)));
  const rtWidth = tilesNeeded * TILE_SIZE;
  const rtHeight = TILE_SIZE;

  const rt = scene.add.renderTexture(0, 0, rtWidth, rtHeight);

  for (let i = 0; i < tilesNeeded; i++) {
    let tileKey: string;
    if (tilesNeeded === 1) {
      tileKey = singleTile || midTile;
    } else if (i === 0) {
      tileKey = leftTile;
    } else if (i === tilesNeeded - 1) {
      tileKey = rightTile;
    } else {
      tileKey = midTile;
    }
    rt.draw(tileKey, i * TILE_SIZE, 0);
  }

  rt.saveTexture(key);
  rt.destroy();
}

export class MovingPlatform extends Phaser.Physics.Arcade.Sprite {
  public deltaX: number = 0;
  public deltaY: number = 0;
  private startX: number;
  private startY: number;
  private axis: 'horizontal' | 'vertical';
  private distance: number;
  private speed: number;
  private direction: number = 1;
  private lastX: number;
  private lastY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    config: { axis: 'horizontal' | 'vertical'; distance: number; speed: number }
  ) {
    // Create tiled texture for the moving platform
    const key = `moving_platform_${width}_${height}`;
    createTiledPlatformTexture(scene, key, width, height, 'moving_left', 'moving_mid', 'moving_right');

    super(scene, x, y, key);

    // Scale sprite 2x
    this.setScale(TILE_SCALE);

    this.startX = x;
    this.startY = y;
    this.lastX = x;
    this.lastY = y;
    this.axis = config.axis;
    this.distance = config.distance;
    this.speed = config.speed;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.allowGravity = false;
    // Let body match the scaled sprite size (may be slightly larger than intended if texture rounds up)
    // This ensures correct positioning - the body will align with the visual sprite
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    this.lastX = this.x;
    this.lastY = this.y;

    const deltaSeconds = delta / 1000;
    const movement = this.speed * deltaSeconds * this.direction;

    if (this.axis === 'horizontal') {
      this.x += movement;

      // Check bounds
      if (this.x > this.startX + this.distance) {
        this.x = this.startX + this.distance;
        this.direction = -1;
      } else if (this.x < this.startX) {
        this.x = this.startX;
        this.direction = 1;
      }
    } else {
      this.y += movement;

      // Check bounds
      if (this.y > this.startY + this.distance) {
        this.y = this.startY + this.distance;
        this.direction = -1;
      } else if (this.y < this.startY) {
        this.y = this.startY;
        this.direction = 1;
      }
    }

    // Calculate delta for platform carry
    this.deltaX = this.x - this.lastX;
    this.deltaY = this.y - this.lastY;

    // Update body position
    (this.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
  }
}

export class LevelBuilder {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  buildLevel(levelData: LevelData): LevelObjects {
    const platforms = this.scene.physics.add.staticGroup();
    const walls = this.scene.physics.add.staticGroup();
    const oneWayPlatforms = this.scene.physics.add.staticGroup();
    const movingPlatforms = this.scene.add.group();

    // Create textures
    this.createPlatformTextures();

    // Build each platform
    for (const platformData of levelData.platforms) {
      switch (platformData.type) {
        case 'static':
          this.createStaticPlatform(platformData, platforms);
          break;
        case 'wall':
          this.createWall(platformData, walls);
          break;
        case 'oneway':
          this.createOneWayPlatform(platformData, oneWayPlatforms);
          break;
        case 'moving':
          this.createMovingPlatform(platformData, movingPlatforms);
          break;
      }
    }

    // Draw background grid
    this.drawBackgroundGrid(levelData);

    // Draw section labels
    this.drawSectionLabels();

    return { platforms, movingPlatforms, walls, oneWayPlatforms };
  }

  private createPlatformTextures(): void {
    // Textures are created on-demand when needed
  }

  private createStaticPlatform(data: PlatformData, group: Phaser.Physics.Arcade.StaticGroup): void {
    const key = `platform_${data.width}_${data.height}`;
    createTiledPlatformTexture(
      this.scene,
      key,
      data.width,
      data.height,
      'tile_left',
      'tile_mid',
      'tile_right',
      'tile_single'
    );

    const platform = group.create(data.x + data.width / 2, data.y + data.height / 2, key);
    platform.setScale(TILE_SCALE);

    // Set body size and position to match intended dimensions
    const body = platform.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(data.width, data.height);
    body.reset(data.x + data.width / 2, data.y + data.height / 2);
  }

  private createWall(data: PlatformData, group: Phaser.Physics.Arcade.StaticGroup): void {
    const key = `wall_${data.width}_${data.height}`;

    if (!this.scene.textures.exists(key)) {
      // Calculate tiles needed (at original size)
      const scaledSize = TILE_SIZE * TILE_SCALE;
      const tilesNeededX = Math.max(1, Math.ceil(data.width / scaledSize));
      const tilesNeededY = Math.max(1, Math.ceil(data.height / scaledSize));
      const rtWidth = tilesNeededX * TILE_SIZE;
      const rtHeight = tilesNeededY * TILE_SIZE;

      const rt = this.scene.add.renderTexture(0, 0, rtWidth, rtHeight);

      // Tile the wall at original size
      for (let y = 0; y < tilesNeededY; y++) {
        for (let x = 0; x < tilesNeededX; x++) {
          rt.draw('wall_tile', x * TILE_SIZE, y * TILE_SIZE);
        }
      }

      rt.saveTexture(key);
      rt.destroy();
    }

    const wall = group.create(data.x + data.width / 2, data.y + data.height / 2, key);
    wall.setScale(TILE_SCALE);

    // Set body size and position to match intended dimensions
    const body = wall.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(data.width, data.height);
    body.reset(data.x + data.width / 2, data.y + data.height / 2);
  }

  private createOneWayPlatform(data: PlatformData, group: Phaser.Physics.Arcade.StaticGroup): void {
    const key = `oneway_${data.width}_${data.height}`;
    createTiledPlatformTexture(
      this.scene,
      key,
      data.width,
      data.height,
      'oneway_left',
      'oneway_mid',
      'oneway_right'
    );

    const platform = group.create(data.x + data.width / 2, data.y + data.height / 2, key);
    platform.setScale(TILE_SCALE);

    // Set body size and position to match intended dimensions
    const body = platform.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(data.width, data.height);
    body.reset(data.x + data.width / 2, data.y + data.height / 2);

    // Configure one-way collision
    body.checkCollision.down = false;
    body.checkCollision.left = false;
    body.checkCollision.right = false;
  }

  private createMovingPlatform(data: PlatformData, group: Phaser.GameObjects.Group): void {
    if (!data.movementConfig) return;

    const platform = new MovingPlatform(
      this.scene,
      data.x + data.width / 2,
      data.y + data.height / 2,
      data.width,
      data.height,
      data.movementConfig
    );

    group.add(platform);
  }

  private drawBackgroundGrid(levelData: LevelData): void {
    const BG_TILE_SIZE = 24;
    const BG_SCALE = 2;
    const scaledBgTile = BG_TILE_SIZE * BG_SCALE; // 48px

    // Sky fills entire background
    const sky = this.scene.add.tileSprite(
      0,
      0,
      levelData.bounds.width,
      levelData.bounds.height,
      'bg_sky'
    );
    sky.setOrigin(0, 0);
    sky.setScale(BG_SCALE);
    sky.setDepth(-20);

    // Cloud layer at bottom portion
    const cloudHeight = 200;
    const cloudTopY = levelData.bounds.height - cloudHeight;

    const cloudTop = this.scene.add.tileSprite(
      0,
      cloudTopY,
      levelData.bounds.width,
      scaledBgTile,
      'bg_cloud_top'
    );
    cloudTop.setOrigin(0, 0);
    cloudTop.setScale(BG_SCALE);
    cloudTop.setDepth(-15);

    // Cloud body fills below cloud top
    const cloudBody = this.scene.add.tileSprite(
      0,
      cloudTopY + scaledBgTile,
      levelData.bounds.width,
      cloudHeight - scaledBgTile,
      'bg_cloud'
    );
    cloudBody.setOrigin(0, 0);
    cloudBody.setScale(BG_SCALE);
    cloudBody.setDepth(-15);
  }

  private drawSectionLabels(): void {
    const style = {
      fontSize: '14px',
      color: '#666688',
      fontFamily: 'monospace'
    };

    const labels = [
      { x: 100, y: 160, text: 'JUMP HEIGHT' },
      { x: 650, y: 510, text: 'GAP TEST' },
      { x: 550, y: 200, text: 'ONE-WAY' },
      { x: 1000, y: 230, text: 'MOVING' },
      { x: 1800, y: 150, text: 'WALL JUMP' },
      { x: 2150, y: 260, text: 'GAUNTLET' },
      { x: 2550, y: 210, text: 'COMBO' }
    ];

    for (const label of labels) {
      this.scene.add.text(label.x, label.y, label.text, style).setDepth(-5);
    }
  }
}
