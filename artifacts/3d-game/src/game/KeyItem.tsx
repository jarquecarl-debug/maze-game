/// <reference types="@react-three/fiber" />
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
      <pointLight color="#ccaa00" intensity={2} distance={6} decay={2} />  {/* was intensity 4, distance 8 */}

      {/* Key bow (ring) */}
      <mesh position={[0, 0.3, 0]}>
        <torusGeometry args={[0.22, 0.07, 10, 16]} />  {/* segments 12,20→10,16 */}
        <meshStandardMaterial color="#ccaa00" emissive="#aa8800" emissiveIntensity={0.8} metalness={1} roughness={0.1} />
      </mesh>

      {/* Key shaft */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.08, 0.6, 0.08]} />
        <meshStandardMaterial color="#ccaa00" emissive="#aa8800" emissiveIntensity={0.8} metalness={1} roughness={0.1} />
      </mesh>

      {/* Key teeth */}
      <mesh position={[0.1, -0.3, 0]}>
        <boxGeometry args={[0.15, 0.07, 0.07]} />
        <meshStandardMaterial color="#ccaa00" emissive="#aa8800" emissiveIntensity={0.8} metalness={1} roughness={0.1} />
      </mesh>
      <mesh position={[0.1, -0.2, 0]}>
        <boxGeometry args={[0.1, 0.07, 0.07]} />
        <meshStandardMaterial color="#ccaa00" emissive="#aa8800" emissiveIntensity={0.8} metalness={1} roughness={0.1} />
      </mesh>
    </group>
  );
}