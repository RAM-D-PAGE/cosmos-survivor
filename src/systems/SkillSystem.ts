
import { SKILL_DATA } from '../data/SkillData';
import { ActiveEffect, SkillType } from '../core/SkillTypes';
import { safeDamage, safeRadius, safeDuration, safeNum, safePercent, canApplyDamage, safeHP, canApplyHeal } from '../utils/NaNGuard';

export class SkillSystem {
    private readonly game: any;
    public activeSkills: any[]; // ExtendedSkillDef[]
    public bagSkills: any[];
    public maxSkills: number;
    private mysticalSkills: string[];
    private readonly skillKeys: string[];
    private readonly skillDefinitions: any;
    private activeEffects: ActiveEffect[];
    private readonly execMap: Partial<Record<SkillType, (game: any, skill: any) => void>>;

    constructor(game: any) {
        this.game = game;
        this.activeSkills = [];
        this.activeSkills = [];
        this.bagSkills = [];
        this.maxSkills = 9;
        this.mysticalSkills = [];
        this.skillKeys = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9'];
        this.skillDefinitions = SKILL_DATA;
        this.activeEffects = [];

        // Map skill types to their executors to avoid an oversized switch
        this.execMap = {
            [SkillType.AOE_DOT_PULL]: this.executeBlackHole.bind(this),
            [SkillType.AOE_SCATTER]: this.executeMeteorShower.bind(this),
            [SkillType.GLOBAL_FREEZE]: this.executeTimeStop.bind(this),
            [SkillType.AOE_PULL_EXPLODE]: this.executeDoom.bind(this),
            [SkillType.AOE_SCATTER_INSTANT]: this.executeLightningStorm.bind(this),
            [SkillType.SELF_BUFF]: this.executeDivineShield.bind(this),
            [SkillType.AOE_EXECUTE]: this.executeSoulHarvest.bind(this),
            [SkillType.PROJECTILE_EXPLODE]: this.executeFireball.bind(this),
            [SkillType.PROJECTILE_FREEZE]: this.executeIceball.bind(this),
            [SkillType.AOE_ZONE]: this.executePoisonCloud.bind(this),
            [SkillType.AOE_KNOCKBACK]: this.executeShockwave.bind(this),
            [SkillType.DECOY]: this.executeMirrorImage.bind(this),
            [SkillType.CHAIN_DETONATE]: this.executeChainExplosion.bind(this),
            [SkillType.ORBIT_DAMAGE]: this.executeBladeStorm.bind(this),
            [SkillType.STUN_AOE]: this.executeShieldBash.bind(this),
            [SkillType.CONE_DOT]: this.executeAcidSpray.bind(this),
            [SkillType.FREEZE_AOE]: this.executeFrostNova.bind(this),
            [SkillType.AOE_STUN]: this.executeThunderClap.bind(this),
            [SkillType.PERSISTENT_PULL]: this.executeGravityWell.bind(this),
            [SkillType.SUMMON_CLONES]: this.executeCloneArmy.bind(this),
            [SkillType.SCREEN_CLEAR]: this.executeArmageddon.bind(this),
            [SkillType.REWIND]: this.executeTimeReversal.bind(this),
            [SkillType.DAMAGE_MULT]: this.executeInfinitePower.bind(this),
            [SkillType.REGEN_ZONE]: this.executeHealAura.bind(this),
            [SkillType.BUFF_SPEED]: this.executeSpeedBoost.bind(this),
            [SkillType.SELF_REVIVE]: this.executePhoenixRebirth.bind(this),
            [SkillType.BLINK]: this.executeBlink.bind(this),
            [SkillType.SLOW_FIELD]: this.executeSlowField.bind(this),
            [SkillType.QUICK_HEAL]: this.executeQuickHeal.bind(this),
            [SkillType.ELECTRIC_FIELD]: this.executePoisonCloud.bind(this), // Re-use logic, maybe distinct visual eventually
            [SkillType.CLOUD_PIERCING]: this.executeCloudPiercing.bind(this),
            [SkillType.VOID_ERASURE]: this.executeVoidErasure.bind(this),
            [SkillType.BEAM_ERASURE]: this.executeVoidErasure.bind(this), // Reuse logic
            [SkillType.DASH_SLASH]: this.executeShieldBash.bind(this), // Reuse dash logic
            [SkillType.DIMENSION_RIFT]: this.executeBlackHole.bind(this), // Reuse logic
            [SkillType.AOE_DELAYED_NUKE]: this.executeSupernova.bind(this),
            [SkillType.SUMMON_MINION]: this.executeVoidGate.bind(this),
            [SkillType.GLOBAL_FREEZE_SHATTER]: this.executeAbsoluteZero.bind(this),
            // New Skill Executors
            [SkillType.LASER_BEAM]: this.executePlasmaLance.bind(this),
            [SkillType.ORBITAL_STRIKE]: this.executeOrbitalBombardment.bind(this),
            [SkillType.LIFE_DRAIN]: this.executeVampireTouch.bind(this),
            [SkillType.CHAIN_LIGHTNING]: this.executeChainLightning.bind(this),
            [SkillType.BARRIER_BURST]: this.executeNovaBarrier.bind(this),
        };
    }

    reset(): void {
        this.activeEffects = [];
        this.mysticalSkills = [];
        this.activeSkills = [];
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

            if (effect.timer <= 0) {
                if (effect.onExpire) effect.onExpire(this.game);
                return false;
            }
            return true;
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

        // Hook: Mastery System
        if (this.game.skillMasterySystem) {
            this.game.skillMasterySystem.applyMasteryBonuses(skill);
        }

        this.executeSkill(skill);
        skill.currentCooldown = skill.cooldown;
        this.game.audio?.playSkill();

        // Hook: XP Gain
        if (this.game.skillMasterySystem) {
            const skillId = skill.id || skill.name;
            this.game.skillMasterySystem.addExperience(skillId, 1);
        }

        if (skill.isMystical) {
            this.game.audio?.playMystical();
        }
    }

    executeSkill(skill: any): void {
        const scaledSkill = { ...skill };

        if (scaledSkill.damage) {
            scaledSkill.damage = this.getScaledDamage(scaledSkill.damage);
        }
        if (scaledSkill.damagePerSec) {
            scaledSkill.damagePerSec = this.getScaledDamage(scaledSkill.damagePerSec);
        }

        const executor = this.execMap[skill.type as SkillType];
        if (executor) {
            executor(this.game, scaledSkill);
        } else {
            console.warn(`[SkillSystem] No executor for type: ${skill.type}`);
        }
    }

    getScaledDamage(baseDamage: number): number {
        const playerDamage = this.game.player?.damage || 10;
        return Math.max(1, Math.round(baseDamage * (playerDamage / 10)));
    }

    get bagCapacity(): number {
        return this.maxSkills;
    }

    equipSkill(skillId: string): boolean {
        const def = this.skillDefinitions[skillId];
        if (!def) return false;

        const existingActive = this.activeSkills.find(s => s.id === skillId);
        const maxStacks = def.maxStacks || 3;

        if (existingActive) {
            if ((existingActive.count || 1) < maxStacks) {
                existingActive.count = (existingActive.count || 1) + 1;
                this.applyStackBuff(existingActive);
                this.game.spawnFloatingText(this.game.player.x, this.game.player.y, `${def.name} UPGRADED! (Lv ${existingActive.count})`, def.color);
                return true;
            }
            return false;
        }

        const existingBag = this.bagSkills.find(s => s.id === skillId);
        if (existingBag) {
            if ((existingBag.count || 1) < maxStacks) {
                existingBag.count = (existingBag.count || 1) + 1;
                this.applyStackBuff(existingBag);
                this.game.spawnFloatingText(this.game.player.x, this.game.player.y, `${def.name} UPGRADED! (Lv ${existingBag.count})`, def.color);
                return true;
            }
            return false;
        }

        const skill = { ...def, currentCooldown: 0, count: 1 };

        if (this.activeSkills.length < this.maxSkills) {
            this.activeSkills.push(skill);
            this.game.spawnFloatingText(this.game.player.x, this.game.player.y, `${def.name} Acquired!`, def.color);
        } else {
            // Check Bag Limit
            if (this.bagSkills.length < this.bagCapacity) {
                this.bagSkills.push(skill);
                this.game.spawnFloatingText(this.game.player.x, this.game.player.y, `${def.name} -> Bag`, def.color);
            } else {
                this.game.spawnFloatingText(this.game.player.x, this.game.player.y, "BAG FULL!", "#ff0000");
                return false;
            }
        }

        if (def.isMystical && !this.mysticalSkills.includes(skillId)) {
            this.mysticalSkills.push(skillId);
        }

        if (this.game.synergySystem) {
            this.game.synergySystem.checkSynergies();
        }

        return true;
    }

    applyStackBuff(skill: any): void {
        const count = skill.count || 1;
        const max = skill.maxStacks || 3;
        const multiplier = 1.2;

        if (skill.damage) skill.damage = Math.round(skill.damage * multiplier);
        if (skill.damagePerSec) skill.damagePerSec = Math.round(skill.damagePerSec * multiplier);
        if (skill.radius) skill.radius = Math.round(skill.radius * 1.1);
        if (skill.duration) skill.duration = Number.parseFloat((skill.duration * 1.1).toFixed(1));

        if (count >= max) {
            if (skill.cooldown) skill.cooldown = Number.parseFloat((skill.cooldown * 0.85).toFixed(1));
        }
    }

    generateBossSkillDrop(): any {
        const available = Object.keys(this.skillDefinitions).filter(id => {
            const def = this.skillDefinitions[id];
            return def.isMystical && !this.mysticalSkills.includes(id);
        });

        if (available.length === 0) {
            return this.generateRandomSkill('RARE');
        }

        const randomId = available[Math.floor(Math.random() * available.length)];
        return this.skillDefinitions[randomId];
    }

    generateRandomSkill(minRarity: string = 'UNCOMMON'): any {
        const rarityOrder = ['UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC', 'GOD'];
        const minIndex = rarityOrder.indexOf(minRarity);

        const available = Object.values(this.skillDefinitions).filter((def: any) => {
            const index = rarityOrder.indexOf(def.rarity);
            return index >= minIndex;
        });

        if (available.length === 0) return null;
        return available[Math.floor(Math.random() * available.length)];
    }

    getTargetPosition(game: any): { x: number, y: number } {
        const mouse = game.input.getMousePosition();
        const camX = game.camera ? game.camera.x : 0;
        const camY = game.camera ? game.camera.y : 0;
        return { x: mouse.x + camX, y: mouse.y + camY };
    }

    // ==========================================
    // EXECUTION LOGIC
    // ==========================================

    executeBlackHole(game: any, skill: any): void {
        const center = this.getTargetPosition(game);
        // NaN guard: validate skill parameters using utilities
        const radius = safeRadius(skill.radius, 150);
        const damage = safeDamage(skill.damage, 50);
        const duration = safeDuration(skill.duration, 3);

        this.activeEffects.push({
            type: 'BLACK_HOLE',
            x: center.x,
            y: center.y,
            radius: radius,
            damage: damage,
            timer: duration,
            update: (dt, g) => {
                g.enemies.forEach((e: any) => {
                    if (e.markedForDeletion) return;
                    const dx = center.x - e.x;
                    const dy = center.y - e.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < radius && dist > 0) {
                        const force = 200 * dt;
                        e.x += (dx / dist) * force;
                        e.y += (dy / dist) * force;
                        const tickDamage = damage * dt;
                        if (canApplyDamage(tickDamage)) {
                            e.takeDamage(tickDamage, 'void');
                        }
                    }
                });
            }
        });
    }

    executeMeteorShower(game: any, skill: any): void {
        const center = this.getTargetPosition(game);
        // NaN guard: validate skill parameters using utilities
        const count = safeNum(skill.count, 5);
        const radius = safeRadius(skill.radius, 80);
        const damage = safeDamage(skill.damage, 100);

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 200;
                const x = center.x + Math.cos(angle) * dist;
                const y = center.y + Math.sin(angle) * dist;
                game.spawnParticles(x, y, 15, skill.color || '#ff6600');
                game.enemies.forEach((e: any) => {
                    if (e.markedForDeletion) return;
                    if (Math.hypot(e.x - x, e.y - y) < radius) {
                        if (canApplyDamage(damage)) {
                            e.takeDamage(damage, 'fire');
                        }
                    }
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
        // NaN guard: validate and provide fallbacks using utilities
        const radius = safeRadius(skill.radius, 180);
        const pullForce = safeNum(skill.pullForce, 300);
        const duration = safeDuration(skill.delay, 3);
        const damage = safeDamage(skill.damage, 200);

        game.spawnFloatingText(target.x, target.y, "DOOM VORTEX!", skill.color || '#ff0044');

        this.activeEffects.push({
            type: 'doom_vortex',
            timer: duration,
            x: target.x,
            y: target.y,
            radius: radius,
            color: skill.color || '#ff0044',
            update: (dt: number, g: any) => {
                g.enemies.forEach((e: any) => {
                    if (e.markedForDeletion) return;
                    const dx = target.x - e.x;
                    const dy = target.y - e.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < radius && dist > 10) {
                        const pullStrength = (1 - dist / radius) * pullForce * dt;
                        if (Number.isFinite(pullStrength)) {
                            e.x += (dx / dist) * pullStrength;
                            e.y += (dy / dist) * pullStrength;
                        }
                    }
                });
            }
        } as any);

        setTimeout(() => {
            game.enemies.forEach((e: any) => {
                if (e.markedForDeletion) return;
                const dx = e.x - target.x;
                const dy = e.y - target.y;
                const dist = Math.hypot(dx, dy);
                if (dist < radius * 1.2) {
                    if (canApplyDamage(damage)) {
                        e.takeDamage(damage, 'doom');
                    }
                }
            });
            game.spawnFloatingText(target.x, target.y, `BOOM! -${damage}`, '#ff0044');
            game.addScreenShake(0.3, 8);
            game.spawnParticles(target.x, target.y, 30, skill.color || '#ff0044');
        }, duration * 1000);
    }

    executeLightningStorm(game: any, skill: any): void {
        const center = this.getTargetPosition(game);
        // NaN guard: validate skill parameters using utilities
        const strikes = safeNum(skill.strikes, 5);
        const radius = safeRadius(skill.radius, 150);
        const damage = safeDamage(skill.damage, 60);
        const isSlash = skill.renderStyle === 'slash';

        for (let i = 0; i < strikes; i++) {
            setTimeout(() => {
                let x, y;
                // For Hinokami, try to target a random enemy within radius to guarantee hits
                if (isSlash) {
                    const nearby = game.enemies.filter((e: any) => {
                        const d = Math.hypot(e.x - center.x, e.y - center.y);
                        return !e.markedForDeletion && d < radius;
                    });

                    if (nearby.length > 0) {
                        const target = nearby[Math.floor(Math.random() * nearby.length)];
                        x = target.x;
                        y = target.y;
                    } else {
                        // random fallback
                        const angle = Math.random() * Math.PI * 2;
                        const dist = Math.random() * radius;
                        x = center.x + Math.cos(angle) * dist;
                        y = center.y + Math.sin(angle) * dist;
                    }
                } else {
                    // Classic lightning behavior (random)
                    const angle = Math.random() * Math.PI * 2;
                    const dist = Math.random() * radius;
                    x = center.x + Math.cos(angle) * dist;
                    y = center.y + Math.sin(angle) * dist;
                }

                if (isSlash) {
                    game.spawnParticles(x, y, 5, skill.color || '#ffee00');
                    game.audio?.playSlash?.();
                } else {
                    game.spawnParticles(x, y, 5, skill.color || '#ffee00');
                }

                game.enemies.forEach((e: any) => {
                    if (e.markedForDeletion) return;
                    const dx = e.x - x;
                    const dy = e.y - y;
                    const d = Math.hypot(dx, dy);
                    // Increased hit radius for slash (was 50) to ensure it feels generous
                    const hitRadius = isSlash ? 80 : 50;
                    if (d < hitRadius && canApplyDamage(damage)) {
                        e.takeDamage(damage, isSlash ? 'slash' : 'lightning');
                    }
                });
            }, i * 100);
        }
    }

    // Divine Shield now uses onExpire for safety
    executeDivineShield(game: any, skill: any): void {
        game.player.isInvulnerable = true;
        game.spawnFloatingText(game.player.x, game.player.y, skill.name === 'Infinity Barrier' ? "INFINITY" : "DIVINE SHIELD!", skill.color);

        this.activeEffects.push({
            type: 'DIVINE_SHIELD',
            x: game.player.x,
            y: game.player.y,
            timer: skill.duration,
            // If slowPercent is defined (Infinity), we slow projectiles
            slowPercent: skill.slowPercent,
            update: (dt: number, g: any) => {
                // If this effect has slowPercent, slow enemy projectiles
                if (skill.slowPercent) {
                    g.projectilePool.active.forEach((p: any) => {
                        if (p.isEnemy) {
                            const dx = p.x - g.player.x;
                            const dy = p.y - g.player.y;
                            if (dx * dx + dy * dy < 300 * 300) { // 300 range aura
                                p.speed = Math.max(10, p.speed * (1 - skill.slowPercent * dt * 10)); // Drastic slow
                            }
                        }
                    });
                }
            },
            onExpire: (g: any) => {
                g.player.isInvulnerable = false;
            }
        });
    }

    executeSoulHarvest(game: any, skill: any): void {
        const center = this.getTargetPosition(game);
        let kills = 0;
        // NaN guard: validate skill parameters using utilities
        const radius = safeRadius(skill.radius, 200);
        const threshold = safeNum(skill.threshold, 0.2);

        game.spawnParticles(center.x, center.y, 20, skill.color || '#8b00ff');
        game.enemies.forEach((e: any) => {
            if (e.markedForDeletion) return;
            const dx = e.x - center.x;
            const dy = e.y - center.y;
            const dist = Math.hypot(dx, dy);
            if (dist < radius) {
                const hpPercent = Number.isFinite(e.health) && Number.isFinite(e.maxHealth) && e.maxHealth > 0
                    ? e.health / e.maxHealth : 1;
                if (hpPercent <= threshold) {
                    const killDamage = Number.isFinite(e.health) ? e.health + 1 : 1;
                    e.takeDamage(killDamage, 'soul');
                    kills++;
                }
            }
        });
        game.spawnFloatingText(game.player.x, game.player.y, `HARVESTED ${kills}!`, skill.color || '#8b00ff');
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
                    const dist = Math.hypot(dx, dy);
                    if (dist < effect.radius + e.radius) {
                        this.explodeFireball(g, effect);
                        effect.timer = 0;
                    }
                });
            }
        });
    }

    explodeFireball(game: any, effect: any): void {
        game.spawnParticles(effect.x, effect.y, 20, effect.color || '#ff6600');
        game.enemies.forEach((e: any) => {
            if (e.markedForDeletion) return;
            const dx = e.x - effect.x;
            const dy = e.y - effect.y;
            const dist = Math.hypot(dx, dy);
            const explosionRadius = safeRadius(effect.explosionRadius, 80);
            const damage = safeDamage(effect.damage, 50);
            if (dist < explosionRadius) {
                if (canApplyDamage(damage)) {
                    e.takeDamage(damage, 'fire');
                }
            }
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
                    const dist = Math.hypot(dx, dy);
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
            const dist = Math.hypot(dx, dy);
            if (dist < effect.explosionRadius) {
                e.takeDamage(effect.damage, 'ice');
                e.freeze(effect.freezeDuration);
            }
        });
    }

    executePoisonCloud(game: any, skill: any): void {
        const center = this.getTargetPosition(game);

        // Validate skill values with fallbacks using utilities
        const damagePerSec = safeDamage(skill.damagePerSec, 15);
        const duration = safeDuration(skill.duration, 5);
        const radius = safeRadius(skill.radius, 180);

        const effect: any = {
            type: 'POISON_CLOUD',
            x: center.x,
            y: center.y,
            radius: radius,
            damagePerSec: damagePerSec,
            timer: duration,
            color: skill.color || '#00ff00'
        };

        effect.update = (_dt: number, g: any) => {
            // Now safely using 'effect' from closure
            g.enemies.forEach((e: any) => {
                if (e.markedForDeletion) return;
                const dx = e.x - effect.x;
                const dy = e.y - effect.y;
                const dist = Math.hypot(dx, dy);
                if (dist < effect.radius) {
                    e.poison(effect.damagePerSec, 1);
                }
            });
        };

        this.activeEffects.push(effect);
    }

    executeShockwave(game: any, skill: any): void {
        const player = game.player;
        // NaN guard: validate skill parameters using utilities
        const radius = safeRadius(skill.radius, 120);
        const damage = safeDamage(skill.damage, 80);
        const knockback = safeNum(skill.knockback, 100);

        game.spawnParticles(player.x, player.y, 20, skill.color || '#ffcc00');
        game.enemies.forEach((e: any) => {
            if (e.markedForDeletion) return;
            const dx = e.x - player.x;
            const dy = e.y - player.y;
            const dist = Math.hypot(dx, dy);
            if (dist < radius && dist > 0) {
                if (canApplyDamage(damage)) {
                    e.takeDamage(damage, 'physical');
                }
                if (Number.isFinite(knockback)) {
                    e.x += (dx / dist) * knockback;
                    e.y += (dy / dist) * knockback;
                }
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
                update: (dt: number, g: any) => {
                    const effect: any = this.activeEffects.find(e => e.type === 'DECOY' && e.angle === angle);
                    if (!effect) return;
                    effect.angle += dt * 2;
                    effect.x = g.player.x + Math.cos(effect.angle) * effect.dist;
                    effect.y = g.player.y + Math.sin(effect.angle) * effect.dist;
                }
            } as any);
        }
    }

    executeChainExplosion(game: any, skill: any): void {
        const center = this.getTargetPosition(game);
        game.spawnParticles(center.x, center.y, 10, skill.color);
        game.enemies.forEach((e: any) => {
            if (e.markedForDeletion) return;
            const dx = e.x - center.x;
            const dy = e.y - center.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 250) {
                e.isVolatile = true;
                e.volatileDamage = skill.damage;
                e.volatileRange = skill.chainRange;
                game.spawnFloatingText(e.x, e.y, "VOLATILE", skill.color);
            }
        });
    }

    executeBladeStorm(_game: any, skill: any): void {
        const count = skill.bladeCount || 6;
        const duration = skill.duration || 8;

        for (let i = 0; i < count; i++) {
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
                    blade.angle += dt * 5;
                    blade.x = g.player.x + Math.cos(blade.angle) * blade.radius;
                    blade.y = g.player.y + Math.sin(blade.angle) * blade.radius;

                    g.enemies.forEach((e: any) => {
                        const dx = e.x - blade.x;
                        const dy = e.y - blade.y;
                        if (Math.hypot(dx, dy) < 30) {
                            e.takeDamage(skill.damage * dt * 5, 'blade');
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

        player.isInvulnerable = true;
        setTimeout(() => { player.isInvulnerable = false; }, 300);

        player.x += Math.cos(angle) * dashDist;
        player.y += Math.sin(angle) * dashDist;

        game.spawnParticles(player.x, player.y, 20, skill.color);
        game.enemies.forEach((e: any) => {
            const dx = e.x - player.x;
            const dy = e.y - player.y;
            if (Math.hypot(dx, dy) < skill.range) {
                e.takeDamage(skill.damage, 'bash');
                e.freeze(skill.stunDuration);
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
            y: player.y,
            angle: angle,
            timer: 0.5,
            update: (_dt: number, _g: any) => { }
        } as any);

        game.enemies.forEach((e: any) => {
            const dx = e.x - player.x;
            const dy = e.y - player.y;
            const dist = Math.hypot(dx, dy);
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
            const dist = Math.hypot(e.x - game.player.x, e.y - game.player.y);
            if (dist < skill.radius) {
                e.freeze(skill.freezeDuration);
            }
        });
    }

    executeThunderClap(game: any, skill: any): void {
        game.addScreenShake(0.5, 10);
        game.enemies.forEach((e: any) => {
            const dist = Math.hypot(e.x - game.player.x, e.y - game.player.y);
            if (dist < skill.radius) {
                e.takeDamage(skill.damage, 'thunder');
                e.freeze(skill.stunDuration);
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
            update: (dt: number, g: any) => {
                const self: any = this.activeEffects.find(e => e.type === 'GRAVITY_WELL' && e.x === target.x);
                if (!self) return;
                g.enemies.forEach((e: any) => {
                    const dx = target.x - e.x;
                    const dy = target.y - e.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < skill.radius) {
                        const force = skill.pullForce * dt;
                        e.x += (dx / dist) * force;
                        e.y += (dy / dist) * force;
                    }
                });
            }
        } as any);
    }

    executeCloneArmy(game: any, skill: any): void {
        const count = skill.cloneCount || 3;
        for (let i = 0; i < count; i++) {
            const offset = i * 50;
            this.activeEffects.push({
                type: 'CLONE',
                x: game.player.x + offset,
                y: game.player.y + offset,
                timer: skill.duration,
                fireTimer: 0,
                update: (dt: number, g: any) => {
                    const clone: any = this.activeEffects.find(e => e.type === 'CLONE' && e.x !== undefined && Math.abs(e.x - (g.player.x + offset)) < 1000);
                    if (!clone) return;

                    clone.x += (g.player.x + Math.cos(Date.now() / 500 + i) * 100 - clone.x) * dt * 2;
                    clone.y += (g.player.y + Math.sin(Date.now() / 500 + i) * 100 - clone.y) * dt * 2;

                    clone.fireTimer += dt;
                    if (clone.fireTimer > 0.5) {
                        const target = g.enemies[0];
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

    executeArmageddon(game: any, _skill: any): void {
        game.addScreenShake(2, 20);
        game.enemies.forEach((e: any) => {
            const dx = e.x - game.player.x;
            const dy = e.y - game.player.y;
            if (Math.abs(dx) < game.canvas.width && Math.abs(dy) < game.canvas.height) {
                e.takeDamage(99999, 'armageddon');
            }
        });
        game.spawnFloatingText(game.player.x, game.player.y, "ARMAGEDDON!", "#ff0000");
    }

    executeTimeReversal(game: any, _skill: any): void {
        game.player.hp = game.player.maxHp;
        game.spawnFloatingText(game.player.x, game.player.y, "TIME REVERSED (HP FULL)", "#00ffff");
    }

    executeInfinitePower(game: any, skill: any): void {
        const oldMult = game.player.damageMultiplier || 1;
        game.player.damageMultiplier = (oldMult) * skill.multiplier;
        game.spawnFloatingText(game.player.x, game.player.y, "INFINITE POWER!", skill.color);

        this.activeEffects.push({
            type: 'INFINITE_POWER', // New effect type to track duration
            timer: skill.duration,
            update: (_dt: number, _g: any) => { },
            onExpire: (g: any) => {
                g.player.damageMultiplier /= skill.multiplier;
                g.spawnFloatingText(g.player.x, g.player.y, "Power Down", "#cccccc");
            }
        });
    }

    executeSupernova(game: any, skill: any): void {
        const center = { x: game.player.x, y: game.player.y - 100 }; // Floating above player
        game.spawnFloatingText(game.player.x, game.player.y, "SUPERNOVA CHARGING...", skill.color);

        // Vibration / Rumble effect
        game.addScreenShake(0.2, 5);

        this.activeEffects.push({
            type: 'SUPERNOVA_CHARGE',
            x: center.x,
            y: center.y,
            radius: 50,
            maxRadius: 300,
            timer: skill.duration,
            color: skill.color,
            update: (dt: number, g: any) => {
                const self: any = this.activeEffects.find(e => e.type === 'SUPERNOVA_CHARGE');
                if (!self) return;
                self.x = g.player.x;
                self.y = g.player.y - 100;
                // Grow logic
                self.radius += dt * 50;
                // Visual only (particles)
                if (Math.random() < 0.3) {
                    g.spawnParticles(self.x + (Math.random() - 0.5) * self.radius, self.y + (Math.random() - 0.5) * self.radius, 1, skill.color);
                }
            },
            onExpire: (g: any) => {
                // EXPLOSION
                g.addScreenShake(1.0, 30);
                // Center explosion on the visual sun (y - 100)
                const explosionX = g.player.x;
                const explosionY = g.player.y - 100;

                g.enemies.forEach((e: any) => {
                    if (e.markedForDeletion) return;
                    // Screen wide Nuke
                    // Check if on screen or close enough
                    const dist = Math.hypot(e.x - explosionX, e.y - explosionY);
                    if (dist < skill.radius) {
                        e.takeDamage(skill.damage, 'supernova');
                    }
                });
                for (let i = 0; i < 50; i++) {
                    g.spawnParticles(explosionX, explosionY, 10, '#ffffff'); // Flash
                }
                g.spawnFloatingText(g.player.x, g.player.y, "SUPERNOVA!!!", "#ff0000");
                g.audio?.playExplosion?.();
            }
        });
    }

    executeVoidGate(game: any, skill: any): void {
        const center = this.getTargetPosition(game);
        game.spawnFloatingText(center.x, center.y, "VOID GATE OPENED", skill.color);

        this.activeEffects.push({
            type: 'VOID_GATE',
            x: center.x,
            y: center.y,
            timer: skill.duration,
            spawnTimer: 0,
            spawnInterval: 0.5,
            count: skill.count || 5,
            update: (dt: number, g: any) => {
                const self: any = this.activeEffects.find(e => e.type === 'VOID_GATE' && e.x === center.x);
                if (!self) return;

                self.spawnTimer += dt;
                if (self.spawnTimer >= self.spawnInterval) {
                    self.spawnTimer = 0;
                    // Spawn Wisp logic
                    this.spawnVoidWisp(g, self.x, self.y, skill);
                }

                // Portal visual
                g.spawnParticles(self.x, self.y, 2, skill.color);
            }
        });
    }

    spawnVoidWisp(game: any, x: number, y: number, skill: any): void {
        // Increase radius and speed for better "tracking" feel
        game.projectilePool.get({
            x: x,
            y: y,
            angle: Math.random() * Math.PI * 2,
            speed: 500, // Faster
            damage: skill.damage,
            radius: 30, // Much bigger hit box (was 8)
            duration: 5,
            color: '#aa00ff',
            penetration: 1,
            isEnemy: false,
        });

        // Simple fix: find nearest enemy and shoot at them
        const nearest = game.enemies.find((e: any) => !e.markedForDeletion);
        if (nearest) {
            const angle = Math.atan2(nearest.y - y, nearest.x - x);
            const proj = game.projectilePool.active[game.projectilePool.active.length - 1]; // Hacky grab, works because we just added it
            if (proj) {
                proj.angle = angle;
                proj.velocity.x = Math.cos(angle) * proj.speed;
                proj.velocity.y = Math.sin(angle) * proj.speed;
            }
        }
    }

    executeAbsoluteZero(game: any, skill: any): void {
        game.addScreenShake(0.5, 15);
        game.spawnFloatingText(game.player.x, game.player.y, "ABSOLUTE ZERO", skill.color);

        // Freeze everyone
        game.enemies.forEach((e: any) => {
            if (!e.markedForDeletion) {
                e.freeze(skill.duration);
                // Visual tint?
                // Assuming enemy has tint support or we spawn particles on them
                game.spawnParticles(e.x, e.y, 5, "#00ffff");
            }
        });

        // Shatter Effect after delay
        this.activeEffects.push({
            type: 'SHATTER_TIMER',
            timer: skill.duration,
            update: (_dt: number, _g: any) => { },
            onExpire: (g: any) => {
                g.enemies.forEach((e: any) => {
                    if (!e.markedForDeletion) {
                        const dmg = skill.damage; // Shatter damage
                        e.takeDamage(dmg, 'ice');
                        g.spawnParticles(e.x, e.y, 10, "#ffffff");
                    }
                });
                g.spawnFloatingText(g.player.x, g.player.y, "SHATTER!", "#00ffff");
                g.audio?.playFreeze?.(); // Reuse freeze sound
            }
        });
    }

    executeHealAura(_game: any, skill: any): void {
        // Validate skill values using utilities
        const duration = safeDuration(skill.duration, 8);
        const healPercent = safePercent(skill.healPercent, 0.05);

        this.activeEffects.push({
            type: 'HEAL_AURA',
            timer: duration,
            healTimer: 0,
            update: (dt: number, g: any) => {
                const self: any = this.activeEffects.find(e => e.type === 'HEAL_AURA');
                if (!self) return;

                self.healTimer += dt;
                if (self.healTimer >= 1) {
                    const healAmount = g.player.maxHp * healPercent;
                    if (canApplyHeal(healAmount)) {
                        g.player.hp = Math.min(g.player.maxHp, g.player.hp + healAmount);
                        g.spawnFloatingText(g.player.x, g.player.y, "+HP", "#00ff00");
                    }
                    self.healTimer = 0;
                }
            }
        } as any);
    }

    executeSpeedBoost(game: any, skill: any): void {
        const speedMult = skill.speedMult || 1;
        const rateMult = skill.attackRateMult || 1;

        if (speedMult !== 1) game.player.maxSpeed *= speedMult;
        if (rateMult !== 1) game.player.fireRateMultiplier *= rateMult;

        this.activeEffects.push({
            type: 'SPEED_BUFF', // Changed to be more relevant, but check if drawing logic depends on SPEED_TRAIL
            x: game.player.x,
            y: game.player.y,
            timer: skill.duration,
            // Store original values/multipliers for reversal
            speedBuff: speedMult,
            rateBuff: rateMult,
            update: (_dt: number, g: any) => {
                if (speedMult > 1) {
                    g.spawnParticles(g.player.x, g.player.y, 1, '#00ff00');
                }
            },
            onExpire: (g: any) => {
                if (speedMult !== 1) g.player.maxSpeed /= speedMult;
                if (rateMult !== 1) g.player.fireRateMultiplier /= rateMult;
                g.spawnFloatingText(g.player.x, g.player.y, "Buff Expired", "#ff0000");
            }
        } as any);
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
        const dist = Math.hypot(dx, dy);
        const maxRange = skill.range || 400;

        let finalX = targetX;
        let finalY = targetY;

        if (dist > maxRange) {
            finalX = game.player.x + (dx / dist) * maxRange;
            finalY = game.player.y + (dy / dist) * maxRange;
        }

        game.spawnParticles(game.player.x, game.player.y, 20, '#00ffff');
        game.player.x = finalX;
        game.player.y = finalY;
        game.spawnParticles(finalX, finalY, 20, '#00ffff');
        game.audio.playDash();
    }

    executeSlowField(game: any, skill: any): void {
        const center = this.getTargetPosition(game);
        this.activeEffects.push({
            type: 'SLOW_FIELD',
            x: center.x,
            y: center.y,
            radius: skill.radius,
            slowPercent: skill.slowPercent || 0.5,
            timer: skill.duration,
            color: skill.color,
            update: (_dt: number, g: any) => {
                g.enemies.forEach((e: any) => {
                    if (e.markedForDeletion) return;
                    const dx = e.x - center.x;
                    const dy = e.y - center.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < skill.radius) {
                        // Apply slow (doesn't stack infinitely now)
                        e.slowFactor = (1 - (skill.slowPercent || 0.5));
                    }
                });
            }
        } as any);
    }

    executeQuickHeal(game: any, skill: any): void {
        // Validate skill values using utilities
        const healPercent = safePercent(skill.healPercent, 0.3);
        const maxHp = safeHP(game.player.maxHp, 100);
        const currentHp = safeHP(game.player.hp, 0);

        let healAmount = maxHp * healPercent;
        healAmount = safeHP(healAmount, 30); // Fallback

        game.player.hp = Math.min(maxHp, currentHp + healAmount);
        game.spawnFloatingText(game.player.x, game.player.y, `+${Math.round(healAmount)} HP`, '#00ff88');
        game.spawnParticles(game.player.x, game.player.y, 20, '#00ff88');
    }

    executeCloudPiercing(game: any, skill: any): void {
        const vineCount = skill.vineCount || 6;
        const oldArmor = game.player.armor || 0;
        game.player.armor = 1 - (skill.damageReduction || 0.5);

        for (let i = 0; i < vineCount; i++) {
            const vine: any = {
                type: 'CLOUD_VINE',
                timer: skill.duration,
                angle: (Math.PI * 2 / vineCount) * i,
                radius: 120,
                vineIndex: i,
                x: 0, y: 0,
                color: skill.color,
                attackTimer: 0,
                update: (dt: number, g: any) => {
                    vine.angle += dt * 3;
                    vine.x = g.player.x + Math.cos(vine.angle) * vine.radius;
                    vine.y = g.player.y + Math.sin(vine.angle) * vine.radius;

                    vine.attackTimer += dt;
                    if (vine.attackTimer > 0.4) {
                        g.enemies.forEach((e: any) => {
                            if (Math.hypot(e.x - vine.x, e.y - vine.y) < 50) {
                                e.takeDamage(skill.damage, 'vine');
                                g.spawnParticles(e.x, e.y, 5, skill.color);
                            }
                        });
                        vine.attackTimer = 0;
                    }
                }
            };
            this.activeEffects.push(vine);
        }

        setTimeout(() => {
            game.player.armor = oldArmor;
            game.spawnFloatingText(game.player.x, game.player.y, "Vine Expired", "#888888");
        }, skill.duration * 1000);
    }

    executeVoidErasure(game: any, skill: any): void {
        const player = game.player;
        const target = this.getTargetPosition(game);
        const angle = Math.atan2(target.y - player.y, target.x - player.x);

        this.activeEffects.push({
            type: 'ANIME_VOID',
            x: player.x,
            y: player.y,
            angle: angle,
            length: 1200,
            width: 50,
            color: skill.color,
            timer: 0.2,
            update: () => { }
        } as any);

        game.spawnParticles(player.x, player.y, 40, skill.color);
        game.addScreenShake(0.5, 10);

        const range = 1000;
        const width = 60;
        game.enemies.forEach((e: any) => {
            const dx = e.x - player.x;
            const dy = e.y - player.y;
            const dist = Math.hypot(dx, dy);
            if (dist > range) return;

            const eAngle = Math.atan2(dy, dx);
            let diff = eAngle - angle;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;

            const perpDist = Math.abs(Math.sin(diff) * dist);
            if (perpDist < width / 2 && Math.abs(diff) < Math.PI / 2) {
                e.takeDamage(skill.damage, 'void');
            }
        });
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const time = Date.now() / 100;

        this.activeEffects.forEach(effect => {
            ctx.save();
            switch (effect.type) {
                case 'BLACK_HOLE':
                case 'doom_vortex': {
                    const r = effect.radius || 180;
                    const gradient = ctx.createRadialGradient(effect.x!, effect.y!, 0, effect.x!, effect.y!, r);
                    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
                    gradient.addColorStop(0.5, effect.type === 'doom_vortex' ? 'rgba(150, 0, 50, 0.4)' : 'rgba(100, 0, 200, 0.3)');
                    gradient.addColorStop(1, 'rgba(0,0,0,0)');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(effect.x!, effect.y!, r, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                }

                case 'FIREBALL':
                case 'ICEBALL':
                case 'PROJECTILE': {
                    const r = effect.radius || 15;
                    ctx.beginPath();
                    ctx.arc(effect.x!, effect.y!, r, 0, Math.PI * 2);
                    ctx.fillStyle = effect.color || '#fff';
                    ctx.fill();
                    break;
                }

                case 'POISON_CLOUD': {
                    const r = effect.radius || 150;
                    ctx.beginPath();
                    ctx.arc(effect.x!, effect.y!, r, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(0,255,0,0.2)';
                    ctx.fill();
                    break;
                }

                case 'ANIME_VOID': {
                    ctx.translate(effect.x!, effect.y!);
                    ctx.rotate(effect.angle || 0);
                    ctx.fillStyle = effect.color || '#f0f';
                    ctx.fillRect(0, -25, 1200, 50);
                    break;
                }

                case 'CLOUD_VINE': {
                    ctx.beginPath();
                    ctx.arc(effect.x!, effect.y!, 8, 0, Math.PI * 2);
                    ctx.fillStyle = effect.color || '#0f0';
                    ctx.fill();
                    break;
                }

                case 'DECOY': {
                    ctx.beginPath();
                    ctx.arc(effect.x!, effect.y!, 15, 0, Math.PI * 2);
                    ctx.strokeStyle = effect.color || '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.fillText("DECOY", effect.x!, effect.y! - 20);
                    break;
                }

                case 'BLADE': {
                    ctx.translate(effect.x!, effect.y!);
                    ctx.rotate((effect.angle || 0) + time);
                    ctx.fillStyle = effect.color || '#aaa';
                    ctx.beginPath();
                    ctx.moveTo(10, 0);
                    ctx.lineTo(-5, 5);
                    ctx.lineTo(-5, -5);
                    ctx.fill();
                    break;
                }
            }
            ctx.restore();
        });
    }

    // ============= NEW SKILL EXECUTORS =============

    executePlasmaLance(game: any, skill: any): void {
        const player = game.player;
        const mouse = game.input.getMousePosition();
        const camX = game.camera ? game.camera.x : 0;
        const camY = game.camera ? game.camera.y : 0;
        const targetX = mouse.x + camX;
        const targetY = mouse.y + camY;
        const angle = Math.atan2(targetY - player.y, targetX - player.x);

        const range = skill.range || 800;
        const damage = skill.damage || 80;

        // Create beam effect
        this.activeEffects.push({
            type: 'PLASMA_LANCE',
            x: player.x,
            y: player.y,
            angle: angle,
            timer: skill.duration || 0.3,
            color: skill.color,
            length: range,
            update: (_dt: number, g: any) => {
                // Hit all enemies in line
                g.enemies.forEach((e: any) => {
                    if (e.markedForDeletion) return;
                    // Line-circle collision
                    const endX = player.x + Math.cos(angle) * range;
                    const endY = player.y + Math.sin(angle) * range;
                    const distToLine = this.pointToLineDistance(e.x, e.y, player.x, player.y, endX, endY);
                    if (distToLine < e.radius + 20) {
                        e.takeDamage(damage, 'plasma');
                    }
                });
            }
        } as any);

        game.addScreenShake(0.2, 5);
        game.spawnFloatingText(player.x, player.y, "PLASMA LANCE!", skill.color);
    }

    pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let t = Math.max(0, Math.min(1, dot / lenSq));
        const closestX = x1 + t * C;
        const closestY = y1 + t * D;
        return Math.hypot(px - closestX, py - closestY);
    }

    executeOrbitalBombardment(game: any, skill: any): void {
        const center = this.getTargetPosition(game);
        const count = skill.count || 5;
        const damage = skill.damage || 120;
        const radius = skill.radius || 100;

        game.spawnFloatingText(center.x, center.y, "ORBITAL STRIKE!", skill.color);

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const offsetX = (Math.random() - 0.5) * 200;
                const offsetY = (Math.random() - 0.5) * 200;
                const x = center.x + offsetX;
                const y = center.y + offsetY;

                // Warning indicator
                game.spawnParticles(x, y, 5, '#ff0000');

                // Delayed strike
                setTimeout(() => {
                    game.addScreenShake(0.3, 8);
                    game.spawnParticles(x, y, 30, skill.color);

                    game.enemies.forEach((e: any) => {
                        if (e.markedForDeletion) return;
                        const dist = Math.hypot(e.x - x, e.y - y);
                        if (dist < radius) {
                            e.takeDamage(damage, 'orbital');
                        }
                    });
                }, 500);
            }, i * (skill.delay || 0.5) * 1000);
        }
    }

    executeVampireTouch(game: any, skill: any): void {
        const player = game.player;
        const radius = skill.radius || 200;
        const damage = skill.damage || 40;
        const healPercent = skill.healPercent || 1.0;

        let totalDamage = 0;

        game.enemies.forEach((e: any) => {
            if (e.markedForDeletion) return;
            const dist = Math.hypot(e.x - player.x, e.y - player.y);
            if (dist < radius) {
                const actualDamage = Math.min(e.health, damage);
                e.takeDamage(damage, 'drain');
                totalDamage += actualDamage;
                game.spawnParticles(e.x, e.y, 3, skill.color);
            }
        });

        // Heal player based on damage dealt
        const healAmount = totalDamage * healPercent;
        if (healAmount > 0 && Number.isFinite(healAmount)) {
            player.hp = Math.min(player.maxHp, player.hp + healAmount);
            game.spawnFloatingText(player.x, player.y, `+${Math.round(healAmount)} HP`, '#00ff00');
        }

        game.spawnFloatingText(player.x, player.y - 30, "LIFE DRAIN!", skill.color);
        game.spawnParticles(player.x, player.y, 20, skill.color);
    }

    executeChainLightning(game: any, skill: any): void {
        const player = game.player;
        const damage = skill.damage || 30;
        const chainRange = skill.chainRange || 200;
        const maxChains = skill.maxChains || 8;

        // Find initial target (closest enemy)
        let target = null;
        let minDist = Infinity;

        game.enemies.forEach((e: any) => {
            if (e.markedForDeletion) return;
            const dist = Math.hypot(e.x - player.x, e.y - player.y);
            if (dist < 500 && dist < minDist) {
                minDist = dist;
                target = e;
            }
        });

        if (!target) {
            game.spawnFloatingText(player.x, player.y, "NO TARGET", '#ff0000');
            return;
        }

        const hitEnemies: any[] = [];
        let currentTarget: any = target;
        hitEnemies.push(currentTarget);

        // Chain to nearby enemies
        for (let i = 0; i < maxChains && currentTarget; i++) {
            currentTarget.takeDamage(damage * (1 - i * 0.05), 'lightning'); // Slight damage falloff
            game.spawnParticles(currentTarget.x, currentTarget.y, 5, skill.color);

            // Find next target
            let nextTarget: any = null;
            let nextDist = Infinity;

            game.enemies.forEach((e: any) => {
                if (e.markedForDeletion || hitEnemies.includes(e)) return;
                const dist = Math.hypot(e.x - currentTarget.x, e.y - currentTarget.y);
                if (dist < chainRange && dist < nextDist) {
                    nextDist = dist;
                    nextTarget = e;
                }
            });

            if (nextTarget) {
                hitEnemies.push(nextTarget);
                // Visual chain effect
                this.activeEffects.push({
                    type: 'CHAIN_BOLT',
                    x: currentTarget.x,
                    y: currentTarget.y,
                    timer: 0.2,
                    color: skill.color,
                    targetX: nextTarget.x,
                    targetY: nextTarget.y,
                    update: () => { }
                } as any);
            }

            currentTarget = nextTarget;
        }

        game.spawnFloatingText(player.x, player.y, `CHAIN x${hitEnemies.length}!`, skill.color);
        game.audio?.playLightning?.();
    }

    executeNovaBarrier(game: any, skill: any): void {
        const player = game.player;
        const duration = skill.duration || 3;
        const baseDamage = skill.damage || 50;

        player.isInvulnerable = true;
        game.spawnFloatingText(player.x, player.y, "NOVA BARRIER!", skill.color);

        let storedDamage = 0;

        this.activeEffects.push({
            type: 'NOVA_BARRIER',
            x: player.x,
            y: player.y,
            radius: 80,
            timer: duration,
            color: skill.color,
            storedDamage: 0,
            update: (dt: number, g: any) => {
                const self: any = this.activeEffects.find(e => e.type === 'NOVA_BARRIER');
                if (!self) return;

                // Follow player
                self.x = g.player.x;
                self.y = g.player.y;

                // Track would-be damage (simulated)
                storedDamage += dt * 10; // Passive accumulation

                // Visual pulse
                if (Math.random() < 0.3) {
                    g.spawnParticles(g.player.x, g.player.y, 1, skill.color);
                }
            },
            onExpire: (g: any) => {
                g.player.isInvulnerable = false;

                // EXPLOSION!
                const explosionDamage = baseDamage + storedDamage;
                const explosionRadius = skill.radius || 250;

                g.addScreenShake(0.5, 12);
                g.spawnParticles(g.player.x, g.player.y, 40, skill.color);

                g.enemies.forEach((e: any) => {
                    if (e.markedForDeletion) return;
                    const dist = Math.hypot(e.x - g.player.x, e.y - g.player.y);
                    if (dist < explosionRadius) {
                        e.takeDamage(explosionDamage, 'nova');
                    }
                });

                g.spawnFloatingText(g.player.x, g.player.y, `NOVA BURST! ${Math.round(explosionDamage)}`, '#ffff00');
            }
        });
    }
}
