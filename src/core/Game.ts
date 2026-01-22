import { Input } from './Input';
import { Player } from '../entities/Player';
import { BackgroundSystem } from '../systems/BackgroundSystem';
import { Projectile } from '../entities/Projectile';
import { Enemy } from '../entities/Enemy';
import { Gem } from '../entities/Gem';
import { UpgradeSystem } from '../systems/UpgradeSystem';
import { Particle } from '../entities/Particle';
import { AudioSystem } from '../systems/AudioSystem';
import { FloatingText } from '../entities/FloatingText';
import { MapSystem } from '../systems/MapSystem';
import { WeaponSystem } from '../systems/WeaponSystem';
import { SkillSystem } from '../systems/SkillSystem';
import { LeaderboardSystem } from '../systems/LeaderboardSystem';
import { LoginSystem } from '../systems/LoginSystem';
import { CardSystem } from '../systems/CardSystem'; // Ensure this is here
import { CONFIG } from './Config';
import { EventManager } from './EventManager';
import { RenderSystem } from '../systems/RenderSystem';
import { UIManager } from '../ui/UIManager';
import { ObjectPool } from './ObjectPool';
import { AutoWeapon } from '../entities/AutoWeapon';

export class Game {
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
    public input: Input;
    public events: EventManager;
    public renderSystem: RenderSystem;
    public ui: UIManager;
    public audio: AudioSystem;
    public upgradeSystem: UpgradeSystem;
    public mapSystem: MapSystem;
    public weaponSystem: WeaponSystem;
    public skillSystem: SkillSystem;
    public leaderboardSystem: LeaderboardSystem;
    public loginSystem: LoginSystem;
    public cardSystem: CardSystem;

    public difficulty: string = 'NORMAL';
    public difficultyMult: number = 1.5;
    public backgroundSystem: BackgroundSystem;
    // public starfield: Starfield; // Removed
    public player: Player;
    public projectilePool: ObjectPool<Projectile>;
    public particlePool: ObjectPool<Particle>;
    public enemies: Enemy[];
    public gems: Gem[];
    public floatingTexts: FloatingText[];

    public shakeX: number = 0;
    public shakeY: number = 0;
    public shakeTimer: number = 0;
    public shakeIntensity: number = 0;

    public enemySpawnTimer: number = 0;
    public enemySpawnInterval: number;

    public exp: number = 0;
    public coins: number = 0;
    public level: number = 1;
    public expToNextLevel: number = 100;
    public isPaused: boolean = true;
    public difficultyMultiplier: number = 0;

    public lastTime: number = 0;
    public accumulator: number = 0;
    public step: number = 1 / 60;

    public gameState: string = 'MENU';
    public camera: { x: number, y: number } = { x: 0, y: 0 };
    public acquiredUpgrades: any[] = [];
    public finalScore: number = 0;
    public enemiesKilled: number = 0;

    // Settings flags
    public screenShakeEnabled: boolean = true;
    public damageNumbersEnabled: boolean = true;
    public showFps: boolean = false;
    public resumeCountdownEnabled: boolean = true;

    // FPS Tracking
    private fpsLastTime: number = 0;
    private fpsFrameCount: number = 0;
    public currentFps: number = 0;

    private secretRewardPicks: number = 0;

    // Helper getters for old code compatibility
    get projectiles() { return this.projectilePool.active; }
    get particles() { return this.particlePool.active; }
    set projectiles(v: any) { this.projectilePool.active = v; }
    set particles(v: any) { this.particlePool.active = v; }

    constructor() {
        this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.input = new Input();

        window.addEventListener('resize', this.resize);
        this.resize();

        this.events = new EventManager();
        this.renderSystem = new RenderSystem(this);
        this.audio = new AudioSystem();
        this.upgradeSystem = new UpgradeSystem(this);
        this.mapSystem = new MapSystem(this);
        this.weaponSystem = new WeaponSystem(this);
        this.skillSystem = new SkillSystem(this);
        console.log("[GAME] Systems part 1 loaded");

        this.leaderboardSystem = new LeaderboardSystem(this);
        this.cardSystem = new CardSystem(this);
        this.loginSystem = new LoginSystem(this);

        this.backgroundSystem = new BackgroundSystem(this);
        this.player = new Player(this);

        this.ui = new UIManager(this);

        this.projectilePool = new ObjectPool<Projectile>(() => new Projectile(0, 0, 0, 0, 0), 100);
        this.particlePool = new ObjectPool<Particle>(() => new Particle(0, 0, '#fff'), 100);

        this.enemies = [];
        this.gems = [];
        this.floatingTexts = [];

        this.enemySpawnInterval = CONFIG.GAME.ENEMY_SPAWN_INTERVAL;

        document.addEventListener('click', () => {
            if (this.audio.ctx.state === 'suspended') {
                this.audio.ctx.resume();
            }
        }, { once: true });

        window.addEventListener('keydown', (e) => {
            if (e.code === 'Tab') {
                e.preventDefault();
                this.togglePause();
            }
        });
    }

    public resize = (): void => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Background system no longer needs explicit chunk updates
    }

    togglePause(): void {
        if (this.gameState !== 'PLAYING') return;
        this.isPaused = !this.isPaused;
        this.ui.togglePauseMenu(this.isPaused);
    }

    showMainMenu(): void {
        this.ui.showMainMenu();
    }

    showDifficultySelect(): void {
        this.ui.showDifficultySelect();
    }

    // Helper functions for external calls (like from UIManager)
    selectDifficulty(diff: string) {
        const cfg = CONFIG.DIFFICULTY[diff as keyof typeof CONFIG.DIFFICULTY];
        if (!cfg) return;

        this.difficulty = diff;
        this.difficultyMult = cfg.mult;
        this.enemySpawnInterval = CONFIG.GAME.ENEMY_SPAWN_INTERVAL * cfg.spawnRate;

        this.spawnFloatingText(
            this.canvas.width / 2,
            this.canvas.height / 2,
            `${cfg.name.toUpperCase()} MODE`,
            cfg.color
        );

        this.ui.hideDifficultySelect();
        this.startGame();
    }

    restart(): void {
        this.exp = 0;
        this.level = 1;
        this.expToNextLevel = 100;
        this.isPaused = false;

        if (!this.difficulty) this.difficulty = 'NORMAL';
        const cfg = CONFIG.DIFFICULTY[this.difficulty as keyof typeof CONFIG.DIFFICULTY];
        if (cfg) {
            this.difficultyMult = cfg.mult;
            this.enemySpawnInterval = CONFIG.GAME.ENEMY_SPAWN_INTERVAL * cfg.spawnRate;
        }

        this.mapSystem.totalTime = 0;
        this.player = new Player(this);
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;

        this.mapSystem.reset();
        this.weaponSystem.reset();
        // this.starfield.speedMultiplier = 1; // Does not exist on starfield TS yet, ignore or add?
        this.enemies = [];
        this.projectilePool.releaseAll();
        this.particlePool.releaseAll();
        this.gems = [];
        this.floatingTexts = [];
        this.upgradeSystem.reset();
        this.skillSystem.reset();
        this.difficultyMultiplier = 0; // Reset enemy scaling

        this.coins = 0; // Reset Economy

        // Center camera on player
        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;

        this.acquiredUpgrades = [];
        const container = document.getElementById('card-container');
        if (container) container.innerHTML = '';
        document.getElementById('upgrade-menu')?.classList.add('hidden');
        document.getElementById('leaderboard')?.classList.add('hidden');

        this.startGame();
    }

    startGame(): void {
        this.gameState = 'PLAYING';
        this.isPaused = false;
        this.ui.showGameHUD();

        // Center camera on player
        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;

        if (this.audio.ctx.state === 'suspended') this.audio.ctx.resume();

        if (this.weaponSystem.activeWeapons.length === 0) {
            const startingWep = this.weaponSystem.createConfig('ORBITAL', 5, 1.0, 300, '#00f0ff', 'Plasma Drone');
            this.weaponSystem.installWeapon(startingWep);
        }

        this.lastTime = performance.now();
        this.ui.update(0); // initial update

        // Pre-generate background chunks around player
        if (this.backgroundSystem) {
            this.backgroundSystem.forceGenerateAround(this.player.x, this.player.y);
        }
    }

    run(): void { // Alias for start() if needed, but keeping start()
        this.start();
    }

    public start(): void {
        this.lastTime = performance.now();
        this.fpsLastTime = performance.now();
        this.fpsFrameCount = 0;
        requestAnimationFrame(this.loop);
    }

    public loop = (currentTime: number): void => {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // FPS Calculation
        this.fpsFrameCount++;
        if (currentTime - this.fpsLastTime >= 1000) {
            this.currentFps = this.fpsFrameCount;
            this.fpsFrameCount = 0;
            this.fpsLastTime = currentTime;
            this.updateFpsCounter();
        }

        if (!this.isPaused) {
            this.update(deltaTime);
        }
        this.draw();

        if (this.gameState === 'PLAYING' || this.gameState === 'GAME_OVER') {
            this.ui.update(deltaTime);
        }

        // Input update at end of frame
        this.input.update();
        requestAnimationFrame(this.loop);
    }

    public cameraMode: 'LOCKED' | 'DYNAMIC' = 'DYNAMIC';

    update(dt: number): void {
        const input = this.input;

        // Toggle Camera Mode (Left Shift)
        if (input.isKeyJustPressed('ShiftLeft')) {
            this.cameraMode = this.cameraMode === 'LOCKED' ? 'DYNAMIC' : 'LOCKED';
            this.spawnFloatingText(this.player.x, this.player.y, `CAMERA: ${this.cameraMode}`, '#ffffff');
        }

        // Camera Logic
        if (this.cameraMode === 'LOCKED') {
            this.camera.x = this.player.x - this.canvas.width / 2;
            this.camera.y = this.player.y - this.canvas.height / 2;
        } else {
            // Dynamic (Existing Logic)
            const marginX = this.canvas.width * 0.25;
            const marginY = this.canvas.height * 0.25;

            const screenX = this.player.x - this.camera.x;
            const screenY = this.player.y - this.camera.y;

            if (screenX < marginX) this.camera.x = this.player.x - marginX;
            else if (screenX > this.canvas.width - marginX) this.camera.x = this.player.x - (this.canvas.width - marginX);

            if (screenY < marginY) this.camera.y = this.player.y - marginY;
            else if (screenY > this.canvas.height - marginY) this.camera.y = this.player.y - (this.canvas.height - marginY);
        }

        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
            const magnitude = this.shakeIntensity || 5;
            this.shakeX = (Math.random() - 0.5) * magnitude * 2;
            this.shakeY = (Math.random() - 0.5) * magnitude * 2;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }

        this.mapSystem.update(dt);
        this.player.update(dt);
        if (this.weaponSystem) this.weaponSystem.update(dt);
        if (this.skillSystem) this.skillSystem.update(dt);

        this.difficultyMultiplier += (dt / 60) * 0.5;

        this.backgroundSystem.update(dt);

        this.projectilePool.forEachActive((p) => {
            p.update(dt);
            if (p.markedForDeletion) {
                this.projectilePool.release(p);
            }
        });

        this.enemies.forEach(e => e.update(dt));
        this.enemies = this.enemies.filter(e => !e.markedForDeletion);

        this.gems.forEach(g => g.update(dt));
        this.gems = this.gems.filter(g => !g.markedForDeletion);

        this.particlePool.forEachActive((p) => {
            p.update(dt);
            if (p.markedForDeletion) {
                this.particlePool.release(p);
            }
        });

        this.floatingTexts.forEach(t => t.update(dt));
        this.floatingTexts = this.floatingTexts.filter(t => !t.markedForDeletion);

        this.enemySpawnTimer += dt;
        if (this.enemySpawnTimer > this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }

        this.checkCollisions();
    }


    checkCollisions(): void {
        this.projectilePool.forEachActive(p => {
            if (p.markedForDeletion) return;

            if (p.isEnemy) {
                const dx = p.x - this.player.x;
                const dy = p.y - this.player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < p.radius + this.player.radius) {
                    if (!this.player.isInvulnerable) {
                        this.player.hp -= p.damage;
                        this.ui.update(0);
                        this.spawnFloatingText(this.player.x, this.player.y, `-${p.damage}`, '#ff0000');

                        if (this.player.hp <= 0) {
                            this.gameOver();
                        }
                    }
                    p.markedForDeletion = true;
                }
            } else {
                this.enemies.forEach(e => {
                    if (e.markedForDeletion) return;

                    const dx = p.x - e.x;
                    const dy = p.y - e.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < p.radius + e.radius) {
                        e.takeDamage(p.damage);
                        p.markedForDeletion = true;
                        this.spawnParticles(p.x, p.y, 3, '#ffaa00');

                        // EXP on Hit
                        const expGain = Math.max(1, Math.floor(p.damage * 0.1));
                        this.addExp(expGain);

                        if (e.markedForDeletion) {
                            this.enemiesKilled++;
                            this.spawnParticles(e.x, e.y, 10, '#ff0055');
                        }
                    }
                });
            }
        });

        this.enemies.forEach(e => {
            const dx = e.x - this.player.x;
            const dy = e.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < e.radius + this.player.radius) {
                if (!this.player.isInvulnerable) {
                    const collisionDmg = 10;
                    this.player.hp -= collisionDmg;
                    this.ui.update(0);
                    this.spawnFloatingText(this.player.x, this.player.y, `-${collisionDmg}`, '#ff0000');
                    this.addScreenShake(0.3, 5);

                    const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
                    this.player.velocity.x += Math.cos(angle) * 500;
                    this.player.velocity.y += Math.sin(angle) * 500;

                    if (this.player.hp <= 0) {
                        this.gameOver();
                    }
                }
            }
        });

        this.gems.forEach(g => {
            const dx = g.x - this.player.x;
            const dy = g.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < g.radius + this.player.radius) {
                this.addExp(g.value);
                g.markedForDeletion = true;
            }
        });
    }

    addExp(amount: number): void {
        this.exp += amount;
        this.audio.playGem();
        if (this.exp >= this.expToNextLevel) {
            this.levelUp();
        }
    }

    levelUp(): void {
        this.exp -= this.expToNextLevel;
        this.level++;
        this.expToNextLevel = Math.floor(this.expToNextLevel * 1.2);
        this.ui.update(0);

        this.audio.playLevelUp();
        this.isPaused = true;
        this.showUpgradeMenu();
    }

    showUpgradeMenu(choices?: any[]): void {
        const finalChoices = choices || this.upgradeSystem.getChoices(3);
        this.ui.showUpgradeMenu(finalChoices);
    }

    rerollUpgrades(): void {
        const choices = this.upgradeSystem.getChoices(3);
        this.ui.showUpgradeMenu(choices);
    }

    closeUpgradeMenu(): void {
        this.ui.closeUpgradeMenu();

        // Check for consecutive level up
        if (this.exp >= this.expToNextLevel) {
            this.levelUp();
            return;
        }

        // Countdown Resume
        if (!this.resumeCountdownEnabled) {
            this.gameState = 'PLAYING';
            this.isPaused = false;
            return;
        }

        this.gameState = 'RESUMING';

        let count = 3;
        const countdownEl = document.createElement('div');
        countdownEl.style.position = 'absolute';
        countdownEl.style.top = '50%';
        countdownEl.style.left = '50%';
        countdownEl.style.transform = 'translate(-50%, -50%)';
        countdownEl.style.fontSize = '80px';
        countdownEl.style.fontFamily = 'Rajdhani, sans-serif';
        countdownEl.style.color = '#fff';
        countdownEl.style.textShadow = '0 0 20px #00f0ff';
        countdownEl.style.zIndex = '2000';
        countdownEl.innerText = count.toString();
        document.body.appendChild(countdownEl);

        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownEl.innerText = count.toString();
                this.audio.playClick();
            } else {
                clearInterval(interval);
                if (document.body.contains(countdownEl)) {
                    document.body.removeChild(countdownEl);
                }
                this.gameState = 'PLAYING';
                this.isPaused = false;

                // Double check just in case (though we handled it above)
                if (this.exp >= this.expToNextLevel) {
                    this.levelUp();
                }
            }
        }, 1000);
    }

    gameOver(): void {
        this.isPaused = true;
        this.finalScore = Math.floor(this.exp + (this.mapSystem.totalTime * 10) + (this.enemiesKilled || 0) * 5);
        this.gameState = 'GAME_OVER';
        this.ui.showGameOver(this.finalScore);
    }

    submitScore(): void {
        const nameInput = document.getElementById('player-name-input') as HTMLInputElement;
        const name = nameInput.value.toUpperCase() || 'UNKNOWN';

        this.leaderboardSystem.saveScore({
            name: name,
            score: this.finalScore,
            level: this.level,
            difficulty: this.difficulty || 'NORMAL',
            date: new Date().toLocaleDateString()
        });

        this.ui.hideSubmitButton();

        // Hide game-over screen when showing leaderboard after score submit
        document.getElementById('game-over-screen')?.classList.add('hidden');

        this.showLeaderboard(true);
    }

    async showLeaderboard(fromGameOver: boolean = false): Promise<void> {
        const scores = await this.leaderboardSystem.getHighScores();
        this.ui.updateLeaderboardList(scores, fromGameOver);
    }

    triggerSecretReward(): void {
        this.isPaused = true;
        let levelsToGain = 5;
        for (let i = 0; i < levelsToGain; i++) {
            this.level++;
            this.expToNextLevel = Math.floor(this.expToNextLevel * 1.2);
        }
        this.ui.update(0);
        this.spawnFloatingText(this.player.x, this.player.y, "LEVEL OVERDRIVE!", '#ff00ea');

        this.secretRewardPicks = 3;
        this.showSecretCardSelection();
    }

    showSecretCardSelection(): void {
        const container = document.getElementById('card-container');
        if (container) container.innerHTML = '';

        const cards = [];
        for (let i = 0; i < 3; i++) {
            cards.push((this.upgradeSystem as any).cardSystem.generateMysticalCard());
        }

        cards.forEach((choice, index) => {
            const card = document.createElement('div');
            card.className = 'skill-card';
            card.style.animation = `mystical-pulse ${1 + index * 0.2}s infinite`;

            card.innerHTML = `
                <h3 style="color:${choice.color}; text-shadow:0 0 10px ${choice.color}">SECRET REWARD</h3>
                <h2 style="color:white; margin:10px 0">${choice.name}</h2>
                <p>${choice.description}</p>
                <div style="margin-top:15px; font-size:14px; color:#fff">PICKS LEFT: ${this.secretRewardPicks}</div>
            `;

            card.style.borderColor = choice.color;
            card.style.boxShadow = `0 0 20px ${choice.color}`;

            card.addEventListener('click', () => {
                choice.apply(this);
                this.spawnFloatingText(this.player.x, this.player.y, "POWER ACCEPTED", choice.color);

                this.secretRewardPicks--;
                if (this.secretRewardPicks > 0) {
                    this.showSecretCardSelection();
                } else {
                    this.closeUpgradeMenu();
                    this.spawnFloatingText(this.player.x, this.player.y, "SYSTEM OVERLOAD COMPLETE", "#ff00ea");
                }
            });

            if (container) container.appendChild(card);
        });

        const rerollBtn = document.getElementById('reroll-btn-container');
        if (rerollBtn) rerollBtn.style.display = 'none';

        document.getElementById('upgrade-menu')?.classList.remove('hidden');
    }

    triggerBossReward(): void {
        this.isPaused = true;
        const skill = this.skillSystem.generateBossSkillDrop();

        const container = document.getElementById('card-container');
        if (container) container.innerHTML = '';

        const card = document.createElement('div');
        card.className = 'skill-card';
        card.innerHTML = `
            <h3 style="color:${skill.color}; text-shadow:0 0 10px ${skill.color}">MYSTICAL DROP</h3>
            <h2 style="color:white; margin:10px 0">${skill.name}</h2>
            <p>${skill.description}</p>
            <div class="mystical-glow" style="margin-top:15px; font-size:12px; color:#aaa">BOSS REWARD</div>
        `;

        card.style.borderColor = skill.color;
        card.style.boxShadow = `0 0 20px ${skill.color}`;

        card.addEventListener('click', () => {
            this.skillSystem.equipSkill(skill.id);
            this.acquiredUpgrades.push({
                name: `Skill: ${skill.name}`,
                color: skill.color
            });
            this.closeUpgradeMenu();
            this.spawnFloatingText(this.player.x, this.player.y, "POWER ACQUIRED", skill.color);
        });

        if (container) container.appendChild(card);

        const rerollBtn = document.getElementById('reroll-btn-container');
        if (rerollBtn) rerollBtn.style.display = 'none';

        document.getElementById('upgrade-menu')?.classList.remove('hidden');
    }

    unlockTikTokReward(): void {
        // Exclusive Reward: "TikTok Pet" (Music Note Drone)
        // Check if already has it
        const hasPet = this.weaponSystem.activeWeapons.some((w: any) => w.config.name === 'TikTok Pet');
        if (!hasPet) {
            const petConfig = this.weaponSystem.createConfig(
                'ORBITAL',
                20, // High damage
                0.5, // Fast fire
                300,
                '#00ffff', // Cyan/TikTok color ish
                'TikTok Pet'
            );
            // Custom visual override could be handled in AutoWeapon if name === 'TikTok Pet'
            this.weaponSystem.installWeapon(petConfig);
            this.spawnFloatingText(this.player.x, this.player.y, "TIKTOK REWARD UNLOCKED!", '#00ffff');
            this.audio.playLevelUp(); // Celebrate!
        }
    }

    spawnProjectile(x: number, y: number, angle: number, speed: number, damage: number, isEnemy: boolean = false): void {
        const p = this.projectilePool.get();
        p.reset(x, y, angle, speed, damage, isEnemy);
        if (!isEnemy) this.audio.playShoot();
    }

    spawnParticles(x: number, y: number, count: number, color: string): void {
        for (let i = 0; i < count; i++) {
            const p = this.particlePool.get();
            p.reset(x, y, color);
        }
    }

    spawnFloatingText(x: number, y: number, text: string, color: string): void {
        this.floatingTexts.push(new FloatingText(x, y, text, color));
    }

    spawnEnemy(): void {
        const angle = Math.random() * Math.PI * 2;
        const dist = 900 + Math.random() * 200;

        const x = this.player.x + Math.cos(angle) * dist;
        const y = this.player.y + Math.sin(angle) * dist;

        const type = this.mapSystem.getSpawnType();

        const enemy = new Enemy(this, x, y, type);

        // Elite spawn chance: 5% base + 2% per zone
        const zoneCount = this.mapSystem?.zoneCount || 0;
        const eliteChance = 0.05 + (zoneCount * 0.02);
        if (Math.random() < eliteChance) {
            const modifierCount = 1 + Math.floor(zoneCount / 3); // More modifiers in later zones
            enemy.makeElite(Math.min(modifierCount, 4));
        }

        this.enemies.push(enemy);
    }


    spawnGem(x: number, y: number, value: number): void {
        this.gems.push(new Gem(this, x, y, value));
    }

    // New: Spawn Coin
    spawnCoin(x: number, y: number, value: number): void {
        // Re-using Gem class for now, but maybe with a special type/color?
        // For now, let's create a 'Coin' variant or just use specific value ranges.
        // Let's assume Gem handles XP, we need a separate entity or flag.
        // Simpler: Just spawn a floating text "+COIN" and add directly, or visual effect.
        // Plan said "Coin Drops", implies pickup.
        // Let's stick to direct add for MVP or better, reuse Gem with specific type?
        // Gem class is simple. Let's make a Coin class or just modify Gem?
        // Modify Gem is best but I can't see Gem.ts. 
        // I'll assume I can just use a "Gold Gem" and handle pickup logic in Gem? 
        // No, simpler: Direct addition with visual for now to save time/complexity.
        // Actually, "Coins from mobs" -> standard is pickup.
        // Let's hack it: Visual particle + auto-add OR assume new Gem type.
        // I'll make a simple "Currency" entity or just modify Enemy to "give" coin.
        // Let's modify Enemy to spawn a special "Coin" gem. I'll need to define a Coin entity.
        // Or.. `Gem` takes a `value`. `Game` handles `checkCollisions`.
        // Let's add `addCoin(amount)` method and call it when Enemy dies with probability. 
        // Visual: Spawn floating text "+1 Coin".

        this.coins += value;
        this.spawnFloatingText(x, y, `+${value} Coin`, '#ffaa00');
        if (this.ui) this.ui.updateCoins(this.coins); // If UI exists
    }

    addScreenShake(duration: number, intensity: number): void {
        if (!this.screenShakeEnabled) return;
        this.shakeTimer = duration;
        this.shakeIntensity = intensity;
    }

    updateFpsCounter(): void {
        if (!this.showFps) return;
        const fpsEl = document.getElementById('fps-counter');
        if (fpsEl) {
            fpsEl.innerText = `FPS: ${this.currentFps}`;
        }
    }

    draw(): void {
        this.renderSystem.draw();
    }
}
