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

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Ensure data directory exists
const dataDir = path.dirname(CACHE_FILE);
await fs.mkdir(dataDir, { recursive: true }).catch(() => {});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

    await fs.writeFile(CACHE_FILE, JSON.stringify(backupData, null, 2), 'utf-8');
    
    console.log(`Cache backed up: ${Object.keys(cache).length} keys`);
    
    res.json({ 
      success: true, 
      message: 'Cache backed up successfully',
      keys: Object.keys(cache).length,
      timestamp: backupData.lastBackup
    });
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ error: 'Failed to backup cache', details: error.message });
  }
});

// Restore cache from filesystem
app.get('/api/cache/restore', async (req, res) => {
  try {
    // Check if backup file exists
    try {
      await fs.access(CACHE_FILE);
    } catch {
      return res.json({ 
        success: true, 
        cache: null, 
        message: 'No backup found' 
      });
    }

    const data = await fs.readFile(CACHE_FILE, 'utf-8');
    const backupData = JSON.parse(data);
    
    if (!backupData.cache || typeof backupData.cache !== 'object') {
      return res.status(400).json({ error: 'Invalid backup data' });
    }

    console.log(`Cache restored: ${Object.keys(backupData.cache).length} keys`);
    
    res.json({ 
      success: true, 
      cache: backupData.cache,
      lastBackup: backupData.lastBackup,
      keys: Object.keys(backupData.cache).length
    });
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ error: 'Failed to restore cache', details: error.message });
  }
});

// Get backup info (without returning all data)
app.get('/api/cache/info', async (req, res) => {
  try {
    try {
      await fs.access(CACHE_FILE);
    } catch {
      return res.json({ 
        exists: false,
        message: 'No backup found' 
      });
    }

    const data = await fs.readFile(CACHE_FILE, 'utf-8');
    const backupData = JSON.parse(data);
    
    res.json({ 
      exists: true,
      lastBackup: backupData.lastBackup,
      keys: Object.keys(backupData.cache || {}).length,
      version: backupData.version
    });
  } catch (error) {
    console.error('Info error:', error);
    res.status(500).json({ error: 'Failed to get backup info', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`CatStrands Cache Server v${pkg.version}`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Cache file: ${CACHE_FILE}`);
});
