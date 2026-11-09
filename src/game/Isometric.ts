import { GridCoord } from '../types';

export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;
export const GRID_SIZE_X = 13;
export const GRID_SIZE_Y = 13;

export type RotationStep = 0 | 1 | 2 | 3; // 0 = 0°, 1 = 90°, 2 = 180°, 3 = 270°

/**
 * Rotates a grid coordinate by 0, 90, 180, or 270 degrees clockwise.
 */
export function rotateCoord(
  x: number,
  y: number,
  rotation: RotationStep = 0
): GridCoord {
  const maxX = GRID_SIZE_X - 1;
  const maxY = GRID_SIZE_Y - 1;

  switch (rotation) {
    case 1: // 90° CW
      return { x: y, y: maxX - x };
    case 2: // 180°
      return { x: maxX - x, y: maxY - y };
    case 3: // 270° CW
      return { x: maxY - y, y: x };
    case 0:
    default:
      return { x, y };
  }
}

/**
 * Unrotates a rotated coordinate back to the base grid coordinate.
 */
export function unrotateCoord(
  rx: number,
  ry: number,
  rotation: RotationStep = 0
): GridCoord {
  const maxX = GRID_SIZE_X - 1;
  const maxY = GRID_SIZE_Y - 1;

  switch (rotation) {
    case 1: // Reverse 90° CW
      return { x: maxX - ry, y: rx };
    case 2: // Reverse 180°
      return { x: maxX - rx, y: maxY - ry };
    case 3: // Reverse 270° CW
      return { x: rx, y: maxY - rx };
    case 0:
    default:
      return { x: rx, y: ry };
  }
}

/**
 * Rotates a facing direction according to camera rotation.
 */
export function rotateFacing(
  facing: 'SE' | 'SW' | 'NE' | 'NW',
  rotation: RotationStep = 0
): 'SE' | 'SW' | 'NE' | 'NW' {
  if (rotation === 0) return facing;
  const order: Array<'SE' | 'SW' | 'NW' | 'NE'> = ['SE', 'SW', 'NW', 'NE'];
  const idx = order.indexOf(facing);
  if (idx === -1) return facing;
  const newIdx = (idx + rotation) % 4;
  return order[newIdx];
}

/**
 * Converts grid (x, y) coordinates to screen (px, py) isometric projection.
 * Origin (0,0) is at the top corner of the diamond.
 * If rotation is specified, applies rotation first.
 */
export function gridToScreen(
  gridX: number,
  gridY: number,
  offsetX: number = 0,
  offsetY: number = 0,
  rotation: RotationStep = 0
): { x: number; y: number } {
  const { x, y } = rotateCoord(gridX, gridY, rotation);
  return {
    x: offsetX + (x - y) * (TILE_WIDTH / 2),
    y: offsetY + (x + y) * (TILE_HEIGHT / 2),
  };
}

/**
 * Converts screen coordinates to the nearest grid cell in base coordinates.
 */
export function screenToGrid(
  screenX: number,
  screenY: number,
  offsetX: number = 0,
  offsetY: number = 0,
  rotation: RotationStep = 0
): GridCoord {
  const relX = screenX - offsetX;
  const relY = screenY - offsetY;

  const gx = (relX / (TILE_WIDTH / 2) + relY / (TILE_HEIGHT / 2)) / 2;
  const gy = (relY / (TILE_HEIGHT / 2) - relX / (TILE_WIDTH / 2)) / 2;

  const rx = Math.floor(gx + 0.5);
  const ry = Math.floor(gy + 0.5);

  return unrotateCoord(rx, ry, rotation);
}

/**
 * Depth calculation for isometric z-sorting taking rotation into account.
 * Objects further down and to the right on screen should render on top.
 */
export function calculateDepth(
  gridX: number,
  gridY: number,
  elevation: number = 0,
  rotation: RotationStep = 0
): number {
  const { x, y } = rotateCoord(gridX, gridY, rotation);
  return (x + y) * 100 + elevation;
}
