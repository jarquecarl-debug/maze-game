import { useMemo } from "react";
import * as THREE from "three";
import { getWalls, WALL_HEIGHT, CELL_SIZE } from "./mazeData";

export default function MazeWalls() {
  const walls = useMemo(() => getWalls(), []);

  const wallColor = new THREE.Color(0x2a1a3a);
  const topColor = new THREE.Color(0x3d2a5c);

  return (
    <group>
      {walls.map((wall, i) => (
        <mesh key={i} position={wall.position} castShadow receiveShadow>
          <boxGeometry args={[CELL_SIZE, WALL_HEIGHT, CELL_SIZE]} />
          <meshStandardMaterial
            color={wallColor}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      ))}
      {walls.map((wall, i) => (
        <mesh
          key={`top-${i}`}
          position={[wall.position[0], WALL_HEIGHT + 0.05, wall.position[2]]}
        >
          <boxGeometry args={[CELL_SIZE, 0.1, CELL_SIZE]} />
          <meshStandardMaterial
            color={topColor}
            emissive={topColor}
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}
