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

  // Dash ability
  dashCooldown: 0,      // seconds remaining on cooldown (0 = ready)
  dashMaxCooldown: 2,   // total cooldown duration
  isDashing: false,     // true during the dash burst

  // Mobile touch input — written by MobileControls, read by Player
  isMobile: false,
  mobileJoyX: 0,     // -1 (left) to 1 (right)
  mobileJoyY: 0,     // -1 (forward) to 1 (back)
  mobileLookDX: 0,   // camera yaw delta (consumed each frame)
  mobileLookDY: 0,   // camera pitch delta (consumed each frame)
  mobileSprint: false,
};