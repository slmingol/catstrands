import { getStatsForDisplay, resetStats } from '../utils/statsManager';
import './StatsModal.css';

function StatsModal({ isOpen, onClose }) {
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
      resetStats();
      // Force re-render by closing and reopening (or use a state update)
      onClose();
      setTimeout(() => window.location.reload(), 100);
    }
  };

  if (!isOpen) return null;

  const stats = getStatsForDisplay();

  const maxHintCount = Math.max(...stats.hintDistribution, 1); // Avoid division by zero

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Statistics</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.gamesPlayed}</div>
            <div className="stat-label">Played</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.winPercentage}%</div>
            <div className="stat-label">Win %</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.currentStreak}</div>
            <div className="stat-label">Current Streak</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.maxStreak}</div>
            <div className="stat-label">Max Streak</div>
          </div>
        </div>

        <div className="hint-distribution">
          <h3>Hint Distribution</h3>
          <div className="distribution-bars">
            {stats.hintDistribution.map((count, index) => {
              const percentage = maxHintCount > 0 ? (count / maxHintCount) * 100 : 0;
              const label = index === 4 ? '4+' : index.toString();
              return (
                <div key={index} className="distribution-row">
                  <div className="hint-label">{label}</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${percentage}%` }}
                    >
                      {count > 0 && <span className="bar-count">{count}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {stats.avgHints > 0 && (
            <div className="avg-hints">
              Average hints used: <strong>{stats.avgHints}</strong>
            </div>
          )}
        </div>

        {stats.hasPlayedToday && stats.todaysGame && stats.todaysGame.completed && (
          <div className="todays-result">
            <h3>Today's Result</h3>
            <p>
              ✅ Completed with {stats.todaysGame.hintsUsed} hint{stats.todaysGame.hintsUsed !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        <div className="modal-footer">
          <button className="reset-button" onClick={handleReset}>
            Reset Statistics
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatsModal;
