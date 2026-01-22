/**
 * Debug Panel
 * แสดงข้อมูล debug และ performance metrics บนหน้าจอ
 */

import { PerformanceMonitor } from './PerformanceMonitor';
import { ErrorHandler } from './ErrorHandler';
import { SpatialGrid } from './SpatialGrid';

export class DebugPanel {
    private enabled: boolean = false;
    private panelElement: HTMLDivElement | null = null;
    private performanceMonitor: PerformanceMonitor;
    private errorHandler: ErrorHandler;
    private spatialGrid: SpatialGrid;

    constructor(
        performanceMonitor: PerformanceMonitor,
        errorHandler: ErrorHandler,
        spatialGrid: SpatialGrid
    ) {
        this.performanceMonitor = performanceMonitor;
        this.errorHandler = errorHandler;
        this.spatialGrid = spatialGrid;
    }

    /**
     * Toggle debug panel visibility
     */
    toggle(): void {
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.createPanel();
        } else {
            this.destroyPanel();
        }
    }

    /**
     * Show debug panel
     */
    show(): void {
        this.enabled = true;
        this.createPanel();
    }

    /**
     * Hide debug panel
     */
    hide(): void {
        this.enabled = false;
        this.destroyPanel();
    }

    /**
     * Create debug panel DOM element
     */
    private createPanel(): void {
        if (this.panelElement) return;

        this.panelElement = document.createElement('div');
        this.panelElement.id = 'debug-panel';
        this.panelElement.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            padding: 10px;
            border: 1px solid #00ff00;
            border-radius: 4px;
            z-index: 10000;
            max-width: 400px;
            line-height: 1.4;
        `;

        document.body.appendChild(this.panelElement);
        this.update();
    }

    /**
     * Destroy debug panel
     */
    private destroyPanel(): void {
        if (this.panelElement) {
            document.body.removeChild(this.panelElement);
            this.panelElement = null;
        }
    }

    /**
     * Update debug panel content
     */
    update(): void {
        if (!this.enabled || !this.panelElement) return;

        const metrics = this.performanceMonitor.getMetrics();
        const frameStats = this.performanceMonitor.getFrameTimeStats();
        const errorStats = this.errorHandler.getErrorStats();
        const gridStats = this.spatialGrid.getStats();

        const html = `
            <div style="margin-bottom: 8px; font-weight: bold; color: #00ffff;">DEBUG PANEL</div>
            
            <div style="margin-bottom: 6px;">
                <strong>Performance:</strong><br>
                FPS: ${metrics.fps} | Frame: ${metrics.frameTime.toFixed(2)}ms<br>
                Update: ${metrics.updateTime.toFixed(2)}ms | Render: ${metrics.renderTime.toFixed(2)}ms<br>
                Collision: ${metrics.collisionTime.toFixed(2)}ms<br>
                Avg Frame: ${frameStats.avg.toFixed(2)}ms (Min: ${frameStats.min.toFixed(2)}, Max: ${frameStats.max.toFixed(2)})
            </div>

            <div style="margin-bottom: 6px;">
                <strong>Entities:</strong><br>
                Total: ${metrics.entityCount} | Projectiles: ${metrics.projectileCount}<br>
                Particles: ${metrics.particleCount} | Grid Cells: ${metrics.spatialGridCells}
            </div>

            <div style="margin-bottom: 6px;">
                <strong>Spatial Grid:</strong><br>
                Cells: ${gridStats.cellCount} | Entities: ${gridStats.totalEntities}<br>
                Projectiles: ${gridStats.totalProjectiles}
            </div>

            <div style="margin-bottom: 6px;">
                <strong>Errors:</strong><br>
                Total: ${errorStats.total} | Recent (1min): ${errorStats.recent}
            </div>

            ${this.performanceMonitor.getPerformanceWarning() 
                ? `<div style="color: #ff0000; margin-top: 6px;">
                    ⚠️ ${this.performanceMonitor.getPerformanceWarning()}
                   </div>`
                : ''
            }

            <div style="margin-top: 8px; font-size: 10px; color: #888;">
                Press F3 to toggle
            </div>
        `;

        this.panelElement.innerHTML = html;
    }

    /**
     * Initialize keyboard shortcut (F3 to toggle)
     */
    initKeyboardShortcut(game: any): void {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'F3') {
                e.preventDefault();
                this.toggle();
            }
        });
    }
}
