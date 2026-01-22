// Card Translations for Thai/English support

export const CARD_LOCALE = {
    // === OFFENSIVE CARDS ===
    DAMAGE_UP: {
        name: 'Power Core',
        nameTH: 'แกนพลัง',
        description: 'Increases projectile damage',
        descriptionTH: 'เพิ่มความเสียหายกระสุน'
    },
    FIRE_RATE_UP: {
        name: 'Rapid Fire Module',
        nameTH: 'โมดูลยิงเร็ว',
        description: 'Increases firing speed',
        descriptionTH: 'เพิ่มความเร็วในการยิง'
    },
    MULTISHOT: {
        name: 'Multishot Array',
        nameTH: 'อาร์เรย์หลายนัด',
        description: 'Fire additional projectiles',
        descriptionTH: 'ยิงกระสุนเพิ่มเติม'
    },
    PROJECTILE_SPEED: {
        name: 'Accelerator',
        nameTH: 'ตัวเร่งความเร็ว',
        description: 'Faster projectiles',
        descriptionTH: 'กระสุนเร็วขึ้น'
    },
    CRITICAL_STRIKE: {
        name: 'Critical Module',
        nameTH: 'โมดูลคริติคอล',
        description: 'Chance for 2x damage',
        descriptionTH: 'โอกาสสร้างความเสียหาย 2 เท่า'
    },
    PIERCING: {
        name: 'Piercing Rounds',
        nameTH: 'กระสุนทะลุทะลวง',
        description: 'Projectiles pass through enemies',
        descriptionTH: 'กระสุนทะลุผ่านศัตรู'
    },
    CHAIN_LIGHTNING: {
        name: 'Chain Lightning',
        nameTH: 'สายฟ้าลูกโซ่',
        description: 'Damage chains to nearby enemies',
        descriptionTH: 'ความเสียหายลุกลามไปยังศัตรูใกล้เคียง'
    },
    RICOCHET: {
        name: 'Ricochet',
        nameTH: 'กระสุนสะท้อน',
        description: 'Projectiles bounce to new targets',
        descriptionTH: 'กระสุนเด้งไปหาเป้าหมายใหม่'
    },
    LIFE_STEAL: {
        name: 'Vampirism Module',
        nameTH: 'โมดูลดูดเลือด',
        description: 'Heal a percentage of damage dealt',
        descriptionTH: 'ฟื้นฟู HP ตามเปอร์เซ็นต์ความเสียหาย'
    },
    BERSERKER: {
        name: 'Berserker Mode',
        nameTH: 'โหมดคลั่ง',
        description: '+50% damage when below 30% HP',
        descriptionTH: '+50% ดาเมจเมื่อ HP ต่ำกว่า 30%'
    },
    RAM_DAMAGE: {
        name: 'Spiked Hull',
        nameTH: 'ตัวถังมีหนาม',
        description: 'Deal damage when colliding with enemies',
        descriptionTH: 'สร้างความเสียหายเมื่อชนกับศัตรู'
    },

    // === DEFENSIVE CARDS ===
    MAX_HP_UP: {
        name: 'Hull Plating',
        nameTH: 'เกราะตัวถัง',
        description: 'Increases max HP',
        descriptionTH: 'เพิ่ม HP สูงสุด'
    },
    HP_REGEN: {
        name: 'Nanofiber Repair',
        nameTH: 'ซ่อมแซมนาโน',
        description: 'Passively regenerate HP',
        descriptionTH: 'ฟื้นฟู HP อัตโนมัติ'
    },
    ARMOR: {
        name: 'Armor Plating',
        nameTH: 'แผ่นเกราะ',
        description: 'Reduce damage taken',
        descriptionTH: 'ลดความเสียหายที่ได้รับ'
    },
    SHIELD_GEN: {
        name: 'Shield Generator',
        nameTH: 'เครื่องสร้างโล่',
        description: 'Absorbs one hit every 10 seconds',
        descriptionTH: 'ดูดซับการโจมตี 1 ครั้งทุก 10 วินาที'
    },
    SECOND_WIND: {
        name: 'Second Wind',
        nameTH: 'ลมหายใจที่สอง',
        description: 'Revive once with 30% HP',
        descriptionTH: 'ฟื้นคืนชีพ 1 ครั้งพร้อม 30% HP'
    },

    // === MOBILITY CARDS ===
    SPEED_UP: {
        name: 'Turbo Engine',
        nameTH: 'เครื่องยนต์เทอร์โบ',
        description: 'Increases movement speed',
        descriptionTH: 'เพิ่มความเร็วในการเคลื่อนที่'
    },
    DASH_COUNT: {
        name: 'Dash Capacitor',
        nameTH: 'แบตเตอรี่แดช',
        description: 'Additional dash charge',
        descriptionTH: 'เพิ่มจำนวนครั้งแดช'
    },
    DASH_DISTANCE: {
        name: 'Extended Thrusters',
        nameTH: 'บูสเตอร์ขยาย',
        description: 'Increases dash distance',
        descriptionTH: 'เพิ่มระยะแดช'
    },
    DASH_COOLDOWN: {
        name: 'Quick Recovery',
        nameTH: 'ฟื้นตัวเร็ว',
        description: 'Reduces dash cooldown',
        descriptionTH: 'ลดคูลดาวน์แดช'
    },

    // === UTILITY CARDS ===
    MAGNET: {
        name: 'Tractor Beam',
        nameTH: 'ลำแสงดึงดูด',
        description: 'Increases pickup range',
        descriptionTH: 'เพิ่มระยะเก็บไอเทม'
    },
    DOUBLE_XP: {
        name: 'Experience Amplifier',
        nameTH: 'ตัวขยาย XP',
        description: 'Bonus experience gain',
        descriptionTH: 'รับ XP เพิ่มเติม'
    },
    LUCKY_STAR: {
        name: 'Lucky Star',
        nameTH: 'ดาวนำโชค',
        description: 'Better rarity chances',
        descriptionTH: 'เพิ่มโอกาสได้ไอเทมหายาก'
    },
    WEAPON_SLOT: {
        name: 'Weapon Bay',
        nameTH: 'ช่องอาวุธ',
        description: 'Unlock additional weapon slot',
        descriptionTH: 'ปลดล็อกช่องอาวุธเพิ่มเติม'
    },
    SKILL_SLOT: {
        name: 'Skill Module',
        nameTH: 'ช่องสกิล',
        description: 'Unlock additional active skill slot',
        descriptionTH: 'ปลดล็อกช่องสกิลเพิ่มเติม'
    },
    AUTO_SHOOT: {
        name: 'A.I. Gunner',
        nameTH: 'AI พลปืน',
        description: 'Your ship fires weapons automatically',
        descriptionTH: 'ยานยิงอาวุธอัตโนมัติ'
    },
    AUTO_AIM: {
        name: 'Smart Targeting',
        nameTH: 'เล็งอัจฉริยะ',
        description: 'Your ship aims at enemies automatically',
        descriptionTH: 'ยานเล็งเป้าหมายอัตโนมัติ'
    },

    // === CONSUMABLE CARDS ===
    FULL_HEAL: {
        name: 'Nanobot Swarm',
        nameTH: 'ฝูงนาโนบอท',
        description: 'Restore 50% HP immediately',
        descriptionTH: 'ฟื้นฟู 50% HP ทันที'
    },
    VACUUM: {
        name: 'Singularity Pulse',
        nameTH: 'พัลส์ภาวะเอกฐาน',
        description: 'Collect all gems on screen',
        descriptionTH: 'เก็บเพชรทั้งหมดบนหน้าจอ'
    },
    BOMB: {
        name: 'Screen Nuke',
        nameTH: 'ระเบิดนิวเคลียร์',
        description: 'Damage all enemies on screen',
        descriptionTH: 'สร้างความเสียหายศัตรูทั้งหมดบนจอ'
    }
};

// Helper function to get localized card info
export function getCardLocale(cardId: string, lang: 'EN' | 'TH' = 'EN'): { name: string, description: string } {
    const card = CARD_LOCALE[cardId as keyof typeof CARD_LOCALE];
    if (!card) return { name: cardId, description: '' };

    return {
        name: lang === 'TH' ? (card.nameTH || card.name) : card.name,
        description: lang === 'TH' ? (card.descriptionTH || card.description) : card.description
    };
}
