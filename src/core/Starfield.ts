export class Starfield {
    private game: any;
    private stars: any[] = [];
    private starCount: number = 100;
    private colors: string[] = [];
    private offsetX: number = 0;
    private offsetY: number = 0;

    constructor(game: any) {
        this.game = game;
        this.initParams();
        this.resize();
    }

    initParams(): void {
        this.colors = ['#ffffff', '#ffe9c4', '#d4fbff'];
    }

    resize(): void {
        this.stars = [];
        for (let i = 0; i < this.starCount; i++) {
            this.stars.push({
                x: Math.random() * this.game.canvas.width,
                y: Math.random() * this.game.canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.1,
                alpha: Math.random(),
                flickerSpeed: Math.random() * 0.05 + 0.01
            });
        }
    }

    update(dt: number, camera: any): void {
        if (!camera) return;

        this.offsetX = -camera.x * 0.5; // 0.5 parallax factor
        this.offsetY = -camera.y * 0.5;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

        // Draw Grid
        const gridSize = 100;
        const offsetX = this.offsetX % gridSize;
        const offsetY = this.offsetY % gridSize;

        ctx.strokeStyle = '#ffffff11';
        ctx.lineWidth = 1;
        ctx.beginPath();

        // Vertical lines
        for (let x = offsetX; x < this.game.canvas.width; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.game.canvas.height);
        }

        // Horizontal lines
        for (let y = offsetY; y < this.game.canvas.height; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(this.game.canvas.width, y);
        }
        ctx.stroke();

        this.stars.forEach(star => {
            let x = (star.x + this.offsetX) % this.game.canvas.width;
            let y = (star.y + this.offsetY) % this.game.canvas.height;

            if (x < 0) x += this.game.canvas.width;
            if (y < 0) y += this.game.canvas.height;

            ctx.globalAlpha = Math.abs(star.alpha);
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x, y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    }
}
