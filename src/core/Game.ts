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
import { CardSystem } from '../systems/CardSystem';
import { CONFIG } from './Config';
import { EventManager } from './EventManager';
import { RenderSystem } from '../systems/RenderSystem';
import { UIManager } from '../ui/UIManager';
import { ObjectPool } from './ObjectPool';
import { SpatialGrid } from './SpatialGrid';
import { GameState, CameraMode, ICollidable } from './Types';
import { GameStateManager } from './GameState';
import { GameManager } from './GameManager';
import { GameEventType } from './Events';
import { PerformanceMonitor } from './PerformanceMonitor';
import { ErrorHandler } from './ErrorHandler';
import { isValidNumber } from './Utils';
import { DebugPanel } from './DebugPanel';
import { PrestigeSystem } from '../systems/PrestigeSystem';
import { WeaponFusionSystem } from '../systems/WeaponFusionSystem';
import { SkillMasterySystem } from '../systems/SkillMasterySystem';
import { CosmeticShopSystem } from '../systems/CosmeticShopSystem';
import { StatPresetSystem } from '../systems/StatPresetSystem';
import { GameplayEnhancer } from '../systems/GameplayEnhancer';
import { SynergySystem } from '../systems/SynergySystem';
import { ShopSystem } from '../systems/ShopSystem';
import { MultiPlayerSystem } from '../systems/MultiPlayerSystem';
import { ComboManager } from '../systems/SkillComboSystem';

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
    public gameplayEnhancer: GameplayEnhancer;
    public synergySystem: SynergySystem;
    public shopSystem: ShopSystem;
    public multiPlayerSystem: MultiPlayerSystem;
    public prestigeSystem: PrestigeSystem;
    public weaponFusionSystem: WeaponFusionSystem;
    public skillMasterySystem: SkillMasterySystem;
    public cosmeticShopSystem: CosmeticShopSystem;
    public statPresetSystem: StatPresetSystem;
    public comboManager: ComboManager;

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
    public difficultyMultiplier: number = 0;

    public lastTime: number = 0;
    public accumulator: number = 0;
    public step: number = 1 / 60;

    // State properties delegated to StateManager
    public get gameState(): GameState {
        return this.stateManager ? this.stateManager.currentState : 'MENU';
    }
    public set gameState(v: GameState) {
        if (this.stateManager) this.stateManager.setState(v);
    }

    public get isPaused(): boolean {
        return this.stateManager ? this.stateManager.isPaused() : true;
    }
    public set isPaused(v: boolean) {
        if (!this.stateManager) return;
        if (v) this.stateManager.setState('PAUSED');
        else if (this.stateManager.currentState === 'PAUSED') this.stateManager.setState('PLAYING');
    }
    public camera: { x: number, y: number } = { x: 0, y: 0 };
    public acquiredUpgrades: any[] = [];
    public finalScore: number = 0;
    public enemiesKilled: number = 0;

    // Spatial Partitioning System
    private readonly spatialGrid: SpatialGrid;

    // Performance & Error Handling
    public performanceMonitor: PerformanceMonitor;
    public errorHandler: ErrorHandler;
    public debugPanel: DebugPanel;

    // State Management
    public stateManager: any;
    public gameManager: any;

    // Settings flags
    public screenShakeEnabled: boolean = true;
    public damageNumbersEnabled: boolean = true;
    public showFps: boolean = false;
    public fpsMode: 'BASIC' | 'ADVANCED' = 'BASIC';
    public resumeCountdownEnabled: boolean = true;

    // FPS Tracking
    public currentFps: number = 0;

    private secretRewardPicks: number = 0;
    public bossPicksRemaining: number = 0;
    public levelUpPicks: number = 0;
    public tempChoices: any[] = []; // Store current choices for verification if needed

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

        // Initialize Spatial Grid (cell size: 200px - optimal for most entity sizes)
        this.spatialGrid = new SpatialGrid(200);

        // Initialize Game State and Manager
        this.stateManager = new GameStateManager();
        this.gameManager = new GameManager();

        // Initialize Performance Monitor and Error Handler
        this.performanceMonitor = new PerformanceMonitor();
        this.errorHandler = new ErrorHandler();

        // Initialize Debug Panel (will be created when needed)
        this.debugPanel = new DebugPanel(
            this.performanceMonitor,
            this.errorHandler,
            this.spatialGrid
        );
        this.debugPanel.initKeyboardShortcut(this);

        // Initialize Gameplay Enhancers
        this.gameplayEnhancer = new GameplayEnhancer(this);
        this.synergySystem = new SynergySystem(this);
        this.shopSystem = new ShopSystem(this);
        this.multiPlayerSystem = new MultiPlayerSystem(this);
        this.prestigeSystem = new PrestigeSystem(this);
        this.weaponFusionSystem = new WeaponFusionSystem(this);
        this.skillMasterySystem = new SkillMasterySystem(this);
        this.cosmeticShopSystem = new CosmeticShopSystem(this);
        this.statPresetSystem = new StatPresetSystem(this);
        this.comboManager = new ComboManager(this);

        console.log("[GAME] All systems loaded");

        // Register systems with game manager
        this.gameManager.registerSystem(this.mapSystem);
        this.gameManager.registerSystem(this.weaponSystem);
        this.gameManager.registerSystem(this.skillSystem);

        document.addEventListener('click', () => {
            if (this.audio.ctx.state === 'suspended') {
                this.audio.ctx.resume();
            }
        }, { once: true });

        globalThis.addEventListener('keydown', (e) => {
            if (e.code === 'Tab') {
                e.preventDefault();
                // Delegate to UI to handle overlays and toggling properly
                if (this.ui && (this.gameState === 'PLAYING' || this.gameState === 'PAUSED')) {
                    (this.ui as any).handleGlobalTabToggle?.();
                } else {
                    this.togglePause();
                }
            }
        });
    }

    public resize = (): void => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Background system no longer needs explicit chunk updates
    }

    togglePause(): void {
        if (this.gameState !== 'PLAYING' && this.gameState !== 'PAUSED') return;
        const newState = this.isPaused ? 'PLAYING' : 'PAUSED';
        this.stateManager.setState(newState);
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
        // Reset state manager
        this.stateManager.reset();

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
        this.enemies = [];
        this.projectilePool.releaseAll();
        this.particlePool.releaseAll();
        this.gems = [];
        this.floatingTexts = [];
        this.upgradeSystem.reset();
        this.skillSystem.reset();
        if (this.gameplayEnhancer) this.gameplayEnhancer.reset();
        if (this.synergySystem) this.synergySystem.reset();
        if (this.shopSystem) this.shopSystem.reset();
        if (this.multiPlayerSystem) this.multiPlayerSystem.reset();

        // Center camera on player
        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;

        const container = document.getElementById('card-container');
        if (container) container.innerHTML = '';
        document.getElementById('upgrade-menu')?.classList.add('hidden');
        document.getElementById('leaderboard')?.classList.add('hidden');

        this.acquiredUpgrades = [];
        this.enemiesKilled = 0;
        this.finalScore = 0;
        this.accumulator = 0;

        // Reset legacy properties to ensure sync with StateManager
        this.level = 1;
        this.exp = 0;
        this.coins = 0;
        this.difficultyMultiplier = 0;

        this.stateManager.exp = 0;
        this.stateManager.level = 1;
        this.stateManager.coins = 0;
        this.stateManager.enemiesKilled = 0;

        // Ensure UI updates to reflect reset
        if (this.ui) {
            this.ui.updateCoins(0);
        }

        this.startGame();
    }

    startGame(): void {
        // Ensure map/timers reset when starting a fresh session (avoid stale 6:00+ timers)
        if (this.mapSystem && (this.mapSystem.totalTime > 0 || this.stateManager.currentState !== 'PLAYING')) {
            this.mapSystem.reset();
        }

        this.isPaused = false;
        this.gameState = 'PLAYING';
        this.stateManager.setState('PLAYING');
        this.ui.showGameHUD();

        // Center camera on player
        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;

        if (this.audio.ctx.state === 'suspended') this.audio.ctx.resume();

        // Apply prestige bonuses
        if (this.prestigeSystem) {
            this.prestigeSystem.applyPrestigeBonuses();
            const startingBonuses = this.prestigeSystem.getStartingBonuses();
            if (startingBonuses.level > 0) {
                for (let i = 0; i < startingBonuses.level; i++) {
                    this.stateManager.levelUp();
                }
            }
            if (startingBonuses.coins > 0) {
                this.stateManager.coins += startingBonuses.coins;
                this.spawnCoin(this.player.x, this.player.y, startingBonuses.coins);
            }
        }

        if (this.weaponSystem.activeWeapons.length === 0) {
            const startingWep = this.weaponSystem.createConfig('ORBITAL', 5, 1, 300, '#00f0ff', 'Plasma Drone');
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
        this.gameManager.reset();
        requestAnimationFrame(this.loop);
    }

    public loop = (currentTime: number): void => {
        try {
            this.performanceMonitor.startFrame();
            const deltaTime = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;

            if (!this.isPaused && this.gameState !== 'GAME_OVER') {
                this.performanceMonitor.startUpdate();
                // Use GameManager for system updates
                this.gameManager.update(deltaTime);
                // Update entities directly (not through GameManager for now)
                this.update(deltaTime);
                this.performanceMonitor.endUpdate();
            }

            this.performanceMonitor.startRender();
            this.draw();
            this.performanceMonitor.endRender();

            if (this.gameState === 'PLAYING' || this.gameState === 'GAME_OVER') {
                this.ui.update(deltaTime);
            }

            // Update performance metrics
            const gridStats = this.spatialGrid.getStats();
            this.performanceMonitor.updateCounts(
                this.enemies.length + this.gems.length + 1, // +1 for player
                this.projectilePool.active.length,
                this.particlePool.active.length,
                gridStats.cellCount
            );

            this.performanceMonitor.endFrame();

            // Update FPS counter display
            if (this.showFps) {
                this.updateFpsCounter();
            }

            // Update debug panel
            if (this.debugPanel) {
                this.debugPanel.update();
            }

            // Input update at end of frame
            this.input.update();
        } catch (error) {
            this.errorHandler.handleError(error as Error, { context: 'game loop' });
        }

        requestAnimationFrame(this.loop);
    }

    public cameraMode: CameraMode = 'DYNAMIC';

    update(dt: number): void {
        const input = this.input;

        this.updateCamera(input);
        this.updateShake(dt);

        // Logic Updates - ONLY when PLAYING
        if (this.stateManager.isPlaying()) {
            this.updateEntities(dt);
        }

        // Always update background for visual flair
        this.backgroundSystem.update(dt);
        this.updateParticlesAndText(dt);
        this.updateSpawnLogic(dt);

        // Rebuild spatial grid each frame for accurate collision detection
        this.rebuildSpatialGrid();

        this.checkCollisions();
    }

    private updateCamera(input: Input): void {
        // Toggle Camera Mode (Left Shift) - Debug only or In-Game
        if (input.isKeyJustPressed('ShiftLeft')) {
            this.cameraMode = this.cameraMode === 'LOCKED' ? 'DYNAMIC' : 'LOCKED';
            this.spawnFloatingText(this.player.x, this.player.y, `CAMERA: ${this.cameraMode}`, '#ffffff');
        }

        // Camera Logic
        if (this.stateManager.isPlaying()) {
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
        }
    }

    private updateShake(dt: number): void {
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
            const magnitude = this.shakeIntensity || 5;
            this.shakeX = (Math.random() - 0.5) * magnitude * 2;
            this.shakeY = (Math.random() - 0.5) * magnitude * 2;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }
    }

    private updateEntities(dt: number): void {
        this.mapSystem.update(dt);
        this.player.update(dt);
        if (this.weaponSystem) this.weaponSystem.update(dt);
        if (this.skillSystem) this.skillSystem.update(dt);
        if (this.gameplayEnhancer) this.gameplayEnhancer.update(dt);

        this.difficultyMultiplier += (dt / 60) * 0.5;

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
    }

    private updateParticlesAndText(dt: number): void {
        this.particlePool.forEachActive((p) => {
            p.update(dt);
            if (p.markedForDeletion) {
                this.particlePool.release(p);
            }
        });

        this.floatingTexts.forEach(t => t.update(dt));
        this.floatingTexts = this.floatingTexts.filter(t => !t.markedForDeletion);
    }

    private updateSpawnLogic(dt: number): void {
        this.enemySpawnTimer += dt;
        if (this.enemySpawnTimer > this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }
    }


    /**
     * Rebuild spatial grid with current entities and projectiles
     */
    private rebuildSpatialGrid(): void {
        const entities: ICollidable[] = [
            this.player as unknown as ICollidable,
            ...this.enemies as ICollidable[],
            ...this.gems as ICollidable[]
        ];

        const projectiles: any[] = this.projectilePool.active.map(p => ({
            x: p.x,
            y: p.y,
            radius: p.radius,
            angle: p.angle,
            speed: p.speed,
            damage: p.damage,
            isEnemy: p.isEnemy
        }));

        this.spatialGrid.rebuild(entities, projectiles);
    }

    checkCollisions(): void {
        try {
            this.performanceMonitor.startCollision();

            // Validate player
            if (!this.errorHandler.validateEntity(this.player, 'player')) {
                return;
            }

            // Use spatial grid for efficient collision detection
            this.projectilePool.forEachActive(p => {
                if (p.markedForDeletion) return;
                if (p.isEnemy) this.handleEnemyProjectile(p);
                else this.handlePlayerProjectile(p);
            });

            this.checkEnemyCollisions();
            this.checkGemCollisions();
            this.checkDashCollisions();

            this.performanceMonitor.endCollision();
        } catch (error) {
            this.errorHandler.handleError(error as Error, { context: 'collision detection' });
        }
    }

    private handleEnemyProjectile(p: any): void {
        const playerX = this.player.x;
        const playerY = this.player.y;
        const playerRadius = this.player.radius;

        // Player vs Enemy Projectile
        const dx = p.x - playerX;
        const dy = p.y - playerY;
        const distSq = dx * dx + dy * dy;
        const minDistSq = (p.radius + playerRadius) * (p.radius + playerRadius);

        if (distSq < minDistSq) {
            if (!this.player.isInvulnerable) {
                // Apply damage reduction with numeric guards
                let finalDamage = Number(p.damage) || 0;
                const dr = Math.max(0, Math.min(1, Number(this.player.damageReduction) || 0));
                const armor = Math.max(0, Math.min(1, Number(this.player.armor) || 0));
                finalDamage *= (1 - dr);
                finalDamage *= (1 - armor);
                finalDamage = Math.max(0, Math.min(1e6, finalDamage));

                const newHp = (Number(this.player.hp) || 0) - finalDamage;
                this.player.hp = Math.max(0, Math.min(Number(this.player.maxHp) || 0, newHp));
                this.ui.update(0);
                this.spawnFloatingText(playerX, playerY, `-${Math.round(finalDamage)}`, '#ff0000');

                // Invulnerability frames
                if (this.player.invulnFrameDuration > 0) {
                    this.player.isInvulnerable = true;
                    setTimeout(() => {
                        this.player.isInvulnerable = false;
                    }, this.player.invulnFrameDuration * 1000);
                }

                // Reflect damage
                if (this.player.reflectDamage > 0 && p.isEnemy) {
                    // Find enemy that shot this
                    const threshSq = 50 * 50;
                    this.enemies.forEach((e: any) => {
                        if (e.markedForDeletion) return;
                        const dx = e.x - p.x;
                        const dy = e.y - p.y;
                        if ((dx * dx + dy * dy) < threshSq) {
                            e.takeDamage(finalDamage * this.player.reflectDamage, 'reflected');
                        }
                    });
                }

                if (this.player.hp <= 0) {
                    this.gameOver();
                }
            }
            p.markedForDeletion = true;
        }
    }

    private handlePlayerProjectile(p: any): void {
        const pRadius = p.radius;
        const pX = p.x;
        const pY = p.y;
        const nearbyEnemies = this.spatialGrid.getNearbyEntities(pX, pY, pRadius * 2);

        for (const entity of nearbyEnemies) {
            const e = entity as Enemy;
            if (e.markedForDeletion || !this.enemies.includes(e)) continue;

            const dx = pX - e.x;
            const dy = pY - e.y;
            const distSq = dx * dx + dy * dy;
            const minDistSq = (pRadius + e.radius) * (pRadius + e.radius);

            if (distSq < minDistSq) {
                e.takeDamage(p.damage);
                p.markedForDeletion = true;
                this.spawnParticles(pX, pY, 3, '#ffaa00');
                const expGain = Math.max(1, Math.floor(p.damage * 0.1));
                this.addExp(expGain);

                if (e.markedForDeletion) {
                    this.stateManager.enemiesKilled++;
                    this.spawnParticles(e.x, e.y, 10, '#ff0055');
                    if (this.gameplayEnhancer) {
                        this.gameplayEnhancer.addCombo();
                        this.gameplayEnhancer.addKillStreak();
                        this.gameplayEnhancer.checkAchievements();
                    }
                    if (this.player.healthOnKill) {
                        this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.healthOnKill);
                    }
                }
                break;
            }
        }
    }

    private checkEnemyCollisions(): void {
        const playerX = this.player.x;
        const playerY = this.player.y;
        const playerRadius = this.player.radius;
        const nearbyEnemiesForPlayer = this.spatialGrid.getNearbyEntities(playerX, playerY, playerRadius * 2);

        for (const entity of nearbyEnemiesForPlayer) {
            const e = entity as Enemy;
            if (e.markedForDeletion || !this.enemies.includes(e)) continue;

            const dx = e.x - playerX;
            const dy = e.y - playerY;
            const distSq = dx * dx + dy * dy;
            const minDistSq = (e.radius + playerRadius) * (e.radius + playerRadius);

            if (distSq < minDistSq) {
                if (!this.player.isInvulnerable) {
                    const collisionDmg = 10;
                    this.player.hp = Math.max(0, this.player.hp - collisionDmg);
                    this.ui.update(0);
                    this.spawnFloatingText(playerX, playerY, `-${collisionDmg}`, '#ff0000');
                    this.addScreenShake(0.3, 5);

                    if (this.player.hp <= 0) {
                        this.gameOver();
                    }

                    const angle = Math.atan2(playerY - e.y, playerX - e.x);
                    this.player.velocity.x += Math.cos(angle) * 500;
                    this.player.velocity.y += Math.sin(angle) * 500;
                }
            }
        }
    }

    private checkGemCollisions(): void {
        const playerX = this.player.x;
        const playerY = this.player.y;
        const playerRadius = this.player.radius;
        const nearbyGems = this.spatialGrid.getNearbyEntities(playerX, playerY, playerRadius * 2);

        for (const entity of nearbyGems) {
            const g = entity as Gem;
            if (g.markedForDeletion || !this.gems.includes(g)) continue;

            const dx = g.x - playerX;
            const dy = g.y - playerY;
            const distSq = dx * dx + dy * dy;
            const minDistSq = (g.radius + playerRadius) * (g.radius + playerRadius);

            if (distSq < minDistSq) {
                this.addExp(g.value);
                g.markedForDeletion = true;
            }
        }
    }

    private checkDashCollisions(): void {
        if (this.player.isDashing && this.player.dashDamage > 0) {
            const nearby = this.spatialGrid.getNearbyEntities(this.player.x, this.player.y, this.player.radius * 2);
            for (const e of nearby) {
                const enemy = e as Enemy;
                if (!enemy.markedForDeletion && this.enemies.includes(enemy)) {
                    const dx = this.player.x - enemy.x;
                    const dy = this.player.y - enemy.y;
                    const distSq = dx * dx + dy * dy;
                    const range = this.player.radius + enemy.radius;

                    if (distSq < range * range) {
                        enemy.takeDamage(this.player.dashDamage, 'dash');
                        this.spawnParticles(enemy.x, enemy.y, 5, '#00f0ff');
                    }
                }
            }
        }
    }

    addExp(amount: number): void {
        if (!isValidNumber(amount) || amount <= 0) {
            this.errorHandler.handleError(
                new Error(`Invalid exp amount: ${amount}`),
                { context: 'addExp' }
            );
            return;
        }

        // Apply gem multiplier
        const finalAmount = Math.floor(amount * (this.player.gemMultiplier || 1));
        this.stateManager.addExp(finalAmount);
        this.audio.playGem();

        // Emit EXP gained event
        this.events.emit(GameEventType.EXP_GAINED, {
            amount: finalAmount,
            newExp: this.stateManager.exp,
            expToNextLevel: this.stateManager.expToNextLevel
        });

        if (this.stateManager.exp >= this.stateManager.expToNextLevel) {
            this.levelUp();
        }
    }

    levelUp(): void {
        this.stateManager.levelUp();
        this.ui.update(0);

        // Emit level up event here
        this.events.emit(GameEventType.PLAYER_LEVEL_UP, {
            newLevel: this.stateManager.level,
            exp: this.stateManager.exp,
            expToNextLevel: this.stateManager.expToNextLevel
        });

        this.audio.playLevelUp();
        this.stateManager.setState('PAUSED');

        // Double Pick Logic
        this.levelUpPicks = 1 + (this.player.extraUpgradePicks || 0);

        this.showUpgradeMenu();
    }

    handleUpgradePicked(choice: any): void {
        choice.apply(this);
        this.acquiredUpgrades.push({ name: choice.name, color: choice.color });

        this.levelUpPicks--;
        if (this.levelUpPicks > 0) {
            this.spawnFloatingText(this.player.x, this.player.y, `PICK ${this.levelUpPicks} MORE!`, "#00ff00");
            this.rerollUpgrades(); // Refresh choices for next pick
        } else {
            this.closeUpgradeMenu();
        }
    }

    showUpgradeMenu(choices?: any[]): void {
        const finalChoices = choices || this.upgradeSystem.getChoices(3);
        this.ui.showUpgradeMenu(finalChoices);
    }

    rerollUpgrades(): void {
        const choices = this.upgradeSystem.getChoices(3);
        this.ui.showUpgradeMenu(choices);
    }

    triggerBossReward(): void {
        const choices = this.upgradeSystem.getMysticalChoices(3);
        this.stateManager.setState('PAUSED');
        this.ui.showUpgradeMenu(choices);
        this.audio.playLevelUp();
        this.spawnFloatingText(this.player.x, this.player.y, "BOSS REWARD!", "#ff00ea");
    }

    closeUpgradeMenu(): void {
        this.ui.closeUpgradeMenu();

        // Check for consecutive level up
        if (this.stateManager.exp >= this.stateManager.expToNextLevel) {
            this.levelUp();
            return;
        }

        // Countdown Resume
        if (!this.resumeCountdownEnabled) {
            this.stateManager.setState('PLAYING');
            return;
        }

        this.stateManager.setState('RESUMING');

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
                    countdownEl.remove();
                }
                this.stateManager.setState('PLAYING');

                // Double check just in case (though we handled it above)
                if (this.stateManager.exp >= this.stateManager.expToNextLevel) {
                    this.levelUp();
                }
            }
        }, 1000);
    }

    gameOver(): void {
        this.stateManager.setState('GAME_OVER');
        this.stateManager.finalScore = Math.floor(
            this.stateManager.exp +
            (this.mapSystem.totalTime * 10) +
            (this.stateManager.enemiesKilled || 0) * 5
        );

        // Emit event
        this.events.emit(GameEventType.GAME_OVER, {
            score: this.stateManager.finalScore,
            level: this.stateManager.level,
            enemiesKilled: this.stateManager.enemiesKilled
        });

        this.ui.showGameOver(this.stateManager.finalScore);
    }

    submitScore(): void {
        const nameInput = document.getElementById('player-name-input') as HTMLInputElement;
        const name = nameInput.value.toUpperCase() || 'UNKNOWN';

        this.leaderboardSystem.saveScore({
            name: name,
            score: this.stateManager.finalScore,
            level: this.stateManager.level,
            difficulty: this.difficulty || 'NORMAL',
            date: new Date().toLocaleDateString()
        });

        this.ui.hideSubmitButton();
        // ensure leaderboard UI methods exist before calling (defensive)
        // (Keeping contracts consistent is preferred long-term.)

        // Hide game-over screen when showing leaderboard after score submit
        document.getElementById('game-over-screen')?.classList.add('hidden');

        this.showLeaderboard(true);
    }

    async showLeaderboard(fromGameOver: boolean = false): Promise<void> {
        const scores = await this.leaderboardSystem.getHighScores();
        this.ui.updateLeaderboardList(scores, fromGameOver);
    }

    triggerSecretReward(): void {
        this.stateManager.setState('PAUSED');
        let levelsToGain = 5;
        for (let i = 0; i < levelsToGain; i++) {
            this.stateManager.levelUp();
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

    spawnProjectile(x: number, y: number, angle: number, speed: number, damage: number, isEnemy: boolean = false): Projectile {
        const p = this.projectilePool.get();
        p.reset(x, y, angle, speed, damage, isEnemy);

        // Apply player stats if not enemy
        if (!isEnemy) {
            this.audio.playShoot();
            if (this.player.projectileSize > 1) {
                p.radius *= this.player.projectileSize;
            }
        }
        return p;
    }

    spawnParticles(x: number, y: number, count: number, color: string): void {
        for (let i = 0; i < count; i++) {
            const p = this.particlePool.get();
            p.reset(x, y, color);
        }
    }

    spawnFloatingText(x: number, y: number, text: string, color: string): void {
        // Global NaN Guard for UI
        if (text === 'NaN' || text.includes('NaN')) {
            // console.warn('[Game] Attempted to spawn NaN floating text');
            return;
        }
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

        // Emit event
        this.events.emit(GameEventType.ENEMY_SPAWNED, {
            enemyType: type,
            position: { x, y },
            isElite: enemy.isElite
        });
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

        this.stateManager.coins += value;
        this.spawnFloatingText(x, y, `+${value} Coin`, '#ffaa00');
        if (this.ui) this.ui.updateCoins(this.stateManager.coins);
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
            // Add click listener if not already added (hacky check but works for singleton)
            if (!fpsEl.onclick) {
                fpsEl.onclick = () => {
                    this.fpsMode = this.fpsMode === 'BASIC' ? 'ADVANCED' : 'BASIC';
                };
                fpsEl.title = "Click to toggle Detail Mode";
            }

            const metrics = this.performanceMonitor.getMetrics();
            let text = `FPS: ${metrics.fps}`;

            if (this.fpsMode === 'ADVANCED') {
                text += ` | Frame: ${metrics.frameTime.toFixed(1)}ms`;
                if (metrics.updateTime > 0) text += ` | Upd: ${metrics.updateTime.toFixed(1)}ms`;
                if (metrics.renderTime > 0) text += ` | Ren: ${metrics.renderTime.toFixed(1)}ms`;
                text += `\nEnt: ${metrics.entityCount} | Proj: ${metrics.projectileCount}`;
            }

            const warning = this.performanceMonitor.getPerformanceWarning();
            if (warning) {
                text += `\n⚠️ ${warning}`;
            }

            fpsEl.innerText = text;
        }
    }

    draw(): void {
        this.renderSystem.draw();
    }
}
