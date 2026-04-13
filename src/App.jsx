import { useState, useEffect, useRef } from 'react';
import './App.css';
import StrandsGame from './components/StrandsGame';
import StatsModal from './components/StatsModal';
import SettingsModal from './components/SettingsModal';
import PuzzleArchiveModal from './components/PuzzleArchiveModal';
import puzzles from './data/puzzles';
import packageJson from '../package.json';
import { 
  fetchPuzzleWithCache, 
  fetchAndCacheRecentPuzzles, 
  getCacheMetadata,
  getCachedPuzzle,
  clearCache,
  fetchNYTPuzzle,
  cachePuzzle,
  exportCache,
  importCache
} from './utils/fetchNYTPuzzle';
import { 
  importPuzzle, 
  exportPuzzle, 
  downloadTemplate 
} from './utils/puzzleImportExport';
import { 
  autoBackupCache, 
  autoRestoreCache 
} from './utils/cacheBackup';

// NYT Strands launched on March 4, 2024
const STRANDS_LAUNCH_DATE = new Date('2024-03-04');

// Calculate days since Strands launch (inclusive of launch day and today)
const getDaysSinceLaunch = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  
  // Use Date constructor with year, month (0-indexed), day to avoid timezone issues
  const launch = new Date(2024, 2, 4); // March 4, 2024 (month is 0-indexed)
  launch.setHours(0, 0, 0, 0); // Start of launch day
  
  const diffTime = today - launch;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Return days + 1 to include both launch day and today (721 as of Feb 22, 2026)
  return Math.max(1, diffDays + 1);
};

function App() {
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [currentPuzzleDate, setCurrentPuzzleDate] = useState(null); // Track current puzzle date
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useNYT, setUseNYT] = useState(true);
  const [caching, setCaching] = useState(false);
  const [cacheProgress, setCacheProgress] = useState({ current: 0, total: 0, date: '', status: '' });
  const [cacheMetadata, setCacheMetadata] = useState({ puzzleCount: 0, lastUpdated: null });
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [availableDays, setAvailableDays] = useState(getDaysSinceLaunch());
  const [customPuzzle, setCustomPuzzle] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const fileInputRef = useRef(null);
  const cacheFileInputRef = useRef(null);

  // Update available days on mount and daily
  useEffect(() => {
    setAvailableDays(getDaysSinceLaunch());
    
    // Update once per day
    const interval = setInterval(() => {
      setAvailableDays(getDaysSinceLaunch());
    }, 1000 * 60 * 60 * 24); // Every 24 hours
    
    return () => clearInterval(interval);
  }, []);

  // Auto-fetch recent puzzles (last 7 days) once per day - RUNS IN BACKGROUND
  useEffect(() => {
    const autoFetchRecentPuzzles = async () => {
      const LAST_AUTO_FETCH_KEY = 'nyt-strands-last-auto-fetch';
      const lastFetch = localStorage.getItem(LAST_AUTO_FETCH_KEY);
      const today = new Date().toISOString().split('T')[0];
      
      // Skip if already fetched today
      if (lastFetch === today) {
        console.log('✅ Auto-fetch already ran today, skipping');
        return;
      }
      
      console.log('🔄 Auto-checking for new puzzles (background)...');
      
      // Fetch last 7 days of puzzles
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Skip if before launch date
        if (date < STRANDS_LAUNCH_DATE) break;
        
        const dateStr = date.toISOString().split('T')[0];
        dates.push(dateStr);
      }
      
      // First, quickly check which puzzles are missing from cache
      const missingDates = dates.filter(dateStr => !getCachedPuzzle(dateStr));
      
      if (missingDates.length === 0) {
        console.log('✅ All recent puzzles already cached');
        localStorage.setItem(LAST_AUTO_FETCH_KEY, today);
        return;
      }
      
      console.log(`📥 Fetching ${missingDates.length} missing puzzle(s)...`);
      
      let newPuzzles = 0;
      for (const dateStr of missingDates) {
        try {
          // Fetch and cache the missing puzzle
          const puzzle = await fetchPuzzleWithCache(dateStr, true);
          if (puzzle) {
            newPuzzles++;
            console.log(`✅ Fetched ${dateStr}`);
          }
          // Small delay to be nice to the API
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          // Silently fail - user can manually fetch if needed
          console.log(`⏭️  Skipped ${dateStr}:`, error.message);
        }
      }
      
      if (newPuzzles > 0) {
        console.log(`✅ Auto-fetched ${newPuzzles} new puzzle(s)`);
        updateCacheMetadata();
        
        // Auto-backup to server after fetching new puzzles
        try {
          await autoBackupCache();
          console.log('💾 Cache backed up to server');
        } catch (error) {
          console.error('Failed to backup cache:', error);
        }
      }
      
      // Mark today as checked
      localStorage.setItem(LAST_AUTO_FETCH_KEY, today);
    };
    
    // Delay auto-fetch to run AFTER initial puzzle loads (non-blocking)
    const timeoutId = setTimeout(() => {
      autoFetchRecentPuzzles();
    }, 1000); // Wait 1 second after mount
    
    const interval = setInterval(autoFetchRecentPuzzles, 1000 * 60 * 60 * 24); // Every 24 hours
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, []);

  // Update cache metadata
  const updateCacheMetadata = () => {
    const meta = getCacheMetadata();
    setCacheMetadata(meta);
  };

  // Auto-restore cache from server on mount - RUNS IN BACKGROUND
  useEffect(() => {
    const restoreCache = async () => {
      try {
        const result = await autoRestoreCache();
        if (result.restored > 0) {
          console.log(`🔄 Restored ${result.restored} cache entries from server backup`);
          updateCacheMetadata();
        }
      } catch (error) {
        console.error('Failed to auto-restore cache:', error);
        // Non-fatal - continue with app
      }
    };
    
    // Delay restore to run AFTER initial puzzle loads (non-blocking)
    const timeoutId = setTimeout(() => {
      restoreCache();
    }, 500); // Wait 500ms after mount
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Get puzzle based on current date from local puzzles
  const getLocalPuzzle = () => {
    const today = new Date();
    const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
    const puzzleIndex = daysSinceEpoch % puzzles.length;
    return puzzles[puzzleIndex];
  };

  // Load puzzle by date
  const loadPuzzleByDate = async (dateStr) => {
    setLoading(true);
    setError(null);

    try {
      const nytPuzzle = await fetchPuzzleWithCache(dateStr, true);
      setCurrentPuzzle(nytPuzzle);
      setCurrentPuzzleDate(dateStr);
      setCustomPuzzle(null);
    } catch (err) {
      console.error('Failed to fetch puzzle for date:', dateStr, err);
      setError(`Could not load puzzle for ${dateStr}. Try downloading it from the archive first.`);
    }

    setLoading(false);
  };

  // Navigate to previous day's puzzle
  const goToPreviousPuzzle = async () => {
    if (!currentPuzzleDate) return;
    
    // Parse date parts to avoid timezone issues
    const [year, month, day] = currentPuzzleDate.split('-').map(Number);
    const currentDate = new Date(year, month - 1, day);
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    
    // Don't go before launch date
    if (prevDate < STRANDS_LAUNCH_DATE) {
      setError('No puzzles available before March 4, 2024');
      return;
    }
    
    const prevDateStr = prevDate.toISOString().split('T')[0];
    await loadPuzzleByDate(prevDateStr);
  };

  // Navigate to next day's puzzle
  const goToNextPuzzle = async () => {
    if (!currentPuzzleDate) return;
    
    // Parse date parts to avoid timezone issues
    const [year, month, day] = currentPuzzleDate.split('-').map(Number);
    const currentDate = new Date(year, month - 1, day);
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Don't go beyond today
    if (nextDate > today) {
      setError('No future puzzles available');
      return;
    }
    
    const nextDateStr = nextDate.toISOString().split('T')[0];
    await loadPuzzleByDate(nextDateStr);
  };

  // Go to today's puzzle
  const goToToday = async () => {
    const today = new Date().toISOString().split('T')[0];
    await loadPuzzleByDate(today);
  };

  // Check if we're viewing today's puzzle
  const isViewingToday = () => {
    if (!currentPuzzleDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return currentPuzzleDate === today;
  };

  // Load puzzle on mount
  useEffect(() => {
    const loadPuzzle = async () => {
      setLoading(true);
      setError(null);

      if (useNYT) {
        try {
          const today = new Date().toISOString().split('T')[0];
          const nytPuzzle = await fetchPuzzleWithCache(today, true);
          setCurrentPuzzle(nytPuzzle);
          setCurrentPuzzleDate(today);
        } catch (err) {
          console.error('Failed to fetch NYT puzzle, using local:', err);
          setError('Could not fetch today\'s NYT puzzle, using local puzzle instead');
          setCurrentPuzzle(getLocalPuzzle());
          setCurrentPuzzleDate(null);
        }
      } else {
        setCurrentPuzzle(getLocalPuzzle());
        setCurrentPuzzleDate(null);
      }

      setLoading(false);
      updateCacheMetadata();
    };

    loadPuzzle();
  }, [useNYT]);

  // Open archive modal
  const openArchiveModal = () => {
    setShowArchiveModal(true);
  };

  // Download specific puzzle dates
  const downloadSelectedPuzzles = async (selectedDates) => {
    if (caching || selectedDates.length === 0) return;
    
    setShowArchiveModal(false);
    setCaching(true);
    setCacheProgress({ current: 0, total: selectedDates.length, date: '', status: '' });
    
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < selectedDates.length; i++) {
      const dateStr = selectedDates[i];
      
      setCacheProgress({ 
        current: i + 1, 
        total: selectedDates.length, 
        date: dateStr, 
        status: 'fetching' 
      });

      try {
        const puzzle = await fetchNYTPuzzle(dateStr);
        cachePuzzle(dateStr, puzzle);
        results.successful++;
        
        // Delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        results.failed++;
        results.errors.push({ date: dateStr, error: error.message });
        console.error(`Failed to fetch puzzle for ${dateStr}:`, error.message);
        
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

    let message = `Download complete!\n✅ Success: ${results.successful}\n❌ Failed: ${results.failed}`;
    
    if (results.failed > 0) {
      message += `\n\nSome puzzles failed. You can try again from the archive.`;
    }
    
    alert(message);
    updateCacheMetadata();
    
    // Auto-backup to server after downloading
    if (results.successful > 0) {
      try {
        await autoBackupCache();
        console.log('💾 Cache backed up to server');
      } catch (error) {
        console.error('Failed to backup cache:', error);
      }
    }
    
    setCaching(false);
    setCacheProgress({ current: 0, total: 0, date: '', status: '' });
  };

  // Download all available puzzles (full archive since launch)
  const downloadPuzzles = async () => {
    if (caching) return;
    
    const days = availableDays;
    setCaching(true);
    setCacheProgress({ current: 0, total: days, date: '', status: '' });
    
    try {
      const results = await fetchAndCacheRecentPuzzles(days, (current, total, date, status) => {
        setCacheProgress({ current, total, date, status });
      });
      
      let message = `Cache complete!\n✅ New: ${results.successful}\n⏭️  Skipped: ${results.skipped}\n❌ Failed: ${results.failed}`;
      
      if (results.failed > 0) {
        message += `\n\nSome puzzles failed. You can try again from the archive.`;
      }
      
      alert(message);
      updateCacheMetadata();
      
      // Auto-backup to server after downloading
      if (results.successful > 0) {
        try {
          await autoBackupCache();
          console.log('💾 Cache backed up to server');
        } catch (error) {
          console.error('Failed to backup cache:', error);
        }
      }
    } catch (err) {
      console.error('Error caching puzzles:', err);
      alert('Error downloading puzzles. Check console for details.');
    } finally {
      setCaching(false);
      setCacheProgress({ current: 0, total: 0, date: '', status: '' });
    }
  };

  // Clear cache
  const handleClearCache = () => {
    if (confirm('Clear all cached puzzles?')) {
      clearCache();
      updateCacheMetadata();
      alert('Cache cleared!');
    }
  };

  // Handle file import
  const handleImportPuzzle = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const puzzle = await importPuzzle(file);
      setCustomPuzzle(puzzle);
      setCurrentPuzzle(puzzle);
      setUseNYT(false);
      setError(null);
      alert(`✅ Puzzle imported successfully!\nTheme: ${puzzle.theme}\nWords: ${puzzle.words.length}`);
    } catch (err) {
      console.error('Import error:', err);
      alert(`❌ Import failed:\n${err.message}`);
    }

    // Reset file input
    event.target.value = '';
  };

  // Handle export current puzzle
  const handleExportPuzzle = () => {
    if (!currentPuzzle) {
      alert('No puzzle to export!');
      return;
    }

    try {
      exportPuzzle(currentPuzzle);
      alert('✅ Puzzle exported successfully!');
    } catch (err) {
      console.error('Export error:', err);
      alert(`❌ Export failed:\n${err.message}`);
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Download template
  const handleDownloadTemplate = () => {
    try {
      downloadTemplate();
      alert('✅ Template downloaded! Edit the JSON file with your puzzle data.');
    } catch (err) {
      console.error('Template download error:', err);
      alert(`❌ Download failed:\n${err.message}`);
    }
  };

  // Export cache
  const handleExportCache = () => {
    try {
      const filename = exportCache();
      alert(`✅ Cache exported successfully!\nFile: ${filename}`);
    } catch (err) {
      console.error('Cache export error:', err);
      alert(`❌ Export failed:\n${err.message}`);
    }
  };

  // Import cache
  const handleImportCache = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const results = await importCache(file);
      updateCacheMetadata();
      
      const totalPuzzles = results.puzzlesAdded + results.puzzlesUpdated;
      let message = `✅ Cache imported successfully!\n\n`;
      
      if (results.puzzlesAdded > 0) {
        message += `New puzzles: ${results.puzzlesAdded}\n`;
      }
      if (results.puzzlesUpdated > 0) {
        message += `Updated puzzles: ${results.puzzlesUpdated}\n`;
      }
      if (totalPuzzles === 0) {
        message += `All puzzles already up to date\n`;
      }
      if (results.errors.length > 0) {
        message += `\nErrors: ${results.errors.length}\n`;
      }
      
      alert(message);
      
      // Reload current puzzle if using NYT
      if (useNYT) {
        const today = new Date().toISOString().split('T')[0];
        const puzzle = await fetchPuzzleWithCache(today);
        setCurrentPuzzle(puzzle);
      }
    } catch (err) {
      console.error('Cache import error:', err);
      alert(`❌ Import failed:\n${err.message}`);
    }

    // Reset file input
    event.target.value = '';
  };

  // Trigger cache file input
  const triggerCacheFileInput = () => {
    cacheFileInputRef.current?.click();
  };

  // Format the date for display
  const getDisplayDate = () => {
    if (currentPuzzleDate) {
      // Parse date parts to avoid timezone issues
      const [year, month, day] = currentPuzzleDate.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month is 0-indexed
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    }
    // Fallback to today for local puzzles
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('en-US', options);
  };

  // Check if we can navigate to previous/next puzzles
  const canGoPrevious = () => {
    if (!currentPuzzleDate || !useNYT) return false;
    // Parse date parts to avoid timezone issues
    const [year, month, day] = currentPuzzleDate.split('-').map(Number);
    const currentDate = new Date(year, month - 1, day);
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    return prevDate >= STRANDS_LAUNCH_DATE;
  };

  const canGoNext = () => {
    if (!currentPuzzleDate || !useNYT) return false;
    // Parse date parts to avoid timezone issues
    const [year, month, day] = currentPuzzleDate.split('-').map(Number);
    const currentDate = new Date(year, month - 1, day);
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return nextDate <= today;
  };

  // Format today's date
  const getTodaysDate = () => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🐱 CatStrands</h1>
        </header>
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem' }}>
          Loading puzzle...
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <StatsModal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)} />
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)}
        useNYT={useNYT}
        setUseNYT={setUseNYT}
        customPuzzle={customPuzzle}
        openArchiveModal={openArchiveModal}
        caching={caching}
        availableDays={availableDays}
        cacheMetadata={cacheMetadata}
        handleClearCache={handleClearCache}
        triggerFileInput={triggerFileInput}
        handleExportPuzzle={handleExportPuzzle}
        currentPuzzle={currentPuzzle}
        handleDownloadTemplate={handleDownloadTemplate}
        handleExportCache={handleExportCache}
        triggerCacheFileInput={triggerCacheFileInput}
      />

      <header className="app-header">
        <h1>🐱 CatStrands</h1>
        
        {/* Hidden file input for puzzle import */}
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".json" 
          onChange={handleImportPuzzle}
          style={{ display: 'none' }}
        />
        
        {/* Hidden file input for cache import */}
        <input 
          ref={cacheFileInputRef}
          type="file" 
          accept=".json" 
          onChange={handleImportCache}
          style={{ display: 'none' }}
        />
      </header>

      <div className="date-stats-row">
        {useNYT && currentPuzzleDate && (
          <button 
            className="nav-button nav-prev"
            onClick={goToPreviousPuzzle}
            disabled={!canGoPrevious()}
            title="Previous puzzle"
          >
            ◀
          </button>
        )}
        <div className="date-display">
          {getDisplayDate()}
        </div>
        {useNYT && currentPuzzleDate && (
          <button 
            className="nav-button nav-next"
            onClick={goToNextPuzzle}
            disabled={!canGoNext()}
            title="Next puzzle"
          >
            ▶
          </button>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          {useNYT && currentPuzzleDate && !isViewingToday() && (
            <button 
              className="stats-button today-button"
              onClick={goToToday}
              title="Go to today's puzzle"
            >
              📅
            </button>
          )}
          <button 
            className="stats-button"
            onClick={() => setShowStatsModal(true)}
            title="View Statistics"
          >
            📊
          </button>
          <button 
            className="stats-button"
            onClick={() => setShowSettingsModal(true)}
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      {(caching || (useNYT && cacheMetadata?.puzzleCount > 0)) && (
        <div className="cache-info-bar">
          <div className="cache-info-left">
            {useNYT && cacheMetadata?.puzzleCount > 0 && (
              <>
                💾 {cacheMetadata.puzzleCount} puzzles cached
                {cacheMetadata.lastUpdated && (
                  <> • Last updated: {new Date(cacheMetadata.lastUpdated).toLocaleDateString()}</>
                )}
              </>
            )}
            {caching && (
              <>
                {useNYT && cacheMetadata?.puzzleCount > 0 && <> • </>}
                ⬇️ Downloading {cacheProgress.current}/{cacheProgress.total}: {cacheProgress.date}
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <div style={{ 
          textAlign: 'center', 
          padding: '10px', 
          background: '#fff3cd', 
          color: '#856404',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {currentPuzzle && (
        <StrandsGame puzzle={currentPuzzle} puzzleDate={currentPuzzleDate} />
      )}

      <PuzzleArchiveModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        onDownload={downloadSelectedPuzzles}
        onPlayPuzzle={loadPuzzleByDate}
        daysBack={availableDays}
      />

      <div className="version-display">
        v{packageJson.version}
      </div>
    </div>
  );
}

export default App;
