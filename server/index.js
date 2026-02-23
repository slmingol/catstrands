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

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Ensure data directory exists
const dataDir = path.dirname(CACHE_FILE);
await fs.mkdir(dataDir, { recursive: true }).catch(() => {});

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
  console.log('='.repeat(60) + '\n');
});
