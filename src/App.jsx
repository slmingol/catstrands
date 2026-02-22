import './App.css';
import StrandsGame from './components/StrandsGame';
import puzzles from './data/puzzles';

function App() {
  // Get puzzle based on current date
  const getPuzzleOfTheDay = () => {
    const today = new Date();
    // Use days since epoch to get a consistent puzzle for each day
    const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
    const puzzleIndex = daysSinceEpoch % puzzles.length;
    return puzzles[puzzleIndex];
  };

  const currentPuzzle = getPuzzleOfTheDay();

  return (
    <div className="app">
      <header className="app-header">
        <h1>🐱 CatStrands</h1>
      </header>

      <StrandsGame 
        puzzle={currentPuzzle} 
      />
    </div>
  );
}

export default App;
