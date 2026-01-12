import { ParameterCategory, ParameterDefinition, PlayerParameters } from './types';

export const PARAMETER_DEFINITIONS: ParameterDefinition[] = [
  // Movement
  {
    key: 'runSpeed',
    label: 'Run Speed',
    category: ParameterCategory.MOVEMENT,
    min: 50,
    max: 600,
    step: 10,
    default: 200,
    unit: 'px/s',
    description: 'Maximum horizontal movement speed'
  },
  {
    key: 'acceleration',
    label: 'Acceleration',
    category: ParameterCategory.MOVEMENT,
    min: 100,
    max: 3000,
    step: 50,
    default: 1500,
    unit: 'px/s²',
    description: 'How quickly the player reaches max speed'
  },
  {
    key: 'deceleration',
    label: 'Deceleration',
    category: ParameterCategory.MOVEMENT,
    min: 100,
    max: 3000,
    step: 50,
    default: 1500,
    unit: 'px/s²',
    description: 'How quickly the player stops'
  },
  {
    key: 'groundFriction',
    label: 'Ground Friction',
    category: ParameterCategory.MOVEMENT,
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.85,
    description: 'Friction when no input (0 = ice, 1 = instant stop)'
  },
  {
    key: 'airControl',
    label: 'Air Control',
    category: ParameterCategory.MOVEMENT,
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.7,
    description: 'How much control in the air (0 = none, 1 = full)'
  },

  // Jump
  {
    key: 'jumpVelocity',
    label: 'Jump Velocity',
    category: ParameterCategory.JUMP,
    min: 100,
    max: 800,
    step: 10,
    default: 420,
    unit: 'px/s',
    description: 'Initial upward velocity when jumping'
  },
  {
    key: 'gravity',
    label: 'Gravity',
    category: ParameterCategory.JUMP,
    min: 200,
    max: 2000,
    step: 50,
    default: 980,
    unit: 'px/s²',
    description: 'Downward acceleration'
  },
  {
    key: 'maxFallSpeed',
    label: 'Max Fall Speed',
    category: ParameterCategory.JUMP,
    min: 200,
    max: 1500,
    step: 50,
    default: 600,
    unit: 'px/s',
    description: 'Terminal velocity'
  },
  {
    key: 'variableJumpMultiplier',
    label: 'Variable Jump Cut',
    category: ParameterCategory.JUMP,
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.5,
    description: 'Velocity multiplier when releasing jump early'
  },

  // Double Jump
  {
    key: 'doubleJumpEnabled',
    label: 'Double Jump',
    category: ParameterCategory.DOUBLE_JUMP,
    min: 0,
    max: 1,
    step: 1,
    default: 1,
    description: 'Enable/disable double jump (0 = off, 1 = on)'
  },
  {
    key: 'doubleJumpVelocity',
    label: 'Double Jump Velocity',
    category: ParameterCategory.DOUBLE_JUMP,
    min: 100,
    max: 800,
    step: 10,
    default: 380,
    unit: 'px/s',
    description: 'Velocity of the second jump'
  },

  // Coyote Time
  {
    key: 'coyoteTime',
    label: 'Coyote Time',
    category: ParameterCategory.COYOTE_TIME,
    min: 0,
    max: 300,
    step: 10,
    default: 100,
    unit: 'ms',
    description: 'Grace period after leaving platform edge'
  },

  // Jump Buffer
  {
    key: 'jumpBufferTime',
    label: 'Jump Buffer',
    category: ParameterCategory.JUMP_BUFFER,
    min: 0,
    max: 300,
    step: 10,
    default: 100,
    unit: 'ms',
    description: 'Input buffer window before landing'
  },

  // Apex Modifier
  {
    key: 'apexThreshold',
    label: 'Apex Threshold',
    category: ParameterCategory.APEX_MODIFIER,
    min: 0,
    max: 200,
    step: 10,
    default: 50,
    unit: 'px/s',
    description: 'Velocity threshold for apex detection'
  },
  {
    key: 'apexGravityMultiplier',
    label: 'Apex Gravity',
    category: ParameterCategory.APEX_MODIFIER,
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.5,
    description: 'Gravity multiplier at jump apex (hang time)'
  },
  {
    key: 'apexControlBoost',
    label: 'Apex Control Boost',
    category: ParameterCategory.APEX_MODIFIER,
    min: 1,
    max: 2,
    step: 0.1,
    default: 1.2,
    description: 'Horizontal control multiplier at apex'
  },

  // Wall Mechanics
  {
    key: 'wallSlideSpeed',
    label: 'Wall Slide Speed',
    category: ParameterCategory.WALL_MECHANICS,
    min: 20,
    max: 300,
    step: 10,
    default: 80,
    unit: 'px/s',
    description: 'Max fall speed when sliding on wall'
  },
  {
    key: 'wallJumpVelocityX',
    label: 'Wall Jump X',
    category: ParameterCategory.WALL_MECHANICS,
    min: 100,
    max: 500,
    step: 10,
    default: 280,
    unit: 'px/s',
    description: 'Horizontal velocity when wall jumping'
  },
  {
    key: 'wallJumpVelocityY',
    label: 'Wall Jump Y',
    category: ParameterCategory.WALL_MECHANICS,
    min: 100,
    max: 800,
    step: 10,
    default: 400,
    unit: 'px/s',
    description: 'Vertical velocity when wall jumping'
  },
  {
    key: 'wallStickTime',
    label: 'Wall Stick Time',
    category: ParameterCategory.WALL_MECHANICS,
    min: 0,
    max: 500,
    step: 25,
    default: 100,
    unit: 'ms',
    description: 'How long player sticks to wall before sliding'
  },
  {
    key: 'wallJumpControlLockTime',
    label: 'Wall Jump Lock',
    category: ParameterCategory.WALL_MECHANICS,
    min: 0,
    max: 500,
    step: 25,
    default: 150,
    unit: 'ms',
    description: 'Time before regaining control after wall jump'
  },

  // Dash
  {
    key: 'dashSpeed',
    label: 'Dash Speed',
    category: ParameterCategory.DASH,
    min: 200,
    max: 1500,
    step: 50,
    default: 600,
    unit: 'px/s',
    description: 'Speed during dash'
  },
  {
    key: 'dashDuration',
    label: 'Dash Duration',
    category: ParameterCategory.DASH,
    min: 50,
    max: 500,
    step: 25,
    default: 150,
    unit: 'ms',
    description: 'How long the dash lasts'
  },
  {
    key: 'dashCooldown',
    label: 'Dash Cooldown',
    category: ParameterCategory.DASH,
    min: 0,
    max: 2000,
    step: 100,
    default: 500,
    unit: 'ms',
    description: 'Time between dashes'
  },
  {
    key: 'airDashCount',
    label: 'Air Dashes',
    category: ParameterCategory.DASH,
    min: 0,
    max: 3,
    step: 1,
    default: 1,
    description: 'Number of dashes allowed in air'
  },
  {
    key: 'dashPreservesYVelocity',
    label: 'Preserve Y Velocity',
    category: ParameterCategory.DASH,
    min: 0,
    max: 1,
    step: 1,
    default: 0,
    description: 'Keep vertical velocity during dash (0 = freeze, 1 = preserve)'
  }
];

export function getDefaultParameters(): PlayerParameters {
  const params: Partial<PlayerParameters> = {};
  for (const def of PARAMETER_DEFINITIONS) {
    (params as Record<string, number>)[def.key] = def.default;
  }
  return params as PlayerParameters;
}

export function getParametersByCategory(): Map<ParameterCategory, ParameterDefinition[]> {
  const grouped = new Map<ParameterCategory, ParameterDefinition[]>();

  for (const def of PARAMETER_DEFINITIONS) {
    const existing = grouped.get(def.category) || [];
    existing.push(def);
    grouped.set(def.category, existing);
  }

  return grouped;
}
