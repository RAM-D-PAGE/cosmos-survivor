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

    public level: number = 1;

    constructor(game: any, parent: any, config: WeaponConfig) {
        this.game = game;
        this.parent = parent; // usually player
        this.config = config;

        this.angle = 0;
        this.distance = 50; // Distance from parent
        this.shootTimer = 0;

        this.initStats();
    }

    initStats(): void {
        this.fireInterval = 1 / (this.config.fireRate || 1);
        this.damage = this.config.damage || 5;
        this.range = this.config.range || 300;
        this.color = this.config.color || '#ffffff';
        this.type = this.config.type || 'ORBITAL';
        this.name = this.config.name || 'Unknown Weapon';
    }

    update(dt: number): void {
        // Position Logic (Simple orbit for all for now)
        this.angle += 2 * dt;
        this.x = this.parent.x + Math.cos(this.angle) * this.distance;
        this.y = this.parent.y + Math.sin(this.angle) * this.distance;

        // Action Logic
        this.shootTimer += dt;
        if (this.shootTimer >= this.fireInterval) {
            if (this.type === 'HEALER') {
                this.attemptHeal();
            } else if (this.type === 'DECOY') {
                this.attemptSpawnDecoy();
            } else {
                this.attemptShoot();
            }
        }
    }

    attemptHeal(): void {
        if (this.parent.hp < this.parent.maxHp) {
            const healAmount = Math.max(1, Math.floor(this.damage / 5)); // Base heal on "damage" stat
            this.parent.hp = Math.min(this.parent.maxHp, this.parent.hp + healAmount);
            this.game.spawnFloatingText(this.parent.x, this.parent.y, `+${healAmount}`, '#00ff88');
            this.game.spawnParticles(this.x, this.y, 10, '#00ff88');
            this.shootTimer = 0;
        }
    }

    attemptSpawnDecoy(): void {
        // Spawn a temporary decoy
        const decoyDuration = 3 + (this.level * 0.5);
        this.game.skillSystem?.activeEffects.push({
            type: 'DECOY',
            x: this.x,
            y: this.y,
            angle: Math.random() * Math.PI * 2,
            dist: 100,
            timer: decoyDuration,
            update: (dt: number, g: any) => {
                // Static decoy for now
            },
            color: '#88aaff'
        });

        this.game.spawnFloatingText(this.x, this.y, "DECOY!", '#88aaff');
        this.shootTimer = -5; // Long cooldown between decoys (fireInterval + 5s)
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
            // Projectile size/damage scales with level implicitly via damage stat
            this.game.spawnProjectile(this.x, this.y, angle, 600, this.damage);
            this.shootTimer = 0;
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Rarity Color based on Level
        let borderColor = '#ffffff'; // Common (Lvl 1)
        if (this.level >= 5) borderColor = '#ffd700'; // Legend (Lvl 5+)
        else if (this.level >= 4) borderColor = '#a335ee'; // Epic (Lvl 4)
        else if (this.level >= 3) borderColor = '#00ccff'; // Rare (Lvl 3)
        else if (this.level >= 2) borderColor = '#00ff00'; // Uncommon (Lvl 2)

        // Draw Border (Glow effect)
        ctx.shadowBlur = 10;
        ctx.shadowColor = borderColor;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2; // Border thickness

        ctx.fillStyle = this.color;

        // Different shapes for types
        if (this.type === 'HEALER') {
            // Cross
            ctx.beginPath();
            ctx.rect(-2, -6, 4, 12);
            ctx.rect(-6, -2, 12, 4);
            ctx.fill();
            ctx.stroke(); // Apply border
        } else if (this.type === 'DECOY') {
            // Triangle
            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.lineTo(6, 6);
            ctx.lineTo(-6, 6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke(); // Apply border
        } else {
            // Circle (Default)
            ctx.beginPath();
            ctx.arc(0, 0, 5 + (this.level), 0, Math.PI * 2); // Size grows with level
            ctx.fill();
            ctx.stroke(); // Apply border
        }

        ctx.restore();
    }
}
