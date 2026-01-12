import type { Player } from '../Player';
import type { PlayerStateMachine } from '../PlayerStateMachine';
import { BaseState } from './BaseState';

export class DashingState extends BaseState {
  private dashTimer: number = 0;
  private dashDirection: number = 0;
  private preservedYVelocity: number = 0;
  private wasAirDash: boolean = false;

  constructor(player: Player, stateMachine: PlayerStateMachine) {
    super('dashing', player, stateMachine);
  }

  enter(): void {
    const params = this.player.params;
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    this.dashTimer = params.get('dashDuration');

    // Track if this is an air dash (for cooldown purposes)
    this.wasAirDash = !this.player.isGrounded();

    // Determine dash direction (use input or facing direction)
    const input = this.player.inputManager.horizontalInput;
    this.dashDirection = input !== 0 ? input : this.player.getFacingDirection();

    // Consume a dash (only consumes from air dash count if airborne)
    this.player.consumeDash();

    // Set up dash velocity
    const dashSpeed = params.get('dashSpeed');
    body.velocity.x = this.dashDirection * dashSpeed;

    // Handle Y velocity based on setting
    const preserveY = params.get('dashPreservesYVelocity') === 1;
    if (preserveY) {
      this.preservedYVelocity = body.velocity.y;
    } else {
      this.preservedYVelocity = 0;
      body.velocity.y = 0;
    }
  }

  update(time: number, delta: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const params = this.player.params;

    this.dashTimer -= delta;

    if (this.dashTimer <= 0) {
      // Dash ended - transition based on situation
      if (this.player.isGrounded()) {
        if (this.player.inputManager.horizontalInput !== 0) {
          this.stateMachine.changeState('running');
        } else {
          this.stateMachine.changeState('idle');
        }
      } else {
        this.stateMachine.changeState('falling');
      }
      return;
    }

    // Maintain dash velocity
    const dashSpeed = params.get('dashSpeed');
    body.velocity.x = this.dashDirection * dashSpeed;

    // Handle Y velocity
    const preserveY = params.get('dashPreservesYVelocity') === 1;
    if (!preserveY) {
      body.velocity.y = 0;
    } else {
      // Apply gravity to preserved velocity
      this.preservedYVelocity += params.get('gravity') * (delta / 1000);
      const maxFall = params.get('maxFallSpeed');
      if (this.preservedYVelocity > maxFall) {
        this.preservedYVelocity = maxFall;
      }
      body.velocity.y = this.preservedYVelocity;
    }
  }

  exit(): void {
    // Only start cooldown for air dashes (ground dashes have no cooldown)
    if (this.wasAirDash) {
      this.player.startDashCooldown();
    }

    this.dashTimer = 0;
    this.dashDirection = 0;
    this.preservedYVelocity = 0;
    this.wasAirDash = false;
  }
}
