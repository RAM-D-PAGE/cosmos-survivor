/**
 * Game Manager
 * จัดการ game loop และ coordination ระหว่าง systems
 * แยกออกจาก Game class เพื่อลดความซับซ้อน
 */

import { IGameSystem } from './Types';

export class GameManager {
    private systems: IGameSystem[] = [];
    private lastTime: number = 0;
    private accumulator: number = 0;
    private step: number = 1 / 60; // 60 FPS fixed timestep

    // FPS Tracking
    private fpsLastTime: number = 0;
    private fpsFrameCount: number = 0;
    public currentFps: number = 0;

    constructor() {
        this.lastTime = performance.now();
        this.fpsLastTime = performance.now();
    }

    /**
     * Register a system to be updated each frame
     */
    registerSystem(system: IGameSystem): void {
        this.systems.push(system);
    }

    /**
     * Remove a system from update loop
     */
    unregisterSystem(system: IGameSystem): void {
        const index = this.systems.indexOf(system);
        if (index > -1) {
            this.systems.splice(index, 1);
        }
    }

    /**
     * Update all registered systems
     */
    update(deltaTime: number): void {
        // Fixed timestep for physics consistency
        this.accumulator += deltaTime;

        while (this.accumulator >= this.step) {
            this.systems.forEach(system => {
                system.update(this.step);
            });
            this.accumulator -= this.step;
        }

        // Update FPS counter
        this.updateFps();
    }

    /**
     * Calculate and update FPS
     */
    private updateFps(): void {
        const currentTime = performance.now();
        this.fpsFrameCount++;

        if (currentTime - this.fpsLastTime >= 1000) {
            this.currentFps = this.fpsFrameCount;
            this.fpsFrameCount = 0;
            this.fpsLastTime = currentTime;
        }
    }

    /**
     * Get current FPS
     */
    getFps(): number {
        return this.currentFps;
    }

    /**
     * Reset game manager state
     */
    reset(): void {
        this.accumulator = 0;
        this.lastTime = performance.now();
        this.fpsLastTime = performance.now();
        this.fpsFrameCount = 0;
        this.currentFps = 0;
    }
}
