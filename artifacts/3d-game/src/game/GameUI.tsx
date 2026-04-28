import { useEffect, useState } from "react";
import { useGameStore, type HighScore } from "./useGameStore";

function FullscreenBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { setShow(window.self !== window.top); } catch { setShow(true); }
  }, []);
  if (!show) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
      background: "linear-gradient(90deg,#7700ff,#0077ff)",
      color: "#fff", textAlign: "center", padding: "10px 16px",
      fontFamily: "sans-serif", fontSize: 15, fontWeight: 600,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
      boxShadow: "0 2px 20px rgba(0,0,0,0.5)",
    }}>
      <span>Controls require the full game window</span>
      <a href={window.location.href} target="_blank" rel="noopener noreferrer"
        style={{
          background: "#fff", color: "#7700ff", borderRadius: 8,
          padding: "6px 18px", fontWeight: 700, fontSize: 14,
          textDecoration: "none", whiteSpace: "nowrap",
        }}>
        Open Full Game ↗
      </a>
    </div>
  );
}

function DamageFlash() {
  const lastDamageTime = useGameStore((s) => s.lastDamageTime);
  const [opacity, setOpacity] = useState(0);
  useEffect(() => {
    if (!lastDamageTime) return;
    setOpacity(0.55);
    const t = setTimeout(() => setOpacity(0), 400);
    return () => clearTimeout(t);
  }, [lastDamageTime]);
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 300,
      transition: "opacity 0.4s ease-out",
      opacity,
      background: "radial-gradient(ellipse at center, transparent 40%, rgba(255,0,0,0.7) 100%)",
      border: "4px solid rgba(255,0,0,0.6)",
    }} />
  );
}

function Notifications() {
  const notifications = useGameStore((s) => s.notifications);
  return (
    <div style={{
      position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)",
      zIndex: 500, pointerEvents: "none",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
    }}>
      {notifications.map((n) => (
        <div key={n.id} style={{
          background: "rgba(0,0,0,0.85)", border: `1px solid ${n.color}`,
          borderRadius: 10, padding: "8px 20px",
          color: n.color, fontFamily: "sans-serif",
          fontSize: 16, fontWeight: 700,
          boxShadow: `0 0 20px ${n.color}55`,
          animation: "slideIn 0.2s ease-out",
        }}>
          {n.text}
        </div>
      ))}
    </div>
  );
}

function HighScoresScreen() {
  const { highScores, resetGame } = useGameStore();
  return (
    <div style={{
      position: "fixed", inset: 0, background: "linear-gradient(135deg,#0a0015,#1a0a2e)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "sans-serif", zIndex: 200,
    }}>
      <div style={{ textAlign: "center", maxWidth: 500, width: "100%", padding: 32 }}>
        <h1 style={{ color: "#ffd700", fontSize: 40, fontWeight: 700, margin: "0 0 24px 0" }}>🏆 HIGH SCORES</h1>
        {highScores.length === 0 ? (
          <p style={{ color: "#666" }}>No scores yet. Play to set a record!</p>
        ) : (
          <div style={{ marginBottom: 28 }}>
            {highScores.map((s, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: i === 0 ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${i === 0 ? "rgba(255,215,0,0.3)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 10, padding: "10px 20px", marginBottom: 8,
              }}>
                <span style={{ color: i === 0 ? "#ffd700" : "#888", fontSize: 18, fontWeight: 700 }}>
                  #{i + 1}
                </span>
                <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{s.score} pts</span>
                <span style={{ color: "#7700ff", fontSize: 14 }}>Lvl {s.level}</span>
                <span style={{ color: s.won ? "#00ff88" : "#ff4444", fontSize: 13 }}>
                  {s.won ? "✓ Won" : "✗ Lost"}
                </span>
                <span style={{ color: "#555", fontSize: 12 }}>{s.date}</span>
              </div>
            ))}
          </div>
        )}
        <button onClick={resetGame} style={{
          background: "rgba(255,255,255,0.1)", color: "#fff",
          border: "1px solid rgba(255,255,255,0.2)", padding: "12px 36px",
          fontSize: 16, borderRadius: 10, cursor: "pointer",
        }}>← Back to Menu</button>
      </div>
    </div>
  );
}

export default function GameUI() {
  const { gameState, score, timeElapsed, level, startGame, resetGame, nextLevel, resumeGame } = useGameStore();
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = Math.floor(timeElapsed % 60);
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  if (gameState === "playing") {
    return (
      <>
        <FullscreenBanner />
        <DamageFlash />
        <Notifications />
        <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(-12px);} to { opacity:1; transform:translateY(0);} }`}</style>
      </>
    );
  }

  if (gameState === "paused") {
    return (
      <div style={{
        position: "fixed", inset: 0, display: "flex", alignItems: "center",
        justifyContent: "center", zIndex: 200,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        fontFamily: "sans-serif",
      }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>⏸</div>
          <h1 style={{ color: "#fff", fontSize: 42, fontWeight: 900, margin: "0 0 8px 0" }}>PAUSED</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 32 }}>
            Press Esc or click Resume to continue
          </p>
          <button
            onClick={() => {
              resumeGame();
              document.querySelector("canvas")?.requestPointerLock();
            }}
            style={{
              background: "linear-gradient(135deg,#7700ff,#00aaff)", color: "#fff",
              border: "none", padding: "14px 48px", fontSize: 18,
              fontWeight: 700, borderRadius: 12, cursor: "pointer",
              letterSpacing: 2, textTransform: "uppercase",
              boxShadow: "0 0 30px rgba(119,0,255,0.4)",
              marginBottom: 12, display: "block", width: "100%",
            }}
          >
            ▶ Resume
          </button>
          <button
            onClick={resetGame}
            style={{
              background: "rgba(255,255,255,0.08)", color: "#aaa",
              border: "1px solid rgba(255,255,255,0.15)", padding: "12px 32px",
              fontSize: 15, borderRadius: 12, cursor: "pointer", width: "100%",
            }}
          >
            ✕ Quit to Menu
          </button>
        </div>
      </div>
    );
  }

  if (gameState === "highscores") return <HighScoresScreen />;

  return (
    <>
      <FullscreenBanner />
      <div style={{
        position: "fixed", inset: 0, display: "flex", alignItems: "center",
        justifyContent: "center", zIndex: 200,
        background: gameState === "menu"
          ? "linear-gradient(135deg,#0a0015 0%,#1a0a2e 50%,#0d001a 100%)"
          : "rgba(0,0,0,0.88)",
        fontFamily: "sans-serif",
      }}>
        <div style={{ textAlign: "center", maxWidth: 520, padding: 40 }}>

          {gameState === "menu" && (
            <>
              <h1 style={{ color: "#fff", fontSize: 52, fontWeight: 900, margin: "0 0 4px 0", textShadow: "0 0 40px rgba(119,0,255,0.7)" }}>
                MAZE RUNNER
              </h1>
              <p style={{ color: "#7b68ee", fontSize: 14, letterSpacing: 4, textTransform: "uppercase", marginBottom: 28 }}>
                Find the key. Reach the portal. Survive.
              </p>
              <div style={{
                background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "16px 20px",
                marginBottom: 28, border: "1px solid rgba(255,255,255,0.08)", textAlign: "left",
              }}>
                <div style={{ color: "#aaa", fontSize: 13, lineHeight: 2.4 }}>
                <span style={{ color: "#ffd700", fontSize: 16 }}>🗝</span>
                &nbsp;Collect the <span style={{ color: "#ffd700", fontWeight: 700 }}>golden key</span> to unlock the exit portal<br />

                {/* Gem icon — purple diamond */}
                <svg width="14" height="14" viewBox="0 0 14 14" style={{ display:"inline-block", verticalAlign:"middle", marginRight:4 }}>
                  <polygon points="7,0 13,5 7,14 1,5" fill="#9900ff" opacity="0.9"/>
                  <polygon points="7,0 13,5 7,5 1,5" fill="#cc44ff" opacity="0.6"/>
                </svg>
                <span style={{ color: "#cc88ff" }}>Gems</span> +50 &nbsp;·&nbsp;

                {/* Coin icon — gold circle */}
                <svg width="14" height="14" viewBox="0 0 14 14" style={{ display:"inline-block", verticalAlign:"middle", marginRight:4 }}>
                  <circle cx="7" cy="7" r="6.5" fill="#ccaa00"/>
                  <circle cx="7" cy="7" r="5.2" fill="#ffcc22"/>
                  <circle cx="7" cy="7" r="4" fill="#ffdd55"/>
                  <ellipse cx="5.5" cy="5" rx="1.5" ry="2.5" fill="rgba(255,255,255,0.18)" transform="rotate(-30 5.5 5)"/>
                </svg>
                <span style={{ color: "#ffd700" }}>Coins</span> +10 &nbsp;·&nbsp;

                {/* Star icon — cyan 6-pointed */}
                <svg width="14" height="14" viewBox="0 0 14 14" style={{ display:"inline-block", verticalAlign:"middle", marginRight:4 }}>
                  {(() => {
                    const pts = Array.from({length:12}, (_,i) => {
                      const a = (i * Math.PI) / 6 - Math.PI/2;
                      const r = i%2===0 ? 7 : 3.2;
                      return `${7 + Math.cos(a)*r},${7 + Math.sin(a)*r}`;
                    }).join(" ");
                    return <polygon points={pts} fill="#00aacc"/>;
                  })()}
                </svg>
                <span style={{ color: "#00ffff" }}>Stars</span> +100<br />

                👾 &nbsp;An <span style={{ color: "#ff4444" }}>enemy</span> hunts you — run from it!<br />
                ⌨ &nbsp;WASD to move · <strong style={{ color: "#fff" }}>Shift</strong> to sprint · <strong style={{ color: "#fff" }}>Space</strong> to dash · Mouse to look
              </div>
              </div>
              <button onClick={startGame} style={{
                background: "linear-gradient(135deg,#7700ff,#00aaff)", color: "#fff",
                border: "none", padding: "16px 48px", fontSize: 20,
                fontWeight: 700, borderRadius: 12, cursor: "pointer",
                letterSpacing: 2, textTransform: "uppercase",
                boxShadow: "0 0 30px rgba(119,0,255,0.4)", marginBottom: 14, display: "block", width: "100%",
              }}>▶ START GAME</button>
              <button onClick={() => useGameStore.setState({ gameState: "highscores" })} style={{
                background: "transparent", color: "#888",
                border: "1px solid rgba(255,255,255,0.12)", padding: "10px 24px",
                fontSize: 14, borderRadius: 10, cursor: "pointer",
              }}>🏆 High Scores</button>
            </>
          )}

          {gameState === "won" && (
            <>
              <div style={{ fontSize: 56, marginBottom: 8 }}>🎉</div>
              <h1 style={{ color: "#00ff88", fontSize: 44, fontWeight: 900, margin: "0 0 4px 0", textShadow: "0 0 40px rgba(0,255,136,0.5)" }}>
                LEVEL {level} COMPLETE!
              </h1>
              <p style={{ color: "#aaa", fontSize: 14, marginBottom: 20 }}>+{level * 500} level bonus!</p>
              <div style={{
                background: "rgba(0,255,136,0.08)", borderRadius: 12, padding: 20,
                border: "1px solid rgba(0,255,136,0.2)", marginBottom: 24,
              }}>
                <div style={{ color: "#ffd700", fontSize: 32, fontWeight: 700 }}>{score} pts</div>
                <div style={{ color: "#aaa", fontSize: 15, marginTop: 4 }}>Time: {timeStr}</div>
              </div>
              <button onClick={nextLevel} style={{
                background: "linear-gradient(135deg,#00ff88,#00aaff)", color: "#000",
                border: "none", padding: "14px 40px", fontSize: 18, fontWeight: 700,
                borderRadius: 12, cursor: "pointer", marginRight: 12,
              }}>→ Level {level + 1}</button>
              <button onClick={resetGame} style={{
                background: "rgba(255,255,255,0.08)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.15)", padding: "14px 32px",
                fontSize: 16, borderRadius: 12, cursor: "pointer",
              }}>Menu</button>
            </>
          )}

          {gameState === "lost" && (
            <>
              <div style={{ fontSize: 56, marginBottom: 8 }}>💀</div>
              <h1 style={{ color: "#ff3333", fontSize: 44, fontWeight: 900, margin: "0 0 16px 0", textShadow: "0 0 40px rgba(255,51,51,0.5)" }}>
                GAME OVER
              </h1>
              <div style={{
                background: "rgba(255,51,51,0.08)", borderRadius: 12, padding: 20,
                border: "1px solid rgba(255,51,51,0.2)", marginBottom: 24,
              }}>
                <div style={{ color: "#ffd700", fontSize: 28, fontWeight: 700 }}>Score: {score}</div>
                <div style={{ color: "#aaa", fontSize: 14, marginTop: 4 }}>Reached Level {level} · {timeStr}</div>
              </div>
              <button onClick={startGame} style={{
                background: "linear-gradient(135deg,#ff3333,#ff6600)", color: "#fff",
                border: "none", padding: "14px 40px", fontSize: 18, fontWeight: 700,
                borderRadius: 12, cursor: "pointer", marginRight: 12,
              }}>↺ Try Again</button>
              <button onClick={resetGame} style={{
                background: "rgba(255,255,255,0.08)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.15)", padding: "14px 32px",
                fontSize: 16, borderRadius: 12, cursor: "pointer",
              }}>Menu</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}