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
  },
  {
    rows: 8,
    cols: 6,
    theme: "Kitchen Tools",
    spangram: "UTENSILS",
    grid: [
      'U', 'T', 'E', 'N', 'S', 'I',
      'L', 'S', 'P', 'O', 'O', 'N',
      'F', 'O', 'R', 'K', 'K', 'N',
      'I', 'F', 'E', 'W', 'H', 'I',
      'S', 'K', 'L', 'A', 'D', 'L',
      'E', 'S', 'P', 'A', 'T', 'U',
      'L', 'A', 'T', 'O', 'N', 'G',
      'S', 'P', 'E', 'E', 'L', 'E'
    ],
    words: ['SPOON', 'FORK', 'KNIFE', 'WHISK', 'LADLE', 'SPATULA', 'TONGS', 'PEELER']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Cheese Types",
    spangram: "CHEDDAR",
    grid: [
      'C', 'H', 'E', 'D', 'D', 'A',
      'R', 'B', 'R', 'I', 'E', 'G',
      'O', 'U', 'D', 'A', 'F', 'E',
      'T', 'A', 'M', 'O', 'Z', 'Z',
      'A', 'R', 'E', 'L', 'L', 'A',
      'S', 'W', 'I', 'S', 'S', 'P',
      'A', 'R', 'M', 'E', 'S', 'A',
      'N', 'B', 'L', 'U', 'E', 'C'
    ],
    words: ['BRIE', 'GOUDA', 'FETA', 'MOZZARELLA', 'SWISS', 'PARMESAN', 'BLUE']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Garden Flowers",
    spangram: "PETALS",
    grid: [
      'P', 'E', 'T', 'A', 'L', 'S',
      'R', 'O', 'S', 'E', 'D', 'A',
      'I', 'S', 'Y', 'T', 'U', 'L',
      'I', 'P', 'L', 'I', 'L', 'Y',
      'V', 'I', 'O', 'L', 'E', 'T',
      'I', 'R', 'I', 'S', 'P', 'A',
      'N', 'S', 'Y', 'D', 'A', 'F',
      'F', 'O', 'D', 'I', 'L', 'S'
    ],
    words: ['ROSE', 'DAISY', 'TULIP', 'LILY', 'VIOLET', 'IRIS', 'PANSY', 'DAFFODILS']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Spices",
    spangram: "PEPPER",
    grid: [
      'P', 'E', 'P', 'P', 'E', 'R',
      'S', 'A', 'L', 'T', 'G', 'I',
      'N', 'G', 'E', 'R', 'C', 'U',
      'M', 'I', 'N', 'B', 'A', 'S',
      'I', 'L', 'T', 'H', 'Y', 'M',
      'E', 'O', 'R', 'E', 'G', 'A',
      'N', 'O', 'P', 'A', 'P', 'R',
      'I', 'K', 'A', 'C', 'L', 'O'
    ],
    words: ['SALT', 'GINGER', 'CUMIN', 'BASIL', 'THYME', 'OREGANO', 'PAPRIKA', 'CLOVE']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Vehicles",
    spangram: "TRANSPORT",
    grid: [
      'T', 'R', 'A', 'N', 'S', 'P',
      'O', 'R', 'T', 'C', 'A', 'R',
      'B', 'U', 'S', 'T', 'R', 'U',
      'C', 'K', 'V', 'A', 'N', 'B',
      'I', 'K', 'E', 'T', 'R', 'A',
      'I', 'N', 'P', 'L', 'A', 'N',
      'E', 'B', 'O', 'A', 'T', 'S',
      'H', 'I', 'P', 'F', 'E', 'R'
    ],
    words: ['CAR', 'BUS', 'TRUCK', 'VAN', 'BIKE', 'TRAIN', 'PLANE', 'BOAT', 'SHIP', 'FERRY']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Gemstones",
    spangram: "JEWELS",
    grid: [
      'J', 'E', 'W', 'E', 'L', 'S',
      'R', 'U', 'B', 'Y', 'E', 'M',
      'E', 'R', 'A', 'L', 'D', 'S',
      'A', 'P', 'P', 'H', 'I', 'R',
      'E', 'D', 'I', 'A', 'M', 'O',
      'N', 'D', 'T', 'O', 'P', 'A',
      'Z', 'O', 'P', 'A', 'L', 'A',
      'M', 'E', 'T', 'H', 'Y', 'S'
    ],
    words: ['RUBY', 'EMERALD', 'SAPPHIRE', 'DIAMOND', 'TOPAZ', 'OPAL', 'AMETHYST']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Body Parts",
    spangram: "ANATOMY",
    grid: [
      'A', 'N', 'A', 'T', 'O', 'M',
      'Y', 'H', 'E', 'A', 'D', 'A',
      'R', 'M', 'L', 'E', 'G', 'H',
      'A', 'N', 'D', 'F', 'O', 'O',
      'T', 'E', 'Y', 'E', 'N', 'O',
      'S', 'E', 'E', 'A', 'R', 'M',
      'O', 'U', 'T', 'H', 'C', 'H',
      'E', 'S', 'T', 'B', 'A', 'C'
    ],
    words: ['HEAD', 'ARM', 'LEG', 'HAND', 'FOOT', 'EYE', 'NOSE', 'EAR', 'MOUTH', 'CHEST', 'BACK']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Trees",
    spangram: "FOREST",
    grid: [
      'F', 'O', 'R', 'E', 'S', 'T',
      'O', 'A', 'K', 'P', 'I', 'N',
      'E', 'M', 'A', 'P', 'L', 'E',
      'B', 'I', 'R', 'C', 'H', 'W',
      'I', 'L', 'L', 'O', 'W', 'A',
      'S', 'H', 'E', 'L', 'M', 'C',
      'E', 'D', 'A', 'R', 'F', 'I',
      'R', 'S', 'P', 'R', 'U', 'C'
    ],
    words: ['OAK', 'PINE', 'MAPLE', 'BIRCH', 'WILLOW', 'ASH', 'ELM', 'CEDAR', 'FIR', 'SPRUCE']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Birds",
    spangram: "FEATHERS",
    grid: [
      'F', 'E', 'A', 'T', 'H', 'E',
      'R', 'S', 'R', 'O', 'B', 'I',
      'N', 'S', 'P', 'A', 'R', 'R',
      'O', 'W', 'C', 'R', 'O', 'W',
      'H', 'A', 'W', 'K', 'E', 'A',
      'G', 'L', 'E', 'O', 'W', 'L',
      'D', 'U', 'C', 'K', 'G', 'O',
      'O', 'S', 'E', 'S', 'W', 'A'
    ],
    words: ['ROBIN', 'SPARROW', 'CROW', 'HAWK', 'EAGLE', 'OWL', 'DUCK', 'GOOSE', 'SWAN']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Fish",
    spangram: "SALMON",
    grid: [
      'S', 'A', 'L', 'M', 'O', 'N',
      'T', 'U', 'N', 'A', 'C', 'O',
      'D', 'T', 'R', 'O', 'U', 'T',
      'B', 'A', 'S', 'S', 'P', 'I',
      'K', 'E', 'P', 'E', 'R', 'C',
      'H', 'C', 'A', 'R', 'P', 'M',
      'A', 'C', 'K', 'E', 'R', 'E',
      'L', 'H', 'A', 'L', 'I', 'B'
    ],
    words: ['TUNA', 'COD', 'TROUT', 'BASS', 'PIKE', 'PERCH', 'CARP', 'MACKEREL', 'HALIBUT']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Vegetables",
    spangram: "GARDEN",
    grid: [
      'G', 'A', 'R', 'D', 'E', 'N',
      'C', 'A', 'R', 'R', 'O', 'T',
      'P', 'E', 'A', 'S', 'B', 'E',
      'A', 'N', 'S', 'C', 'O', 'R',
      'N', 'K', 'A', 'L', 'E', 'O',
      'N', 'I', 'O', 'N', 'L', 'E',
      'E', 'K', 'C', 'E', 'L', 'E',
      'R', 'Y', 'R', 'A', 'D', 'I'
    ],
    words: ['CARROT', 'PEAS', 'BEANS', 'CORN', 'KALE', 'ONION', 'LEEK', 'CELERY', 'RADISH']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Office Supplies",
    spangram: "PAPERS",
    grid: [
      'P', 'A', 'P', 'E', 'R', 'S',
      'E', 'N', 'D', 'E', 'S', 'K',
      'N', 'I', 'N', 'K', 'T', 'A',
      'G', 'L', 'U', 'E', 'A', 'P',
      'F', 'I', 'L', 'E', 'P', 'E',
      'C', 'L', 'I', 'P', 'E', 'R',
      'T', 'A', 'C', 'K', 'U', 'A',
      'S', 'T', 'A', 'P', 'L', 'E'
    ],
    words: ['PEN', 'DESK', 'INK', 'GLUE', 'FILE', 'CLIP', 'TACK', 'STAPLE', 'TAPE', 'RULER']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Tools",
    spangram: "WORKSHOP",
    grid: [
      'W', 'O', 'R', 'K', 'S', 'H',
      'O', 'P', 'H', 'A', 'M', 'M',
      'E', 'R', 'S', 'A', 'W', 'D',
      'R', 'I', 'L', 'L', 'W', 'R',
      'E', 'N', 'C', 'H', 'P', 'L',
      'I', 'E', 'R', 'S', 'C', 'R',
      'E', 'W', 'L', 'E', 'V', 'E',
      'L', 'F', 'I', 'L', 'E', 'A'
    ],
    words: ['HAMMER', 'SAW', 'DRILL', 'WRENCH', 'PLIERS', 'SCREW', 'LEVEL', 'FILE', 'AXE']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Instruments",
    spangram: "MUSIC",
    grid: [
      'M', 'U', 'S', 'I', 'C', 'G',
      'U', 'I', 'T', 'A', 'R', 'P',
      'I', 'A', 'N', 'O', 'D', 'R',
      'U', 'M', 'S', 'F', 'L', 'U',
      'T', 'E', 'V', 'I', 'O', 'L',
      'I', 'N', 'C', 'E', 'L', 'L',
      'O', 'H', 'A', 'R', 'P', 'O',
      'B', 'O', 'E', 'S', 'A', 'X'
    ],
    words: ['GUITAR', 'PIANO', 'DRUMS', 'FLUTE', 'VIOLIN', 'CELLO', 'HARP', 'OBOE', 'SAX']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Clothing",
    spangram: "FASHION",
    grid: [
      'F', 'A', 'S', 'H', 'I', 'O',
      'N', 'S', 'H', 'I', 'R', 'T',
      'P', 'A', 'N', 'T', 'S', 'D',
      'R', 'E', 'S', 'S', 'S', 'K',
      'I', 'R', 'T', 'J', 'A', 'C',
      'K', 'E', 'T', 'C', 'O', 'A',
      'T', 'H', 'A', 'T', 'S', 'H',
      'O', 'E', 'S', 'S', 'O', 'C'
    ],
    words: ['SHIRT', 'PANTS', 'DRESS', 'SKIRT', 'JACKET', 'COAT', 'HAT', 'SHOES', 'SOCKS']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Sports",
    spangram: "ATHLETES",
    grid: [
      'A', 'T', 'H', 'L', 'E', 'T',
      'E', 'S', 'S', 'O', 'C', 'C',
      'E', 'R', 'T', 'E', 'N', 'N',
      'I', 'S', 'G', 'O', 'L', 'F',
      'B', 'A', 'S', 'E', 'B', 'A',
      'L', 'L', 'H', 'O', 'C', 'K',
      'E', 'Y', 'R', 'U', 'G', 'B',
      'Y', 'S', 'W', 'I', 'M', 'S'
    ],
    words: ['SOCCER', 'TENNIS', 'GOLF', 'BASEBALL', 'HOCKEY', 'RUGBY', 'SWIM']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Furniture",
    spangram: "HOUSEHOLD",
    grid: [
      'H', 'O', 'U', 'S', 'E', 'H',
      'O', 'L', 'D', 'C', 'H', 'A',
      'I', 'R', 'T', 'A', 'B', 'L',
      'E', 'S', 'O', 'F', 'A', 'B',
      'E', 'D', 'D', 'E', 'S', 'K',
      'S', 'H', 'E', 'L', 'F', 'C',
      'A', 'B', 'I', 'N', 'E', 'T',
      'D', 'R', 'E', 'S', 'S', 'E'
    ],
    words: ['CHAIR', 'TABLE', 'SOFA', 'BED', 'DESK', 'SHELF', 'CABINET', 'DRESSER']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Wild Animals",
    spangram: "WILDLIFE",
    grid: [
      'W', 'I', 'L', 'D', 'L', 'I',
      'F', 'E', 'L', 'I', 'O', 'N',
      'T', 'I', 'G', 'E', 'R', 'B',
      'E', 'A', 'R', 'W', 'O', 'L',
      'F', 'F', 'O', 'X', 'D', 'E',
      'E', 'R', 'M', 'O', 'O', 'S',
      'E', 'E', 'L', 'K', 'R', 'A',
      'C', 'C', 'O', 'O', 'N', 'B'
    ],
    words: ['LION', 'TIGER', 'BEAR', 'WOLF', 'FOX', 'DEER', 'MOOSE', 'ELK', 'RACCOON', 'RABBIT']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Desserts",
    spangram: "SWEETS",
    grid: [
      'S', 'W', 'E', 'E', 'T', 'S',
      'C', 'A', 'K', 'E', 'P', 'I',
      'E', 'I', 'C', 'E', 'C', 'R',
      'E', 'A', 'M', 'C', 'O', 'O',
      'K', 'I', 'E', 'B', 'R', 'O',
      'W', 'N', 'I', 'E', 'T', 'A',
      'R', 'T', 'P', 'U', 'D', 'D',
      'I', 'N', 'G', 'C', 'A', 'N'
    ],
    words: ['CAKE', 'PIE', 'ICECREAM', 'COOKIE', 'BROWNIE', 'TART', 'PUDDING', 'CANDY']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Weather",
    spangram: "FORECAST",
    grid: [
      'F', 'O', 'R', 'E', 'C', 'A',
      'S', 'T', 'R', 'A', 'I', 'N',
      'S', 'N', 'O', 'W', 'S', 'U',
      'N', 'C', 'L', 'O', 'U', 'D',
      'S', 'W', 'I', 'N', 'D', 'F',
      'O', 'G', 'H', 'A', 'I', 'L',
      'M', 'I', 'S', 'T', 'S', 'L',
      'E', 'E', 'T', 'S', 'T', 'O'
    ],
    words: ['RAIN', 'SNOW', 'SUN', 'CLOUDS', 'WIND', 'FOG', 'HAIL', 'MIST', 'SLEET', 'STORM']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Colors",
    spangram: "RAINBOW",
    grid: [
      'R', 'A', 'I', 'N', 'B', 'O',
      'W', 'R', 'E', 'D', 'B', 'L',
      'U', 'E', 'G', 'R', 'E', 'E',
      'N', 'Y', 'E', 'L', 'L', 'O',
      'W', 'O', 'R', 'A', 'N', 'G',
      'E', 'P', 'U', 'R', 'P', 'L',
      'E', 'P', 'I', 'N', 'K', 'G',
      'R', 'A', 'Y', 'B', 'R', 'O'
    ],
    words: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'ORANGE', 'PURPLE', 'PINK', 'GRAY', 'BROWN']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Breakfast",
    spangram: "MORNING",
    grid: [
      'M', 'O', 'R', 'N', 'I', 'N',
      'G', 'T', 'O', 'A', 'S', 'T',
      'E', 'G', 'G', 'S', 'B', 'A',
      'C', 'O', 'N', 'W', 'A', 'F',
      'F', 'L', 'E', 'S', 'C', 'E',
      'R', 'E', 'A', 'L', 'M', 'U',
      'F', 'F', 'I', 'N', 'J', 'U',
      'I', 'C', 'E', 'M', 'I', 'L'
    ],
    words: ['TOAST', 'EGGS', 'BACON', 'WAFFLES', 'CEREAL', 'MUFFIN', 'JUICE', 'MILK']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Insects",
    spangram: "BUGS",
    grid: [
      'B', 'U', 'G', 'S', 'A', 'N',
      'T', 'B', 'E', 'E', 'F', 'L',
      'Y', 'M', 'O', 'T', 'H', 'W',
      'A', 'S', 'P', 'L', 'A', 'D',
      'Y', 'B', 'U', 'G', 'B', 'E',
      'E', 'T', 'L', 'E', 'C', 'R',
      'I', 'C', 'K', 'E', 'T', 'G',
      'R', 'A', 'S', 'S', 'H', 'O'
    ],
    words: ['ANT', 'BEE', 'FLY', 'MOTH', 'WASP', 'LADYBUG', 'BEETLE', 'CRICKET', 'GRASSHOPPER']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Metals",
    spangram: "ELEMENTS",
    grid: [
      'E', 'L', 'E', 'M', 'E', 'N',
      'T', 'S', 'G', 'O', 'L', 'D',
      'S', 'I', 'L', 'V', 'E', 'R',
      'C', 'O', 'P', 'P', 'E', 'R',
      'I', 'R', 'O', 'N', 'Z', 'I',
      'N', 'C', 'L', 'E', 'A', 'D',
      'T', 'I', 'N', 'S', 'T', 'E',
      'E', 'L', 'B', 'R', 'O', 'N'
    ],
    words: ['GOLD', 'SILVER', 'COPPER', 'IRON', 'ZINC', 'LEAD', 'TIN', 'STEEL', 'BRONZE']
  },
  {
    rows: 8,
    cols: 6,
    theme: "Room Types",
    spangram: "HOUSE",
    grid: [
      'H', 'O', 'U', 'S', 'E', 'K',
      'I', 'T', 'C', 'H', 'E', 'N',
      'B', 'E', 'D', 'R', 'O', 'O',
      'M', 'B', 'A', 'T', 'H', 'L',
      'I', 'V', 'I', 'N', 'G', 'R',
      'O', 'O', 'M', 'D', 'E', 'N',
      'A', 'T', 'T', 'I', 'C', 'B',
      'A', 'S', 'E', 'M', 'E', 'N'
    ],
    words: ['KITCHEN', 'BEDROOM', 'BATH', 'LIVINGROOM', 'DEN', 'ATTIC', 'BASEMENT']
  }
];

export default puzzles;
