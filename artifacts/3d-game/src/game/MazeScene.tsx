import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
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

const keyMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "back", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
];

function SceneContent() {
  const { collectibles, obstacles, collectedIds, gameState } = useGameStore();

  if (gameState === "menu") return null;

  return (
    <>
      <ambientLight intensity={0.4} color="#ffffff" />
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
      <Player />
    </>
  );
}

export default function MazeScene() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a0015" }}>
      <KeyboardControls map={keyMap}>
        <Canvas
          camera={{ fov: 75, near: 0.1, far: 100, position: [0, 1.6, 0] }}
          style={{ width: "100%", height: "100%" }}
        >
          <SceneContent />
        </Canvas>
        <HUD />
        <GameUI />
      </KeyboardControls>
    </div>
  );
}
