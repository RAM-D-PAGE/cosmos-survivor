/**
 * NaN Guard Utilities
 * 
 * Central utilities for preventing NaN propagation in damage, healing,
 * and other numeric calculations. Use these functions to ensure 
 * calculations never produce NaN values that could cause invincibility bugs.
 */

/**
 * Safely get a finite number value with fallback
 * @param value - The value to check
 * @param fallback - Default value if input is not finite
 * @returns A finite number
 */
export function safeNum(value: any, fallback: number): number {
    return Number.isFinite(value) ? value : fallback;
}

/**
 * Safely get damage value - ensures damage is a positive finite number
 * @param damage - Raw damage value
 * @param fallback - Default damage if invalid (default: 0)
 * @returns Valid damage value (>= 0) or 0
 */
export function safeDamage(damage: any, fallback: number = 0): number {
    const num = Number.isFinite(damage) ? damage : fallback;
    return num > 0 ? num : 0;
}

/**
 * Safely get radius value - ensures radius is a positive finite number
 * @param radius - Raw radius value
 * @param fallback - Default radius if invalid (default: 100)
 * @returns Valid radius value (> 0)
 */
export function safeRadius(radius: any, fallback: number = 100): number {
    const num = Number.isFinite(radius) ? radius : fallback;
    return num > 0 ? num : fallback;
}

/**
 * Safely get duration value - ensures duration is a positive finite number
 * @param duration - Raw duration value
 * @param fallback - Default duration if invalid (default: 1)
 * @returns Valid duration value (> 0)
 */
export function safeDuration(duration: any, fallback: number = 1): number {
    const num = Number.isFinite(duration) ? duration : fallback;
    return num > 0 ? num : fallback;
}

/**
 * Safely get percentage value - ensures percent is between 0 and 1
 * @param percent - Raw percentage value (0-1)
 * @param fallback - Default percent if invalid (default: 0.1)
 * @returns Valid percent value (0-1)
 */
export function safePercent(percent: any, fallback: number = 0.1): number {
    if (!Number.isFinite(percent)) return fallback;
    if (percent < 0) return 0;
    if (percent > 1) return 1;
    return percent;
}

/**
 * Safely get health/HP value - ensures HP is finite and >= 0
 * @param hp - Raw HP value
 * @param fallback - Default HP if invalid (default: 1)
 * @returns Valid HP value (>= 0)
 */
export function safeHP(hp: any, fallback: number = 1): number {
    const num = Number.isFinite(hp) ? hp : fallback;
    return num >= 0 ? num : 0;
}

/**
 * Check if damage can be applied safely
 * @param damage - Damage value to check
 * @returns true if damage is valid and > 0
 */
export function canApplyDamage(damage: any): boolean {
    return Number.isFinite(damage) && damage > 0;
}

/**
 * Check if heal can be applied safely
 * @param heal - Heal value to check
 * @returns true if heal is valid and > 0
 */
export function canApplyHeal(heal: any): boolean {
    return Number.isFinite(heal) && heal > 0;
}

/**
 * Safe division - prevents NaN from division by zero
 * @param numerator - Number to divide
 * @param denominator - Number to divide by
 * @param fallback - Default value if division is invalid (default: 0)
 * @returns Safe division result
 */
export function safeDivide(numerator: number, denominator: number, fallback: number = 0): number {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
        return fallback;
    }
    const result = numerator / denominator;
    return Number.isFinite(result) ? result : fallback;
}

/**
 * Extract safe skill parameters from a skill object
 * @param skill - The skill object
 * @param defaults - Default values for each property
 * @returns Object with validated skill parameters
 */
export function safeSkillParams(
    skill: any,
    defaults: {
        damage?: number;
        radius?: number;
        duration?: number;
        count?: number;
        speed?: number;
        cooldown?: number;
    } = {}
): {
    damage: number;
    radius: number;
    duration: number;
    count: number;
    speed: number;
    cooldown: number;
} {
    return {
        damage: safeDamage(skill?.damage, defaults.damage ?? 50),
        radius: safeRadius(skill?.radius, defaults.radius ?? 100),
        duration: safeDuration(skill?.duration, defaults.duration ?? 3),
        count: safeNum(skill?.count, defaults.count ?? 1),
        speed: safeNum(skill?.speed, defaults.speed ?? 300),
        cooldown: safeNum(skill?.cooldown, defaults.cooldown ?? 5)
    };
}

/**
 * Log NaN detection for debugging (only in development)
 * @param location - Where the NaN was detected
 * @param value - The NaN value
 * @param fallbackUsed - What fallback was applied
 */
export function logNaNWarning(location: string, value: any, fallbackUsed: number): void {
    if (process.env.NODE_ENV !== 'production') {
        console.warn(`[NaN Guard] ${location}: Invalid value "${value}" replaced with ${fallbackUsed}`);
    }
}
