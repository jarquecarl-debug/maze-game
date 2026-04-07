import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "./useGameStore";
import { getKeyPosition } from "./mazeData";

export default function KeyItem() {
  const hasKey = useGameStore((s) => s.hasKey);
  const groupRef = useRef<THREE.Group>(null);
  const pos = getKeyPosition();

  useFrame(() => {
    if (!groupRef.current || hasKey) return;
    groupRef.current.rotation.y += 0.025;
    groupRef.current.position.y = pos[1] + Math.sin(Date.now() * 0.002) * 0.25;
  });

  if (hasKey) return null;

  return (
    <group ref={groupRef} position={pos}>
      <pointLight color="#ffd700" intensity={4} distance={8} decay={2} />

      {/* Key bow (ring) */}
      <mesh position={[0, 0.3, 0]}>
        <torusGeometry args={[0.22, 0.07, 12, 20]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={2} metalness={1} roughness={0.1} />
      </mesh>

      {/* Key shaft */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.08, 0.6, 0.08]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={2} metalness={1} roughness={0.1} />
      </mesh>

      {/* Key teeth */}
      <mesh position={[0.1, -0.3, 0]}>
        <boxGeometry args={[0.15, 0.07, 0.07]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={2} metalness={1} roughness={0.1} />
      </mesh>
      <mesh position={[0.1, -0.2, 0]}>
        <boxGeometry args={[0.1, 0.07, 0.07]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={2} metalness={1} roughness={0.1} />
      </mesh>

      {/* Glow sphere */}
      <mesh>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color="#ffd700" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}
