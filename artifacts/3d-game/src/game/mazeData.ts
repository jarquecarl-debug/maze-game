export const CELL_SIZE = 4;
export const WALL_HEIGHT = 5;

export let MAZE_SIZE = 15;
export let MAZE_LAYOUT: number[][] = [];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildMaze(size: number): number[][] {
  const maze = Array.from({ length: size }, () => Array(size).fill(1));

  function carve(r: number, c: number) {
    for (const [dr, dc] of shuffle([[0, 2], [0, -2], [2, 0], [-2, 0]])) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr > 0 && nr < size - 1 && nc > 0 && nc < size - 1 && maze[nr][nc] === 1) {
        maze[r + dr / 2][c + dc / 2] = 0;
        maze[nr][nc] = 0;
        carve(nr, nc);
      }
    }
  }

  maze[1][1] = 0;
  carve(1, 1);
  maze[size - 2][size - 2] = 0;
  return maze;
}

export function regenerateMaze(level: number) {
  MAZE_SIZE = Math.min(13 + level * 2, 21);
  if (MAZE_SIZE % 2 === 0) MAZE_SIZE--;
  MAZE_LAYOUT = buildMaze(MAZE_SIZE);
}

// Boot with level 1
regenerateMaze(1);

function cellToWorld(row: number, col: number): [number, number, number] {
  return [
    col * CELL_SIZE - (MAZE_SIZE * CELL_SIZE) / 2 + CELL_SIZE / 2,
    0,
    row * CELL_SIZE - (MAZE_SIZE * CELL_SIZE) / 2 + CELL_SIZE / 2,
  ];
}

export function getPlayerStart(): [number, number, number] {
  return cellToWorld(1, 1);
}

export function getExitPosition(): [number, number, number] {
  return cellToWorld(MAZE_SIZE - 2, MAZE_SIZE - 2);
}

/** BFS from (1,1) — returns the open cell nearest to 60% depth, away from start/exit. */
export function getKeyCell(): [number, number] {
  const start: [number, number] = [1, 1];
  const exit: [number, number] = [MAZE_SIZE - 2, MAZE_SIZE - 2];
  const visited = new Map<string, number>();
  const queue: [number, number, number][] = [[1, 1, 0]];
  visited.set("1,1", 0);
  let maxDepth = 0;

  while (queue.length > 0) {
    const [r, c, d] = queue.shift()!;
    if (d > maxDepth) maxDepth = d;
    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nr = r + dr, nc = c + dc;
      const k = `${nr},${nc}`;
      if (nr > 0 && nr < MAZE_SIZE - 1 && nc > 0 && nc < MAZE_SIZE - 1 &&
        !visited.has(k) && MAZE_LAYOUT[nr][nc] === 0) {
        visited.set(k, d + 1);
        queue.push([nr, nc, d + 1]);
      }
    }
  }

  const target = Math.floor(maxDepth * 0.6);
  let best: [number, number] = [Math.floor(MAZE_SIZE / 2), Math.floor(MAZE_SIZE / 2)];
  let bestDiff = Infinity;

  for (const [key, depth] of visited) {
    const [r, c] = key.split(",").map(Number);
    if ((r === start[0] && c === start[1]) || (r === exit[0] && c === exit[1])) continue;
    const diff = Math.abs(depth - target);
    if (diff < bestDiff) { bestDiff = diff; best = [r, c]; }
  }
  return best;
}

export function getKeyPosition(): [number, number, number] {
  const [r, c] = getKeyCell();
  const pos = cellToWorld(r, c);
  pos[1] = 1;
  return pos;
}

export function getEnemyStartCell(): [number, number] {
  const er = MAZE_SIZE - 2, ec = MAZE_SIZE - 2;
  for (const [dr, dc] of [[0, 0], [-1, 0], [0, -1], [-1, -1], [-2, 0], [0, -2], [-2, -2]]) {
    const r = er + dr, c = ec + dc;
    if (r > 0 && c > 0 && r < MAZE_SIZE - 1 && c < MAZE_SIZE - 1 && MAZE_LAYOUT[r][c] === 0) {
      return [r, c];
    }
  }
  return [er, ec];
}

export function getEnemyStartPosition(): [number, number, number] {
  const [r, c] = getEnemyStartCell();
  const pos = cellToWorld(r, c);
  pos[1] = 0;
  return pos;
}

export interface CollectibleData {
  id: string;
  position: [number, number, number];
  type: "gem" | "coin" | "star";
  points: number;
}

export interface ObstacleData {
  id: string;
  position: [number, number, number];
  type: "spike" | "fire" | "poison";
  damage: number;
}

export function getOpenCells(): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < MAZE_SIZE; r++) {
    for (let c = 0; c < MAZE_SIZE; c++) {
      if (MAZE_LAYOUT[r][c] === 0) cells.push([r, c]);
    }
  }
  return cells;
}

export function generateCollectibles(level: number): CollectibleData[] {
  const openCells = getOpenCells();
  const count = Math.min(10 + level * 2, 20);
  const types: { type: CollectibleData["type"]; points: number }[] = [
    { type: "gem", points: 50 },
    { type: "coin", points: 10 },
    { type: "star", points: 100 },
  ];
  const exclude = new Set<string>(["1,1", `${MAZE_SIZE - 2},${MAZE_SIZE - 2}`]);
  const [kr, kc] = getKeyCell();
  const [er, ec] = getEnemyStartCell();
  exclude.add(`${kr},${kc}`);
  exclude.add(`${er},${ec}`);

  const result: CollectibleData[] = [];
  const used = new Set<string>(exclude);

  for (let i = 0; i < count; i++) {
    let tries = 0;
    let found = false;
    while (!found && tries++ < 200) {
      const idx = Math.floor(Math.random() * openCells.length);
      const [r, c] = openCells[idx];
      const key = `${r},${c}`;
      if (!used.has(key)) {
        used.add(key);
        const pos = cellToWorld(r, c);
        pos[1] = 1;
        result.push({ id: `col-${i}`, position: pos, ...types[i % types.length] });
        found = true;
      }
    }
  }
  return result;
}

export function generateObstacles(level: number): ObstacleData[] {
  const openCells = getOpenCells();
  const count = Math.min(6 + level * 2, 16);
  const types: { type: ObstacleData["type"]; damage: number }[] = [
    { type: "spike", damage: 15 },
    { type: "fire", damage: 25 },
    { type: "poison", damage: 10 },
  ];
  const [kr, kc] = getKeyCell();
  const [er, ec] = getEnemyStartCell();
  const used = new Set<string>(["1,1", "1,2", "2,1", `${MAZE_SIZE - 2},${MAZE_SIZE - 2}`, `${kr},${kc}`, `${er},${ec}`]);

  const result: ObstacleData[] = [];
  for (let i = 0; i < count; i++) {
    let tries = 0;
    let found = false;
    while (!found && tries++ < 200) {
      const idx = Math.floor(Math.random() * openCells.length);
      const [r, c] = openCells[idx];
      const key = `${r},${c}`;
      if (!used.has(key)) {
        used.add(key);
        const pos = cellToWorld(r, c);
        pos[1] = 0.5;
        result.push({ id: `obs-${i}`, position: pos, ...types[i % types.length] });
        found = true;
      }
    }
  }
  return result;
}

export function getWalls() {
  const walls: { position: [number, number, number]; size: [number, number, number] }[] = [];
  for (let r = 0; r < MAZE_SIZE; r++) {
    for (let c = 0; c < MAZE_SIZE; c++) {
      if (MAZE_LAYOUT[r][c] === 1) {
        const pos = cellToWorld(r, c);
        pos[1] = WALL_HEIGHT / 2;
        walls.push({ position: pos, size: [CELL_SIZE, WALL_HEIGHT, CELL_SIZE] });
      }
    }
  }
  return walls;
}
