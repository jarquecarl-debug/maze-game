/// <reference types="@react-three/fiber" />
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ObstacleData } from "./mazeData";

const COLORS: Record<string, string> = {
  spike:  "#cc2222",
  fire:   "#cc5500",
  poison: "#22aa22",
};

export default function Obstacle({ data }: { data: ObstacleData }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((_: import("@react-three/fiber").RootState, delta: number) => {
    if (meshRef.current) {
      if (data.type === "fire") {
        // Whole flame group flickers via scale
        meshRef.current.rotation.y += delta * 1.5;
        const flicker = 1 + Math.sin(Date.now() * 0.012) * 0.12;
        meshRef.current.scale.set(flicker, flicker * 1.1, flicker);
      } else if (data.type === "poison") {
        meshRef.current.position.y =
          data.position[1] + Math.sin(Date.now() * 0.004) * 0.15;
      }
    }
  });

  const color = COLORS[data.type];

  return (
    <group ref={meshRef} position={data.position}>
      <pointLight color={color} intensity={0.5} distance={4} decay={2} />

      {/* ── SPIKE: unchanged ── */}
      {data.type === "spike" && (
        <group>
          {[0, 0.8, -0.8, 0.4, -0.4].map((x, i) => (
            <mesh key={i} position={[x, 0, i % 2 === 0 ? 0.3 : -0.3]}>
              <coneGeometry args={[0.15, 0.8, 4]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.3}
                metalness={0.8}
                roughness={0.3}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* ── FIRE: stacked flame cones, brightest at tip ── */}
      {data.type === "fire" && (
        <group>
          {/* Base ember glow — flat disc on floor */}
          <mesh position={[0, -0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.42, 12]} />
            <meshStandardMaterial
              color="#ff2200"
              emissive="#ff2200"
              emissiveIntensity={1.2}
              transparent
              opacity={0.5}
            />
          </mesh>

          {/* Outer large flame — dark orange, wide base */}
          <mesh position={[0, 0.1, 0]}>
            <coneGeometry args={[0.42, 0.85, 8]} />
            <meshStandardMaterial
              color="#cc4400"
              emissive="#cc4400"
              emissiveIntensity={1.0}
              roughness={0.6}
              transparent
              opacity={0.85}
            />
          </mesh>

          {/* Mid flame — orange */}
          <mesh position={[0, 0.35, 0]}>
            <coneGeometry args={[0.28, 0.7, 7]} />
            <meshStandardMaterial
              color="#ff6600"
              emissive="#ff6600"
              emissiveIntensity={1.3}
              roughness={0.5}
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Inner flame — yellow-hot tip */}
          <mesh position={[0, 0.55, 0]}>
            <coneGeometry args={[0.14, 0.55, 6]} />
            <meshStandardMaterial
              color="#ffdd00"
              emissive="#ffdd00"
              emissiveIntensity={1.8}
              roughness={0.3}
              transparent
              opacity={0.9}
            />
          </mesh>

          {/* Bright core tip */}
          <mesh position={[0, 0.75, 0]}>
            <coneGeometry args={[0.06, 0.28, 5]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffaa"
              emissiveIntensity={2.5}
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>
      )}

      {/* ── POISON: green orb + orbit ring + drip drops below ── */}
      {data.type === "poison" && (
        <group>
          {/* Main orb */}
          <mesh>
            <sphereGeometry args={[0.38, 12, 12]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.6}
              transparent
              opacity={0.75}
              roughness={0.2}
            />
          </mesh>

          {/* Inner bright core */}
          <mesh>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial
              color="#88ff44"
              emissive="#88ff44"
              emissiveIntensity={1.2}
              transparent
              opacity={0.6}
            />
          </mesh>

          {/* Orbit ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.58, 0.06, 6, 14]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
              transparent
              opacity={0.45}
            />
          </mesh>

          {/* Tilted second orbit ring */}
          <mesh rotation={[Math.PI / 3, 0.4, 0]}>
            <torusGeometry args={[0.52, 0.04, 5, 12]} />
            <meshStandardMaterial
              color="#44ff44"
              emissive="#44ff44"
              emissiveIntensity={0.4}
              transparent
              opacity={0.35}
            />
          </mesh>

          {/* Drip drops — small elongated spheres hanging below */}
          {[
            { x:  0.18, y: -0.52, z:  0.05, s: 0.07 },
            { x: -0.12, y: -0.60, z:  0.10, s: 0.055 },
            { x:  0.05, y: -0.68, z: -0.08, s: 0.045 },
          ].map((d, i) => (
            <mesh key={i} position={[d.x, d.y, d.z]} scale={[1, 1.8, 1]}>
              <sphereGeometry args={[d.s, 6, 6]} />
              <meshStandardMaterial
                color="#44ff44"
                emissive="#44ff44"
                emissiveIntensity={0.8}
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}