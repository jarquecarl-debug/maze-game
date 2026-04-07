import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getExitPosition } from "./mazeData";
import { useGameStore } from "./useGameStore";

export default function ExitPortal() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const hasKey = useGameStore((s) => s.hasKey);
  const pos = getExitPosition();

  useFrame(() => {
    const t = Date.now() * 0.001;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += hasKey ? 0.025 : 0.008;
      ring1Ref.current.rotation.x = Math.sin(t) * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= hasKey ? 0.018 : 0.005;
      ring2Ref.current.rotation.y = Math.cos(t) * 0.3;
    }
    if (glowRef.current) {
      const s = 1 + Math.sin(t * 2) * (hasKey ? 0.15 : 0.05);
      glowRef.current.scale.setScalar(s);
    }
  });

  const unlocked = hasKey;
  const color1 = unlocked ? "#7700ff" : "#553355";
  const color2 = unlocked ? "#00aaff" : "#334455";
  const emissive1 = unlocked ? 3 : 0.5;
  const emissive2 = unlocked ? 3 : 0.5;
  const lightIntensity = unlocked ? 4 : 1;

  return (
    <group position={[pos[0], 2, pos[2]]}>
      {unlocked && <pointLight color="#7700ff" intensity={lightIntensity} distance={12} decay={2} />}
      {unlocked && <pointLight color="#00aaff" intensity={2} distance={8} decay={2} position={[0, 1, 0]} />}
      {!unlocked && <pointLight color="#553355" intensity={1} distance={6} decay={2} />}

      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.2, 0.12, 16, 32]} />
        <meshStandardMaterial color={color1} emissive={color1} emissiveIntensity={emissive1} roughness={0.1} metalness={0.9} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[0.9, 0.08, 16, 32]} />
        <meshStandardMaterial color={color2} emissive={color2} emissiveIntensity={emissive2} roughness={0.1} metalness={0.9} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial
          color={unlocked ? "#5500cc" : "#220022"}
          emissive={unlocked ? "#5500cc" : "#110011"}
          emissiveIntensity={unlocked ? 2 : 0.3}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Lock icon when locked */}
      {!unlocked && (
        <mesh position={[0, 0, 0.7]}>
          <boxGeometry args={[0.3, 0.3, 0.05]} />
          <meshStandardMaterial color="#ffd700" emissive="#aa7700" emissiveIntensity={1} />
        </mesh>
      )}
    </group>
  );
}
