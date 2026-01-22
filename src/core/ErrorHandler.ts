/**
 * Error Handler
 * จัดการ errors และ validation ในเกม
 * ป้องกันเกม crash และให้ feedback ที่ดี
 */

export class GameError extends Error {
    constructor(
        message: string,
        public code: string,
        public context?: Record<string, any>
    ) {
        super(message);
        this.name = 'GameError';
    }
}

export class ErrorHandler {
    private errorCount: number = 0;
    private maxErrors: number = 100; // Prevent infinite error loops
    private errors: Array<{ error: Error; timestamp: number; context?: any }> = [];

    /**
     * Handle an error gracefully
     */
    handleError(error: Error | GameError, context?: Record<string, any>): void {
        this.errorCount++;

        // Prevent infinite error loops
        if (this.errorCount > this.maxErrors) {
            console.error('Too many errors, stopping error handling');
            return;
        }

        // Log error
        const errorInfo = {
            error,
            timestamp: Date.now(),
            context
        };

        this.errors.push(errorInfo);

        // Keep only last 50 errors
        if (this.errors.length > 50) {
            this.errors.shift();
        }

        // Log to console
        console.error('Game Error:', error);
        if (context) {
            console.error('Context:', context);
        }

        // Try to recover or show user-friendly message
        if (error instanceof GameError) {
            this.handleGameError(error);
        } else {
            this.handleGenericError(error);
        }
    }

    /**
     * Handle game-specific errors
     */
    private handleGameError(error: GameError): void {
        switch (error.code) {
            case 'INVALID_STATE':
                console.warn('Invalid game state, attempting recovery');
                break;
            case 'MISSING_ENTITY':
                console.warn('Missing entity, skipping operation');
                break;
            case 'COLLISION_ERROR':
                console.warn('Collision detection error, skipping frame');
                break;
            default:
                console.warn('Unhandled game error:', error.code);
        }
    }

    /**
     * Handle generic errors
     */
    private handleGenericError(error: Error): void {
        // Try to prevent crash
        if (error.message.includes('Cannot read property')) {
            console.warn('Null reference error, attempting to continue');
        } else if (error.message.includes('is not a function')) {
            console.warn('Function call error, skipping operation');
        }
    }

    /**
     * Validate entity before operations
     */
    validateEntity(entity: any, entityName: string): boolean {
        if (!entity) {
            this.handleError(
                new GameError(`Missing ${entityName}`, 'MISSING_ENTITY'),
                { entityName }
            );
            return false;
        }

        if (typeof entity.x !== 'number' || typeof entity.y !== 'number') {
            this.handleError(
                new GameError(`Invalid ${entityName} position`, 'INVALID_ENTITY'),
                { entityName, entity }
            );
            return false;
        }

        if (isNaN(entity.x) || isNaN(entity.y)) {
            this.handleError(
                new GameError(`${entityName} has NaN position`, 'INVALID_ENTITY'),
                { entityName, entity }
            );
            return false;
        }

        return true;
    }

    /**
     * Validate game state
     */
    validateGameState(game: any): boolean {
        if (!game) {
            this.handleError(
                new GameError('Game instance is null', 'INVALID_STATE')
            );
            return false;
        }

        if (!game.player) {
            this.handleError(
                new GameError('Player is missing', 'INVALID_STATE')
            );
            return false;
        }

        return true;
    }

    /**
     * Get error statistics
     */
    getErrorStats(): { total: number; recent: number } {
        const recent = this.errors.filter(
            e => Date.now() - e.timestamp < 60000 // Last minute
        ).length;

        return {
            total: this.errorCount,
            recent
        };
    }

    /**
     * Clear error history
     */
    clear(): void {
        this.errors = [];
        this.errorCount = 0;
    }

    /**
     * Get recent errors for debugging
     */
    getRecentErrors(count: number = 10): Array<{ error: Error; timestamp: number; context?: any }> {
        return this.errors.slice(-count);
    }
}
