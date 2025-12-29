# Word Link

A word game application built with TypeScript, p5.js, and Vite. Players place letter tiles on a 15x15 grid to form valid words, similar to Scrabble.

## Features

- **Interactive Game Board**: 15x15 grid for placing letter tiles
- **Letter Pool System**: Draw letters from a managed pool with configurable distributions
- **Dictionary Validation**: Real-time word validation against a dictionary
- **Visual Interface**: Built with p5.js for smooth graphics and interactions
- **Tile Configuration**: Customizable letter values and special tile types
- **Wildcard Support**: Select letters for wildcard tiles
- **QR Code Integration**: Generate QR codes for game sharing

## Project Structure

```
app/
├── src/
│   ├── canvas/          # p5.js rendering and UI logic
│   │   ├── sketch.js    # Main p5.js sketch
│   │   ├── grid.js      # Game grid implementation
│   │   ├── letterbar.js # Letter tile bar
│   │   └── ...
│   ├── service/         # Core game services
│   │   ├── BoardService.ts
│   │   ├── DictionaryService.ts
│   │   ├── LetterPoolService.ts
│   │   └── TileConfigService.ts
│   ├── config/          # Game configuration
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── webrtc/          # WebRTC functionality
├── index.html           # Application entry point
└── vite.config.ts       # Vite configuration
```

## Development

### Prerequisites

- Node.js
- pnpm

### Installation

```bash
pnpm install
```

### Development Server

```bash
# Local development
pnpm dev

# Development with network access
pnpm dev:network
```

### Build

```bash
pnpm build
```

The production build outputs to the `dist/` folder with relative paths for easy deployment.

### Preview Production Build

```bash
pnpm preview
```

### Linting

```bash
pnpm lint
```

## Technologies

- **TypeScript**: Type-safe game logic
- **p5.js**: Canvas-based rendering and interactions
- **Vite**: Fast build tool and dev server
- **QRCode**: QR code generation

## Game Services

- **BoardService**: Manages the game board state, letter placement, and word validation
- **DictionaryService**: Validates words against a dictionary
- **LetterPoolService**: Manages the pool of available letters
- **TileConfigService**: Handles tile configurations and special tiles
