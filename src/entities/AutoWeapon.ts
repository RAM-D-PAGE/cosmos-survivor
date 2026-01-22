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
        const fireRateMult = this.game.player.fireRateMultiplier || 1.0;
        this.fireInterval = 1 / ((this.config.fireRate || 1) * fireRateMult);

        // Scale damage slightly with player level to keep old weapons relevant
        // This is a simple scaling: +10% base damage per 5 player levels
        const levelBonus = 1 + (Math.floor(this.game.player.level / 5) * 0.1);

        this.damage = (this.config.damage || 5) * levelBonus;
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
            switch (this.type) {
                case 'HEALER':
                    this.attemptHeal();
                    break;
                case 'DECOY':
                    this.attemptSpawnDecoy();
                    break;
                case 'SEEKER':
                    this.attemptSeeker();
                    break;
                case 'BEAM':
                    this.attemptBeam();
                    break;
                case 'SHOTGUN':
                    this.attemptShotgun();
                    break;
                case 'SNIPER':
                    this.attemptSniper();
                    break;
                case 'MINIGUN':
                    this.attemptMinigun();
                    break;
                case 'EXPLOSIVE':
                    this.attemptExplosive();
                    break;
                case 'FREEZE':
                    this.attemptFreeze();
                    break;
                case 'POISON':
                    this.attemptPoison();
                    break;
                case 'LASER':
                    this.attemptLaser();
                    break;
                case 'ORBIT_BLADE':
                    this.attemptOrbitBlade();
                    break;
                case 'MISSILE':
                    this.attemptMissile();
                    break;
                default:
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
            this.game.spawnProjectile(this.x, this.y, angle, 600, this.damage);
            this.shootTimer = 0;
        }
    }

    attemptSeeker(): void {
        // Homing missiles
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
            const proj = this.game.spawnProjectile(this.x, this.y, angle, 400, this.damage);
            if (proj) proj.isHoming = true; // Mark as homing
            this.shootTimer = 0;
        }
    }

    attemptBeam(): void {
        // Continuous beam weapon
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
            // Beam: fast, piercing projectile
            this.game.spawnProjectile(this.x, this.y, angle, 1000, this.damage * 0.7);
            this.shootTimer = 0;
        }
    }

    attemptShotgun(): void {
        // Spread shot
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
            const baseAngle = Math.atan2(closest.y - this.y, closest.x - this.x);
            // Fire 5 projectiles in spread
            for (let i = 0; i < 5; i++) {
                const spread = (i - 2) * 0.15;
                this.game.spawnProjectile(this.x, this.y, baseAngle + spread, 500, this.damage * 0.6);
            }
            this.shootTimer = 0;
        }
    }

    attemptSniper(): void {
        // High damage, slow fire
        let closest: any = null;
        let minDist = Infinity;

        this.game.enemies.forEach((e: any) => {
            if (e.markedForDeletion) return;
            const dx = e.x - this.x;
            const dy = e.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.range * 1.5 && dist < minDist) {
                minDist = dist;
                closest = e;
            }
        });

        if (closest) {
            const angle = Math.atan2(closest.y - this.y, closest.x - this.x);
            this.game.spawnProjectile(this.x, this.y, angle, 1200, this.damage * 3); // 3x damage
            this.shootTimer = 0;
        }
    }

    attemptMinigun(): void {
        // Very fast, low damage
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
            this.game.spawnProjectile(this.x, this.y, angle, 700, this.damage * 0.4); // Low damage
            this.shootTimer = 0;
        }
    }

    attemptExplosive(): void {
        // Explosive rounds
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
            const proj = this.game.spawnProjectile(this.x, this.y, angle, 450, this.damage);
            if (proj) proj.isExplosive = true; // Mark as explosive
            this.shootTimer = 0;
        }
    }

    attemptFreeze(): void {
        // Freezing shots
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
            const proj = this.game.spawnProjectile(this.x, this.y, angle, 550, this.damage);
            if (proj) proj.isFreezing = true; // Mark as freezing
            this.shootTimer = 0;
        }
    }

    attemptPoison(): void {
        // Poison DoT
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
            const proj = this.game.spawnProjectile(this.x, this.y, angle, 500, this.damage);
            if (proj) proj.isPoison = true; // Mark as poison
            this.shootTimer = 0;
        }
    }

    attemptLaser(): void {
        // Piercing laser
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
            const proj = this.game.spawnProjectile(this.x, this.y, angle, 900, this.damage);
            if (proj) proj.isPiercing = true; // Mark as piercing
            this.shootTimer = 0;
        }
    }

    attemptOrbitBlade(): void {
        // Spinning blade that orbits
        // This is handled differently - creates persistent blade effect
        if (!this.game.skillSystem) return;

        // Create orbiting blade effect
        this.game.skillSystem.activeEffects.push({
            type: 'ORBIT_BLADE',
            angle: this.angle,
            timer: 10,
            damage: this.damage,
            radius: 80,
            color: this.color,
            x: this.x,
            y: this.y,
            update: (dt: number, g: any) => {
                // Blade orbits around weapon position
            }
        });

        this.shootTimer = 0;
    }

    attemptMissile(): void {
        // Slow but powerful missile
        let closest: any = null;
        let minDist = Infinity;

        this.game.enemies.forEach((e: any) => {
            if (e.markedForDeletion) return;
            const dx = e.x - this.x;
            const dy = e.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.range * 1.2 && dist < minDist) {
                minDist = dist;
                closest = e;
            }
        });

        if (closest) {
            const angle = Math.atan2(closest.y - this.y, closest.x - this.x);
            const proj = this.game.spawnProjectile(this.x, this.y, angle, 350, this.damage * 2.5);
            if (proj) {
                proj.isHoming = true;
                proj.isExplosive = true;
            }
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
