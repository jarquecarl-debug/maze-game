/** Shared mutable state updated by Three.js game loop, read by React HUD components. */
export const sharedState = {
  bearing: 0,        // degrees, 0=N 90=E 180=S 270=W
  playerRow: 1,
  playerCol: 1,
  playerWorldX: 0,
  playerWorldZ: 0,
  enemyRow: -1,
  enemyCol: -1,
  stamina: 100,
};
