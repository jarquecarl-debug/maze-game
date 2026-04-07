import { create } from "zustand";
import {
  regenerateMaze,
  generateCollectibles,
  generateObstacles,
  type CollectibleData,
  type ObstacleData,
} from "./mazeData";

export type GameState = "menu" | "playing" | "won" | "lost" | "highscores";

export interface HighScore {
  score: number;
  level: number;
  time: number;
  won: boolean;
  date: string;
}

export interface Notification {
  id: number;
  text: string;
  color: string;
}

function loadHighScores(): HighScore[] {
  try { return JSON.parse(localStorage.getItem("mazeHighScores") || "[]"); }
  catch { return []; }
}

function saveHighScoresToStorage(scores: HighScore[]) {
  try { localStorage.setItem("mazeHighScores", JSON.stringify(scores.slice(0, 10))); }
  catch { /* ignore */ }
}

interface GameStore {
  gameState: GameState;
  level: number;
  score: number;
  health: number;
  hasKey: boolean;
  collectibles: CollectibleData[];
  obstacles: ObstacleData[];
  collectedIds: Set<string>;
  timeElapsed: number;
  lastDamageTime: number;
  notifications: Notification[];
  highScores: HighScore[];
  mazeVersion: number;

  startGame: () => void;
  resetGame: () => void;
  nextLevel: () => void;
  collectItem: (id: string, points: number) => void;
  collectKey: () => void;
  takeDamage: (amount: number) => void;
  winGame: () => void;
  loseGame: () => void;
  updateTime: (delta: number) => void;
  addNotification: (text: string, color: string) => void;
  saveHighScore: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: "menu",
  level: 1,
  score: 0,
  health: 100,
  hasKey: false,
  collectibles: [],
  obstacles: [],
  collectedIds: new Set(),
  timeElapsed: 0,
  lastDamageTime: 0,
  notifications: [],
  highScores: loadHighScores(),
  mazeVersion: 0,

  startGame: () => {
    regenerateMaze(1);
    set({
      gameState: "playing",
      level: 1,
      score: 0,
      health: 100,
      hasKey: false,
      collectibles: generateCollectibles(1),
      obstacles: generateObstacles(1),
      collectedIds: new Set(),
      timeElapsed: 0,
      lastDamageTime: 0,
      notifications: [],
      mazeVersion: get().mazeVersion + 1,
    });
  },

  resetGame: () => set({ gameState: "menu", notifications: [] }),

  nextLevel: () => {
    const { level, score } = get();
    const next = level + 1;
    regenerateMaze(next);
    set({
      gameState: "playing",
      level: next,
      score: score + level * 500,
      health: 100,
      hasKey: false,
      collectibles: generateCollectibles(next),
      obstacles: generateObstacles(next),
      collectedIds: new Set(),
      timeElapsed: 0,
      lastDamageTime: 0,
      notifications: [],
      mazeVersion: get().mazeVersion + 1,
    });
  },

  collectItem: (id, points) => {
    const { collectedIds, score } = get();
    if (collectedIds.has(id)) return;
    const next = new Set(collectedIds);
    next.add(id);
    set({ collectedIds: next, score: score + points });
  },

  collectKey: () => {
    set({ hasKey: true });
    get().addNotification("🗝 KEY COLLECTED — Portal unlocked!", "#ffd700");
  },

  takeDamage: (amount) => {
    const { health } = get();
    const newHealth = Math.max(0, health - amount);
    if (newHealth <= 0) {
      get().saveHighScore();
      set({ health: 0, gameState: "lost", lastDamageTime: Date.now() });
    } else {
      set({ health: newHealth, lastDamageTime: Date.now() });
    }
  },

  winGame: () => {
    get().saveHighScore();
    set({ gameState: "won" });
  },

  loseGame: () => {
    get().saveHighScore();
    set({ gameState: "lost" });
  },

  updateTime: (delta) => {
    if (get().gameState === "playing") {
      set({ timeElapsed: get().timeElapsed + delta });
    }
  },

  addNotification: (text, color) => {
    const id = Date.now() + Math.random();
    set((s) => ({ notifications: [...s.notifications, { id, text, color }] }));
    setTimeout(() => {
      set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
    }, 2500);
  },

  saveHighScore: () => {
    const { score, level, timeElapsed, gameState, highScores } = get();
    const entry: HighScore = {
      score,
      level,
      time: timeElapsed,
      won: gameState === "won",
      date: new Date().toLocaleDateString(),
    };
    const updated = [...highScores, entry].sort((a, b) => b.score - a.score).slice(0, 10);
    saveHighScoresToStorage(updated);
    set({ highScores: updated });
  },
}));
