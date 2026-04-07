import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import MazeWalls from "./MazeWalls";
import Floor from "./Floor";
import Player from "./Player";
import Collectible from "./Collectible";
import Obstacle from "./Obstacle";
import ExitPortal from "./ExitPortal";
import PlayerLight from "./PlayerLight";
import HUD from "./HUD";
import GameUI from "./GameUI";
import { useGameStore } from "./useGameStore";

function SceneContent({ onLockChange }: { onLockChange: (v: boolean) => void }) {
  const { collectibles, obstacles, collectedIds, gameState } = useGameStore();
  if (gameState === "menu") return null;
  return (
    <>
      <ambientLight intensity={0.4} />
      <fog attach="fog" args={["#110022", 18, 50]} />
      <Floor />
      <MazeWalls />
      <ExitPortal />
      {collectibles.map((c) => (
        <Collectible key={c.id} data={c} collected={collectedIds.has(c.id)} />
      ))}
      {obstacles.map((o) => (
        <Obstacle key={o.id} data={o} />
      ))}
      <PlayerLight />
      <Player onLockChange={onLockChange} />
    </>
  );
}

export default function MazeScene() {
  const [locked, setLocked] = useState(false);
  const { gameState } = useGameStore();

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a0015" }}>
      <Canvas
        camera={{ fov: 75, near: 0.1, far: 100 }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <SceneContent onLockChange={setLocked} />
      </Canvas>

      <HUD />
      <GameUI />

      {/* Click-to-lock overlay shown only when playing but not locked */}
      {gameState === "playing" && !locked && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
            zIndex: 150,
            cursor: "pointer",
            fontFamily: "sans-serif",
          }}
          onClick={() => {
            const canvas = document.querySelector("canvas");
            canvas?.requestPointerLock();
          }}
        >
          <div style={{
            background: "rgba(255,255,255,0.1)",
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: 16,
            padding: "32px 48px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🖱</div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Click to Play
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
              WASD / arrows to move · Mouse to look
            </div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 8 }}>
              Press Esc to pause
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
