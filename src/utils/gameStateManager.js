/**
 * Game State Manager
 * Handles saving and loading game state for each puzzle
 */

const GAME_STATE_PREFIX = 'nyt-strands-game-state-';

/**
 * Generate a unique key for a puzzle
 * @param {Object} puzzle - The puzzle object
 * @param {string} puzzleDate - The puzzle date (YYYY-MM-DD) or null for local puzzles
 * @returns {string} Unique key for this puzzle
 */
const getPuzzleKey = (puzzle, puzzleDate) => {
  // If we have a date, use it (for NYT puzzles)
  if (puzzleDate) {
    return `${GAME_STATE_PREFIX}${puzzleDate}`;
  }
  
  // For custom/local puzzles, generate a key from puzzle content
  const puzzleHash = `${puzzle.theme}-${puzzle.spangram}`.toLowerCase().replace(/\s+/g, '-');
  return `${GAME_STATE_PREFIX}custom-${puzzleHash}`;
};

/**
 * Save game state to localStorage
 * @param {Object} puzzle - The puzzle object
 * @param {string} puzzleDate - The puzzle date or null
 * @param {Object} state - The game state to save
 */
export const saveGameState = (puzzle, puzzleDate, state) => {
  try {
    const key = getPuzzleKey(puzzle, puzzleDate);
    
    // Convert Sets to Arrays for storage
    const serializableState = {
      ...state,
      usedCells: state.usedCells ? Array.from(state.usedCells) : [],
      animatingCells: state.animatingCells ? Array.from(state.animatingCells) : [],
      timestamp: Date.now()
    };
    
    localStorage.setItem(key, JSON.stringify(serializableState));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};

/**
 * Load game state from localStorage
 * @param {Object} puzzle - The puzzle object
 * @param {string} puzzleDate - The puzzle date or null
 * @returns {Object|null} The saved game state or null if not found
 */
export const loadGameState = (puzzle, puzzleDate) => {
  try {
    const key = getPuzzleKey(puzzle, puzzleDate);
    const savedState = localStorage.getItem(key);
    
    if (!savedState) {
      return null;
    }
    
    const state = JSON.parse(savedState);
    
    // Convert Arrays back to Sets
    if (state.usedCells) {
      state.usedCells = new Set(state.usedCells);
    }
    if (state.animatingCells) {
      state.animatingCells = new Set(state.animatingCells);
    }
    
    return state;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
};

/**
 * Clear game state for a specific puzzle
 * @param {Object} puzzle - The puzzle object
 * @param {string} puzzleDate - The puzzle date or null
 */
export const clearGameState = (puzzle, puzzleDate) => {
  try {
    const key = getPuzzleKey(puzzle, puzzleDate);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
};

/**
 * Check if a puzzle has saved state
 * @param {Object} puzzle - The puzzle object
 * @param {string} puzzleDate - The puzzle date or null
 * @returns {boolean} True if saved state exists
 */
export const hasGameState = (puzzle, puzzleDate) => {
  try {
    const key = getPuzzleKey(puzzle, puzzleDate);
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
};

/**
 * Get all saved game states
 * @returns {Array} Array of {date, state} objects
 */
export const getAllGameStates = () => {
  const states = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(GAME_STATE_PREFIX)) {
        const state = JSON.parse(localStorage.getItem(key));
        const date = key.replace(GAME_STATE_PREFIX, '');
        states.push({ date, state });
      }
    }
  } catch (error) {
    console.error('Failed to get all game states:', error);
  }
  
  return states;
};

/**
 * Clear all game states (useful for debugging or reset)
 */
export const clearAllGameStates = () => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(GAME_STATE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keysToRemove.length} game states`);
  } catch (error) {
    console.error('Failed to clear all game states:', error);
  }
};
