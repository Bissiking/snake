// src/game/Snake.ts

export interface Point {
  x: number;
  y: number;
}

export enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

const DIRECTION_VECTORS: Record<Direction, Point> = {
  [Direction.UP]: { x: 0, y: -1 },
  [Direction.DOWN]: { x: 0, y: 1 },
  [Direction.LEFT]: { x: -1, y: 0 },
  [Direction.RIGHT]: { x: 1, y: 0 },
};

const OPPOSITE: Record<Direction, Direction> = {
  [Direction.UP]: Direction.DOWN,
  [Direction.DOWN]: Direction.UP,
  [Direction.LEFT]: Direction.RIGHT,
  [Direction.RIGHT]: Direction.LEFT,
};

export class Snake {
  segments: Point[];
  direction: Direction;
  private cols: number;
  private rows: number;

  constructor(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
    this.direction = Direction.RIGHT;

    const startX = Math.floor(cols / 2);
    const startY = Math.floor(rows / 2);
    this.segments = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];
  }

  get head(): Point {
    return this.segments[0];
  }

  setDirection(newDirection: Direction): void {
    if (OPPOSITE[newDirection] !== this.direction) {
      this.direction = newDirection;
    }
  }

  move(): Point {
    const vec = DIRECTION_VECTORS[this.direction];
    const newHead: Point = {
      x: (this.head.x + vec.x + this.cols) % this.cols,
      y: (this.head.y + vec.y + this.rows) % this.rows,
    };

    this.segments.unshift(newHead);
    const tail = this.segments.pop()!;
    return tail;
  }

  grow(tail: Point): void {
    this.segments.push(tail);
  }

  checkSelfCollision(): boolean {
    const h = this.head;
    for (let i = 1; i < this.segments.length; i++) {
      if (this.segments[i].x === h.x && this.segments[i].y === h.y) {
        return true;
      }
    }
    return false;
  }

  occupies(x: number, y: number): boolean {
    return this.segments.some((s) => s.x === x && s.y === y);
  }

  reset(): void {
    this.direction = Direction.RIGHT;
    const startX = Math.floor(this.cols / 2);
    const startY = Math.floor(this.rows / 2);
    this.segments = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];
  }
}
