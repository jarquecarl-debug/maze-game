import { create } from "zustand";
import { generateCollectibles, generateObstacles, type CollectibleData, type ObstacleData } from "./mazeData";

export type GameState = "menu" | "playing" | "paused" | "won" | "lost";

interface GameStore {
  gameState: GameState;
  score: number;
  health: number;
  collectibles: CollectibleData[];
  obstacles: ObstacleData[];
  collectedIds: Set<string>;
  timeElapsed: number;
  level: number;

  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  collectItem: (id: string, points: number) => void;
  takeDamage: (amount: number) => void;
  winGame: () => void;
  updateTime: (delta: number) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: "menu",
  score: 0,
  health: 100,
  collectibles: [],
  obstacles: [],
  collectedIds: new Set(),
  timeElapsed: 0,
  level: 1,

  startGame: () => {
    set({
      gameState: "playing",
      score: 0,
      health: 100,
      collectibles: generateCollectibles(),
      obstacles: generateObstacles(),
      collectedIds: new Set(),
      timeElapsed: 0,
    });
  },

  pauseGame: () => {
    if (get().gameState === "playing") {
      set({ gameState: "paused" });
    }
  },

  resumeGame: () => {
    if (get().gameState === "paused") {
      set({ gameState: "playing" });
    }
  },

  resetGame: () => {
    set({
      gameState: "menu",
      score: 0,
      health: 100,
      collectibles: [],
      obstacles: [],
      collectedIds: new Set(),
      timeElapsed: 0,
    });
  },

  collectItem: (id: string, points: number) => {
    const { collectedIds, score } = get();
    if (collectedIds.has(id)) return;
    const newCollected = new Set(collectedIds);
    newCollected.add(id);
    set({
      collectedIds: newCollected,
      score: score + points,
    });
  },

  takeDamage: (amount: number) => {
    const { health } = get();
    const newHealth = Math.max(0, health - amount);
    if (newHealth <= 0) {
      set({ health: 0, gameState: "lost" });
    } else {
      set({ health: newHealth });
    }
  },

  winGame: () => {
    set({ gameState: "won" });
  },

  updateTime: (delta: number) => {
    if (get().gameState === "playing") {
      set({ timeElapsed: get().timeElapsed + delta });
    }
  },
}));
