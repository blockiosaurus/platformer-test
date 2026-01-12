import type { Player } from '../Player';
import type { PlayerStateMachine } from '../PlayerStateMachine';
import { BaseState } from './BaseState';

export class WallJumpState extends BaseState {
  private controlLockTimer: number = 0;
  private hasReleasedJump: boolean = false;

  constructor(player: Player, stateMachine: PlayerStateMachine) {
    super('wallJump', player, stateMachine);
  }

  enter(): void {
    const params = this.player.params;
    this.controlLockTimer = params.get('wallJumpControlLockTime');
    this.hasReleasedJump = false;
  }

  update(time: number, delta: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const params = this.player.params;

    // Check for dash
    if (this.checkDashTransition()) return;

    // Decrease control lock timer
    this.controlLockTimer -= delta;

    // Variable jump height
    if (this.player.inputManager.jumpReleased && body.velocity.y < 0 && !this.hasReleasedJump) {
      this.hasReleasedJump = true;
      const multiplier = params.get('variableJumpMultiplier');
      body.velocity.y *= multiplier;
    }

    // Check for double jump (if control is unlocked)
    if (this.controlLockTimer <= 0 && this.player.inputManager.jumpJustPressed && this.player.canDoubleJump()) {
      this.player.performDoubleJump();
      this.stateMachine.changeState('jumping');
      return;
    }

    // Transition to falling when velocity becomes positive
    if (body.velocity.y > 0) {
      this.stateMachine.changeState('falling');
      return;
    }

    // Check for wall slide (if control is unlocked and touching wall)
    if (this.controlLockTimer <= 0 && this.checkWallSlideTransition()) {
      return;
    }

    // Check if landed
    if (this.player.isGrounded() && body.velocity.y >= 0) {
      this.stateMachine.changeState('idle');
      return;
    }

    // Apply movement based on control lock
    if (this.controlLockTimer <= 0) {
      // Full control restored
      this.applyHorizontalMovement(delta);
    } else {
      // Limited air control during lock
      const input = this.player.inputManager.horizontalInput;
      const airControl = params.get('airControl') * 0.3; // Reduced control
      const runSpeed = params.get('runSpeed');
      const acceleration = params.get('acceleration') * airControl;

      if (input !== 0) {
        const targetVelocity = input * runSpeed;
        const deltaSeconds = delta / 1000;

        if (Math.sign(body.velocity.x) === Math.sign(targetVelocity)) {
          // Can only slow down, not speed up
          if (Math.abs(body.velocity.x) > Math.abs(targetVelocity)) {
            if (body.velocity.x > 0) {
              body.velocity.x = Math.max(targetVelocity, body.velocity.x - acceleration * deltaSeconds);
            } else {
              body.velocity.x = Math.min(targetVelocity, body.velocity.x + acceleration * deltaSeconds);
            }
          }
        }
      }
    }

    this.applyGravity(delta);
  }

  exit(): void {
    this.controlLockTimer = 0;
    this.hasReleasedJump = false;
  }
}
