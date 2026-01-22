/**
 * MultiPlayer System
 * ระบบ MultiPlayer สำหรับเล่นร่วมกัน
 * ใช้ WebSocket สำหรับ real-time synchronization
 */

export interface PlayerData {
    id: string;
    x: number;
    y: number;
    angle: number;
    hp: number;
    maxHp: number;
    name: string;
    color: string;
}

export interface GameStateSync {
    players: PlayerData[];
    enemies: Array<{ id: string; x: number; y: number; type: string; hp: number }>;
    projectiles: Array<{ id: string; x: number; y: number; angle: number; ownerId: string }>;
    timestamp: number;
}

export class MultiPlayerSystem {
    private game: any;
    private ws: WebSocket | null = null;
    private roomId: string | null = null;
    private playerId: string | null = null;
    private isHost: boolean = false;
    private connectedPlayers: Map<string, PlayerData> = new Map();
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private syncInterval: number = 0;
    private lastSyncTime: number = 0;

    // WebSocket server URL (adjust for production)
    private readonly WS_URL = 'wss://your-websocket-server.com/game';
    // Fallback to localhost for development
    private readonly WS_URL_LOCAL = 'ws://localhost:8080/game';

    constructor(game: any) {
        this.game = game;
        this.playerId = this.generatePlayerId();
    }

    /**
     * Generate unique player ID
     */
    private generatePlayerId(): string {
        return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Create a new room (host)
     */
    async createRoom(playerName: string): Promise<{ success: boolean; roomId?: string; error?: string }> {
        try {
            const wsUrl = this.getWebSocketUrl();
            this.ws = new WebSocket(`${wsUrl}?action=create&playerId=${this.playerId}&playerName=${encodeURIComponent(playerName)}`);

            return new Promise((resolve) => {
                this.ws!.onopen = () => {
                    console.log('[MultiPlayer] Connected to server');
                    this.reconnectAttempts = 0;
                };

                this.ws!.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                    
                    if (data.type === 'room_created') {
                        this.roomId = data.roomId;
                        this.isHost = true;
                        this.startSyncLoop();
                        resolve({ success: true, roomId: data.roomId });
                    }
                };

                this.ws!.onerror = (error) => {
                    console.error('[MultiPlayer] WebSocket error:', error);
                    resolve({ success: false, error: 'Connection failed' });
                };

                this.ws!.onclose = () => {
                    console.log('[MultiPlayer] Connection closed');
                    this.handleReconnect();
                };
            });
        } catch (error) {
            console.error('[MultiPlayer] Failed to create room:', error);
            return { success: false, error: 'Failed to create room' };
        }
    }

    /**
     * Join an existing room
     */
    async joinRoom(roomId: string, playerName: string): Promise<{ success: boolean; error?: string }> {
        try {
            const wsUrl = this.getWebSocketUrl();
            this.ws = new WebSocket(`${wsUrl}?action=join&roomId=${roomId}&playerId=${this.playerId}&playerName=${encodeURIComponent(playerName)}`);

            return new Promise((resolve) => {
                this.ws!.onopen = () => {
                    console.log('[MultiPlayer] Connected to room:', roomId);
                    this.reconnectAttempts = 0;
                };

                this.ws!.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                    
                    if (data.type === 'room_joined') {
                        this.roomId = roomId;
                        this.isHost = false;
                        this.startSyncLoop();
                        resolve({ success: true });
                    } else if (data.type === 'error') {
                        resolve({ success: false, error: data.message });
                    }
                };

                this.ws!.onerror = (error) => {
                    console.error('[MultiPlayer] WebSocket error:', error);
                    resolve({ success: false, error: 'Connection failed' });
                };

                this.ws!.onclose = () => {
                    console.log('[MultiPlayer] Connection closed');
                    this.handleReconnect();
                };
            });
        } catch (error) {
            console.error('[MultiPlayer] Failed to join room:', error);
            return { success: false, error: 'Failed to join room' };
        }
    }

    /**
     * Get WebSocket URL (with fallback)
     */
    private getWebSocketUrl(): string {
        // Try production first, fallback to localhost
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return this.WS_URL_LOCAL;
        }
        return this.WS_URL;
    }

    /**
     * Handle incoming WebSocket messages
     */
    private handleMessage(data: any): void {
        switch (data.type) {
            case 'player_joined':
                this.addPlayer(data.player);
                this.game.spawnFloatingText(
                    this.game.player.x,
                    this.game.player.y,
                    `${data.player.name} joined!`,
                    '#00ff00'
                );
                break;

            case 'player_left':
                this.removePlayer(data.playerId);
                break;

            case 'game_state_sync':
                this.syncGameState(data.state);
                break;

            case 'player_update':
                this.updatePlayer(data.player);
                break;

            case 'enemy_spawned':
                if (!this.isHost) {
                    // Only host spawns enemies, others just sync
                    this.syncEnemy(data.enemy);
                }
                break;

            case 'projectile_fired':
                if (data.ownerId !== this.playerId) {
                    this.syncProjectile(data.projectile);
                }
                break;

            case 'error':
                console.error('[MultiPlayer] Error:', data.message);
                this.game.spawnFloatingText(
                    this.game.player.x,
                    this.game.player.y,
                    `ERROR: ${data.message}`,
                    '#ff0000'
                );
                break;
        }
    }

    /**
     * Start synchronization loop
     */
    private startSyncLoop(): void {
        // Send player state every 50ms (20 updates/sec)
        this.syncInterval = window.setInterval(() => {
            this.sendPlayerUpdate();
        }, 50);

        // Request full game state every 500ms
        setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.requestGameState();
            }
        }, 500);
    }

    /**
     * Send player update to server
     */
    private sendPlayerUpdate(): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        if (!this.game.player) return;

        const playerData: PlayerData = {
            id: this.playerId!,
            x: this.game.player.x,
            y: this.game.player.y,
            angle: this.game.player.angle || 0,
            hp: this.game.player.hp,
            maxHp: this.game.player.maxHp,
            name: this.game.loginSystem?.username || 'Player',
            color: this.getPlayerColor()
        };

        this.ws.send(JSON.stringify({
            type: 'player_update',
            player: playerData,
            timestamp: Date.now()
        }));
    }

    /**
     * Request full game state from host
     */
    private requestGameState(): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        if (this.isHost) return; // Host doesn't need to request

        this.ws.send(JSON.stringify({
            type: 'request_state',
            timestamp: Date.now()
        }));
    }

    /**
     * Sync game state from host
     */
    private syncGameState(state: GameStateSync): void {
        // Update other players
        state.players.forEach(player => {
            if (player.id !== this.playerId) {
                this.updatePlayer(player);
            }
        });

        // Sync enemies (if not host)
        if (!this.isHost && state.enemies) {
            // This would require enemy sync logic
            // For now, just log
            console.log('[MultiPlayer] Syncing enemies:', state.enemies.length);
        }
    }

    /**
     * Add a new player
     */
    private addPlayer(player: PlayerData): void {
        this.connectedPlayers.set(player.id, player);
        console.log('[MultiPlayer] Player added:', player.name);
    }

    /**
     * Remove a player
     */
    private removePlayer(playerId: string): void {
        this.connectedPlayers.delete(playerId);
        console.log('[MultiPlayer] Player removed:', playerId);
    }

    /**
     * Update player data
     */
    private updatePlayer(player: PlayerData): void {
        if (player.id === this.playerId) return;
        
        this.connectedPlayers.set(player.id, player);
        // Render other players (would need to add to render system)
    }

    /**
     * Sync enemy from host
     */
    private syncEnemy(enemy: any): void {
        // Add enemy to game (if not already exists)
        // This requires enemy ID tracking
    }

    /**
     * Sync projectile from other player
     */
    private syncProjectile(projectile: any): void {
        if (projectile.ownerId === this.playerId) return;
        
        // Spawn projectile from other player
        this.game.spawnProjectile(
            projectile.x,
            projectile.y,
            projectile.angle,
            projectile.speed,
            projectile.damage,
            false
        );
    }

    /**
     * Get player color based on ID
     */
    private getPlayerColor(): string {
        const colors = ['#00fff2', '#ff00ea', '#00ff88', '#ffaa00', '#00ccff'];
        const hash = this.playerId!.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    }

    /**
     * Handle reconnection
     */
    private handleReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[MultiPlayer] Max reconnection attempts reached');
            this.game.spawnFloatingText(
                this.game.player.x,
                this.game.player.y,
                'CONNECTION LOST',
                '#ff0000'
            );
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

        console.log(`[MultiPlayer] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

        setTimeout(() => {
            if (this.roomId) {
                // Try to rejoin room
                const playerName = this.game.loginSystem?.username || 'Player';
                if (this.isHost) {
                    this.createRoom(playerName);
                } else {
                    this.joinRoom(this.roomId, playerName);
                }
            }
        }, delay);
    }

    /**
     * Send enemy spawn to other players (host only)
     */
    sendEnemySpawn(enemy: any): void {
        if (!this.isHost || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        this.ws.send(JSON.stringify({
            type: 'enemy_spawned',
            enemy: {
                id: enemy.id || `enemy_${Date.now()}`,
                x: enemy.x,
                y: enemy.y,
                type: enemy.type,
                hp: enemy.hp
            },
            timestamp: Date.now()
        }));
    }

    /**
     * Send projectile fire to other players
     */
    sendProjectileFire(projectile: any): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        this.ws.send(JSON.stringify({
            type: 'projectile_fired',
            projectile: {
                id: projectile.id || `proj_${Date.now()}`,
                x: projectile.x,
                y: projectile.y,
                angle: projectile.angle,
                speed: projectile.speed,
                damage: projectile.damage,
                ownerId: this.playerId
            },
            timestamp: Date.now()
        }));
    }

    /**
     * Get connected players
     */
    getConnectedPlayers(): PlayerData[] {
        return Array.from(this.connectedPlayers.values());
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    /**
     * Disconnect from room
     */
    disconnect(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = 0;
        }

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.connectedPlayers.clear();
        this.roomId = null;
        this.isHost = false;
        this.reconnectAttempts = 0;
    }

    /**
     * Reset system
     */
    reset(): void {
        this.disconnect();
        this.playerId = this.generatePlayerId();
    }
}
