/**
 * Performance Monitor
 * ติดตามและรายงาน performance metrics ของเกม
 * ใช้สำหรับ debugging และ optimization
 */

export interface PerformanceMetrics {
    fps: number;
    frameTime: number;
    updateTime: number;
    renderTime: number;
    collisionTime: number;
    entityCount: number;
    projectileCount: number;
    particleCount: number;
    spatialGridCells: number;
}

export class PerformanceMonitor {
    private metrics: PerformanceMetrics;
    private frameTimeHistory: number[] = [];
    private maxHistorySize: number = 60; // Keep last 60 frames

    // Timing
    private frameStartTime: number = 0;
    private updateStartTime: number = 0;
    private renderStartTime: number = 0;
    private collisionStartTime: number = 0;

    // Counters
    private frameCount: number = 0;
    private lastFpsUpdate: number = 0;

    constructor() {
        this.metrics = {
            fps: 0,
            frameTime: 0,
            updateTime: 0,
            renderTime: 0,
            collisionTime: 0,
            entityCount: 0,
            projectileCount: 0,
            particleCount: 0,
            spatialGridCells: 0
        };
    }

    /**
     * Start measuring frame time
     */
    startFrame(): void {
        this.frameStartTime = performance.now();
    }

    /**
     * End frame measurement and update metrics
     */
    endFrame(): void {
        const frameTime = performance.now() - this.frameStartTime;
        this.metrics.frameTime = frameTime;
        
        // Add to history
        this.frameTimeHistory.push(frameTime);
        if (this.frameTimeHistory.length > this.maxHistorySize) {
            this.frameTimeHistory.shift();
        }

        // Calculate FPS
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastFpsUpdate >= 1000) {
            this.metrics.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }
    }

    /**
     * Start measuring update time
     */
    startUpdate(): void {
        this.updateStartTime = performance.now();
    }

    /**
     * End update measurement
     */
    endUpdate(): void {
        this.metrics.updateTime = performance.now() - this.updateStartTime;
    }

    /**
     * Start measuring render time
     */
    startRender(): void {
        this.renderStartTime = performance.now();
    }

    /**
     * End render measurement
     */
    endRender(): void {
        this.metrics.renderTime = performance.now() - this.renderStartTime;
    }

    /**
     * Start measuring collision detection time
     */
    startCollision(): void {
        this.collisionStartTime = performance.now();
    }

    /**
     * End collision measurement
     */
    endCollision(): void {
        this.metrics.collisionTime = performance.now() - this.collisionStartTime;
    }

    /**
     * Update entity counts
     */
    updateCounts(entityCount: number, projectileCount: number, particleCount: number, gridCells: number): void {
        this.metrics.entityCount = entityCount;
        this.metrics.projectileCount = projectileCount;
        this.metrics.particleCount = particleCount;
        this.metrics.spatialGridCells = gridCells;
    }

    /**
     * Get current metrics
     */
    getMetrics(): PerformanceMetrics {
        return { ...this.metrics };
    }

    /**
     * Get average frame time
     */
    getAverageFrameTime(): number {
        if (this.frameTimeHistory.length === 0) return 0;
        const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
        return sum / this.frameTimeHistory.length;
    }

    /**
     * Get min/max frame times
     */
    getFrameTimeStats(): { min: number; max: number; avg: number } {
        if (this.frameTimeHistory.length === 0) {
            return { min: 0, max: 0, avg: 0 };
        }
        const min = Math.min(...this.frameTimeHistory);
        const max = Math.max(...this.frameTimeHistory);
        const avg = this.getAverageFrameTime();
        return { min, max, avg };
    }

    /**
     * Check if performance is acceptable
     */
    isPerformanceGood(): boolean {
        return this.metrics.fps >= 50 && this.metrics.frameTime < 20;
    }

    /**
     * Get performance warning message
     */
    getPerformanceWarning(): string | null {
        if (this.metrics.fps < 30) {
            return `Low FPS: ${this.metrics.fps} FPS`;
        }
        if (this.metrics.frameTime > 33) {
            return `High frame time: ${this.metrics.frameTime.toFixed(2)}ms`;
        }
        if (this.metrics.updateTime > 16) {
            return `Slow update: ${this.metrics.updateTime.toFixed(2)}ms`;
        }
        if (this.metrics.renderTime > 16) {
            return `Slow render: ${this.metrics.renderTime.toFixed(2)}ms`;
        }
        return null;
    }

    /**
     * Reset all metrics
     */
    reset(): void {
        this.frameTimeHistory = [];
        this.frameCount = 0;
        this.lastFpsUpdate = performance.now();
    }
}
