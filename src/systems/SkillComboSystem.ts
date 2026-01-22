// Skill Synergy System - Special effects when specific skill combinations are equipped

export interface SkillSynergy {
    id: string;
    name: string;
    nameTH: string;
    description: string;
    descriptionTH: string;
    requiredSkills: string[];
    effect: string;
    bonusMultiplier?: number;
    bonusDuration?: number;
}

export const SKILL_SYNERGIES: SkillSynergy[] = [
    {
        id: 'VOID_STORM',
        name: 'Void Storm',
        nameTH: 'พายุแห่งความว่างเปล่า',
        description: 'Black Hole + Meteor: Meteors are attracted to Black Holes',
        descriptionTH: 'หลุมดำ + อุกกาบาต: อุกกาบาตถูกดูดเข้าหลุมดำ',
        requiredSkills: ['BLACK_HOLE', 'METEOR_SHOWER'],
        effect: 'METEOR_PULL',
        bonusMultiplier: 1.5
    },
    {
        id: 'FROZEN_TIME',
        name: 'Frozen Time',
        nameTH: 'เวลาแข็งตัว',
        description: 'Time Stop + Lightning: +200% Lightning damage during Time Stop',
        descriptionTH: 'หยุดเวลา + สายฟ้า: +200% ดาเมจสายฟ้าระหว่างหยุดเวลา',
        requiredSkills: ['TIME_STOP', 'LIGHTNING_STORM'],
        effect: 'LIGHTNING_BOOST',
        bonusMultiplier: 3
    },
    {
        id: 'SOUL_REAPER',
        name: 'Soul Reaper',
        nameTH: 'นักเก็บเกี่ยววิญญาณ',
        description: 'Doom + Soul Harvest: Execute threshold +15% (30% total)',
        descriptionTH: 'คำสาป + เก็บเกี่ยววิญญาณ: เพิ่มเกณฑ์สังหาร +15% (รวม 30%)',
        requiredSkills: ['DOOM', 'SOUL_HARVEST'],
        effect: 'EXECUTE_BOOST',
        bonusMultiplier: 0.3 // 30% HP threshold
    },
    {
        id: 'STEAM_EXPLOSION',
        name: 'Steam Explosion',
        nameTH: 'ระเบิดไอน้ำ',
        description: 'Fireball + Iceball: Enemies affected by both take bonus damage',
        descriptionTH: 'ลูกไฟ + ลูกน้ำแข็ง: ศัตรูที่โดนทั้งสองได้รับดาเมจเพิ่ม',
        requiredSkills: ['FIREBALL', 'ICEBALL'],
        effect: 'ELEMENTAL_COMBO',
        bonusMultiplier: 2
    },
    {
        id: 'TOXIC_WAVE',
        name: 'Toxic Wave',
        nameTH: 'คลื่นพิษ',
        description: 'Poison Cloud + Shockwave: Shockwave spreads poison to all hit',
        descriptionTH: 'กลุ่มเมฆพิษ + คลื่นกระแทก: คลื่นแพร่พิษไปยังศัตรูทุกตัว',
        requiredSkills: ['POISON_CLOUD', 'SHOCKWAVE'],
        effect: 'POISON_SPREAD'
    },
    {
        id: 'BLADE_VORTEX',
        name: 'Blade Vortex',
        nameTH: 'วังวนใบมีด',
        description: 'Blade Storm + Gravity Well: Blades orbit around Gravity Wells',
        descriptionTH: 'พายุใบมีด + จุดดึงดูด: ดาบโคจรรอบจุดดึงดูด',
        requiredSkills: ['BLADE_STORM', 'GRAVITY_WELL'],
        effect: 'BLADE_ORBIT'
    },
    {
        id: 'PHOENIX_POWER',
        name: 'Phoenix Power',
        nameTH: 'พลังฟีนิกซ์',
        description: 'Phoenix Rebirth + Infinite Power: Auto-activate Infinite Power on revive',
        descriptionTH: 'ฟื้นคืนชีพฟีนิกซ์ + พลังอนันต์: เปิดฟิลังอนันต์อัตโนมัติเมื่อฟื้น',
        requiredSkills: ['PHOENIX_REBIRTH', 'INFINITE_POWER'],
        effect: 'AUTO_POWER_ON_REVIVE'
    }
];

// Synergy Manager class
export class ComboManager {
    private readonly game: any;
    private activeSynergies: SkillSynergy[] = [];

    constructor(game: any) {
        this.game = game;
    }

    // Check which synergies are active based on equipped skills
    checkCombos(): SkillSynergy[] {
        const equippedSkillIds = this.game.skillSystem?.activeSkills?.map((s: any) => s.id) || [];

        this.activeSynergies = SKILL_SYNERGIES.filter(synergy =>
            synergy.requiredSkills.every(skillId => equippedSkillIds.includes(skillId))
        );

        return this.activeSynergies;
    }

    // Check if a specific synergy effect is active
    hasCombo(effectId: string): boolean {
        return this.activeSynergies.some(s => s.effect === effectId);
    }

    // Get bonus multiplier for a synergy effect
    getComboMultiplier(effectId: string): number {
        const synergy = this.activeSynergies.find(s => s.effect === effectId);
        return synergy?.bonusMultiplier || 1;
    }

    // Get active synergies for UI display
    getActiveCombos(): SkillSynergy[] {
        return this.activeSynergies;
    }

    // Reset synergies (on game restart)
    reset(): void {
        this.activeSynergies = [];
    }
}
