// Utility to fetch NYT Strands puzzles for personal use
// Fetches from: https://www.nytimes.com/svc/strands/v2/{date}.json
// Uses CORS proxy (api.allorigins.win) to bypass browser restrictions

/**
 * Fetch NYT Strands puzzle by date with retry logic
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} retries - Number of retry attempts (default: 3)
 * @returns {Promise<Object>} Puzzle data in game format
 */
export async function fetchNYTPuzzle(date, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Use CORS proxy to bypass browser CORS restrictions
      const nytUrl = `https://www.nytimes.com/svc/strands/v2/${date}.json`;
      const corsProxy = 'https://api.allorigins.win/raw?url=';
      const url = `${corsProxy}${encodeURIComponent(nytUrl)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        // Don't retry on 404 (puzzle doesn't exist)
        if (response.status === 404) {
          throw new Error(`Puzzle not found (404)`);
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // Convert NYT format to our game's format
      return convertNYTFormat(data);
    } catch (error) {
      // If it's the last attempt or a 404, throw the error
      if (attempt === retries || error.message.includes('404')) {
        console.error(`Error fetching NYT puzzle for ${date}:`, error);
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.warn(`Attempt ${attempt} failed for ${date}, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Converts NYT puzzle format to our game's format
 */
function convertNYTFormat(nytData) {
  // NYT uses array of row strings like ["ECERET", "MLGMAH", ...]
  // We need flat array of individual letters
  const grid = nytData.startingBoard.flatMap(row => row.split(''));
  
  return {
    rows: 8,
    cols: 6,
    theme: nytData.clue,
    spangram: nytData.spangram,
    grid: grid,
    words: nytData.themeWords,
    // Optional: store original coords if needed for hints
    _coords: {
      theme: nytData.themeCoords,
      spangram: nytData.spangramCoords
    }
  };
}

/**
 * Fetches today's puzzle
 */
export async function fetchTodaysPuzzle() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return fetchNYTPuzzle(today);
}

/**
 * Fetches yesterday's puzzle
 */
export async function fetchYesterdaysPuzzle() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];
  return fetchNYTPuzzle(dateStr);
}

/**
 * Fetches a random recent puzzle (within last 30 days)
 */
export async function fetchRandomRecentPuzzle() {
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const dateStr = date.toISOString().split('T')[0];
  return fetchNYTPuzzle(dateStr);
}

// ============= CACHING FUNCTIONS =============

const CACHE_KEY = 'nyt-strands-cache';
const CACHE_META_KEY = 'nyt-strands-cache-meta';

/**
 * Get cached puzzle by date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Object|null} Cached puzzle or null
 */
export function getCachedPuzzle(date) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    return cache[date] || null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

/**
 * Save puzzle to cache
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {Object} puzzle - Puzzle data
 */
export function cachePuzzle(date, puzzle) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    cache[date] = puzzle;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    
    // Update metadata
    const meta = {
      lastUpdated: new Date().toISOString(),
      puzzleCount: Object.keys(cache).length
    };
    localStorage.setItem(CACHE_META_KEY, JSON.stringify(meta));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
}

/**
 * Fetch and cache last N days of puzzles
 * Note: Automatically skips dates before Strands launch (March 4, 2024)
 * @param {number} days - Number of days to fetch (defaults to ~1 year if not specified)
 * @param {function} onProgress - Callback for progress updates (current, total, date, status)
 * @returns {Promise<Object>} { successful: number, failed: number, skipped: number, errors: Array }
 */
export async function fetchAndCacheRecentPuzzles(days = 365, onProgress = null) {
  const STRANDS_LAUNCH = new Date('2024-03-04');
  const results = {
    successful: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Skip dates before Strands launch
    if (date < STRANDS_LAUNCH) {
      continue;
    }
    
    const dateStr = date.toISOString().split('T')[0];

    // Check if already cached
    const cached = getCachedPuzzle(dateStr);
    if (cached) {
      results.skipped++;
      if (onProgress) {
        onProgress(i + 1, days, dateStr, 'cached');
      }
      continue;
    }

    if (onProgress) {
      onProgress(i + 1, days, dateStr, 'fetching');
    }

    try {
      const puzzle = await fetchNYTPuzzle(dateStr);
      cachePuzzle(dateStr, puzzle);
      results.successful++;
      
      // Longer delay to avoid rate limiting (500ms between requests)
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      results.failed++;
      results.errors.push({ date: dateStr, error: error.message });
      console.error(`Failed to fetch puzzle for ${dateStr}:`, error.message);
      
      // Smaller delay on failure before moving to next
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Log summary
  if (results.errors.length > 0) {
    console.group('❌ Failed Puzzle Downloads');
    console.table(results.errors);
    console.groupEnd();
  }
  
  console.log(`✅ Successfully cached ${results.successful} new puzzles`);
  if (results.skipped > 0) {
    console.log(`⏭️  Skipped ${results.skipped} already cached puzzles`);
  }

  return results;
}

/**
 * Get cache metadata
 * @returns {Object} { lastUpdated, puzzleCount }
 */
export function getCacheMetadata() {
  try {
    const meta = JSON.parse(localStorage.getItem(CACHE_META_KEY) || '{}');
    return {
      lastUpdated: meta.lastUpdated || null,
      puzzleCount: meta.puzzleCount || 0
    };
  } catch {
    return { lastUpdated: null, puzzleCount: 0 };
  }
}

/**
 * Clear all cached puzzles
 */
export function clearCache() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_META_KEY);
}

/**
 * Fetch puzzle with cache support
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {boolean} useCache - Whether to use cache (default: true)
 * @returns {Promise<Object>} Puzzle data
 */
export async function fetchPuzzleWithCache(date, useCache = true) {
  if (useCache) {
    const cached = getCachedPuzzle(date);
    if (cached) {
      console.log(`Using cached puzzle for ${date}`);
      return cached;
    }
  }

  const puzzle = await fetchNYTPuzzle(date);
  cachePuzzle(date, puzzle);
  return puzzle;
}

/**
 * Export entire cache to a JSON file
 * @returns {string} Filename of the exported cache
 */
export function exportCache() {
  const cacheData = {};
  
  console.log(`📦 Total localStorage items: ${localStorage.length}`);
  
  // Export all localStorage items that start with 'nyt-strands-'
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('nyt-strands-')) {
      cacheData[key] = localStorage.getItem(key);
      console.log(`✅ Exporting: ${key}`);
    } else if (key) {
      console.log(`⏭️  Skipping: ${key}`);
    }
  }
  
  const cacheKeys = Object.keys(cacheData);
  console.log(`📊 Exporting ${cacheKeys.length} localStorage keys`);
  
  // Count actual puzzles in the main cache
  let actualPuzzleCount = 0;
  if (cacheData[CACHE_KEY]) {
    try {
      const puzzleCache = JSON.parse(cacheData[CACHE_KEY]);
      actualPuzzleCount = Object.keys(puzzleCache).length;
      console.log(`📦 Contains ${actualPuzzleCount} puzzles`);
    } catch (e) {
      console.error('Error parsing cache:', e);
    }
  }
  
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    puzzleCount: actualPuzzleCount,
    cache: cacheData
  };
  
  console.log(`📄 Export data:`, {
    version: exportData.version,
    exportDate: exportData.exportDate,
    puzzleCount: exportData.puzzleCount,
    cacheKeys: cacheKeys
  });
  
  // Create blob and download
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filename = `catstrands_cache_${new Date().toISOString().split('T')[0]}.json`;
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return filename;
}

/**
 * Import cache from a JSON file
 * @param {File} file - The cache file to import
 * @returns {Promise<Object>} Import results { imported, skipped, errors }
 */
export async function importCache(file) {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.json')) {
      reject(new Error('File must be a JSON file'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate structure
        if (!data.cache || typeof data.cache !== 'object') {
          throw new Error('Invalid cache file format - missing cache object');
        }
        
        const cacheEntries = Object.entries(data.cache);
        console.log(`📦 Import file contains ${cacheEntries.length} total entries`);
        
        const results = {
          imported: 0,
          skipped: 0,
          errors: [],
          puzzlesAdded: 0,
          puzzlesUpdated: 0
        };
        
        // Import all cache entries
        cacheEntries.forEach(([key, value]) => {
          try {
            // Only import nyt-strands keys
            if (key.startsWith('nyt-strands-')) {
              // Check if already exists - compare the existing value
              const existing = localStorage.getItem(key);
              
              // Special handling for the main cache key (contains all puzzles)
              if (key === CACHE_KEY) {
                const existingCache = existing ? JSON.parse(existing) : {};
                const importCache = JSON.parse(value);
                
                // Count puzzles being added vs updated
                Object.keys(importCache).forEach(date => {
                  if (existingCache[date]) {
                    results.puzzlesUpdated++;
                  } else {
                    results.puzzlesAdded++;
                  }
                });
                
                // Merge caches
                const mergedCache = { ...existingCache, ...importCache };
                localStorage.setItem(key, JSON.stringify(mergedCache));
                console.log(`✅ Merged cache: ${results.puzzlesAdded} new, ${results.puzzlesUpdated} updated`);
                
                // Update metadata to reflect merged cache
                const meta = {
                  lastUpdated: new Date().toISOString(),
                  puzzleCount: Object.keys(mergedCache).length
                };
                localStorage.setItem(CACHE_META_KEY, JSON.stringify(meta));
                
                results.imported++;
              } else if (existing) {
                // For other keys (metadata, etc.)
                if (existing !== value) {
                  localStorage.setItem(key, value);
                  console.log(`🔄 Updated: ${key}`);
                  results.imported++;
                } else {
                  results.skipped++;
                }
              } else {
                localStorage.setItem(key, value);
                console.log(`✅ Imported: ${key}`);
                results.imported++;
              }
            } else {
              console.log(`⏭️  Skipping non-cache key: ${key}`);
            }
          } catch (error) {
            console.error(`❌ Error importing ${key}:`, error);
            results.errors.push({ key, error: error.message });
          }
        });
        
        console.log(`📊 Import results:`, results);
        resolve(results);
      } catch (error) {
        console.error('❌ Parse error:', error);
        reject(new Error(`Failed to parse cache file: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}
