import { useGameStore } from "./useGameStore";

export default function HUD() {
  const { score, health, timeElapsed, collectibles, collectedIds, gameState } = useGameStore();

  if (gameState !== "playing") return null;

  const minutes = Math.floor(timeElapsed / 60);
  const seconds = Math.floor(timeElapsed % 60);
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  const totalItems = collectibles.length;
  const collected = collectedIds.size;

  const healthColor =
    health > 60 ? "#00ff88" : health > 30 ? "#ffaa00" : "#ff3333";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        pointerEvents: "none",
        zIndex: 100,
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          background: "rgba(0, 0, 0, 0.7)",
          borderRadius: "12px",
          padding: "12px 20px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          style={{
            color: "#ffd700",
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "4px",
          }}
        >
          {score} pts
        </div>
        <div style={{ color: "#aaa", fontSize: "13px" }}>
          Items: {collected}/{totalItems}
        </div>
      </div>

      <div
        style={{
          background: "rgba(0, 0, 0, 0.7)",
          borderRadius: "12px",
          padding: "12px 20px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          textAlign: "center",
        }}
      >
        <div style={{ color: "#fff", fontSize: "20px", fontWeight: "bold" }}>
          {timeStr}
        </div>
        <div style={{ color: "#aaa", fontSize: "12px" }}>TIME</div>
      </div>

      <div
        style={{
          background: "rgba(0, 0, 0, 0.7)",
          borderRadius: "12px",
          padding: "12px 20px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          minWidth: "120px",
        }}
      >
        <div
          style={{
            color: healthColor,
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "6px",
          }}
        >
          {health}%
        </div>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            borderRadius: "4px",
            height: "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: healthColor,
              height: "100%",
              width: `${health}%`,
              transition: "width 0.3s, background 0.3s",
              borderRadius: "4px",
              boxShadow: `0 0 8px ${healthColor}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
