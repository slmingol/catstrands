import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const CACHE_FILE = process.env.CACHE_FILE || path.join(__dirname, '../data/cache-backup.json');
const MAX_BACKUPS = 5;

// NYT Strands API base URL
const NYT_API_BASE = 'https://www.nytimes.com/svc/strands/v2';

// In-memory puzzle cache (populated from file on startup)
let puzzleCache = {};

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Ensure data directory exists
const dataDir = path.dirname(CACHE_FILE);
await fs.mkdir(dataDir, { recursive: true }).catch(() => {});

// Puzzle cache lives alongside the main cache file
const PUZZLE_CACHE_FILE = path.join(dataDir, 'puzzle-cache.json');

// ============= SERVER-SIDE PUZZLE CACHE =============

// Timeout for NYT API requests (10 seconds)
const NYT_FETCH_TIMEOUT_MS = 10000;

/**
 * Convert NYT puzzle format to game format (mirrors client-side logic)
 */
function convertNYTFormat(nytData) {
  const { startingBoard, clue, spangram, themeWords } = nytData;
  if (!Array.isArray(startingBoard) || !clue || !spangram || !Array.isArray(themeWords)) {
    throw new Error('Invalid NYT puzzle format: missing required fields');
  }
  const grid = startingBoard.flatMap(row => row.split(''));
  return {
    rows: 8,
    cols: 6,
    theme: clue,
    spangram,
    grid,
    words: themeWords,
    _coords: {
      theme: nytData.themeCoords,
      spangram: nytData.spangramCoords
    }
  };
}

/**
 * Load puzzle cache from disk into memory
 */
async function loadPuzzleCache() {
  try {
    await fs.access(PUZZLE_CACHE_FILE);
    const data = await fs.readFile(PUZZLE_CACHE_FILE, 'utf-8');
    puzzleCache = JSON.parse(data);
    console.log(`📚 Loaded ${Object.keys(puzzleCache).length} puzzle(s) from server cache`);
  } catch {
    puzzleCache = {};
    console.log('📚 Starting with empty puzzle cache');
  }
}

// Debounced cache write to avoid excessive disk I/O
let saveCacheTimeout = null;
function scheduleSavePuzzleCache() {
  if (saveCacheTimeout) clearTimeout(saveCacheTimeout);
  saveCacheTimeout = setTimeout(() => {
    fs.writeFile(PUZZLE_CACHE_FILE, JSON.stringify(puzzleCache), 'utf-8')
      .then(() => console.log(`💾 Puzzle cache saved (${Object.keys(puzzleCache).length} entries)`))
      .catch(err => console.error('Failed to save puzzle cache:', err));
  }, 2000);
}

/**
 * Fetch a puzzle directly from NYT API (no CORS proxy needed server-side)
 */
async function fetchNYTPuzzleServer(date) {
  const url = `${NYT_API_BASE}/${date}.json`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NYT_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      const err = new Error(`HTTP ${response.status}`);
      err.status = response.status;
      throw err;
    }
    return convertNYTFormat(await response.json());
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Pre-fetch today's puzzle into the server cache (runs on startup and at midnight)
 */
async function prefetchTodaysPuzzle() {
  const today = new Date().toISOString().split('T')[0];
  if (puzzleCache[today]) {
    console.log(`✅ Today's puzzle (${today}) already in server cache`);
    return;
  }
  try {
    console.log(`🔄 Pre-fetching today's puzzle: ${today}`);
    const puzzle = await fetchNYTPuzzleServer(today);
    puzzleCache[today] = puzzle;
    scheduleSavePuzzleCache();
    console.log(`✅ Today's puzzle (${today}) cached on server`);
  } catch (err) {
    console.error(`❌ Failed to pre-fetch today's puzzle (${today}):`, err.message);
  }
}

/**
 * Schedule the next midnight pre-fetch (re-schedules itself each day)
 */
function scheduleMidnightPrefetch() {
  const now = new Date();
  const nextMidnight = new Date();
  // 5 minutes past midnight to allow NYT to publish
  nextMidnight.setHours(24, 5, 0, 0);
  const msUntilMidnight = nextMidnight - now;
  setTimeout(() => {
    prefetchTodaysPuzzle().catch(console.error);
    scheduleMidnightPrefetch();
  }, msUntilMidnight);
  const minutesUntil = Math.round(msUntilMidnight / 60000);
  console.log(`⏰ Next puzzle pre-fetch scheduled in ${minutesUntil} minute(s)`);
}

// Helper function to get backup file path by version
function getBackupPath(version) {
  const dir = path.dirname(CACHE_FILE);
  const ext = path.extname(CACHE_FILE);
  const base = path.basename(CACHE_FILE, ext);
  return path.join(dir, `${base}-${version}${ext}`);
}

// Helper function to get all backup files
async function getBackupFiles() {
  try {
    const dir = path.dirname(CACHE_FILE);
    const ext = path.extname(CACHE_FILE);
    const base = path.basename(CACHE_FILE, ext);
    const files = await fs.readdir(dir);
    
    const backups = files
      .filter(f => f.startsWith(base) && f.endsWith(ext))
      .map(f => {
        const match = f.match(new RegExp(`${base}-(\\d+)${ext.replace('.', '\\.')}`));
        return match ? { file: f, version: parseInt(match[1], 10) } : null;
      })
      .filter(b => b !== null)
      .sort((a, b) => b.version - a.version); // Sort by version descending
    
    return backups;
  } catch (error) {
    return [];
  }
}

// Helper function to rotate backups
async function rotateBackups() {
  const backups = await getBackupFiles();
  
  // Delete backups beyond MAX_BACKUPS
  for (let i = MAX_BACKUPS - 1; i < backups.length; i++) {
    const filePath = path.join(path.dirname(CACHE_FILE), backups[i].file);
    await fs.unlink(filePath).catch(() => {});
    console.log(`Deleted old backup: ${backups[i].file}`);
  }
  
  // Rotate existing backups (increment version numbers)
  for (let i = 0; i < Math.min(backups.length, MAX_BACKUPS - 1); i++) {
    const oldPath = path.join(path.dirname(CACHE_FILE), backups[i].file);
    const newPath = getBackupPath(backups[i].version + 1);
    await fs.rename(oldPath, newPath).catch(() => {});
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve a puzzle by date (shared server-side cache, no CORS proxy needed)
app.get('/api/puzzles/:date', async (req, res) => {
  const { date } = req.params;

  // Validate date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }

  // Return from cache if available
  if (puzzleCache[date]) {
    return res.json({ success: true, puzzle: puzzleCache[date], source: 'cache' });
  }

  // Fetch from NYT, cache, and return
  try {
    const puzzle = await fetchNYTPuzzleServer(date);
    puzzleCache[date] = puzzle;
    scheduleSavePuzzleCache();
    return res.json({ success: true, puzzle, source: 'nyt' });
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ error: 'Puzzle not found', date });
    }
    console.error(`Error fetching puzzle for ${date}:`, err.message);
    return res.status(502).json({ error: 'Failed to fetch puzzle from NYT', details: err.message });
  }
});

// Backup cache to filesystem
app.post('/api/cache/backup', async (req, res) => {
  try {
    const { cache } = req.body;
    
    if (!cache || typeof cache !== 'object') {
      return res.status(400).json({ error: 'Invalid cache data' });
    }

    const backupData = {
      version: '1.0',
      lastBackup: new Date().toISOString(),
      cache
    };

    // Rotate existing backups
    await rotateBackups();
    
    // Write new backup as version 1
    const newBackupPath = getBackupPath(1);
    await fs.writeFile(newBackupPath, JSON.stringify(backupData, null, 2), 'utf-8');
    
    console.log(`Cache backed up: ${Object.keys(cache).length} keys (keeping last ${MAX_BACKUPS} versions)`);
    
    res.json({ 
      success: true, 
      message: 'Cache backed up successfully',
      keys: Object.keys(cache).length,
      timestamp: backupData.lastBackup,
      maxBackups: MAX_BACKUPS
    });
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ error: 'Failed to backup cache', details: error.message });
  }
});

// Restore cache from filesystem
app.get('/api/cache/restore', async (req, res) => {
  try {
    const { version } = req.query;
    const backupVersion = version ? parseInt(version, 10) : 1;
    const backupPath = getBackupPath(backupVersion);
    
    // Check if backup file exists
    try {
      await fs.access(backupPath);
    } catch {
      return res.json({ 
        success: true, 
        cache: null, 
        message: `No backup found for version ${backupVersion}` 
      });
    }

    const data = await fs.readFile(backupPath, 'utf-8');
    const backupData = JSON.parse(data);
    
    if (!backupData.cache || typeof backupData.cache !== 'object') {
      return res.status(400).json({ error: 'Invalid backup data' });
    }

    console.log(`Cache restored from version ${backupVersion}: ${Object.keys(backupData.cache).length} keys`);
    
    res.json({ 
      success: true, 
      cache: backupData.cache,
      lastBackup: backupData.lastBackup,
      keys: Object.keys(backupData.cache).length,
      version: backupVersion
    });
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ error: 'Failed to restore cache', details: error.message });
  }
});

// Get backup info (without returning all data)
app.get('/api/cache/info', async (req, res) => {
  try {
    const backups = await getBackupFiles();
    
    if (backups.length === 0) {
      return res.json({ 
        exists: false,
        message: 'No backups found',
        maxBackups: MAX_BACKUPS
      });
    }

    // Get info from the most recent backup (version 1)
    const latestBackup = backups[0];
    const backupPath = path.join(path.dirname(CACHE_FILE), latestBackup.file);
    const data = await fs.readFile(backupPath, 'utf-8');
    const backupData = JSON.parse(data);
    
    res.json({ 
      exists: true,
      lastBackup: backupData.lastBackup,
      keys: Object.keys(backupData.cache || {}).length,
      version: backupData.version,
      availableBackups: backups.length,
      maxBackups: MAX_BACKUPS
    });
  } catch (error) {
    console.error('Info error:', error);
    res.status(500).json({ error: 'Failed to get backup info', details: error.message });
  }
});

// List all available backups
app.get('/api/cache/backups', async (req, res) => {
  try {
    const backups = await getBackupFiles();
    
    if (backups.length === 0) {
      return res.json({ 
        success: true,
        backups: [],
        message: 'No backups found',
        maxBackups: MAX_BACKUPS
      });
    }

    // Get metadata for each backup
    const backupInfo = await Promise.all(
      backups.map(async (backup) => {
        try {
          const backupPath = path.join(path.dirname(CACHE_FILE), backup.file);
          const data = await fs.readFile(backupPath, 'utf-8');
          const backupData = JSON.parse(data);
          const stats = await fs.stat(backupPath);
          
          return {
            version: backup.version,
            lastBackup: backupData.lastBackup,
            keys: Object.keys(backupData.cache || {}).length,
            size: stats.size,
            file: backup.file
          };
        } catch (error) {
          return null;
        }
      })
    );

    res.json({ 
      success: true,
      backups: backupInfo.filter(b => b !== null),
      maxBackups: MAX_BACKUPS
    });
  } catch (error) {
    console.error('List backups error:', error);
    res.status(500).json({ error: 'Failed to list backups', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(`🐱  CatStrands Cache Server v${pkg.version}`);
  console.log('='.repeat(60));
  console.log(`   Server running on port ${PORT}`);
  console.log(`   Cache file: ${CACHE_FILE}`);
  console.log(`   Puzzle cache: ${PUZZLE_CACHE_FILE}`);
  console.log('='.repeat(60) + '\n');
});

// Load puzzle cache from disk, then pre-fetch today's puzzle
await loadPuzzleCache();
await prefetchTodaysPuzzle();

// Schedule daily pre-fetch at midnight + 5 min so new puzzles are ready immediately
scheduleMidnightPrefetch();
