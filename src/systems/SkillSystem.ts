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
    public bagSkills: any[];
    public maxSkills: number;
    private mysticalSkills: string[];
    private skillKeys: string[];
    private skillDefinitions: any;
    private activeEffects: ActiveEffect[];

    constructor(game: any) {
        this.game = game;
        this.activeSkills = [];
        this.bagSkills = [];
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
        // Note: scaling is done on the COPY, original def untouched
        const scaledSkill = { ...skill };

        if (scaledSkill.damage) {
            scaledSkill.damage = this.getScaledDamage(scaledSkill.damage);
        }
        if (scaledSkill.damagePerSec) {
            scaledSkill.damagePerSec = this.getScaledDamage(scaledSkill.damagePerSec);
        }

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
            case 'DECOY': this.executeMirrorImage(this.game, scaledSkill); break;
            case 'CHAIN_DETONATE': this.executeChainExplosion(this.game, scaledSkill); break;
            case 'ORBIT_DAMAGE': this.executeBladeStorm(this.game, scaledSkill); break;
            case 'STUN_AOE': this.executeShieldBash(this.game, scaledSkill); break;
            case 'CONE_DOT': this.executeAcidSpray(this.game, scaledSkill); break;
            case 'FREEZE_AOE': this.executeFrostNova(this.game, scaledSkill); break;
            case 'AOE_STUN': this.executeThunderClap(this.game, scaledSkill); break;
            case 'PERSISTENT_PULL': this.executeGravityWell(this.game, scaledSkill); break;
            case 'SUMMON_CLONES': if ((this as any).executeCloneArmy) (this as any).executeCloneArmy(this.game, scaledSkill); break;
            case 'SCREEN_CLEAR': if ((this as any).executeArmageddon) (this as any).executeArmageddon(this.game, scaledSkill); break;
            case 'REWIND': if ((this as any).executeTimeReversal) (this as any).executeTimeReversal(this.game, scaledSkill); break;
            case 'DAMAGE_MULT': if ((this as any).executeInfinitePower) (this as any).executeInfinitePower(this.game, scaledSkill); break;
            case 'REGEN_ZONE': if ((this as any).executeHealAura) (this as any).executeHealAura(this.game, scaledSkill); break;
            case 'BUFF_SPEED': if ((this as any).executeSpeedBoost) (this as any).executeSpeedBoost(this.game, scaledSkill); break;
            case 'SELF_REVIVE': if ((this as any).executePhoenixRebirth) (this as any).executePhoenixRebirth(this.game, scaledSkill); break;
            case 'BLINK': (this as any).executeBlink(this.game, scaledSkill); break;
            default: console.warn('Unknown skill type:', skill.type);
        }
    }

    // Scale skill damage based on player's base damage
    getScaledDamage(baseDamage: number): number {
        const playerDamage = this.game.player?.damage || 10;
        // Formula: BaseSkill * (PlayerDamage / 10)
        // e.g. Player has 20 dmg (2x base), Skill deals 2x damage.
        // Used Max(1, ...) to avoid 0
        return Math.max(1, Math.round(baseDamage * (playerDamage / 10)));
    }

    equipSkill(skillId: string): boolean {
        const def = (this.skillDefinitions as any)[skillId];
        if (!def) return false;

        const skill = { ...def, currentCooldown: 0 };

        if (this.activeSkills.length < this.maxSkills) {
            this.activeSkills.push(skill);
            this.game.spawnFloatingText(this.game.player.x, this.game.player.y, `${def.name} Equipped!`, def.color);
        } else {
            this.bagSkills.push(skill);
            this.game.spawnFloatingText(this.game.player.x, this.game.player.y, `${def.name} -> Bag`, def.color);
        }

        if (def.isMystical && !this.mysticalSkills.includes(skillId)) {
            this.mysticalSkills.push(skillId);
        }

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

    executeMirrorImage(game: any, skill: any): void {
        const player = game.player;
        const count = skill.imageCount || 3;
        const duration = skill.duration || 6;

        game.spawnFloatingText(player.x, player.y, "MIRROR IMAGE!", skill.color);

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const dist = 60;

            this.activeEffects.push({
                type: 'DECOY',
                x: player.x + Math.cos(angle) * dist,
                y: player.y + Math.sin(angle) * dist,
                angle: angle,
                dist: dist,
                timer: duration,
                update: (dt, g) => {
                    const effect: any = this.activeEffects.find(e => e.type === 'DECOY' && e.angle === angle); // Simple identity check
                    if (!effect) return;

                    // Orbit player
                    effect.angle += dt * 2;
                    effect.x = g.player.x + Math.cos(effect.angle) * effect.dist;
                    effect.y = g.player.y + Math.sin(effect.angle) * effect.dist;

                    // Distract enemies (simple logic: enemies targeting player might stop moving or target decoy? 
                    // For now, just a visual + slight push or confuse logic could be added, but user request implies distraction.
                    // Let's make nearby enemies target the decoy temporarily if needed, but for now visual + damage absorbing or just logic placeholder)
                }
            });
        }
    }

    executeChainExplosion(game: any, skill: any): void {
        // This skill is passive-triggered on kill usually, but if active, it might just apply a buff or trigger once
        // Based on description "Enemies explode in chain reaction", it sounds like a buff that lasts for a duration or instant on screen
        // If it's active "Kill one enemy...", let's make it apply a specific debuff to all nearby enemies that makes them explode on death

        const center = this.getTargetPosition(game);
        game.spawnParticles(center.x, center.y, 10, skill.color);

        // Apply volatile status to nearby enemies
        game.enemies.forEach((e: any) => {
            if (e.markedForDeletion) return;
            const dx = e.x - center.x;
            const dy = e.y - center.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 250) {
                e.isVolatile = true; // Needs Enemy support, but we can fake it or modify Enemy later
                e.volatileDamage = skill.damage;
                e.volatileRange = skill.chainRange;
                game.spawnFloatingText(e.x, e.y, "VOLATILE", skill.color);
            }
        });
    }

    executeBladeStorm(game: any, skill: any): void {
        const count = skill.bladeCount || 6;
        const duration = skill.duration || 8;

        for (let i = 0; i < count; i++) {
            this.activeEffects.push({
                type: 'BLADE',
                angle: (Math.PI * 2 / count) * i,
                timer: duration,
                damage: skill.damage,
                radius: 100,
                color: skill.color,
                update: (dt, g) => {
                    const me: any = this.activeEffects.find(e => e.type === 'BLADE' && e.angle === (Math.PI * 2 / count) * i + (Date.now() / 1000)); // tricky to find self without ID
                    // Actually, simpler to just start update here
                }
            });
            // Better impl:
            const blade: any = {
                type: 'BLADE',
                angle: (Math.PI * 2 / count) * i,
                timer: duration,
                damage: skill.damage,
                radius: 120,
                color: skill.color,
                x: 0,
                y: 0,
                update: (dt: number, g: any) => {
                    blade.angle += dt * 5; // Spin speed
                    blade.x = g.player.x + Math.cos(blade.angle) * blade.radius;
                    blade.y = g.player.y + Math.sin(blade.angle) * blade.radius;

                    g.enemies.forEach((e: any) => {
                        const dx = e.x - blade.x;
                        const dy = e.y - blade.y;
                        if (Math.sqrt(dx * dx + dy * dy) < 30) {
                            e.takeDamage(skill.damage * dt * 5, 'blade'); // continuous damage
                        }
                    });
                }
            };
            this.activeEffects.push(blade);
        }
    }

    executeShieldBash(game: any, skill: any): void {
        const player = game.player;
        const mouse = game.input.getMousePosition();
        const camX = game.camera ? game.camera.x : 0;
        const camY = game.camera ? game.camera.y : 0;
        const targetX = mouse.x + camX;
        const targetY = mouse.y + camY;

        const angle = Math.atan2(targetY - player.y, targetX - player.x);
        const dashDist = 200;

        // Dash player
        player.x += Math.cos(angle) * dashDist;
        player.y += Math.sin(angle) * dashDist;

        // Damage along path roughly
        game.spawnParticles(player.x, player.y, 20, skill.color);
        game.enemies.forEach((e: any) => {
            const dx = e.x - player.x;
            const dy = e.y - player.y;
            if (Math.sqrt(dx * dx + dy * dy) < skill.range) {
                e.takeDamage(skill.damage, 'bash');
                e.freeze(skill.stunDuration);
                // Push back
                e.x += Math.cos(angle) * 100;
                e.y += Math.sin(angle) * 100;
            }
        });
    }

    executeAcidSpray(game: any, skill: any): void {
        const player = game.player;
        const mouse = game.input.getMousePosition();
        const target = { x: mouse.x + (game.camera?.x || 0), y: mouse.y + (game.camera?.y || 0) };
        const angle = Math.atan2(target.y - player.y, target.x - player.x);

        this.activeEffects.push({
            type: 'ACID_CONE',
            x: player.x,
            y: player.y, // Origin static or moving? Let's make it static spray
            angle: angle,
            timer: 0.5, // Visual flash
            update: (dt, g) => { }
        });

        // Logic
        game.enemies.forEach((e: any) => {
            const dx = e.x - player.x;
            const dy = e.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < skill.range) {
                const eAngle = Math.atan2(dy, dx);
                let diff = eAngle - angle;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;

                if (Math.abs(diff) < (skill.coneAngle * Math.PI / 180 / 2)) {
                    e.poison(skill.damagePerSec, skill.duration);
                }
            }
        });
    }

    executeFrostNova(game: any, skill: any): void {
        game.spawnParticles(game.player.x, game.player.y, 30, skill.color);
        game.enemies.forEach((e: any) => {
            if (e.markedForDeletion) return;
            const dist = Math.sqrt(Math.pow(e.x - game.player.x, 2) + Math.pow(e.y - game.player.y, 2));
            if (dist < skill.radius) {
                e.freeze(skill.freezeDuration);
            }
        });
    }

    executeThunderClap(game: any, skill: any): void {
        game.addScreenShake(0.5, 10);
        game.enemies.forEach((e: any) => {
            const dist = Math.sqrt(Math.pow(e.x - game.player.x, 2) + Math.pow(e.y - game.player.y, 2));
            if (dist < skill.radius) {
                e.takeDamage(skill.damage, 'thunder');
                e.freeze(skill.stunDuration); // Reusing freeze as stun
            }
        });
    }

    executeGravityWell(game: any, skill: any): void {
        const target = this.getTargetPosition(game);
        this.activeEffects.push({
            type: 'GRAVITY_WELL',
            x: target.x,
            y: target.y,
            timer: skill.duration,
            radius: skill.radius,
            color: skill.color,
            update: (dt, g) => {
                g.enemies.forEach((e: any) => {
                    const dx = target.x - e.x;
                    const dy = target.y - e.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < skill.radius) {
                        const force = skill.pullForce * dt;
                        e.x += (dx / dist) * force;
                        e.y += (dy / dist) * force;
                    }
                });
            }
        });
    }

    executeCloneArmy(game: any, skill: any): void {
        const count = skill.cloneCount || 3;
        for (let i = 0; i < count; i++) {
            // Simply spawn active effects that look like player and shoot?
            // Or simplified: Just 3 floating drones that shoot
            const offset = i * 50;
            this.activeEffects.push({
                type: 'CLONE',
                x: game.player.x + offset,
                y: game.player.y + offset,
                timer: skill.duration,
                fireTimer: 0,
                update: (dt, g) => {
                    const clone: any = this.activeEffects.find(e => e.type === 'CLONE' && Math.abs(e.x! - (g.player.x + offset)) < 10); // hacking identity
                    if (!clone) return;

                    // Follow player roughly
                    clone.x += (g.player.x + Math.cos(Date.now() / 500 + i) * 100 - clone.x) * dt * 2;
                    clone.y += (g.player.y + Math.sin(Date.now() / 500 + i) * 100 - clone.y) * dt * 2;

                    clone.fireTimer += dt;
                    if (clone.fireTimer > 0.5) {
                        // Find nearest enemy
                        const target = g.enemies[0]; // simplistic
                        if (target) {
                            const angle = Math.atan2(target.y - clone.y, target.x - clone.x);
                            g.spawnProjectile(clone.x, clone.y, angle, 400, 20);
                        }
                        clone.fireTimer = 0;
                    }
                }
            } as any);
        }
    }

    executeArmageddon(game: any, skill: any): void {
        game.addScreenShake(2.0, 20);
        game.enemies.forEach((e: any) => {
            // Screen check
            const dx = e.x - game.player.x;
            const dy = e.y - game.player.y;
            if (Math.abs(dx) < game.canvas.width && Math.abs(dy) < game.canvas.height) {
                e.takeDamage(99999, 'armageddon');
            }
        });
        game.spawnFloatingText(game.player.x, game.player.y, "ARMAGEDDON!", "#ff0000");
    }

    executeTimeReversal(game: any, skill: any): void {
        // Requires history tracking, which we don't have. 
        // Mock implementation: Full Heal + Teleport slightly back?
        game.player.hp = game.player.maxHp;
        game.spawnFloatingText(game.player.x, game.player.y, "TIME REVERSED (HP FULL)", "#00ffff");
    }

    executeInfinitePower(game: any, skill: any): void {
        const oldMult = game.player.damageMultiplier || 1;
        game.player.damageMultiplier = (oldMult) * skill.multiplier;
        game.spawnFloatingText(game.player.x, game.player.y, "INFINITE POWER!", skill.color);

        setTimeout(() => {
            game.player.damageMultiplier = oldMult;
        }, skill.duration * 1000);
    }

    executeHealAura(game: any, skill: any): void {
        this.activeEffects.push({
            type: 'HEAL_AURA',
            timer: skill.duration,
            healTimer: 0,
            update: (dt, g) => {
                const self: any = this.activeEffects.find(e => e.type === 'HEAL_AURA'); // simplistic
                if (!self) return;

                self.healTimer += dt;
                if (self.healTimer >= 1.0) {
                    g.player.hp = Math.min(g.player.maxHp, g.player.hp + (g.player.maxHp * skill.healPercent));
                    g.spawnFloatingText(g.player.x, g.player.y, "+HP", "#00ff00");
                    self.healTimer = 0;
                }
            }
        } as any);
    }

    executeSpeedBoost(game: any, skill: any): void {
        const oldSpeed = game.player.maxSpeed;
        game.player.maxSpeed *= skill.speedMult;
        this.activeEffects.push({
            type: 'SPEED_TRAIL',
            timer: skill.duration,
            update: (dt, g) => {
                g.spawnParticles(g.player.x, g.player.y, 1, '#00ff00');
            }
        });
        setTimeout(() => {
            game.player.maxSpeed = oldSpeed;
        }, skill.duration * 1000);
    }

    executePhoenixRebirth(game: any, skill: any): void {
        game.player.hasRevive = true;
        game.player.reviveHpPercent = skill.revivePercent;
        game.spawnFloatingText(game.player.x, game.player.y, "PHOENIX SOUL ACTIVE", skill.color);
    }

    executeBlink(game: any, skill: any): void {
        const mouse = game.input.getMousePosition();
        const camX = game.camera ? game.camera.x : 0;
        const camY = game.camera ? game.camera.y : 0;
        const targetX = mouse.x + camX;
        const targetY = mouse.y + camY;

        const dx = targetX - game.player.x;
        const dy = targetY - game.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxRange = skill.range || 400;

        let finalX = targetX;
        let finalY = targetY;

        if (dist > maxRange) {
            finalX = game.player.x + (dx / dist) * maxRange;
            finalY = game.player.y + (dy / dist) * maxRange;
        }

        // Spawn particles at old pos
        game.spawnParticles(game.player.x, game.player.y, 20, '#00ffff');

        // Move
        game.player.x = finalX;
        game.player.y = finalY;

        // Particles at new pos
        game.spawnParticles(finalX, finalY, 20, '#00ffff');
        game.audio.playDash(); // Reuse dash sound or need warp sound?
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
