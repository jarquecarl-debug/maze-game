import { useRef, useCallback, useEffect } from "react";
import { inputState } from "./Player";
import { useGameStore } from "./useGameStore";

const BTN = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 56,
  height: 56,
  borderRadius: 12,
  background: "rgba(255,255,255,0.18)",
  border: "2px solid rgba(255,255,255,0.35)",
  color: "#fff",
  fontSize: 22,
  userSelect: "none" as const,
  cursor: "pointer",
  touchAction: "none" as const,
  WebkitUserSelect: "none" as const,
};

function MoveButton({ label, onDown, onUp }: { label: string; onDown: () => void; onUp: () => void }) {
  return (
    <div
      style={BTN}
      onMouseDown={(e) => { e.preventDefault(); onDown(); }}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      onTouchStart={(e) => { e.preventDefault(); onDown(); }}
      onTouchEnd={onUp}
    >
      {label}
    </div>
  );
}

export default function InputOverlay() {
  const { gameState } = useGameStore();
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const SENSITIVITY = 0.005;

  const onLookDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture(e.pointerId);
  }, []);

  const onLookMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    inputState.yawDelta += dx * SENSITIVITY;
    inputState.pitchDelta += dy * SENSITIVITY;
  }, []);

  const onLookUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Also capture keyboard events on the overlay div itself
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameState !== "playing") return;
    const el = overlayRef.current;
    if (!el) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") inputState.forward = true;
      if (e.code === "KeyS" || e.code === "ArrowDown") inputState.back = true;
      if (e.code === "KeyA" || e.code === "ArrowLeft") inputState.left = true;
      if (e.code === "KeyD" || e.code === "ArrowRight") inputState.right = true;
      e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") inputState.forward = false;
      if (e.code === "KeyS" || e.code === "ArrowDown") inputState.back = false;
      if (e.code === "KeyA" || e.code === "ArrowLeft") inputState.left = false;
      if (e.code === "KeyD" || e.code === "ArrowRight") inputState.right = false;
    };

    // Listen on both the element and document to maximise capture
    el.addEventListener("keydown", onKeyDown);
    el.addEventListener("keyup", onKeyUp);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      el.removeEventListener("keydown", onKeyDown);
      el.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [gameState]);

  if (gameState !== "playing") return null;

  return (
    <>
      {/* Full-screen drag zone for looking — sits behind the D-pad */}
      <div
        ref={overlayRef}
        tabIndex={0}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10,
          touchAction: "none",
          outline: "none",
          cursor: isDragging.current ? "grabbing" : "grab",
        }}
        onPointerDown={onLookDown}
        onPointerMove={onLookMove}
        onPointerUp={onLookUp}
        onPointerCancel={onLookUp}
      />

      {/* D-Pad for movement — sits above the drag zone */}
      <div
        style={{
          position: "fixed",
          bottom: 36,
          left: 36,
          zIndex: 20,
          display: "grid",
          gridTemplateColumns: "56px 56px 56px",
          gridTemplateRows: "56px 56px 56px",
          gap: 6,
        }}
      >
        <div />
        <MoveButton label="▲" onDown={() => { inputState.forward = true; }} onUp={() => { inputState.forward = false; }} />
        <div />
        <MoveButton label="◀" onDown={() => { inputState.left = true; }} onUp={() => { inputState.left = false; }} />
        <div style={{ ...BTN, background: "rgba(255,255,255,0.07)", border: "2px solid rgba(255,255,255,0.12)", fontSize: 14, color: "rgba(255,255,255,0.4)" }}>●</div>
        <MoveButton label="▶" onDown={() => { inputState.right = true; }} onUp={() => { inputState.right = false; }} />
        <div />
        <MoveButton label="▼" onDown={() => { inputState.back = true; }} onUp={() => { inputState.back = false; }} />
        <div />
      </div>

      {/* Hint */}
      <div style={{
        position: "fixed",
        bottom: 20,
        right: 24,
        zIndex: 20,
        color: "rgba(255,255,255,0.45)",
        fontSize: 13,
        fontFamily: "sans-serif",
        textAlign: "right",
        pointerEvents: "none",
      }}>
        Drag anywhere to look · WASD or D-pad to move
      </div>
    </>
  );
}
