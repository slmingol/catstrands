// Quick script to check NYT Strands API date range
// Run in browser console on localhost to use localStorage

console.log('Checking cached puzzles...');

try {
  const cache = JSON.parse(localStorage.getItem('nyt-strands-cache') || '{}');
  const dates = Object.keys(cache).sort();
  
  if (dates.length === 0) {
    console.log('No cached puzzles found.');
    console.log('\nBased on public information:');
    console.log('- NYT Strands launched: March 4, 2024');
    console.log('- As of Feb 22, 2026, approximately ~355 days of puzzles exist');
  } else {
    console.log(`\nFound ${dates.length} cached puzzles:`);
    console.log('Oldest:', dates[0]);
    console.log('Newest:', dates[dates.length - 1]);
    
    // Calculate days between
    const oldest = new Date(dates[0]);
    const newest = new Date(dates[dates.length - 1]);
    const daysDiff = Math.floor((newest - oldest) / (1000 * 60 * 60 * 24));
    
    console.log(`\nDate range: ${daysDiff} days`);
    console.log(`Coverage: ${dates.length} out of ${daysDiff + 1} possible days`);
    
    // Show sample dates
    console.log('\nSample cached dates:');
    dates.slice(0, 5).forEach(d => console.log(' -', d, cache[d].theme));
  }
} catch (error) {
  console.error('Error:', error);
}

// To run this in the browser console:
// 1. Open http://localhost:5173
// 2. Open DevTools Console (F12)
// 3. Paste the contents of localStorage.getItem('nyt-strands-cache')
// 4. Count the entries
