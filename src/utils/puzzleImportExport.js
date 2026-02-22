/**
 * Puzzle Import/Export Utilities
 * Handles importing and exporting custom puzzles in JSON format
 */

/**
 * Export a puzzle to JSON file
 * @param {Object} puzzle - The puzzle object to export
 * @param {string} filename - Optional filename (defaults to puzzle theme)
 */
export const exportPuzzle = (puzzle, filename = null) => {
  if (!puzzle) {
    throw new Error('No puzzle to export');
  }

  // Create a clean copy with only the necessary fields
  const exportData = {
    rows: puzzle.rows,
    cols: puzzle.cols,
    theme: puzzle.theme,
    spangram: puzzle.spangram,
    grid: puzzle.grid,
    words: puzzle.words
  };

  // Convert to JSON with nice formatting
  const jsonString = JSON.stringify(exportData, null, 2);
  
  // Create a blob and download link
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Generate filename
  const safeName = filename || puzzle.theme.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.download = `strands_${safeName}.json`;
  link.href = url;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
  
  return true;
};

/**
 * Validate a puzzle object
 * @param {Object} puzzle - The puzzle to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validatePuzzle = (puzzle) => {
  const errors = [];

  // Check required fields
  if (!puzzle.rows || typeof puzzle.rows !== 'number' || puzzle.rows < 1) {
    errors.push('Invalid or missing "rows" field (must be a positive number)');
  }
  
  if (!puzzle.cols || typeof puzzle.cols !== 'number' || puzzle.cols < 1) {
    errors.push('Invalid or missing "cols" field (must be a positive number)');
  }
  
  if (!puzzle.theme || typeof puzzle.theme !== 'string' || puzzle.theme.trim() === '') {
    errors.push('Invalid or missing "theme" field (must be a non-empty string)');
  }
  
  if (!puzzle.spangram || typeof puzzle.spangram !== 'string' || puzzle.spangram.trim() === '') {
    errors.push('Invalid or missing "spangram" field (must be a non-empty string)');
  }
  
  if (!Array.isArray(puzzle.grid)) {
    errors.push('Invalid or missing "grid" field (must be an array)');
  } else {
    const expectedLength = puzzle.rows * puzzle.cols;
    if (puzzle.grid.length !== expectedLength) {
      errors.push(`Grid has ${puzzle.grid.length} letters, expected ${expectedLength} (${puzzle.rows}×${puzzle.cols})`);
    }
    
    // Check all grid items are single letters
    const invalidCells = puzzle.grid.filter(cell => 
      typeof cell !== 'string' || cell.length !== 1 || !/[A-Z]/i.test(cell)
    );
    if (invalidCells.length > 0) {
      errors.push(`Grid contains ${invalidCells.length} invalid cell(s) - all cells must be single letters`);
    }
  }
  
  if (!Array.isArray(puzzle.words)) {
    errors.push('Invalid or missing "words" field (must be an array)');
  } else if (puzzle.words.length === 0) {
    errors.push('Words array is empty (must have at least one word)');
  } else {
    // Check all words are strings
    const invalidWords = puzzle.words.filter(word => 
      typeof word !== 'string' || word.trim() === ''
    );
    if (invalidWords.length > 0) {
      errors.push(`Words array contains ${invalidWords.length} invalid word(s)`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Import a puzzle from a JSON file
 * @param {File} file - The file object to import
 * @returns {Promise<Object>} The parsed and validated puzzle object
 */
export const importPuzzle = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    // Check file type
    if (!file.name.endsWith('.json')) {
      reject(new Error('File must be a JSON file (.json)'));
      return;
    }

    // Read file
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonString = event.target.result;
        const puzzle = JSON.parse(jsonString);
        
        // Validate puzzle
        const validation = validatePuzzle(puzzle);
        
        if (!validation.valid) {
          reject(new Error('Invalid puzzle file:\n' + validation.errors.join('\n')));
          return;
        }
        
        // Normalize the puzzle data
        const normalizedPuzzle = {
          rows: puzzle.rows,
          cols: puzzle.cols,
          theme: puzzle.theme.trim(),
          spangram: puzzle.spangram.trim().toUpperCase(),
          grid: puzzle.grid.map(letter => letter.toUpperCase()),
          words: puzzle.words.map(word => word.trim().toUpperCase())
        };
        
        resolve(normalizedPuzzle);
      } catch (error) {
        if (error instanceof SyntaxError) {
          reject(new Error('Invalid JSON file: ' + error.message));
        } else {
          reject(error);
        }
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Generate a template puzzle JSON for users to fill in
 * @returns {string} JSON template string
 */
export const generateTemplate = () => {
  const template = {
    rows: 8,
    cols: 6,
    theme: "Your Theme Here",
    spangram: "THEMWORD",
    grid: [
      'T', 'H', 'E', 'M', 'W', 'O',
      'R', 'D', 'E', 'X', 'A', 'M',
      'P', 'L', 'E', 'G', 'R', 'I',
      'D', 'W', 'O', 'R', 'D', 'S',
      'H', 'E', 'R', 'E', 'A', 'N',
      'D', 'T', 'H', 'E', 'R', 'E',
      'F', 'I', 'L', 'L', 'I', 'N',
      'L', 'E', 'T', 'T', 'E', 'R'
    ],
    words: ['WORD', 'EXAMPLE', 'GRID', 'HERE']
  };
  
  return JSON.stringify(template, null, 2);
};

/**
 * Download a template puzzle file
 */
export const downloadTemplate = () => {
  const template = generateTemplate();
  const blob = new Blob([template], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.download = 'strands_puzzle_template.json';
  link.href = url;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
