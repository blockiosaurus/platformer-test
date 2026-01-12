import type { Player } from './Player';
import { BaseState } from './PlayerStates/BaseState';
import { IdleState } from './PlayerStates/IdleState';
import { RunningState } from './PlayerStates/RunningState';
import { JumpingState } from './PlayerStates/JumpingState';
import { FallingState } from './PlayerStates/FallingState';
import { WallSlideState } from './PlayerStates/WallSlideState';
import { WallJumpState } from './PlayerStates/WallJumpState';
import { DashingState } from './PlayerStates/DashingState';

export class PlayerStateMachine {
  private currentState!: BaseState;
  private states: Map<string, BaseState>;
  private player: Player;

  constructor(player: Player) {
    this.player = player;
    this.states = new Map();
    this.initializeStates();
  }

  private initializeStates(): void {
    this.states.set('idle', new IdleState(this.player, this));
    this.states.set('running', new RunningState(this.player, this));
    this.states.set('jumping', new JumpingState(this.player, this));
    this.states.set('falling', new FallingState(this.player, this));
    this.states.set('wallSlide', new WallSlideState(this.player, this));
    this.states.set('wallJump', new WallJumpState(this.player, this));
    this.states.set('dashing', new DashingState(this.player, this));
  }

  start(initialState: string = 'idle'): void {
    const state = this.states.get(initialState);
    if (state) {
      this.currentState = state;
      this.currentState.enter();
    } else {
      console.error(`State '${initialState}' not found`);
    }
  }

  changeState(newStateName: string): void {
    const newState = this.states.get(newStateName);
    if (!newState) {
      console.error(`State '${newStateName}' not found`);
      return;
    }

    if (this.currentState) {
      this.currentState.exit();
    }

    this.currentState = newState;
    this.currentState.enter();
  }

  update(time: number, delta: number): void {
    if (this.currentState) {
      this.currentState.update(time, delta);
    }
  }

  getCurrentStateName(): string {
    return this.currentState?.name ?? 'none';
  }

  isInState(stateName: string): boolean {
    return this.currentState?.name === stateName;
  }
}
