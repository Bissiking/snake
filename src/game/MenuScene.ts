// src/game/MenuScene.ts

import Phaser from "phaser";
import { InputManager, Action } from "./InputManager";

interface MenuItem {
  label: string;
  action: () => void;
  text: Phaser.GameObjects.Text;
  glow: Phaser.GameObjects.Text;
  hitZone: Phaser.GameObjects.Zone;
}

export class MenuScene extends Phaser.Scene {
  private inputManager!: InputManager;
  private menuItems: MenuItem[] = [];
  private selectedIndex = 0;
  private titleGlow!: Phaser.GameObjects.Text;
  private particles: {
    x: number;
    y: number;
    speed: number;
    alpha: number;
    size: number;
  }[] = [];
  private particleGraphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super("MenuScene");
  }

  create(): void {
    this.inputManager = new InputManager("AZERTY");
    this.menuItems = [];
    this.selectedIndex = 0;

    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    this.cameras.main.setBackgroundColor(0x050508);

    this.particleGraphics = this.add.graphics().setDepth(0);

    for (let i = 0; i < 60; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.2 + Math.random() * 0.5,
        alpha: 0.1 + Math.random() * 0.3,
        size: 1 + Math.random() * 2,
      });
    }

    this.add
      .text(cx, cy - 140, "LUMA", {
        fontSize: "72px",
        color: "#ffffff",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.titleGlow = this.add
      .text(cx, cy - 140, "LUMA", {
        fontSize: "72px",
        color: "#00ffaa",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0.3)
      .setDepth(9);

    this.add
      .text(cx, cy - 80, "S N A K E", {
        fontSize: "20px",
        color: "#00ffaa",
        fontFamily: "monospace",
        letterSpacing: 12,
      })
      .setOrigin(0.5)
      .setDepth(10);

    const line = this.add.graphics().setDepth(10);
    line.lineStyle(1, 0x00ffaa, 0.3);
    line.lineBetween(cx - 80, cy - 50, cx + 80, cy - 50);

    this.createMenuItem(cx, cy + 10, "JOUER", () => {
      this.scene.start("GameScene");
    });

    this.createMenuItem(cx, cy + 70, "PARAMETRES", () => {
      this.scene.start("SettingsScene");
    });

    this.add
      .text(cx, height - 40, "Flèches / ZQSD / WASD / Manette / Souris", {
        fontSize: "12px",
        color: "#444455",
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.updateSelection();

    this.scale.on("resize", () => {
      this.handleResize();
    });
  }

  private createMenuItem(
    x: number,
    y: number,
    label: string,
    action: () => void
  ): void {
    const glow = this.add
      .text(x, y, label, {
        fontSize: "28px",
        color: "#00ffaa",
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(11);

    const text = this.add
      .text(x, y, label, {
        fontSize: "28px",
        color: "#555566",
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(12);

    const hitZone = this.add
      .zone(x, y, 200, 50)
      .setInteractive({ useHandCursor: true })
      .setDepth(13);

    hitZone.on("pointerover", () => {
      const index = this.menuItems.findIndex((item) => item.hitZone === hitZone);
      if (index !== -1) {
        this.selectedIndex = index;
        this.updateSelection();
      }
    });

    hitZone.on("pointerdown", () => {
      action();
    });

    this.menuItems.push({ label, action, text, glow, hitZone });
  }

  private updateSelection(): void {
    this.menuItems.forEach((item, index) => {
      const isSelected = index === this.selectedIndex;
      item.text.setColor(isSelected ? "#ffffff" : "#555566");
      item.glow.setAlpha(isSelected ? 0.4 : 0);
    });
  }

  update(): void {
    this.inputManager.update();

    const time = this.time.now;

    this.particleGraphics.clear();
    this.particles.forEach((p) => {
      p.y -= p.speed;
      const h = this.cameras.main?.height ?? 800;
      const w = this.cameras.main?.width ?? 600;
      if (p.y < -10) {
        p.y = h + 10;
        p.x = Math.random() * w;
      }
      this.particleGraphics.fillStyle(
        0x00ffaa,
        p.alpha * (0.5 + 0.5 * Math.sin(time * 0.002 + p.x))
      );
      this.particleGraphics.fillCircle(p.x, p.y, p.size);
    });

    const glowIntensity = 0.25 + 0.15 * Math.sin(time * 0.003);
    this.titleGlow.setAlpha(glowIntensity);

    if (this.inputManager.consumeDirection() === Action.UP) {
      this.selectedIndex =
        (this.selectedIndex - 1 + this.menuItems.length) %
        this.menuItems.length;
      this.updateSelection();
    }

    if (this.inputManager.consumeDirection() === Action.DOWN) {
      this.selectedIndex =
        (this.selectedIndex + 1) % this.menuItems.length;
      this.updateSelection();
    }

    if (this.inputManager.consumeConfirm()) {
      this.menuItems[this.selectedIndex].action();
    }
  }

  private handleResize(): void {
    if (!this.cameras.main) return;

    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    this.titleGlow.setPosition(cx, cy - 140);

    this.menuItems.forEach((item) => {
      const idx = this.menuItems.indexOf(item);
      const newY = cy + 10 + idx * 60;
      item.text.setPosition(cx, newY);
      item.glow.setPosition(cx, newY);
      item.hitZone.setPosition(cx, newY);
    });

    this.children.list.forEach((child) => {
      if (child === this.particleGraphics) return;
      if (child === this.titleGlow) return;
      if (
        this.menuItems.some(
          (item) =>
            item.text === child ||
            item.glow === child ||
            item.hitZone === child
        )
      )
        return;
      if (child instanceof Phaser.GameObjects.Text) {
        const t = child as Phaser.GameObjects.Text;
        if (t.text === "LUMA") {
          t.setPosition(cx, cy - 140);
        } else if (t.text === "S N A K E") {
          t.setPosition(cx, cy - 80);
        } else if (t.text.includes("Flèches")) {
          t.setPosition(cx, height - 40);
        }
      }
    });

    this.particles.forEach((p) => {
      p.x = Math.random() * width;
      p.y = Math.random() * height;
    });
  }
}
