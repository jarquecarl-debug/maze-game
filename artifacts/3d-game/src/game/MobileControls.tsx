import { useEffect, useRef } from "react";
import { sharedState } from "./sharedState";

const JOYSTICK_RADIUS = 52;
const LOOK_SENSITIVITY = 0.004;
const PITCH_LIMIT = Math.PI / 3; // 60°

export default function MobileControls() {
  const joyBaseRef  = useRef<HTMLDivElement>(null);
  const joyKnobRef  = useRef<HTMLDivElement>(null);
  const joyTouchId  = useRef<number | null>(null);
  const joyOrigin   = useRef({ x: 0, y: 0 });

  const lookTouchId  = useRef<number | null>(null);
  const lookPrev     = useRef({ x: 0, y: 0 });

  // Accumulated pitch so we can clamp it
  const pitchRef = useRef(0);

  // ── Joystick (left half) ────────────────────────────────────────────────
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (joyTouchId.current !== null) continue;
        const isLeftSide = t.clientX < window.innerWidth * 0.5;
        if (!isLeftSide) continue;

        joyTouchId.current = t.identifier;
        joyOrigin.current  = { x: t.clientX, y: t.clientY };

        // Position the joystick base where the finger lands
        if (joyBaseRef.current) {
          joyBaseRef.current.style.left   = `${t.clientX - JOYSTICK_RADIUS}px`;
          joyBaseRef.current.style.top    = `${t.clientY - JOYSTICK_RADIUS}px`;
          joyBaseRef.current.style.opacity = "1";
        }
        if (joyKnobRef.current) {
          joyKnobRef.current.style.transform = "translate(-50%,-50%)";
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier !== joyTouchId.current) continue;
        const dx = t.clientX - joyOrigin.current.x;
        const dy = t.clientY - joyOrigin.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const clamped = Math.min(dist, JOYSTICK_RADIUS);
        const angle   = Math.atan2(dy, dx);
        const kx = Math.cos(angle) * clamped;
        const ky = Math.sin(angle) * clamped;

        if (joyKnobRef.current) {
          joyKnobRef.current.style.transform =
            `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
        }

        sharedState.mobileJoyX = kx / JOYSTICK_RADIUS;
        sharedState.mobileJoyY = ky / JOYSTICK_RADIUS;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier !== joyTouchId.current) continue;
        joyTouchId.current = null;
        sharedState.mobileJoyX = 0;
        sharedState.mobileJoyY = 0;
        if (joyBaseRef.current)  joyBaseRef.current.style.opacity  = "0";
        if (joyKnobRef.current)  joyKnobRef.current.style.transform = "translate(-50%,-50%)";
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove",  onTouchMove,  { passive: true });
    document.addEventListener("touchend",   onTouchEnd,   { passive: true });
    document.addEventListener("touchcancel",onTouchEnd,   { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove",  onTouchMove);
      document.removeEventListener("touchend",   onTouchEnd);
      document.removeEventListener("touchcancel",onTouchEnd);
    };
  }, []);

  // ── Look drag (right half) ───────────────────────────────────────────────
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (lookTouchId.current !== null) continue;
        const isRightSide = t.clientX >= window.innerWidth * 0.5;
        if (!isRightSide) continue;
        lookTouchId.current = t.identifier;
        lookPrev.current    = { x: t.clientX, y: t.clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier !== lookTouchId.current) continue;
        const dx = t.clientX - lookPrev.current.x;
        const dy = t.clientY - lookPrev.current.y;
        lookPrev.current = { x: t.clientX, y: t.clientY };

        // Accumulate — Player.tsx will consume and reset each frame
        sharedState.mobileLookDX += dx * LOOK_SENSITIVITY;

        const newPitch = pitchRef.current + dy * LOOK_SENSITIVITY;
        const clamped  = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, newPitch));
        sharedState.mobileLookDY += clamped - pitchRef.current;
        pitchRef.current = clamped;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier !== lookTouchId.current) continue;
        lookTouchId.current = null;
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove",  onTouchMove,  { passive: true });
    document.addEventListener("touchend",   onTouchEnd,   { passive: true });
    document.addEventListener("touchcancel",onTouchEnd,   { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove",  onTouchMove);
      document.removeEventListener("touchend",   onTouchEnd);
      document.removeEventListener("touchcancel",onTouchEnd);
    };
  }, []);

  return (
    <>
      {/* Joystick base — hidden until touched */}
      <div
        ref={joyBaseRef}
        style={{
          position: "fixed", zIndex: 400,
          width: JOYSTICK_RADIUS * 2, height: JOYSTICK_RADIUS * 2,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          border: "2px solid rgba(255,255,255,0.25)",
          opacity: 0,
          pointerEvents: "none",
          transition: "opacity 0.1s",
        }}
      >
        {/* Knob */}
        <div
          ref={joyKnobRef}
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: 38, height: 38, borderRadius: "50%",
            background: "rgba(255,255,255,0.35)",
            border: "2px solid rgba(255,255,255,0.6)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Sprint button — bottom right */}
      <div
        onTouchStart={() => { sharedState.mobileSprint = true; }}
        onTouchEnd={()   => { sharedState.mobileSprint = false; }}
        style={{
          position: "fixed", bottom: 90, right: 28, zIndex: 400,
          width: 64, height: 64, borderRadius: "50%",
          background: "rgba(0,200,255,0.18)",
          border: "2px solid rgba(0,200,255,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#00ccff", fontSize: 11, fontWeight: 700,
          fontFamily: "sans-serif", letterSpacing: 1,
          userSelect: "none", touchAction: "none",
        }}
      >
        SPRINT
      </div>

      {/* Right side look hint label */}
      <div style={{
        position: "fixed", bottom: 24, right: 28, zIndex: 400,
        color: "rgba(255,255,255,0.25)", fontSize: 11,
        fontFamily: "sans-serif", pointerEvents: "none",
      }}>
        drag to look
      </div>
    </>
  );
}