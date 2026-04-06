import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "./useGameStore";
import { MAZE_LAYOUT, CELL_SIZE, getExitPosition, getPlayerStart } from "./mazeData";

const MOVE_SPEED = 6;
const PLAYER_RADIUS = 0.5;
const COLLECT_RADIUS = 1.5;
const OBSTACLE_RADIUS = 1.2;

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
  const offsets = [[PLAYER_RADIUS, PLAYER_RADIUS],[PLAYER_RADIUS,-PLAYER_RADIUS],[-PLAYER_RADIUS,PLAYER_RADIUS],[-PLAYER_RADIUS,-PLAYER_RADIUS]];
  for (const [dx, dz] of offsets) {
    const [row, col] = worldToGrid(x + dx, z + dz);
    if (isWall(row, col)) return false;
  }
  return true;
}

// Shared input state — written by InputOverlay, read by Player
export const inputState = {
  forward: false,
  back: false,
  left: false,
  right: false,
  yawDelta: 0,
  pitchDelta: 0,
};

export default function Player() {
  const { camera } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(0);
  const position = useRef(new THREE.Vector3());
  const damageCooldown = useRef(0);

  const { gameState, collectibles, obstacles, collectedIds, collectItem, takeDamage, winGame, updateTime } = useGameStore();
  const startPos = getPlayerStart();
  const exitPos = getExitPosition();

  useEffect(() => {
    if (gameState === "playing") {
      position.current.set(startPos[0], 1.6, startPos[2]);
      yaw.current = 0;
      pitch.current = 0;
      camera.position.set(startPos[0], 1.6, startPos[2]);
      camera.rotation.set(0, 0, 0);
      inputState.forward = false;
      inputState.back = false;
      inputState.left = false;
      inputState.right = false;
      inputState.yawDelta = 0;
      inputState.pitchDelta = 0;
    }
  }, [gameState, startPos, camera]);

  useFrame((_, delta) => {
    if (gameState !== "playing") return;

    updateTime(delta);
    damageCooldown.current = Math.max(0, damageCooldown.current - delta);

    // Apply mouse look deltas
    yaw.current -= inputState.yawDelta;
    pitch.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch.current - inputState.pitchDelta));
    inputState.yawDelta = 0;
    inputState.pitchDelta = 0;

    // Movement
    const fwd = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
    const rgt = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0));
    const moveDir = new THREE.Vector3();
    if (inputState.forward) moveDir.add(fwd);
    if (inputState.back) moveDir.sub(fwd);
    if (inputState.left) moveDir.sub(rgt);
    if (inputState.right) moveDir.add(rgt);

    if (moveDir.length() > 0) {
      moveDir.normalize().multiplyScalar(MOVE_SPEED * delta);
      const newX = position.current.x + moveDir.x;
      const newZ = position.current.z + moveDir.z;
      if (canMoveTo(newX, position.current.z)) position.current.x = newX;
      if (canMoveTo(position.current.x, newZ)) position.current.z = newZ;
    }

    camera.position.copy(position.current);
    camera.quaternion.setFromEuler(new THREE.Euler(pitch.current, yaw.current, 0, "YXZ"));

    // Collect items
    for (const c of collectibles) {
      if (collectedIds.has(c.id)) continue;
      const dist = Math.hypot(position.current.x - c.position[0], position.current.z - c.position[2]);
      if (dist < COLLECT_RADIUS) collectItem(c.id, c.points);
    }

    // Obstacle damage
    if (damageCooldown.current <= 0) {
      for (const o of obstacles) {
        const dist = Math.hypot(position.current.x - o.position[0], position.current.z - o.position[2]);
        if (dist < OBSTACLE_RADIUS) {
          takeDamage(o.damage);
          damageCooldown.current = 1;
          break;
        }
      }
    }

    // Win
    if (Math.hypot(position.current.x - exitPos[0], position.current.z - exitPos[2]) < 2) winGame();
  });

  return null;
}
