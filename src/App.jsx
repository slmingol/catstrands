import { useState } from 'react';
import './App.css';
import StrandsGame from './components/StrandsGame';
import puzzles from './data/puzzles';

function App() {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const currentPuzzle = puzzles[currentPuzzleIndex];

  const handleNextPuzzle = () => {
    setCurrentPuzzleIndex((prev) => (prev + 1) % puzzles.length);
  };

  const handlePrevPuzzle = () => {
    setCurrentPuzzleIndex((prev) => (prev - 1 + puzzles.length) % puzzles.length);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🐱 CatStrands</h1>
        <p className="subtitle">Find themed words by connecting adjacent letters</p>
      </header>
      
      <div className="puzzle-navigation">
        <button onClick={handlePrevPuzzle} className="nav-button">← Previous</button>
        <span className="puzzle-counter">Puzzle {currentPuzzleIndex + 1} of {puzzles.length}</span>
        <button onClick={handleNextPuzzle} className="nav-button">Next →</button>
      </div>

      <StrandsGame 
        key={currentPuzzleIndex}
        puzzle={currentPuzzle} 
      />
    </div>
  );
}

export default App;
