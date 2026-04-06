import { MAZE_LAYOUT, CELL_SIZE } from "./mazeData";

export default function Floor() {
  const width = MAZE_LAYOUT[0].length * CELL_SIZE;
  const depth = MAZE_LAYOUT.length * CELL_SIZE;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[width + 10, depth + 10]} />
      <meshStandardMaterial color="#1a0e2e" roughness={0.9} metalness={0.05} />
    </mesh>
  );
}
