import type { Player } from '../Player';
import type { PlayerStateMachine } from '../PlayerStateMachine';
import { BaseState } from './BaseState';

export class JumpingState extends BaseState {
  private hasReleasedJump: boolean = false;

  constructor(player: Player, stateMachine: PlayerStateMachine) {
    super('jumping', player, stateMachine);
  }

  enter(): void {
    this.hasReleasedJump = false;
  }

  update(time: number, delta: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const params = this.player.params;

    // Check for dash
    if (this.checkDashTransition()) return;

    // Check for wall slide
    if (this.checkWallSlideTransition()) return;

    // Variable jump height - cut jump short when button released
    if (this.player.inputManager.jumpReleased && body.velocity.y < 0 && !this.hasReleasedJump) {
      this.hasReleasedJump = true;
      const multiplier = params.get('variableJumpMultiplier');
      body.velocity.y *= multiplier;
    }

    // Check for double jump
    if (this.player.inputManager.jumpJustPressed && this.player.canDoubleJump()) {
      this.player.performDoubleJump();
      // Don't reset hasReleasedJump - allows variable height on double jump
      return;
    }

    // Transition to falling when velocity becomes positive
    if (body.velocity.y > 0) {
      this.stateMachine.changeState('falling');
      return;
    }

    // Check if landed (shouldn't happen while rising, but just in case)
    if (this.player.isGrounded() && body.velocity.y >= 0) {
      // Check for buffered jump (matching FallingState behavior)
      const bufferTime = params.get('jumpBufferTime');
      if (this.player.inputManager.isJumpBuffered(bufferTime)) {
        this.player.inputManager.consumeJumpBuffer();
        this.player.performJump();
        // Stay in jumping state
        return;
      }

      // No buffered jump - go to appropriate ground state
      if (this.player.inputManager.horizontalInput !== 0) {
        this.stateMachine.changeState('running');
      } else {
        this.stateMachine.changeState('idle');
      }
      return;
    }

    // Apply movement and gravity
    this.applyHorizontalMovement(delta);
    this.applyGravity(delta);
  }

  exit(): void {
    this.hasReleasedJump = false;
  }
}
