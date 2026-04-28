import { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import MazeWalls from "./MazeWalls";
import Floor from "./Floor";
import Player from "./Player";
import Collectible from "./Collectible";
import Obstacle from "./Obstacle";
import ExitPortal from "./ExitPortal";
import PlayerLight from "./PlayerLight";
import Enemy from "./Enemy";
import KeyItem from "./KeyItem";
import HUD from "./HUD";
import GameUI from "./GameUI";
import MobileControls from "./MobileControls";
import { useGameStore } from "./useGameStore";
import { getEnemyStartCell } from "./mazeData";
import { sharedState } from "./sharedState";

function SceneContent({ onLockChange }: { onLockChange: (v: boolean) => void }) {
  const { collectibles, obstacles, collectedIds, gameState, mazeVersion } = useGameStore();

  if (gameState === "menu" || gameState === "highscores") return null;

  const [enemyRow, enemyCol] = getEnemyStartCell();

  return (
    <>
      <ambientLight intensity={0.35} />
      <fog attach="fog" args={["#110022", 18, 55]} />

      <group key={mazeVersion}>
        <Floor />
        <MazeWalls />
        <ExitPortal />
        <KeyItem />
      </group>

      {collectibles.map((c) => (
        <Collectible key={`${mazeVersion}-${c.id}`} data={c} collected={collectedIds.has(c.id)} />
      ))}
      {obstacles.map((o) => (
        <Obstacle key={`${mazeVersion}-${o.id}`} data={o} />
      ))}

      <Enemy key={`enemy-${mazeVersion}`} startRow={enemyRow} startCol={enemyCol} />
      <PlayerLight />
      <Player onLockChange={onLockChange} />
    </>
  );
}

// Detect mobile once at module load time — synchronous, no render-cycle delay
const IS_MOBILE = typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);
sharedState.isMobile = IS_MOBILE;

export default function MazeScene() {
  const [locked, setLocked] = useState(false);
  const hasEverLocked = useRef(false);
  const { gameState } = useGameStore();

  const handleLockChange = (v: boolean) => {
    setLocked(v);
    if (v) hasEverLocked.current = true;
  };

  // Reset hasEverLocked when a new game starts from menu
  useEffect(() => {
    if (gameState === "menu") hasEverLocked.current = false;
  }, [gameState]);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a0015" }}>
      <Canvas
        camera={{ fov: 75, near: 0.1, far: 120 }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <SceneContent onLockChange={handleLockChange} />
      </Canvas>

      <HUD />
      <GameUI />

      {/* Mobile touch controls */}
      {IS_MOBILE && gameState === "playing" && <MobileControls />}

      {/* Click-to-lock overlay — only shown once at the very start, never after pausing */}
      {!IS_MOBILE && gameState === "playing" && !locked && !hasEverLocked.current && (
        <div
          style={{
            position: "fixed", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.65)", zIndex: 150, cursor: "pointer",
            fontFamily: "sans-serif",
          }}
          onClick={() => document.querySelector("canvas")?.requestPointerLock()}
        >
          <div style={{
            background: "rgba(255,255,255,0.08)",
            border: "2px solid rgba(255,255,255,0.25)",
            borderRadius: 16, padding: "32px 48px", textAlign: "center",
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🖱</div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Click to Play</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
              WASD · Shift sprint · Space dash · Mouse look
            </div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 8 }}>Esc to pause</div>
          </div>
        </div>
      )}
    </div>
  );
}