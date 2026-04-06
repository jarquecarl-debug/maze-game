import { useGameStore } from "./useGameStore";

export default function GameUI() {
  const { gameState, score, timeElapsed, startGame, resetGame } = useGameStore();

  const minutes = Math.floor(timeElapsed / 60);
  const seconds = Math.floor(timeElapsed % 60);
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  if (gameState === "playing") {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(255,255,255,0.5)",
          fontSize: "14px",
          fontFamily: "'Segoe UI', sans-serif",
          pointerEvents: "none",
          zIndex: 100,
          textAlign: "center",
        }}
      >
        Click to lock mouse | WASD to move | Find the portal to escape
      </div>
    );
  }

  return (
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
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "500px",
          padding: "40px",
        }}
      >
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
                margin: "0 0 40px 0",
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
              <div
                style={{
                  color: "#aaa",
                  fontSize: "14px",
                  lineHeight: "2",
                }}
              >
                <span style={{ color: "#ffd700" }}>Gems</span> = 50 pts |{" "}
                <span style={{ color: "#ffd700" }}>Coins</span> = 10 pts |{" "}
                <span style={{ color: "#00ffff" }}>Stars</span> = 100 pts
                <br />
                <span style={{ color: "#ff4444" }}>Spikes</span>,{" "}
                <span style={{ color: "#ff6600" }}>Fire</span>,{" "}
                <span style={{ color: "#44ff44" }}>Poison</span> will hurt you
                <br />
                Use <span style={{ color: "#fff" }}>WASD</span> to move,{" "}
                <span style={{ color: "#fff" }}>Mouse</span> to look
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
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 0 40px rgba(119, 0, 255, 0.6)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 0 30px rgba(119, 0, 255, 0.4)";
              }}
            >
              Start Game
            </button>
          </>
        )}

        {gameState === "won" && (
          <>
            <h1
              style={{
                color: "#00ff88",
                fontSize: "48px",
                fontWeight: "bold",
                margin: "0 0 16px 0",
                textShadow: "0 0 40px rgba(0, 255, 136, 0.5)",
              }}
            >
              YOU ESCAPED!
            </h1>
            <div
              style={{
                background: "rgba(0, 255, 136, 0.1)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "32px",
                border: "1px solid rgba(0, 255, 136, 0.2)",
              }}
            >
              <div style={{ color: "#ffd700", fontSize: "32px", fontWeight: "bold", marginBottom: "8px" }}>
                {score} Points
              </div>
              <div style={{ color: "#aaa", fontSize: "16px" }}>
                Time: {timeStr}
              </div>
            </div>
            <button
              onClick={startGame}
              style={{
                background: "linear-gradient(135deg, #00ff88, #00aaff)",
                color: "#000",
                border: "none",
                padding: "14px 40px",
                fontSize: "18px",
                fontWeight: "bold",
                borderRadius: "12px",
                cursor: "pointer",
                marginRight: "12px",
                letterSpacing: "1px",
              }}
            >
              Play Again
            </button>
            <button
              onClick={resetGame}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "14px 40px",
                fontSize: "18px",
                borderRadius: "12px",
                cursor: "pointer",
                letterSpacing: "1px",
              }}
            >
              Menu
            </button>
          </>
        )}

        {gameState === "lost" && (
          <>
            <h1
              style={{
                color: "#ff3333",
                fontSize: "48px",
                fontWeight: "bold",
                margin: "0 0 16px 0",
                textShadow: "0 0 40px rgba(255, 51, 51, 0.5)",
              }}
            >
              GAME OVER
            </h1>
            <div
              style={{
                background: "rgba(255, 51, 51, 0.1)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "32px",
                border: "1px solid rgba(255, 51, 51, 0.2)",
              }}
            >
              <div style={{ color: "#ffd700", fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
                Score: {score}
              </div>
              <div style={{ color: "#aaa", fontSize: "16px" }}>
                Time survived: {timeStr}
              </div>
            </div>
            <button
              onClick={startGame}
              style={{
                background: "linear-gradient(135deg, #ff3333, #ff6600)",
                color: "#fff",
                border: "none",
                padding: "14px 40px",
                fontSize: "18px",
                fontWeight: "bold",
                borderRadius: "12px",
                cursor: "pointer",
                marginRight: "12px",
                letterSpacing: "1px",
              }}
            >
              Try Again
            </button>
            <button
              onClick={resetGame}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "14px 40px",
                fontSize: "18px",
                borderRadius: "12px",
                cursor: "pointer",
                letterSpacing: "1px",
              }}
            >
              Menu
            </button>
          </>
        )}
      </div>
    </div>
  );
}
