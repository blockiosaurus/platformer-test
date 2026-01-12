import type { Player } from '../Player';
import type { PlayerStateMachine } from '../PlayerStateMachine';
import { BaseState } from './BaseState';

export class RunningState extends BaseState {
  constructor(player: Player, stateMachine: PlayerStateMachine) {
    super('running', player, stateMachine);
  }

  enter(): void {
    // Resets are now handled in Player.update() on landing
  }

  update(time: number, delta: number): void {
    // Check for dash first
    if (this.checkDashTransition()) return;

    // Check for jump
    if (this.player.inputManager.jumpJustPressed) {
      this.player.performJump();
      this.stateMachine.changeState('jumping');
      return;
    }

    // Check if no horizontal input - go to idle
    if (this.player.inputManager.horizontalInput === 0) {
      this.stateMachine.changeState('idle');
      return;
    }

    // Check if falling off platform - only transition if actually moving downward
    // This prevents flickering from minor ground detection issues
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (!this.player.isGrounded() && body.velocity.y > 10) {
      this.player.startCoyoteTime();
      this.stateMachine.changeState('falling');
      return;
    }

    // Apply movement
    this.applyHorizontalMovement(delta);
    this.applyGravity(delta);
  }

  exit(): void {
    // Nothing to clean up
  }
}
