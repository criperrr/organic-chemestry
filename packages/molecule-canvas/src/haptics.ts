/**
 * Haptic feedback utility for mobile devices.
 * Uses the Web Vibration API when supported, degrading silently to a no-op otherwise.
 */
export const haptics = {
  /** Light tap for button clicks and chip selections */
  tap: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(8);
      } catch {}
    }
  },

  /** Subtle feedback for slot placement or mode toggle */
  light: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(14);
      } catch {}
    }
  },

  /** Celebratory tactile pattern for correct answers and milestone combos */
  success: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([18, 40, 30]);
      } catch {}
    }
  },

  /** Error feedback pattern for incorrect answers */
  error: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([35, 50, 35]);
      } catch {}
    }
  },

  /** Grand fanfare vibration pattern for level ups and trophies */
  levelUp: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 35, 25, 35, 60]);
      } catch {}
    }
  },
};
