/**
 * Utility for haptic feedback (vibration)
 */
export const triggerHaptic = (pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
            navigator.vibrate(pattern);
        } catch (e) {
            // Ignore errors if vibration is blocked or not supported
        }
    }
};

/**
 * Common vibration patterns
 */
export const HapticPatterns = {
    LIGHT: 10,
    MEDIUM: 20,
    HEAVY: 40,
    SUCCESS: [10, 50, 10],
    ERROR: [50, 100, 50, 100, 50],
    WARNING: [30, 100, 30],
};
