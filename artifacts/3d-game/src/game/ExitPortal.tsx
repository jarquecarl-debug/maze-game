import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getExitPosition } from "./mazeData";

export default function ExitPortal() {
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const pos = getExitPosition();

  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.02;
      ringRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= 0.015;
      ring2Ref.current.rotation.y = Math.cos(Date.now() * 0.001) * 0.3;
    }
  });

  return (
    <group position={[pos[0], 2, pos[2]]}>
      <pointLight color="#7700ff" intensity={3} distance={10} decay={2} />
      <pointLight
        color="#00aaff"
        intensity={2}
        distance={8}
        decay={2}
        position={[0, 1, 0]}
      />
      <mesh ref={ringRef}>
        <torusGeometry args={[1.2, 0.12, 16, 32]} />
        <meshStandardMaterial
          color="#7700ff"
          emissive="#7700ff"
          emissiveIntensity={3}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[0.9, 0.08, 16, 32]} />
        <meshStandardMaterial
          color="#00aaff"
          emissive="#00aaff"
          emissiveIntensity={3}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial
          color="#5500cc"
          emissive="#5500cc"
          emissiveIntensity={2}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}
