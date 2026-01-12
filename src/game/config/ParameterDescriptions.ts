import { ParameterCategory } from './types';

// Detailed descriptions for each category/section
export const CATEGORY_DESCRIPTIONS: Record<ParameterCategory, { title: string; description: string }> = {
  [ParameterCategory.MOVEMENT]: {
    title: 'Movement',
    description: `Controls how the player moves horizontally on the ground and in the air.

**Run Speed** determines the maximum speed the player can reach.

**Acceleration** controls how quickly the player reaches max speed - higher values feel more responsive but less realistic.

**Deceleration** affects how quickly the player stops when releasing input.

**Ground Friction** applies when no input is pressed - low values create an "ice skating" feel.

**Air Control** determines how much the player can influence their horizontal movement while airborne. A value of 0 means no air control (realistic), while 1 gives full control (arcade-style).`
  },

  [ParameterCategory.JUMP]: {
    title: 'Jump',
    description: `Core jump mechanics that define how the player moves vertically.

**Jump Velocity** is the initial upward force applied when jumping. Higher values = higher jumps.

**Gravity** pulls the player down constantly. Higher values make jumps feel "heavier" and shorter.

**Max Fall Speed** (terminal velocity) caps how fast the player can fall. This prevents the player from building up dangerous speeds during long falls.

**Variable Jump Cut** enables shorter hops by reducing upward velocity when the jump button is released early. A value of 0.5 means releasing early cuts the jump height roughly in half.`
  },

  [ParameterCategory.DOUBLE_JUMP]: {
    title: 'Double Jump',
    description: `Allows the player to jump again while airborne.

**Double Jump** toggle enables or disables this ability entirely.

**Double Jump Velocity** can be set differently from the ground jump - typically slightly lower for balance, but can be higher for a "super jump" feel.

The double jump resets when the player lands on any surface.`
  },

  [ParameterCategory.COYOTE_TIME]: {
    title: 'Coyote Time',
    description: `Named after Wile E. Coyote running off cliffs, this is a grace period that allows the player to jump for a short time after walking off a platform edge.

This makes the game feel more forgiving and responsive. Players often press jump slightly after leaving a platform, and without coyote time, these jumps would fail.

**Recommended values:**
- 0ms: No forgiveness (very punishing)
- 50-100ms: Standard platformer feel
- 150ms+: Very forgiving, good for beginners`
  },

  [ParameterCategory.JUMP_BUFFER]: {
    title: 'Jump Buffer',
    description: `Input buffering stores a jump press for a short time before landing, so the jump executes immediately upon touching the ground.

This prevents "eaten inputs" where the player presses jump slightly too early and nothing happens.

**Recommended values:**
- 0ms: No buffering (requires precise timing)
- 50-100ms: Standard feel, catches most early inputs
- 150ms+: Very forgiving, may feel "laggy" to advanced players

Jump buffer and coyote time work together to make jumping feel responsive and fair.`
  },

  [ParameterCategory.APEX_MODIFIER]: {
    title: 'Apex Modifier',
    description: `Special physics at the peak (apex) of a jump, creating "hang time" that makes platforming more forgiving and satisfying.

**Apex Threshold** defines how slow the vertical velocity must be to trigger apex modifications. Higher values mean a wider "apex zone."

**Apex Gravity** reduces gravity at the apex, making the player float momentarily at the peak. A value of 0.5 means gravity is halved.

**Apex Control Boost** increases horizontal control at the apex, allowing for fine positioning adjustments mid-jump.

These modifiers are subtle but significantly improve game feel in precision platformers.`
  },

  [ParameterCategory.WALL_MECHANICS]: {
    title: 'Wall Mechanics',
    description: `Controls for wall sliding and wall jumping, enabling vertical traversal using walls.

**Wall Slide Speed** limits fall speed when sliding down a wall. Lower values = slower sliding.

**Wall Jump X/Y** control the launch velocities when jumping off a wall. X pushes away from the wall, Y pushes upward.

**Wall Stick Time** creates a brief pause before sliding begins, giving the player time to wall jump without sliding down.

**Wall Jump Lock** temporarily reduces player control after a wall jump, preventing immediate return to the same wall and encouraging upward progress.`
  },

  [ParameterCategory.DASH]: {
    title: 'Dash',
    description: `A quick burst of horizontal movement, useful for dodging, crossing gaps, or adding mobility options.

**Dash Speed** determines how fast the dash moves. Should be significantly faster than normal run speed.

**Dash Duration** controls how long the dash lasts. Shorter dashes are snappier, longer dashes cover more distance.

**Dash Cooldown** prevents dash spam. Set to 0 for unlimited dashing.

**Air Dashes** limits how many times the player can dash before landing. Typically 1, but can be increased for more aerial mobility.

**Preserve Y Velocity** determines whether vertical movement freezes during dash (0) or continues (1). Freezing makes horizontal dashes more predictable.`
  }
};

// Extended descriptions for individual parameters
export const PARAMETER_EXTENDED_DESCRIPTIONS: Record<string, string> = {
  runSpeed: `The maximum horizontal speed the player can reach while running.

**Low values (50-150):** Slow, methodical gameplay. Good for puzzle platformers.
**Medium values (150-300):** Standard platformer feel. Allows for both precision and speed.
**High values (300+):** Fast-paced action. May require larger levels and longer reaction times.

This value is in pixels per second, so at 200 px/s, the player crosses a 1920px screen in about 10 seconds.`,

  acceleration: `How quickly the player reaches maximum speed from a standstill.

**Low values:** Gradual speed buildup, feels "heavy" or "weighty"
**High values:** Near-instant max speed, feels snappy and responsive

Racing games often use lower acceleration for realism, while arcade platformers use high acceleration for responsiveness.`,

  deceleration: `How quickly the player stops when releasing the movement input.

**Low values:** Player slides to a stop (momentum-based)
**High values:** Player stops almost instantly

This works together with Ground Friction. High deceleration with low friction creates unique movement feel.`,

  groundFriction: `Applied when no input is pressed, causing the player to slow down.

**0:** No friction - player slides forever like on ice
**0.5:** Medium friction - noticeable slide
**0.85:** High friction - quick stop
**1:** Maximum friction - instant stop

Ice levels in games typically use very low friction values.`,

  airControl: `Multiplier for horizontal acceleration/deceleration while airborne.

**0:** No air control - very realistic but frustrating
**0.5:** Partial control - balanced feel
**1.0:** Full control - arcade-style, very forgiving

Most platformers use 0.6-0.8 for a good balance between realism and playability.`,

  jumpVelocity: `Initial upward velocity when the player jumps.

This directly affects jump height. The actual height depends on gravity too - higher gravity requires higher jump velocity for the same height.

**Rough height estimates** (at default gravity):
- 200 px/s: ~20px height (small hop)
- 400 px/s: ~80px height (standard jump)
- 600 px/s: ~180px height (high jump)`,

  gravity: `Constant downward acceleration applied to the player.

**Real-world gravity:** ~980 px/s² (at 100 pixels = 1 meter scale)

**Low gravity:** Floaty jumps, more air time, lunar feel
**High gravity:** Snappy jumps, less air time, grounded feel

Gravity strongly affects game feel - tweak this alongside jump velocity.`,

  maxFallSpeed: `Terminal velocity - the maximum speed the player can fall.

Prevents players from reaching dangerous speeds during long falls. Also affects the "weight" feel of the character.

**Low values (200-400):** Floaty falling, more air control time
**High values (600+):** Fast, snappy falling`,

  variableJumpMultiplier: `When the jump button is released early, vertical velocity is multiplied by this value.

**0:** Full jump cut - releasing instantly stops upward movement
**0.5:** Half cut - releasing reduces jump height by roughly half
**1.0:** No cut - jump height is always the same

This enables skill expression through short hops vs full jumps.`,

  doubleJumpEnabled: `Toggle for the double jump ability.

**0:** Disabled - traditional single jump
**1:** Enabled - can jump once more while airborne

The double jump resets upon landing on any surface.`,

  doubleJumpVelocity: `Upward velocity of the second jump.

Often set slightly lower than the ground jump for balance, but can be equal or higher for different gameplay feels.

Some games make the double jump stronger to reward skilled play.`,

  coyoteTime: `Grace period (in milliseconds) after leaving a platform edge during which the player can still jump.

Named after cartoon physics where characters can run off cliffs and hang in the air briefly.

**0ms:** Strict - must jump before leaving platform
**100ms:** Standard - catches most mistimed jumps
**200ms+:** Very forgiving`,

  jumpBufferTime: `Window (in milliseconds) before landing during which a jump input is stored and executed upon landing.

**0ms:** Strict - must press jump exactly when landing
**100ms:** Standard - catches early inputs
**200ms+:** Very forgiving, may feel delayed`,

  apexThreshold: `Vertical velocity range (in px/s) that defines the "apex zone" of a jump.

When |velocity.y| < threshold, apex modifiers activate.

**Low (20-30):** Very small apex zone, subtle effect
**Medium (50-80):** Noticeable hang time
**High (100+):** Extended apex zone, very floaty peak`,

  apexGravityMultiplier: `Gravity multiplier applied at the apex of jumps.

**0.3:** Strong hang time - very floaty peak
**0.5:** Moderate hang time
**1.0:** No modification - normal gravity throughout`,

  apexControlBoost: `Horizontal control multiplier at the apex.

**1.0:** No boost - normal control
**1.2:** Slight boost - subtle precision improvement
**1.5+:** Strong boost - very responsive apex control`,

  wallSlideSpeed: `Maximum fall speed when sliding against a wall.

**Low (40-60):** Slow slide, lots of time to react
**Medium (80-120):** Standard wall slide
**High (150+):** Fast slide, requires quick reactions`,

  wallJumpVelocityX: `Horizontal velocity when jumping off a wall.

Higher values push the player further from the wall. Should be balanced with wall jump lock time to prevent immediate wall return.`,

  wallJumpVelocityY: `Vertical velocity when jumping off a wall.

Can be equal to ground jump, or different for variety. Higher values enable climbing tall wall corridors quickly.`,

  wallStickTime: `Brief pause (in milliseconds) before wall sliding begins.

Gives the player time to input a wall jump without sliding down first.

**0ms:** Immediate slide
**100ms:** Brief stick
**200ms+:** Long stick, easier wall jumping`,

  wallJumpControlLockTime: `Duration (in milliseconds) of reduced control after wall jumping.

Prevents the player from immediately returning to the same wall, encouraging upward progress.

**0ms:** Full control immediately
**150ms:** Standard lock
**300ms+:** Long lock, forces commitment`,

  dashSpeed: `Movement speed during the dash.

Should be significantly faster than run speed to feel impactful.

**2x run speed:** Noticeable boost
**3x run speed:** Powerful dash
**4x+ run speed:** Extreme dash`,

  dashDuration: `How long the dash lasts (in milliseconds).

**Short (100ms):** Quick burst, precise
**Medium (150-200ms):** Standard dash
**Long (300ms+):** Extended dash, covers more distance`,

  dashCooldown: `Time (in milliseconds) before the player can dash again.

**0ms:** No cooldown - unlimited dashing
**500ms:** Standard cooldown
**1000ms+:** Long cooldown, dash is a strategic resource`,

  airDashCount: `Number of dashes allowed before landing.

**0:** Ground dash only
**1:** One air dash (standard)
**2+:** Multiple air dashes for high mobility`,

  dashPreservesYVelocity: `Whether vertical velocity continues during dash.

**0 (Freeze):** Dash is purely horizontal, very predictable
**1 (Preserve):** Falling/rising continues during dash, more dynamic`
};
