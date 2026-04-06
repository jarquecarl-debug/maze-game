# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### 3D Maze Game (`artifacts/3d-game`)
- First-person 3D maze game built with React Three Fiber + Three.js
- **Dependencies**: three, @react-three/fiber, @react-three/drei, zustand
- **Game features**:
  - Procedural maze with walls, floor, and atmospheric fog
  - First-person camera with mouse look (pointer lock) and WASD movement
  - Collectible items: gems (50pts), coins (10pts), stars (100pts)
  - Obstacles: spikes, fire, poison (each deal damage)
  - Exit portal to win the game
  - HUD with score, health bar, time elapsed, items collected
  - Menu, win, and game over screens
- **Key files**:
  - `src/game/mazeData.ts` — maze layout, collectible/obstacle generation
  - `src/game/useGameStore.ts` — zustand state management
  - `src/game/Player.tsx` — first-person controller with collision detection
  - `src/game/MazeScene.tsx` — main scene composition
  - `src/game/GameUI.tsx` — menu/win/loss screens
  - `src/game/HUD.tsx` — in-game overlay

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
