export const CELL_SIZE = 4;
export const WALL_HEIGHT = 5;
export const WALL_THICKNESS = 0.3;

export const MAZE_LAYOUT = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

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

function cellToWorld(row: number, col: number): [number, number, number] {
  return [col * CELL_SIZE - (MAZE_LAYOUT[0].length * CELL_SIZE) / 2 + CELL_SIZE / 2, 0, row * CELL_SIZE - (MAZE_LAYOUT.length * CELL_SIZE) / 2 + CELL_SIZE / 2];
}

export function getOpenCells(): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < MAZE_LAYOUT.length; r++) {
    for (let c = 0; c < MAZE_LAYOUT[r].length; c++) {
      if (MAZE_LAYOUT[r][c] === 0) {
        cells.push([r, c]);
      }
    }
  }
  return cells;
}

export function generateCollectibles(): CollectibleData[] {
  const openCells = getOpenCells();
  const types: Array<{ type: CollectibleData["type"]; points: number }> = [
    { type: "gem", points: 50 },
    { type: "coin", points: 10 },
    { type: "star", points: 100 },
  ];

  const collectibles: CollectibleData[] = [];
  const usedCells = new Set<string>();
  usedCells.add("1,1");

  for (let i = 0; i < 12; i++) {
    let cellIndex: number;
    let cellKey: string;
    do {
      cellIndex = Math.floor(Math.random() * openCells.length);
      cellKey = `${openCells[cellIndex][0]},${openCells[cellIndex][1]}`;
    } while (usedCells.has(cellKey));

    usedCells.add(cellKey);
    const [row, col] = openCells[cellIndex];
    const typeData = types[i % types.length];
    const pos = cellToWorld(row, col);
    pos[1] = 1;
    collectibles.push({
      id: `collectible-${i}`,
      position: pos,
      type: typeData.type,
      points: typeData.points,
    });
  }

  return collectibles;
}

export function generateObstacles(): ObstacleData[] {
  const openCells = getOpenCells();
  const types: Array<{ type: ObstacleData["type"]; damage: number }> = [
    { type: "spike", damage: 15 },
    { type: "fire", damage: 25 },
    { type: "poison", damage: 10 },
  ];

  const obstacles: ObstacleData[] = [];
  const usedCells = new Set<string>();
  usedCells.add("1,1");
  usedCells.add("13,13");

  for (let i = 0; i < 8; i++) {
    let cellIndex: number;
    let cellKey: string;
    do {
      cellIndex = Math.floor(Math.random() * openCells.length);
      cellKey = `${openCells[cellIndex][0]},${openCells[cellIndex][1]}`;
    } while (usedCells.has(cellKey));

    usedCells.add(cellKey);
    const [row, col] = openCells[cellIndex];
    const typeData = types[i % types.length];
    const pos = cellToWorld(row, col);
    pos[1] = 0.5;
    obstacles.push({
      id: `obstacle-${i}`,
      position: pos,
      type: typeData.type,
      damage: typeData.damage,
    });
  }

  return obstacles;
}

export function getPlayerStart(): [number, number, number] {
  return cellToWorld(1, 1);
}

export function getExitPosition(): [number, number, number] {
  return cellToWorld(13, 13);
}

export function getWalls(): Array<{ position: [number, number, number]; size: [number, number, number] }> {
  const walls: Array<{ position: [number, number, number]; size: [number, number, number] }> = [];
  const rows = MAZE_LAYOUT.length;
  const cols = MAZE_LAYOUT[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (MAZE_LAYOUT[r][c] === 1) {
        const pos = cellToWorld(r, c);
        pos[1] = WALL_HEIGHT / 2;
        walls.push({
          position: pos,
          size: [CELL_SIZE, WALL_HEIGHT, CELL_SIZE],
        });
      }
    }
  }

  return walls;
}
