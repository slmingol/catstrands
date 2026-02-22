import { useState, useMemo } from 'react';
import { getCachedPuzzle } from '../utils/fetchNYTPuzzle';
import './PuzzleArchiveModal.css';

// NYT Strands launched on March 4, 2024
const STRANDS_LAUNCH_DATE = new Date('2024-03-04');

// Modal for browsing and selectively downloading NYT Strands puzzles
// daysBack is dynamically calculated based on Strands launch date (March 4, 2024)
function PuzzleArchiveModal({ isOpen, onClose, onDownload, daysBack = 365 }) {
  const [selected, setSelected] = useState(new Set());
  const [filter, setFilter] = useState('all'); // 'all', 'cached', 'uncached'

  // Generate puzzle list (memoized to avoid recalculation)
  const puzzles = useMemo(() => {
    if (!isOpen) return [];
    
    const puzzleList = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight
    
    for (let i = 0; i < daysBack; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip dates before Strands launch
      if (date < STRANDS_LAUNCH_DATE) {
        continue;
      }
      
      const dateStr = date.toISOString().split('T')[0];
      const cached = getCachedPuzzle(dateStr);
      
      puzzleList.push({
        date: dateStr,
        displayDate: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        cached: !!cached,
        theme: cached?.theme || null
      });
    }
    return puzzleList;
  }, [isOpen, daysBack]);

  const handleSelectAll = () => {
    const filtered = getFilteredPuzzles();
    setSelected(new Set(filtered.map(p => p.date)));
  };

  const handleDeselectAll = () => {
    setSelected(new Set());
  };

  const handleSelectUncached = () => {
    const uncached = puzzles.filter(p => !p.cached);
    setSelected(new Set(uncached.map(p => p.date)));
  };

  const toggleSelect = (date) => {
    const newSet = new Set(selected);
    if (newSet.has(date)) {
      newSet.delete(date);
    } else {
      newSet.add(date);
    }
    setSelected(newSet);
  };

  const handleDownload = () => {
    const selectedDates = Array.from(selected).sort().reverse(); // Most recent first
    onDownload(selectedDates);
    setSelected(new Set());
  };

  const getFilteredPuzzles = () => {
    if (filter === 'cached') return puzzles.filter(p => p.cached);
    if (filter === 'uncached') return puzzles.filter(p => !p.cached);
    return puzzles;
  };

  const filteredPuzzles = getFilteredPuzzles();
  const cachedCount = puzzles.filter(p => p.cached).length;
  const uncachedCount = puzzles.length - cachedCount;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📰 NYT Strands Archive</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-stats">
          <div className="stat">
            <strong>{cachedCount}</strong> Cached
          </div>
          <div className="stat">
            <strong>{uncachedCount}</strong> Not Cached
          </div>
          <div className="stat">
            <strong>{selected.size}</strong> Selected
          </div>
        </div>

        <div className="modal-actions">
          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'active' : ''} 
              onClick={() => setFilter('all')}
            >
              All ({puzzles.length})
            </button>
            <button 
              className={filter === 'cached' ? 'active' : ''} 
              onClick={() => setFilter('cached')}
            >
              Cached ({cachedCount})
            </button>
            <button 
              className={filter === 'uncached' ? 'active' : ''} 
              onClick={() => setFilter('uncached')}
            >
              Not Cached ({uncachedCount})
            </button>
          </div>

          <div className="select-buttons">
            <button onClick={handleSelectAll}>Select All Visible</button>
            <button onClick={handleSelectUncached}>Select Uncached</button>
            <button onClick={handleDeselectAll}>Deselect All</button>
          </div>
        </div>

        <div className="puzzle-list">
          {filteredPuzzles.map(puzzle => (
            <div 
              key={puzzle.date} 
              className={`puzzle-item ${puzzle.cached ? 'cached' : ''} ${selected.has(puzzle.date) ? 'selected' : ''}`}
              onClick={() => toggleSelect(puzzle.date)}
            >
              <input 
                type="checkbox" 
                checked={selected.has(puzzle.date)}
                onChange={() => toggleSelect(puzzle.date)}
              />
              <div className="puzzle-info">
                <div className="puzzle-date">{puzzle.displayDate}</div>
                <div className="puzzle-theme">
                  {puzzle.theme ? `"${puzzle.theme}"` : puzzle.cached ? '(Theme available)' : '(Not downloaded)'}
                </div>
              </div>
              {puzzle.cached && <span className="cached-badge">✓ Cached</span>}
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
          <button 
            className="download-button" 
            onClick={handleDownload}
            disabled={selected.size === 0}
          >
            Download {selected.size} Puzzle{selected.size !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PuzzleArchiveModal;
