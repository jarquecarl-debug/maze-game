import { useEffect, useRef, useState } from "react";
import { useGameStore } from "./useGameStore";
import { sharedState } from "./sharedState";
import { isMuted, toggleMute } from "./sounds";
import MiniMap from "./MiniMap";

function Compass() {
  const labelRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    function tick() {
      if (labelRef.current) {
        const idx = Math.round(sharedState.bearing / 45) % 8;
        labelRef.current.textContent = DIRS[idx];
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div style={{
      background: "rgba(0,0,0,0.7)",
      borderRadius: 12,
      padding: "8px 16px",
      border: "1px solid rgba(255,255,255,0.1)",
      textAlign: "center",
      minWidth: 50,
    }}>
      <div ref={labelRef} style={{ color: "#00ffff", fontSize: 22, fontWeight: 700 }}>N</div>
      <div style={{ color: "#555", fontSize: 11 }}>COMPASS</div>
    </div>
  );
}

function StaminaBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    function tick() {
      if (barRef.current) {
        const pct = sharedState.stamina;
        barRef.current.style.width = `${pct}%`;
        barRef.current.style.background = pct > 50 ? "#00ff88" : pct > 20 ? "#ffaa00" : "#ff3333";
        barRef.current.style.boxShadow = `0 0 6px ${pct > 50 ? "#00ff88" : pct > 20 ? "#ffaa00" : "#ff3333"}`;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ color: "#aaa", fontSize: 11, marginBottom: 3 }}>SPRINT</div>
      <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 4, height: 5, width: 100, overflow: "hidden" }}>
        <div ref={barRef} style={{ height: "100%", width: "100%", borderRadius: 4, transition: "background 0.3s" }} />
      </div>
    </div>
  );
}

function DashIndicator() {
  const barRef  = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const rafRef  = useRef(0);

  useEffect(() => {
    function tick() {
      const cd  = sharedState.dashCooldown;
      const max = sharedState.dashMaxCooldown;
      const pct = Math.max(0, 1 - cd / max) * 100;
      const ready = cd <= 0;
      if (barRef.current) {
        barRef.current.style.width      = `${pct}%`;
        barRef.current.style.background = ready
          ? (sharedState.isDashing ? "#ffffff" : "#00ccff")
          : "#334466";
        barRef.current.style.boxShadow  = ready ? "0 0 6px #00ccff" : "none";
      }
      if (textRef.current) {
        textRef.current.textContent = ready ? "DASH  [Space]" : `DASH  ${cd.toFixed(1)}s`;
        textRef.current.style.color = ready ? "#00ccff" : "#445566";
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div style={{ marginTop: 8 }}>
      <div ref={textRef} style={{ fontSize: 11, marginBottom: 3, color: "#00ccff" }}>DASH  [Space]</div>
      <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 4, height: 5, width: 100, overflow: "hidden" }}>
        <div ref={barRef} style={{ height: "100%", width: "100%", borderRadius: 4, transition: "background 0.2s" }} />
      </div>
    </div>
  );
}

export default function HUD() {
  const { score, health, timeElapsed, collectibles, collectedIds, hasKey, level, gameState } = useGameStore();
  const [muted, setMuted] = useState(isMuted);

  const handleMuteToggle = () => {
    const nowMuted = toggleMute();
    setMuted(nowMuted);
  };

  if (gameState !== "playing") return null;

  const minutes = Math.floor(timeElapsed / 60);
  const seconds = Math.floor(timeElapsed % 60);
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  const healthColor = health > 60 ? "#00ff88" : health > 30 ? "#ffaa00" : "#ff3333";

  return (
    <>
      {/* Top bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0,
        padding: "14px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        pointerEvents: "none", zIndex: 100,
        fontFamily: "'Segoe UI', sans-serif",
      }}>
        {/* Left: score + key */}
        <div style={{
          background: "rgba(0,0,0,0.7)", borderRadius: 12, padding: "12px 18px",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ color: "#ffd700", fontSize: 22, fontWeight: 700 }}>{score} pts</div>
          <div style={{ color: "#aaa", fontSize: 12 }}>{collectedIds.size}/{collectibles.length} items</div>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 18 }}>{hasKey ? "🗝" : "🔒"}</span>
            <span style={{ color: hasKey ? "#ffd700" : "#666", fontSize: 12 }}>
              {hasKey ? "KEY" : "find key"}
            </span>
          </div>
        </div>

        {/* Center: time + level + compass */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{
            background: "rgba(0,0,0,0.7)", borderRadius: 12, padding: "10px 20px",
            border: "1px solid rgba(255,255,255,0.1)", textAlign: "center",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div>
              <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>{timeStr}</div>
              <div style={{ color: "#7700ff", fontSize: 12, letterSpacing: 2 }}>LVL {level}</div>
            </div>
            <button
              onClick={() => useGameStore.getState().pauseGame()}
              style={{
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 8, color: "#fff", fontSize: 18, cursor: "pointer",
                padding: "4px 10px", pointerEvents: "auto", lineHeight: 1,
              }}
              title="Pause (Esc)"
            >⏸</button>
          </div>
          <Compass />
        </div>

        {/* Right: health + stamina */}
        <div style={{
          background: "rgba(0,0,0,0.7)", borderRadius: 12, padding: "12px 18px",
          border: "1px solid rgba(255,255,255,0.1)", minWidth: 120,
        }}>
          <div style={{ color: healthColor, fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{health}%</div>
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 4, height: 6, overflow: "hidden" }}>
            <div style={{
              background: healthColor, height: "100%", width: `${health}%`,
              transition: "width 0.3s, background 0.3s", borderRadius: 4,
              boxShadow: `0 0 8px ${healthColor}`,
            }} />
          </div>
          <StaminaBar />
          <DashIndicator />
          <button
            onClick={handleMuteToggle}
            style={{
              marginTop: 10,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 6,
              color: muted ? "#ff4444" : "#aaa",
              fontSize: 16,
              cursor: "pointer",
              padding: "2px 8px",
              width: "100%",
              pointerEvents: "auto",
            }}
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
        </div>
      </div>

      {/* Crosshair */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none", zIndex: 100,
      }}>
        <div style={{ width: 2, height: 14, background: "rgba(255,255,255,0.7)", position: "absolute", top: -7, left: -1 }} />
        <div style={{ width: 14, height: 2, background: "rgba(255,255,255,0.7)", position: "absolute", top: -1, left: -7 }} />
      </div>

      {/* Minimap */}
      <MiniMap />

      {/* Hint */}
      <div style={{
        position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)",
        color: "rgba(255,255,255,0.4)", fontSize: 13,
        fontFamily: "sans-serif", pointerEvents: "none", zIndex: 100,
        textAlign: "center", whiteSpace: "nowrap",
      }}>
        WASD to move · Shift to sprint · Space to dash · Mouse to look · Esc to pause
      </div>
    </>
  );
}