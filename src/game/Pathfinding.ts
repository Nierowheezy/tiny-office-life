import { GridCoord } from '../types';
import { GRID_SIZE_X, GRID_SIZE_Y } from './Isometric';

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

export class PathfindingGrid {
  private walkable: boolean[][];

  constructor(width = GRID_SIZE_X, height = GRID_SIZE_Y) {
    this.walkable = Array.from({ length: width }, () =>
      Array.from({ length: height }, () => true)
    );
  }

  public setWalkable(x: number, y: number, isWalkable: boolean) {
    if (this.isValid(x, y)) {
      this.walkable[x][y] = isWalkable;
    }
  }

  public isTileWalkable(x: number, y: number): boolean {
    if (!this.isValid(x, y)) return false;
    return this.walkable[x][y];
  }

  public isValid(x: number, y: number): boolean {
    return x >= 0 && x < GRID_SIZE_X && y >= 0 && y < GRID_SIZE_Y;
  }

  /**
   * Finds the shortest walkable path between start and end using A*
   */
  public findPath(start: GridCoord, end: GridCoord): GridCoord[] {
    if (start.x === end.x && start.y === end.y) return [start];

    // If destination is unwalkable (e.g. clicking directly on the desk object),
    // find the closest adjacent walkable tile to the end!
    let target = end;
    if (!this.isTileWalkable(end.x, end.y)) {
      const neighbors = this.getNeighbors(end.x, end.y, true);
      const walkableNeighbors = neighbors.filter(n => this.isTileWalkable(n.x, n.y));
      if (walkableNeighbors.length > 0) {
        // pick neighbor closest to start
        walkableNeighbors.sort((a, b) => {
          const distA = Math.hypot(a.x - start.x, a.y - start.y);
          const distB = Math.hypot(b.x - start.x, b.y - start.y);
          return distA - distB;
        });
        target = walkableNeighbors[0];
      } else {
        return [];
      }
    }

    const openList: Node[] = [];
    const closedSet = new Set<string>();

    const startNode: Node = {
      x: start.x,
      y: start.y,
      g: 0,
      h: this.heuristic(start, target),
      f: this.heuristic(start, target),
      parent: null,
    };

    openList.push(startNode);

    const key = (x: number, y: number) => `${x},${y}`;

    while (openList.length > 0) {
      // Find lowest f score
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift()!;

      if (current.x === target.x && current.y === target.y) {
        // Reconstruct path
        const path: GridCoord[] = [];
        let curr: Node | null = current;
        while (curr) {
          path.unshift({ x: curr.x, y: curr.y });
          curr = curr.parent;
        }
        return path;
      }

      closedSet.add(key(current.x, current.y));

      const neighbors = this.getNeighbors(current.x, current.y, false);
      for (const n of neighbors) {
        if (!this.isTileWalkable(n.x, n.y)) continue;
        if (closedSet.has(key(n.x, n.y))) continue;

        const gScore = current.g + 1;
        let neighborNode = openList.find(node => node.x === n.x && node.y === n.y);

        if (!neighborNode) {
          neighborNode = {
            x: n.x,
            y: n.y,
            g: gScore,
            h: this.heuristic(n, target),
            f: gScore + this.heuristic(n, target),
            parent: current,
          };
          openList.push(neighborNode);
        } else if (gScore < neighborNode.g) {
          neighborNode.g = gScore;
          neighborNode.f = gScore + neighborNode.h;
          neighborNode.parent = current;
        }
      }
    }

    // Path not found
    return [];
  }

  private heuristic(a: GridCoord, b: GridCoord): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  private getNeighbors(x: number, y: number, allowUnwalkable = false): GridCoord[] {
    const directions = [
      { x: 0, y: -1 }, // North
      { x: 1, y: 0 },  // East
      { x: 0, y: 1 },  // South
      { x: -1, y: 0 }, // West
    ];

    const results: GridCoord[] = [];
    for (const d of directions) {
      const nx = x + d.x;
      const ny = y + d.y;
      if (this.isValid(nx, ny)) {
        if (allowUnwalkable || this.walkable[nx][ny]) {
          results.push({ x: nx, y: ny });
        }
      }
    }
    return results;
  }
}
