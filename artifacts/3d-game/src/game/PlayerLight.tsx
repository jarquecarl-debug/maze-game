/// <reference types="@react-three/fiber" />
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function PlayerLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.copy(camera.position);
    }
  });

  return (
    <pointLight
      ref={lightRef}
      intensity={4}       // was 12 — much softer torch feel
      distance={14}       // was 18
      decay={2}
      color="#ffe8c0"     // warm lantern tint instead of pure white
    />
  );
}