/**
 * Spatial Grid Partitioning System
 * ระบบแบ่งพื้นที่เพื่อเพิ่มประสิทธิภาพการตรวจสอบ collision
 * 
 * หลักการ: แบ่งโลกเกมเป็น grid cells และเก็บ entities ในแต่ละ cell
 * ทำให้สามารถตรวจสอบ collision เฉพาะ entities ที่อยู่ใน cell เดียวกัน
 * 
 * Complexity: O(n) แทน O(n²) สำหรับ collision detection
 */

import { ICollidable, ProjectileData } from './Types';

interface SpatialGridCell {
    entities: ICollidable[];
    projectiles: ProjectileData[];
}

export class SpatialGrid {
    private cellSize: number;
    private grid: Map<string, SpatialGridCell>;
    constructor(cellSize: number = 200) {
        this.cellSize = cellSize;
        this.grid = new Map();
    }

    /**
     * Get all cell keys that intersect with a bounding box
     */
    private getCellKeysForBounds(x: number, y: number, radius: number): string[] {
        if (!isFinite(x) || !isFinite(y) || !isFinite(radius) || radius <= 0) return [];

        // Safety cap: Prevent checking too many cells (max radius 2000 => 20 cells in each direction)
        const safeRadius = Math.min(radius, 2000);

        const minX = Math.floor((x - safeRadius) / this.cellSize);
        const maxX = Math.floor((x + safeRadius) / this.cellSize);
        const minY = Math.floor((y - safeRadius) / this.cellSize);
        const maxY = Math.floor((y + safeRadius) / this.cellSize);

        const keys: string[] = [];
        // Safety Break: Don't loop more than 100x100
        if ((maxX - minX) * (maxY - minY) > 10000) return [];

        for (let cx = minX; cx <= maxX; cx++) {
            for (let cy = minY; cy <= maxY; cy++) {
                keys.push(`${cx},${cy}`);
            }
        }
        return keys;
    }

    /**
     * Get or create a cell
     */
    private getCell(key: string): SpatialGridCell {
        if (!this.grid.has(key)) {
            this.grid.set(key, {
                entities: [],
                projectiles: []
            });
        }
        return this.grid.get(key)!;
    }

    /**
     * Clear all cells (call at start of each frame)
     */
    clear(): void {
        this.grid.clear();
    }

    /**
     * Insert an entity into the grid
     */
    insertEntity(entity: ICollidable): void {
        if (entity.markedForDeletion) return;

        const keys = this.getCellKeysForBounds(entity.x, entity.y, entity.radius);
        keys.forEach(key => {
            const cell = this.getCell(key);
            cell.entities.push(entity);
        });
    }

    /**
     * Insert a projectile into the grid
     */
    insertProjectile(projectile: ProjectileData): void {
        const keys = this.getCellKeysForBounds(projectile.x, projectile.y, projectile.radius);
        keys.forEach(key => {
            const cell = this.getCell(key);
            cell.projectiles.push(projectile);
        });
    }

    /**
     * Get all entities near a position
     */
    getNearbyEntities(x: number, y: number, radius: number): ICollidable[] {
        const keys = this.getCellKeysForBounds(x, y, radius);
        const entities = new Set<ICollidable>();

        keys.forEach(key => {
            const cell = this.grid.get(key);
            if (cell) {
                cell.entities.forEach(entity => {
                    if (!entity.markedForDeletion) {
                        entities.add(entity);
                    }
                });
            }
        });

        return Array.from(entities);
    }

    /**
     * Get all projectiles near a position
     */
    getNearbyProjectiles(x: number, y: number, radius: number): ProjectileData[] {
        const keys = this.getCellKeysForBounds(x, y, radius);
        const projectiles: ProjectileData[] = [];

        keys.forEach(key => {
            const cell = this.grid.get(key);
            if (cell) {
                projectiles.push(...cell.projectiles);
            }
        });

        return projectiles;
    }

    /**
     * Get entities that could collide with a projectile
     */
    getPotentialCollisions(projectile: ProjectileData): ICollidable[] {
        return this.getNearbyEntities(projectile.x, projectile.y, projectile.radius * 2);
    }

    /**
     * Get projectiles that could collide with an entity
     */
    getPotentialProjectileCollisions(entity: ICollidable): ProjectileData[] {
        return this.getNearbyProjectiles(entity.x, entity.y, entity.radius * 2);
    }

    /**
     * Update grid with all entities and projectiles
     */
    rebuild(entities: ICollidable[], projectiles: ProjectileData[]): void {
        this.clear();

        entities.forEach(entity => {
            if (!entity.markedForDeletion) {
                this.insertEntity(entity);
            }
        });

        projectiles.forEach(projectile => {
            this.insertProjectile(projectile);
        });
    }

    /**
     * Get statistics for debugging
     */
    getStats(): { cellCount: number; totalEntities: number; totalProjectiles: number } {
        let totalEntities = 0;
        let totalProjectiles = 0;

        this.grid.forEach(cell => {
            totalEntities += cell.entities.length;
            totalProjectiles += cell.projectiles.length;
        });

        return {
            cellCount: this.grid.size,
            totalEntities,
            totalProjectiles
        };
    }
}
