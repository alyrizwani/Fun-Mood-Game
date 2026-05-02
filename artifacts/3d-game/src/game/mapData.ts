// Axis-aligned bounding boxes for all solid geometry in the world.
// Used by BulletManager for collision and by World.tsx for rendering.

export interface AABB {
  minX: number; maxX: number;
  minY: number; maxY: number;
  minZ: number; maxZ: number;
}

function box(cx: number, cy: number, cz: number, sx: number, sy: number, sz: number): AABB {
  return {
    minX: cx - sx / 2, maxX: cx + sx / 2,
    minY: cy - sy / 2, maxY: cy + sy / 2,
    minZ: cz - sz / 2, maxZ: cz + sz / 2,
  };
}

export function pointInAABB(px: number, py: number, pz: number, a: AABB): boolean {
  return px >= a.minX && px <= a.maxX
      && py >= a.minY && py <= a.maxY
      && pz >= a.minZ && pz <= a.maxZ;
}

// ── Border walls ──────────────────────────────────────────────────────
export const BORDER_WALLS: AABB[] = [
  box(0,   2.5,  25,  50, 5, 0.8),
  box(0,   2.5, -25,  50, 5, 0.8),
  box(25,  2.5,   0, 0.8, 5,  50),
  box(-25, 2.5,   0, 0.8, 5,  50),
];

// ── Cover objects ─────────────────────────────────────────────────────
export const COVER_BOXES: AABB[] = [
  // Corner crate clusters — NE
  box( 7,   0.6,  7,  1.6, 1.2, 1.6),
  box( 8.6, 0.35, 7,  1.2, 0.7, 1.4),
  box( 7,   1.45, 7,  1.0, 0.5, 1.0),
  // NW
  box(-7,   0.6,  7,  1.6, 1.2, 1.6),
  box(-8.6, 0.35, 7,  1.2, 0.7, 1.4),
  // SE
  box( 7,   0.6, -7,  1.6, 1.2, 1.6),
  box( 8.6, 0.35,-7,  1.2, 0.7, 1.4),
  // SW
  box(-7,   0.6, -7,  1.6, 1.2, 1.6),
  box(-8.6, 0.35,-7,  1.2, 0.7, 1.4),

  // Mid-axis metal barriers
  box( 0,  0.7,  10, 5,   1.4, 0.6),
  box( 0,  0.7, -10, 5,   1.4, 0.6),
  box( 10, 0.7,   0, 0.6, 1.4, 5  ),
  box(-10, 0.7,   0, 0.6, 1.4, 5  ),

  // Low concrete barriers
  box( 4,  0.35,  14, 4,   0.7, 0.5),
  box(-4,  0.35,  14, 4,   0.7, 0.5),
  box( 4,  0.35, -14, 4,   0.7, 0.5),
  box(-4,  0.35, -14, 4,   0.7, 0.5),
  box( 14, 0.35,   4, 0.5, 0.7, 4  ),
  box( 14, 0.35,  -4, 0.5, 0.7, 4  ),
  box(-14, 0.35,   4, 0.5, 0.7, 4  ),
  box(-14, 0.35,  -4, 0.5, 0.7, 4  ),

  // Corner towers
  box( 16, 1.5,  16, 2.4, 3, 2.4),
  box(-16, 1.5,  16, 2.4, 3, 2.4),
  box( 16, 1.5, -16, 2.4, 3, 2.4),
  box(-16, 1.5, -16, 2.4, 3, 2.4),

  // Pillars near center
  box( 4, 1.5,  4, 0.7, 3, 0.7),
  box(-4, 1.5,  4, 0.7, 3, 0.7),
  box( 4, 1.5, -4, 0.7, 3, 0.7),
  box(-4, 1.5, -4, 0.7, 3, 0.7),

  // Diagonal scattered crates
  box( 12, 0.4,  5, 1.2, 0.8, 1.2),
  box(-12, 0.4, -5, 1.2, 0.8, 1.2),
  box(  5, 0.4,-12, 1.2, 0.8, 1.2),
  box( -5, 0.4, 12, 1.2, 0.8, 1.2),

  // Central raised platform (approximate cylinder as box)
  box(0, 0.12, 0, 9.0, 0.3, 9.0),
];

// All collidable AABBs combined
export const ALL_COLLIDABLE: AABB[] = [...BORDER_WALLS, ...COVER_BOXES];
