# CatStrands 🐱

[![Build and Push Docker Image](https://github.com/slmingol/catstrands/actions/workflows/docker-build.yml/badge.svg)](https://github.com/slmingol/catstrands/actions/workflows/docker-build.yml)
[![Docker Image](https://img.shields.io/badge/docker-ghcr.io-blue?logo=docker)](https://github.com/slmingol/catstrands/pkgs/container/catstrands)

A clone of the New York Times Strands word puzzle game built with React and Vite.

## About the Game

Strands is a word search game where you find themed words by connecting adjacent letters in a grid. The goal is to:

- Find all the themed words hidden in the letter grid
- Discover the "spangram" - a special word that relates to the theme and spans across the board
- Use all letters exactly once

## Features

✨ **Interactive Grid**: Click and drag to select letters
🎯 **Multiple Puzzles**: Play NYT Strands puzzles or local themed puzzles
🌟 **Spangram Detection**: Special highlighting for the theme-defining word (yellow)
📱 **Responsive Design**: Works on desktop and mobile devices
🎨 **Beautiful UI**: Smooth animations with bubbling effects and gradient backgrounds
🏆 **Progress Tracking**: See which words you've found
� **Stats Modal**: Track your game history, wins, and hints used
📰 **NYT Integration**: Auto-fetch daily puzzles from NYT Strands archive
📚 **Archive Browser**: Browse and download 720+ puzzles since March 4, 2024
📁 **Import/Export**: Create, share, and play custom puzzles
💾 **Cache Export/Import**: Transfer your puzzle cache between browsers or devices
🔄 **Auto-Backup**: Automatically backs up cache to server after downloading puzzles
💡 **Smart Hints**: Earn hints by finding non-solution words, dashed circles show letter positions
⚙️ **Settings Modal**: Clean UI with gear icon for all configuration options
🌐 **Persistent Storage**: Server-side cache backup survives browser cache clears

### Import/Export Custom Puzzles

Create and share your own Strands puzzles:

#### 📥 Import Puzzle
1. Click the **"📂 Import"** button
2. Select a JSON file with your custom puzzle
3. The puzzle loads instantly and is playable

#### 📤 Export Puzzle
1. Play any puzzle (NYT or custom)
2. Click the **"💾 Export"** button
3. Save the JSON file to share with others

#### 📝 Create Your Own Puzzle
1. Click the **"📝 Template"** button to download a template
2. Edit the JSON file with your puzzle data:
   ```json
   {
     "rows": 8,
     "cols": 6,
     "theme": "Office Supplies",
     "spangram": "PAPERS",
     "grid": ["P","A","P","E","R","S", ...48 letters total],
     "words": ["TAPE", "GLUE", "FILE", "DESK", "PENCIL"]
   }
   ```
3. Import your puzzle and play!

**Example**: See `example_office_supplies.json` in the project root

**Puzzle Format Rules:**
- Grid size: `rows` × `cols` = total letters in `grid` array
- Letters: Uppercase single characters (A-Z)
- Grid order: Left-to-right, top-to-bottom
- Words: Must form continuous paths through adjacent cells (includes diagonals)
- Spangram: Describes the theme, wraps through the grid

## How to Play

1. **Read the Theme** (or keep it hidden for extra challenge!)
2. **Select Letters**: Click and drag across adjacent letters to form words
   - Letters can connect horizontally, vertically, or diagonally
3. **Find Words**: Release to submit your word
   - Valid words will be highlighted in blue
   - The spangram will be highlighted in pink
4. **Complete the Puzzle**: Find all words to win!

## Installation

### Standard Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Docker Installation

#### Simple Setup (Quick Start)

The simplest way to run CatStrands - pulls pre-built image from GHCR (no build required):

```bash
# Pull and start the container
docker-compose -f docker-compose.simple.yml up -d

# App will be available at http://localhost:3000
```

Stop the container:
```bash
docker-compose -f docker-compose.simple.yml down
```

#### Full Setup (Development & Production)

Choose between development or production mode:

**Development Mode** (with hot reload):
```bash
# Start development server
docker-compose --profile dev up

# App will be available at http://localhost:5173
# Changes to source files will automatically reload
```

**Production Mode**:
```bash
# Build and start production server
docker-compose --profile prod up -d

# App will be available at http://localhost:8080
```

Stop services:
```bash
docker-compose --profile dev down   # for development
docker-compose --profile prod down  # for production
```

#### Plain Docker (No Compose)

```bash
# Build the image
docker build -t catstrands .

# Run the container
docker run -d -p 3000:80 --name catstrands catstrands

# Stop and remove
docker stop catstrands && docker rm catstrands
```

#### Using Makefile (Recommended)

For convenience, use the included Makefile:

```bash
# View all available commands
make help

# Quick start options
make simple      # Start with simple setup (port 3000)
make dev         # Start development mode (port 5173)
make prod        # Start production mode (port 8080)

# Stop services
make down-simple  # Stop simple setup
make down-dev     # Stop development
make down-prod    # Stop production

# Utility commands
make logs        # View logs
make clean       # Remove all containers and images

# CI/CD commands
make ci          # Build and push to GHCR (requires Docker login)
```

### Pulling from GitHub Container Registry

Pre-built images are automatically published to GHCR via GitHub Actions:

```bash
# Pull the latest image
docker pull ghcr.io/slmingol/catstrands:latest

# Run the pre-built image
docker run -d -p 3000:80 ghcr.io/slmingol/catstrands:latest
```

Available tags:
- `latest` - Latest build from main branch
- `main` - Latest main branch build
- `<commit-sha>` - Specific commit builds
- `v*` - Version tags (when released)

### Building and Pushing to GHCR (Manual)

To manually build and push to GHCR:

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Build and push multi-arch image
make ci

# Or use docker directly
docker buildx build --platform linux/amd64,linux/arm64 \
  -t ghcr.io/slmingol/catstrands:latest \
  --push .
```

**Note**: GitHub Actions automatically builds and pushes on every commit to main.

## Project Structure

\`\`\`
strands-clone/
├── src/
│   ├── components/
│   │   ├── StrandsGame.jsx      # Main game component
│   │   └── StrandsGame.css      # Game styling
│   ├── data/
│   │   └── puzzles.js           # Puzzle data
│   ├── App.jsx                  # Main app component
│   ├── App.css                  # App styling
│   └── main.jsx                 # Entry point
├── index.html
└── package.json
\`\`\`

## Adding New Puzzles

### Method 1: Import Feature (Recommended)

Use the built-in import/export feature:
1. Download template: Click **"📝 Template"** button
2. Edit the JSON with your puzzle
3. Import: Click **"📂 Import"** and select your file

### Method 2: Edit Source Code

Edit `src/data/puzzles.js` to add puzzles directly to the app:

\`\`\`javascript
{
  rows: 6,
  cols: 8,
  theme: "Your Theme",
  spangram: "THEMEWORD",
  grid: [
    // Array of letters (row by row)
  ],
  words: ['WORD1', 'WORD2', 'WORD3']
}
\`\`\`

## Architecture

This application uses a **multi-service architecture** within a single Docker container:

### Frontend
- **React 19** + **Vite** for the UI
- Served via **Nginx** on port 80
- Pure CSS3 animations with no UI frameworks

### Backend
- **Express.js** API server on port 3001
- **Filesystem cache persistence** at `/app/data/cache-backup.json`
- **Auto-backup**: Automatically saves cache after puzzle downloads
- **Auto-restore**: Restores cache on app load if browser localStorage is empty
- **Shared cache**: Single cache file for all users (household/family design)

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/cache/backup` | POST | Save cache to filesystem |
| `/api/cache/restore` | GET | Restore cache from filesystem |
| `/api/cache/info` | GET | Get backup metadata |

### Docker Configuration
- **Ports**: 80 (frontend), 3001 (backend)
- **Volume**: `catstrands-cache:/app/data` for persistent storage
- **Process Management**: `docker-entrypoint.sh` starts both nginx and Node.js server

## Technologies Used

- **React 19**: UI library
- **Vite**: Build tool and dev server
- **Express.js**: Backend API server
- **Node.js 20**: Server runtime environment
- **CSS3**: Styling with animations and gradients
- **Docker**: Containerization with multi-stage builds
- **Nginx**: Production web server and reverse proxy

## Development

The game uses React hooks for state management:
- `useState` for tracking selected cells, found words, and game state
- `useCallback` for optimized event handlers
- `useEffect` for game completion detection

## License

This is a clone project created for educational purposes. The original Strands game is owned by The New York Times.

