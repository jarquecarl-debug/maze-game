import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CollectibleData } from "./mazeData";

interface CollectibleProps {
  data: CollectibleData;
  collected: boolean;
}

const COLORS: Record<string, string> = {
  gem: "#ff00ff",
  coin: "#ffd700",
  star: "#00ffff",
};

const EMISSIVE_INTENSITY: Record<string, number> = {
  gem: 2,
  coin: 1.5,
  star: 3,
};

export default function Collectible({ data, collected }: CollectibleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((_, delta) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y += delta * 2;
      meshRef.current.position.y =
        data.position[1] + Math.sin(Date.now() * 0.003) * 0.3;
    }
    if (lightRef.current && !collected) {
      lightRef.current.intensity =
        1.5 + Math.sin(Date.now() * 0.005) * 0.5;
    }
  });

  if (collected) return null;

  const color = COLORS[data.type];
  const emissiveIntensity = EMISSIVE_INTENSITY[data.type];

  return (
    <group position={data.position}>
      <pointLight
        ref={lightRef}
        color={color}
        intensity={1.5}
        distance={6}
        decay={2}
      />
      {data.type === "gem" && (
        <mesh ref={meshRef} castShadow>
          <octahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissiveIntensity}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
      )}
      {data.type === "coin" && (
        <mesh ref={meshRef} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.08, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissiveIntensity}
            roughness={0.2}
            metalness={0.95}
          />
        </mesh>
      )}
      {data.type === "star" && (
        <mesh ref={meshRef} castShadow>
          <dodecahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissiveIntensity}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
      )}
    </group>
  );
}
