import Phaser from 'phaser';
import { ParameterRegistry } from '../config/ParameterRegistry';
import { PlayerDebugInfo } from '../config/types';
import { InputManager } from '../systems/InputManager';
import { PlayerStateMachine } from './PlayerStateMachine';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public params: ParameterRegistry;
  public inputManager!: InputManager;

  private stateMachine: PlayerStateMachine;

  // Timers
  private coyoteTimer: number = 0;
  private dashCooldownTimer: number = 0;

  // State tracking
  private jumpsRemaining: number = 1;
  private dashesRemaining: number = 1;
  private facingDirection: number = 1;
  private wallDirection: number = 0;
  private wasGrounded: boolean = false;
  private hasJumped: boolean = false;

  // Animation
  private animTimer: number = 0;
  private animFrame: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, params: ParameterRegistry) {
    super(scene, x, y, 'character_idle');

    this.params = params;

    // Scale sprite 2x for visibility (24x24 -> 48x48)
    this.setScale(2);

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configure physics body for scaled sprite (48x48)
    // Body covers the character's torso, not extending below feet
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(16, 17);
    body.setOffset(4, 7);

    // Initialize state machine
    this.stateMachine = new PlayerStateMachine(this);

    // Initialize jumps and dashes
    this.resetJumps();
    this.resetDashes();
  }

  setInputManager(inputManager: InputManager): void {
    this.inputManager = inputManager;
  }

  start(): void {
    this.stateMachine.start('idle');
  }

  update(time: number, delta: number): void {
    // Update wall direction
    this.updateWallDirection();

    // Track grounded state changes
    const isGroundedNow = this.isGrounded();
    if (!this.wasGrounded && isGroundedNow) {
      // Just landed - reset jumps and dashes
      this.resetJumps();
      this.resetDashes();
    }
    this.wasGrounded = isGroundedNow;

    // Update dash cooldown
    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer -= delta;
    }

    // Update state machine
    this.stateMachine.update(time, delta);

    // Update animation
    this.updateAnimation(delta);
  }

  private updateAnimation(delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Walking animation when moving on ground
    if (Math.abs(body.velocity.x) > 10 && this.isGrounded()) {
      this.animTimer += delta;
      if (this.animTimer > 150) {
        this.animTimer = 0;
        this.animFrame = 1 - this.animFrame;
        this.setTexture(this.animFrame === 0 ? 'character_idle' : 'character_step');
      }
    } else {
      // Reset to idle when not walking
      if (this.texture.key !== 'character_idle') {
        this.setTexture('character_idle');
      }
      this.animTimer = 0;
      this.animFrame = 0;
    }
  }

  // Ground detection
  isGrounded(): boolean {
    const body = this.body as Phaser.Physics.Arcade.Body;
    return body.blocked.down || body.touching.down;
  }

  // Wall detection
  isTouchingWall(): boolean {
    const body = this.body as Phaser.Physics.Arcade.Body;
    return body.blocked.left || body.blocked.right || body.touching.left || body.touching.right;
  }

  private updateWallDirection(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.left || body.touching.left) {
      this.wallDirection = -1;
    } else if (body.blocked.right || body.touching.right) {
      this.wallDirection = 1;
    } else {
      this.wallDirection = 0;
    }
  }

  getWallDirection(): number {
    return this.wallDirection;
  }

  // Apex detection
  isAtApex(): boolean {
    if (this.isGrounded()) return false;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const threshold = this.params.get('apexThreshold');
    return Math.abs(body.velocity.y) < threshold;
  }

  // Jump methods
  performJump(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const jumpVelocity = this.params.get('jumpVelocity');

    body.velocity.y = -jumpVelocity;
    this.hasJumped = true;
    this.clearCoyoteTime();
    // Ground jump is free - doesn't consume jumpsRemaining
    // jumpsRemaining is only for air jumps (double jump, etc.)
  }

  performDoubleJump(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const doubleJumpVelocity = this.params.get('doubleJumpVelocity');

    body.velocity.y = -doubleJumpVelocity;
    this.jumpsRemaining--;
    this.hasJumped = true;
  }

  canDoubleJump(): boolean {
    const enabled = this.params.get('doubleJumpEnabled') === 1;
    return enabled && this.jumpsRemaining > 0;
  }

  resetJumps(): void {
    const hasDoubleJump = this.params.get('doubleJumpEnabled') === 1;
    this.jumpsRemaining = hasDoubleJump ? 1 : 0; // 0 extra jumps if no double jump, 1 if double jump enabled
    this.hasJumped = false;
  }

  // Coyote time methods
  startCoyoteTime(): void {
    if (!this.hasJumped) {
      this.coyoteTimer = this.params.get('coyoteTime');
    }
  }

  updateCoyoteTime(delta: number): void {
    if (this.coyoteTimer > 0) {
      this.coyoteTimer -= delta;
    }
  }

  clearCoyoteTime(): void {
    this.coyoteTimer = 0;
  }

  canCoyoteJump(): boolean {
    return this.coyoteTimer > 0 && !this.hasJumped;
  }

  // Wall jump
  performWallJump(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const wallJumpX = this.params.get('wallJumpVelocityX');
    const wallJumpY = this.params.get('wallJumpVelocityY');

    // Jump away from wall
    body.velocity.x = -this.wallDirection * wallJumpX;
    body.velocity.y = -wallJumpY;

    this.facingDirection = -this.wallDirection;
    this.hasJumped = true;
  }

  // Dash methods
  canDash(): boolean {
    if (this.dashCooldownTimer > 0) return false;

    if (this.isGrounded()) {
      return true;
    } else {
      return this.dashesRemaining > 0;
    }
  }

  consumeDash(): void {
    if (!this.isGrounded()) {
      this.dashesRemaining--;
    }
  }

  startDashCooldown(): void {
    this.dashCooldownTimer = this.params.get('dashCooldown');
  }

  resetDashes(): void {
    this.dashesRemaining = this.params.get('airDashCount');
  }

  // Facing direction
  setFacingDirection(direction: number): void {
    if (direction !== 0) {
      this.facingDirection = direction;
      // Sprite faces left by default, so flip when going right
      this.setFlipX(direction > 0);
    }
  }

  getFacingDirection(): number {
    return this.facingDirection;
  }

  // Reset position
  resetPosition(x: number, y: number): void {
    this.setPosition(x, y);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.velocity.x = 0;
    body.velocity.y = 0;
    this.resetJumps();
    this.resetDashes();
    this.clearCoyoteTime();
    this.dashCooldownTimer = 0;
    this.hasJumped = false;
    this.stateMachine.start('idle');
  }

  // Debug info
  getDebugInfo(): PlayerDebugInfo {
    const body = this.body as Phaser.Physics.Arcade.Body;

    return {
      state: this.stateMachine.getCurrentStateName(),
      position: { x: Math.round(this.x), y: Math.round(this.y) },
      velocity: { x: Math.round(body.velocity.x), y: Math.round(body.velocity.y) },
      isGrounded: this.isGrounded(),
      isTouchingWall: this.isTouchingWall(),
      wallDirection: this.wallDirection,
      isAtApex: this.isAtApex(),
      canDash: this.canDash(),
      jumpsRemaining: this.jumpsRemaining,
      dashesRemaining: this.dashesRemaining,
      coyoteTimer: Math.max(0, this.coyoteTimer),
      jumpBufferTimer: 0, // This is tracked in InputManager
      wallStickTimer: 0, // This is tracked in WallSlideState
      dashCooldown: Math.max(0, this.dashCooldownTimer),
      facingDirection: this.facingDirection
    };
  }

  getCurrentState(): string {
    return this.stateMachine.getCurrentStateName();
  }
}
