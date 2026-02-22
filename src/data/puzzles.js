// Puzzle format:
// - grid: array of letters (row by row)
// - words: array of theme words to find
// - spangram: the special word that describes the theme
// - theme: description of the puzzle theme
// - rows/cols: grid dimensions

const puzzles = [
  {
    rows: 6,
    cols: 8,
    theme: "Types of Fruit",
    spangram: "TROPICAL",
    grid: [
      'T', 'R', 'O', 'P', 'I', 'C', 'A', 'L',
      'M', 'A', 'N', 'G', 'O', 'E', 'P', 'E',
      'P', 'A', 'P', 'A', 'Y', 'A', 'P', 'A',
      'B', 'A', 'N', 'A', 'N', 'A', 'L', 'C',
      'G', 'U', 'A', 'V', 'A', 'O', 'E', 'H',
      'K', 'I', 'W', 'I', 'D', 'A', 'T', 'E'
    ],
    words: ['MANGO', 'PAPAYA', 'BANANA', 'GUAVA', 'KIWI', 'DATE', 'PEACH']
  },
  {
    rows: 6,
    cols: 8,
    theme: "Ocean Life",
    spangram: "SEALIFE",
    grid: [
      'W', 'H', 'A', 'L', 'E', 'S', 'Q', 'U',
      'S', 'E', 'A', 'L', 'I', 'F', 'E', 'I',
      'H', 'A', 'R', 'K', 'D', 'O', 'L', 'P',
      'S', 'T', 'A', 'R', 'F', 'I', 'S', 'H',
      'C', 'R', 'A', 'B', 'O', 'R', 'A', 'Y',
      'J', 'E', 'L', 'L', 'Y', 'F', 'I', 'S'
    ],
    words: ['WHALE', 'SHARK', 'CRAB', 'STARFISH', 'JELLYFISH', 'RAY']
  },
  {
    rows: 7,
    cols: 8,
    theme: "Musical Instruments",
    spangram: "ORCHESTRA",
    grid: [
      'O', 'R', 'C', 'H', 'E', 'S', 'T', 'R',
      'V', 'I', 'O', 'L', 'I', 'N', 'A', 'P',
      'P', 'I', 'A', 'N', 'O', 'B', 'O', 'E',
      'F', 'L', 'U', 'T', 'E', 'C', 'L', 'A',
      'D', 'R', 'U', 'M', 'S', 'E', 'L', 'R',
      'T', 'R', 'U', 'M', 'P', 'E', 'T', 'I',
      'H', 'A', 'R', 'P', 'S', 'A', 'X', 'O'
    ],
    words: ['VIOLIN', 'PIANO', 'FLUTE', 'DRUMS', 'TRUMPET', 'HARP', 'OBOE']
  },
  {
    rows: 6,
    cols: 8,
    theme: "Weather Phenomena",
    spangram: "FORECAST",
    grid: [
      'F', 'O', 'R', 'E', 'C', 'A', 'S', 'T',
      'R', 'A', 'I', 'N', 'S', 'N', 'O', 'W',
      'H', 'A', 'I', 'L', 'T', 'H', 'U', 'N',
      'F', 'O', 'G', 'M', 'I', 'S', 'T', 'D',
      'W', 'I', 'N', 'D', 'E', 'R', 'S', 'L',
      'C', 'L', 'O', 'U', 'D', 'S', 'T', 'E'
    ],
    words: ['RAIN', 'SNOW', 'HAIL', 'THUNDER', 'FOG', 'MIST', 'WIND', 'CLOUDS']
  },
  {
    rows: 6,
    cols: 8,
    theme: "Sports",
    spangram: "ATHLETES",
    grid: [
      'A', 'T', 'H', 'L', 'E', 'T', 'E', 'S',
      'S', 'O', 'C', 'C', 'E', 'R', 'T', 'E',
      'B', 'A', 'S', 'K', 'E', 'T', 'N', 'N',
      'G', 'O', 'L', 'F', 'B', 'A', 'L', 'I',
      'H', 'O', 'C', 'K', 'E', 'Y', 'L', 'S',
      'R', 'U', 'G', 'B', 'Y', 'S', 'W', 'I'
    ],
    words: ['SOCCER', 'BASKETBALL', 'TENNIS', 'GOLF', 'HOCKEY', 'RUGBY', 'SWIM']
  }
];

export default puzzles;
