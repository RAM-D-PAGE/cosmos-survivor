import { CONFIG } from '../core/Config';
import { EnemyStats } from '../core/Config';
import { ICollidable } from '../core/Types';

export class Enemy implements ICollidable {
    private game: any;
    public x: number;
    public y: number;
    public type: string;

    public radius: number = 20;
    public color: string = '#ff0055';
    public speed: number = 100;
    public health: number = 10;
    public maxHealth: number = 10;
    public value: number = 10;
    public contactDamage: number = 10;
    public markedForDeletion: boolean = false;
    public angle: number = 0;

    // Status Effects
    public frozen: boolean = false;
    private frozenTimer: number = 0;
    public poisoned: boolean = false;
    private poisonDamage: number = 0;
    private poisonTimer: number = 0;
    private poisonTick: number = 0;
    public doomed: boolean = false;
    private doomTimer: number = 0;
    private doomDamage: number = 0;

    // Type Specific
    private shootTimer: number = 0;
    private shootInterval: number = 0;
    private hasDuplicated: boolean = false;
    private duplicateThreshold: number = 0;
    private lastDamageType: string | null = null;
    private resistances: any = {};
    private adaptTimer: number = 0;
    private explosionRadius: number = 0;
    private explosionDamage: number = 0;
    private teleportTimer: number = 0;
    private teleportInterval: number = 0;
    public shieldMax: number = 0;
    public shield: number = 0;
    private shieldRegenTimer: number = 0;
    private healRadius: number = 0;
    private healRate: number = 0;
    private healTimer: number = 0;
    private spawnTimer: number = 0;
    private spawnInterval: number = 0;
    private maxSpawns: number = 0;
    private evasionChance: number = 0;
    private phaseTimer: number = 0;
    public isPhased: boolean = false;
    public alpha: number = 1;

    // Elite Modifiers
    public isElite: boolean = false;
    public eliteModifiers: string[] = [];
    // private vampiricHealPercent: number = 0.2; // Unused for now
    private summonTimer: number = 0;
    private summonInterval: number = 5;
    private regenRate: number = 0;
    public flashTimer: number = 0;

    public baseSpeed: number = 100;
    public slowFactor: number = 1;

    constructor(game: any, x: number, y: number, type: string = 'chaser') {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;

        const diffMult = game.difficultyMult || 1;
        const waveMult = game.mapSystem?.getDamageMultiplier() || 1;
        const scale = 1 + (this.game.difficultyMultiplier || 0);

        const typeKey = type.toUpperCase().replace('_', '');
        const cfg: EnemyStats = (CONFIG.ENEMY as any)[typeKey] || CONFIG.ENEMY.CHASER;

        this.radius = cfg.RADIUS || 20;
        this.color = cfg.COLOR || '#ff0055';
        this.baseSpeed = (cfg.SPEED || 100) * (1 + scale * 0.1);
        this.speed = this.baseSpeed;
        this.slowFactor = 1;
        this.health = (cfg.HP || 10) * scale * diffMult;
        this.maxHealth = this.health;
        this.value = cfg.VALUE || 10;
        this.contactDamage = (cfg.DAMAGE || 10) * waveMult * diffMult;

        this.initTypeSpecific(type, cfg, scale);

        // Auto-flag Boss types as Elite for indicators
        if (type.toLowerCase().includes('boss') || type === 'swarm_mother') {
            this.isElite = true;
            if (!this.eliteModifiers.length) {
                this.eliteModifiers.push('BOSS_TRAIT'); // Just to ensure it has some property if needed
            }
        }

    }

    initTypeSpecific(type: string, cfg: any, scale: number): void {
        switch (type) {
            case 'shooter':
                this.shootTimer = 0;
                this.shootInterval = 2.5 / scale;
                break;
            case 'duplicator':
                this.hasDuplicated = false;
                this.duplicateThreshold = 0.5;
                break;
            case 'adaptive':
                this.lastDamageType = null;
                this.resistances = {};
                this.adaptTimer = 0;
                break;
            case 'bomber':
                this.explosionRadius = 80;
                this.explosionDamage = 30 * scale;
                break;
            case 'teleporter':
                this.teleportTimer = 0;
                this.teleportInterval = 2.0;
                break;
            case 'shielder':
                this.shieldMax = cfg.SHIELD || 30;
                this.shield = this.shieldMax;
                this.shieldRegenTimer = 0;
                break;
            case 'healer':
                this.healRadius = 150;
                this.healRate = cfg.HEAL_RATE || 5;
                this.healTimer = 0;
                break;
            case 'swarm_mother':
                this.spawnTimer = 0;
                this.spawnInterval = 5.0;
                this.maxSpawns = 3;
                break;
            case 'ghost':
                this.evasionChance = cfg.EVASION || 0.5;
                this.phaseTimer = 0;
                this.isPhased = false;
                break;
        }
    }

    // Make this enemy an Elite with random modifiers
    makeElite(modifierCount: number = 2): void {
        this.isElite = true;

        const allModifiers = ['ARMORED', 'SWIFT', 'VAMPIRIC', 'EXPLOSIVE', 'SUMMONER', 'REGENERATING'];
        const shuffled = allModifiers.sort(() => Math.random() - 0.5);
        this.eliteModifiers = shuffled.slice(0, Math.min(modifierCount, allModifiers.length));

        // Apply modifiers
        for (const mod of this.eliteModifiers) {
            switch (mod) {
                case 'ARMORED':
                    // Damage reduction handled in takeDamage
                    break;
                case 'SWIFT':
                    this.speed *= 2;
                    break;
                case 'VAMPIRIC':
                    // this.vampiricHealPercent = 0.2;
                    break;
                case 'EXPLOSIVE':
                    // Explosion handled in die()
                    break;
                case 'SUMMONER':
                    this.summonInterval = 5;
                    this.summonTimer = 0;
                    break;
                case 'REGENERATING':
                    this.regenRate = this.maxHealth * 0.05; // 5% HP per second
                    break;
            }
        }

        // Elite visual enhancements
        this.radius *= 1.3;
        this.health *= 3;
        this.maxHealth = this.health;
        this.value *= 5;
        this.color = '#ffaa00'; // Gold color for Elite
    }

    update(dt: number): void {
        // Reset speed to base * slowFactor each frame
        this.speed = this.baseSpeed * this.slowFactor;
        // Decay slow factor back to 1
        if (this.slowFactor < 1) {
            this.slowFactor = Math.min(1, this.slowFactor + dt * 0.5); // Recover speed over time
        }

        if (this.frozen) {
            this.frozenTimer -= dt;
            if (this.frozenTimer <= 0) this.frozen = false;
            return; // Don't move if frozen
        }

        if (this.poisoned) {
            this.poisonTimer -= dt;
            let dmg = this.poisonDamage * dt;

            // Guard against NaN/Infinity (Bug Fix: Invincibility after Poison Cloud)
            if (!Number.isFinite(dmg)) dmg = 0;

            if (dmg > 0) {
                this.health -= dmg;
            }

            // Visual feedback every 0.5s
            this.poisonTick += dt;
            if (this.poisonTick >= 0.5) {
                this.poisonTick = 0;
                // Show accumulated damage (approx dmg * 0.5s worth? or just the DPS rate?)
                // Better to show the damage rate or small ticks.
                // Let's show integer damage
                this.game.spawnFloatingText(this.x, this.y - 10, Math.ceil(this.poisonDamage * 0.5).toString(), '#00ff00');
            }

            if (this.poisonTimer <= 0) this.poisoned = false;
            if (this.health <= 0) {
                this.die();
                return;
            }
        }

        if (this.doomed) {
            this.doomTimer -= dt;
            if (this.doomTimer <= 0) {
                this.takeDamage(this.doomDamage, 'doom');
                this.doomed = false;
            }
        }

        const player = this.game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        this.angle = Math.atan2(dy, dx);

        // Elite-specific updates
        if (this.isElite) {
            // Regenerating: heal over time
            if (this.eliteModifiers.includes('REGENERATING') && this.health < this.maxHealth) {
                this.health = Math.min(this.maxHealth, this.health + this.regenRate * dt);
            }

            // Summoner: spawn minions periodically
            if (this.eliteModifiers.includes('SUMMONER')) {
                this.summonTimer += dt;
                if (this.summonTimer >= this.summonInterval) {
                    this.summonTimer = 0;
                    this.summonMinion();
                }
            }
        }

        this.updateBehavior(dt, dx, dy, dist);

        // Emergency NaN recovery (Bug Fix: Invincibility after Poison Cloud)
        if (!Number.isFinite(this.health)) {
            console.warn('[Enemy] Health became NaN, resetting to 1');
            this.health = 1;
        }
    }

    summonMinion(): void {
        const angle = Math.random() * Math.PI * 2;
        const dist = 50;
        const x = this.x + Math.cos(angle) * dist;
        const y = this.y + Math.sin(angle) * dist;

        // Import Enemy dynamically to avoid circular deps
        const minion = new Enemy(this.game, x, y, 'swarmer');
        this.game.enemies.push(minion);
        this.game.spawnFloatingText(x, y, "SUMMONED!", "#ffaa00");
    }

    updateBehavior(dt: number, dx: number, dy: number, dist: number): void {
        switch (this.type) {
            case 'shooter': this.updateShooter(dt, dx, dy, dist); break;
            case 'duplicator': this.updateDuplicator(dt, dx, dy, dist); break;
            case 'adaptive': this.updateAdaptive(dt, dx, dy, dist); break;
            case 'bomber': this.updateBomber(dt, dx, dy, dist); break;
            case 'teleporter': this.updateTeleporter(dt, dx, dy, dist); break;
            case 'shielder': this.updateShielder(dt, dx, dy, dist); break;
            case 'healer': this.updateHealer(dt, dx, dy, dist); break;
            case 'swarm_mother': this.updateSwarmMother(dt, dx, dy, dist); break;
            case 'ghost': this.updateGhost(dt, dx, dy, dist); break;
            default:
                if (dist > 0) {
                    this.x += (dx / dist) * this.speed * dt;
                    this.y += (dy / dist) * this.speed * dt;
                }
        }
    }

    updateShooter(dt: number, dx: number, dy: number, dist: number): void {
        const maintainDist = 300;
        if (dist > maintainDist) {
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
        } else if (dist < maintainDist - 50) {
            this.x -= (dx / dist) * this.speed * dt;
            this.y -= (dy / dist) * this.speed * dt;
        }

        this.shootTimer += dt;
        if (this.shootTimer > this.shootInterval) {
            this.game.spawnProjectile(this.x, this.y, this.angle, 300, 10, true);
            this.shootTimer = 0;
        }
    }

    updateDuplicator(dt: number, dx: number, dy: number, dist: number): void {
        if (dist > 0) {
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
        }
        if (!this.hasDuplicated && this.health <= this.maxHealth * this.duplicateThreshold) {
            this.hasDuplicated = true;
            this.duplicate();
        }
    }

    duplicate(): void {
        for (let i = 0; i < 2; i++) {
            const angle = Math.random() * Math.PI * 2;
            const offset = 30;
            const newX = this.x + Math.cos(angle) * offset;
            const newY = this.y + Math.sin(angle) * offset;

            const clone = new Enemy(this.game, newX, newY, 'swarmer');
            clone.health = this.health * 0.3;
            clone.maxHealth = clone.health;
            clone.value = Math.floor(this.value * 0.3);
            this.game.enemies.push(clone);
        }
        this.game.spawnFloatingText(this.x, this.y, "SPLIT!", "#ff88ff");
    }

    updateAdaptive(dt: number, dx: number, dy: number, dist: number): void {
        if (dist > 0) {
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
        }
        if (this.lastDamageType) {
            this.adaptTimer += dt;
            if (this.adaptTimer > 0.5) {
                this.color = this.getAdaptColor();
            }
        }
    }

    getAdaptColor(): string {
        const colors: any = {
            'fire': '#ff4400',
            'ice': '#00ccff',
            'poison': '#00ff00',
            'physical': '#888888'
        };
        return colors[this.lastDamageType!] || '#88ffff';
    }

    updateBomber(dt: number, dx: number, dy: number, dist: number): void {
        if (dist > 0) {
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
        }
        if (dist < 50) this.color = '#ff0000';
    }

    updateTeleporter(dt: number, dx: number, dy: number, dist: number): void {
        this.teleportTimer += dt;
        if (this.teleportTimer >= this.teleportInterval) {
            this.teleport();
            this.teleportTimer = 0;
        }
        if (dist > 0) {
            this.x += (dx / dist) * this.speed * 0.3 * dt;
            this.y += (dy / dist) * this.speed * 0.3 * dt;
        }
    }

    teleport(): void {
        const player = this.game.player;
        const angle = Math.random() * Math.PI * 2;
        const dist = 100 + Math.random() * 150;
        this.x = player.x + Math.cos(angle) * dist;
        this.y = player.y + Math.sin(angle) * dist;
        this.game.spawnParticles(this.x, this.y, 5, '#8800ff');
    }

    updateShielder(dt: number, dx: number, dy: number, dist: number): void {
        if (dist > 0) {
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
        }
        if (this.shield < this.shieldMax) {
            this.shieldRegenTimer += dt;
            if (this.shieldRegenTimer >= 3.0) {
                this.shield = Math.min(this.shieldMax, this.shield + 5 * dt);
            }
        }
    }

    updateHealer(dt: number, dx: number, dy: number, dist: number): void {
        const idealDist = 200;
        if (dist > idealDist + 50) {
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
        } else if (dist < idealDist - 50) {
            this.x -= (dx / dist) * this.speed * dt;
            this.y -= (dy / dist) * this.speed * dt;
        }
        this.healTimer += dt;
        if (this.healTimer >= 1.0) {
            this.healNearbyAllies();
            this.healTimer = 0;
        }
    }

    healNearbyAllies(): void {
        this.game.enemies.forEach((e: any) => {
            if (e === this || e.markedForDeletion) return;
            const dx = e.x - this.x;
            const dy = e.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < this.healRadius && e.health < e.maxHealth) {
                e.health = Math.min(e.maxHealth, e.health + this.healRate);
                this.game.spawnFloatingText(e.x, e.y, `+${this.healRate}`, '#00ff88');
            }
        });
    }

    updateSwarmMother(dt: number, dx: number, dy: number, dist: number): void {
        if (dist > 0) {
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
        }
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnSwarmers();
            this.spawnTimer = 0;
        }
    }

    spawnSwarmers(): void {
        for (let i = 0; i < this.maxSpawns; i++) {
            const angle = (Math.PI * 2 / this.maxSpawns) * i;
            const offset = this.radius + 20;
            const newX = this.x + Math.cos(angle) * offset;
            const newY = this.y + Math.sin(angle) * offset;
            this.game.enemies.push(new Enemy(this.game, newX, newY, 'swarmer'));
        }
        this.game.spawnFloatingText(this.x, this.y, "SWARM!", "#ffff00");
    }

    updateGhost(dt: number, dx: number, dy: number, dist: number): void {
        if (dist > 0) {
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
        }
        this.phaseTimer += dt;
        this.isPhased = Math.sin(this.phaseTimer * 3) > 0.5;
        this.alpha = this.isPhased ? 0.3 : 0.8;
    }

    takeDamage(amount: number, damageType: string = 'physical'): void {
        // Guard against NaN/Infinity damage (Bug Fix: Invincibility after Poison Cloud)
        if (!Number.isFinite(amount) || amount <= 0) {
            return;
        }

        if (this.type === 'ghost' && this.isPhased && Math.random() < this.evasionChance) {
            this.game.spawnFloatingText(this.x, this.y - 20, "MISS", '#ffffff88');
            return;
        }
        if (this.type === 'shielder' && this.shield > 0) {
            const shieldDamage = Math.min(this.shield, amount);
            this.shield -= shieldDamage;
            amount -= shieldDamage;
            this.shieldRegenTimer = 0;
            if (amount <= 0) {
                this.game.spawnFloatingText(this.x, this.y - 20, "BLOCKED", '#0088ff');
                return;
            }
        }
        if (this.type === 'adaptive' && this.resistances[damageType]) {
            amount *= (1 - this.resistances[damageType]);
        }

        // Elite: Armored reduces damage by 50%
        if (this.isElite && this.eliteModifiers.includes('ARMORED')) {
            amount *= 0.5;
        }

        this.health -= amount;

        // Flash effect
        this.flashTimer = 0.1;

        this.game.spawnFloatingText(this.x, this.y - 20, Math.round(amount).toString(), this.isElite ? '#ffaa00' : '#ffffff');
        this.game.audio.playHit();

        // XP on Hit (User Request: Min 1, scaled by damage)
        const hitXp = Math.max(1, Math.floor(amount * 0.1));
        this.game.addExp(hitXp);

        if (this.type === 'adaptive') {
            this.lastDamageType = damageType;
            this.resistances[damageType] = Math.min(0.5, (this.resistances[damageType] || 0) + 0.1);
        }

        if (this.health <= 0) this.die();
    }

    die(): void {
        this.markedForDeletion = true;
        const expMult = this.game.mapSystem?.getExpMultiplier() || 1;
        const finalValue = Math.floor(this.value * expMult * (1 + (this.game.player.expBonus || 0)));
        this.game.spawnGem(this.x, this.y, finalValue);
        this.game.audio.playExplosion();

        // Health on Kill
        if (this.game.player.healthOnKill > 0) {
            const heal = this.game.player.healthOnKill;
            this.game.player.hp = Math.min(this.game.player.maxHp, this.game.player.hp + heal);
            this.game.spawnFloatingText(this.game.player.x, this.game.player.y, `+${heal}`, '#00ff88');
        }

        // Bomber or Explosive Elite explodes
        if (this.type === 'bomber' || (this.isElite && this.eliteModifiers.includes('EXPLOSIVE'))) {
            this.explode();
        }

        // Elite drop chance for rare loot
        if (this.isElite) {
            this.game.spawnFloatingText(this.x, this.y - 30, "ELITE DEFEATED!", "#ffaa00");
            // 10% chance to drop skill + Luck check
            const dropChance = 0.1 + (this.game.player.luck || 0) * 0.01;
            if (Math.random() < dropChance) {
                this.game.skillSystem?.generateBossSkillDrop();
            }
            // Elite always drops coin
            this.game.spawnCoin(this.x, this.y, 5);
        } else {
            // 20% chance for normal mobs
            if (Math.random() < 0.2) {
                this.game.spawnCoin(this.x, this.y, 1);
            }
        }
    }

    explode(): void {
        const player = this.game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.explosionRadius && !player.isInvulnerable) {
            player.hp -= this.explosionDamage;
            this.game.spawnFloatingText(player.x, player.y, `-${this.explosionDamage}`, '#ff4400');
        }
        this.game.spawnParticles(this.x, this.y, 20, '#ff4400');
        this.game.spawnFloatingText(this.x, this.y, "BOOM!", '#ff4400');
    }

    freeze(duration: number): void {
        this.frozen = true;
        this.frozenTimer = duration;
        this.game.audio.playFreeze();
    }

    poison(damagePerSec: number, duration: number): void {
        // Validate inputs to prevent NaN propagation (Bug Fix: Invincibility after Poison Cloud)
        if (!Number.isFinite(damagePerSec) || damagePerSec <= 0) return;
        if (!Number.isFinite(duration) || duration <= 0) return;

        this.poisoned = true;
        this.poisonDamage = damagePerSec;
        this.poisonTimer = duration;
    }

    markForDoom(damage: number, delay: number): void {
        this.doomed = true;
        this.doomDamage = damage;
        this.doomTimer = delay;
    }
}
