# 🌀 Maze Explorer 3D

A first-person 3D maze game built with React, Three.js, and React Three Fiber. Navigate dark atmospheric mazes, collect items, avoid a BFS-powered wraith enemy, and find the exit before it finds you.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-maze--game--3d.netlify.app-blueviolet?style=flat-square&logo=netlify&logoColor=white)](https://maze-game-3d.netlify.app)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-r128-000000?style=flat-square&logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)

---

## Screenshots

| Homepage | Gameplay |
|---|---|
| ![Homepage](./screenshots/homepage.png) | ![Gameplay](./screenshots/Gameplay.png) |

| Exit Portal | Wraith Enemy |
|---|---|
| ![Exit Portal](./screenshots/Portal.png) | ![Wraith Enemy](./screenshots/Wraith.png) |

| Crystal Spikes | Minimap & HUD |
|---|---|
| ![Red Crystal Spikes](./screenshots/Spikes.png) | ![Minimap HUD](./screenshots/Minimap-hud.png) |

---

## Features

- **First-person 3D exploration** — pointer-lock mouse look, WASD movement, and sprint
- **Ghost enemy AI** — a glowing wraith using BFS pathfinding to hunt the player, with adaptive recompute speed based on distance
- **Collectibles** — gems, coins, and stars scattered throughout the maze
- **Hazards** — fire, crystal spike, and poison obstacles that deal damage on contact
- **Key + exit system** — find the golden key first to unlock the exit portal
- **Dynamic lighting** — warm torch light that follows the player through the dark maze
- **Minimap** — live top-down view showing player position, enemy location, and collectibles
- **HUD** — health bar, score, level counter, sprint meter, and notification toasts
- **Level progression** — enemy speed and difficulty scale with each level cleared
- **Optimized rendering** — fog culling, reduced geometry segments, and performance-tuned Canvas settings

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| 3D Rendering | Three.js + React Three Fiber |
| 3D Helpers | @react-three/drei |
| State Management | Zustand |
| Build Tool | Vite |
| Deployment | Netlify |

---

## Project Structure

```
src/
└── game/
    ├── MazeScene.tsx       # Root 3D canvas and scene setup
    ├── Player.tsx          # First-person controls + pointer lock
    ├── Enemy.tsx           # BFS pathfinding AI (wraith)
    ├── MazeWalls.tsx       # Procedural wall geometry
    ├── Collectible.tsx     # Gem / coin / star pickups
    ├── Obstacle.tsx        # Fire / spike / poison hazards
    ├── ExitPortal.tsx      # Animated black hole exit portal
    ├── KeyItem.tsx         # Golden key collectible
    ├── PlayerLight.tsx     # Dynamic torch light
    ├── HUD.tsx             # Health, score, minimap overlay
    ├── GameUI.tsx          # Menu, game over, highscores screens
    ├── MiniMap.tsx         # Top-down minimap renderer
    ├── MobileControls.tsx  # On-screen controls for mobile
    ├── mazeData.ts         # Maze layout, cell helpers, spawn points
    ├── useGameStore.ts     # Zustand global game state
    ├── sharedState.ts      # Ref-based shared state (player position)
    └── sounds.ts           # Audio playback helpers
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation & local dev

```bash
git clone https://github.com/jarquecarl/maze-game.git
cd maze-game
pnpm install
pnpm --filter @workspace/3d-game dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
cd artifacts/3d-game
pnpm build
```

---

## Controls

| Input | Action |
|---|---|
| `W A S D` | Move |
| `Shift` | Sprint |
| `Mouse` | Look around |
| `Esc` | Pause |
| Click canvas | Lock pointer / start |

---

## Enemy AI

The wraith uses **Breadth-First Search (BFS)** on the maze grid to find the shortest path to the player at all times. Path recomputation is adaptive — closer distance means more frequent updates, keeping the AI snappy up close while staying performant at range.

```
Distance < 8 units  → recompute every 0.25s
Distance < 20 units → recompute every 0.60s
Distance > 20 units → recompute every 1.20s
```

---

## License

MIT — feel free to use, modify, and build on this.

---

> Built by [Carl Christian Jarque](https://carl-jarque-portfolio.netlify.app) · [LinkedIn](https://linkedin.com/in/carl-jarque-6b65b63bb)
