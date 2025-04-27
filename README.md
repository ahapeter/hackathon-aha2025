# Interactive Games Platform - Swipee Module

A modular interactive games platform built with Next.js, featuring the Swipee game - a Tinder-style quiz game for presentations.

## Features

- **Modular Architecture**: Each game is a self-contained module with its core logic in pure TypeScript
- **Real-time Interaction**: Uses MQTT for real-time communication between presenter and audience
- **Modern UI**: Built with Material-UI and follows modern UX practices
- **Responsive Design**: Works seamlessly on both desktop and mobile devices

## Game Modules

### Swipee Game
A Tinder-style quiz game where:
- Audience swipes right for correct answers and left for incorrect ones
- Questions can include images and text
- Real-time score tracking
- Synchronized game state between presenter and audience

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   └── swipee/            # Swipee game routes
│       ├── [secret]/      # Protected routes (edit & present)
│       └── audience/      # Audience participation route
├── modules/               # Game modules
│   └── swipee/           # Swipee game module
│       ├── core/         # Pure TypeScript game logic
│       ├── store/        # State management
│       └── components/   # React components
└── shared/               # Shared utilities and services
    └── services/         # Common services (e.g., MQTT)
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view the demo.

## Game Routes

- **Edit Screen**: `/<gameName>/<secret-key>/edit?presentationId=xxx&slideId=yyy`
- **Playing Screen**: `/<gameName>/<secret-key>/present?presentationId=xxx&slideId=yyy`
- **Join Game Screen**: `/<gameName>/audience?presentationId=xxx&slideId=yyy&audienceId=zzz&audienceName=ggg&audienceEmoji=hhh`

## MQTT Topics

The game uses MQTT for real-time communication via the `broker.emqx.io` broker:
- Topic format: `swipee/game/<presentationId>`
- Message types:
  - `GAME_START`: Sent when the presenter starts the game
  - `GAME_STOP`: Sent when the presenter stops the game
  - `SCORE_UPDATE`: Sent when an audience member submits an answer

## Development

- Core game logic is in pure TypeScript with unit tests
- UI components use Material-UI for consistent styling
- State management with Zustand
- Real-time communication via MQTT

## License

MIT 