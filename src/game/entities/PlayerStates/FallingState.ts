import type { Player } from '../Player';
import type { PlayerStateMachine } from '../PlayerStateMachine';
import { BaseState } from './BaseState';

export class FallingState extends BaseState {
  constructor(player: Player, stateMachine: PlayerStateMachine) {
    super('falling', player, stateMachine);
  }

  enter(): void {
    // Nothing specific to do when entering falling state
  }

  update(time: number, delta: number): void {
    const params = this.player.params;

    // Check for dash
    if (this.checkDashTransition()) return;

    // Check for wall slide
    if (this.checkWallSlideTransition()) return;

    // Check for coyote jump
    if (this.player.inputManager.jumpJustPressed) {
      if (this.player.canCoyoteJump()) {
        this.player.performJump();
        this.stateMachine.changeState('jumping');
        return;
      } else if (this.player.canDoubleJump()) {
        this.player.performDoubleJump();
        this.stateMachine.changeState('jumping');
        return;
      }
    }

    // Check if landed
    if (this.player.isGrounded()) {
      // Check for buffered jump
      const bufferTime = params.get('jumpBufferTime');
      if (this.player.inputManager.isJumpBuffered(bufferTime)) {
        this.player.inputManager.consumeJumpBuffer();
        this.player.performJump();
        this.stateMachine.changeState('jumping');
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

    // Update coyote timer
    this.player.updateCoyoteTime(delta);
  }

  exit(): void {
    // Clear coyote time when leaving falling state
    this.player.clearCoyoteTime();
  }
}
