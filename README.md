# CatStrands 🐱

A clone of the New York Times Strands word puzzle game built with React and Vite.

## About the Game

Strands is a word search game where you find themed words by connecting adjacent letters in a grid. The goal is to:

- Find all the themed words hidden in the letter grid
- Discover the "spangram" - a special word that relates to the theme and spans across the board
- Use all letters exactly once

## Features

✨ **Interactive Grid**: Click and drag to select letters
🎯 **Multiple Puzzles**: 5 different themed puzzles to solve
🌟 **Spangram Detection**: Special highlighting for the theme-defining word
📱 **Responsive Design**: Works on desktop and mobile devices
🎨 **Beautiful UI**: Smooth animations and gradient backgrounds
🏆 **Progress Tracking**: See which words you've found

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

The simplest way to run CatStrands with Docker:

```bash
# Build and start the container
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
```

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

Edit \`src/data/puzzles.js\` to add new puzzles:

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

## Technologies Used

- **React 19**: UI library
- **Vite**: Build tool and dev server
- **CSS3**: Styling with animations and gradients
- **Docker**: Containerization with multi-stage builds
- **Nginx**: Production web server

## Development

The game uses React hooks for state management:
- `useState` for tracking selected cells, found words, and game state
- `useCallback` for optimized event handlers
- `useEffect` for game completion detection

## License

This is a clone project created for educational purposes. The original Strands game is owned by The New York Times.

