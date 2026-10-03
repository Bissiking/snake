// src/game/Skins.ts

export interface SnakeSkin {
  id: string;
  name: string;
  headColor: number;
  bodyColor: number;
  glowColor: number;
}

export interface FoodSkin {
  id: string;
  name: string;
  color: number;
  glowColor: number;
  shape: "circle" | "diamond" | "star";
}

export interface BackgroundSkin {
  id: string;
  name: string;
  backgroundColor: number;
  gridColor: number;
  gridAlpha: number;
}

export const SNAKE_SKINS: SnakeSkin[] = [
  {
    id: "neon",
    name: "Neon",
    headColor: 0x00ffaa,
    bodyColor: 0x00ff88,
    glowColor: 0x00ffaa,
  },
  {
    id: "cyber",
    name: "Cyber",
    headColor: 0x00ccff,
    bodyColor: 0x0099ff,
    glowColor: 0x00ccff,
  },
  {
    id: "hot",
    name: "Flamme",
    headColor: 0xff4466,
    bodyColor: 0xff2244,
    glowColor: 0xff4466,
  },
  {
    id: "gold",
    name: "Or",
    headColor: 0xffd700,
    bodyColor: 0xffaa00,
    glowColor: 0xffd700,
  },
  {
    id: "ghost",
    name: "Fantome",
    headColor: 0xeeeeff,
    bodyColor: 0xccccdd,
    glowColor: 0xaaaacc,
  },
  {
    id: "void",
    name: " Vide",
    headColor: 0x8844ff,
    bodyColor: 0x6622cc,
    glowColor: 0x8844ff,
  },
];

export const FOOD_SKINS: FoodSkin[] = [
  {
    id: "berry",
    name: "Baie",
    color: 0xff3366,
    glowColor: 0xff3366,
    shape: "circle",
  },
  {
    id: "neon",
    name: "Neon",
    color: 0x00ffcc,
    glowColor: 0x00ffcc,
    shape: "circle",
  },
  {
    id: "gold",
    name: "Or",
    color: 0xffd700,
    glowColor: 0xffd700,
    shape: "diamond",
  },
  {
    id: "plasma",
    name: "Plasma",
    color: 0xaa44ff,
    glowColor: 0xaa44ff,
    shape: "circle",
  },
  {
    id: "star",
    name: "Etoile",
    color: 0xff8800,
    glowColor: 0xff8800,
    shape: "star",
  },
];

export const BACKGROUND_SKINS: BackgroundSkin[] = [
  {
    id: "dark",
    name: "Sombre",
    backgroundColor: 0x0a0a0f,
    gridColor: 0x1a1a2e,
    gridAlpha: 0.3,
  },
  {
    id: "midnight",
    name: "Minuit",
    backgroundColor: 0x050510,
    gridColor: 0x151530,
    gridAlpha: 0.4,
  },
  {
    id: "ocean",
    name: "Ocean",
    backgroundColor: 0x0a1520,
    gridColor: 0x1a2a3e,
    gridAlpha: 0.35,
  },
  {
    id: "void",
    name: " Vide",
    backgroundColor: 0x000000,
    gridColor: 0x111111,
    gridAlpha: 0.25,
  },
];

export interface GameConfig {
  snakeSkin: SnakeSkin;
  foodSkin: FoodSkin;
  backgroundSkin: BackgroundSkin;
  keyMapping: "AZERTY" | "QWERTY";
}

export const DEFAULT_CONFIG: GameConfig = {
  snakeSkin: SNAKE_SKINS[0],
  foodSkin: FOOD_SKINS[0],
  backgroundSkin: BACKGROUND_SKINS[0],
  keyMapping: "AZERTY",
};

let currentConfig: GameConfig = { ...DEFAULT_CONFIG };

export function getConfig(): GameConfig {
  return currentConfig;
}

export function setConfig(config: Partial<GameConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}
