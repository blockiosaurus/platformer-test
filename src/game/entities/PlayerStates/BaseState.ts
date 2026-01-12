import type { Player } from '../Player';
import type { PlayerStateMachine } from '../PlayerStateMachine';

export abstract class BaseState {
  public readonly name: string;
  protected player: Player;
  protected stateMachine: PlayerStateMachine;

  constructor(name: string, player: Player, stateMachine: PlayerStateMachine) {
    this.name = name;
    this.player = player;
    this.stateMachine = stateMachine;
  }

  abstract enter(): void;
  abstract update(time: number, delta: number): void;
  abstract exit(): void;

  protected checkDashTransition(): boolean {
    const dashBufferTime = 100; // ms buffer window for dash input
    const wantsToDash =
      this.player.inputManager.dashJustPressed ||
      this.player.inputManager.isDashBuffered(dashBufferTime);

    if (wantsToDash && this.player.canDash()) {
      this.player.inputManager.consumeDashBuffer();
      this.stateMachine.changeState('dashing');
      return true;
    }
    return false;
  }

  protected checkWallSlideTransition(): boolean {
    const touchingWall = this.player.isTouchingWall();
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    if (touchingWall && !this.player.isGrounded() && body.velocity.y > 0) {
      // Check if player is pressing toward the wall
      const wallDir = this.player.getWallDirection();
      const inputDir = this.player.inputManager.horizontalInput;
      if (inputDir !== 0 && inputDir === wallDir) {
        this.stateMachine.changeState('wallSlide');
        return true;
      }
    }
    return false;
  }

  protected applyHorizontalMovement(delta: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const params = this.player.params;
    const input = this.player.inputManager.horizontalInput;

    const runSpeed = params.get('runSpeed');
    const isGrounded = this.player.isGrounded();
    const baseAccel = isGrounded ? params.get('acceleration') : params.get('acceleration') * params.get('airControl');
    const baseDecel = isGrounded ? params.get('deceleration') : params.get('deceleration') * params.get('airControl');

    // Apply apex control boost if at apex
    let accel = baseAccel;
    if (this.player.isAtApex()) {
      accel *= params.get('apexControlBoost');
    }

    const deltaSeconds = delta / 1000;

    const stopThreshold = 5; // Velocity below this is considered stopped

    if (input !== 0) {
      // Accelerating
      const targetVelocity = input * runSpeed;

      if (Math.sign(body.velocity.x) !== Math.sign(targetVelocity) && body.velocity.x !== 0) {
        // Turning around - decelerate toward zero first, then accelerate
        const decelAmount = baseDecel * deltaSeconds;
        if (body.velocity.x > 0) {
          body.velocity.x = Math.max(0, body.velocity.x - decelAmount);
        } else {
          body.velocity.x = Math.min(0, body.velocity.x + decelAmount);
        }
      } else {
        // Normal acceleration toward target
        if (body.velocity.x < targetVelocity) {
          body.velocity.x = Math.min(body.velocity.x + accel * deltaSeconds, targetVelocity);
        } else if (body.velocity.x > targetVelocity) {
          body.velocity.x = Math.max(body.velocity.x - accel * deltaSeconds, targetVelocity);
        }
      }

      // Update facing direction
      this.player.setFacingDirection(input);
    } else {
      // Decelerating (no input)
      if (isGrounded) {
        const friction = params.get('groundFriction');
        body.velocity.x *= Math.pow(1 - friction, deltaSeconds * 10);
        if (Math.abs(body.velocity.x) < stopThreshold) {
          body.velocity.x = 0;
        }
      } else {
        // Air deceleration - use linear decel
        const decelAmount = baseDecel * deltaSeconds * 0.5;
        if (body.velocity.x > 0) {
          body.velocity.x = Math.max(0, body.velocity.x - decelAmount);
        } else if (body.velocity.x < 0) {
          body.velocity.x = Math.min(0, body.velocity.x + decelAmount);
        }
      }
    }
  }

  protected applyGravity(delta: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const params = this.player.params;

    // Don't apply gravity when grounded - just keep a small downward velocity
    // to maintain contact with the ground (but only if not actively rising from a jump)
    if (this.player.isGrounded() && body.velocity.y >= 0) {
      body.velocity.y = 1; // Small value to stay pressed against ground
      return;
    }

    let gravity = params.get('gravity');
    const maxFallSpeed = params.get('maxFallSpeed');

    // Apply apex modifier when at jump apex
    if (this.player.isAtApex()) {
      gravity *= params.get('apexGravityMultiplier');
    }

    const deltaSeconds = delta / 1000;
    body.velocity.y += gravity * deltaSeconds;

    // Clamp to max fall speed
    if (body.velocity.y > maxFallSpeed) {
      body.velocity.y = maxFallSpeed;
    }
  }
}
