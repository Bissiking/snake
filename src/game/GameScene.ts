// src/game/GameScene.ts

import Phaser from "phaser";
import { Snake, Direction } from "./Snake";
import { Food } from "./Food";
import { InputManager, Action } from "./InputManager";
import { getConfig } from "./Skins";
import type { SnakeSkin, FoodSkin, BackgroundSkin } from "./Skins";

const TARGET_CELL_SIZE = 30;
const INITIAL_MOVE_INTERVAL = 150;
const MIN_MOVE_INTERVAL = 60;
const SPEED_INCREMENT = 2;
const SCORE_PER_FOOD = 10;

export class GameScene extends Phaser.Scene {
  private snake!: Snake;
  private food!: Food;
  private inputManager!: InputManager;

  private score = 0;
  private moveInterval = INITIAL_MOVE_INTERVAL;
  private moveAccumulator = 0;

  private isGameOver = false;

  private cols = 0;
  private rows = 0;
  private cellSize = 0;

  private snakeSkin!: SnakeSkin;
  private foodSkin!: FoodSkin;
  private bgSkin!: BackgroundSkin;

  private scoreText!: Phaser.GameObjects.Text;
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private snakeGraphics!: Phaser.GameObjects.Graphics;
  private foodGraphics!: Phaser.GameObjects.Graphics;

  private gameOverBg!: Phaser.GameObjects.Rectangle;
  private gameOverTitle!: Phaser.GameObjects.Text;
  private gameOverScore!: Phaser.GameObjects.Text;
  private gameOverRestart!: Phaser.GameObjects.Text;
  private gameOverElements: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super("GameScene");
  }

  create(): void {
    const config = getConfig();
    this.snakeSkin = config.snakeSkin;
    this.foodSkin = config.foodSkin;
    this.bgSkin = config.backgroundSkin;

    this.inputManager = new InputManager(config.keyMapping);
    this.calculateDimensions();
    this.snake = new Snake(this.cols, this.rows);
    this.food = new Food(this.cols, this.rows);
    this.food.spawn(this.snake);

    this.cameras.main.setBackgroundColor(this.bgSkin.backgroundColor);

    this.gridGraphics = this.add.graphics();
    this.foodGraphics = this.add.graphics();
    this.snakeGraphics = this.add.graphics();

    this.scoreText = this.add
      .text(this.cameras.main.centerX, 20, "Score: 0", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "monospace",
      })
      .setOrigin(0.5, 0)
      .setDepth(10);

    this.createGameOverUI();
    this.drawGrid();
    this.drawFood();
    this.drawSnake();

    this.moveAccumulator = 0;
    this.isGameOver = false;
    this.score = 0;
    this.scoreText.setText("Score: 0");
    this.hideGameOver();

    this.scale.on("resize", () => {
      this.handleResize();
    });
  }

  private calculateDimensions(): void {
    const { width, height } = this.cameras.main;

    this.cellSize = TARGET_CELL_SIZE;
    this.cols = Math.ceil(width / this.cellSize);
    this.rows = Math.ceil(height / this.cellSize);
  }

  private handleResize(): void {
    this.calculateDimensions();
    this.snake = new Snake(this.cols, this.rows);
    this.food = new Food(this.cols, this.rows);
    this.food.spawn(this.snake);
    this.drawGrid();
    this.drawSnake();
    this.drawFood();
    this.repositionUI();
  }

  private repositionUI(): void {
    const cx = this.cameras.main.centerX;

    this.scoreText.setPosition(cx, 20);

    if (this.gameOverBg) {
      const cy = this.cameras.main.centerY;
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;

      this.gameOverBg.setPosition(cx, cy).setSize(width, height);
      this.gameOverTitle.setPosition(cx, cy - 40);
      this.gameOverScore.setPosition(cx, cy + 10);
      this.gameOverRestart.setPosition(cx, cy + 50);
    }
  }

  update(_time: number, delta: number): void {
    this.inputManager.update();

    if (this.isGameOver) {
      if (this.inputManager.consumeConfirm()) {
        this.restart();
      }
      if (this.inputManager.consumeBack()) {
        this.goBack();
      }
      return;
    }

    this.moveAccumulator += delta;

    if (this.moveAccumulator >= this.moveInterval) {
      this.moveAccumulator -= this.moveInterval;

      const direction = this.inputManager.consumeDirection();
      if (direction) {
        const dir = this.actionToDirection(direction);
        if (dir !== null) {
          this.snake.setDirection(dir);
        }
      }

      this.moveSnake();
    }
  }

  private actionToDirection(action: Action): Direction | null {
    switch (action) {
      case Action.UP:
        return Direction.UP;
      case Action.DOWN:
        return Direction.DOWN;
      case Action.LEFT:
        return Direction.LEFT;
      case Action.RIGHT:
        return Direction.RIGHT;
      default:
        return null;
    }
  }

  private moveSnake(): void {
    const tail = this.snake.move();

    if (this.snake.checkSelfCollision()) {
      this.gameOver();
      return;
    }

    if (
      this.snake.head.x === this.food.position.x &&
      this.snake.head.y === this.food.position.y
    ) {
      this.snake.grow(tail);
      this.score += SCORE_PER_FOOD;
      this.scoreText.setText(`Score: ${this.score}`);
      this.food.spawn(this.snake);
      this.increaseSpeed();
    }

    this.drawSnake();
    this.drawFood();
  }

  private increaseSpeed(): void {
    this.moveInterval = Math.max(
      MIN_MOVE_INTERVAL,
      this.moveInterval - SPEED_INCREMENT
    );
  }

  private drawGrid(): void {
    this.gridGraphics.clear();

    this.gridGraphics.lineStyle(1, this.bgSkin.gridColor, this.bgSkin.gridAlpha);

    for (let x = 0; x <= this.cols; x++) {
      this.gridGraphics.lineBetween(
        x * this.cellSize,
        0,
        x * this.cellSize,
        this.rows * this.cellSize
      );
    }

    for (let y = 0; y <= this.rows; y++) {
      this.gridGraphics.lineBetween(
        0,
        y * this.cellSize,
        this.cols * this.cellSize,
        y * this.cellSize
      );
    }
  }

  private drawSnake(): void {
    this.snakeGraphics.clear();

    const padding = 1;
    const len = this.snake.segments.length;

    this.snake.segments.forEach((segment, index) => {
      const x = segment.x * this.cellSize + padding;
      const y = segment.y * this.cellSize + padding;
      const size = this.cellSize - padding * 2;

      const isHead = index === 0;
      const color = isHead ? this.snakeSkin.headColor : this.snakeSkin.bodyColor;
      const alpha = isHead ? 1.0 : 0.85 - (index / len) * 0.3;

      this.snakeGraphics.fillStyle(color, alpha);
      this.snakeGraphics.fillRoundedRect(x, y, size, size, 4);
    });
  }

  private drawFood(): void {
    this.foodGraphics.clear();

    const x = this.food.position.x * this.cellSize + this.cellSize / 2;
    const y = this.food.position.y * this.cellSize + this.cellSize / 2;
    const radius = this.cellSize / 2 - 2;

    this.foodGraphics.fillStyle(this.foodSkin.color, 1);

    if (this.foodSkin.shape === "diamond") {
      this.foodGraphics.fillPoints(
        [
          { x: x, y: y - radius },
          { x: x + radius, y: y },
          { x: x, y: y + radius },
          { x: x - radius, y: y },
        ],
        true
      );
    } else if (this.foodSkin.shape === "star") {
      this.drawStar(x, y, radius);
    } else {
      this.foodGraphics.fillCircle(x, y, radius);
    }
  }

  private drawStar(cx: number, cy: number, radius: number): void {
    const points: Phaser.Math.Vector2[] = [];
    const spikes = 5;
    const outerRadius = radius;
    const innerRadius = radius * 0.5;

    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      points.push(
        new Phaser.Math.Vector2(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r)
      );
    }

    this.foodGraphics.fillPoints(points, true);
  }

  private createGameOverUI(): void {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.gameOverBg = this.add
      .rectangle(cx, cy, width, height, 0x000000, 0.8)
      .setDepth(100);

    this.gameOverTitle = this.add
      .text(cx, cy - 40, "GAME OVER", {
        fontSize: "32px",
        color: `#${this.foodSkin.color.toString(16).padStart(6, "0")}`,
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setDepth(101);

    this.gameOverScore = this.add
      .text(cx, cy + 10, "Score: 0", {
        fontSize: "20px",
        color: "#ffffff",
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setDepth(101);

    this.gameOverRestart = this.add
      .text(cx, cy + 50, "ENTREE = Recommencer  |  ESC = Menu", {
        fontSize: "14px",
        color: "#888888",
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setDepth(101);

    this.gameOverElements = [
      this.gameOverBg,
      this.gameOverTitle,
      this.gameOverScore,
      this.gameOverRestart,
    ];
    this.hideGameOver();
  }

  private showGameOver(): void {
    this.gameOverScore.setText(`Score: ${this.score}`);
    this.gameOverElements.forEach((el) => {
      (el as Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text).setVisible(
        true
      );
    });
  }

  private hideGameOver(): void {
    this.gameOverElements.forEach((el) => {
      (
        el as Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text
      ).setVisible(false);
    });
  }

  private gameOver(): void {
    this.isGameOver = true;
    this.showGameOver();
  }

  private restart(): void {
    this.inputManager.clearQueue();
    this.snake.reset();
    this.food.spawn(this.snake);
    this.score = 0;
    this.moveInterval = INITIAL_MOVE_INTERVAL;
    this.moveAccumulator = 0;
    this.isGameOver = false;
    this.scoreText.setText("Score: 0");
    this.hideGameOver();
    this.drawSnake();
    this.drawFood();
  }

  private goBack(): void {
    this.scene.start("MenuScene");
  }
}
