/// <reference types="@react-three/fiber" />
import { MAZE_LAYOUT, CELL_SIZE } from "./mazeData";
import * as THREE from "three";

const floorMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0x223344),
  roughness: 0.8,
  metalness: 0.05,
});

export default function Floor() {
  const width = MAZE_LAYOUT[0].length * CELL_SIZE;
  const depth = MAZE_LAYOUT.length * CELL_SIZE;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={floorMat}>
      <planeGeometry args={[width + 10, depth + 10]} />
    </mesh>
  );
}