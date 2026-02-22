// Stats Manager for Strands Clone
// Handles saving and retrieving game statistics from localStorage

const STATS_KEY = 'strands-stats';
const GAME_HISTORY_KEY = 'strands-game-history';

// Get today's date as a string (YYYY-MM-DD)
export const getTodayKey = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Initialize default stats structure
const getDefaultStats = () => ({
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastPlayedDate: null,
});

// Get stats from localStorage
export const getStats = () => {
  try {
    const stats = localStorage.getItem(STATS_KEY);
    return stats ? JSON.parse(stats) : getDefaultStats();
  } catch (error) {
    console.error('Error reading stats:', error);
    return getDefaultStats();
  }
};

// Save stats to localStorage
export const saveStats = (stats) => {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
};

// Get game history from localStorage
export const getGameHistory = () => {
  try {
    const history = localStorage.getItem(GAME_HISTORY_KEY);
    return history ? JSON.parse(history) : {};
  } catch (error) {
    console.error('Error reading game history:', error);
    return {};
  }
};

// Save game history to localStorage
export const saveGameHistory = (history) => {
  try {
    localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving game history:', error);
  }
};

// Check if user has already played today
export const hasPlayedToday = () => {
  const history = getGameHistory();
  const today = getTodayKey();
  return today in history;
};

// Get today's game data (if exists)
export const getTodaysGame = () => {
  const history = getGameHistory();
  const today = getTodayKey();
  return history[today] || null;
};

// Calculate if dates are consecutive
const areConsecutiveDays = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

// Record a completed game
export const recordGameCompletion = (hintsUsed, wordsFound, totalWords) => {
  const today = getTodayKey();
  const stats = getStats();
  const history = getGameHistory();
  
  // Check if already played today
  if (today in history) {
    // Update existing entry if they used fewer hints or completed it
    const existing = history[today];
    if (!existing.completed || hintsUsed < existing.hintsUsed) {
      history[today] = {
        completed: true,
        hintsUsed,
        wordsFound,
        totalWords,
        timestamp: new Date().toISOString(),
      };
      saveGameHistory(history);
    }
    return stats; // Don't update stats if already recorded today
  }
  
  // Record new game
  history[today] = {
    completed: true,
    hintsUsed,
    wordsFound,
    totalWords,
    timestamp: new Date().toISOString(),
  };
  
  // Update stats
  stats.gamesPlayed++;
  stats.gamesWon++;
  
  // Update streaks
  if (stats.lastPlayedDate) {
    if (areConsecutiveDays(stats.lastPlayedDate, today)) {
      stats.currentStreak++;
    } else if (stats.lastPlayedDate !== today) {
      stats.currentStreak = 1;
    }
  } else {
    stats.currentStreak = 1;
  }
  
  stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  stats.lastPlayedDate = today;
  
  saveStats(stats);
  saveGameHistory(history);
  
  return stats;
};

// Record that the game was started (for tracking games played even if not completed)
export const recordGameStart = () => {
  const today = getTodayKey();
  const history = getGameHistory();
  
  if (!(today in history)) {
    history[today] = {
      completed: false,
      hintsUsed: 0,
      wordsFound: 0,
      totalWords: 0,
      timestamp: new Date().toISOString(),
    };
    saveGameHistory(history);
  }
};

// Reset all stats (for testing or user preference)
export const resetStats = () => {
  localStorage.removeItem(STATS_KEY);
  localStorage.removeItem(GAME_HISTORY_KEY);
  return getDefaultStats();
};

// Get stats for display
export const getStatsForDisplay = () => {
  const stats = getStats();
  const history = getGameHistory();
  const todayKey = getTodayKey();
  
  // Calculate average hints used
  const completedGames = Object.values(history).filter(game => game.completed);
  const totalHints = completedGames.reduce((sum, game) => sum + game.hintsUsed, 0);
  const avgHints = completedGames.length > 0 ? (totalHints / completedGames.length).toFixed(1) : 0;
  
  // Get distribution of hints used
  const hintDistribution = [0, 0, 0, 0, 0]; // 0, 1, 2, 3, 4+ hints
  completedGames.forEach(game => {
    const index = Math.min(game.hintsUsed, 4);
    hintDistribution[index]++;
  });
  
  return {
    ...stats,
    winPercentage: stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0,
    avgHints,
    hintDistribution,
    hasPlayedToday: todayKey in history,
    todaysGame: history[todayKey] || null,
  };
};
