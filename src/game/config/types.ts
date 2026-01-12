// Parameter System Types

export enum ParameterCategory {
  MOVEMENT = 'Movement',
  JUMP = 'Jump',
  DOUBLE_JUMP = 'Double Jump',
  COYOTE_TIME = 'Coyote Time',
  JUMP_BUFFER = 'Jump Buffer',
  APEX_MODIFIER = 'Apex Modifier',
  WALL_MECHANICS = 'Wall Mechanics',
  DASH = 'Dash'
}

export interface ParameterDefinition {
  key: string;
  label: string;
  category: ParameterCategory;
  min: number;
  max: number;
  step: number;
  default: number;
  unit?: string;
  description?: string;
}

export interface PlayerParameters {
  [key: string]: number; // Index signature for Record<string, number> compatibility

  // Movement
  runSpeed: number;
  acceleration: number;
  deceleration: number;
  groundFriction: number;
  airControl: number;

  // Jump
  jumpVelocity: number;
  gravity: number;
  maxFallSpeed: number;
  variableJumpMultiplier: number;

  // Double Jump
  doubleJumpEnabled: number;
  doubleJumpVelocity: number;

  // Coyote Time
  coyoteTime: number;

  // Jump Buffer
  jumpBufferTime: number;

  // Apex Modifier
  apexThreshold: number;
  apexGravityMultiplier: number;
  apexControlBoost: number;

  // Wall Mechanics
  wallSlideSpeed: number;
  wallJumpVelocityX: number;
  wallJumpVelocityY: number;
  wallStickTime: number;
  wallJumpControlLockTime: number;

  // Dash
  dashSpeed: number;
  dashDuration: number;
  dashCooldown: number;
  airDashCount: number;
  dashPreservesYVelocity: number;
}

export interface InputSnapshot {
  horizontal: number;
  jumpPressed: boolean;
  jumpJustPressed: boolean;
  jumpReleased: boolean;
  dashJustPressed: boolean;
}

export interface PlayerDebugInfo {
  state: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  isGrounded: boolean;
  isTouchingWall: boolean;
  wallDirection: number;
  isAtApex: boolean;
  canDash: boolean;
  jumpsRemaining: number;
  dashesRemaining: number;
  coyoteTimer: number;
  jumpBufferTimer: number;
  wallStickTimer: number;
  dashCooldown: number;
  facingDirection: number;
}

export interface PlatformData {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'static' | 'moving' | 'oneway' | 'wall';
  movementConfig?: {
    axis: 'horizontal' | 'vertical';
    distance: number;
    speed: number;
  };
}

export interface LevelData {
  playerSpawn: { x: number; y: number };
  bounds: { width: number; height: number };
  platforms: PlatformData[];
}
