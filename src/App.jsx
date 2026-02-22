import { useState, useEffect, useRef } from 'react';
import './App.css';
import StrandsGame from './components/StrandsGame';
import StatsModal from './components/StatsModal';
import SettingsModal from './components/SettingsModal';
import PuzzleArchiveModal from './components/PuzzleArchiveModal';
import puzzles from './data/puzzles';
import { 
  fetchPuzzleWithCache, 
  fetchAndCacheRecentPuzzles, 
  getCacheMetadata,
  clearCache,
  fetchNYTPuzzle,
  cachePuzzle
} from './utils/fetchNYTPuzzle';
import { 
  importPuzzle, 
  exportPuzzle, 
  downloadTemplate 
} from './utils/puzzleImportExport';

// NYT Strands launched on March 4, 2024
const STRANDS_LAUNCH_DATE = new Date('2024-03-04');

// Calculate days since Strands launch
const getDaysSinceLaunch = () => {
  const today = new Date();
  const diffTime = today - STRANDS_LAUNCH_DATE;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays); // At least 1 day
};

function App() {
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
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

  // Update available days on mount and daily
  useEffect(() => {
    setAvailableDays(getDaysSinceLaunch());
    
    // Update once per day
    const interval = setInterval(() => {
      setAvailableDays(getDaysSinceLaunch());
    }, 1000 * 60 * 60 * 24); // Every 24 hours
    
    return () => clearInterval(interval);
  }, []);

  // Auto-fetch recent puzzles (last 7 days) once per day
  useEffect(() => {
    const autoFetchRecentPuzzles = async () => {
      const LAST_AUTO_FETCH_KEY = 'nyt-strands-last-auto-fetch';
      const lastFetch = localStorage.getItem(LAST_AUTO_FETCH_KEY);
      const today = new Date().toISOString().split('T')[0];
      
      // Skip if already fetched today
      if (lastFetch === today) {
        return;
      }
      
      console.log('🔄 Auto-checking for new puzzles...');
      
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
      
      let newPuzzles = 0;
      for (const dateStr of dates) {
        try {
          // fetchPuzzleWithCache will check cache first
          const puzzle = await fetchPuzzleWithCache(dateStr, true);
          if (puzzle) {
            newPuzzles++;
          }
          // Small delay to be nice to the API
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          // Silently fail - user can manually fetch if needed
          console.log(`Skipped ${dateStr}:`, error.message);
        }
      }
      
      if (newPuzzles > 0) {
        console.log(`✅ Auto-fetched ${newPuzzles} new puzzle(s)`);
        updateCacheMetadata();
      }
      
      // Mark today as checked
      localStorage.setItem(LAST_AUTO_FETCH_KEY, today);
    };
    
    // Run on mount and once per day
    autoFetchRecentPuzzles();
    
    const interval = setInterval(autoFetchRecentPuzzles, 1000 * 60 * 60 * 24); // Every 24 hours
    
    return () => clearInterval(interval);
  }, []);

  // Update cache metadata
  const updateCacheMetadata = () => {
    const meta = getCacheMetadata();
    setCacheMetadata(meta);
  };

  // Get puzzle based on current date from local puzzles
  const getLocalPuzzle = () => {
    const today = new Date();
    const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
    const puzzleIndex = daysSinceEpoch % puzzles.length;
    return puzzles[puzzleIndex];
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
        } catch (err) {
          console.error('Failed to fetch NYT puzzle, using local:', err);
          setError('Could not fetch today\'s NYT puzzle, using local puzzle instead');
          setCurrentPuzzle(getLocalPuzzle());
        }
      } else {
        setCurrentPuzzle(getLocalPuzzle());
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
      />

      <header className="app-header">
        <h1>🐱 CatStrands</h1>
        
        {/* Hidden file input */}
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".json" 
          onChange={handleImportPuzzle}
          style={{ display: 'none' }}
        />
      </header>

      <div className="date-stats-row">
        <div className="date-display">
          {getTodaysDate()}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
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
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '95vw',
          marginLeft: 'calc(-47.5vw + 50%)',
          marginRight: 'calc(-47.5vw + 50%)',
          marginBottom: '0',
          padding: '0',
          background: 'transparent',
          fontSize: '0.9rem',
          fontWeight: '500',
          boxSizing: 'border-box'
        }}>
          {/* Left: Cached info */}
          <div style={{ 
            flex: '1',
            padding: '10px 2.5vw',
            background: '#e8f5e9',
            color: '#2e7d32'
          }}>
            {useNYT && cacheMetadata?.puzzleCount > 0 && (
              <>
                💾 {cacheMetadata.puzzleCount} puzzles cached
                {cacheMetadata.lastUpdated && (
                  <> • Last updated: {new Date(cacheMetadata.lastUpdated).toLocaleDateString()}</>
                )}
              </>
            )}
          </div>
          
          {/* Right: Downloading info */}
          <div style={{ 
            flex: '1',
            padding: '10px 2.5vw',
            background: '#e3f2fd',
            color: '#1976d2',
            textAlign: 'right'
          }}>
            {caching && (
              <>
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
        <StrandsGame puzzle={currentPuzzle} />
      )}

      <PuzzleArchiveModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        onDownload={downloadSelectedPuzzles}
        daysBack={availableDays}
      />
    </div>
  );
}

export default App;
