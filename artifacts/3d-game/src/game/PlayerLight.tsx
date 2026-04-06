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
      intensity={12}
      distance={18}
      decay={2}
      color="#ffffff"
    />
  );
}
