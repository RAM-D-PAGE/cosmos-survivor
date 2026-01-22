import { CardSystem } from './CardSystem';

export class UpgradeSystem {
    private readonly game: any;
    private readonly cardSystem: CardSystem;

    constructor(game: any) {
        this.game = game;
        this.cardSystem = new CardSystem(game);
    }

    getChoices(count = 3): any[] {
        const choices = [];

        for (let i = 0; i < count; i++) {
            const choice = this.generateSingleChoice(Math.random());
            if (choice) choices.push(choice);
        }
        // A simple way: Add a "Reroll" card that, when clicked, deducts coins and refreshes choices.

        const rerollCost = 50;
        if (this.game.coins >= rerollCost) {
            choices.push(this.createRerollCard(rerollCost));
        }

        return choices;
    }

    createRerollCard(cost: number): any {
        return {
            id: 'REROLL_CARD',
            name: 'REROLL',
            description: `Cost: ${cost} Coins<br>Refresh all choices`,
            color: '#ffff00',
            isReroll: true,
            cost: cost,
            apply: (g: any) => {
                if (g.coins >= cost) {
                    g.coins -= cost;
                    g.ui?.updateCoins(g.coins);
                    // Signal the Game to refresh upgrades
                    g.rerollUpgrades();
                }
            }
        };
    }

    getMysticalChoices(count = 3): any[] {
        const choices = [];
        for (let i = 0; i < count; i++) {
            choices.push(this.cardSystem.generateMysticalCard());
        }
        return choices;
    }

    private shouldOfferWeapon(rand: number): boolean {
        return this.game.weaponSystem &&
            this.game.weaponSystem.activeWeapons.length < this.game.weaponSystem.maxWeapons &&
            rand < 0.3;
    }

    private generateSingleChoice(rand: number): any {
        // 25% chance: New weapon (if slots available)
        if (this.shouldOfferWeapon(rand)) {
            return this.game.weaponSystem.generateWeapon();
        }
        // 30% chance: Skill (if skill system exists and slots available)
        else if (this.game.skillSystem &&
            this.game.skillSystem.activeSkills.length < this.game.skillSystem.maxSkills &&
            rand < 0.6) {

            // Improved Logic: Filter available skills first
            const validSkills = Object.values(this.game.skillSystem.skillDefinitions).filter((def: any) => {
                // Must be UNCOMMON (pool level) and NOT mystical
                if (def.rarity !== 'UNCOMMON' || def.isMystical) return false;

                // Check max stacks
                const max = def.maxStacks || 3;
                const active = this.game.skillSystem.activeSkills.find((s: any) => s.id === def.id);
                const bag = this.game.skillSystem.bagSkills.find((s: any) => s.id === def.id);
                const existing = active || bag;

                // If existing count is >= max, exclude it
                return !existing || (existing.count < max);
            });

            if (validSkills.length > 0) {
                const randomSkill = validSkills[Math.floor(Math.random() * validSkills.length)];
                return this.createSkillCard(randomSkill);
            } else {
                // No valid skills found? Fallback to cards
                return this.cardSystem.generateCard();
            }
        }
        // Remaining: Passive card
        else {
            return this.cardSystem.generateCard();
        }
    }

    createWeaponUpgrade(weapon: any): any {
        return {
            id: `upgrade_${weapon.name}_${Date.now()}`,
            name: `Upgrade: ${weapon.name}`,
            description: `<b>Enhance Weapon Systems</b><br><span style="color:#00ff00">Damage +20% | Fire Rate +10%</span>`,
            color: '#00ff00',
            apply: (g: any) => {
                weapon.damage *= 1.2;
                weapon.fireRate *= 1.1;
                weapon.name = `+ ${weapon.name}`;
                g.spawnFloatingText(g.player.x, g.player.y, "WEAPON UPGRADED", "#00ff00");

                g.acquiredUpgrades.push({
                    name: `Upgrade: ${weapon.name}`,
                    color: '#00ff00'
                });
            }
        };
    }

    createSkillCard(skillDef: any): any {
        const rarityColors: Record<string, string> = {
            'UNCOMMON': '#00ff00',
            'RARE': '#00ccff',
            'EPIC': '#a335ee',
            'LEGENDARY': '#ff8000'
        };



        const isTH = this.game.ui?.currentLocale === 'TH';
        const name = isTH && skillDef.nameTH ? skillDef.nameTH : skillDef.name;
        // Check current stack count
        let currentCount = 0;
        const active = this.game.skillSystem.activeSkills.find((s: any) => s.id === skillDef.id);
        const bag = this.game.skillSystem.bagSkills.find((s: any) => s.id === skillDef.id);
        if (active) currentCount = active.count || 1;
        if (bag) currentCount = bag.count || 1;

        let desc = isTH && skillDef.descriptionTH ? skillDef.descriptionTH : (skillDef.descriptionEN || skillDef.description);

        const maxStacks = skillDef.maxStacks || 3;

        if (currentCount > 0) {
            if (isTH) {
                desc = `<b>อัปเกรดเลเวล ${currentCount + 1}</b><br>สะสมการ์ดนี้เพื่อเพิ่มพลัง!`;
                if (currentCount === maxStacks - 1) {
                    desc += `<br><span style="color:#00ff00">โบนัสเลเวลสูงสุด: ลดคูลดาวน์!</span>`;
                } else {
                    desc += `<br><span style="color:#00ccff">โบนัส: เพิ่มค่าสถานะ</span>`;
                }
            } else {
                desc = `<b>Level ${currentCount + 1} Upgrade</b><br>Stack this card to boost power!`;
                if (currentCount === maxStacks - 1) {
                    desc += `<br><span style="color:#00ff00">MAX LEVEL BONUS: Cooldown Reduction!</span>`;
                } else {
                    desc += `<br><span style="color:#00ccff">Bonus: Stats Increased</span>`;
                }
            }
        }

        // Add stats info
        let statsInfo = '';
        const scaledDamage = this.game.skillSystem.getScaledDamage(skillDef.damage || 0);
        if (scaledDamage > 0) statsInfo += `<br><span style="color:#ffaa00">Dmg: ${scaledDamage}</span>`;

        return {
            id: skillDef.id,
            name: `${name} [${currentCount}/${maxStacks}]`,
            description: `<b>${skillDef.rarity} SKILL</b><br>${desc}${statsInfo}`,
            color: rarityColors[skillDef.rarity] || '#ffffff',
            rarity: skillDef.rarity,
            stackCount: currentCount,
            maxStacks: maxStacks,
            apply: (g: any) => {
                g.skillSystem.equipSkill(skillDef.id);
                g.acquiredUpgrades.push({
                    name: `Skill: ${skillDef.name} [Lv ${currentCount + 1}]`,
                    color: skillDef.color
                });
                if (g.synergySystem) g.synergySystem.checkSynergies();
                if (g.comboManager) g.comboManager.checkCombos();
            }
        };
    }


    reset(): void {
        this.cardSystem.reset();
    }
}
