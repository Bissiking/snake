// src/game/SettingsScene.ts

import Phaser from "phaser";
import { InputManager, Action } from "./InputManager";
import {
  SNAKE_SKINS,
  FOOD_SKINS,
  BACKGROUND_SKINS,
  getConfig,
  setConfig,
} from "./Skins";

interface SkinCard {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Rectangle;
  swatch: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  check: Phaser.GameObjects.Text;
  hitZone: Phaser.GameObjects.Zone;
}

export class SettingsScene extends Phaser.Scene {
  private inputManager!: InputManager;
  private selectedIndex = 0;
  private totalSelectable = 0;

  private snakeCards: SkinCard[] = [];
  private foodCards: SkinCard[] = [];
  private bgCards: SkinCard[] = [];

  private keyValue!: Phaser.GameObjects.Text;

  private previewSnake!: Phaser.GameObjects.Graphics;
  private previewFood!: Phaser.GameObjects.Graphics;
  private previewGrid!: Phaser.GameObjects.Graphics;

  private allHitZones: Phaser.GameObjects.Zone[] = [];

  constructor() {
    super("SettingsScene");
  }

  create(): void {
    this.inputManager = new InputManager("AZERTY");
    this.selectedIndex = 0;
    this.snakeCards = [];
    this.foodCards = [];
    this.bgCards = [];
    this.allHitZones = [];

    this.cameras.main.setBackgroundColor(0x050508);

    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const isWide = width > 700;

    this.add
      .text(cx, 36, "PARAMETRES", {
        fontSize: "28px",
        color: "#ffffff",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.add
      .text(cx, 64, "choisissez votre style", {
        fontSize: "13px",
        color: "#445566",
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setDepth(10);

    const lineG = this.add.graphics().setDepth(10);
    lineG.lineStyle(1, 0x00ffaa, 0.2);
    lineG.lineBetween(cx - 120, 82, cx + 120, 82);

    this.previewSnake = this.add.graphics().setDepth(10);
    this.previewFood = this.add.graphics().setDepth(10);
    this.previewGrid = this.add.graphics().setDepth(5);

    const leftX = isWide ? cx - 180 : cx;
    const rightX = isWide ? cx + 180 : cx;
    const startY = isWide ? 100 : 100;

    if (isWide) {
      this.drawPreviewPanel(leftX, startY);
      this.buildSnakeSection(rightX, startY);
      this.buildFoodSection(rightX, startY + 140);
      this.buildBgSection(rightX, startY + 250);
      this.buildKeySection(rightX, startY + 360);
    } else {
      this.buildSnakeSection(cx, startY);
      this.buildFoodSection(cx, startY + 140);
      this.buildBgSection(cx, startY + 250);
      this.buildKeySection(cx, startY + 360);
    }

    this.totalSelectable =
      SNAKE_SKINS.length +
      FOOD_SKINS.length +
      BACKGROUND_SKINS.length +
      1;

    this.buildBackButton(cx, Math.min(startY + 440, height - 50));
    this.updateAllVisuals();
    this.updateSelection();

    this.scale.on("resize", () => this.handleResize());
  }

  private drawPreviewPanel(x: number, y: number): void {
    const panelW = 280;
    const panelH = 300;

    const panelBg = this.add
      .rectangle(x, y + panelH / 2, panelW, panelH, 0x0a0a12, 0.8)
      .setStrokeStyle(1, 0x1a2a3e, 0.5)
      .setDepth(6);

    this.add
      .text(x, y + 14, "APERCU", {
        fontSize: "11px",
        color: "#334455",
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.drawPreviewGrid(x, y + 30, panelW - 20, panelH - 50);
    this.drawPreviewSnake(x, y + 30, panelW - 20, panelH - 50);
    this.drawPreviewFood(x, y + 30, panelW - 20, panelH - 50);

    void panelBg;
  }

  private drawPreviewGrid(x: number, y: number, w: number, h: number): void {
    this.previewGrid.clear();
    const config = getConfig();
    const cellSize = 20;
    const ox = x - w / 2;
    const oy = y;

    this.previewGrid.fillStyle(config.backgroundSkin.backgroundColor, 1);
    this.previewGrid.fillRect(ox, oy, w, h);

    this.previewGrid.lineStyle(
      1,
      config.backgroundSkin.gridColor,
      config.backgroundSkin.gridAlpha
    );

    const cols = Math.ceil(w / cellSize);
    const rows = Math.ceil(h / cellSize);

    for (let i = 0; i <= cols; i++) {
      this.previewGrid.lineBetween(
        ox + i * cellSize,
        oy,
        ox + i * cellSize,
        oy + rows * cellSize
      );
    }
    for (let i = 0; i <= rows; i++) {
      this.previewGrid.lineBetween(
        ox,
        oy + i * cellSize,
        ox + cols * cellSize,
        oy + i * cellSize
      );
    }
  }

  private drawPreviewSnake(
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    this.previewSnake.clear();
    const config = getConfig();
    const cellSize = 20;
    const ox = x - w / 2;
    const oy = y;

    const snakeX = Math.floor(w / 2 / cellSize);
    const snakeY = Math.floor(h / 2 / cellSize);

    const segments = [
      { x: snakeX, y: snakeY },
      { x: snakeX - 1, y: snakeY },
      { x: snakeX - 2, y: snakeY },
      { x: snakeX - 3, y: snakeY },
    ];

    segments.forEach((seg, i) => {
      const color = i === 0 ? config.snakeSkin.headColor : config.snakeSkin.bodyColor;
      const alpha = 1.0 - i * 0.15;
      this.previewSnake.fillStyle(color, alpha);
      this.previewSnake.fillRoundedRect(
        ox + seg.x * cellSize + 2,
        oy + seg.y * cellSize + 2,
        cellSize - 4,
        cellSize - 4,
        3
      );
    });
  }

  private drawPreviewFood(
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    this.previewFood.clear();
    const config = getConfig();
    const cellSize = 20;
    const ox = x - w / 2;
    const oy = y;

    const foodX = Math.floor(w / 2 / cellSize) + 4;
    const foodY = Math.floor(h / 2 / cellSize) - 1;
    const fx = ox + foodX * cellSize + cellSize / 2;
    const fy = oy + foodY * cellSize + cellSize / 2;
    const r = cellSize / 2 - 3;

    this.previewFood.fillStyle(config.foodSkin.color, 1);

    if (config.foodSkin.shape === "diamond") {
      this.previewFood.fillPoints(
        [
          { x: fx, y: fy - r },
          { x: fx + r, y: fy },
          { x: fx, y: fy + r },
          { x: fx - r, y: fy },
        ],
        true
      );
    } else if (config.foodSkin.shape === "star") {
      const pts: Phaser.Math.Vector2[] = [];
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 === 0 ? r : r * 0.5;
        const ang = (i * Math.PI) / 5 - Math.PI / 2;
        pts.push(
          new Phaser.Math.Vector2(
            fx + Math.cos(ang) * rad,
            fy + Math.sin(ang) * rad
          )
        );
      }
      this.previewFood.fillPoints(pts, true);
    } else {
      this.previewFood.fillCircle(fx, fy, r);
    }
  }

  private buildSnakeSection(x: number, y: number): void {
    this.add
      .text(x - 140, y, "SERPENT", {
        fontSize: "11px",
        color: "#00ffaa",
        fontFamily: "monospace",
      })
      .setDepth(10);

    const cardW = 80;
    const cardH = 44;
    const gap = 8;
    const startX = x - 140;
    const rowY = y + 24;

    SNAKE_SKINS.forEach((skin, i) => {
      const cardX = startX + i * (cardW + gap);
      this.createSkinCard(
        cardX,
        rowY,
        cardW,
        cardH,
        skin.headColor,
        skin.name,
        i,
        "snake"
      );
    });
  }

  private buildFoodSection(x: number, y: number): void {
    this.add
      .text(x - 140, y, "NOURRITURE", {
        fontSize: "11px",
        color: "#00ffaa",
        fontFamily: "monospace",
      })
      .setDepth(10);

    const cardW = 80;
    const cardH = 44;
    const gap = 8;
    const startX = x - 140;
    const rowY = y + 24;

    FOOD_SKINS.forEach((skin, i) => {
      const cardX = startX + i * (cardW + gap);
      this.createSkinCard(
        cardX,
        rowY,
        cardW,
        cardH,
        skin.color,
        skin.name,
        i + SNAKE_SKINS.length,
        "food"
      );
    });
  }

  private buildBgSection(x: number, y: number): void {
    this.add
      .text(x - 140, y, "FOND", {
        fontSize: "11px",
        color: "#00ffaa",
        fontFamily: "monospace",
      })
      .setDepth(10);

    const cardW = 80;
    const cardH = 44;
    const gap = 8;
    const startX = x - 140;
    const rowY = y + 24;

    BACKGROUND_SKINS.forEach((skin, i) => {
      const cardX = startX + i * (cardW + gap);
      this.createSkinCard(
        cardX,
        rowY,
        cardW,
        cardH,
        skin.backgroundColor,
        skin.name,
        i + SNAKE_SKINS.length + FOOD_SKINS.length,
        "bg"
      );
    });
  }

  private buildKeySection(x: number, y: number): void {
    this.add
      .text(x - 140, y, "CLAVIER", {
        fontSize: "11px",
        color: "#00ffaa",
        fontFamily: "monospace",
      })
      .setDepth(10);

    const rowY = y + 24;
    const config = getConfig();

    const bg = this.add
      .rectangle(x - 100, rowY + 20, 280, 44, 0x0d0d15, 0.9)
      .setStrokeStyle(1, 0x1a2a3e, 0.4)
      .setDepth(8);

    this.add
      .text(x - 130, rowY + 20, "Disposition", {
        fontSize: "14px",
        color: "#667788",
        fontFamily: "monospace",
      })
      .setOrigin(0, 0.5)
      .setDepth(10);

    this.keyValue = this.add
      .text(x + 130, rowY + 20, config.keyMapping, {
        fontSize: "14px",
        color: "#00ffaa",
        fontFamily: "monospace",
      })
      .setOrigin(1, 0.5)
      .setDepth(10);

    const leftArrow = this.add
      .text(x + 20, rowY + 20, "‹", {
        fontSize: "20px",
        color: "#556677",
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(12);

    const rightArrow = this.add
      .text(x + 100, rowY + 20, "›", {
        fontSize: "20px",
        color: "#556677",
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(12);

    leftArrow.on("pointerover", () => leftArrow.setColor("#ffffff"));
    leftArrow.on("pointerout", () => leftArrow.setColor("#556677"));
    leftArrow.on("pointerdown", () => {
      const newMapping =
        getConfig().keyMapping === "AZERTY" ? "QWERTY" : "AZERTY";
      setConfig({ keyMapping: newMapping });
      this.updateAllVisuals();
    });

    rightArrow.on("pointerover", () => rightArrow.setColor("#ffffff"));
    rightArrow.on("pointerout", () => rightArrow.setColor("#556677"));
    rightArrow.on("pointerdown", () => {
      const newMapping =
        getConfig().keyMapping === "AZERTY" ? "QWERTY" : "AZERTY";
      setConfig({ keyMapping: newMapping });
      this.updateAllVisuals();
    });

    const hitZone = this.add
      .zone(x - 10, rowY + 20, 280, 44)
      .setInteractive({ useHandCursor: true })
      .setDepth(13);

    hitZone.on("pointerover", () => {
      bg.setStrokeStyle(1, 0x00ffaa, 0.6);
      const idx =
        SNAKE_SKINS.length + FOOD_SKINS.length + BACKGROUND_SKINS.length;
      this.selectedIndex = idx;
      this.updateSelection();
    });
    hitZone.on("pointerout", () => bg.setStrokeStyle(1, 0x1a2a3e, 0.4));

    this.allHitZones.push(hitZone);

    void bg;
  }

  private createSkinCard(
    x: number,
    y: number,
    w: number,
    h: number,
    color: number,
    name: string,
    globalIndex: number,
    _type: "snake" | "food" | "bg"
  ): void {
    const config = getConfig();
    let isSelected = false;

    if (_type === "snake") {
      isSelected =
        SNAKE_SKINS[globalIndex]?.id === config.snakeSkin.id;
    } else if (_type === "food") {
      const foodIdx = globalIndex - SNAKE_SKINS.length;
      isSelected = FOOD_SKINS[foodIdx]?.id === config.foodSkin.id;
    } else {
      const bgIdx =
        globalIndex - SNAKE_SKINS.length - FOOD_SKINS.length;
      isSelected = BACKGROUND_SKINS[bgIdx]?.id === config.backgroundSkin.id;
    }

    const cardBg = this.add
      .rectangle(x + w / 2, y + h / 2, w, h, isSelected ? 0x112233 : 0x0d0d15, 0.9)
      .setStrokeStyle(1, isSelected ? 0x00ffaa : 0x1a2a3e, isSelected ? 0.8 : 0.4)
      .setDepth(8);

    const swatchSize = 16;
    const swatch = this.add
      .rectangle(x + w / 2, y + h / 2 - 6, swatchSize, swatchSize, color, 1)
      .setDepth(10);

    const label = this.add
      .text(x + w / 2, y + h / 2 + 14, name, {
        fontSize: "10px",
        color: isSelected ? "#ffffff" : "#556677",
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setDepth(10);

    const check = this.add
      .text(x + w - 6, y + 4, "✓", {
        fontSize: "10px",
        color: "#00ffaa",
        fontFamily: "monospace",
      })
      .setOrigin(1, 0)
      .setAlpha(isSelected ? 1 : 0)
      .setDepth(11);

    const hitZone = this.add
      .zone(x + w / 2, y + h / 2, w, h)
      .setInteractive({ useHandCursor: true })
      .setDepth(13);

    hitZone.on("pointerover", () => {
      if (!isSelected) {
        cardBg.setStrokeStyle(1, 0x00ffaa, 0.5);
        label.setColor("#aabbcc");
      }
    });

    hitZone.on("pointerout", () => {
      if (!isSelected) {
        cardBg.setStrokeStyle(1, 0x1a2a3e, 0.4);
        label.setColor("#556677");
      }
    });

    hitZone.on("pointerdown", () => {
      this.selectedIndex = globalIndex;
      this.applySelection();
      this.updateAllVisuals();
      this.updateSelection();
    });

    this.allHitZones.push(hitZone);

    const card: SkinCard = {
      container: this.add.container(0, 0),
      bg: cardBg,
      swatch,
      label,
      check,
      hitZone,
    };

    void card;

    if (_type === "snake") {
      this.snakeCards.push(card as SkinCard);
    } else if (_type === "food") {
      this.foodCards.push(card as SkinCard);
    } else {
      this.bgCards.push(card as SkinCard);
    }
  }

  private applySelection(): void {
    const snakeLen = SNAKE_SKINS.length;
    const foodLen = FOOD_SKINS.length;
    const bgLen = BACKGROUND_SKINS.length;

    if (this.selectedIndex < snakeLen) {
      setConfig({ snakeSkin: SNAKE_SKINS[this.selectedIndex] });
    } else if (this.selectedIndex < snakeLen + foodLen) {
      const foodIdx = this.selectedIndex - snakeLen;
      setConfig({ foodSkin: FOOD_SKINS[foodIdx] });
    } else if (this.selectedIndex < snakeLen + foodLen + bgLen) {
      const bgIdx = this.selectedIndex - snakeLen - foodLen;
      setConfig({ backgroundSkin: BACKGROUND_SKINS[bgIdx] });
      this.cameras.main.setBackgroundColor(
        BACKGROUND_SKINS[bgIdx].backgroundColor
      );
    } else {
      const newMapping =
        getConfig().keyMapping === "AZERTY" ? "QWERTY" : "AZERTY";
      setConfig({ keyMapping: newMapping });
    }
  }

  private buildBackButton(x: number, y: number): void {
    const backText = this.add
      .text(x, y, "← RETOUR", {
        fontSize: "16px",
        color: "#556677",
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);

    const backGlow = this.add
      .text(x, y, "← RETOUR", {
        fontSize: "16px",
        color: "#00ffaa",
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(9);

    backText.on("pointerover", () => {
      backText.setColor("#ffffff");
      backGlow.setAlpha(0.4);
    });
    backText.on("pointerout", () => {
      backText.setColor("#556677");
      backGlow.setAlpha(0);
    });
    backText.on("pointerdown", () => this.scene.start("MenuScene"));

    const hitZone = this.add
      .zone(x, y, 160, 36)
      .setInteractive({ useHandCursor: true })
      .setDepth(13);

    hitZone.on("pointerdown", () => this.scene.start("MenuScene"));

    this.allHitZones.push(hitZone);
  }

  private updateAllVisuals(): void {
    const config = getConfig();

    this.snakeCards.forEach((card, i) => {
      const skin = SNAKE_SKINS[i];
      const sel = skin.id === config.snakeSkin.id;
      card.bg.fillColor = sel ? 0x112233 : 0x0d0d15;
      card.bg.strokeColor = sel ? 0x00ffaa : 0x1a2a3e;
      card.bg.strokeAlpha = sel ? 0.8 : 0.4;
      card.swatch.fillColor = skin.headColor;
      card.label.setColor(sel ? "#ffffff" : "#556677");
      card.check.setAlpha(sel ? 1 : 0);
    });

    this.foodCards.forEach((card, i) => {
      const skin = FOOD_SKINS[i];
      const sel = skin.id === config.foodSkin.id;
      card.bg.fillColor = sel ? 0x112233 : 0x0d0d15;
      card.bg.strokeColor = sel ? 0x00ffaa : 0x1a2a3e;
      card.bg.strokeAlpha = sel ? 0.8 : 0.4;
      card.swatch.fillColor = skin.color;
      card.label.setColor(sel ? "#ffffff" : "#556677");
      card.check.setAlpha(sel ? 1 : 0);
    });

    this.bgCards.forEach((card, i) => {
      const skin = BACKGROUND_SKINS[i];
      const sel = skin.id === config.backgroundSkin.id;
      card.bg.fillColor = sel ? 0x112233 : 0x0d0d15;
      card.bg.strokeColor = sel ? 0x00ffaa : 0x1a2a3e;
      card.bg.strokeAlpha = sel ? 0.8 : 0.4;
      card.swatch.fillColor = skin.backgroundColor;
      card.label.setColor(sel ? "#ffffff" : "#556677");
      card.check.setAlpha(sel ? 1 : 0);
    });

    if (this.keyValue) {
      this.keyValue.setText(config.keyMapping);
    }

    const { width } = this.cameras.main;
    const cx = width / 2;
    const isWide = width > 700;
    const leftX = isWide ? cx - 180 : cx;

    this.drawPreviewGrid(leftX, 130, 260, 260);
    this.drawPreviewSnake(leftX, 130, 260, 260);
    this.drawPreviewFood(leftX, 130, 260, 260);
  }

  private updateSelection(): void {
    const snakeLen = SNAKE_SKINS.length;

    this.snakeCards.forEach((card, i) => {
      const isHl = i === this.selectedIndex;
      card.label.setColor(isHl ? "#00ffaa" : card.bg.strokeColor === 0x00ffaa ? "#ffffff" : "#556677");
    });

    this.foodCards.forEach((card, i) => {
      const idx = i + snakeLen;
      const isHl = idx === this.selectedIndex;
      card.label.setColor(isHl ? "#00ffaa" : card.bg.strokeColor === 0x00ffaa ? "#ffffff" : "#556677");
    });

    this.bgCards.forEach((card, i) => {
      const idx = i + snakeLen + FOOD_SKINS.length;
      const isHl = idx === this.selectedIndex;
      card.label.setColor(isHl ? "#00ffaa" : card.bg.strokeColor === 0x00ffaa ? "#ffffff" : "#556677");
    });
  }

  update(): void {
    this.inputManager.update();

    if (this.inputManager.consumeDirection() === Action.UP) {
      this.selectedIndex =
        (this.selectedIndex - 1 + this.totalSelectable) % this.totalSelectable;
      this.updateSelection();
    }

    if (this.inputManager.consumeDirection() === Action.DOWN) {
      this.selectedIndex =
        (this.selectedIndex + 1) % this.totalSelectable;
      this.updateSelection();
    }

    if (this.inputManager.consumeDirection() === Action.LEFT) {
      this.applySelection();
      this.updateAllVisuals();
      this.updateSelection();
    }

    if (this.inputManager.consumeDirection() === Action.RIGHT) {
      this.applySelection();
      this.updateAllVisuals();
      this.updateSelection();
    }

    if (this.inputManager.consumeConfirm()) {
      this.applySelection();
      this.updateAllVisuals();
      this.updateSelection();
    }

    if (this.inputManager.consumeBack()) {
      this.scene.start("MenuScene");
    }
  }

  private handleResize(): void {
    if (!this.cameras.main) return;
    this.scene.restart();
  }
}
