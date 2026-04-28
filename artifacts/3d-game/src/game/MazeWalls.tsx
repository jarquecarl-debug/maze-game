/// <reference types="@react-three/fiber" />
import { useMemo } from "react";
import * as THREE from "three";
import { getWalls, WALL_HEIGHT, CELL_SIZE } from "./mazeData";

const wallMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0x667799),
  roughness: 0.5,
  metalness: 0.1,
});

const topMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0x334455),
  roughness: 0.7,
});

export default function MazeWalls() {
  const walls = useMemo(() => getWalls(), []);

  return (
    <group>
      {walls.map((wall, i) => (
        <mesh key={i} position={wall.position} material={wallMat}>
          <boxGeometry args={[CELL_SIZE, WALL_HEIGHT, CELL_SIZE]} />
        </mesh>
      ))}
      {walls.map((wall, i) => (
        <mesh
          key={`top-${i}`}
          position={[wall.position[0], WALL_HEIGHT + 0.05, wall.position[2]]}
          material={topMat}
        >
          <boxGeometry args={[CELL_SIZE, 0.1, CELL_SIZE]} />
        </mesh>
      ))}
    </group>
  );
}