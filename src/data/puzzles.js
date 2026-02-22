// Puzzle format:
// - grid: array of letters (row by row, 6 cols x 8 rows = 48 letters)
// - words: array of theme words to find (all words are placed as continuous adjacent paths)
// - spangram: the special word that describes the theme (typically wraps through grid)
// - theme: description of the puzzle theme
// - rows/cols: grid dimensions
// Note: Words should snake through adjacent cells (including diagonals)

const puzzles = [
  {
    rows: 8,
    cols: 6,
    theme: "Citrus Fruits",
    spangram: "ORANGES",
    grid: [
      'O', 'R', 'A', 'N', 'G', 'E',
      'S', 'L', 'I', 'M', 'E', 'M',
      'L', 'E', 'M', 'O', 'N', 'O',
      'G', 'R', 'A', 'P', 'E', 'F',
      'R', 'U', 'I', 'T', 'T', 'A',
      'N', 'G', 'E', 'L', 'O', 'N',
      'Y', 'U', 'Z', 'U', 'C', 'I',
      'T', 'R', 'O', 'N', 'P', 'O'
    ],
    words: ['LIME', 'LEMON', 'GRAPEFRUIT', 'TANGELON', 'YUZU', 'CITRON', 'POMELO']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Berries",
    spangram: "BERRIES",
    grid: [
      'B', 'E', 'R', 'R', 'I', 'E',
      'S', 'T', 'R', 'A', 'W', 'B',
      'E', 'R', 'R', 'Y', 'B', 'L',
      'U', 'E', 'B', 'E', 'R', 'R',
      'Y', 'R', 'A', 'S', 'P', 'B',
      'E', 'R', 'R', 'Y', 'B', 'L',
      'A', 'C', 'K', 'B', 'E', 'R',
      'R', 'Y', 'C', 'R', 'A', 'N'
    ],
    words: ['STRAWBERRY', 'BLUEBERRY', 'RASPBERRY', 'BLACKBERRY', 'CRANBERRY']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Hot Drinks",
    spangram: "COFFEE",
    grid: [
      'C', 'O', 'F', 'F', 'E', 'E',
      'T', 'E', 'A', 'L', 'A', 'T',
      'T', 'E', 'M', 'O', 'C', 'H',
      'A', 'H', 'O', 'T', 'C', 'H',
      'O', 'C', 'O', 'L', 'A', 'T',
      'E', 'C', 'I', 'D', 'E', 'R',
      'M', 'A', 'T', 'C', 'H', 'A',
      'E', 'S', 'P', 'R', 'E', 'S'
    ],
    words: ['TEA', 'LATTE', 'MOCHA', 'HOTCHOCOLATE', 'CIDER', 'MATCHA', 'ESPRESSO']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Farm Animals",
    spangram: "BARNYARD",
    grid: [
      'B', 'A', 'R', 'N', 'Y', 'A',
      'R', 'D', 'C', 'O', 'W', 'P',
      'I', 'G', 'H', 'E', 'N', 'S',
      'H', 'E', 'E', 'P', 'G', 'O',
      'A', 'T', 'H', 'O', 'R', 'S',
      'E', 'D', 'U', 'C', 'K', 'T',
      'U', 'R', 'K', 'E', 'Y', 'D',
      'O', 'N', 'K', 'E', 'Y', 'R'
    ],
    words: ['COW', 'PIG', 'HENS', 'SHEEP', 'GOAT', 'HORSE', 'DUCK', 'TURKEY', 'DONKEY', 'ROOSTER']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Seasons",
    spangram: "AUTUMN",
    grid: [
      'A', 'U', 'T', 'U', 'M', 'N',
      'S', 'P', 'R', 'I', 'N', 'G',
      'S', 'U', 'M', 'M', 'E', 'R',
      'W', 'I', 'N', 'T', 'E', 'R',
      'F', 'A', 'L', 'L', 'H', 'A',
      'R', 'V', 'E', 'S', 'T', 'M',
      'O', 'N', 'T', 'H', 'Y', 'E',
      'A', 'R', 'T', 'I', 'M', 'E'
    ],
    words: ['SPRING', 'SUMMER', 'WINTER', 'FALL', 'HARVEST', 'MONTH', 'YEAR', 'TIME']
  }
];

export default puzzles;
