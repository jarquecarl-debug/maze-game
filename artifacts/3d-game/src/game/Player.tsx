import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import type { PointerLockControls as PLCType } from "three/examples/jsm/controls/PointerLockControls.js";
import { useGameStore } from "./useGameStore";
import { MAZE_LAYOUT, CELL_SIZE, getExitPosition, getPlayerStart } from "./mazeData";

const MOVE_SPEED = 6;
const PLAYER_RADIUS = 0.45;
const COLLECT_RADIUS = 1.5;
const OBSTACLE_RADIUS = 1.2;
const EYE_HEIGHT = 1.6;

function worldToGrid(x: number, z: number): [number, number] {
  const cols = MAZE_LAYOUT[0].length;
  const rows = MAZE_LAYOUT.length;
  const col = Math.floor((x + (cols * CELL_SIZE) / 2) / CELL_SIZE);
  const row = Math.floor((z + (rows * CELL_SIZE) / 2) / CELL_SIZE);
  return [row, col];
}

function isWall(row: number, col: number): boolean {
  if (row < 0 || row >= MAZE_LAYOUT.length || col < 0 || col >= MAZE_LAYOUT[0].length) return true;
  return MAZE_LAYOUT[row][col] === 1;
}

function canMoveTo(x: number, z: number): boolean {
  const checks = [
    [x + PLAYER_RADIUS, z + PLAYER_RADIUS],
    [x + PLAYER_RADIUS, z - PLAYER_RADIUS],
    [x - PLAYER_RADIUS, z + PLAYER_RADIUS],
    [x - PLAYER_RADIUS, z - PLAYER_RADIUS],
  ];
  return checks.every(([cx, cz]) => {
    const [row, col] = worldToGrid(cx, cz);
    return !isWall(row, col);
  });
}

interface PlayerProps {
  onLockChange: (locked: boolean) => void;
}

export default function Player({ onLockChange }: PlayerProps) {
  const { camera } = useThree();
  const controlsRef = useRef<PLCType>(null);
  const posRef = useRef(new THREE.Vector3());
  const keysRef = useRef({ forward: false, back: false, left: false, right: false });
  const damageCooldown = useRef(0);

  const { gameState, collectibles, obstacles, collectedIds, collectItem, takeDamage, winGame, updateTime } = useGameStore();
  const exitPos = getExitPosition();

  // Place player at start when game begins
  useEffect(() => {
    if (gameState === "playing") {
      const [sx, , sz] = getPlayerStart();
      posRef.current.set(sx, EYE_HEIGHT, sz);
      camera.position.set(sx, EYE_HEIGHT, sz);
      camera.rotation.set(0, 0, 0);
      keysRef.current = { forward: false, back: false, left: false, right: false };
    }
    if (gameState !== "playing") {
      controlsRef.current?.unlock();
    }
  }, [gameState, camera]);

  // Keyboard listeners attached directly to document
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp")    keysRef.current.forward = true;
      if (e.code === "KeyS" || e.code === "ArrowDown")  keysRef.current.back    = true;
      if (e.code === "KeyA" || e.code === "ArrowLeft")  keysRef.current.left    = true;
      if (e.code === "KeyD" || e.code === "ArrowRight") keysRef.current.right   = true;
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp")    keysRef.current.forward = false;
      if (e.code === "KeyS" || e.code === "ArrowDown")  keysRef.current.back    = false;
      if (e.code === "KeyA" || e.code === "ArrowLeft")  keysRef.current.left    = false;
      if (e.code === "KeyD" || e.code === "ArrowRight") keysRef.current.right   = false;
    };
    document.addEventListener("keydown", onDown);
    document.addEventListener("keyup", onUp);
    return () => {
      document.removeEventListener("keydown", onDown);
      document.removeEventListener("keyup", onUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (gameState !== "playing") return;

    updateTime(delta);
    damageCooldown.current = Math.max(0, damageCooldown.current - delta);

    const locked = controlsRef.current?.isLocked ?? false;
    if (locked) {
      // Flat forward direction from camera (ignores vertical look pitch)
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

      const move = new THREE.Vector3();
      if (keysRef.current.forward) move.add(forward);
      if (keysRef.current.back)    move.sub(forward);
      if (keysRef.current.left)    move.sub(right);
      if (keysRef.current.right)   move.add(right);

      if (move.length() > 0) {
        move.normalize().multiplyScalar(MOVE_SPEED * delta);
        const nx = posRef.current.x + move.x;
        const nz = posRef.current.z + move.z;
        if (canMoveTo(nx, posRef.current.z)) posRef.current.x = nx;
        if (canMoveTo(posRef.current.x, nz)) posRef.current.z = nz;
      }

      // Pin camera to player position (PointerLockControls manages rotation)
      camera.position.x = posRef.current.x;
      camera.position.y = EYE_HEIGHT;
      camera.position.z = posRef.current.z;
    }

    // Item collection
    for (const c of collectibles) {
      if (collectedIds.has(c.id)) continue;
      const d = Math.hypot(posRef.current.x - c.position[0], posRef.current.z - c.position[2]);
      if (d < COLLECT_RADIUS) collectItem(c.id, c.points);
    }

    // Obstacle damage
    if (damageCooldown.current <= 0) {
      for (const o of obstacles) {
        const d = Math.hypot(posRef.current.x - o.position[0], posRef.current.z - o.position[2]);
        if (d < OBSTACLE_RADIUS) {
          takeDamage(o.damage);
          damageCooldown.current = 1.5;
          break;
        }
      }
    }

    // Exit check
    if (Math.hypot(posRef.current.x - exitPos[0], posRef.current.z - exitPos[2]) < 2) {
      winGame();
    }
  });

  if (gameState !== "playing") return null;

  return (
    <PointerLockControls
      ref={controlsRef as any}
      onLock={() => onLockChange(true)}
      onUnlock={() => onLockChange(false)}
    />
  );
}
