// Simple parallax starfield background system
// Uses procedural generation based on seed - no chunking complexity

export class BackgroundSystem {
    private game: any;
    private stars: { x: number, y: number, size: number, brightness: number, layer: number }[] = [];
    private nebulae: { x: number, y: number, radius: number, color: string }[] = [];

    // Biome Settings
    private skyColor: string = '#050510';
    private starColor: string = '#ffffff';
    private nebulaColors: string[] = ['#330044', '#001133', '#220011', '#002211'];

    // World size (virtual infinite space)
    private worldSize: number = 10000;
    private starCount: number = 2000;
    private nebulaCount: number = 20;

    constructor(game: any) {
        this.game = game;
        this.generateStars();
        this.generateNebulae();
    }

    generateStars(): void {
        this.stars = [];
        const seed = 12345; // Fixed seed for consistent stars

        for (let i = 0; i < this.starCount; i++) {
            // Pseudo-random distribution
            const hash = this.hashSeed(seed + i);
            this.stars.push({
                x: (hash % this.worldSize) - this.worldSize / 2,
                y: (this.hashSeed(hash) % this.worldSize) - this.worldSize / 2,
                size: 0.5 + (hash % 30) / 20,
                brightness: 0.3 + (hash % 70) / 100,
                layer: hash % 3 // 0, 1, 2 for parallax effect
            });
        }
    }

    generateNebulae(): void {
        this.nebulae = [];
        for (let i = 0; i < this.nebulaCount; i++) {
            const hash = this.hashSeed(99999 + i);
            this.nebulae.push({
                x: (hash % this.worldSize) - this.worldSize / 2,
                y: (this.hashSeed(hash) % this.worldSize) - this.worldSize / 2,
                radius: 200 + (hash % 300),
                color: this.nebulaColors[i % this.nebulaColors.length]
            });
        }
    }

    hashSeed(n: number): number {
        let h = n ^ 0xDEADBEEF;
        h = Math.imul(h ^ (h >>> 16), 0x85EBCA6B);
        h = Math.imul(h ^ (h >>> 13), 0xC2B2AE35);
        return Math.abs((h ^ (h >>> 16)) >>> 0);
    }

    setBiome(sky: string, star: string, nebula: string[]): void {
        this.skyColor = sky;
        this.starColor = star;
        this.nebulaColors = nebula;
        this.generateNebulae(); // Regenerate with new colors
    }

    update(dt: number): void {
        // No update needed for static starfield
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const cam = this.game.camera || { x: 0, y: 0 };
        const canvas = this.game.canvas;
        const w = canvas.width;
        const h = canvas.height;

        // Draw sky background
        ctx.fillStyle = this.skyColor;
        ctx.fillRect(cam.x, cam.y, w, h);

        // Draw nebulae (far layer, less parallax)
        ctx.globalAlpha = 0.3;
        this.nebulae.forEach(neb => {
            const parallax = 0.3;
            const screenX = neb.x - cam.x * parallax;
            const screenY = neb.y - cam.y * parallax;

            // Only draw if visible (rough check)
            if (Math.abs(screenX + cam.x - w / 2) < neb.radius + w &&
                Math.abs(screenY + cam.y - h / 2) < neb.radius + h) {

                const gradient = ctx.createRadialGradient(
                    screenX, screenY, 0,
                    screenX, screenY, neb.radius
                );
                gradient.addColorStop(0, neb.color);
                gradient.addColorStop(1, 'transparent');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(screenX, screenY, neb.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.globalAlpha = 1;

        // Draw stars with parallax layers
        this.stars.forEach(star => {
            // Parallax factor based on layer (0 = far, 2 = close)
            const parallax = 0.5 + star.layer * 0.25;
            const screenX = star.x - cam.x * (1 - parallax);
            const screenY = star.y - cam.y * (1 - parallax);

            // Wrap around for infinite starfield effect
            const wrapX = ((screenX % w) + w) % w + cam.x;
            const wrapY = ((screenY % h) + h) % h + cam.y;

            // Draw star
            ctx.globalAlpha = star.brightness;
            ctx.fillStyle = this.starColor;
            ctx.beginPath();
            ctx.arc(wrapX, wrapY, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1;
    }

    // Debug method
    debugChunks(): void {
        console.log('=== BackgroundSystem Debug ===');
        console.log('Stars count:', this.stars.length);
        console.log('Nebulae count:', this.nebulae.length);
        console.log('Camera pos:', this.game.camera?.x, this.game.camera?.y);
        console.log('Player pos:', this.game.player?.x, this.game.player?.y);
    }

    // Compatibility: forceGenerateAround does nothing in this simple system
    forceGenerateAround(x: number, y: number): void {
        // No-op for simple system
    }
}
