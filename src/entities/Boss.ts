import { CONFIG } from '../core/Config';

export class Boss {
    private game: any;
    public x: number;
    public y: number;
    public type: string;

    public radius: number = 20;
    public health: number = 100;
    public maxHealth: number = 100;
    public speed: number = 50;
    public color: string = '#ffffff';
    public value: number = 100;
    public damage: number = 10;

    public angle: number = 0;
    public markedForDeletion: boolean = false;

    // Status Effects
    public frozen: boolean = false;
    private frozenTimer: number = 0;
    public poisoned: boolean = false;
    private poisonDamage: number = 0;
    private poisonTimer: number = 0;
    public doomed: boolean = false;
    private doomTimer: number = 0;
    private doomDamage: number = 0;

    constructor(game: any, x: number, y: number, type: string = 'stage_boss') {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;

        const diffMult = game.difficultyMult || 1;

        if (this.type === 'miniboss') {
            const cfg = CONFIG.BOSS.MINI;
            this.radius = cfg.RADIUS;
            this.health = cfg.HP_BASE * game.level * diffMult;
            this.maxHealth = this.health;
            this.speed = cfg.SPEED;
            this.color = cfg.COLOR;
            this.value = cfg.VALUE;
            this.damage = cfg.DAMAGE * diffMult;
        } else if (this.type === 'secret') {
            const cfg = CONFIG.BOSS.SECRET;
            this.radius = cfg.RADIUS;
            this.health = cfg.HP_BASE * game.level * diffMult;
            this.maxHealth = this.health;
            this.speed = cfg.SPEED;
            this.color = cfg.COLOR;
            this.value = cfg.VALUE;
            this.damage = cfg.DAMAGE * diffMult;
        } else {
            const cfg = CONFIG.BOSS.STAGE;
            this.radius = cfg.RADIUS;
            this.health = cfg.HP_BASE * game.level * diffMult;
            this.maxHealth = this.health;
            this.speed = cfg.SPEED;
            this.color = cfg.COLOR;
            this.value = cfg.VALUE;
            this.damage = cfg.DAMAGE * diffMult;
        }
    }

    update(dt: number): void {
        if (this.frozen) {
            this.frozenTimer -= dt;
            if (this.frozenTimer <= 0) {
                this.frozen = false;
            }
            return;
        }

        if (this.poisoned) {
            this.poisonTimer -= dt;
            this.health -= this.poisonDamage * dt;
            if (this.poisonTimer <= 0) this.poisoned = false;
            if (this.health <= 0) {
                this.takeDamage(0);
                return;
            }
        }

        if (this.doomed) {
            this.doomTimer -= dt;
            if (this.doomTimer <= 0) {
                this.takeDamage(this.doomDamage);
                this.game.spawnFloatingText(this.x, this.y, "DOOM!", '#660000');
                this.doomed = false;
            }
        }

        const player = this.game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        this.angle = Math.atan2(dy, dx);

        if (dist > 1) {
            this.x += Math.cos(this.angle) * this.speed * dt;
            this.y += Math.sin(this.angle) * this.speed * dt;
        }
    }

    takeDamage(amount: number): void {
        this.health -= amount;
        this.game.spawnFloatingText(this.x, this.y - this.radius, Math.round(amount).toString(), '#fff');

        if (this.health <= 0) {
            this.markedForDeletion = true;
            this.game.spawnGem(this.x, this.y, this.value);
            this.game.spawnParticles(this.x, this.y, 50, this.color);
            this.game.audio.playExplosion();

            if (this.type === 'stage_boss') {
                this.game.mapSystem.bossDefeated();
                if (this.game.triggerBossReward) this.game.triggerBossReward();
            } else if (this.type === 'secret') {
                if (this.game.triggerSecretReward) this.game.triggerSecretReward();
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = this.color;
        ctx.beginPath();
        if (this.type === 'miniboss') {
            ctx.moveTo(this.radius, 0);
            ctx.lineTo(-this.radius, this.radius);
            ctx.lineTo(-this.radius, -this.radius);
        } else {
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                const rx = Math.cos(angle) * this.radius;
                const ry = Math.sin(angle) * this.radius;
                if (i === 0) ctx.moveTo(rx, ry);
                else ctx.lineTo(rx, ry);
            }
        }
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();

        const barWidth = this.radius * 2;
        const barHeight = 10;
        const pct = Math.max(0, this.health / this.maxHealth);

        ctx.fillStyle = '#550000';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 20, barWidth, barHeight);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 20, barWidth * pct, barHeight);
    }

    freeze(duration: number): void {
        this.frozen = true;
        this.frozenTimer = duration * 0.5;
        this.game.audio.playFreeze();
    }

    poison(damagePerSec: number, duration: number): void {
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
