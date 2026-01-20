import { Game } from './core/Game'; // Will be .ts soon, but import logic resolves .ts in Vite

// Bootstrapper
window.addEventListener('load', () => {
    const game = new Game();
    game.start();

    // Expose game to window for debugging if needed
    (window as any).game = game;
});
