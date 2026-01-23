export interface GameConfig {
  CANVAS_WIDTH: number;
  CANVAS_HEIGHT: number;
  FPS: number;
  DEBUG: boolean;
}

export interface EnvironmentConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  API_BASE_URL: string;
  ENVIRONMENT: 'development' | 'production' | 'test';
}

// Game Configuration
export const GAME_CONFIG: GameConfig = {
  CANVAS_WIDTH: 1920,
  CANVAS_HEIGHT: 1080,
  FPS: 60,
  DEBUG: import.meta.env.DEV
};

// Environment Configuration
export const ENV_CONFIG: EnvironmentConfig = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  ENVIRONMENT: (import.meta.env.MODE as any) || 'development'
};

// Legacy Support (for existing code)
export const SUPABASE_CONFIG = {
  URL: ENV_CONFIG.SUPABASE_URL,
  KEY: ENV_CONFIG.SUPABASE_ANON_KEY
};

// Validation
if (ENV_CONFIG.ENVIRONMENT === 'production' && GAME_CONFIG.DEBUG) {
  console.warn('Debug mode should be disabled in production!');
}

if (!ENV_CONFIG.SUPABASE_URL && ENV_CONFIG.ENVIRONMENT !== 'development') {
  console.warn('Supabase URL is missing in non-development environment. Online features will be disabled.');
}
