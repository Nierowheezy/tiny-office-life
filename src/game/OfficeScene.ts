import { Application, Container, Graphics, Sprite } from 'pixi.js';
import { CharacterId, GridCoord } from '../types';
import {
  calculateDepth,
  GRID_SIZE_X,
  GRID_SIZE_Y,
  gridToScreen,
  rotateFacing,
  RotationStep,
  screenToGrid,
  TILE_HEIGHT,
  TILE_WIDTH,
} from './Isometric';
import { SpriteFactory } from './SpriteFactory';
import { officeSim } from '../simulation/OfficeSimulation';
import { sounds } from '../audio/SoundEffects';

export interface CameraState {
  zoom: number;
  rotation: RotationStep;
  rotationDegrees: number;
  isPanning: boolean;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: number;
}

interface Particle {
  sprite: Sprite;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export class OfficeScene {
  private app: Application | null = null;
  private containerElement: HTMLElement;
  private isDestroyed = false;

  // Camera & Viewport State
  private baseScale: number = 1.0;
  private userZoom: number = 1.0;
  private panOffset: { x: number; y: number } = { x: 0, y: 0 };
  private rotation: RotationStep = 0;

  // Drag / Pan interaction tracking
  private isPointerDown: boolean = false;
  private isDragging: boolean = false;
  private dragStartPos: { x: number; y: number } = { x: 0, y: 0 };
  private dragStartPan: { x: number; y: number } = { x: 0, y: 0 };
  private activePointers: Map<number, { x: number; y: number }> = new Map();
  private pinchStartDist: number = 0;
  private pinchStartZoom: number = 1.0;

  // Scene Containers
  private root = new Container();
  private floorContainer = new Container();
  private wallContainer = new Container();
  private entityContainer = new Container();
  private fxContainer = new Container();
  private chairsContainer = new Container();

  // Sprites mapping
  private characterSprites: Map<
    CharacterId,
    {
      container: Container;
      body: Sprite;
      emote: Sprite;
      shadow: Graphics;
      selectionRing: Graphics;
    }
  > = new Map();

  private furnitureSprites: Map<string, { container: Container; sprite: Sprite }> = new Map();
  private wallClockSprite: Sprite | null = null;
  private ambientOverlay: Graphics = new Graphics();

  // FX & Animation state
  private ripples: Ripple[] = [];
  private particles: Particle[] = [];
  private walkCycles: Map<CharacterId, number> = new Map();
  private clockAngle: number = 0;
  private animTick: number = 0;
  private unsubscribeSim: (() => void) | null = null;

  // Camera listeners
  private cameraListeners: Set<(cam: CameraState) => void> = new Set();

  constructor(containerElement: HTMLElement) {
    this.containerElement = containerElement;
  }

  public subscribeCamera(fn: (cam: CameraState) => void): () => void {
    this.cameraListeners.add(fn);
    fn(this.getCameraState());
    return () => this.cameraListeners.delete(fn);
  }

  private notifyCamera() {
    const cam = this.getCameraState();
    this.cameraListeners.forEach(fn => fn(cam));
  }

  public getCameraState(): CameraState {
    return {
      zoom: this.userZoom,
      rotation: this.rotation,
      rotationDegrees: this.rotation * 90,
      isPanning: this.isDragging,
    };
  }

  public async init() {
    this.app = new Application();
    await this.app.init({
      resizeTo: this.containerElement,
      backgroundAlpha: 0,
      antialias: false,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    if (this.isDestroyed) {
      this.app.destroy(true);
      return;
    }

    this.containerElement.appendChild(this.app.canvas);

    // Build scene graph
    this.app.stage.addChild(this.root);
    this.root.addChild(this.floorContainer);
    this.root.addChild(this.wallContainer);
    this.root.addChild(this.chairsContainer);
    this.root.addChild(this.entityContainer);
    this.root.addChild(this.ambientOverlay);
    this.root.addChild(this.fxContainer);

    // Build initial world
    this.rebuildWorld();

    // Setup input listeners for Pan, Zoom, and Clicks
    this.setupInteractivity();

    // Center and scale office
    this.updateTransform();
    window.addEventListener('resize', this.onResize);

    // Pixi Ticker update
    this.app.ticker.add(this.onTick);

    // Subscribe to simulation changes
    this.unsubscribeSim = officeSim.subscribe(() => {
      this.syncSceneState();
    });
  }

  private onResize = () => {
    this.updateTransform();
  };

  /**
   * Calculates the base center origin for the office diorama
   */
  private getBaseOrigin(width: number, height: number): { x: number; y: number } {
    const officePixelHeight = (GRID_SIZE_X + GRID_SIZE_Y) * (TILE_HEIGHT / 2) + 160;
    return {
      x: width / 2,
      y: (height - officePixelHeight * this.baseScale) / 2 + 100 * this.baseScale,
    };
  }

  /**
   * Clamps panOffset so the office diorama can never get lost or fly off-screen
   */
  private clampPanOffset() {
    if (!this.app || !this.app.canvas) return;
    const width = this.app.screen.width;
    const height = this.app.screen.height;

    // Strict boundary limits: office center cannot drift more than 40% away from center
    const maxPanX = Math.max(120, width * 0.4 * Math.max(1, this.userZoom));
    const maxPanY = Math.max(100, height * 0.4 * Math.max(1, this.userZoom));

    this.panOffset.x = Math.max(-maxPanX, Math.min(maxPanX, this.panOffset.x));
    this.panOffset.y = Math.max(-maxPanY, Math.min(maxPanY, this.panOffset.y));
  }

  /**
   * Recalculates base scale and root position incorporating pan offset and user zoom
   */
  private updateTransform() {
    if (!this.app || !this.app.canvas) return;
    const width = this.app.screen.width;
    const height = this.app.screen.height;

    // The office diamond span in pixels
    const officePixelWidth = (GRID_SIZE_X + GRID_SIZE_Y) * (TILE_WIDTH / 2);
    const officePixelHeight = (GRID_SIZE_X + GRID_SIZE_Y) * (TILE_HEIGHT / 2) + 160;

    // Fit scale with nice padding
    const scaleX = (width * 0.94) / officePixelWidth;
    const scaleY = (height * 0.88) / officePixelHeight;
    this.baseScale = Math.min(scaleX, scaleY, 1.35);

    this.clampPanOffset();

    const totalScale = this.baseScale * this.userZoom;
    this.root.scale.set(totalScale);

    const origin = this.getBaseOrigin(width, height);
    this.root.x = origin.x + this.panOffset.x;
    this.root.y = origin.y + this.panOffset.y;
  }

  /**
   * Rebuilds all scene layers when rotation occurs
   */
  private rebuildWorld() {
    this.buildFloor();
    this.buildWalls();
    this.buildFurniture();
    this.buildChairs();
    this.buildCharacters();
  }

  private buildFloor() {
    this.floorContainer.removeChildren();

    // 3D Foundation Slab
    const baseG = new Graphics();
    const pLeft = gridToScreen(0, GRID_SIZE_Y, 0, 0, this.rotation);
    const pBottom = gridToScreen(GRID_SIZE_X, GRID_SIZE_Y, 0, 0, this.rotation);
    const pRight = gridToScreen(GRID_SIZE_X, 0, 0, 0, this.rotation);

    const slabDepth = 22;

    // Left slab side
    baseG.poly([
      pLeft.x, pLeft.y,
      pBottom.x, pBottom.y,
      pBottom.x, pBottom.y + slabDepth,
      pLeft.x, pLeft.y + slabDepth,
    ]).fill(0xa88d6b);

    // Right slab side
    baseG.poly([
      pBottom.x, pBottom.y,
      pRight.x, pRight.y,
      pRight.x, pRight.y + slabDepth,
      pBottom.x, pBottom.y + slabDepth,
    ]).fill(0x8f7556);

    // Slab bottom drop shadow
    baseG.poly([
      pLeft.x - 12, pLeft.y + slabDepth + 4,
      pBottom.x, pBottom.y + slabDepth + 14,
      pRight.x + 12, pRight.y + slabDepth + 4,
      pBottom.x, pBottom.y + slabDepth + 22,
    ]).fill({ color: 0x000000, alpha: 0.12 });

    this.floorContainer.addChild(baseG);

    // Render floor tiles
    const woodTex = SpriteFactory.getWoodFloorTexture();
    const carpetTex = SpriteFactory.getCarpetFloorTexture();

    for (let x = 0; x < GRID_SIZE_X; x++) {
      for (let y = 0; y < GRID_SIZE_Y; y++) {
        // Lounge and meeting area carpet
        const isCarpet = (x >= 9 && y >= 6) || (x >= 3 && x <= 7 && y >= 4 && y <= 5);
        const tileSprite = new Sprite(isCarpet ? carpetTex : woodTex);

        const screenPos = gridToScreen(x, y, 0, 0, this.rotation);
        tileSprite.x = screenPos.x - TILE_WIDTH / 2;
        tileSprite.y = screenPos.y;
        this.floorContainer.addChild(tileSprite);
      }
    }
  }

  private buildWalls() {
    this.wallContainer.removeChildren();

    // Top-Left diorama back wall (along screen-rotated x = 0)
    for (let i = 0; i < GRID_SIZE_Y; i++) {
      const hasWindow = i === 3 || i === 8;
      const wallTex = SpriteFactory.getLeftWallTexture(hasWindow, 12);
      const wallSprite = new Sprite(wallTex);

      // Back-left wall sits along rotated diamond edge
      const pos = {
        x: -i * (TILE_WIDTH / 2),
        y: i * (TILE_HEIGHT / 2),
      };
      wallSprite.x = pos.x - 32;
      wallSprite.y = pos.y - 56;
      this.wallContainer.addChild(wallSprite);
    }

    // Top-Right diorama back wall (along screen-rotated y = 0)
    for (let i = 0; i < GRID_SIZE_X; i++) {
      const wallTex = SpriteFactory.getRightWallTexture();
      const wallSprite = new Sprite(wallTex);

      const pos = {
        x: i * (TILE_WIDTH / 2),
        y: i * (TILE_HEIGHT / 2),
      };
      wallSprite.x = pos.x;
      wallSprite.y = pos.y - 56;
      this.wallContainer.addChild(wallSprite);
    }
  }

  private buildChairs() {
    this.chairsContainer.removeChildren();
    const chairCoords = [
      { x: 3, y: 4 },
      { x: 6, y: 4 },
      { x: 9, y: 4 },
      { x: 4, y: 8 },
      { x: 7, y: 8 },
    ];
    chairCoords.forEach(coord => {
      const chairSprite = new Sprite(SpriteFactory.getChairTexture());
      chairSprite.anchor.set(0.5, 0.8);
      const pos = gridToScreen(coord.x, coord.y, 0, 0, this.rotation);
      chairSprite.x = pos.x;
      chairSprite.y = pos.y + TILE_HEIGHT / 2;
      chairSprite.zIndex = calculateDepth(coord.x, coord.y, 5, this.rotation);
      this.chairsContainer.addChild(chairSprite);
    });
  }

  private buildFurniture() {
    this.entityContainer.removeChildren();
    this.furnitureSprites.clear();
    const items = officeSim.getState().furniture;

    items.forEach(item => {
      const container = new Container();
      let sprite: Sprite;

      switch (item.type) {
        case 'DESK': {
          const deskIdx = item.id.includes('sarah') ? 2 : 1;
          sprite = new Sprite(SpriteFactory.getDeskTexture(true, deskIdx));
          sprite.anchor.set(0.5, 0.7);
          break;
        }
        case 'COFFEE_MACHINE':
          sprite = new Sprite(SpriteFactory.getCoffeeStationTexture(false));
          sprite.anchor.set(0.5, 0.75);
          break;
        case 'WATER_DISPENSER':
          sprite = new Sprite(SpriteFactory.getWaterDispenserTexture());
          sprite.anchor.set(0.5, 0.8);
          break;
        case 'SOFA':
          sprite = new Sprite(SpriteFactory.getSofaTexture());
          sprite.anchor.set(0.5, 0.65);
          break;
        case 'PLANT': {
          const type = item.id.includes('monstera') ? 'monstera' : 'ficus';
          sprite = new Sprite(SpriteFactory.getPlantTexture(type));
          sprite.anchor.set(0.5, 0.85);
          break;
        }
        case 'BOOKSHELF':
          sprite = new Sprite(SpriteFactory.getBookshelfTexture());
          sprite.anchor.set(0.5, 0.85);
          break;
        case 'WALL_CLOCK':
          sprite = new Sprite(SpriteFactory.getWallClockTexture(0));
          sprite.anchor.set(0.5, 0.5);
          this.wallClockSprite = sprite;
          break;
        case 'NOTICEBOARD':
          sprite = new Sprite(SpriteFactory.getNoticeboardTexture());
          sprite.anchor.set(0.5, 0.5);
          break;
        default:
          sprite = new Sprite(SpriteFactory.getDeskTexture());
          sprite.anchor.set(0.5, 0.7);
          break;
      }

      container.addChild(sprite);

      // Position
      const screenPos = gridToScreen(item.coord.x, item.coord.y, 0, 0, this.rotation);
      if (item.type === 'WALL_CLOCK') {
        container.x = screenPos.x + 12;
        container.y = screenPos.y - 40;
      } else if (item.type === 'NOTICEBOARD') {
        container.x = screenPos.x + 16;
        container.y = screenPos.y - 36;
      } else {
        container.x = screenPos.x;
        container.y = screenPos.y + TILE_HEIGHT / 2;
      }

      // Depth sort index with rotation
      container.zIndex = calculateDepth(
        item.coord.x,
        item.coord.y,
        item.type === 'WALL_CLOCK' ? -10 : 10,
        this.rotation
      );

      // Interactive cursor & click
      container.eventMode = 'static';
      container.cursor = 'pointer';
      container.on('pointerdown', e => {
        // If not dragged
        if (!this.isDragging) {
          e.stopPropagation();
          this.handleFurnitureClick(item.id);
        }
      });

      this.entityContainer.addChild(container);
      this.furnitureSprites.set(item.id, { container, sprite });
    });

    this.entityContainer.sortChildren();
  }

  private buildCharacters() {
    this.characterSprites.clear();
    const chars = officeSim.getState().characters;

    Object.values(chars).forEach(char => {
      const container = new Container();

      // Shadow
      const shadow = new Graphics();
      shadow.ellipse(0, 0, 8, 4).fill({ color: 0x000000, alpha: 0.25 });
      container.addChild(shadow);

      // Selection ring indicator
      const selectionRing = new Graphics();
      selectionRing.ellipse(0, 0, 14, 7).stroke({ width: 2, color: 0x38bdf8, alpha: 0.9 });
      selectionRing.visible = false;
      container.addChild(selectionRing);

      // Body Sprite
      const effectiveFacing = rotateFacing(char.facing, this.rotation);
      const body = new Sprite(SpriteFactory.getCharacterTexture(char.id, 'idle', effectiveFacing));
      body.anchor.set(0.5, 0.88);
      container.addChild(body);

      // Emote speech bubble
      const emote = new Sprite(SpriteFactory.getEmoteTexture('code'));
      emote.anchor.set(0.5, 1);
      emote.y = -36;
      emote.visible = false;
      container.addChild(emote);

      // Interactivity
      container.eventMode = 'static';
      container.cursor = 'pointer';
      container.on('pointerdown', e => {
        if (!this.isDragging) {
          e.stopPropagation();
          officeSim.selectCharacter(char.id);
          this.spawnRipple(container.x, container.y, 0x38bdf8);
        }
      });

      this.entityContainer.addChild(container);
      this.characterSprites.set(char.id, {
        container,
        body,
        emote,
        shadow,
        selectionRing,
      });

      this.walkCycles.set(char.id, 0);
    });

    this.entityContainer.sortChildren();
  }

  /**
   * Sets up drag-to-pan, wheel zoom, touch pinch-zoom, and floor clicks
   */
  private setupInteractivity() {
    if (!this.app || !this.app.canvas) return;

    const canvas = this.app.canvas;

    // Pointer Down (Mouse or Touch)
    canvas.addEventListener('pointerdown', (e: PointerEvent) => {
      this.isPointerDown = true;
      this.isDragging = false;
      this.dragStartPos = { x: e.clientX, y: e.clientY };
      this.dragStartPan = { ...this.panOffset };
      this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // Handle 2-finger pinch start
      if (this.activePointers.size === 2) {
        const pts = Array.from(this.activePointers.values());
        this.pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        this.pinchStartZoom = this.userZoom;
      }
    });

    // Pointer Move
    window.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.isPointerDown) return;

      if (this.activePointers.has(e.pointerId)) {
        this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      // Handle 2-finger pinch-zoom
      if (this.activePointers.size === 2) {
        const pts = Array.from(this.activePointers.values());
        const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (this.pinchStartDist > 0) {
          const ratio = currentDist / this.pinchStartDist;
          this.setZoom(this.pinchStartZoom * ratio);
        }
        return;
      }

      // Single pointer pan
      const dx = e.clientX - this.dragStartPos.x;
      const dy = e.clientY - this.dragStartPos.y;

      if (!this.isDragging && Math.hypot(dx, dy) > 5) {
        this.isDragging = true;
        this.notifyCamera();
      }

      if (this.isDragging) {
        this.panOffset.x = this.dragStartPan.x + dx;
        this.panOffset.y = this.dragStartPan.y + dy;
        this.updateTransform();
      }
    });

    // Pointer Up
    window.addEventListener('pointerup', (e: PointerEvent) => {
      this.activePointers.delete(e.pointerId);

      if (this.isPointerDown) {
        this.isPointerDown = false;

        // If not dragged -> treat as click on canvas floor
        if (!this.isDragging && this.app) {
          const rect = canvas.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const clickY = e.clientY - rect.top;

          // Convert to root local coordinates
          const localX = (clickX - this.root.x) / this.root.scale.x;
          const localY = (clickY - this.root.y) / this.root.scale.y;

          const grid = screenToGrid(localX, localY, 0, 0, this.rotation);

          if (
            grid.x >= 0 &&
            grid.x < GRID_SIZE_X &&
            grid.y >= 0 &&
            grid.y < GRID_SIZE_Y
          ) {
            this.spawnRipple(localX, localY, 0x22d3ee);
            officeSim.selectCharacter(null);
            officeSim.selectFurniture(null);
          }
        }

        if (this.isDragging) {
          this.isDragging = false;
          this.notifyCamera();
        }
      }
    });

    // Mouse Wheel & Trackpad Zoom
    canvas.addEventListener(
      'wheel',
      (e: WheelEvent) => {
        e.preventDefault();

        let factor = 1.0;
        if (e.ctrlKey) {
          // Mac trackpad pinch gesture (e.deltaY is proportional to pinch velocity)
          factor = Math.exp(-e.deltaY * 0.015);
        } else {
          // Standard mouse wheel or Mac two-finger scroll
          // Cap delta magnitude to handle both gentle trackpad gestures and notched mouse wheels
          const delta = Math.max(-120, Math.min(120, e.deltaY));
          // Negative delta (push forward / scroll up) -> factor > 1 (zoom in)
          // Positive delta (pull backward / scroll down) -> factor < 1 (zoom out)
          factor = Math.exp(-delta * 0.003);
        }

        this.zoomAtPoint(e.clientX, e.clientY, factor);
      },
      { passive: false }
    );
  }

  /**
   * Zooms in or out centered at a specific screen coordinate (e.g. mouse cursor or center)
   */
  private zoomAtPoint(clientX: number, clientY: number, factor: number) {
    if (!this.app || !this.app.canvas) return;
    const rect = this.app.canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    const newZoom = Math.min(2.5, Math.max(0.6, this.userZoom * factor));
    if (Math.abs(newZoom - this.userZoom) < 0.0005) return;

    // Current and target scales
    const currentScale = this.baseScale * this.userZoom;
    const targetScale = this.baseScale * newZoom;

    // Calculate world position currently under the mouse pointer
    const worldX = (px - this.root.x) / currentScale;
    const worldY = (py - this.root.y) / currentScale;

    // Apply new zoom level
    this.userZoom = newZoom;

    // Keep the world point under the pointer invariant:
    // px = newRootX + worldX * targetScale => newRootX = px - worldX * targetScale
    // And this.root.x = origin.x + panOffset.x => panOffset.x = newRootX - origin.x
    const origin = this.getBaseOrigin(this.app.screen.width, this.app.screen.height);
    this.panOffset.x = px - worldX * targetScale - origin.x;
    this.panOffset.y = py - worldY * targetScale - origin.y;

    // Clamp panOffset so the office diorama never gets lost or flies off-screen
    this.clampPanOffset();

    this.updateTransform();
    this.notifyCamera();
  }

  // Camera Public Controls
  public zoomIn() {
    sounds.playClick();
    if (this.app) {
      this.zoomAtPoint(this.app.screen.width / 2, this.app.screen.height / 2, 1.25);
    } else {
      this.setZoom(this.userZoom * 1.25);
    }
  }

  public zoomOut() {
    sounds.playClick();
    if (this.app) {
      this.zoomAtPoint(this.app.screen.width / 2, this.app.screen.height / 2, 0.8);
    } else {
      this.setZoom(this.userZoom * 0.8);
    }
  }

  public setZoom(zoom: number) {
    this.userZoom = Math.min(2.5, Math.max(0.6, zoom));
    this.clampPanOffset();
    this.updateTransform();
    this.notifyCamera();
  }

  public resetView() {
    sounds.playClick();
    this.userZoom = 1.0;
    this.panOffset = { x: 0, y: 0 };
    this.rotation = 0;
    this.rebuildWorld();
    this.updateTransform();
    this.notifyCamera();
  }

  public rotateLeft() {
    sounds.playChime();
    this.rotation = ((this.rotation + 3) % 4) as RotationStep;
    this.rebuildWorld();
    this.updateTransform();
    this.spawnRipple(0, 160, 0x6366f1);
    this.notifyCamera();
  }

  public rotateRight() {
    sounds.playChime();
    this.rotation = ((this.rotation + 1) % 4) as RotationStep;
    this.rebuildWorld();
    this.updateTransform();
    this.spawnRipple(0, 160, 0x6366f1);
    this.notifyCamera();
  }

  public setRotation(step: RotationStep) {
    if (this.rotation === step) return;
    this.rotation = step;
    this.rebuildWorld();
    this.updateTransform();
    this.notifyCamera();
  }

  private handleFurnitureClick(id: string) {
    officeSim.selectFurniture(id);

    if (id === 'coffee_machine') {
      officeSim.triggerCoffeeBreak();
      const pos = gridToScreen(1, 1, 0, 0, this.rotation);
      this.spawnRipple(pos.x, pos.y, 0xf59e0b);
    } else if (id === 'water_dispenser') {
      const pos = gridToScreen(1, 2, 0, 0, this.rotation);
      this.spawnRipple(pos.x, pos.y, 0x06b6d4);
    } else if (id.startsWith('desk_')) {
      const furniture = officeSim.getState().furniture.find(f => f.id === id);
      if (furniture && furniture.assignedCharacterId) {
        officeSim.selectCharacter(furniture.assignedCharacterId);
      }
    }
  }

  public spawnRipple(x: number, y: number, color = 0x38bdf8) {
    this.ripples.push({
      x,
      y,
      radius: 4,
      maxRadius: 44,
      alpha: 0.8,
      color,
    });
  }

  private onTick = (ticker: { deltaMS: number }) => {
    const deltaSeconds = ticker.deltaMS / 1000;
    this.animTick += deltaSeconds;

    // 1. Advance simulation
    officeSim.update(deltaSeconds);

    // 2. Render and animate characters
    const simState = officeSim.getState();
    const chars = simState.characters;

    Object.values(chars).forEach(char => {
      const spriteObj = this.characterSprites.get(char.id);
      if (!spriteObj) return;

      const { container, body, emote, selectionRing } = spriteObj;

      container.visible = !char.isHome;
      if (char.isHome) return;

      // Position interpolation with rotation
      const screenPos = gridToScreen(
        char.currentCoord.x,
        char.currentCoord.y,
        0,
        0,
        this.rotation
      );
      container.x = screenPos.x;
      container.y = screenPos.y + TILE_HEIGHT / 2;
      container.zIndex = calculateDepth(
        char.currentCoord.x,
        char.currentCoord.y,
        20,
        this.rotation
      );

      selectionRing.visible = simState.selectedCharacterId === char.id;

      // Animation frame
      let action: 'idle' | 'walk1' | 'walk2' | 'typing' | 'drinking' | 'sleeping' = 'idle';

      if (char.state === 'WALKING' || char.state === 'GOING_HOME') {
        const cycle = (this.walkCycles.get(char.id) || 0) + deltaSeconds * 6 * simState.speed;
        this.walkCycles.set(char.id, cycle);
        action = Math.floor(cycle) % 2 === 0 ? 'walk1' : 'walk2';
      } else if (char.state === 'WORKING') {
        action = Math.sin(this.animTick * 5) > 0.2 ? 'typing' : 'idle';
      } else if (char.state === 'DRINKING') {
        action = 'drinking';
      } else if (char.state === 'SLEEPING') {
        action = 'sleeping';
        if (Math.random() < 0.05 * simState.speed) {
          this.spawnZzzParticle(container.x, container.y - 25);
        }
      } else {
        action = 'idle';
      }

      const effectiveFacing = rotateFacing(char.facing, this.rotation);
      body.texture = SpriteFactory.getCharacterTexture(char.id, action, effectiveFacing);

      // Emotes
      if (char.state === 'DRINKING') {
        emote.visible = true;
        emote.texture = SpriteFactory.getEmoteTexture('coffee');
      } else if (char.state === 'CHATTING') {
        emote.visible = true;
        emote.texture = SpriteFactory.getEmoteTexture('idea');
      } else if (char.state === 'SLEEPING') {
        emote.visible = true;
        emote.texture = SpriteFactory.getEmoteTexture('zzz');
      } else if (char.state === 'WORKING' && Math.sin(this.animTick + char.deskCoord.x) > 0.8) {
        emote.visible = true;
        emote.texture = SpriteFactory.getEmoteTexture(char.id === 'sarah' ? 'heart' : 'code');
      } else {
        emote.visible = false;
      }
    });

    // 3. Update Wall Clock
    if (this.wallClockSprite) {
      const minuteAngle = ((simState.simTimeMinutes % 60) / 60) * Math.PI * 2;
      if (Math.abs(minuteAngle - this.clockAngle) > 0.05) {
        this.clockAngle = minuteAngle;
        this.wallClockSprite.texture = SpriteFactory.getWallClockTexture(minuteAngle);
      }
    }

    // 4. Update Coffee Steam
    const coffeeItem = simState.furniture.find(f => f.id === 'coffee_machine');
    if (coffeeItem && coffeeItem.stateData?.isBrewing) {
      const pos = gridToScreen(1, 1, 0, 0, this.rotation);
      if (Math.random() < 0.3) {
        this.spawnSteamParticle(pos.x, pos.y - 10);
      }
    }

    // 5. Update Ambient Lighting
    this.updateAmbientLighting(simState.simTimeMinutes);

    // 6. Update Effects
    this.updateEffects(deltaSeconds);

    this.entityContainer.sortChildren();
  };

  private spawnZzzParticle(x: number, y: number) {
    const sprite = new Sprite(SpriteFactory.getEmoteTexture('zzz'));
    sprite.scale.set(0.6);
    sprite.anchor.set(0.5, 0.5);
    sprite.x = x;
    sprite.y = y;
    this.fxContainer.addChild(sprite);

    this.particles.push({
      sprite,
      x,
      y,
      vx: (Math.random() - 0.5) * 6,
      vy: -15 - Math.random() * 10,
      alpha: 0.9,
      life: 0,
      maxLife: 2.2,
    });
  }

  private spawnSteamParticle(x: number, y: number) {
    const g = new Graphics();
    g.circle(0, 0, 2 + Math.random() * 2).fill({ color: 0xffffff, alpha: 0.5 });
    const sprite = g as unknown as Sprite;
    sprite.x = x;
    sprite.y = y;
    this.fxContainer.addChild(sprite);

    this.particles.push({
      sprite,
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: -12 - Math.random() * 6,
      alpha: 0.6,
      life: 0,
      maxLife: 1.5,
    });
  }

  private updateAmbientLighting(simMinutes: number) {
    this.ambientOverlay.clear();
    const w = this.app?.screen.width || 1200;
    const h = this.app?.screen.height || 900;

    let tintColor = 0xffffff;
    let alpha = 0;

    if (simMinutes < 540) {
      tintColor = 0xffedd5;
      alpha = 0.08 * (1 - (simMinutes - 480) / 60);
    } else if (simMinutes > 1020) {
      tintColor = 0xf97316;
      alpha = 0.12 * ((simMinutes - 1020) / 60);
    }

    if (alpha > 0) {
      this.ambientOverlay.rect(-w * 2, -h * 2, w * 5, h * 5).fill({ color: tintColor, alpha });
    }
  }

  private updateEffects(dt: number) {
    this.fxContainer.removeChildren();

    // Ripples
    const fxG = new Graphics();
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += 40 * dt;
      r.alpha -= 1.2 * dt;

      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
        continue;
      }

      fxG.ellipse(r.x, r.y, r.radius, r.radius * 0.5).stroke({
        width: 2,
        color: r.color,
        alpha: r.alpha,
      });
    }
    this.fxContainer.addChild(fxG);

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      p.sprite.x = p.x;
      p.sprite.y = p.y;
      p.sprite.alpha = p.alpha;

      if (p.life >= p.maxLife) {
        p.sprite.destroy();
        this.particles.splice(i, 1);
      } else {
        this.fxContainer.addChild(p.sprite);
      }
    }
  }

  private syncSceneState() {
    const simState = officeSim.getState();
    simState.furniture.forEach(item => {
      const obj = this.furnitureSprites.get(item.id);
      if (!obj) return;

      if (item.type === 'COFFEE_MACHINE') {
        const isBrewing = item.stateData?.isBrewing || false;
        obj.sprite.texture = SpriteFactory.getCoffeeStationTexture(isBrewing);
      }
    });
  }

  public destroy() {
    this.isDestroyed = true;
    window.removeEventListener('resize', this.onResize);
    if (this.unsubscribeSim) {
      this.unsubscribeSim();
      this.unsubscribeSim = null;
    }
    if (this.app) {
      this.app.ticker.remove(this.onTick);
      this.app.destroy(true, { children: true, texture: false });
      this.app = null;
    }
  }
}
