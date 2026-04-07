import { useEffect, useState } from "react";
import { useGameStore } from "./useGameStore";

function FullscreenBanner() {
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    try {
      setIsEmbedded(window.self !== window.top);
    } catch {
      setIsEmbedded(true);
    }
  }, []);

  if (!isEmbedded) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        background: "linear-gradient(90deg, #7700ff, #0077ff)",
        color: "#fff",
        textAlign: "center",
        padding: "10px 16px",
        fontFamily: "sans-serif",
        fontSize: "15px",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        boxShadow: "0 2px 20px rgba(0,0,0,0.5)",
      }}
    >
      <span>Controls require the full game window</span>
      <a
        href={window.location.href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: "#fff",
          color: "#7700ff",
          borderRadius: 8,
          padding: "6px 18px",
          fontWeight: 700,
          fontSize: 14,
          textDecoration: "none",
          letterSpacing: 0.5,
          whiteSpace: "nowrap",
        }}
      >
        Open Full Game ↗
      </a>
    </div>
  );
}

export default function GameUI() {
  const { gameState, score, timeElapsed, startGame, resetGame } = useGameStore();

  const minutes = Math.floor(timeElapsed / 60);
  const seconds = Math.floor(timeElapsed % 60);
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  if (gameState === "playing") {
    return (
      <>
        <FullscreenBanner />
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "rgba(255,255,255,0.5)",
            fontSize: "14px",
            fontFamily: "sans-serif",
            pointerEvents: "none",
            zIndex: 100,
            textAlign: "center",
          }}
        >
          WASD / arrows to move · Click &amp; drag to look · Reach the glowing portal
        </div>
      </>
    );
  }

  return (
    <>
      <FullscreenBanner />
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          background:
            gameState === "menu"
              ? "linear-gradient(135deg, #0a0015 0%, #1a0a2e 50%, #0d001a 100%)"
              : "rgba(0, 0, 0, 0.85)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "500px", padding: "40px" }}>
          {gameState === "menu" && (
            <>
              <h1
                style={{
                  color: "#fff",
                  fontSize: "48px",
                  fontWeight: "bold",
                  margin: "0 0 8px 0",
                  textShadow: "0 0 40px rgba(119, 0, 255, 0.6)",
                }}
              >
                MAZE RUNNER
              </h1>
              <p
                style={{
                  color: "#7b68ee",
                  fontSize: "16px",
                  margin: "0 0 32px 0",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                }}
              >
                Find the portal. Collect treasures. Survive.
              </p>
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "32px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  textAlign: "left",
                }}
              >
                <div style={{ color: "#aaa", fontSize: "14px", lineHeight: "2" }}>
                  <span style={{ color: "#ff88ff" }}>Gems</span> = 50 pts ·{" "}
                  <span style={{ color: "#ffd700" }}>Coins</span> = 10 pts ·{" "}
                  <span style={{ color: "#00ffff" }}>Stars</span> = 100 pts
                  <br />
                  <span style={{ color: "#ff4444" }}>Spikes</span>,{" "}
                  <span style={{ color: "#ff6600" }}>Fire</span>,{" "}
                  <span style={{ color: "#44ff44" }}>Poison</span> will hurt you
                  <br />
                  <span style={{ color: "#fff" }}>WASD</span> / arrows to move ·{" "}
                  <span style={{ color: "#fff" }}>Click &amp; drag</span> to look
                </div>
              </div>
              <button
                onClick={startGame}
                style={{
                  background: "linear-gradient(135deg, #7700ff, #00aaff)",
                  color: "#fff",
                  border: "none",
                  padding: "16px 48px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  borderRadius: "12px",
                  cursor: "pointer",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  boxShadow: "0 0 30px rgba(119, 0, 255, 0.4)",
                }}
              >
                Start Game
              </button>
            </>
          )}

          {gameState === "won" && (
            <>
              <h1 style={{ color: "#00ff88", fontSize: "48px", fontWeight: "bold", margin: "0 0 16px 0", textShadow: "0 0 40px rgba(0,255,136,0.5)" }}>
                YOU ESCAPED!
              </h1>
              <div style={{ background: "rgba(0,255,136,0.1)", borderRadius: "12px", padding: "20px", marginBottom: "32px", border: "1px solid rgba(0,255,136,0.2)" }}>
                <div style={{ color: "#ffd700", fontSize: "32px", fontWeight: "bold", marginBottom: "8px" }}>{score} Points</div>
                <div style={{ color: "#aaa", fontSize: "16px" }}>Time: {timeStr}</div>
              </div>
              <button onClick={startGame} style={{ background: "linear-gradient(135deg,#00ff88,#00aaff)", color: "#000", border: "none", padding: "14px 40px", fontSize: "18px", fontWeight: "bold", borderRadius: "12px", cursor: "pointer", marginRight: "12px" }}>
                Play Again
              </button>
              <button onClick={resetGame} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "14px 40px", fontSize: "18px", borderRadius: "12px", cursor: "pointer" }}>
                Menu
              </button>
            </>
          )}

          {gameState === "lost" && (
            <>
              <h1 style={{ color: "#ff3333", fontSize: "48px", fontWeight: "bold", margin: "0 0 16px 0", textShadow: "0 0 40px rgba(255,51,51,0.5)" }}>
                GAME OVER
              </h1>
              <div style={{ background: "rgba(255,51,51,0.1)", borderRadius: "12px", padding: "20px", marginBottom: "32px", border: "1px solid rgba(255,51,51,0.2)" }}>
                <div style={{ color: "#ffd700", fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>Score: {score}</div>
                <div style={{ color: "#aaa", fontSize: "16px" }}>Time survived: {timeStr}</div>
              </div>
              <button onClick={startGame} style={{ background: "linear-gradient(135deg,#ff3333,#ff6600)", color: "#fff", border: "none", padding: "14px 40px", fontSize: "18px", fontWeight: "bold", borderRadius: "12px", cursor: "pointer", marginRight: "12px" }}>
                Try Again
              </button>
              <button onClick={resetGame} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "14px 40px", fontSize: "18px", borderRadius: "12px", cursor: "pointer" }}>
                Menu
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
