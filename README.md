# Strands Clone

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

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

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

## Development

The game uses React hooks for state management:
- `useState` for tracking selected cells, found words, and game state
- `useCallback` for optimized event handlers
- `useEffect` for game completion detection

## License

This is a clone project created for educational purposes. The original Strands game is owned by The New York Times.

