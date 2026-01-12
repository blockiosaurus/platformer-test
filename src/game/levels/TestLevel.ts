import { LevelData, PlatformData } from '../config/types';

// Tile grid: 36px per tile (18px sprite × 2 scale)
// All dimensions must be multiples of 36 for exact hitbox alignment

export const TEST_LEVEL: LevelData = {
  playerSpawn: { x: 100, y: 620 },
  bounds: { width: 2880, height: 800 },

  platforms: [
    // ========== GROUND FLOOR ==========
    // Main ground with gaps for testing
    { x: 0, y: 700, width: 396, height: 36, type: 'static' },
    { x: 468, y: 700, width: 324, height: 36, type: 'static' },
    { x: 864, y: 700, width: 396, height: 36, type: 'static' },
    { x: 1332, y: 700, width: 324, height: 36, type: 'static' },
    { x: 1728, y: 700, width: 576, height: 36, type: 'static' },
    { x: 2376, y: 700, width: 396, height: 36, type: 'static' },

    // ========== JUMP HEIGHT TEST SECTION (Left side) ==========
    // Ascending platforms to test jump heights (3 tiles wide, 1 tile tall)
    { x: 36, y: 592, width: 108, height: 36, type: 'static' },
    { x: 180, y: 520, width: 108, height: 36, type: 'static' },
    { x: 36, y: 448, width: 108, height: 36, type: 'static' },
    { x: 180, y: 376, width: 108, height: 36, type: 'static' },
    { x: 36, y: 304, width: 108, height: 36, type: 'static' },
    { x: 180, y: 232, width: 144, height: 36, type: 'static' },

    // ========== GAP TEST SECTION ==========
    // Varying gap sizes (2 tiles wide, 1 tile tall)
    { x: 504, y: 556, width: 72, height: 36, type: 'static' },
    { x: 612, y: 556, width: 72, height: 36, type: 'static' },   // 36px gap
    { x: 756, y: 556, width: 72, height: 36, type: 'static' },   // 72px gap
    { x: 900, y: 556, width: 72, height: 36, type: 'static' },   // 72px gap
    { x: 1080, y: 556, width: 72, height: 36, type: 'static' },  // 108px gap

    // ========== ONE-WAY PLATFORM SECTION ==========
    // 3 tiles wide, 1 tile tall
    { x: 504, y: 448, width: 108, height: 36, type: 'oneway' },
    { x: 684, y: 376, width: 108, height: 36, type: 'oneway' },
    { x: 504, y: 304, width: 108, height: 36, type: 'oneway' },
    { x: 684, y: 232, width: 108, height: 36, type: 'oneway' },

    // ========== MOVING PLATFORMS SECTION ==========
    // 3 tiles wide, 1 tile tall
    {
      x: 900, y: 448, width: 108, height: 36, type: 'moving',
      movementConfig: { axis: 'horizontal', distance: 180, speed: 80 }
    },
    {
      x: 1080, y: 340, width: 108, height: 36, type: 'moving',
      movementConfig: { axis: 'vertical', distance: 144, speed: 60 }
    },
    {
      x: 1260, y: 268, width: 108, height: 36, type: 'moving',
      movementConfig: { axis: 'horizontal', distance: 108, speed: 150 }
    },

    // ========== WALL JUMP CORRIDOR ==========
    // 1 tile wide walls
    { x: 1728, y: 304, width: 36, height: 396, type: 'wall' },   // Left wall (11 tiles tall)
    { x: 1908, y: 304, width: 36, height: 396, type: 'wall' },   // Right wall
    { x: 1818, y: 412, width: 36, height: 216, type: 'wall' },   // Middle wall (6 tiles tall)
    // Top platform (reward) - 6 tiles wide
    { x: 1728, y: 196, width: 216, height: 36, type: 'static' },
    // Entry platform - 6 tiles wide
    { x: 1728, y: 592, width: 216, height: 36, type: 'static' },

    // ========== PRECISION GAUNTLET ==========
    // Small platforms requiring precise jumps (2 tiles wide)
    { x: 2016, y: 592, width: 72, height: 36, type: 'static' },
    { x: 2124, y: 520, width: 72, height: 36, type: 'static' },
    { x: 2196, y: 448, width: 72, height: 36, type: 'static' },
    { x: 2124, y: 376, width: 72, height: 36, type: 'static' },
    { x: 2196, y: 304, width: 72, height: 36, type: 'static' },
    { x: 2304, y: 232, width: 72, height: 36, type: 'static' },
    { x: 2376, y: 160, width: 108, height: 36, type: 'static' },

    // ========== DASH TEST SECTION ==========
    // Long gap requiring dash (3 tiles wide)
    { x: 2448, y: 484, width: 108, height: 36, type: 'static' },
    { x: 2700, y: 484, width: 108, height: 36, type: 'static' },

    // ========== COMBO SECTION ==========
    // Requires combining wall jumps, double jumps, and dashes
    { x: 2484, y: 376, width: 36, height: 180, type: 'wall' },   // 5 tiles tall
    { x: 2664, y: 340, width: 36, height: 216, type: 'wall' },   // 6 tiles tall
    { x: 2484, y: 232, width: 216, height: 36, type: 'static' },

    // Final platform (3 tiles wide)
    { x: 2700, y: 160, width: 108, height: 36, type: 'static' }
  ] as PlatformData[]
};

// Helper to get spawn position
export function getSpawnPosition(): { x: number; y: number } {
  return { ...TEST_LEVEL.playerSpawn };
}

// Helper to get level bounds
export function getLevelBounds(): { width: number; height: number } {
  return { ...TEST_LEVEL.bounds };
}
