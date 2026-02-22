// Utility for backing up and restoring cache to/from server filesystem

// In production (container), API is proxied through nginx at /api
// In development, API runs on localhost:3001
const API_BASE = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '' : 'http://localhost:3001');

/**
 * Backup cache to server filesystem
 * @param {Object} cache - Cache data from localStorage
 * @returns {Promise<Object>} Backup result
 */
export async function backupCacheToServer(cache) {
  try {
    const response = await fetch(`${API_BASE}/api/cache/backup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cache }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Backup failed');
    }

    const result = await response.json();
    console.log('✅ Cache backed up to server:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to backup cache to server:', error);
    throw error;
  }
}

/**
 * Restore cache from server filesystem
 * @returns {Promise<Object|null>} Restored cache data or null if no backup
 */
export async function restoreCacheFromServer() {
  try {
    const response = await fetch(`${API_BASE}/api/cache/restore`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Restore failed');
    }

    const result = await response.json();
    
    if (!result.cache) {
      console.log('ℹ️ No server backup found');
      return null;
    }

    console.log('✅ Cache restored from server:', result.keys, 'keys');
    return result.cache;
  } catch (error) {
    console.error('❌ Failed to restore cache from server:', error);
    throw error;
  }
}

/**
 * Get backup info without loading all data
 * @returns {Promise<Object>} Backup info
 */
export async function getBackupInfo() {
  try {
    const response = await fetch(`${API_BASE}/api/cache/info`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get backup info');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Failed to get backup info:', error);
    throw error;
  }
}

/**
 * Auto-backup all nyt-strands cache entries
 * @returns {Promise<Object>} Backup result
 */
export async function autoBackupCache() {
  const cache = {};
  
  // Collect all nyt-strands localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('nyt-strands-')) {
      cache[key] = localStorage.getItem(key);
    }
  }

  if (Object.keys(cache).length === 0) {
    console.log('ℹ️ No cache to backup');
    return { success: true, keys: 0 };
  }

  return backupCacheToServer(cache);
}

/**
 * Auto-restore cache to localStorage
 * @param {boolean} force - Force restore even if cache exists
 * @returns {Promise<Object>} Restore result
 */
export async function autoRestoreCache(force = false) {
  // Check if cache already exists in localStorage
  if (!force) {
    const hasCache = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
      .some(key => key && key.startsWith('nyt-strands-cache'));
    
    if (hasCache) {
      console.log('ℹ️ Cache already exists in localStorage, skipping restore');
      return { success: true, restored: 0, skipped: true };
    }
  }

  const cache = await restoreCacheFromServer();
  
  if (!cache) {
    return { success: true, restored: 0, message: 'No backup found' };
  }

  let restored = 0;
  
  // Restore all cache entries to localStorage
  Object.entries(cache).forEach(([key, value]) => {
    try {
      if (key.startsWith('nyt-strands-')) {
        localStorage.setItem(key, value);
        restored++;
      }
    } catch (error) {
      console.error(`Failed to restore key ${key}:`, error);
    }
  });

  console.log(`✅ Restored ${restored} cache entries to localStorage`);
  
  return { success: true, restored };
}
