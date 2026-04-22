/**
 * Tiny haptic-feedback wrapper.
 * Silently no-ops on browsers / devices that don't support vibration.
 */

const canVibrate = typeof navigator !== "undefined" && "vibrate" in navigator;

/** Light 10 ms pulse — focus, restore */
export function hapticTap() {
  if (canVibrate) navigator.vibrate(10);
}

/** Heavier 20 ms pulse — minimize */
export function hapticHeavy() {
  if (canVibrate) navigator.vibrate(20);
}