// src/main.ts

import Phaser from "phaser";
import { MenuScene } from "./game/MenuScene";
import { SettingsScene } from "./game/SettingsScene";
import { GameScene } from "./game/GameScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#050508",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: "100%",
    height: "100%",
  },
  scene: [MenuScene, SettingsScene, GameScene],
};

new Phaser.Game(config);
