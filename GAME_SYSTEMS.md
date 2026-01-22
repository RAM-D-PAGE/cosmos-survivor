# Cosmos Survivor - ระบบเกมทั้งหมด (Game Systems Overview)

## 📋 สารบัญ
- [Core Systems](#core-systems)
- [Entity Systems](#entity-systems)
- [Gameplay Systems](#gameplay-systems)
- [UI Systems](#ui-systems)
- [Data Systems](#data-systems)

---

## 🎮 Core Systems

### Game.ts
- **หน้าที่**: จัดการ game loop, collision detection, entity spawning
- **Features**:
  - Fixed time step physics
  - Spatial partitioning (SpatialGrid)
  - Screen shake system
  - Camera system
  - Event system integration

### GameState.ts (GameStateManager)
- **หน้าที่**: จัดการ state ของเกม
- **Properties**:
  - `exp`, `level`, `coins`
  - `difficulty`, `difficultyMultiplier`
  - `enemiesKilled`, `finalScore`
  - `screenShakeEnabled`, `damageNumbersEnabled`

### GameManager.ts
- **หน้าที่**: Orchestrate game loop และ system updates
- **Features**:
  - FPS tracking
  - System update coordination
  - Entity pool management

### Input.ts
- **หน้าที่**: จัดการ keyboard และ mouse input
- **Features**:
  - WASD movement
  - Mouse aiming
  - Click to shoot
  - Space for dash

### SpatialGrid.ts
- **หน้าที่**: Spatial partitioning สำหรับ collision detection
- **Features**:
  - Grid-based partitioning
  - Nearby entity queries
  - O(n) collision complexity

---

## 🎯 Entity Systems

### Player.ts
- **หน้าที่**: Player entity logic
- **Stats**:
  - HP, Energy, Damage, Speed
  - Fire Rate, Projectile Count
  - Crit Chance, Piercing, Chain
  - Life Steal, Armor, Dash
- **Abilities**:
  - Dash (Space)
  - Auto Shoot (card)
  - Auto Aim (card)

### Enemy.ts
- **หน้าที่**: Enemy entity logic
- **Types**:
  - Basic, Fast, Tank, Bomber
  - Elite variants
- **Features**:
  - AI movement
  - Health system
  - Death drops (gems, coins)

### Projectile.ts
- **หน้าที่**: Projectile entity
- **Types**:
  - Normal, Homing, Explosive
  - Freezing, Poison, Piercing
- **Properties**:
  - `isHoming`, `isExplosive`
  - `isFreezing`, `isPoison`
  - `isPiercing`, `maxPierce`

### AutoWeapon.ts
- **หน้าที่**: Auto-firing weapons/drones
- **Types** (15 types):
  - ORBITAL, TURRET, HEALER, DECOY
  - SEEKER, BEAM, SHOTGUN, SNIPER
  - MINIGUN, EXPLOSIVE, FREEZE
  - POISON, LASER, ORBIT_BLADE, MISSILE

### Gem.ts
- **หน้าที่**: Experience pickup
- **Features**:
  - Magnet range
  - Value scaling

### Particle.ts
- **หน้าที่**: Visual effects
- **Features**:
  - Object pooling
  - Color variations

### FloatingText.ts
- **หน้าที่**: Damage numbers, notifications
- **Features**:
  - Fade out animation
  - Color coding

---

## ⚔️ Gameplay Systems

### SkillSystem.ts
- **หน้าที่**: จัดการ active skills
- **Features**:
  - Skill cooldowns
  - Skill bag (max 3 active)
  - Skill execution
  - Active effects management

#### Skills (50+ skills)
- **Legendary**: Black Hole, Meteor Shower, Time Stop, Chain Explosion, Blade Storm
- **Epic**: Doom, Lightning Storm, Divine Shield, Soul Harvest, Plasma Burst, Void Slash
- **Rare**: Fireball, Iceball, Explosive Shot, Ice Spike, Poison Dart
- **Uncommon**: Poison Cloud, Shockwave, Quick Heal, Speed Burst, Mini Explosion
- **Mythic**: Gravity Well, Phoenix Rebirth, Clone Army, Dimension Rift
- **God**: Armageddon, Time Reversal, Infinite Power, Cosmic Annihilation
- **Anime Skills**:
  - **Jujutsu Kaisen**: Murasaki, Infinity, Hollow Purple
  - **Demon Slayer**: Flame Breathing, Water Breathing, Hinokami Kagura
  - **One Piece**: Gomu Gomu no Pistol, Gear Second
  - **Naruto**: Rasengan, Shadow Clone
  - **Dragon Ball**: Kamehameha, Kaio-ken
  - **Attack on Titan**: Thunder Spear

### CardSystem.ts
- **หน้าที่**: จัดการ upgrade cards
- **Features**:
  - Card generation with rarity
  - Card stacking
  - Mystical cards

#### Cards (40+ cards)
- **Offensive** (12 cards):
  - Damage Up, Fire Rate Up, Multishot
  - Projectile Speed, Critical Strike
  - Piercing, Chain Lightning, Ricochet
  - Life Steal, Berserker, Ram Damage
  - Explosive Rounds, Bleeding Edge, Heavy Rounds
  - Homing Missiles, Split Shot, Bigger Boom

- **Defensive** (10 cards):
  - Max HP Up, HP Regen, Armor
  - Shield Generator, Second Wind
  - Damage Reduction, Health on Kill
  - Phase Shift, Thorn Shield, Shield Overload

- **Mobility** (8 cards):
  - Speed Up, Dash Count, Dash Distance
  - Dash Cooldown, Dash Defense
  - Air Dash, Momentum, Wall Climb, Dash Strike

- **Utility** (12 cards):
  - Magnet, Double XP, Lucky Star
  - Weapon Slot, Auto Shoot, Auto Aim
  - Gem Multiplier, Coin Multiplier
  - Skill Cooldown, Weapon Cooldown
  - Double Pick, Reroll Discount

- **Consumable** (6 cards):
  - Full Heal, Vacuum, Bomb
  - Full Mana, Time Freeze, Mass Heal

### WeaponSystem.ts
- **หน้าที่**: จัดการ auto-weapons
- **Features**:
  - Weapon generation
  - Weapon leveling
  - Max 6 weapon slots (expandable)

### UpgradeSystem.ts
- **หน้าที่**: จัดการ level-up upgrades
- **Features**:
  - 3 choices per level
  - Mix of cards, skills, weapons
  - Reroll system

### ShopSystem.ts
- **หน้าที่**: ระบบร้านค้าสำหรับใช้เหรียญ
- **Features**:
  - Permanent upgrades
  - Consumable items
  - Skill/Weapon slots
  - Starting bonuses
  - Purchase tracking

#### Shop Items (15+ items)
- **Upgrades**: Damage Boost, HP Boost, Speed Boost, Fire Rate Boost, Crit Boost
- **Permanent**: Skill Slot, Weapon Slot, Starting Bonus, Coin Multiplier, Skill Cooldown Reduction
- **Consumables**: Full Heal, EXP Boost, Reroll Token, Lucky Box
- **Weapon**: Weapon Upgrade (upgrade all weapons)

### SynergySystem.ts
- **หน้าที่**: ระบบ synergy ระหว่าง upgrades
- **Features**:
  - Auto-detection
  - Tier-based bonuses
  - 10+ synergies

#### Synergies
- **Tier 1**: Fire Master, Ice Master, Speed Demon, Tank Build
- **Tier 2**: Crit Master, Vampire Build, Explosive Expert
- **Tier 3**: God Mode, Infinity Loop

### GameplayEnhancer.ts
- **หน้าที่**: เพิ่ม gameplay features
- **Features**:
  - Combo system
  - Kill streak system
  - Achievement tracking

---

## 🗺️ World Systems

### MapSystem.ts
- **หน้าที่**: จัดการ zones, difficulty scaling
- **Features**:
  - Zone progression
  - Boss spawning
  - Difficulty scaling
  - Time tracking

### BackgroundSystem.ts
- **หน้าที่**: Starfield และ background effects
- **Features**:
  - Parallax scrolling
  - Star generation

---

## 🎨 UI Systems

### UIManager.ts
- **หน้าที่**: จัดการ UI elements
- **Features**:
  - Main menu
  - HUD (HP, Energy, EXP, Coins)
  - Upgrade menu
  - Pause menu
  - Game over screen
  - Leaderboard
  - Settings
  - Skill management

---

## 💾 Data Systems

### SkillData.ts
- **หน้าที่**: Skill definitions
- **Features**:
  - 50+ skill definitions
  - Localization (EN/TH)
  - Rarity system

### CardLocale.ts
- **หน้าที่**: Card localization

### Locale.ts
- **หน้าที่**: UI text localization

### Settings.ts
- **หน้าที่**: Game settings

---

## 🎯 Game Flow

```
Main Menu
  ↓
Difficulty Selection
  ↓
Game Start
  ↓
Game Loop:
  - Update Systems
  - Update Entities
  - Check Collisions
  - Render
  ↓
Level Up → Upgrade Menu
  ↓
Boss Spawn → Boss Reward
  ↓
Game Over → Leaderboard
```

---

## 🔧 Technical Features

### Performance
- **Object Pooling**: Projectiles, Particles
- **Spatial Partitioning**: Collision detection optimization
- **View Culling**: Only render visible entities
- **Fixed Time Step**: Consistent physics

### Type Safety
- **Types.ts**: Centralized type definitions
- **ICollidable**: Interface for collision entities
- **GameState**: Type-safe state management

### Event System
- **EventManager.ts**: Pub/sub pattern
- **Events.ts**: Event type definitions

---

## 📊 Statistics

- **Skills**: 60+ (including Anime skills)
- **Cards**: 40+
- **AutoWeapon Types**: 15
- **Enemy Types**: 4+ (with elite variants)
- **Synergies**: 10+
- **Shop Items**: 15+
- **Anime Skills**: 12+ (Jujutsu Kaisen, Demon Slayer, One Piece, Naruto, Dragon Ball, Attack on Titan)

---

## 🚀 Future Enhancements

### Suggested Features:
1. **Daily Challenges**: Special objectives for bonus rewards
2. **Achievement System**: Unlock rewards for milestones
3. **Prestige System**: Reset for permanent bonuses
4. **Multiplayer**: Co-op survival mode
5. **Character Selection**: Different starting stats
6. **Weapon Crafting**: Combine weapons for new types
7. **Skill Evolution**: Upgrade skills to higher tiers
8. **Mini-Bosses**: Special enemies with unique drops
9. **Environmental Hazards**: Moving obstacles, traps
10. **Power-Up Pickups**: Temporary boosts during gameplay
11. **Wave System**: Structured enemy waves
12. **Boss Rush Mode**: Fight multiple bosses
13. **Endless Mode**: Infinite scaling difficulty
14. **Time Attack Mode**: Beat time records
15. **Collection System**: Unlock skins, weapons, skills

---

## 📝 Notes

- All systems use object pooling for performance
- Spatial grid updates every frame for accuracy
- Skills scale with player damage
- Cards can stack up to maxStacks
- Shop items can be permanent or consumable
- Synergies activate automatically when requirements met

---

*Last Updated: 2024*
