import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "./useGameStore";
import {
  MAZE_LAYOUT, MAZE_SIZE, CELL_SIZE,
  getPlayerStart, getExitPosition, getKeyPosition,
} from "./mazeData";
import { sharedState } from "./sharedState";
import { playCollect, playDamage, playFootstep, playKey } from "./sounds";

const BASE_SPEED = 6;
const SPRINT_SPEED = 10;
const PLAYER_RADIUS = 0.45;
const COLLECT_RADIUS = 1.5;
const OBSTACLE_RADIUS = 1.2;
const KEY_RADIUS = 1.8;
const EXIT_RADIUS = 2.2;
const EYE_HEIGHT = 1.6;
const STAMINA_DRAIN = 40;
const STAMINA_REGEN = 25;
const TIME_SYNC = 0.25;

function worldToGrid(x: number, z: number): [number, number] {
  const col = Math.floor((x + (MAZE_SIZE * CELL_SIZE) / 2) / CELL_SIZE);
  const row = Math.floor((z + (MAZE_SIZE * CELL_SIZE) / 2) / CELL_SIZE);
  return [row, col];
}

function canMoveTo(x: number, z: number): boolean {
  return [[x + PLAYER_RADIUS, z + PLAYER_RADIUS], [x + PLAYER_RADIUS, z - PLAYER_RADIUS],
    [x - PLAYER_RADIUS, z + PLAYER_RADIUS], [x - PLAYER_RADIUS, z - PLAYER_RADIUS]]
    .every(([cx, cz]) => {
      const [r, c] = worldToGrid(cx, cz);
      if (r < 0 || r >= MAZE_SIZE || c < 0 || c >= MAZE_SIZE) return false;
      return MAZE_LAYOUT[r][c] === 0;
    });
}

interface PlayerProps {
  onLockChange: (locked: boolean) => void;
}

export default function Player({ onLockChange }: PlayerProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const posRef = useRef(new THREE.Vector3());
  const keysRef = useRef({ forward: false, back: false, left: false, right: false, sprint: false });
  const localCollectedRef = useRef(new Set<string>());
  const keyCollectedRef = useRef(false);
  const damageCooldown = useRef(0);
  const timeSyncAccum = useRef(0);
  const footstepTimer = useRef(0);
  const noKeyNotifCooldown = useRef(0);
  const prevDamageTime = useRef(0);

  const gameState = useGameStore((s) => s.gameState);

  useEffect(() => {
    if (gameState === "playing") {
      const [sx, , sz] = getPlayerStart();
      posRef.current.set(sx, EYE_HEIGHT, sz);
      camera.position.set(sx, EYE_HEIGHT, sz);
      camera.rotation.set(0, 0, 0);
      keysRef.current = { forward: false, back: false, left: false, right: false, sprint: false };
      localCollectedRef.current = new Set();
      keyCollectedRef.current = false;
      damageCooldown.current = 0;
      timeSyncAccum.current = 0;
      footstepTimer.current = 0;
      noKeyNotifCooldown.current = 0;
      sharedState.stamina = 100;
    }
    if (gameState !== "playing") controlsRef.current?.unlock();
  }, [gameState, camera]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp")    keysRef.current.forward = true;
      if (e.code === "KeyS" || e.code === "ArrowDown")  keysRef.current.back    = true;
      if (e.code === "KeyA" || e.code === "ArrowLeft")  keysRef.current.left    = true;
      if (e.code === "KeyD" || e.code === "ArrowRight") keysRef.current.right   = true;
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") keysRef.current.sprint = true;
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp")    keysRef.current.forward = false;
      if (e.code === "KeyS" || e.code === "ArrowDown")  keysRef.current.back    = false;
      if (e.code === "KeyA" || e.code === "ArrowLeft")  keysRef.current.left    = false;
      if (e.code === "KeyD" || e.code === "ArrowRight") keysRef.current.right   = false;
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") keysRef.current.sprint = false;
    };
    document.addEventListener("keydown", onDown);
    document.addEventListener("keyup", onUp);
    return () => { document.removeEventListener("keydown", onDown); document.removeEventListener("keyup", onUp); };
  }, []);

  useFrame((_, delta) => {
    if (gameState !== "playing") return;
    const store = useGameStore.getState();

    damageCooldown.current = Math.max(0, damageCooldown.current - delta);
    noKeyNotifCooldown.current = Math.max(0, noKeyNotifCooldown.current - delta);
    footstepTimer.current = Math.max(0, footstepTimer.current - delta);

    const locked = controlsRef.current?.isLocked ?? false;
    let moving = false;

    if (locked) {
      // === Sprint & stamina ===
      const wantSprint = keysRef.current.sprint && sharedState.stamina > 5;
      if (wantSprint) {
        sharedState.stamina = Math.max(0, sharedState.stamina - STAMINA_DRAIN * delta);
      } else {
        sharedState.stamina = Math.min(100, sharedState.stamina + STAMINA_REGEN * delta);
      }
      const speed = wantSprint ? SPRINT_SPEED : BASE_SPEED;

      // === Movement ===
      const fwd = new THREE.Vector3();
      camera.getWorldDirection(fwd);
      fwd.y = 0; fwd.normalize();
      const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
      const move = new THREE.Vector3();
      if (keysRef.current.forward) move.add(fwd);
      if (keysRef.current.back)    move.sub(fwd);
      if (keysRef.current.left)    move.sub(right);
      if (keysRef.current.right)   move.add(right);

      if (move.length() > 0) {
        move.normalize().multiplyScalar(speed * delta);
        const nx = posRef.current.x + move.x;
        const nz = posRef.current.z + move.z;
        if (canMoveTo(nx, posRef.current.z)) posRef.current.x = nx;
        if (canMoveTo(posRef.current.x, nz)) posRef.current.z = nz;
        moving = true;
      }

      camera.position.set(posRef.current.x, EYE_HEIGHT, posRef.current.z);

      // === Footsteps ===
      if (moving && footstepTimer.current <= 0) {
        playFootstep();
        footstepTimer.current = wantSprint ? 0.28 : 0.42;
      }
    }

    // === Update shared state ===
    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    sharedState.bearing = (Math.atan2(dir.x, -dir.z) * 180 / Math.PI + 360) % 360;
    const [pr, pc] = worldToGrid(posRef.current.x, posRef.current.z);
    sharedState.playerRow = pr;
    sharedState.playerCol = pc;
    sharedState.playerWorldX = posRef.current.x;
    sharedState.playerWorldZ = posRef.current.z;

    // === Collect items ===
    for (const c of store.collectibles) {
      if (localCollectedRef.current.has(c.id)) continue;
      const dx = posRef.current.x - c.position[0];
      const dz = posRef.current.z - c.position[2];
      if (dx * dx + dz * dz < COLLECT_RADIUS * COLLECT_RADIUS) {
        localCollectedRef.current.add(c.id);
        store.collectItem(c.id, c.points);
        playCollect(c.type);
        const labels: Record<string, string> = { gem: "💎 +50", coin: "🪙 +10", star: "⭐ +100" };
        store.addNotification(labels[c.type] || `+${c.points}`, "#ffd700");
      }
    }

    // === Collect key ===
    if (!keyCollectedRef.current && !store.hasKey) {
      const kp = getKeyPosition();
      const dx = posRef.current.x - kp[0];
      const dz = posRef.current.z - kp[2];
      if (dx * dx + dz * dz < KEY_RADIUS * KEY_RADIUS) {
        keyCollectedRef.current = true;
        store.collectKey();
        playKey();
      }
    }

    // === Obstacle damage ===
    if (damageCooldown.current <= 0) {
      for (const o of store.obstacles) {
        const dx = posRef.current.x - o.position[0];
        const dz = posRef.current.z - o.position[2];
        if (dx * dx + dz * dz < OBSTACLE_RADIUS * OBSTACLE_RADIUS) {
          store.takeDamage(o.damage);
          playDamage();
          const labels: Record<string, string> = { spike: "🗡 Spike!", fire: "🔥 Fire!", poison: "☠ Poison!" };
          store.addNotification(labels[o.type] || "Ouch!", "#ff4444");
          damageCooldown.current = 1.5;
          break;
        }
      }
    }

    // === Exit check ===
    const ep = getExitPosition();
    const ex = posRef.current.x - ep[0];
    const ez = posRef.current.z - ep[2];
    if (ex * ex + ez * ez < EXIT_RADIUS * EXIT_RADIUS) {
      if (store.hasKey) {
        store.winGame();
        return;
      } else if (noKeyNotifCooldown.current <= 0) {
        store.addNotification("🔒 Find the golden key first!", "#ff8800");
        noKeyNotifCooldown.current = 3;
      }
    }

    // === Time sync ===
    timeSyncAccum.current += delta;
    if (timeSyncAccum.current >= TIME_SYNC) {
      store.updateTime(timeSyncAccum.current);
      timeSyncAccum.current = 0;
    }
  });

  if (gameState !== "playing") return null;
  return (
    <PointerLockControls
      ref={controlsRef}
      onLock={() => onLockChange(true)}
      onUnlock={() => onLockChange(false)}
    />
  );
}
