import type { Player } from '../Player';
import type { PlayerStateMachine } from '../PlayerStateMachine';
import { BaseState } from './BaseState';

export class WallSlideState extends BaseState {
  private wallStickTimer: number = 0;
  private wallContactGrace: number = 0;
  private storedWallDir: number = 0; // Store wall direction on entry
  private readonly WALL_CONTACT_GRACE_TIME: number = 100; // ms grace period for wall detection

  constructor(player: Player, stateMachine: PlayerStateMachine) {
    super('wallSlide', player, stateMachine);
  }

  enter(): void {
    const params = this.player.params;
    this.wallStickTimer = params.get('wallStickTime');
    this.wallContactGrace = this.WALL_CONTACT_GRACE_TIME;

    // Store wall direction on entry - use this throughout the state
    this.storedWallDir = this.player.getWallDirection();
    // Validate wall direction - fallback to facing direction if detection failed
    if (this.storedWallDir === 0) {
      this.storedWallDir = this.player.getFacingDirection();
    }

    // Note: Jump reset only happens on ground landing (in Player.update())
    // This prevents infinite double jumps from repeatedly touching walls

    // Clamp fall speed to wall slide speed
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const wallSlideSpeed = params.get('wallSlideSpeed');
    if (body.velocity.y > wallSlideSpeed) {
      body.velocity.y = wallSlideSpeed;
    }
  }

  update(time: number, delta: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const params = this.player.params;
    const input = this.player.inputManager;

    // Check for dash
    if (this.checkDashTransition()) return;

    // Check for wall jump
    if (input.jumpJustPressed) {
      this.player.performWallJump();
      this.stateMachine.changeState('wallJump');
      return;
    }

    // Check if landed
    if (this.player.isGrounded()) {
      if (input.horizontalInput !== 0) {
        this.stateMachine.changeState('running');
      } else {
        this.stateMachine.changeState('idle');
      }
      return;
    }

    // Check if player is pressing away from wall
    if (input.horizontalInput !== 0 && input.horizontalInput !== this.storedWallDir) {
      // Pressing away from wall
      if (this.wallStickTimer <= 0) {
        this.stateMachine.changeState('falling');
        return;
      }
    }

    // Update wall stick timer
    if (this.wallStickTimer > 0) {
      this.wallStickTimer -= delta;
    }

    // Update wall contact grace - only exit if truly lost contact for a while
    if (this.player.isTouchingWall()) {
      this.wallContactGrace = this.WALL_CONTACT_GRACE_TIME;
    } else {
      this.wallContactGrace -= delta;
      if (this.wallContactGrace <= 0) {
        this.stateMachine.changeState('falling');
        return;
      }
    }

    // Apply wall slide gravity (clamped)
    const wallSlideSpeed = params.get('wallSlideSpeed');
    const gravity = params.get('gravity');

    body.velocity.y += gravity * (delta / 1000);
    if (body.velocity.y > wallSlideSpeed) {
      body.velocity.y = wallSlideSpeed;
    }

    // Always push toward wall using stored direction (not current detection)
    body.velocity.x = this.storedWallDir * 50;
  }

  exit(): void {
    this.wallStickTimer = 0;
    this.wallContactGrace = 0;
    this.storedWallDir = 0;
  }
}
