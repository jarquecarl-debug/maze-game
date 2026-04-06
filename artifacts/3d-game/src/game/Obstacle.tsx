import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ObstacleData } from "./mazeData";

const COLORS: Record<string, string> = {
  spike: "#ff4444",
  fire: "#ff6600",
  poison: "#44ff44",
};

export default function Obstacle({ data }: { data: ObstacleData }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      if (data.type === "fire") {
        meshRef.current.rotation.y += delta * 3;
        const s = 1 + Math.sin(Date.now() * 0.01) * 0.1;
        meshRef.current.scale.set(s, s, s);
      } else if (data.type === "poison") {
        meshRef.current.position.y =
          data.position[1] + Math.sin(Date.now() * 0.004) * 0.15;
      }
    }
  });

  const color = COLORS[data.type];

  return (
    <group ref={meshRef} position={data.position}>
      <pointLight color={color} intensity={1} distance={5} decay={2} />
      {data.type === "spike" && (
        <group>
          {[0, 0.8, -0.8, 0.4, -0.4].map((x, i) => (
            <mesh key={i} position={[x, 0, i % 2 === 0 ? 0.3 : -0.3]} castShadow>
              <coneGeometry args={[0.15, 0.8, 4]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5}
                metalness={0.8}
                roughness={0.3}
              />
            </mesh>
          ))}
        </group>
      )}
      {data.type === "fire" && (
        <group>
          <mesh castShadow>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={2}
              roughness={0.5}
              transparent
              opacity={0.8}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.7, 8, 8]} />
            <meshStandardMaterial
              color="#ff3300"
              emissive="#ff3300"
              emissiveIntensity={1}
              transparent
              opacity={0.3}
            />
          </mesh>
        </group>
      )}
      {data.type === "poison" && (
        <group>
          <mesh castShadow>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1}
              transparent
              opacity={0.6}
              roughness={0.3}
            />
          </mesh>
          <mesh>
            <torusGeometry args={[0.6, 0.08, 8, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.8}
              transparent
              opacity={0.4}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
