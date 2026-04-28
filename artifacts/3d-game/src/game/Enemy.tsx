import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { MAZE_LAYOUT, MAZE_SIZE, CELL_SIZE } from "./mazeData";
import { useGameStore } from "./useGameStore";
import { sharedState } from "./sharedState";
import { playEnemyNear } from "./sounds";

useGLTF.preload("/wraith.glb");

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
  let head = 0;
  while (head < queue.length) {
    const [r, c] = queue[head++];
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

function getRecomputeInterval(distToPlayer: number): number {
  if (distToPlayer < 8)  return 0.25;
  if (distToPlayer < 20) return 0.6;
  return 1.2;
}

interface EnemyProps {
  startRow: number;
  startCol: number;
}

// Hologram material — cyan translucent self-lit ghost look
function makeHologramMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color:             new THREE.Color("#00bbcc"),
    emissive:          new THREE.Color("#00aacc"),
    emissiveIntensity: 1.4,
    transparent:       true,
    opacity:           0.78,
    roughness:         0.15,
    metalness:         0.0,
    side:              THREE.DoubleSide,
  });
}

export default function Enemy({ startRow, startCol }: EnemyProps) {
  const groupRef          = useRef<THREE.Group>(null);
  const posRef            = useRef(new THREE.Vector3());
  const pathRef           = useRef<[number, number][]>([]);
  const pathTimerRef      = useRef(0);
  const soundTimerRef     = useRef(0);
  const damageCooldown    = useRef(0);
  const lastPlayerCellRef = useRef<[number, number]>([-1, -1]);

  const gameState = useGameStore((s) => s.gameState);

  // Load GLB
  const { scene } = useGLTF("/wraith.glb");

  // Clone once and apply hologram material
  const clonedScene = useRef<THREE.Group | null>(null);
  if (!clonedScene.current) {
    clonedScene.current = scene.clone(true);
    clonedScene.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material      = makeHologramMaterial();
        child.castShadow    = false;
        child.receiveShadow = false;
      }
    });
  }

  useEffect(() => {
    if (gameState === "playing") {
      const [wx, wz] = cellCenter(startRow, startCol);
      posRef.current.set(wx, 1.0, wz);
      pathRef.current           = [];
      pathTimerRef.current      = 0;
      soundTimerRef.current     = 0;
      damageCooldown.current    = 0;
      lastPlayerCellRef.current = [-1, -1];
    }
  }, [gameState, startRow, startCol]);

  useFrame((_, delta) => {
    if (gameState !== "playing") return;
    const store = useGameStore.getState();
    const speed = 2.5 + (store.level - 1) * 0.5;

    damageCooldown.current = Math.max(0, damageCooldown.current - delta);
    soundTimerRef.current  = Math.max(0, soundTimerRef.current  - delta);

    const distToPlayer = Math.sqrt(
      (posRef.current.x - sharedState.playerWorldX) ** 2 +
      (posRef.current.z - sharedState.playerWorldZ) ** 2
    );

    const playerCellChanged =
      sharedState.playerRow !== lastPlayerCellRef.current[0] ||
      sharedState.playerCol !== lastPlayerCellRef.current[1];

    pathTimerRef.current -= delta;
    const shouldRecompute =
      pathTimerRef.current <= 0 ||
      pathRef.current.length === 0 ||
      playerCellChanged;

    if (shouldRecompute) {
      pathTimerRef.current      = getRecomputeInterval(distToPlayer);
      lastPlayerCellRef.current = [sharedState.playerRow, sharedState.playerCol];
      const [er, ec]            = worldToCell(posRef.current.x, posRef.current.z);
      pathRef.current           = bfs(er, ec, sharedState.playerRow, sharedState.playerCol);
    }

    if (pathRef.current.length > 0) {
      const [wr, wc] = pathRef.current[0];
      const [tx, tz] = cellCenter(wr, wc);
      const dx   = tx - posRef.current.x;
      const dz   = tz - posRef.current.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const boost = distToPlayer < 16 ? 1.5 : 1;

      if (dist < 0.15) {
        posRef.current.x = tx;
        posRef.current.z = tz;
        pathRef.current.shift();
      } else {
        posRef.current.x += (dx / dist) * speed * boost * delta;
        posRef.current.z += (dz / dist) * speed * boost * delta;
      }

      if (distToPlayer < 12 && soundTimerRef.current <= 0) {
        soundTimerRef.current = 3;
        playEnemyNear();
      }

      if (distToPlayer < 1.2 && damageCooldown.current <= 0) {
        store.takeDamage(20);
        store.addNotification("👻 Enemy hit!", "#aa44ff");
        damageCooldown.current = 1.5;
      }
    }

    const [er, ec] = worldToCell(posRef.current.x, posRef.current.z);
    sharedState.enemyRow = er;
    sharedState.enemyCol = ec;

    if (groupRef.current) {
      const t = Date.now() * 0.0018;

      // Position + hover bob
      groupRef.current.position.copy(posRef.current);
      groupRef.current.position.y = posRef.current.y + Math.sin(t) * 0.18;

      // Face player — smooth turn
      // Face player — smooth turn
      // Math.PI offset corrects for model facing -Z by default from Tripo
      const dx = sharedState.playerWorldX - posRef.current.x;
      const dz = sharedState.playerWorldZ - posRef.current.z;
      if (Math.abs(dx) + Math.abs(dz) > 0.1) {
        const targetAngle = Math.atan2(dx, dz) + Math.PI; // ← adjust this offset
        const current     = groupRef.current.rotation.y;
        const diff        = ((targetAngle - current + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        groupRef.current.rotation.y += diff * delta * 3;
      }

      // Gentle sway
      groupRef.current.rotation.z = Math.sin(t * 0.85) * 0.055;

      // Pulse opacity — flickering hologram feel
      if (clonedScene.current) {
        clonedScene.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const mat = child.material as THREE.MeshStandardMaterial;
            mat.opacity           = 0.72 + Math.sin(t * 2.2) * 0.08;
            mat.emissiveIntensity = 1.4  + Math.sin(t * 1.8) * 0.3;
          }
        });
      }
    }
  });

  if (gameState !== "playing") return null;

  return (
    <group ref={groupRef}>

      {/* Main danger glow */}
      <pointLight color="#00ccdd" intensity={3.5} distance={11} decay={2} />
      {/* Inner hologram glow — behind model for translucency effect */}
      <pointLight color="#00ffee" intensity={2.0} distance={4}  decay={2} position={[0, 0.5, -0.6]} />
      {/* Eye area light */}
      <pointLight color="#88ccff" intensity={1.2} distance={3}  decay={2} position={[0, 0.8,  0.4]} />

      {/* GLB model */}
      <group
        position={[0, 0.0, 0]}
        scale={[2.5, 2.5, 2.5]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <primitive object={clonedScene.current} />
      </group>

      {/* Floor shadow */}
      <mesh position={[0, -1.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 16]} />
        <meshStandardMaterial
          color="#000000"
          transparent opacity={0.25}
          depthWrite={false}
        />
      </mesh>

    </group>
  );
}