export class Gem {
    private game: any;
    public x: number;
    public y: number;
    public value: number;
    public radius: number = 6;
    public color: string = '#00ffaa';
    public markedForDeletion: boolean = false;

    public magnetRange: number = 150;
    public speed: number = 400;
    public velocity: { x: number, y: number } = { x: 0, y: 0 };

    constructor(game: any, x: number, y: number, value: number) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.value = value;
    }

    update(dt: number): void {
        const player = this.game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distSq = dx * dx + dy * dy;

        // Magnetic Pull
        const range = player.pickupRange || 150;
        if (distSq < range * range) {
            const dist = Math.sqrt(distSq);
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
        }
    }
}
