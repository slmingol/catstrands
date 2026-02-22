import './SettingsModal.css';

function SettingsModal({ 
  isOpen, 
  onClose, 
  useNYT,
  setUseNYT,
  customPuzzle,
  openArchiveModal,
  caching,
  availableDays,
  cacheMetadata,
  handleClearCache,
  triggerFileInput,
  handleExportPuzzle,
  currentPuzzle,
  handleDownloadTemplate,
  handleExportCache,
  triggerCacheFileInput
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Settings</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-content">
          {/* Puzzle Source Section */}
          <div className="settings-section">
            <h3>Puzzle Source</h3>
            <button 
              onClick={() => { setUseNYT(!useNYT); onClose(); }}
              className="settings-button primary"
            >
              {useNYT ? '📰 Using NYT Puzzles' : (customPuzzle ? '📄 Using Custom' : '🏠 Using Local')}
              <span className="button-hint">Click to toggle</span>
            </button>
          </div>

          {/* Archive Management (only show when using NYT) */}
          {useNYT && (
            <div className="settings-section">
              <h3>Archive Management</h3>
              <button 
                onClick={() => { openArchiveModal(); onClose(); }}
                disabled={caching}
                className="settings-button success"
              >
                {caching ? '⏳ Downloading...' : `📚 Browse Archive (${availableDays} days)`}
                <span className="button-hint">Download puzzles from archive</span>
              </button>
              
              {cacheMetadata.puzzleCount > 0 && (
                <>
                  <button 
                    onClick={() => { handleExportCache(); onClose(); }}
                    className="settings-button info"
                  >
                    📤 Export Cache ({cacheMetadata.puzzleCount} puzzles)
                    <span className="button-hint">Save cache to transfer to another instance</span>
                  </button>
                  
                  <button 
                    onClick={() => { handleClearCache(); onClose(); }}
                    className="settings-button danger"
                  >
                    🗑️ Clear Cache
                    <span className="button-hint">Remove all cached puzzles</span>
                  </button>
                </>
              )}
              
              <button 
                onClick={() => { triggerCacheFileInput(); onClose(); }}
                className="settings-button info"
              >
                📥 Import Cache
                <span className="button-hint">Load cache from exported file</span>
              </button>
            </div>
          )}

          {/* File Operations Section */}
          <div className="settings-section">
            <h3>Custom Puzzles</h3>
            <button 
              onClick={() => { triggerFileInput(); onClose(); }}
              className="settings-button info"
            >
              📂 Import Puzzle
              <span className="button-hint">Load custom puzzle from JSON file</span>
            </button>
            
            <button 
              onClick={() => { handleExportPuzzle(); onClose(); }}
              disabled={!currentPuzzle}
              className="settings-button warning"
            >
              💾 Export Current Puzzle
              <span className="button-hint">Save current puzzle as JSON file</span>
            </button>
            
            <button 
              onClick={() => { handleDownloadTemplate(); onClose(); }}
              className="settings-button secondary"
            >
              📝 Download Template
              <span className="button-hint">Get a template to create your own puzzle</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
