// src/game/InputManager.ts

export enum Action {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  CONFIRM = "CONFIRM",
  BACK = "BACK",
  PAUSE = "PAUSE",
}

export type KeyMapping = "AZERTY" | "QWERTY";

const GAME_KEYS = [
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Enter",
  "Escape",
  "w",
  "a",
  "s",
  "d",
  "W",
  "A",
  "S",
  "D",
  "z",
  "q",
  "Z",
  "Q",
];

export class InputManager {
  private keyMapping: KeyMapping;
  private gamepadDeadzone = 0.3;
  private keysJustPressed = new Set<string>();
  private keysHeld = new Set<string>();
  private directionQueue: Action[] = [];
  private confirmPressed = false;
  private backPressed = false;
  private pausePressed = false;
  private prevGamepadButtons = new Map<number, boolean>();
  private leftStickActive = false;

  constructor(keyMapping: KeyMapping = "AZERTY") {
    this.keyMapping = keyMapping;
    this.setupListeners();
  }

  private setupListeners(): void {
    window.addEventListener("keydown", (e) => {
      if (!this.keysHeld.has(e.key)) {
        this.keysJustPressed.add(e.key);
      }
      this.keysHeld.add(e.key);
      if (GAME_KEYS.includes(e.key)) {
        e.preventDefault();
      }
    });

    window.addEventListener("keyup", (e) => {
      this.keysHeld.delete(e.key);
    });
  }

  setKeyMapping(mapping: KeyMapping): void {
    this.keyMapping = mapping;
  }

  private mapKeyToDirection(key: string): Action | null {
    if (key === "ArrowUp") return Action.UP;
    if (key === "ArrowDown") return Action.DOWN;
    if (key === "ArrowLeft") return Action.LEFT;
    if (key === "ArrowRight") return Action.RIGHT;

    const k = key.toLowerCase();

    if (this.keyMapping === "AZERTY") {
      if (k === "z") return Action.UP;
      if (k === "s") return Action.DOWN;
      if (k === "q") return Action.LEFT;
      if (k === "d") return Action.RIGHT;
    } else {
      if (k === "w") return Action.UP;
      if (k === "s") return Action.DOWN;
      if (k === "a") return Action.LEFT;
      if (k === "d") return Action.RIGHT;
    }

    return null;
  }

  update(): void {
    for (const key of this.keysJustPressed) {
      const direction = this.mapKeyToDirection(key);
      if (direction) {
        this.directionQueue.push(direction);
        if (this.directionQueue.length > 3) {
          this.directionQueue.shift();
        }
      }
      if (key === "Enter") this.confirmPressed = true;
      if (key === "Escape") this.backPressed = true;
    }
    this.keysJustPressed.clear();

    this.pollGamepad();
  }

  private pollGamepad(): void {
    const gamepads = navigator.getGamepads();

    for (const gamepad of gamepads) {
      if (!gamepad) continue;

      const wasPressed = (index: number): boolean =>
        this.prevGamepadButtons.get(index) ?? false;
      const isPressed = (index: number): boolean =>
        gamepad.buttons[index]?.pressed ?? false;

      if (isPressed(12) && !wasPressed(12))
        this.directionQueue.push(Action.UP);
      if (isPressed(13) && !wasPressed(13))
        this.directionQueue.push(Action.DOWN);
      if (isPressed(14) && !wasPressed(14))
        this.directionQueue.push(Action.LEFT);
      if (isPressed(15) && !wasPressed(15))
        this.directionQueue.push(Action.RIGHT);

      if (isPressed(0) && !wasPressed(0)) this.confirmPressed = true;
      if (isPressed(1) && !wasPressed(1)) this.backPressed = true;

      const lx = gamepad.axes[0] ?? 0;
      const ly = gamepad.axes[1] ?? 0;
      const inDeadzone =
        Math.abs(lx) <= this.gamepadDeadzone &&
        Math.abs(ly) <= this.gamepadDeadzone;

      if (!inDeadzone && !this.leftStickActive) {
        if (Math.abs(lx) > Math.abs(ly)) {
          this.directionQueue.push(lx > 0 ? Action.RIGHT : Action.LEFT);
        } else {
          this.directionQueue.push(ly > 0 ? Action.DOWN : Action.UP);
        }
        this.leftStickActive = true;
      } else if (inDeadzone) {
        this.leftStickActive = false;
      }

      if (this.directionQueue.length > 3) {
        this.directionQueue.splice(0, this.directionQueue.length - 3);
      }

      for (let i = 0; i < gamepad.buttons.length; i++) {
        this.prevGamepadButtons.set(i, gamepad.buttons[i].pressed);
      }
    }
  }

  consumeDirection(): Action | null {
    return this.directionQueue.shift() ?? null;
  }

  consumeConfirm(): boolean {
    const pressed = this.confirmPressed;
    this.confirmPressed = false;
    return pressed;
  }

  consumeBack(): boolean {
    const pressed = this.backPressed;
    this.backPressed = false;
    return pressed;
  }

  consumePause(): boolean {
    const pressed = this.pausePressed;
    this.pausePressed = false;
    return pressed;
  }

  clearQueue(): void {
    this.directionQueue = [];
    this.confirmPressed = false;
    this.backPressed = false;
    this.pausePressed = false;
  }
}
