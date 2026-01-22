/**
 * Game State Management
 * จัดการ state ของเกมแยกออกจาก Game class เพื่อลดความซับซ้อน
 */

import { GameState as GameStateType, DifficultyLevel } from './Types';

export class GameStateManager {
    private state: GameStateType = 'MENU';
    private previousState: GameStateType = 'MENU';

    // Game progression
    public exp: number = 0;
    public coins: number = 0;
    public level: number = 1;
    public expToNextLevel: number = 100;
    public difficulty: DifficultyLevel = 'NORMAL';
    public difficultyMult: number = 1.5;
    public difficultyMultiplier: number = 0;

    // Statistics
    public finalScore: number = 0;
    public enemiesKilled: number = 0;
    public acquiredUpgrades: Array<{ name: string; color: string }> = [];

    // Settings
    public screenShakeEnabled: boolean = true;
    public damageNumbersEnabled: boolean = true;
    public showFps: boolean = false;
    public resumeCountdownEnabled: boolean = true;

    get currentState(): GameStateType {
        return this.state;
    }

    setState(newState: GameStateType): void {
        this.previousState = this.state;
        this.state = newState;
    }

    isPlaying(): boolean {
        return this.state === 'PLAYING';
    }

    isPaused(): boolean {
        return this.state === 'PAUSED' || this.state === 'RESUMING';
    }

    isGameOver(): boolean {
        return this.state === 'GAME_OVER';
    }

    isMenu(): boolean {
        return this.state === 'MENU';
    }

    reset(): void {
        this.exp = 0;
        this.level = 1;
        this.expToNextLevel = 100;
        this.difficultyMultiplier = 0;
        this.coins = 0;
        this.enemiesKilled = 0;
        this.finalScore = 0;
        this.acquiredUpgrades = [];
        this.state = 'MENU';
    }

    addExp(amount: number): void {
        this.exp += amount;
    }

    levelUp(): void {
        this.exp -= this.expToNextLevel;
        this.level++;
        this.expToNextLevel = Math.floor(this.expToNextLevel * 1.2);
    }

    calculateScore(): number {
        return Math.floor(
            this.exp + 
            (this.enemiesKilled * 5) +
            (this.level * 10)
        );
    }
}
