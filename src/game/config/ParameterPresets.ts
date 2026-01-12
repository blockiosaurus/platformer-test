import { PlayerParameters } from './types';

export interface Preset {
  name: string;
  description: string;
  values: Partial<PlayerParameters>;
}

export const PRESETS: Record<string, Preset> = {
  default: {
    name: 'Default',
    description: 'Balanced, responsive controls',
    values: {
      runSpeed: 200,
      acceleration: 1500,
      deceleration: 1500,
      groundFriction: 0.85,
      airControl: 0.7,
      jumpVelocity: 420,
      gravity: 980,
      maxFallSpeed: 600,
      variableJumpMultiplier: 0.5,
      doubleJumpEnabled: 1,
      doubleJumpVelocity: 380,
      coyoteTime: 100,
      jumpBufferTime: 100,
      apexThreshold: 50,
      apexGravityMultiplier: 0.5,
      apexControlBoost: 1.2,
      wallSlideSpeed: 80,
      wallJumpVelocityX: 280,
      wallJumpVelocityY: 400,
      wallStickTime: 100,
      wallJumpControlLockTime: 150,
      dashSpeed: 600,
      dashDuration: 150,
      dashCooldown: 500,
      airDashCount: 1,
      dashPreservesYVelocity: 0
    }
  },

  floaty: {
    name: 'Floaty',
    description: 'Low gravity, high air control (like Kirby)',
    values: {
      gravity: 500,
      jumpVelocity: 350,
      maxFallSpeed: 350,
      airControl: 0.95,
      apexGravityMultiplier: 0.25,
      apexThreshold: 100,
      apexControlBoost: 1.5,
      variableJumpMultiplier: 0.3,
      wallSlideSpeed: 40,
      doubleJumpVelocity: 320
    }
  },

  snappy: {
    name: 'Snappy',
    description: 'Fast, responsive, minimal float (like Mega Man)',
    values: {
      gravity: 1400,
      jumpVelocity: 520,
      maxFallSpeed: 800,
      acceleration: 2500,
      deceleration: 2500,
      groundFriction: 0.95,
      airControl: 0.5,
      apexGravityMultiplier: 0.8,
      apexThreshold: 30,
      variableJumpMultiplier: 0.7,
      coyoteTime: 60,
      jumpBufferTime: 80,
      runSpeed: 250
    }
  },

  heavy: {
    name: 'Heavy',
    description: 'Weighty, momentum-based (like Castlevania)',
    values: {
      gravity: 1600,
      jumpVelocity: 550,
      maxFallSpeed: 900,
      acceleration: 600,
      deceleration: 400,
      groundFriction: 0.6,
      airControl: 0.3,
      runSpeed: 160,
      variableJumpMultiplier: 0.8,
      apexGravityMultiplier: 0.9,
      doubleJumpEnabled: 0,
      coyoteTime: 50,
      jumpBufferTime: 60
    }
  },

  celeste: {
    name: 'Celeste-like',
    description: 'Precise, forgiving, dash-focused',
    values: {
      coyoteTime: 80,
      jumpBufferTime: 100,
      airControl: 0.85,
      apexGravityMultiplier: 0.4,
      apexThreshold: 60,
      variableJumpMultiplier: 0.45,
      dashDuration: 120,
      dashSpeed: 650,
      dashCooldown: 0,
      airDashCount: 1,
      dashPreservesYVelocity: 0,
      wallSlideSpeed: 60,
      wallStickTime: 60,
      wallJumpControlLockTime: 100,
      gravity: 1100,
      jumpVelocity: 460,
      runSpeed: 220
    }
  },

  hollowKnight: {
    name: 'Hollow Knight-like',
    description: 'Weighty jumps, wall mechanics',
    values: {
      gravity: 1200,
      jumpVelocity: 480,
      maxFallSpeed: 700,
      airControl: 0.65,
      wallSlideSpeed: 100,
      wallStickTime: 0,
      wallJumpVelocityX: 300,
      wallJumpVelocityY: 450,
      wallJumpControlLockTime: 200,
      doubleJumpVelocity: 420,
      variableJumpMultiplier: 0.55,
      apexGravityMultiplier: 0.6,
      dashSpeed: 550,
      dashDuration: 180,
      dashCooldown: 600,
      coyoteTime: 80,
      jumpBufferTime: 80
    }
  },

  mario: {
    name: 'Mario-like',
    description: 'Variable jump, momentum preservation',
    values: {
      gravity: 1100,
      jumpVelocity: 450,
      maxFallSpeed: 550,
      runSpeed: 220,
      acceleration: 1200,
      deceleration: 800,
      groundFriction: 0.7,
      airControl: 0.75,
      variableJumpMultiplier: 0.35,
      apexGravityMultiplier: 0.55,
      apexThreshold: 70,
      coyoteTime: 100,
      jumpBufferTime: 120,
      doubleJumpEnabled: 0,
      wallSlideSpeed: 200,
      wallStickTime: 0
    }
  },

  speedrunner: {
    name: 'Speedrunner',
    description: 'Maximum speed and control',
    values: {
      runSpeed: 350,
      acceleration: 3000,
      deceleration: 3000,
      airControl: 0.9,
      jumpVelocity: 500,
      gravity: 1000,
      coyoteTime: 150,
      jumpBufferTime: 150,
      dashSpeed: 800,
      dashDuration: 100,
      dashCooldown: 200,
      airDashCount: 2,
      wallJumpControlLockTime: 50,
      doubleJumpVelocity: 450
    }
  }
};

export function getPresetNames(): string[] {
  return Object.keys(PRESETS);
}

export function getPreset(name: string): Preset | undefined {
  return PRESETS[name];
}
