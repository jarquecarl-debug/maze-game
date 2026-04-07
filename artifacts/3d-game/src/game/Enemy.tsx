import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MAZE_LAYOUT, MAZE_SIZE, CELL_SIZE } from "./mazeData";
import { useGameStore } from "./useGameStore";
import { sharedState } from "./sharedState";
import { playEnemyNear } from "./sounds";

function cellCenter(row: number, col: number): [number, number] {
  return [
    col * CELL_SIZE - (MAZE_SIZE * CELL_SIZE) / 2 + CELL_SIZE / 2,
    row * CELL_SIZE - (MAZE_SIZE * CELL_SIZE) / 2 + CELL_SIZE / 2,
  ];
}

function worldToCell(x: number, z: number): [number, number] {
  const col = Math.round((x + (MAZE_SIZE * CELL_SIZE) / 2 - CELL_SIZE / 2) / CELL_SIZE);
  const row = Math.round((z + (MAZE_SIZE * CELL_SIZE) / 2 - CELL_SIZE / 2) / CELL_SIZE);
  return [
    Math.max(0, Math.min(MAZE_SIZE - 1, row)),
    Math.max(0, Math.min(MAZE_SIZE - 1, col)),
  ];
}

function bfs(sr: number, sc: number, er: number, ec: number): [number, number][] {
  const key = (r: number, c: number) => r * MAZE_SIZE + c;
  const parent = new Map<number, number>();
  parent.set(key(sr, sc), -1);
  const queue: [number, number][] = [[sr, sc]];

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    if (r === er && c === ec) {
      const path: [number, number][] = [];
      let k: number | undefined = key(er, ec);
      while (k !== undefined && parent.get(k) !== -1) {
        path.unshift([Math.floor(k / MAZE_SIZE), k % MAZE_SIZE]);
        k = parent.get(k);
      }
      return path;
    }
    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nr = r + dr, nc = c + dc;
      const nk = key(nr, nc);
      if (nr >= 0 && nr < MAZE_SIZE && nc >= 0 && nc < MAZE_SIZE &&
        !parent.has(nk) && MAZE_LAYOUT[nr][nc] === 0) {
        parent.set(nk, key(r, c));
        queue.push([nr, nc]);
      }
    }
  }
  return [];
}

interface EnemyProps {
  startRow: number;
  startCol: number;
}

export default function Enemy({ startRow, startCol }: EnemyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const posRef = useRef(new THREE.Vector3());
  const pathRef = useRef<[number, number][]>([]);
  const pathTimerRef = useRef(0);
  const soundTimerRef = useRef(0);
  const damageCooldown = useRef(0);

  const gameState = useGameStore((s) => s.gameState);

  useEffect(() => {
    if (gameState === "playing") {
      const [wx, wz] = cellCenter(startRow, startCol);
      posRef.current.set(wx, 1.0, wz);
      pathRef.current = [];
      pathTimerRef.current = 0;
      soundTimerRef.current = 0;
      damageCooldown.current = 0;
    }
  }, [gameState, startRow, startCol]);

  useFrame((_, delta) => {
    if (gameState !== "playing") return;
    const store = useGameStore.getState();
    const speed = 2.5 + (store.level - 1) * 0.5;

    damageCooldown.current = Math.max(0, damageCooldown.current - delta);
    soundTimerRef.current = Math.max(0, soundTimerRef.current - delta);

    // Recalculate path every 1.5s
    pathTimerRef.current -= delta;
    if (pathTimerRef.current <= 0) {
      pathTimerRef.current = 1.5;
      const [er, ec] = worldToCell(posRef.current.x, posRef.current.z);
      pathRef.current = bfs(er, ec, sharedState.playerRow, sharedState.playerCol);
    }

    // Move toward next waypoint
    if (pathRef.current.length > 0) {
      const [wr, wc] = pathRef.current[0];
      const [tx, tz] = cellCenter(wr, wc);
      const dx = tx - posRef.current.x;
      const dz = tz - posRef.current.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      const distToPlayer = Math.sqrt(
        (posRef.current.x - sharedState.playerWorldX) ** 2 +
        (posRef.current.z - sharedState.playerWorldZ) ** 2
      );
      const boost = distToPlayer < 16 ? 1.5 : 1;

      if (dist < 0.15) {
        posRef.current.x = tx;
        posRef.current.z = tz;
        pathRef.current.shift();
      } else {
        posRef.current.x += (dx / dist) * speed * boost * delta;
        posRef.current.z += (dz / dist) * speed * boost * delta;
      }

      // Sound when nearby
      if (distToPlayer < 12 && soundTimerRef.current <= 0) {
        soundTimerRef.current = 3;
        playEnemyNear();
      }

      // Damage player on contact
      if (distToPlayer < 1.2 && damageCooldown.current <= 0) {
        store.takeDamage(20);
        store.addNotification("👾 Enemy hit you!", "#ff4444");
        damageCooldown.current = 1.5;
      }
    }

    // Update shared state for minimap
    const [er, ec] = worldToCell(posRef.current.x, posRef.current.z);
    sharedState.enemyRow = er;
    sharedState.enemyCol = ec;

    // Animate group
    if (groupRef.current) {
      groupRef.current.position.copy(posRef.current);
      groupRef.current.rotation.y += delta * 3;
    }
  });

  if (gameState !== "playing") return null;

  return (
    <group ref={groupRef}>
      <pointLight color="#ff2200" intensity={3} distance={10} decay={2} />
      <mesh>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color="#cc0000"
          emissive="#ff0000"
          emissiveIntensity={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={3} />
      </mesh>
    </group>
  );
}
