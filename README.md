# Platformer Game Feel Tester

An interactive tool for testing and tuning 2D platformer game feel parameters in real-time. Built with Phaser 3 and React/Next.js.

## Features

- **Real-time Parameter Tuning**: Adjust 25+ parameters and see changes instantly
- **Comprehensive Physics Controls**: Movement, jumping, wall mechanics, dashing, and more
- **Preset System**: Quick-load different game feel profiles (Default, Floaty, Tight, Celeste-like, etc.)
- **Import/Export**: Save and share your parameter configurations as JSON
- **Debug Visualization**: Toggle collision boxes, velocity vectors, and state labels
- **Info Dialogs**: Detailed explanations for every parameter and category

## Controls

| Key | Action |
|-----|--------|
| Arrow Keys / WASD | Move |
| Space / Up / W | Jump |
| Shift | Dash |
| S / Down | Drop through one-way platforms |
| R | Reset player position |
| F1 | Toggle debug visualization |

## Parameter Categories

- **Movement**: Run speed, acceleration, deceleration, ground friction, air control
- **Jump**: Jump velocity, gravity, max fall speed, variable jump cut
- **Double Jump**: Enable/disable, separate velocity control
- **Coyote Time**: Grace period for jumping after leaving platforms
- **Jump Buffer**: Input buffering for pre-landing jump presses
- **Apex Modifier**: Hang time and control boost at jump peak
- **Wall Mechanics**: Wall slide, wall jump, wall stick time
- **Dash**: Dash speed, duration, cooldown, air dash count

## Getting Started

### Requirements

- [Node.js](https://nodejs.org) (v18+)
- [pnpm](https://pnpm.io) (recommended) or npm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Production Build

```bash
pnpm build
```

## Project Structure

| Path | Description |
|------|-------------|
| `src/components/ControlPanel/` | React UI for parameter controls |
| `src/game/config/` | Parameter definitions, presets, and descriptions |
| `src/game/entities/` | Player class and state machine |
| `src/game/entities/PlayerStates/` | Individual player states (Idle, Running, Jumping, etc.) |
| `src/game/systems/` | Input manager and debug renderer |
| `src/game/levels/` | Level builder and test level definition |
| `src/game/scenes/` | Phaser scene (PlatformerDemo) |
| `public/assets/` | Sprites and tile assets |

## Tech Stack

- [Phaser 3.90.0](https://phaser.io) - Game framework
- [Next.js 15.3.1](https://nextjs.org) - React framework
- [TypeScript 5](https://www.typescriptlang.org) - Type safety
- React state machine pattern for player behavior

## How It Works

The player uses a finite state machine with states for each movement type (Idle, Running, Jumping, Falling, WallSlide, Dashing). Each state handles its own physics and transitions.

Parameters are stored in a `ParameterRegistry` that notifies subscribers on changes. The React control panel and Phaser game communicate via an EventBus, allowing real-time updates without game restarts.

## License

Based on the [Phaser Next.js Template](https://github.com/phaserjs/template-nextjs) by Phaser Studio.
