import { Game } from './core/Game'; // Will be .ts soon, but import logic resolves .ts in Vite

// Bootstrapper
window.addEventListener('load', () => {
    const game = new Game();
    game.start();
    (window as any).game = game;
});
