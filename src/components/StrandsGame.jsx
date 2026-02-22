import { useState, useEffect } from 'react';
import './StrandsGame.css';
import { recordGameCompletion, recordGameStart } from '../utils/statsManager';

function StrandsGame({ puzzle }) {
  const { grid, words, spangram, theme, rows, cols } = puzzle;
  
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [foundWordPaths, setFoundWordPaths] = useState([]); // Store cell paths for each found word
  const [isSelecting, setIsSelecting] = useState(false);
  const [usedCells, setUsedCells] = useState(new Set());
  const [currentWord, setCurrentWord] = useState('');
  const [message, setMessage] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedHints, setRevealedHints] = useState([]);
  const [statsRecorded, setStatsRecorded] = useState(false);
  const [nonSolutionWords, setNonSolutionWords] = useState([]); // Track non-solution words found
  const [hintProgress, setHintProgress] = useState(0); // Progress towards earning a hint (0-2)
  const [earnedHints, setEarnedHints] = useState(0); // Number of hints earned but not used
  const [animatingCells, setAnimatingCells] = useState(new Set()); // Cells currently animating
  const [hintedCells, setHintedCells] = useState([]); // Cells that are part of a hint

  // Check if game is won
  const isGameWon = foundWords.length === words.length + 1; // +1 for spangram

  // Record game start on mount
  useEffect(() => {
    recordGameStart();
  }, []);

  // Record stats when game is won
  useEffect(() => {
    if (isGameWon && !statsRecorded) {
      const totalWords = words.length + 1; // +1 for spangram
      recordGameCompletion(hintsUsed, foundWords.length, totalWords);
      setStatsRecorded(true);
    }
  }, [isGameWon, statsRecorded, hintsUsed, foundWords.length, words.length]);

  // Auto-clear error and info messages after 2 seconds
  useEffect(() => {
    if (message) {
      const isSuccess = message.includes('✓') || message.includes('🌟');
      const timer = setTimeout(() => {
        setMessage('');
      }, isSuccess ? 3000 : 2000); // Success messages stay longer
      return () => clearTimeout(timer);
    }
  }, [message]);


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

  // Find all cells that form a word in the grid using DFS
  const findWordPath = (targetWord) => {
    const word = targetWord.toUpperCase();
    const visited = new Set();
    
    const dfs = (index, path, wordIndex) => {
      if (wordIndex === word.length) {
        return path;
      }
      
      if (grid[index] !== word[wordIndex]) {
        return null;
      }
      
      visited.add(index);
      path.push(index);
      
      // Try all adjacent cells
      const [row, col] = getRowCol(index);
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          
          const newRow = row + dr;
          const newCol = col + dc;
          
          if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
            const newIndex = newRow * cols + newCol;
            if (!visited.has(newIndex)) {
              const result = dfs(newIndex, [...path], wordIndex + 1);
              if (result) return result;
            }
          }
        }
      }
      
      visited.delete(index);
      return null;
    };
    
    // Try starting from each cell
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] === word[0]) {
        visited.clear();
        const result = dfs(i, [], 0);
        if (result) return result;
      }
    }
    
    return null;
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
      // Trigger animation sequence for each cell
      const cellsToAnimate = [...selectedCells];
      cellsToAnimate.forEach((cellIndex, i) => {
        setTimeout(() => {
          setAnimatingCells(prev => new Set([...prev, cellIndex]));
          
          // Remove from animating after animation completes
          setTimeout(() => {
            setAnimatingCells(prev => {
              const next = new Set(prev);
              next.delete(cellIndex);
              return next;
            });
          }, 400); // Match animation duration
        }, i * 60); // Stagger by 60ms per cell
      });
      
      setFoundWords([...foundWords, word]);
      setFoundWordPaths([...foundWordPaths, { word, cells: [...selectedCells], isSpangram }]); // Store the path
      setUsedCells(new Set([...usedCells, ...selectedCells]));
      
      // Remove hinted cells that were just found
      setHintedCells(prev => prev.filter(cellIndex => !selectedCells.includes(cellIndex)));
      
      if (isSpangram) {
        setMessage(`🌟 Spangram found: ${word}!`);
      } else {
        setMessage(`✓ Found: ${word}`);
      }
    } else if (foundWords.includes(word)) {
      setMessage('Already found!');
    } else if (word.length >= 4) {
      // Valid length word that's not a solution - credit towards hint
      if (!nonSolutionWords.includes(word)) {
        setNonSolutionWords([...nonSolutionWords, word]);
        const newProgress = hintProgress + 1;
        
        if (newProgress >= 3) {
          // Earned a hint!
          setEarnedHints(earnedHints + 1);
          setHintProgress(0);
          setMessage(`✨ Hint earned! (${earnedHints + 1} available)`);
        } else {
          setHintProgress(newProgress);
          setMessage(`Good word! ${newProgress}/3 towards hint`);
        }
      } else {
        setMessage('Already counted!');
      }
    }
    
    setSelectedCells([]);
    setCurrentWord('');
  };

  const getCellClass = (index) => {
    let classes = ['cell'];
    
    if (animatingCells.has(index)) {
      classes.push('animating');
      const spangramPath = foundWordPaths.find(wp => wp.isSpangram);
      if (spangramPath && spangramPath.cells.includes(index)) {
        classes.push('spangram');
      }
    } else if (usedCells.has(index)) {
      classes.push('found');
      const spangramPath = foundWordPaths.find(wp => wp.isSpangram);
      if (spangramPath && spangramPath.cells.includes(index)) {
        classes.push('spangram');
      }
    } else if (selectedCells.includes(index)) {
      classes.push('selected');
    }
    
    // Add hint class if this cell is part of a hint (and not yet found)
    if (hintedCells.includes(index) && !usedCells.has(index)) {
      classes.push('hinted');
    }
    
    return classes.join(' ');
  };

  // Calculate the center position of a cell for drawing lines
  const getCellCenter = (index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    // Account for cell size (44px) and gap (16px)
    const cellSize = 44;
    const gapSize = 16;
    const totalWidth = cols * cellSize + (cols - 1) * gapSize;
    const totalHeight = rows * cellSize + (rows - 1) * gapSize;
    // Calculate center position including gaps
    const x = (col * (cellSize + gapSize) + cellSize / 2) / totalWidth * 100;
    const y = (row * (cellSize + gapSize) + cellSize / 2) / totalHeight * 100;
    return { x, y };
  };

  const handleHint = () => {
    // Check if hints are available
    if (earnedHints === 0) {
      setMessage(`Find ${3 - hintProgress} more words to earn a hint!`);
      return;
    }
    
    // Get list of all theme words including spangram
    const allWords = [...words, spangram];
    // Filter out already found words and already hinted words
    const unfoundWords = allWords.filter(w => 
      !foundWords.includes(w.toUpperCase()) && 
      !revealedHints.includes(w.toUpperCase())
    );
    
    if (unfoundWords.length === 0) {
      setMessage('All words already found or hinted!');
      return;
    }
    
    // Pick a random unfound word to reveal
    const hintWord = unfoundWords[Math.floor(Math.random() * unfoundWords.length)];
    
    // Find the path for this word
    const wordPath = findWordPath(hintWord);
    
    if (wordPath) {
      setHintedCells([...hintedCells, ...wordPath]);
      setRevealedHints([...revealedHints, hintWord.toUpperCase()]);
      setHintsUsed(hintsUsed + 1);
      setEarnedHints(earnedHints - 1);
      setMessage(`💡 Hint: Letters circled!`);
    } else {
      // Fallback if path not found
      setRevealedHints([...revealedHints, hintWord.toUpperCase()]);
      setHintsUsed(hintsUsed + 1);
      setEarnedHints(earnedHints - 1);
      setMessage(`💡 Hint: Look for "${hintWord.toUpperCase()}"`);
    }
  };

  return (
    <div className="strands-game">
      
      {isGameWon && (
        <div className="victory-banner">
          🎉 Perfect! You found all words including the spangram!
        </div>
      )}
      
      <div className="game-content">
      <div className="left-panel">
        
        <div className="theme-section">
          <div className="theme-title">Today's theme</div>
          <div className="theme-value" style={{ paddingTop: '10px', paddingBottom: '10px' }}>{theme}</div>
        </div>

        <div className="found-words">
          <h3>{foundWords.length} of {words.length + 1} theme words found.</h3>
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

        <div className="hint-section">
          <button 
            className="hint-button"
            onClick={handleHint}
            disabled={isGameWon || earnedHints === 0}
          >
            💡 Hint {earnedHints > 0 && `(${earnedHints})`}
          </button>
          <div className="hint-info">
            {hintProgress > 0 && earnedHints === 0 && (
              <div className="hint-progress">{hintProgress}/3 words towards hint</div>
            )}
            {earnedHints > 0 && (
              <div className="hints-available">{earnedHints} hint{earnedHints !== 1 ? 's' : ''} available</div>
            )}
            {hintsUsed > 0 && (
              <div className="hints-count">Hints used: {hintsUsed}</div>
            )}
          </div>
        </div>
        
        <div className="message-container">
          {message && !isGameWon && (
            <div className={`message ${message.includes('✓') || message.includes('🌟') ? 'success' : 'info'}`}>
              {message}
            </div>
          )}

        </div>

      </div>

      <div className="right-panel">
        <div className="current-word">
          {currentWord && (
            <span className="word-display">{currentWord}</span>
          )}
        </div>
        
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
    </div>
  );
}

export default StrandsGame;
