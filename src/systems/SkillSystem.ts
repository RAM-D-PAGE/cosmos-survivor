import { SKILL_DATA } from '../data/SkillData';

// Temporary definition for effects until a better type is defined
interface ActiveEffect {
    type: string;
    timer: number;
    update: (dt: number, game: any) => void;
    x?: number;
    y?: number;
    radius?: number;
    color?: string;
    [key: string]: any;
}

export class SkillSystem {
    private game: any;
    public activeSkills: any[]; // ExtendedSkillDef[]
    public maxSkills: number;
    private mysticalSkills: string[];
    private skillKeys: string[];
    private skillDefinitions: any;
    private activeEffects: ActiveEffect[];

    constructor(game: any) {
        this.game = game;
        this.activeSkills = [];
        this.maxSkills = 3;
        this.mysticalSkills = [];
        this.skillKeys = ['Digit1', 'Digit2', 'Digit3'];
        this.skillDefinitions = SKILL_DATA;
        this.activeEffects = [];
    }

    update(dt: number): void {
        this.activeSkills.forEach(skill => {
            if (skill && skill.currentCooldown > 0) {
                skill.currentCooldown -= dt;
            }
        });

        this.activeEffects = this.activeEffects.filter(effect => {
            effect.timer -= dt;
            if (effect.update) effect.update(dt, this.game);
            return effect.timer > 0;
        });

        const input = this.game.input;
        this.skillKeys.forEach((key, index) => {
            if (input.isKeyPressed(key) && this.activeSkills[index]) {
                this.tryActivateSkill(index);
            }
        });
    }

    tryActivateSkill(index: number): void {
        const skill = this.activeSkills[index];
        if (!skill || skill.currentCooldown > 0) return;

        this.executeSkill(skill);
        skill.currentCooldown = skill.cooldown;
        this.game.audio.playSkill();

        if (skill.isMystical) {
            this.game.audio.playMystical();
        }
    }

    executeSkill(skill: any): void {
        // Scale damage with player base damage for variety
        const scaledSkill = { ...skill, damage: this.getScaledDamage(skill.damage || 0) };

        switch (skill.type) {
            case 'AOE_DOT_PULL': this.executeBlackHole(this.game, scaledSkill); break;
            case 'AOE_SCATTER': this.executeMeteorShower(this.game, scaledSkill); break;
            case 'GLOBAL_FREEZE': this.executeTimeStop(this.game, scaledSkill); break;
            case 'SINGLE_DELAYED': this.executeDoom(this.game, scaledSkill); break;
            case 'AOE_PULL_EXPLODE': this.executeDoom(this.game, scaledSkill); break;
            case 'AOE_SCATTER_INSTANT': this.executeLightningStorm(this.game, scaledSkill); break;
            case 'SELF_BUFF': this.executeDivineShield(this.game, scaledSkill); break;
            case 'AOE_EXECUTE': this.executeSoulHarvest(this.game, scaledSkill); break;
            case 'PROJECTILE_EXPLODE': this.executeFireball(this.game, scaledSkill); break;
            case 'PROJECTILE_FREEZE': this.executeIceball(this.game, scaledSkill); break;
            case 'AOE_ZONE': this.executePoisonCloud(this.game, scaledSkill); break;
            case 'AOE_KNOCKBACK': this.executeShockwave(this.game, scaledSkill); break;
            default: console.warn('Unknown skill type:', skill.type);
        }
    }

    // Scale skill damage based on player's base damage
    getScaledDamage(baseDamage: number): number {
        const playerDamage = this.game.player?.damage || 10;
        // Skill base damage * (1 + player damage bonus / 20)
        // This means +20 player damage = +100% skill damage
        return Math.round(baseDamage * (1 + (playerDamage - 10) / 20));
    }

    equipSkill(skillId: string): boolean {
        if (this.activeSkills.length >= this.maxSkills) {
            this.game.spawnFloatingText(this.game.player.x, this.game.player.y, "Skill Slots Full!", "#ff0000");
            return false;
        }

        const def = (this.skillDefinitions as any)[skillId];
        if (!def) return false;

        const skill = { ...def, currentCooldown: 0 };
        this.activeSkills.push(skill);

        if (def.isMystical && !this.mysticalSkills.includes(skillId)) {
            this.mysticalSkills.push(skillId);
        }

        this.game.spawnFloatingText(this.game.player.x, this.game.player.y, `${def.name} Equipped!`, def.color);
        return true;
    }

    generateBossSkillDrop(): any {
        const available = Object.keys(this.skillDefinitions).filter(id => {
            const def = (this.skillDefinitions as any)[id];
            return def.isMystical && !this.mysticalSkills.includes(id);
        });

        if (available.length === 0) {
            return this.generateRandomSkill('RARE');
        }

        const randomId = available[Math.floor(Math.random() * available.length)];
        return (this.skillDefinitions as any)[randomId];
    }

    generateRandomSkill(minRarity: string = 'UNCOMMON'): any {
        const rarityOrder = ['UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];
        const minIndex = rarityOrder.indexOf(minRarity);

        const available = Object.values(this.skillDefinitions).filter((def: any) => {
            const index = rarityOrder.indexOf(def.rarity);
            return index >= minIndex;
        });

        return available[Math.floor(Math.random() * available.length)];
    }

    getTargetPosition(game: any): { x: number, y: number } {
        const mouse = game.input.getMousePosition();
        const camX = game.camera ? game.camera.x : 0;
        const camY = game.camera ? game.camera.y : 0;
        return { x: mouse.x + camX, y: mouse.y + camY };
    }

    // --- Execution Methods (Simplified for TS, keeping logic) ---

    executeBlackHole(game: any, skill: any): void {
        const center = this.getTargetPosition(game);
        this.activeEffects.push({
            type: 'BLACK_HOLE',
            x: center.x,
            y: center.y,
            radius: skill.radius,
            damage: skill.damage,
            timer: skill.duration,
            info: skill, // Store full skill info if needed
            update: (dt, g) => {
                g.enemies.forEach((e: any) => {
                    if (e.markedForDeletion) return;
                    const dx = center.x - e.x;
                    const dy = center.y - e.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < skill.radius && dist > 0) {
                        const force = 200 * dt;
                        e.x += (dx / dist) * force;
                        e.y += (dy / dist) * force;
                        e.takeDamage(skill.damage * dt, 'void');
                    }
                });
            }
        });
    }

    executeMeteorShower(game: any, skill: any): void {
        const center = this.getTargetPosition(game);
        for (let i = 0; i < skill.count; i++) {
            setTimeout(() => {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 200;
                const x = center.x + Math.cos(angle) * dist;
                const y = center.y + Math.sin(angle) * dist;
                game.spawnParticles(x, y, 15, skill.color);
                game.enemies.forEach((e: any) => {
                    if (e.markedForDeletion) return;
                    const dx = e.x - x;
                    const dy = e.y - y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < skill.radius) e.takeDamage(skill.damage, 'fire');
                });
            }, i * 200);
        }
    }

    executeTimeStop(game: any, skill: any): void {
        game.enemies.forEach((e: any) => {
            if (!e.markedForDeletion) e.freeze(skill.duration);
        });
        game.spawnFloatingText(game.player.x, game.player.y, "TIME STOP!", "#ffffff");
    }

    executeDoom(game: any, skill: any): void {
        const target = this.getTargetPosition(game);
        const radius = skill.radius || 180;
        const pullForce = skill.pullForce || 300;
        const duration = skill.delay || 3;
        const damage = skill.damage || 200;

        game.spawnFloatingText(target.x, target.y, "DOOM VORTEX!", skill.color);

        this.activeEffects.push({
            type: 'doom_vortex',
            timer: duration,
            x: target.x,
            y: target.y,
            radius: radius,
            color: skill.color,
            pullForce: pullForce,
            damage: damage,
            update: (dt: number, g: any) => {
                // Pull enemies toward center
                g.enemies.forEach((e: any) => {
                    if (e.markedForDeletion) return;
                    const dx = target.x - e.x;
                    const dy = target.y - e.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < radius && dist > 10) {
                        const pullStrength = (1 - dist / radius) * pullForce * dt;
                        e.x += (dx / dist) * pullStrength;
                        e.y += (dy / dist) * pullStrength;
                    }
                });
            }
        } as any);

        // Schedule explosion
        setTimeout(() => {
            game.enemies.forEach((e: any) => {
                if (e.markedForDeletion) return;
                const dx = e.x - target.x;
                const dy = e.y - target.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < radius * 1.2) {
                    e.takeDamage(damage, 'doom');
                }
            });
            game.spawnFloatingText(target.x, target.y, `BOOM! -${damage}`, '#ff0044');
            game.addScreenShake(0.3, 8);

            // Spawn explosion particles
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 100 + Math.random() * 200;
                game.particlePool.spawn(
                    target.x, target.y,
                    Math.cos(angle) * speed, Math.sin(angle) * speed,
                    0.5, skill.color, 6
                );
            }
        }, duration * 1000);
    }

    executeLightningStorm(game: any, skill: any): void {
        const center = this.getTargetPosition(game);
        for (let i = 0; i < skill.strikes; i++) {
            setTimeout(() => {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * skill.radius;
                const x = center.x + Math.cos(angle) * dist;
                const y = center.y + Math.sin(angle) * dist;
                game.spawnParticles(x, y, 5, skill.color);
                game.enemies.forEach((e: any) => {
                    if (e.markedForDeletion) return;
                    const dx = e.x - x;
                    const dy = e.y - y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 50) e.takeDamage(skill.damage, 'lightning');
                });
            }, i * 100);
        }
    }

    executeDivineShield(game: any, skill: any): void {
        game.player.isInvulnerable = true;
        game.spawnFloatingText(game.player.x, game.player.y, "DIVINE SHIELD!", skill.color);
        this.activeEffects.push({
            type: 'DIVINE_SHIELD',
            timer: skill.duration,
            update: (dt, g) => { }
        });
        setTimeout(() => {
            game.player.isInvulnerable = false;
        }, skill.duration * 1000);
    }

    executeSoulHarvest(game: any, skill: any): void {
        const center = this.getTargetPosition(game);
        let kills = 0;
        game.spawnParticles(center.x, center.y, 20, skill.color);
        game.enemies.forEach((e: any) => {
            if (e.markedForDeletion) return;
            const dx = e.x - center.x;
            const dy = e.y - center.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < skill.radius) {
                const hpPercent = e.health / e.maxHealth;
                if (hpPercent <= skill.threshold) {
                    e.takeDamage(e.health + 1, 'soul');
                    kills++;
                }
            }
        });
        game.spawnFloatingText(game.player.x, game.player.y, `HARVESTED ${kills}!`, skill.color);
    }

    executeFireball(game: any, skill: any): void {
        const player = game.player;
        const mouse = game.input.getMousePosition();
        const camX = game.camera ? game.camera.x : 0;
        const camY = game.camera ? game.camera.y : 0;
        const targetX = mouse.x + camX;
        const targetY = mouse.y + camY;
        const angle = Math.atan2(targetY - player.y, targetX - player.x);

        this.activeEffects.push({
            type: 'FIREBALL',
            x: player.x,
            y: player.y,
            angle: angle,
            speed: skill.speed,
            radius: 20,
            explosionRadius: skill.radius,
            damage: skill.damage,
            timer: 3,
            color: skill.color,
            update: (dt, g) => {
                const effect: any = this.activeEffects.find(e => e.type === 'FIREBALL');
                if (!effect) return;
                effect.x += Math.cos(effect.angle) * effect.speed * dt;
                effect.y += Math.sin(effect.angle) * effect.speed * dt;

                g.enemies.forEach((e: any) => {
                    if (e.markedForDeletion) return;
                    const dx = e.x - effect.x;
                    const dy = e.y - effect.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < effect.radius + e.radius) {
                        this.explodeFireball(g, effect);
                        effect.timer = 0;
                    }
                });
            }
        });
    }

    explodeFireball(game: any, effect: any): void {
        game.spawnParticles(effect.x, effect.y, 20, effect.color);
        game.enemies.forEach((e: any) => {
            if (e.markedForDeletion) return;
            const dx = e.x - effect.x;
            const dy = e.y - effect.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < effect.explosionRadius) e.takeDamage(effect.damage, 'fire');
        });
    }

    executeIceball(game: any, skill: any): void {
        const player = game.player;
        const mouse = game.input.getMousePosition();
        const camX = game.camera ? game.camera.x : 0;
        const camY = game.camera ? game.camera.y : 0;
        const targetX = mouse.x + camX;
        const targetY = mouse.y + camY;
        const angle = Math.atan2(targetY - player.y, targetX - player.x);

        this.activeEffects.push({
            type: 'ICEBALL',
            x: player.x,
            y: player.y,
            angle: angle,
            speed: skill.speed,
            radius: 15,
            explosionRadius: skill.radius,
            damage: skill.damage,
            freezeDuration: skill.freezeDuration,
            timer: 3,
            color: skill.color,
            update: (dt, g) => {
                const effect: any = this.activeEffects.find(e => e.type === 'ICEBALL');
                if (!effect) return;
                effect.x += Math.cos(effect.angle) * effect.speed * dt;
                effect.y += Math.sin(effect.angle) * effect.speed * dt;

                g.enemies.forEach((e: any) => {
                    if (e.markedForDeletion) return;
                    const dx = e.x - effect.x;
                    const dy = e.y - effect.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < effect.radius + e.radius) {
                        this.explodeIceball(g, effect);
                        effect.timer = 0;
                    }
                });
            }
        });
    }

    explodeIceball(game: any, effect: any): void {
        game.spawnParticles(effect.x, effect.y, 15, effect.color);
        game.enemies.forEach((e: any) => {
            if (e.markedForDeletion) return;
            const dx = e.x - effect.x;
            const dy = e.y - effect.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < effect.explosionRadius) {
                e.takeDamage(effect.damage, 'ice');
                e.freeze(effect.freezeDuration);
            }
        });
    }

    executePoisonCloud(game: any, skill: any): void {
        const center = this.getTargetPosition(game);
        this.activeEffects.push({
            type: 'POISON_CLOUD',
            x: center.x,
            y: center.y,
            radius: skill.radius,
            damagePerSec: skill.damagePerSec,
            timer: skill.duration,
            color: skill.color,
            update: (dt, g) => {
                const effect: any = this.activeEffects.find(e => e.type === 'POISON_CLOUD');
                if (!effect) return;
                g.enemies.forEach((e: any) => {
                    if (e.markedForDeletion) return;
                    const dx = e.x - effect.x;
                    const dy = e.y - effect.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < effect.radius) e.poison(effect.damagePerSec, 1);
                });
            }
        });
    }

    executeShockwave(game: any, skill: any): void {
        const player = game.player;
        game.spawnParticles(player.x, player.y, 20, skill.color);
        game.enemies.forEach((e: any) => {
            if (e.markedForDeletion) return;
            const dx = e.x - player.x;
            const dy = e.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < skill.radius && dist > 0) {
                e.takeDamage(skill.damage, 'physical');
                e.x += (dx / dist) * skill.knockback;
                e.y += (dy / dist) * skill.knockback;
            }
        });
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const time = Date.now() / 100;

        this.activeEffects.forEach(effect => {
            ctx.save();
            switch (effect.type) {
                case 'BLACK_HOLE':
                    const bhr = effect.radius || 200;

                    // Outer accretion disk
                    const bhGradient = ctx.createRadialGradient(effect.x!, effect.y!, 0, effect.x!, effect.y!, bhr);
                    bhGradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
                    bhGradient.addColorStop(0.3, 'rgba(50, 0, 100, 0.6)');
                    bhGradient.addColorStop(0.7, 'rgba(100, 0, 200, 0.3)');
                    bhGradient.addColorStop(1, 'rgba(150, 0, 255, 0)');
                    ctx.fillStyle = bhGradient;
                    ctx.beginPath();
                    ctx.arc(effect.x!, effect.y!, bhr, 0, Math.PI * 2);
                    ctx.fill();

                    // Swirling light rings
                    for (let i = 0; i < 6; i++) {
                        const angle = (i / 6) * Math.PI * 2 + time * 0.5;
                        const ringR = bhr * (0.4 + i * 0.1);
                        ctx.beginPath();
                        ctx.arc(effect.x!, effect.y!, ringR, angle, angle + 1);
                        ctx.strokeStyle = `rgba(200, 100, 255, ${0.5 - i * 0.08})`;
                        ctx.lineWidth = 3 - i * 0.3;
                        ctx.stroke();
                    }

                    // Center event horizon
                    ctx.beginPath();
                    ctx.arc(effect.x!, effect.y!, 20, 0, Math.PI * 2);
                    ctx.fillStyle = '#000000';
                    ctx.shadowBlur = 30;
                    ctx.shadowColor = '#aa00ff';
                    ctx.fill();
                    break;

                case 'POISON_CLOUD':
                    const pcr = effect.radius || 150;

                    // Toxic fog layers
                    for (let layer = 0; layer < 3; layer++) {
                        const layerR = pcr * (0.6 + layer * 0.2);
                        const opacity = 0.25 - layer * 0.05;
                        const offset = Math.sin(time + layer) * 10;

                        ctx.beginPath();
                        ctx.arc(effect.x! + offset, effect.y! + offset * 0.5, layerR, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(0, 255, 50, ${opacity})`;
                        ctx.fill();
                    }

                    // Bubbling particles
                    for (let i = 0; i < 8; i++) {
                        const angle = (i / 8) * Math.PI * 2 + time;
                        const dist = pcr * 0.5 + Math.sin(time * 2 + i) * 20;
                        const px = effect.x! + Math.cos(angle) * dist;
                        const py = effect.y! + Math.sin(angle) * dist;

                        ctx.beginPath();
                        ctx.arc(px, py, 5 + Math.sin(time + i) * 2, 0, Math.PI * 2);
                        ctx.fillStyle = '#88ff00';
                        ctx.fill();
                    }
                    break;

                case 'FIREBALL':
                    const fbr = effect.radius || 15;

                    // Fiery trail
                    const fbGradient = ctx.createRadialGradient(effect.x!, effect.y!, 0, effect.x!, effect.y!, fbr * 2);
                    fbGradient.addColorStop(0, '#ffffff');
                    fbGradient.addColorStop(0.2, '#ffff00');
                    fbGradient.addColorStop(0.5, '#ff6600');
                    fbGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
                    ctx.fillStyle = fbGradient;
                    ctx.beginPath();
                    ctx.arc(effect.x!, effect.y!, fbr * 2, 0, Math.PI * 2);
                    ctx.fill();

                    // Core fireball
                    ctx.beginPath();
                    ctx.arc(effect.x!, effect.y!, fbr, 0, Math.PI * 2);
                    ctx.fillStyle = '#ff4400';
                    ctx.shadowBlur = 30;
                    ctx.shadowColor = '#ff8800';
                    ctx.fill();
                    break;

                case 'ICEBALL':
                    const ibr = effect.radius || 15;

                    // Frost aura
                    const ibGradient = ctx.createRadialGradient(effect.x!, effect.y!, 0, effect.x!, effect.y!, ibr * 2);
                    ibGradient.addColorStop(0, '#ffffff');
                    ibGradient.addColorStop(0.3, '#88ffff');
                    ibGradient.addColorStop(0.7, '#0088ff');
                    ibGradient.addColorStop(1, 'rgba(0, 100, 255, 0)');
                    ctx.fillStyle = ibGradient;
                    ctx.beginPath();
                    ctx.arc(effect.x!, effect.y!, ibr * 2, 0, Math.PI * 2);
                    ctx.fill();

                    // Ice crystal core
                    ctx.beginPath();
                    ctx.arc(effect.x!, effect.y!, ibr, 0, Math.PI * 2);
                    ctx.fillStyle = '#00ffff';
                    ctx.shadowBlur = 25;
                    ctx.shadowColor = '#00ffff';
                    ctx.fill();
                    break;

                case 'DIVINE_SHIELD':
                    const dsr = 50;
                    const px = this.game.player.x;
                    const py = this.game.player.y;

                    // Golden aura layers
                    for (let l = 0; l < 3; l++) {
                        const lr = dsr - l * 5;
                        ctx.beginPath();
                        ctx.arc(px, py, lr, 0, Math.PI * 2);
                        ctx.strokeStyle = `rgba(255, 255, 100, ${0.8 - l * 0.2})`;
                        ctx.lineWidth = 4 - l;
                        ctx.shadowBlur = 20;
                        ctx.shadowColor = '#ffff00';
                        ctx.stroke();
                    }

                    // Sparkle particles
                    for (let i = 0; i < 6; i++) {
                        const sparkAngle = (i / 6) * Math.PI * 2 + time * 0.3;
                        const spx = px + Math.cos(sparkAngle) * dsr;
                        const spy = py + Math.sin(sparkAngle) * dsr;

                        ctx.beginPath();
                        ctx.arc(spx, spy, 4, 0, Math.PI * 2);
                        ctx.fillStyle = '#ffffff';
                        ctx.fill();
                    }
                    break;

                case 'doom_vortex':
                    // Dark swirling vortex
                    // time is already defined in outer scope
                    const r = effect.radius || 180;

                    // Outer glow
                    const gradient = ctx.createRadialGradient(effect.x!, effect.y!, 0, effect.x!, effect.y!, r);
                    gradient.addColorStop(0, 'rgba(100, 0, 0, 0.8)');
                    gradient.addColorStop(0.5, 'rgba(150, 0, 50, 0.4)');
                    gradient.addColorStop(1, 'rgba(200, 0, 100, 0)');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(effect.x!, effect.y!, r, 0, Math.PI * 2);
                    ctx.fill();

                    // Swirling lines
                    for (let i = 0; i < 8; i++) {
                        const angle = (i / 8) * Math.PI * 2 + time;
                        const x1 = effect.x! + Math.cos(angle) * r * 0.3;
                        const y1 = effect.y! + Math.sin(angle) * r * 0.3;
                        const x2 = effect.x! + Math.cos(angle + 0.5) * r;
                        const y2 = effect.y! + Math.sin(angle + 0.5) * r;

                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.strokeStyle = '#ff0066';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }

                    // Center symbol
                    ctx.beginPath();
                    ctx.arc(effect.x!, effect.y!, 15, 0, Math.PI * 2);
                    ctx.fillStyle = '#660000';
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = '#ff0000';
                    ctx.fill();
                    break;
            }
            ctx.restore();
        });
    }

    reset(): void {
        this.activeSkills = [];
        this.activeEffects = [];
    }
}
