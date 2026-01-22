import { CardSystem } from './CardSystem';

export class UpgradeSystem {
    private game: any;
    private cardSystem: CardSystem;

    constructor(game: any) {
        this.game = game;
        this.cardSystem = new CardSystem(game);
    }

    getChoices(count = 3): any[] {
        const choices = [];

        for (let i = 0; i < count; i++) {
            const rand = Math.random();

            // 30% chance: Weapon upgrade (if weapons exist)
            // DISABLED per user feedback: We rely on picking duplicate weapons/skills for upgrades.
            /*
            if (this.game.weaponSystem &&
                this.game.weaponSystem.activeWeapons.length > 0 &&
                rand < 0.15) {

                const weapon = this.game.weaponSystem.activeWeapons[
                    Math.floor(Math.random() * this.game.weaponSystem.activeWeapons.length)
                ];
                choices.push(this.createWeaponUpgrade(weapon));
            }
            */
            // Adjusted logic:
            // 25% chance: New weapon (if slots available)
            // 50% chance: Skill
            // Remaining: Passive
            if (false) { } // Placeholder to keep else-if structure valid or we can refactor.

            // 25% chance: New weapon (if slots available)
            else if (this.game.weaponSystem &&
                this.game.weaponSystem.activeWeapons.length < this.game.weaponSystem.maxWeapons &&
                rand < 0.30) {

                choices.push(this.game.weaponSystem.generateWeapon());
            }
            // 15% chance: Skill (if skill system exists and slots available)
            // 30% chance: Skill (Increased chance for skills)
            else if (this.game.skillSystem &&
                this.game.skillSystem.activeSkills.length < this.game.skillSystem.maxSkills &&
                rand < 0.60) {

                const skill = this.game.skillSystem.generateRandomSkill('UNCOMMON');
                if (skill) {
                    choices.push(this.createSkillCard(skill));
                } else {
                    choices.push(this.cardSystem.generateCard());
                }
            }
            // Remaining: Passive card
            else {
                choices.push(this.cardSystem.generateCard());
            }
        }
        // A simple way: Add a "Reroll" card that, when clicked, deducts coins and refreshes choices.

        const rerollCost = 50;
        if (this.game.coins >= rerollCost) {
            choices.push({
                id: 'REROLL_CARD',
                name: 'REROLL',
                description: `Cost: ${rerollCost} Coins<br>Refresh all choices`,
                color: '#ffff00',
                isReroll: true,
                cost: rerollCost,
                apply: (g: any) => {
                    if (g.coins >= rerollCost) {
                        g.coins -= rerollCost;
                        g.ui?.updateCoins(g.coins);
                        // Refresh logic:
                        // This requires the UI to re-call getChoices.
                        // We might need to handle this in UIManager or Game.
                        // For now, let's signal the Game to refresh upgrades.
                        g.rerollUpgrades();
                    }
                }
            });
        }

        return choices;
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

        const tierMap: Record<string, string> = {
            'UNCOMMON': 'II',
            'RARE': 'III',
            'EPIC': 'IV',
            'LEGENDARY': 'V',
            'MYTHIC': 'VI',
            'GOD': 'VII',
            'BOSS': 'BOSS'
        };

        const tier = tierMap[skillDef.rarity] || 'I';

        const isTH = this.game.ui?.currentLocale === 'TH';
        const name = isTH && skillDef.nameTH ? skillDef.nameTH : skillDef.name;
        const rawDesc = isTH && skillDef.descriptionTH ? skillDef.descriptionTH : (skillDef.descriptionEN || skillDef.description);

        // Append dynamic stats logic
        let statsInfo = '';
        const scaledDamage = this.game.skillSystem.getScaledDamage(skillDef.damage || 0);
        const scaledDps = this.game.skillSystem.getScaledDamage(skillDef.damagePerSec || 0);

        if (scaledDamage > 0) statsInfo += `<br><span style="color:#ffaa00">Damage: ${scaledDamage}</span>`;
        if (scaledDps > 0) statsInfo += `<br><span style="color:#00ff00">Damage/Sec: ${scaledDps}</span>`;
        if (skillDef.duration) statsInfo += `<br><span style="color:#00ccff">Duration: ${skillDef.duration}s</span>`;
        if (skillDef.cooldown) statsInfo += `<br><span style="color:#888">Cooldown: ${skillDef.cooldown}s</span>`;

        return {
            id: skillDef.id,
            name: `${name} [Tier ${tier}]`,
            description: `<b>${skillDef.rarity} SKILL</b><br>${rawDesc}${statsInfo}`,
            color: rarityColors[skillDef.rarity] || '#ffffff',
            apply: (g: any) => {
                g.skillSystem.equipSkill(skillDef.id);

                g.acquiredUpgrades.push({
                    name: `Skill: ${skillDef.name} [Tier ${tier}]`,
                    color: skillDef.color
                });
            }
        };
    }

    reset(): void {
        this.cardSystem.reset();
    }
}
