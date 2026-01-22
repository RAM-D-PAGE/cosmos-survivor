/**
 * Utility Functions
 * Helper functions ที่ใช้บ่อยในเกม
 */

/**
 * Calculate distance between two points (squared, for performance)
 */
export function distanceSquared(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
}

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(distanceSquared(x1, y1, x2, y2));
}

/**
 * Normalize a vector
 */
export function normalize(x: number, y: number): { x: number; y: number } {
    const len = Math.sqrt(x * x + y * y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: x / len, y: y / len };
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

/**
 * Check if two circles intersect
 */
export function circlesIntersect(
    x1: number, y1: number, r1: number,
    x2: number, y2: number, r2: number
): boolean {
    const distSq = distanceSquared(x1, y1, x2, y2);
    const minDistSq = (r1 + r2) * (r1 + r2);
    return distSq < minDistSq;
}

/**
 * Check if a point is inside a circle
 */
export function pointInCircle(
    px: number, py: number,
    cx: number, cy: number, radius: number
): boolean {
    return distanceSquared(px, py, cx, cy) < radius * radius;
}

/**
 * Check if a point is inside a rectangle
 */
export function pointInRect(
    px: number, py: number,
    rx: number, ry: number, rw: number, rh: number
): boolean {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

/**
 * Get angle between two points
 */
export function angleBetween(x1: number, y1: number, x2: number, y2: number): number {
    return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Rotate a point around an origin
 */
export function rotatePoint(
    px: number, py: number,
    ox: number, oy: number,
    angle: number
): { x: number; y: number } {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = px - ox;
    const dy = py - oy;
    return {
        x: ox + dx * cos - dy * sin,
        y: oy + dx * sin + dy * cos
    };
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
    return num.toLocaleString();
}

/**
 * Format time in seconds to MM:SS
 */
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Random number between min and max (inclusive)
 */
export function randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

/**
 * Random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(randomRange(min, max + 1));
}

/**
 * Random element from array
 */
export function randomElement<T>(array: T[]): T | undefined {
    if (array.length === 0) return undefined;
    return array[randomInt(0, array.length - 1)];
}

/**
 * Shuffle array (Fisher-Yates)
 */
export function shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if value is valid number (not NaN, not Infinity)
 */
export function isValidNumber(value: number): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Safe division (returns 0 if denominator is 0)
 */
export function safeDivide(numerator: number, denominator: number): number {
    if (denominator === 0) return 0;
    return numerator / denominator;
}
