// src/game/Food.ts

import { type Point, type Snake } from "./Snake";

export class Food {
  position: Point;
  private cols: number;
  private rows: number;

  constructor(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
    this.position = { x: 0, y: 0 };
  }

  spawn(snake: Snake): void {
    if (snake.segments.length >= this.cols * this.rows) {
      return;
    }

    let x: number;
    let y: number;
    do {
      x = Math.floor(Math.random() * this.cols);
      y = Math.floor(Math.random() * this.rows);
    } while (snake.occupies(x, y));

    this.position = { x, y };
  }
}
