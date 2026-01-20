import { WeaponConfig } from '../systems/WeaponSystem';

export class AutoWeapon {
    private game: any;
    private parent: any;
    public config: WeaponConfig;

    public angle: number;
    public distance: number;
    private shootTimer: number;

    // Procedural stats
    private fireInterval: number;
    public damage: number;
    private range: number;
    public color: string;
    private type: string;
    public name: string;
    public x: number = 0;
    public y: number = 0;

    constructor(game: any, parent: any, config: WeaponConfig) {
        this.game = game;
        this.parent = parent; // usually player
        this.config = config;

        this.angle = 0;
        this.distance = 50; // Distance from parent
        this.shootTimer = 0;

        // Procedural stats
        this.fireInterval = 1 / (config.fireRate || 1);
        this.damage = config.damage || 5;
        this.range = config.range || 300;
        this.color = config.color || '#ffffff';
        this.type = config.type || 'ORBITAL'; // ORBITAL, TURRET
        this.name = config.name || 'Unknown Weapon';
    }

    update(dt: number): void {
        // Position Logic
        if (this.type === 'ORBITAL') {
            this.angle += 2 * dt; // Rotate speed
            this.x = this.parent.x + Math.cos(this.angle) * this.distance;
            this.y = this.parent.y + Math.sin(this.angle) * this.distance;
        } else if (this.type === 'TURRET') {
            this.x = this.parent.x + Math.cos(this.parent.angle + Math.PI / 2) * 20;
            this.y = this.parent.y + Math.sin(this.parent.angle + Math.PI / 2) * 20;
        }

        // Firing Logic
        this.shootTimer += dt;
        if (this.shootTimer >= this.fireInterval) {
            this.attemptShoot();
        }
    }

    attemptShoot(): void {
        // Find closest enemy
        let closest: any = null;
        let minDist = Infinity;

        this.game.enemies.forEach((e: any) => {
            if (e.markedForDeletion) return;
            const dx = e.x - this.x;
            const dy = e.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.range && dist < minDist) {
                minDist = dist;
                closest = e;
            }
        });

        if (closest) {
            const angle = Math.atan2(closest.y - this.y, closest.x - this.x);
            this.game.spawnProjectile(this.x, this.y, angle, 600, this.damage);
            this.shootTimer = 0;
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = this.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;

        if (this.type === 'ORBITAL') {
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(-4, -4, 8, 8);
        }

        ctx.restore();
    }
}
