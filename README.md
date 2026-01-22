# Cosmos Survivor

A bullet hell survival game set in the cosmos, built with TypeScript and Vite.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd cosmos-survivor

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your Supabase credentials
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## 🎮 Game Features

- **Bullet Hell Survival**: Dodge waves of enemies in cosmic environments
- **Weapon System**: Multiple weapon types with upgrade paths
- **Skill System**: Active and passive abilities
- **Progressive Difficulty**: Zones with increasing challenge
- **Leaderboard Integration**: Global high scores via Supabase
- **Multi-language Support**: English and Thai

## 🏗️ Architecture

### Core Systems

- **Game Engine**: Custom TypeScript game engine with ECS pattern
- **Rendering**: Canvas 2D with optimized draw calls
- **Audio**: Web Audio API with dynamic sound effects
- **Input**: Keyboard and mouse handling
- **Physics**: Custom collision detection and response

### Entity-Component-System

- **Entities**: Player, Enemy, Projectile, Particle, Gem
- **Components**: Position, Velocity, Health, etc.
- **Systems**: Render, Physics, Audio, UI, etc.

### Performance Optimizations

- **Object Pooling**: Reuse objects to reduce garbage collection
- **Spatial Partitioning**: Efficient collision detection
- **Batch Rendering**: Minimize draw calls
- **Fixed Time Step**: Consistent game loop

## 🎯 Development Roadmap

### Phase 1: Core Foundation ✅

- [x] Basic game loop
- [x] Player movement and controls
- [x] Enemy spawning and AI
- [x] Collision detection
- [x] Basic weapon system

### Phase 2: Content & Systems 🚧

- [ ] Advanced weapon types
- [ ] Skill system implementation
- [ ] Zone progression
- [ ] Boss battles
- [ ] Audio system enhancement

### Phase 3: Polish & Features 📋

- [ ] Visual effects and particles
- [ ] UI/UX improvements
- [ ] Mobile controls
- [ ] Achievement system
- [ ] Save/load functionality

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_BASE_URL=http://localhost:3000
```

### Game Settings

Adjust game parameters in `src/core/Config.ts`:

```typescript
export const CONFIG = {
  GAME: {
    ENEMY_SPAWN_INTERVAL: 2000,
    PLAYER_SPEED: 300,
    // ... more settings
  }
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Vite for the blazing fast build tool
- TypeScript for type safety
- Supabase for backend services
- The bullet hell genre for inspiration
