/// <reference types="@react-three/fiber" />
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getExitPosition } from "./mazeData";
import { useGameStore } from "./useGameStore";

export default function ExitPortal() {
  const voidRef      = useRef<THREE.Mesh>(null);
  const photonRing1  = useRef<THREE.Mesh>(null);
  const photonRing2  = useRef<THREE.Mesh>(null);
  const photonRing3  = useRef<THREE.Mesh>(null);
  const discFrontRef = useRef<THREE.Mesh>(null);
  const discBackRef  = useRef<THREE.Mesh>(null);
  const lensArcLRef  = useRef<THREE.Mesh>(null);
  const lensArcRRef  = useRef<THREE.Mesh>(null);
  const lockRef      = useRef<THREE.Group>(null);

  const hasKey = useGameStore((s) => s.hasKey);
  const pos    = getExitPosition();

  // Accretion disc — half-torus for front arc (lower semicircle)
  const discFrontGeo = useMemo(() => {
    const curve = new THREE.TorusGeometry(2.2, 0.13, 8, 64, Math.PI);
    return curve;
  }, []);

  // Full torus for back arc (dimmer, behind void)
  const discBackGeo = useMemo(() => new THREE.TorusGeometry(2.2, 0.07, 6, 64), []);

  // Lensing arcs — thin curved tubes on left/right sides
  const lensGeo = useMemo(() => new THREE.TorusGeometry(1.08, 0.025, 6, 32, Math.PI * 0.55), []);

  useFrame(() => {
    const t = Date.now() * 0.001;

    // Photon ring — slow pulse wobble
    if (photonRing1.current) {
      photonRing1.current.rotation.z = Math.sin(t * 0.4) * 0.02;
    }
    if (photonRing2.current) {
      photonRing2.current.rotation.z = Math.sin(t * 0.3 + 1) * 0.015;
    }

    // Accretion disc — slow spin around Z (equatorial)
    if (discFrontRef.current) {
      discFrontRef.current.rotation.z -= 0.004;
    }
    if (discBackRef.current) {
      discBackRef.current.rotation.z += 0.003;
    }

    // Lensing arcs breathe slightly
    if (lensArcLRef.current) {
      lensArcLRef.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.015);
    }
    if (lensArcRRef.current) {
      lensArcRRef.current.scale.setScalar(1 + Math.sin(t * 1.2 + Math.PI) * 0.015);
    }

    // Void center — very slow pulse
    if (voidRef.current) {
      const s = 1 + Math.sin(t * 0.8) * (hasKey ? 0.03 : 0.01);
      voidRef.current.scale.setScalar(s);
    }

    // Lock icon bob
    if (lockRef.current) {
      lockRef.current.position.y = Math.sin(t * 1.5) * 0.08;
    }
  });

  // Colors — active vs dormant
  const purpleRing   = hasKey ? "#cc88ff" : "#443344";
  const purpleEmit   = hasKey ? "#7700ff" : "#221122";
  const cyanDisc     = hasKey ? "#00ddff" : "#223333";
  const cyanEmit     = hasKey ? "#0099cc" : "#111a1a";
  const ringIntensity = hasKey ? 1.8 : 0.2;
  const discIntensity = hasKey ? 1.5 : 0.15;
  const voidColor    = hasKey ? "#030008" : "#050505";

  return (
    <group position={[pos[0], 1.2, pos[2]]}>

      {/* Lights */}
      {hasKey && (
        <>
          <pointLight color="#7700ff" intensity={3.5} distance={12} decay={2} />
          <pointLight color="#00aaff" intensity={2.0} distance={8}  decay={2} position={[0, 0, 0.5]} />
          <pointLight color="#aa44ff" intensity={1.5} distance={16} decay={2} position={[0, -1, 0]} />
        </>
      )}
      {!hasKey && (
        <pointLight color="#332233" intensity={0.4} distance={5} decay={2} />
      )}

      {/* === PHOTON RING — purple, layered === */}
      {/* Outer soft bloom */}
      <mesh ref={photonRing1}>
        <torusGeometry args={[1.08, 0.28, 12, 80]} />
        <meshStandardMaterial
          color={purpleEmit}
          emissive={purpleEmit}
          emissiveIntensity={hasKey ? 0.6 : 0.1}
          transparent opacity={hasKey ? 0.35 : 0.1}
          roughness={1} metalness={0}
        />
      </mesh>
      {/* Mid ring */}
      <mesh ref={photonRing2}>
        <torusGeometry args={[1.08, 0.12, 12, 80]} />
        <meshStandardMaterial
          color={purpleRing}
          emissive={purpleEmit}
          emissiveIntensity={ringIntensity}
          roughness={0.05} metalness={0.9}
        />
      </mesh>
      {/* Inner bright edge */}
      <mesh ref={photonRing3}>
        <torusGeometry args={[1.08, 0.04, 8, 80]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={purpleRing}
          emissiveIntensity={hasKey ? 2.5 : 0.2}
          roughness={0} metalness={1}
        />
      </mesh>

      {/* === VOID CENTER — dark sphere === */}
      <mesh ref={voidRef}>
        <sphereGeometry args={[1.02, 32, 32]} />
        <meshStandardMaterial
          color={voidColor}
          emissive={voidColor}
          emissiveIntensity={0.1}
          roughness={1} metalness={0}
          transparent opacity={0.98}
        />
      </mesh>

      {/* === ACCRETION DISC BACK — full torus, dim, behind void === */}
      <mesh ref={discBackRef} rotation={[Math.PI / 2, 0, 0]}>
        <primitive object={discBackGeo} />
        <meshStandardMaterial
          color={cyanDisc}
          emissive={cyanEmit}
          emissiveIntensity={hasKey ? 0.6 : 0.08}
          transparent opacity={hasKey ? 0.5 : 0.15}
          roughness={0.1} metalness={0.8}
        />
      </mesh>

      {/* Re-occlude: second void layer to hide back disc center overlap */}
      <mesh>
        <sphereGeometry args={[1.01, 32, 32]} />
        <meshStandardMaterial color={voidColor} roughness={1} transparent opacity={0.99} />
      </mesh>

      {/* === ACCRETION DISC FRONT — bright lower arc === */}
      {/* Outer soft glow */}
      <mesh rotation={[Math.PI / 2, 0, Math.PI]}>
        <primitive object={new THREE.TorusGeometry(2.2, 0.28, 6, 64, Math.PI)} />
        <meshStandardMaterial
          color={cyanEmit}
          emissive={cyanEmit}
          emissiveIntensity={hasKey ? 0.5 : 0.05}
          transparent opacity={hasKey ? 0.22 : 0.06}
          roughness={1}
        />
      </mesh>
      {/* Main bright arc */}
      <mesh ref={discFrontRef} rotation={[Math.PI / 2, 0, Math.PI]}>
        <primitive object={discFrontGeo} />
        <meshStandardMaterial
          color={cyanDisc}
          emissive={cyanEmit}
          emissiveIntensity={discIntensity}
          roughness={0.05} metalness={0.9}
        />
      </mesh>
      {/* Bright white core line */}
      <mesh rotation={[Math.PI / 2, 0, Math.PI]}>
        <torusGeometry args={[2.2, 0.025, 4, 64, Math.PI]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={cyanDisc}
          emissiveIntensity={hasKey ? 3.0 : 0.1}
          roughness={0} metalness={1}
        />
      </mesh>

      {/* === GRAVITATIONAL LENSING ARCS — sides === */}
      {/* Left arc */}
      <mesh ref={lensArcLRef} rotation={[0, 0, -Math.PI * 0.72]} position={[-1.08, 0, 0.01]}>
        <primitive object={lensGeo} />
        <meshStandardMaterial
          color={hasKey ? "#cc88ff" : "#333333"}
          emissive={hasKey ? "#7700ff" : "#111111"}
          emissiveIntensity={hasKey ? 1.0 : 0.1}
          transparent opacity={hasKey ? 0.5 : 0.15}
          roughness={0.1}
        />
      </mesh>
      {/* Right arc */}
      <mesh ref={lensArcRRef} rotation={[0, 0, Math.PI * 0.28]} position={[1.08, 0, 0.01]}>
        <primitive object={lensGeo} />
        <meshStandardMaterial
          color={hasKey ? "#cc88ff" : "#333333"}
          emissive={hasKey ? "#7700ff" : "#111111"}
          emissiveIntensity={hasKey ? 1.0 : 0.1}
          transparent opacity={hasKey ? 0.5 : 0.15}
          roughness={0.1}
        />
      </mesh>

      {/* === VOID STARS — small spheres scattered inside === */}
      {hasKey && (
        <>
          {[[-0.3,-0.25],[0.2,0.35],[0.5,-0.42],[-0.52,0.18],[0.12,-0.65],[-0.18,0.58],[0.68,0.15]].map(([x,y],i) => (
            <mesh key={i} position={[x, y, -0.3 - i * 0.06]}>
              <sphereGeometry args={[0.013 + (i % 3) * 0.005, 4, 4]} />
              <meshStandardMaterial color="#ffffff" emissive="#aaaaff" emissiveIntensity={3} />
            </mesh>
          ))}
        </>
      )}

      {/* === DORMANT — lock icon (box + shackle) === */}
      {!hasKey && (
        <group ref={lockRef} position={[0, 0, 1.05]}>
          {/* Lock body */}
          <mesh position={[0, -0.08, 0]}>
            <boxGeometry args={[0.32, 0.26, 0.06]} />
            <meshStandardMaterial color="#886600" emissive="#553300" emissiveIntensity={0.6} roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Shackle — torus top half */}
          <mesh position={[0, 0.1, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.1, 0.03, 6, 16, Math.PI]} />
            <meshStandardMaterial color="#ccaa00" emissive="#886600" emissiveIntensity={0.8} roughness={0.2} metalness={1} />
          </mesh>
          {/* Keyhole dot */}
          <mesh position={[0, -0.06, 0.035]}>
            <cylinderGeometry args={[0.03, 0.03, 0.02, 8]} />
            <meshStandardMaterial color="#221100" roughness={1} />
          </mesh>
        </group>
      )}

      {/* Floor glow pool */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.48, 0]}>
        <circleGeometry args={[1.4, 32]} />
        <meshStandardMaterial
          color={hasKey ? "#7700ff" : "#222222"}
          emissive={hasKey ? "#7700ff" : "#111111"}
          emissiveIntensity={hasKey ? 0.8 : 0.1}
          transparent opacity={hasKey ? 0.25 : 0.08}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}