import { Texture } from 'pixi.js';
import { TILE_WIDTH, TILE_HEIGHT } from './Isometric';
import { CharacterId } from '../types';

/**
 * Creates an HTMLCanvasElement with disabled smoothing for crisp pixel art.
 */
function createPixelCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

/**
 * Procedural Sprite Factory that renders all isometric pixel art into PixiJS Textures.
 * Completely self-contained, crisp pixel art without external image assets.
 */
export class SpriteFactory {
  private static cache: Map<string, Texture> = new Map();

  /**
   * Generates isometric wood plank floor tile (64x32)
   */
  public static getWoodFloorTexture(): Texture {
    const key = 'tile_wood';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const { canvas, ctx } = createPixelCanvas(TILE_WIDTH, TILE_HEIGHT);
    const hw = TILE_WIDTH / 2;
    const hh = TILE_HEIGHT / 2;

    // Diamond path
    ctx.beginPath();
    ctx.moveTo(hw, 0);
    ctx.lineTo(TILE_WIDTH, hh);
    ctx.lineTo(hw, TILE_HEIGHT);
    ctx.lineTo(0, hh);
    ctx.closePath();

    // Warm wooden plank base
    ctx.fillStyle = '#e8d4b8';
    ctx.fill();

    // Wood plank seams and grain (drawn clipped to the diamond)
    ctx.save();
    ctx.clip();

    ctx.fillStyle = '#dfc8aa';
    // Plank stripes along isometric axis
    ctx.beginPath();
    ctx.moveTo(hw - 16, 0);
    ctx.lineTo(TILE_WIDTH - 16, hh);
    ctx.lineTo(hw - 16, TILE_HEIGHT);
    ctx.lineTo(-16, hh);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f0deca';
    ctx.beginPath();
    ctx.moveTo(hw + 16, 0);
    ctx.lineTo(TILE_WIDTH + 16, hh);
    ctx.lineTo(hw + 16, TILE_HEIGHT);
    ctx.lineTo(16, hh);
    ctx.closePath();
    ctx.fill();

    // Subtle plank border lines
    ctx.strokeStyle = '#cbb292';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hw - 8, 4);
    ctx.lineTo(TILE_WIDTH - 8, hh + 4);
    ctx.moveTo(hw + 8, 4);
    ctx.lineTo(TILE_WIDTH + 8, hh + 4);
    ctx.stroke();

    ctx.restore();

    // Outer subtle isometric border
    ctx.strokeStyle = '#c6ad8d';
    ctx.lineWidth = 1;
    ctx.stroke();

    const tex = Texture.from(canvas);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Generates isometric carpet floor tile (e.g. for lounge & meeting area)
   */
  public static getCarpetFloorTexture(): Texture {
    const key = 'tile_carpet';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const { canvas, ctx } = createPixelCanvas(TILE_WIDTH, TILE_HEIGHT);
    const hw = TILE_WIDTH / 2;
    const hh = TILE_HEIGHT / 2;

    ctx.beginPath();
    ctx.moveTo(hw, 0);
    ctx.lineTo(TILE_WIDTH, hh);
    ctx.lineTo(hw, TILE_HEIGHT);
    ctx.lineTo(0, hh);
    ctx.closePath();

    ctx.fillStyle = '#d5dfd9';
    ctx.fill();

    // Woven subtle pattern
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#c7d4cc';
    for (let x = 4; x < TILE_WIDTH; x += 6) {
      for (let y = 2; y < TILE_HEIGHT; y += 4) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
    ctx.restore();

    ctx.strokeStyle = '#b9c8be';
    ctx.lineWidth = 1;
    ctx.stroke();

    const tex = Texture.from(canvas);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Generates Left Wall Segment (facing SE)
   */
  public static getLeftWallTexture(hasWindow = false, skyHour = 12): Texture {
    const key = `wall_left_${hasWindow}_${Math.floor(skyHour)}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const w = 32;
    const h = 72;
    const { canvas, ctx } = createPixelCanvas(w, h);

    // Wall trapezoid: runs from bottom left towards center
    // Wall surface
    ctx.fillStyle = '#f3f4f6';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 16);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h - 16);
    ctx.closePath();
    ctx.fill();

    // Baseboard trim at bottom
    ctx.fillStyle = '#d1d5db';
    ctx.beginPath();
    ctx.moveTo(0, h - 22);
    ctx.lineTo(w, h - 6);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h - 16);
    ctx.closePath();
    ctx.fill();

    // Top crown molding
    ctx.fillStyle = '#e5e7eb';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 16);
    ctx.lineTo(w, 20);
    ctx.lineTo(0, 4);
    ctx.closePath();
    ctx.fill();

    if (hasWindow) {
      // Window frame
      const winX = 6;
      const winY = 16;
      const winW = 20;
      const winH = 30;

      // Outer frame
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(winX, winY);
      ctx.lineTo(winX + winW, winY + 10);
      ctx.lineTo(winX + winW, winY + winH + 10);
      ctx.lineTo(winX, winY + winH);
      ctx.closePath();
      ctx.fill();

      // Glass area with sky color based on sim time
      let skyColor = '#93c5fd'; // Day noon
      let sunColor = '#fef08a';
      if (skyHour < 9 || skyHour > 17) {
        skyColor = '#fdba74'; // Golden morning / sunset
        sunColor = '#fb923c';
      }

      ctx.fillStyle = skyColor;
      ctx.beginPath();
      ctx.moveTo(winX + 2, winY + 2);
      ctx.lineTo(winX + winW - 2, winY + 10);
      ctx.lineTo(winX + winW - 2, winY + winH + 8);
      ctx.lineTo(winX + 2, winY + winH - 2);
      ctx.closePath();
      ctx.fill();

      // Sun or cloud
      ctx.fillStyle = sunColor;
      ctx.fillRect(winX + 10, winY + 12, 4, 4);

      // Window mullions (cross bars)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(winX + winW / 2, winY + 6);
      ctx.lineTo(winX + winW / 2, winY + winH + 4);
      ctx.moveTo(winX + 2, winY + winH / 2);
      ctx.lineTo(winX + winW - 2, winY + winH / 2 + 8);
      ctx.stroke();

      // Window sill
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(winX - 1, winY + winH, winW + 2, 3);
    }

    const tex = Texture.from(canvas);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Generates Right Wall Segment (facing SW)
   */
  public static getRightWallTexture(): Texture {
    const key = 'wall_right';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const w = 32;
    const h = 72;
    const { canvas, ctx } = createPixelCanvas(w, h);

    // Wall trapezoid: runs from center towards top right
    ctx.fillStyle = '#e8ebed'; // slightly shadowed
    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, h - 16);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Baseboard trim at bottom
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(0, h - 6);
    ctx.lineTo(w, h - 22);
    ctx.lineTo(w, h - 16);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Top crown molding
    ctx.fillStyle = '#dbe1e6';
    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, 4);
    ctx.lineTo(0, 20);
    ctx.closePath();
    ctx.fill();

    const tex = Texture.from(canvas);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Generates Desk with Computer & Lamp
   */
  public static getDeskTexture(screenLight: boolean = true, deskNumber = 1): Texture {
    const key = `desk_${screenLight}_${deskNumber}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const w = 64;
    const h = 58;
    const { canvas, ctx } = createPixelCanvas(w, h);

    const cx = 32;
    const topY = 24;

    // Desk Legs
    ctx.fillStyle = '#475569';
    // Back legs
    ctx.fillRect(cx - 20, topY + 8, 3, 18);
    ctx.fillRect(cx + 17, topY + 8, 3, 18);
    // Front legs
    ctx.fillRect(cx - 24, topY + 16, 3, 18);
    ctx.fillRect(cx + 21, topY + 16, 3, 18);

    // Isometric Desk Top (diamond)
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.lineTo(cx + 24, topY + 12);
    ctx.lineTo(cx, topY + 24);
    ctx.lineTo(cx - 24, topY + 12);
    ctx.closePath();

    // Light maple/birch tabletop
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Table edge thickness
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(cx - 24, topY + 12);
    ctx.lineTo(cx, topY + 24);
    ctx.lineTo(cx, topY + 27);
    ctx.lineTo(cx - 24, topY + 15);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(cx, topY + 24);
    ctx.lineTo(cx + 24, topY + 12);
    ctx.lineTo(cx + 24, topY + 15);
    ctx.lineTo(cx, topY + 27);
    ctx.closePath();
    ctx.fill();

    // Computer Monitor 1 (Main)
    const monX = cx - 4;
    const monY = topY - 14;

    // Monitor stand
    ctx.fillStyle = '#334155';
    ctx.fillRect(monX + 8, monY + 18, 4, 6);
    ctx.fillRect(monX + 5, monY + 23, 10, 2);

    // Monitor Frame
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(monX, monY, 20, 18);

    // Screen
    ctx.fillStyle = screenLight ? '#0284c7' : '#0f172a';
    ctx.fillRect(monX + 1, monY + 1, 18, 15);

    if (screenLight) {
      // Code lines or colorful UI on monitor
      if (deskNumber === 2) {
        // Sarah Designer: Color palette mockup
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(monX + 3, monY + 3, 6, 5);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(monX + 11, monY + 3, 6, 5);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(monX + 3, monY + 9, 14, 4);
      } else {
        // Code lines (Alex / Toby / Mike / Kevin)
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(monX + 3, monY + 3, 10, 2);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(monX + 5, monY + 6, 12, 2);
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(monX + 3, monY + 9, 8, 2);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(monX + 6, monY + 12, 10, 2);
      }
    }

    // Keyboard & Mousepad on desk
    ctx.fillStyle = '#334155';
    ctx.fillRect(cx - 8, topY + 14, 12, 4);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(cx - 7, topY + 14, 10, 3);
    // Mouse
    ctx.fillStyle = '#475569';
    ctx.fillRect(cx + 7, topY + 15, 3, 4);

    // Cute coffee mug on desk
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(cx - 16, topY + 10, 4, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 15, topY + 9, 2, 2);

    const tex = Texture.from(canvas);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Generates Office Chair
   */
  public static getChairTexture(): Texture {
    const key = 'office_chair';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const w = 32;
    const h = 38;
    const { canvas, ctx } = createPixelCanvas(w, h);

    const cx = 16;
    // Casters base
    ctx.fillStyle = '#334155';
    ctx.fillRect(cx - 6, 32, 12, 2);
    ctx.fillRect(cx - 1, 26, 2, 6);

    // Seat cushion
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(cx, 24, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.ellipse(cx, 25, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Backrest
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(cx - 6, 10, 12, 14);
    // Mesh pattern lines
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(cx - 4, 12, 8, 10);

    const tex = Texture.from(canvas);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Generates Espresso / Coffee Machine Counter
   */
  public static getCoffeeStationTexture(brewing: boolean = false): Texture {
    const key = `coffee_station_${brewing}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const w = 48;
    const h = 60;
    const { canvas, ctx } = createPixelCanvas(w, h);

    const cx = 24;
    const topY = 32;

    // Cabinet counter
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.lineTo(cx + 18, topY + 9);
    ctx.lineTo(cx, topY + 18);
    ctx.lineTo(cx - 18, topY + 9);
    ctx.closePath();
    ctx.fill();

    // Cabinet body
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(cx - 18, topY + 9);
    ctx.lineTo(cx, topY + 18);
    ctx.lineTo(cx, topY + 36);
    ctx.lineTo(cx - 18, topY + 27);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(cx, topY + 18);
    ctx.lineTo(cx + 18, topY + 9);
    ctx.lineTo(cx + 18, topY + 27);
    ctx.lineTo(cx, topY + 36);
    ctx.closePath();
    ctx.fill();

    // Espresso Machine on top
    const mY = topY - 22;
    // Machine body (stainless steel / dark titanium)
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(cx - 10, mY, 20, 20);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(cx - 9, mY + 2, 18, 6);

    // Indicator lights
    ctx.fillStyle = brewing ? '#22c55e' : '#38bdf8';
    ctx.fillRect(cx - 6, mY + 3, 3, 3);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(cx - 1, mY + 3, 3, 3);

    // Portafilter & spout
    ctx.fillStyle = '#334155';
    ctx.fillRect(cx - 4, mY + 10, 8, 3);
    ctx.fillRect(cx - 1, mY + 13, 2, 3);

    // Drip tray & small cup
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(cx - 8, mY + 18, 16, 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(cx - 3, mY + 14, 6, 5); // Mug

    // Paper cups stack on side
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(cx + 11, topY - 14, 4, 12);
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(cx + 11, topY - 10, 4, 2);

    const tex = Texture.from(canvas);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Generates Water Dispenser
   */
  public static getWaterDispenserTexture(): Texture {
    const key = 'water_dispenser';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const w = 32;
    const h = 54;
    const { canvas, ctx } = createPixelCanvas(w, h);

    const cx = 16;
    // White body
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(cx - 8, 20, 16, 30);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(cx - 8, 20, 4, 30);

    // Dispenser alcove
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(cx - 5, 28, 10, 12);

    // Red and Blue taps
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(cx - 4, 29, 2, 4);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(cx + 2, 29, 2, 4);

    // Water bottle top (inverted blue bottle with bubbles)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(cx - 6, 6, 12, 14, 3);
    ctx.fill();

    // Water reflection
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(cx - 4, 8, 3, 10);
    // Bubble
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx + 1, 12, 2, 2);

    const tex = Texture.from(canvas);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Generates Cozy Lounge Sofa
   */
  public static getSofaTexture(): Texture {
    const key = 'lounge_sofa';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const w = 64;
    const h = 48;
    const { canvas, ctx } = createPixelCanvas(w, h);

    const cx = 32;
    const topY = 16;

    // Sofa backrest
    ctx.fillStyle = '#0d9488'; // Deep teal
    ctx.beginPath();
    ctx.moveTo(cx - 20, topY);
    ctx.lineTo(cx + 10, topY - 10);
    ctx.lineTo(cx + 26, topY - 2);
    ctx.lineTo(cx - 4, topY + 8);
    ctx.closePath();
    ctx.fill();

    // Sofa cushions
    ctx.fillStyle = '#14b8a6';
    ctx.beginPath();
    ctx.moveTo(cx - 16, topY + 8);
    ctx.lineTo(cx + 16, topY - 4);
    ctx.lineTo(cx + 24, topY + 12);
    ctx.lineTo(cx - 8, topY + 24);
    ctx.closePath();
    ctx.fill();

    // Front apron
    ctx.fillStyle = '#0f766e';
    ctx.beginPath();
    ctx.moveTo(cx - 8, topY + 24);
    ctx.lineTo(cx + 24, topY + 12);
    ctx.lineTo(cx + 24, topY + 18);
    ctx.lineTo(cx - 8, topY + 30);
    ctx.closePath();
    ctx.fill();

    // Throw pillow
    ctx.fillStyle = '#fbbf24'; // Yellow pillow
    ctx.fillRect(cx - 10, topY + 6, 10, 8);

    // Sofa wooden legs
    ctx.fillStyle = '#78350f';
    ctx.fillRect(cx - 8, topY + 30, 3, 5);
    ctx.fillRect(cx + 21, topY + 18, 3, 5);

    const tex = Texture.from(canvas);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Generates Potted Office Plant (Ficus / Monstera)
   */
  public static getPlantTexture(type: 'monstera' | 'ficus' = 'monstera'): Texture {
    const key = `plant_${type}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const w = 36;
    const h = 50;
    const { canvas, ctx } = createPixelCanvas(w, h);

    const cx = 18;
    // Terracotta pot
    const potY = 32;
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(cx - 8, potY);
    ctx.lineTo(cx + 8, potY);
    ctx.lineTo(cx + 6, potY + 14);
    ctx.lineTo(cx - 6, potY + 14);
    ctx.closePath();
    ctx.fill();

    // Pot rim
    ctx.fillStyle = '#f97316';
    ctx.fillRect(cx - 9, potY - 2, 18, 4);

    // Plant stems & leaves
    if (type === 'monstera') {
      ctx.fillStyle = '#15803d';
      ctx.fillRect(cx - 1, potY - 14, 2, 14);
      // Broad split leaves
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(cx - 8, potY - 16, 7, 5, -0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx + 8, potY - 18, 8, 5, 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(cx, potY - 24, 7, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Tall ficus tree
      ctx.fillStyle = '#78350f'; // Trunk
      ctx.fillRect(cx - 1, potY - 22, 2, 22);

      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(cx, potY - 24, 10, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(cx - 3, potY - 26, 7, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = Texture.from(canvas);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Generates Bookshelf
   */
  public static getBookshelfTexture(): Texture {
    const key = 'bookshelf';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const w = 42;
    const h = 64;
    const { canvas, ctx } = createPixelCanvas(w, h);

    // Wooden frame
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(4, 4, 34, 56);
    ctx.fillStyle = '#a16207';
    ctx.fillRect(6, 6, 30, 52);

    // Shelves (3 tiers)
    const shelves = [18, 34, 48];
    ctx.fillStyle = '#713f12';
    shelves.forEach(sy => {
      ctx.fillRect(6, sy, 30, 3);
    });

    // Books on shelves
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    // Top shelf books
    let bx = 8;
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = colors[i % colors.length];
      const bh = 7 + (i % 3) * 2;
      ctx.fillRect(bx, 18 - bh, 4, bh);
      bx += 5;
    }
    // Mid shelf books
    bx = 10;
    for (let i = 2; i < 6; i++) {
      ctx.fillStyle = colors[i % colors.length];
      const bh = 8 + (i % 2) * 3;
      ctx.fillRect(bx, 34 - bh, 4, bh);
      bx += 5;
    }

    const tex = Texture.from(canvas);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Generates Wall Clock with moving minute hand
   */
  public static getWallClockTexture(minuteAngleRad: number = 0): Texture {
    const key = `clock_${Math.floor(minuteAngleRad * 10)}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const w = 24;
    const h = 24;
    const { canvas, ctx } = createPixelCanvas(w, h);

    const cx = 12;
    const cy = 12;

    // Clock rim
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();

    // Clock face
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();

    // Hour marks
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(cx - 1, cy - 7, 2, 2);
    ctx.fillRect(cx - 1, cy + 5, 2, 2);
    ctx.fillRect(cx - 7, cy - 1, 2, 2);
    ctx.fillRect(cx + 5, cy - 1, 2, 2);

    // Center pin
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 1, cy - 1, 2, 2);

    // Minute Hand
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.sin(minuteAngleRad) * 6,
      cy - Math.cos(minuteAngleRad) * 6
    );
    ctx.stroke();

    const tex = Texture.from(canvas);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Generates Cork Noticeboard with colorful sticky notes
   */
  public static getNoticeboardTexture(): Texture {
    const key = 'noticeboard';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const w = 36;
    const h = 28;
    const { canvas, ctx } = createPixelCanvas(w, h);

    // Pine wood border
    ctx.fillStyle = '#92400e';
    ctx.fillRect(0, 0, w, h);

    // Cork interior
    ctx.fillStyle = '#d97706';
    ctx.fillRect(2, 2, w - 4, h - 4);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(3, 3, w - 6, h - 6);

    // Sticky notes!
    ctx.fillStyle = '#fde047'; // Yellow
    ctx.fillRect(5, 5, 6, 6);
    ctx.fillStyle = '#f472b6'; // Pink
    ctx.fillRect(14, 6, 7, 7);
    ctx.fillStyle = '#38bdf8'; // Cyan
    ctx.fillRect(24, 5, 6, 6);

    ctx.fillStyle = '#4ade80'; // Green
    ctx.fillRect(7, 14, 7, 6);
    ctx.fillStyle = '#fed7aa'; // Memo with line
    ctx.fillRect(18, 14, 11, 7);
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(20, 16, 7, 1);
    ctx.fillRect(20, 18, 5, 1);

    const tex = Texture.from(canvas);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Generates Character Sprite
   * Supports:
   * - 5 Characters (Alex, Sarah, Mike, Toby, Kevin)
   * - Actions: 'idle' | 'walk1' | 'walk2' | 'typing' | 'drinking' | 'sleeping'
   * - Facing: 'SE' | 'SW' | 'NE' | 'NW'
   */
  public static getCharacterTexture(
    charId: CharacterId,
    action: 'idle' | 'walk1' | 'walk2' | 'typing' | 'drinking' | 'sleeping' = 'idle',
    facing: 'SE' | 'SW' | 'NE' | 'NW' = 'SE'
  ): Texture {
    const key = `char_${charId}_${action}_${facing}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const w = 32;
    const h = 42;
    const { canvas, ctx } = createPixelCanvas(w, h);

    // Character palettes
    const palettes: Record<
      CharacterId,
      { hair: string; skin: string; shirt: string; pants: string; shoes: string; accessory?: string }
    > = {
      alex: {
        hair: '#451a03',
        skin: '#fcd34d',
        shirt: '#2563eb', // Developer Blue
        pants: '#1e293b',
        shoes: '#0f172a',
        accessory: 'glasses',
      },
      sarah: {
        hair: '#b45309',
        skin: '#fed7aa',
        shirt: '#f43f5e', // Designer Coral/Pink
        pants: '#475569',
        shoes: '#f8fafc',
        accessory: 'beret',
      },
      mike: {
        hair: '#1e293b',
        skin: '#fde047',
        shirt: '#eab308', // Manager Gold
        pants: '#334155',
        shoes: '#78350f',
        accessory: 'tie',
      },
      toby: {
        hair: '#d97706',
        skin: '#ffedd5',
        shirt: '#10b981', // Intern Mint Teal
        pants: '#3b82f6',
        shoes: '#ffffff',
        accessory: 'hoodie',
      },
      kevin: {
        hair: '#374151',
        skin: '#fef08a',
        shirt: '#a855f7', // Sleepy Purple
        pants: '#6b7280',
        shoes: '#4b5563',
        accessory: 'sleepy_eyes',
      },
    };

    const pal = palettes[charId] || palettes.alex;
    const cx = 16;
    const isFacingLeft = facing === 'SW' || facing === 'NW';
    const isFacingBack = facing === 'NE' || facing === 'NW';

    // Bobbing offset for walking or sleeping
    let bob = 0;
    if (action === 'walk1') bob = -1;
    if (action === 'walk2') bob = 1;

    // Drop shadow under feet
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, 38, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    if (action === 'sleeping') {
      // Slumped sleeping pose
      const sy = 24;
      // Body slumped forward
      ctx.fillStyle = pal.shirt;
      ctx.fillRect(cx - 6, sy, 12, 10);
      // Head down
      ctx.fillStyle = pal.hair;
      ctx.fillRect(cx - 5, sy - 6, 10, 8);
      // Little Zzz can be spawned externally
      // Legs resting
      ctx.fillStyle = pal.pants;
      ctx.fillRect(cx - 5, sy + 10, 10, 5);
      ctx.fillStyle = pal.shoes;
      ctx.fillRect(cx - 5, sy + 15, 10, 2);

      const tex = Texture.from(canvas);
      this.cache.set(key, tex);
      return tex;
    }

    // Standard Standing / Walking / Typing / Drinking Body
    const headY = 10 + bob;
    const torsoY = 18 + bob;
    const legY = 28 + bob;

    // LEGS
    ctx.fillStyle = pal.pants;
    if (action === 'walk1') {
      ctx.fillRect(cx - 4, legY, 3, 8);
      ctx.fillRect(cx + 1, legY + 2, 3, 6);
      ctx.fillStyle = pal.shoes;
      ctx.fillRect(cx - 5, legY + 8, 4, 3);
      ctx.fillRect(cx + 1, legY + 8, 4, 3);
    } else if (action === 'walk2') {
      ctx.fillRect(cx - 4, legY + 2, 3, 6);
      ctx.fillRect(cx + 1, legY, 3, 8);
      ctx.fillStyle = pal.shoes;
      ctx.fillRect(cx - 4, legY + 8, 4, 3);
      ctx.fillRect(cx + 2, legY + 8, 4, 3);
    } else {
      // Idle / typing / drinking
      ctx.fillRect(cx - 4, legY, 3, 8);
      ctx.fillRect(cx + 1, legY, 3, 8);
      ctx.fillStyle = pal.shoes;
      ctx.fillRect(cx - 5, legY + 8, 4, 3);
      ctx.fillRect(cx + 1, legY + 8, 4, 3);
    }

    // TORSO / SHIRT
    ctx.fillStyle = pal.shirt;
    ctx.fillRect(cx - 5, torsoY, 10, 10);

    // Collar / Tie / Details
    if (pal.accessory === 'tie' && !isFacingBack) {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx - 1, torsoY + 1, 2, 6);
    }

    // ARMS
    if (action === 'typing') {
      // Arms reaching forward to keyboard
      ctx.fillStyle = pal.shirt;
      ctx.fillRect(isFacingLeft ? cx - 6 : cx + 2, torsoY + 2, 4, 4);
      ctx.fillStyle = pal.skin;
      ctx.fillRect(isFacingLeft ? cx - 8 : cx + 4, torsoY + 5, 4, 3);
    } else if (action === 'drinking') {
      // Arm holding mug up
      ctx.fillStyle = pal.shirt;
      ctx.fillRect(cx + 2, torsoY + 1, 4, 5);
      ctx.fillStyle = pal.skin;
      ctx.fillRect(cx + 4, torsoY + 4, 3, 3);
      // Red/white mug
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cx + 5, torsoY + 2, 4, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx + 6, torsoY + 3, 2, 2);
    } else {
      // Normal arms
      ctx.fillStyle = pal.shirt;
      ctx.fillRect(cx - 7, torsoY + 1, 2, 7);
      ctx.fillRect(cx + 5, torsoY + 1, 2, 7);
      ctx.fillStyle = pal.skin;
      ctx.fillRect(cx - 7, torsoY + 8, 2, 2);
      ctx.fillRect(cx + 5, torsoY + 8, 2, 2);
    }

    // HEAD
    ctx.fillStyle = pal.skin;
    ctx.fillRect(cx - 4, headY, 8, 8);

    // HAIR
    ctx.fillStyle = pal.hair;
    if (isFacingBack) {
      ctx.fillRect(cx - 5, headY - 2, 10, 9);
    } else {
      ctx.fillRect(cx - 5, headY - 2, 10, 4);
      if (isFacingLeft) {
        ctx.fillRect(cx + 1, headY + 2, 3, 4);
      } else {
        ctx.fillRect(cx - 4, headY + 2, 3, 4);
      }
    }

    // Sarah's Beret
    if (pal.accessory === 'beret') {
      ctx.fillStyle = '#334155';
      ctx.fillRect(cx - 6, headY - 4, 12, 3);
      ctx.fillRect(cx - 1, headY - 6, 3, 2);
    }

    // FACIAL FEATURES (if facing front/side)
    if (!isFacingBack) {
      // Eyes
      ctx.fillStyle = '#1e293b';
      if (isFacingLeft) {
        ctx.fillRect(cx - 3, headY + 3, 2, 2);
      } else {
        ctx.fillRect(cx + 1, headY + 3, 2, 2);
        ctx.fillRect(cx - 3, headY + 3, 2, 2);
      }

      // Alex's Glasses
      if (pal.accessory === 'glasses') {
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - 4, headY + 2, 7, 3);
      }

      // Kevin's sleepy half-closed eyes
      if (pal.accessory === 'sleepy_eyes') {
        ctx.fillStyle = '#374151';
        ctx.fillRect(cx - 3, headY + 3, 2, 1);
        ctx.fillRect(cx + 1, headY + 3, 2, 1);
      }
    }

    const tex = Texture.from(canvas);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Generates Emote / Status Speech Bubble
   */
  public static getEmoteTexture(type: 'coffee' | 'code' | 'idea' | 'heart' | 'zzz' | 'chat' | 'water'): Texture {
    const key = `emote_${type}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const w = 24;
    const h = 24;
    const { canvas, ctx } = createPixelCanvas(w, h);

    // Bubble background
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(2, 2, 20, 16, 4);
    ctx.fill();

    // Bubble tail
    ctx.beginPath();
    ctx.moveTo(10, 18);
    ctx.lineTo(14, 18);
    ctx.lineTo(12, 22);
    ctx.closePath();
    ctx.fill();

    // Border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Bubble Icon
    const cx = 12;
    const cy = 10;
    switch (type) {
      case 'coffee':
        ctx.fillStyle = '#78350f';
        ctx.fillRect(cx - 4, cy - 3, 7, 6);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(cx - 3, cy - 2, 5, 2);
        break;
      case 'code':
        ctx.fillStyle = '#2563eb';
        // < >
        ctx.fillRect(cx - 4, cy - 1, 2, 2);
        ctx.fillRect(cx + 2, cy - 1, 2, 2);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(cx - 1, cy - 2, 2, 4);
        break;
      case 'idea':
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(cx, cy - 1, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cx - 1, cy + 3, 2, 2);
        break;
      case 'heart':
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(cx - 3, cy - 3, 3, 3);
        ctx.fillRect(cx, cy - 3, 3, 3);
        ctx.fillRect(cx - 3, cy, 6, 2);
        ctx.fillRect(cx - 1, cy + 2, 2, 2);
        break;
      case 'zzz':
        ctx.fillStyle = '#8b5cf6';
        // 'Z'
        ctx.fillRect(cx - 3, cy - 4, 6, 2);
        ctx.fillRect(cx - 1, cy - 2, 2, 2);
        ctx.fillRect(cx - 3, cy, 6, 2);
        break;
      case 'water':
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'chat':
      default:
        ctx.fillStyle = '#64748b';
        ctx.fillRect(cx - 4, cy - 1, 2, 2);
        ctx.fillRect(cx - 1, cy - 1, 2, 2);
        ctx.fillRect(cx + 2, cy - 1, 2, 2);
        break;
    }

    const tex = Texture.from(canvas);
    this.cache.set(key, tex);
    return tex;
  }
}
