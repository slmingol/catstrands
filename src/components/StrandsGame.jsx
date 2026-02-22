import { useState } from 'react';
import './StrandsGame.css';

function StrandsGame({ puzzle }) {
  const { grid, words, spangram, theme, rows, cols } = puzzle;
  
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [foundWordPaths, setFoundWordPaths] = useState([]); // Store cell paths for each found word
  const [isSelecting, setIsSelecting] = useState(false);
  const [usedCells, setUsedCells] = useState(new Set());
  const [currentWord, setCurrentWord] = useState('');
  const [message, setMessage] = useState('');

  // Check if game is won
  const isGameWon = foundWords.length === words.length + 1; // +1 for spangram


  const getRowCol = (index) => [Math.floor(index / cols), index % cols];

  const isAdjacent = (index1, index2) => {
    const [row1, col1] = getRowCol(index1);
    const [row2, col2] = getRowCol(index2);
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
  };

  const getWordFromCells = (cells) => {
    return cells.map(index => grid[index]).join('');
  };

  const handleMouseDown = (index) => {
    if (usedCells.has(index)) return;
    setIsSelecting(true);
    setSelectedCells([index]);
    setCurrentWord(grid[index]);
    setMessage('');
  };

  const handleMouseEnter = (index) => {
    if (!isSelecting || usedCells.has(index)) return;
    
    const lastCell = selectedCells[selectedCells.length - 1];
    
    // If going back to previous cell, remove last cell
    if (selectedCells.length > 1 && selectedCells[selectedCells.length - 2] === index) {
      const newCells = selectedCells.slice(0, -1);
      setSelectedCells(newCells);
      setCurrentWord(getWordFromCells(newCells));
      return;
    }
    
    // Check if adjacent and not already in path
    if (isAdjacent(lastCell, index) && !selectedCells.includes(index)) {
      const newCells = [...selectedCells, index];
      setSelectedCells(newCells);
      setCurrentWord(getWordFromCells(newCells));
    }
  };

  const handleMouseUp = () => {
    if (!isSelecting) return;
    setIsSelecting(false);
    
    const word = getWordFromCells(selectedCells).toUpperCase();
    
    // Check if word is valid
    const isSpangram = word === spangram.toUpperCase();
    const isValidWord = words.map(w => w.toUpperCase()).includes(word) || isSpangram;
    
    if (isValidWord && !foundWords.includes(word)) {
      setFoundWords([...foundWords, word]);
      setFoundWordPaths([...foundWordPaths, { word, cells: [...selectedCells], isSpangram }]); // Store the path
      setUsedCells(new Set([...usedCells, ...selectedCells]));
      
      if (isSpangram) {
        setMessage(`🌟 Spangram found: ${word}!`);
      } else {
        setMessage(`✓ Found: ${word}`);
      }
    } else if (foundWords.includes(word)) {
      setMessage('Already found!');
    } else if (word.length >= 4) {
      setMessage('Not a valid word');
    }
    
    setSelectedCells([]);
    setCurrentWord('');
  };

  const getCellClass = (index) => {
    if (usedCells.has(index)) {
      // Check if this cell is part of the spangram
      const spangramPath = foundWordPaths.find(wp => wp.isSpangram);
      if (spangramPath && spangramPath.cells.includes(index)) {
        return 'cell found spangram';
      }
      return 'cell found';
    }
    if (selectedCells.includes(index)) return 'cell selected';
    return 'cell';
  };

  // Calculate the center position of a cell for drawing lines
  const getCellCenter = (index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    // Each cell is 1fr, so we calculate percentage positions
    const x = (col + 0.5) / cols * 100; // Center of cell in percentage
    const y = (row + 0.5) / rows * 100; // Center of cell in percentage
    return { x, y };
  };

  return (
    <div className="strands-game">
      <div className="left-panel">
        <div className="theme-section">
          <div className="theme-title">Today's theme</div>
          <div className="theme-value">{theme}</div>
        </div>
        
        <div className="current-word">
          {currentWord && (
            <span className="word-display">{currentWord}</span>
          )}
        </div>
        
        <div className="message-container">
          {message && !isGameWon && (
            <div className={`message ${message.includes('✓') || message.includes('🌟') ? 'success' : 'info'}`}>
              {message}
            </div>
          )}
          
          {isGameWon && (
            <div className="message success">
              🎉 Congratulations! You found all words!
            </div>
          )}
        </div>

        <div className="found-words">
          <h3>Found Words ({foundWords.length}/{words.length + 1})</h3>
          <div className="words-list">
            {foundWords.map((word, index) => (
              <span 
                key={index} 
                className={`found-word ${word.toUpperCase() === spangram.toUpperCase() ? 'spangram-word' : ''}`}
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {isGameWon && (
          <div className="victory-banner">
            🎉 Perfect! You found all words including the spangram!
          </div>
        )}
      </div>

      <div className="right-panel">
        <div className="grid-container">
        <svg className="connection-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Lines for found words */}
          {foundWordPaths.map((wordPath, pathIndex) => {
            return wordPath.cells.map((cellIndex, i) => {
              if (i === 0) return null;
              const prevCell = wordPath.cells[i - 1];
              const currentCell = cellIndex;
              const start = getCellCenter(prevCell);
              const end = getCellCenter(currentCell);
              
              return (
                <line
                  key={`found-${pathIndex}-${i}`}
                  x1={`${start.x}%`}
                  y1={`${start.y}%`}
                  x2={`${end.x}%`}
                  y2={`${end.y}%`}
                  className={wordPath.isSpangram ? "connection-line-spangram" : "connection-line-found"}
                />
              );
            });
          })}
          
          {/* Lines for current selection */}
          {selectedCells.length > 1 && selectedCells.map((cellIndex, i) => {
            if (i === 0) return null; // Skip first cell as it has no previous cell
            const prevCell = selectedCells[i - 1];
            const currentCell = cellIndex;
            const start = getCellCenter(prevCell);
            const end = getCellCenter(currentCell);
            
            return (
              <line
                key={`line-${i}`}
                x1={`${start.x}%`}
                y1={`${start.y}%`}
                x2={`${end.x}%`}
                y2={`${end.y}%`}
                className="connection-line"
              />
            );
          })}
        </svg>

        <div 
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`
          }}
          onMouseLeave={() => {
            if (isSelecting) handleMouseUp();
          }}
        >
          {grid.map((letter, index) => (
            <div
              key={index}
              className={getCellClass(index)}
              onMouseDown={() => handleMouseDown(index)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseUp={handleMouseUp}
              onTouchStart={(e) => {
                e.preventDefault();
                handleMouseDown(index);
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                if (element && element.dataset.index) {
                  handleMouseEnter(parseInt(element.dataset.index));
                }
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleMouseUp();
              }}
              data-index={index}
            >
              {letter}
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

export default StrandsGame;
