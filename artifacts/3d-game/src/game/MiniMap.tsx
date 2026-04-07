import { useEffect, useRef } from "react";
import { MAZE_LAYOUT, MAZE_SIZE, getKeyCell, getExitPosition, getKeyPosition } from "./mazeData";
import { sharedState } from "./sharedState";
import { useGameStore } from "./useGameStore";

const MAP_SIZE = 160;

export default function MiniMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const hasKey = useGameStore((s) => s.hasKey);
  const level = useGameStore((s) => s.level);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cellPx = MAP_SIZE / MAZE_SIZE;
    const [kr, kc] = getKeyCell();
    const exitRow = MAZE_SIZE - 2;
    const exitCol = MAZE_SIZE - 2;

    function draw() {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, MAP_SIZE, MAP_SIZE);

      // Background
      ctx.fillStyle = "rgba(0,0,0,0.85)";
      ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);

      // Draw maze cells
      for (let r = 0; r < MAZE_SIZE; r++) {
        for (let c = 0; c < MAZE_SIZE; c++) {
          ctx.fillStyle = MAZE_LAYOUT[r][c] === 1 ? "#1a0030" : "#2a1040";
          ctx.fillRect(c * cellPx, r * cellPx, cellPx, cellPx);
        }
      }

      // Exit portal
      ctx.fillStyle = "#7700ff";
      ctx.beginPath();
      ctx.arc(
        (exitCol + 0.5) * cellPx,
        (exitRow + 0.5) * cellPx,
        cellPx * 0.6,
        0, Math.PI * 2
      );
      ctx.fill();

      // Key (if not collected)
      if (!hasKey) {
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(
          (kc + 0.5) * cellPx,
          (kr + 0.5) * cellPx,
          cellPx * 0.5,
          0, Math.PI * 2
        );
        ctx.fill();
      }

      // Enemy
      if (sharedState.enemyRow >= 0) {
        ctx.fillStyle = "#ff2200";
        ctx.beginPath();
        ctx.arc(
          (sharedState.enemyCol + 0.5) * cellPx,
          (sharedState.enemyRow + 0.5) * cellPx,
          cellPx * 0.55,
          0, Math.PI * 2
        );
        ctx.fill();
      }

      // Player
      const pr = sharedState.playerRow;
      const pc = sharedState.playerCol;
      const px = (pc + 0.5) * cellPx;
      const py = (pr + 0.5) * cellPx;

      ctx.fillStyle = "#00ffff";
      ctx.beginPath();
      ctx.arc(px, py, cellPx * 0.65, 0, Math.PI * 2);
      ctx.fill();

      // Direction triangle
      const angle = -sharedState.bearing;
      const len = cellPx * 1.2;
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px + Math.sin(angle) * len, py - Math.cos(angle) * len);
      ctx.lineTo(px + Math.sin(angle - 2.5) * len * 0.5, py - Math.cos(angle - 2.5) * len * 0.5);
      ctx.lineTo(px + Math.sin(angle + 2.5) * len * 0.5, py - Math.cos(angle + 2.5) * len * 0.5);
      ctx.closePath();
      ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [hasKey, level]);

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      right: 20,
      zIndex: 100,
      borderRadius: 8,
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.2)",
      boxShadow: "0 0 20px rgba(119,0,255,0.4)",
    }}>
      <canvas
        ref={canvasRef}
        width={MAP_SIZE}
        height={MAP_SIZE}
        style={{ display: "block" }}
      />
    </div>
  );
}
