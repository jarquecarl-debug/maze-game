/// <reference types="@react-three/fiber" />
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CollectibleData } from "./mazeData";

interface CollectibleProps {
  data: CollectibleData;
  collected: boolean;
}

const COLORS: Record<string, string> = {
  gem:  "#9900ff",
  coin: "#ccaa00",
  star: "#00aacc",
};

const EMISSIVE_INTENSITY: Record<string, number> = {
  gem:  1.2,
  coin: 0.7,
  star: 1.0,
};

function makeSixPointStarShape(outerR: number, innerR: number): THREE.Shape {
  const shape = new THREE.Shape();
  const points = 6;
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

function makeDiamondGeometry(waistR: number, totalH: number): THREE.BufferGeometry {
  const crownH    = totalH * 0.32;
  const pavilionH = totalH * 0.68;
  const crownR    = waistR * 0.72;
  const segments  = 8;

  const positions: number[] = [];
  const indices:   number[] = [];

  const ang = (i: number) => (i / segments) * Math.PI * 2;

  for (let i = 0; i < segments; i++)
    positions.push(Math.cos(ang(i)) * crownR, crownH, Math.sin(ang(i)) * crownR);

  for (let i = 0; i < segments; i++)
    positions.push(Math.cos(ang(i)) * waistR, 0, Math.sin(ang(i)) * waistR);

  const topIdx = positions.length / 3;
  positions.push(0, crownH, 0);

  const tipIdx = positions.length / 3;
  positions.push(0, -pavilionH, 0);

  for (let i = 0; i < segments; i++) {
    const a = i;
    const b = (i + 1) % segments;
    indices.push(topIdx, b, a);
  }

  for (let i = 0; i < segments; i++) {
    const a  = i;
    const b  = (i + 1) % segments;
    const a2 = segments + i;
    const b2 = segments + (i + 1) % segments;
    indices.push(a, b, b2);
    indices.push(a, b2, a2);
  }

  for (let i = 0; i < segments; i++) {
    const a = segments + i;
    const b = segments + (i + 1) % segments;
    indices.push(a, b, tipIdx);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export default function Collectible({ data, collected }: CollectibleProps) {
  const meshRef = useRef<THREE.Mesh & THREE.Group>(null);
  const lightRef  = useRef<THREE.PointLight>(null);

  const starGeometry = useMemo(() => {
    const shape = makeSixPointStarShape(0.40, 0.18);
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.10,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize:      0.025,
      bevelSegments:  2,
    });
  }, []);

  const diamondGeometry = useMemo(() => makeDiamondGeometry(0.32, 0.72), []);

  useFrame((_: import("@react-three/fiber").RootState, delta: number) => {
    if (!collected) {
      const bob = 0.5 + Math.sin(Date.now() * 0.003) * 0.12;

      if (meshRef.current) {
        meshRef.current.rotation.y += delta * (data.type === "coin" ? 2.5 : 2);
        meshRef.current.position.y = bob;
      }
      if (lightRef.current) {
        lightRef.current.intensity = 0.6 + Math.sin(Date.now() * 0.005) * 0.2;
      }
    }
  });

  if (collected) return null;

  const color             = COLORS[data.type];
  const emissiveIntensity = EMISSIVE_INTENSITY[data.type];

  return (
    <group position={data.position}>
      <pointLight
        ref={lightRef}
        color={color}
        intensity={0.6}
        distance={5}
        decay={2}
      />

      {data.type === "gem" && (
        <mesh ref={meshRef} geometry={diamondGeometry}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissiveIntensity}
            roughness={0.05}
            metalness={0.2}
            transparent
            opacity={0.92}
          />
        </mesh>
      )}

      {data.type === "coin" && (
        <group ref={meshRef as React.RefObject<THREE.Group>}>
          {/* Main disc — face-on (Y-axis spin, flat face toward player) */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.07, 48]} />
            <meshStandardMaterial
              color="#ffcc22"
              emissive="#ffaa00"
              emissiveIntensity={0.7}
              roughness={0.05}
              metalness={1.0}
            />
          </mesh>
          {/* Outer rim — slightly larger, darker gold */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.05, 48]} />
            <meshStandardMaterial
              color="#cc8800"
              emissive="#aa6600"
              emissiveIntensity={0.4}
              roughness={0.1}
              metalness={1.0}
            />
          </mesh>
          
          {/* Specular highlight cap — bright center disc */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.036, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.001, 32]} />
            <meshStandardMaterial
              color="#fff4aa"
              emissive="#ffe066"
              emissiveIntensity={0.5}
              roughness={0.0}
              metalness={1.0}
              transparent
              opacity={0.45}
            />
          </mesh>
        </group>
      )}

      {data.type === "star" && (
        <mesh
          ref={meshRef}
          geometry={starGeometry}
          position={[0, 0, 0.05]}
        >
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