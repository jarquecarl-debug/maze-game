import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useKeyboardControls } from "@react-three/drei";
import { useGameStore } from "./useGameStore";
import { MAZE_LAYOUT, CELL_SIZE, getExitPosition, getPlayerStart } from "./mazeData";

enum Controls {
  forward = "forward",
  back = "back",
  left = "left",
  right = "right",
}

const MOVE_SPEED = 6;
const MOUSE_SENSITIVITY = 0.003;
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
  if (row < 0 || row >= MAZE_LAYOUT.length || col < 0 || col >= MAZE_LAYOUT[0].length) {
    return true;
  }
  return MAZE_LAYOUT[row][col] === 1;
}

function canMoveTo(x: number, z: number): boolean {
  const offsets = [
    [PLAYER_RADIUS, PLAYER_RADIUS],
    [PLAYER_RADIUS, -PLAYER_RADIUS],
    [-PLAYER_RADIUS, PLAYER_RADIUS],
    [-PLAYER_RADIUS, -PLAYER_RADIUS],
  ];
  for (const [dx, dz] of offsets) {
    const [row, col] = worldToGrid(x + dx, z + dz);
    if (isWall(row, col)) return false;
  }
  return true;
}

export default function Player() {
  const { camera } = useThree();
  const [, getState] = useKeyboardControls<Controls>();

  const yaw = useRef(0);
  const pitch = useRef(0);
  const position = useRef(new THREE.Vector3());
  const damageCooldown = useRef(0);
  const isDragging = useRef(false);

  // Track keys manually as fallback (handles iframe focus issues)
  const keys = useRef<Record<string, boolean>>({});

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
    }
  }, [gameState, startPos, camera]);

  // Direct key listeners so they work even inside iframes
  useEffect(() => {
    if (gameState !== "playing") return;

    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      // Prevent arrow keys from scrolling
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code)) {
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      keys.current = {};
    };
  }, [gameState]);

  // Mouse drag to look
  useEffect(() => {
    if (gameState !== "playing") return;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) isDragging.current = true;
    };
    const onMouseUp = () => {
      isDragging.current = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      yaw.current -= e.movementX * MOUSE_SENSITIVITY;
      pitch.current = Math.max(
        -Math.PI / 3,
        Math.min(Math.PI / 3, pitch.current - e.movementY * MOUSE_SENSITIVITY)
      );
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      isDragging.current = false;
    };
  }, [gameState]);

  useFrame((_, delta) => {
    if (gameState !== "playing") return;

    updateTime(delta);
    damageCooldown.current = Math.max(0, damageCooldown.current - delta);

    // Combine drei keyboard controls + direct key fallback
    const drei = getState();
    const forward =
      drei.forward || keys.current["KeyW"] || keys.current["ArrowUp"];
    const back =
      drei.back || keys.current["KeyS"] || keys.current["ArrowDown"];
    const left =
      drei.left || keys.current["KeyA"] || keys.current["ArrowLeft"];
    const right =
      drei.right || keys.current["KeyD"] || keys.current["ArrowRight"];

    const fwd = new THREE.Vector3(0, 0, -1).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yaw.current
    );
    const rgt = new THREE.Vector3().crossVectors(
      fwd,
      new THREE.Vector3(0, 1, 0)
    );

    const moveDir = new THREE.Vector3();
    if (forward) moveDir.add(fwd);
    if (back) moveDir.sub(fwd);
    if (left) moveDir.sub(rgt);
    if (right) moveDir.add(rgt);

    if (moveDir.length() > 0) {
      moveDir.normalize().multiplyScalar(MOVE_SPEED * delta);
      const newX = position.current.x + moveDir.x;
      const newZ = position.current.z + moveDir.z;
      if (canMoveTo(newX, position.current.z)) position.current.x = newX;
      if (canMoveTo(position.current.x, newZ)) position.current.z = newZ;
    }

    const euler = new THREE.Euler(pitch.current, yaw.current, 0, "YXZ");
    camera.position.copy(position.current);
    camera.quaternion.setFromEuler(euler);

    // Collect items
    for (const c of collectibles) {
      if (collectedIds.has(c.id)) continue;
      const dist = Math.hypot(
        position.current.x - c.position[0],
        position.current.z - c.position[2]
      );
      if (dist < COLLECT_RADIUS) collectItem(c.id, c.points);
    }

    // Obstacle damage
    if (damageCooldown.current <= 0) {
      for (const o of obstacles) {
        const dist = Math.hypot(
          position.current.x - o.position[0],
          position.current.z - o.position[2]
        );
        if (dist < OBSTACLE_RADIUS) {
          takeDamage(o.damage);
          damageCooldown.current = 1;
          break;
        }
      }
    }

    // Exit check
    const distToExit = Math.hypot(
      position.current.x - exitPos[0],
      position.current.z - exitPos[2]
    );
    if (distToExit < 2) winGame();
  });

  return null;
}

export { Controls };
