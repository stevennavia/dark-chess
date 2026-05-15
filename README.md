# Dark Chess

A **multiplayer dark fantasy chess game** with Soulslike aesthetics, built for the web.

> "A cursed ritual battle of strategy and darkness"

## Tech Stack

**Frontend:** Next.js, React Three Fiber, Three.js, TypeScript, Tailwind CSS, Zustand
**Backend:** Node.js, Colyseus, chess.js
**Deployment:** Vercel (frontend), Railway/Render (backend)

## Architecture

```
chess-game/
├── server/              # Colyseus multiplayer backend
│   ├── src/
│   │   ├── index.ts     # Server entry point
│   │   ├── rooms/
│   │   │   └── ChessRoom.ts  # Game room with chess.js validation
│   │   └── state/
│   │       └── GameState.ts   # Game state types
│   └── package.json
├── client/              # Next.js frontend
│   ├── src/
│   │   ├── app/         # Next.js App Router pages
│   │   ├── components/  # React components
│   │   │   ├── Board.tsx      # 3D chessboard
│   │   │   ├── Piece.tsx      # 3D chess pieces
│   │   │   ├── Scene.tsx      # Environment (ruins, pillars, statues)
│   │   │   ├── Atmosphere.tsx # Fog, particles, torches, lighting
│   │   │   ├── GameCanvas.tsx # R3F canvas integration
│   │   │   └── UI/           # Interface components
│   │   ├── store/       # Zustand state management
│   │   ├── network/     # Multiplayer WebSocket client
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Chess utilities (FEN parsing, etc.)
│   └── package.json
├── vercel.json          # Vercel deployment config
├── railway.json         # Railway deployment config
└── nixpacks.toml        # Nixpacks build config
```

## Quick Start

### 1. Install Dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 2. Run Locally

```bash
# Terminal 1: Start the server
cd server && npm run dev

# Terminal 2: Start the client
cd client && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create/join a room.

### 3. Deploy

**Frontend (Vercel):**
```bash
cd client
vercel --prod
```

**Backend (Railway):**
```bash
# Connect the server/ directory to Railway
# Railway auto-detects nixpacks.toml
```

Set `NEXT_PUBLIC_COLYSEUS_ENDPOINT` in Vercel env vars to your Railway URL.

## Multiplayer Flow

1. Player A creates a room → gets a room code
2. Player B joins with the room code
3. Server assigns colors (A=white, B=black)
4. Server validates all moves with chess.js
5. Broadcasts validated moves to both clients
6. Game ends on checkmate, stalemate, draw, or resignation

## Game Features

- Real-time WebSocket multiplayer via Colyseus
- Server-authoritative chess validation
- 3D dark fantasy environment (ruined cathedral, floating board)
- Low-poly gothic chess pieces with faction-specific designs
- Atmospheric effects (fog, particles, torches, dynamic lighting)
- Cinematic semi-isometric camera
- Reconnection support
- Room-based matchmaking

## Future Milestones

- [ ] Ranked matchmaking
- [ ] Spectator mode
- [ ] Replay system
- [ ] Cosmetic skins & boards
- [ ] Spell effects & animations
- [ ] Campaign mode with PvE bosses
- [ ] Seasonal events
- [ ] Sound design & music

## License

MIT
