/**
 * Web fallback for haptics
 * Uses Vibration API where available
 */

const vibrate = (pattern: number | number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

export const haptics = {
  light: () => vibrate(10),
  medium: () => vibrate(20),
  heavy: () => vibrate(30),
  success: () => vibrate([10, 50, 10]),
  warning: () => vibrate([20, 100, 20]),
  error: () => vibrate([50, 100, 50]),
  selection: () => vibrate(5),
  beat: () => vibrate(10),
  recordStart: () => vibrate([30, 50, 20]),
  recordStop: () => vibrate(20),
  scoreReveal: (score: number) => {
    if (score >= 90) {
      vibrate([30, 50, 30, 50, 30]);
    } else if (score >= 70) {
      vibrate([20, 50, 20]);
    } else {
      vibrate(10);
    }
  },
};
