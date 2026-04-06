import { useRef, useEffect, useCallback } from "react";
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
const MOUSE_SENSITIVITY = 0.002;
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
  const { camera, gl } = useThree();
  const [, getState] = useKeyboardControls<Controls>();
  const yaw = useRef(0);
  const pitch = useRef(0);
  const position = useRef(new THREE.Vector3());
  const damageCooldown = useRef(0);
  const isLocked = useRef(false);

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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isLocked.current) return;
    yaw.current -= e.movementX * MOUSE_SENSITIVITY;
    pitch.current = Math.max(
      -Math.PI / 3,
      Math.min(Math.PI / 3, pitch.current - e.movementY * MOUSE_SENSITIVITY)
    );
  }, []);

  const handleLockChange = useCallback(() => {
    isLocked.current = document.pointerLockElement === gl.domElement;
  }, [gl.domElement]);

  useEffect(() => {
    const canvas = gl.domElement;

    const handleClick = () => {
      if (gameState === "playing" && !isLocked.current) {
        canvas.requestPointerLock();
      }
    };

    canvas.addEventListener("click", handleClick);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("pointerlockchange", handleLockChange);

    return () => {
      canvas.removeEventListener("click", handleClick);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("pointerlockchange", handleLockChange);
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
      }
    };
  }, [gl.domElement, handleMouseMove, handleLockChange, gameState]);

  useFrame((_, delta) => {
    if (gameState !== "playing") return;

    updateTime(delta);
    damageCooldown.current = Math.max(0, damageCooldown.current - delta);

    const controls = getState();
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
    const right = new THREE.Vector3().crossVectors(
      forward,
      new THREE.Vector3(0, 1, 0)
    );

    const moveDir = new THREE.Vector3();
    if (controls.forward) moveDir.add(forward);
    if (controls.back) moveDir.sub(forward);
    if (controls.left) moveDir.sub(right);
    if (controls.right) moveDir.add(right);

    if (moveDir.length() > 0) {
      moveDir.normalize().multiplyScalar(MOVE_SPEED * delta);

      const newX = position.current.x + moveDir.x;
      const newZ = position.current.z + moveDir.z;

      if (canMoveTo(newX, position.current.z)) {
        position.current.x = newX;
      }
      if (canMoveTo(position.current.x, newZ)) {
        position.current.z = newZ;
      }
    }

    camera.position.copy(position.current);
    const euler = new THREE.Euler(pitch.current, yaw.current, 0, "YXZ");
    camera.quaternion.setFromEuler(euler);

    for (const c of collectibles) {
      if (collectedIds.has(c.id)) continue;
      const dist = Math.sqrt(
        (position.current.x - c.position[0]) ** 2 +
        (position.current.z - c.position[2]) ** 2
      );
      if (dist < COLLECT_RADIUS) {
        collectItem(c.id, c.points);
      }
    }

    if (damageCooldown.current <= 0) {
      for (const o of obstacles) {
        const dist = Math.sqrt(
          (position.current.x - o.position[0]) ** 2 +
          (position.current.z - o.position[2]) ** 2
        );
        if (dist < OBSTACLE_RADIUS) {
          takeDamage(o.damage);
          damageCooldown.current = 1;
          break;
        }
      }
    }

    const distToExit = Math.sqrt(
      (position.current.x - exitPos[0]) ** 2 +
      (position.current.z - exitPos[2]) ** 2
    );
    if (distToExit < 2) {
      winGame();
    }
  });

  return null;
}

export { Controls };
