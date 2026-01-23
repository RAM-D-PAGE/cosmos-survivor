import { CONFIG } from '../core/Config';

export class Player {
    private game: any;
    public x: number;
    public y: number;
    public radius: number;
    public color: string;

    // Physics
    public velocity: { x: number, y: number };
    public acceleration: number;
    public friction: number;
    public maxSpeed: number;

    // Combat Stats
    public baseFireRate: number;
    public fireRate: number;
    public damage: number;
    public projectileCount: number;
    public projectileSpeed: number;
    public shootTimer: number = 0;
    public fireRateMultiplier: number = 1.0;
    private fireTimer: number = 0;

    // Dash Stats
    public dashSpeed: number;
    public dashDuration: number;
    public dashCooldown: number;
    public dashTimer: number = 0;
    public dashCooldownTimer: number = 0;
    public isDashing: boolean = false;
    public isInvulnerable: boolean = false;

    // Health & Energy
    public maxHp: number;
    public hp: number;
    public maxEnergy: number;
    public energy: number;
    public energyRegen: number;
    public pickupRange: number;
    public hpRegen: number;
    public dashCount: number;
    public dashCharges: number;

    // Stats
    public angle: number = 0;

    // Upgrades
    public armor: number = 0;
    public damageReduction: number = 0;
    public invulnFrameDuration: number = 0.3; // Default 0.3s I-frames
    public reflectDamage: number = 0;
    public healthOnKill: number = 0;
    public gemMultiplier: number = 1.0;
    public critChance: number = 0;
    public piercing: number = 0;
    public chainCount: number = 0;
    public ricochet: number = 0;
    public lifeSteal: number = 0;
    public damageMultiplier: number = 1.0;
    public explosiveProjectiles: boolean = false;
    public homingProjectiles: boolean = false;
    public hasBerserker: boolean = false;
    public berserkerBonus: number = 0;
    public collisionDamage: number = 0;
    public shieldCharges: number = 0;
    public shieldCooldown: number = 0;
    public hasSecondWind: boolean = false;
    public secondWindHP: number = 0;
    public expBonus: number = 0;
    public luck: number = 0;
    public autoShoot: boolean = false;
    public autoAim: boolean = false;

    // Missing Props for CardSystem
    public dashDamage: number = 0;
    public hasAirDash: boolean = false;
    public canWallClimb: boolean = false;
    public bleedDamage: number = 0;
    public projectileSize: number = 1.0;
    public splitShot: number = 0;
    public explosionRadius: number = 0;
    public momentumDuration: number = 0;
    public dashArmorBonus: number = 0;
    public hasDashDefense: boolean = false;
    public shieldRegenSpeed: number = 0;
    public extraUpgradePicks: number = 0;

    // Skill System
    public skills: any = {};
    public baseStats: any;
    private dashDir: any = { x: 0, y: 0 };

    constructor(game: any) {
        this.game = game;
        this.x = game.canvas.width / 2;
        this.y = game.canvas.height / 2;
        this.radius = 15;
        this.color = '#00f0ff';

        this.velocity = { x: 0, y: 0 };
        this.acceleration = 1500;
        this.friction = 0.92;
        this.maxSpeed = CONFIG.PLAYER.BASE_SPEED;

        this.baseFireRate = CONFIG.PLAYER.BASE_FIRE_RATE;
        this.fireRate = this.baseFireRate;
        this.damage = CONFIG.PLAYER.BASE_DAMAGE;
        this.projectileCount = 1;
        this.projectileSpeed = 800;

        this.dashSpeed = CONFIG.PLAYER.DASH_SPEED;
        this.dashDuration = CONFIG.PLAYER.DASH_DURATION;
        this.dashCooldown = CONFIG.PLAYER.DASH_COOLDOWN;

        this.maxHp = 100;
        this.hp = this.maxHp;
        this.maxEnergy = 100;
        this.energy = this.maxEnergy;
        this.energyRegen = 20;
        this.pickupRange = 150;
        this.hpRegen = 0;
        this.dashCount = 1;
        this.dashCharges = this.dashCount;

        this.baseStats = {
            damage: CONFIG.PLAYER.BASE_DAMAGE,
            fireRate: CONFIG.PLAYER.BASE_FIRE_RATE,
            maxSpeed: CONFIG.PLAYER.BASE_SPEED,
            projectileSpeed: 800,
            projectileCount: 1,
            maxHp: 100,
            pickupRange: 150,
            hpRegen: 0
        };
    }

    addSkill(id: string, rarityMultiplier: number): void {
        if (!this.skills[id]) {
            this.skills[id] = { val: 0, count: 0, rarityMult: 0 };
        }
        if (this.skills[id].count < 5) this.skills[id].count++;
        if (rarityMultiplier > this.skills[id].rarityMult) this.skills[id].rarityMult = rarityMultiplier;
    }

    update(dt: number): void {
        // NaN protection for player stats
        if (!Number.isFinite(this.hp)) this.hp = this.maxHp || 100;
        if (!Number.isFinite(this.maxHp)) this.maxHp = 100;
        if (!Number.isFinite(this.energy)) this.energy = this.maxEnergy || 100;
        if (!Number.isFinite(this.maxEnergy)) this.maxEnergy = 100;

        if (this.energy < this.maxEnergy) {
            this.energy += this.energyRegen * dt;
            if (this.energy > this.maxEnergy) this.energy = this.maxEnergy;
        }

        if (this.hpRegen && this.hp < this.maxHp) {
            this.hp += this.hpRegen * dt;
            if (this.hp > this.maxHp) this.hp = this.maxHp;
        }

        this.fireRate = this.baseFireRate * this.fireRateMultiplier;
        const input = this.game.input;

        let ax = 0, ay = 0;
        if (input.isKeyPressed('KeyW') || input.isKeyPressed('ArrowUp')) ay = -1;
        if (input.isKeyPressed('KeyS') || input.isKeyPressed('ArrowDown')) ay = 1;
        if (input.isKeyPressed('KeyA') || input.isKeyPressed('ArrowLeft')) ax = -1;
        if (input.isKeyPressed('KeyD') || input.isKeyPressed('ArrowRight')) ax = 1;

        // Air Dash / Multi-Dash Logic
        const canDash = this.dashCharges > 0 && this.energy >= 30;
        const isDashAllowed = !this.isDashing || (this.hasAirDash && this.isDashing); // Allow chain dash if Air Dash

        if (input.isKeyPressed('Space') && canDash && isDashAllowed) {
            this.energy -= 30;
            this.dashCharges--;
            this.startDash(input);
        }

        if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= dt;

        if (this.isDashing) {
            this.dashTimer -= dt;
            if (this.dashTimer <= 0) {
                this.isDashing = false;
                this.isInvulnerable = false;
                this.velocity.x *= 0.5;
                this.velocity.y *= 0.5;
            } else {
                if (Math.random() > 0.5) this.game.spawnParticles(this.x, this.y, 1, '#00f0ff');
                // Keep invulnerable during entire dash window
                this.isInvulnerable = true;
            }
            this.velocity.x = this.dashDir.x * this.dashSpeed;
            this.velocity.y = this.dashDir.y * this.dashSpeed;
        } else {
            if (ax !== 0 || ay !== 0) {
                const len = Math.sqrt(ax * ax + ay * ay);
                ax /= len; ay /= len;
                this.velocity.x += ax * this.acceleration * dt;
                this.velocity.y += ay * this.acceleration * dt;
            }
            const frictionFactor = Math.pow(this.friction, dt * 60);
            this.velocity.x *= frictionFactor;
            this.velocity.y *= frictionFactor;
            if (Math.abs(this.velocity.x) < 10) this.velocity.x = 0;
            if (Math.abs(this.velocity.y) < 10) this.velocity.y = 0;
        }

        if (this.dashCharges < this.dashCount) {
            this.dashCooldownTimer -= dt;
            if (this.dashCooldownTimer <= 0) {
                this.dashCharges++;
                this.dashCooldownTimer = this.dashCooldown;
            }
        }

        const currentSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (currentSpeed > this.maxSpeed) {
            const scale = this.maxSpeed / currentSpeed;
            this.velocity.x *= scale;
            this.velocity.y *= scale;
        }

        if (isNaN(this.velocity.x)) this.velocity.x = 0;
        if (isNaN(this.velocity.y)) this.velocity.y = 0;

        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;

        // Bounds checking - keep player within reasonable world bounds
        // (Allow some overflow for gameplay, but prevent extreme values)
        const maxWorldSize = 100000;
        this.x = Math.max(-maxWorldSize, Math.min(maxWorldSize, this.x));
        this.y = Math.max(-maxWorldSize, Math.min(maxWorldSize, this.y));

        const mouse = input.getMousePosition();
        if (this.autoAim) {
            // Optimize: Only check enemies within reasonable range and cache result
            let closest = null;
            let minDistSq = 600 * 600; // Use squared distance to avoid sqrt
            const enemies = this.game.enemies;

            // Early exit optimization: limit search to nearby enemies
            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                if (e.markedForDeletion) continue;

                const dx = e.x - this.x;
                const dy = e.y - this.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < minDistSq) {
                    minDistSq = distSq;
                    closest = e;
                }
            }

            if (closest) {
                const dx = (closest as any).x - this.x;
                const dy = (closest as any).y - this.y;
                this.angle = Math.atan2(dy, dx);
            } else {
                // Fallback to mouse position if no enemy found
                const camX = this.game.camera ? this.game.camera.x : 0;
                const camY = this.game.camera ? this.game.camera.y : 0;
                const dx = mouse.x - (this.x - camX);
                const dy = mouse.y - (this.y - camY);
                this.angle = Math.atan2(dy, dx);
            }
        } else {
            const camX = this.game.camera ? this.game.camera.x : 0;
            const camY = this.game.camera ? this.game.camera.y : 0;
            const dx = mouse.x - (this.x - camX);
            const dy = mouse.y - (this.y - camY);
            this.angle = Math.atan2(dy, dx);
        }

        this.fireTimer = (this.fireTimer || 0) + dt;
        const fireInterval = 1 / Math.max(0.1, (this.baseFireRate * this.fireRateMultiplier));
        const isFiring = input.isMouseDown() || this.autoShoot;

        if (isFiring && this.fireTimer >= fireInterval) {
            this.fireTimer = 0;
            this.shoot();
        }
    }

    startDash(input: any): void {
        this.isDashing = true;
        this.dashTimer = this.dashDuration;
        this.isInvulnerable = true;

        let dx = 0, dy = 0;
        if (input.isKeyPressed('KeyW') || input.isKeyPressed('ArrowUp')) dy = -1;
        if (input.isKeyPressed('KeyS') || input.isKeyPressed('ArrowDown')) dy = 1;
        if (input.isKeyPressed('KeyA') || input.isKeyPressed('ArrowLeft')) dx = -1;
        if (input.isKeyPressed('KeyD') || input.isKeyPressed('ArrowRight')) dx = 1;

        if (dx === 0 && dy === 0) {
            this.dashDir = { x: Math.cos(this.angle), y: Math.sin(this.angle) };
        } else {
            const len = Math.sqrt(dx * dx + dy * dy);
            this.dashDir = { x: dx / len, y: dy / len };
        }

        this.game.spawnParticles(this.x, this.y, 10, '#00f0ff');
        this.game.audio.playDash();
    }

    shoot(): void {
        const damage = this.damage;
        const speed = this.projectileSpeed;
        const totalShots = this.projectileCount;
        const spread = 0.2;

        // Apply crit chance
        const finalDamage = (this.critChance && Math.random() < this.critChance)
            ? damage * 2
            : damage;

        for (let i = 0; i < totalShots; i++) {
            const angleOffset = totalShots > 1 ? (i - (totalShots - 1) / 2) * spread : 0;
            const proj = this.game.spawnProjectile(this.x, this.y, this.angle + angleOffset, speed, finalDamage);

            // Apply special properties from cards
            if (this.piercing > 0) {
                proj.isPiercing = true;
                proj.maxPierce = this.piercing;
            }
            if (this.explosiveProjectiles) {
                proj.isExplosive = true;
            }
            if (this.homingProjectiles) {
                proj.isHoming = true;
            }
        }
    }
}
