# CatStrands - Copilot Instructions

## Repository Summary

CatStrands is a React-based web application that clones the New York Times Strands word puzzle game. It features an interactive grid-based word search with themed puzzles, spangram detection, NYT puzzle integration with an archive of 720+ puzzles since March 4, 2024, custom puzzle import/export, server-side cache backup, and a backend Express API for persistence.

## Repository Information

- **Size**: ~117MB (includes node_modules), ~3,854 lines of source code
- **Type**: Single-page web application with backend API
- **Primary Language**: JavaScript (ES6+)
- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 7.3.1  
- **Backend**: Express.js 4.18.2 with CORS support
- **Runtime**: Node.js 20+ (Docker uses Node 20-alpine, local development tested with Node 25.6.1)
- **Container Support**: Docker with multi-stage builds, docker-compose configurations
- **CI/CD**: GitHub Actions for automated Docker image builds and publishing to GHCR

## Build and Development Instructions

### Prerequisites

**ALWAYS install dependencies before any build or dev command:**
```bash
npm install
```

This command completes in ~2 seconds and installs 254 packages. There are 2 known high severity vulnerabilities that can be addressed with `npm audit fix` if needed.

### Development Workflow

**1. Frontend Development Only (most common):**
```bash
npm run dev
```
- Starts Vite dev server on http://localhost:5173
- Provides hot module replacement (HMR)
- No backend API available in this mode

**2. Full Stack Development (frontend + backend):**
```bash
npm run dev:all
```
- Runs both frontend (port 5173) and backend API (port 3001) concurrently
- Backend serves cache backup endpoints
- Use this when testing puzzle archive or cache features

**3. Backend Only:**
```bash
npm run dev:server
# or
npm run server
```
- Starts Express server on port 3001
- API endpoints: `/api/health`, `/api/cache/backup`, `/api/cache/restore`, `/api/cache/list`

### Building for Production

```bash
npm run build
```
- **Build Time**: ~350ms
- **Output Directory**: `dist/`
- Creates optimized bundle: ~236KB JS (gzipped: 74KB), ~17KB CSS (gzipped: 4KB)
- Build ALWAYS succeeds despite linting errors (see Known Issues)
- Output includes `dist/index.html` and hashed asset files in `dist/assets/`

### Preview Production Build

```bash
npm run preview
```
- Serves the built `dist/` folder locally
- Run after `npm run build` to test production build

### Linting

```bash
npm run lint
```

**Known Linting Errors (6 total) - DO NOT block on these:**

1. **server/index.js (Lines 15, 16)**: `'process' is not defined` (Node.js global, false positive)
2. **server/index.js (Lines 53, 222)**: Unused `error` variable in catch blocks (existing pattern)
3. **src/App.jsx (Line 280)**: `downloadPuzzles` unused variable (intentional)
4. **src/components/StrandsGame.jsx (Line 37)**: `setState` in effect causes cascading renders warning (known React pattern)

**Build and runtime are NOT affected by these lint warnings.** The project successfully builds and runs despite these errors. Only address if specifically tasked with fixing lint issues.

### Docker Development

**Quick Start (Pre-built Image):**
```bash
make simple
# or
docker-compose -f docker-compose.simple.yml up -d
```
- Pulls `ghcr.io/slmingol/catstrands:latest` from GitHub Container Registry
- Available at http://localhost:3000 (frontend) and http://localhost:3001 (API)
- No local build required

**Development Mode (with hot reload):**
```bash
make dev
# or  
docker-compose --profile dev up
```
- Mounts local source code as volume
- Frontend: http://localhost:5173
- Auto-reloads on file changes
- Runs `npm install` automatically on container start

**Production Mode (local build):**
```bash
make prod
# or
docker-compose --profile prod up -d
```
- Builds multi-stage Docker image using `docker/Dockerfile`
- Frontend: http://localhost:8080, API: http://localhost:3001
- Uses nginx to serve static files and Node.js for API

**Stop Containers:**
```bash
make down-simple  # Stop simple setup
make down-dev     # Stop dev mode
make down-prod    # Stop prod mode
```

**Clean Everything:**
```bash
make clean
```
- Removes all containers, images, and volumes
- Use when encountering Docker state issues

**View Logs:**
```bash
make logs
```

### Release Management

**Version Bumping:**
```bash
npm run release:patch  # 1.0.3 -> 1.0.4
npm run release:minor  # 1.0.3 -> 1.1.0
npm run release:major  # 1.0.3 -> 2.0.0
```
- Increments version in package.json
- Creates git tag
- Pushes to remote with tags

**Manual Release Script:**
```bash
./scripts/commit-and-release.sh "your commit message"
```
- Commits changes, bumps patch version, creates tag, and pushes
- Fails if no changes to commit

## Validation and CI/CD

### GitHub Actions Workflow

**File**: `.github/workflows/docker-build.yml`

**Triggers:**
- Push to `main` branch
- Tag creation (pattern: `v*`)
- Pull requests to `main`
- Manual dispatch

**What It Does:**
1. Builds multi-platform Docker image (linux/amd64, linux/arm64)
2. Pushes to `ghcr.io/slmingol/catstrands` with tags:
   - `latest` (main branch only)
   - Git SHA (e.g., `sha-abc1234`)
   - Semantic version tags from git tags (e.g., `v1.0.3`, `1.0`, `1`)
3. Uses GitHub Actions cache for faster builds
4. Requires `GITHUB_TOKEN` secret (auto-provided)

**Local CI Testing:**
```bash
make ci-build  # Build multi-platform image locally (requires Docker buildx)
make ci-push   # Build and push to GHCR (requires: docker login ghcr.io)
make ci        # Alias for ci-push
```

### Manual Validation Steps

Before submitting changes:

1. **Install dependencies:** `npm install`
2. **Build successfully:** `npm run build` (should complete in <1s)
3. **Test locally:** `npm run dev` and verify functionality at http://localhost:5173
4. **Check for new lint errors:** `npm run lint` (6 existing errors are expected)
5. **Test backend if changed:** `npm run dev:all` and verify API at http://localhost:3001/api/health

### Testing Custom Puzzles

1. Import test puzzle: Use `example_office_supplies.json` in root directory
2. Test JSON validation: Puzzles require `rows`, `cols`, `theme`, `spangram`, `grid`, and `words`
3. Grid validation: `rows` × `cols` must equal array length of `grid`

## Project Architecture and Layout

### Directory Structure

```
catstrands/
├── .github/
│   └── workflows/
│       └── docker-build.yml       # CI/CD pipeline for Docker builds
├── docker/
│   ├── Dockerfile                 # Multi-stage build (Node 20-alpine + nginx)
│   ├── docker-compose.yml         # Dev/prod profiles
│   ├── docker-compose.simple.yml  # Pre-built image from GHCR
│   ├── docker-entrypoint.sh       # Container startup script
│   ├── nginx.conf                 # Nginx configuration for production
│   └── README.md                  # Docker documentation
├── docs/
│   ├── README.md                  # Main documentation (symlinked to root)
│   └── LICENSE                    # MIT license (symlinked to root)
├── scripts/
│   └── commit-and-release.sh      # Automated release helper
├── server/
│   └── index.js                   # Express API server (cache backup/restore)
├── src/
│   ├── components/
│   │   ├── StrandsGame.jsx        # Main game component (15,617 lines)
│   │   ├── StrandsGame.css        # Game styling
│   │   ├── PuzzleArchiveModal.jsx # NYT archive browser
│   │   ├── PuzzleArchiveModal.css
│   │   ├── SettingsModal.jsx      # Settings UI
│   │   ├── SettingsModal.css
│   │   ├── StatsModal.jsx         # Stats tracking UI
│   │   └── StatsModal.css
│   ├── data/
│   │   └── puzzles.js             # Pre-loaded puzzle data (14,806 lines)
│   ├── utils/
│   │   ├── fetchNYTPuzzle.js      # NYT API integration (13,502 lines)
│   │   ├── cacheBackup.js         # Server sync utilities
│   │   ├── puzzleImportExport.js  # Custom puzzle I/O
│   │   └── statsManager.js        # Game statistics
│   ├── assets/
│   │   └── react.svg              # React logo
│   ├── App.jsx                    # Root app component
│   ├── App.css                    # App-level styles
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Global styles
├── public/
│   └── vite.svg                   # Vite logo
├── .dockerignore                  # Docker build exclusions
├── .gitignore                     # Git exclusions
├── check-api-range.js             # Browser console utility for checking cache
├── eslint.config.js               # ESLint flat config (React rules)
├── example_office_supplies.json   # Template for custom puzzles
├── index.html                     # Main HTML entry point
├── Makefile                       # Docker convenience commands
├── package.json                   # Dependencies and scripts
├── package-lock.json              # Locked dependency versions
├── test_*.json                    # Sample puzzle files (music, ocean, programming)
└── vite.config.js                 # Vite build configuration
```

### Key Configuration Files

- **vite.config.js**: Basic Vite config with React plugin, no custom settings
- **eslint.config.js**: ESLint flat config using `@eslint/js`, `globals`, React hooks and refresh plugins
- **package.json**: Version 1.0.3, MIT license, defines all npm scripts
- **.gitignore**: Excludes `node_modules`, `dist`, `dist-ssr`, `.vite`, logs, and editor files
- **.dockerignore**: Mirrors .gitignore for Docker builds

### Architecture Overview

**Frontend (React + Vite):**
- Single-page application with component-based architecture
- Main game logic in `src/components/StrandsGame.jsx`
- Uses React hooks for state management (no Redux or Context API)
- LocalStorage for client-side puzzle cache (`nyt-strands-cache` key)
- Vite provides fast HMR during development

**Backend (Express.js):**
- Lightweight API server in `server/index.js`  
- Provides cache backup/restore endpoints for persistence
- CORS enabled for cross-origin requests
- Stores backups in `data/` directory (Docker: `/app/data`)
- Maintains up to 5 versioned backups with rotation

**Data Flow:**
1. User plays puzzle → Updates localStorage
2. After downloading puzzles → Auto-backup to server API
3. Server stores JSON cache in `data/cache-backup.json` 
4. On restore → Fetches from server and updates localStorage

**Deployment:**
- Production: Nginx serves static files from `dist/`, proxies API to Node.js
- Both services run in single Docker container via docker-entrypoint.sh
- Published to GHCR for easy distribution

### Dependencies

**Runtime Dependencies:**
- `react` 19.2.0, `react-dom` 19.2.0 - UI framework
- `express` 4.18.2 - Backend server
- `cors` 2.8.5 - CORS middleware

**Development Dependencies:**
- `vite` 7.3.1 - Build tool and dev server
- `@vitejs/plugin-react` 5.1.1 - React plugin for Vite
- `eslint` 9.39.1 + React plugins - Code linting
- `concurrently` 8.2.2 - Run multiple npm scripts

**No test framework is configured.** There are no unit tests, integration tests, or E2E tests in this repository.

## Root Directory Files

```
.dockerignore              # Docker build exclusions
.gitignore                 # Git exclusions  
check-api-range.js         # Browser console debugging tool
docker-compose.simple.yml  # Symlink to docker/docker-compose.simple.yml
docker-compose.yml         # Symlink to docker/docker-compose.yml
eslint.config.js           # ESLint configuration
example_office_supplies.json # Template puzzle file
index.html                 # HTML entry point
LICENSE                    # Symlink to docs/LICENSE
Makefile                   # Docker commands (help, dev, prod, simple, clean, ci)
package-lock.json          # Locked dependencies
package.json               # Project metadata and scripts
README.md                  # Symlink to docs/README.md
test_music.json            # Sample puzzle
test_ocean.json            # Sample puzzle  
test_programming.json      # Sample puzzle
vite.config.js             # Vite build config
```

## Common Issues and Workarounds

### Build Issues

**Problem**: `npm run dev` fails with module not found  
**Solution**: Always run `npm install` first. Dependencies are not committed to git.

**Problem**: Docker build fails with "no space left on device"  
**Solution**: Run `docker system prune -a` to clean up old images and containers.

**Problem**: Vite build cache issues after dependency update  
**Solution**: Delete `.vite/` directory and rebuild.

### Lint Warnings

**Do NOT spend time fixing the 6 existing lint errors** unless specifically requested. They are documented in the "Linting" section and do not affect functionality.

### Docker Issues

**Problem**: "port already allocated" error  
**Solution**: Stop conflicting service or use different port by modifying docker-compose.yml

**Problem**: Changes not reflecting in Docker dev mode  
**Solution**: Ensure volumes are correctly mounted. Run `docker-compose down -v && docker-compose --profile dev up` to restart fresh.

### Running Multiple Modes

**Never run multiple npm dev servers simultaneously** - they will conflict on port 5173. Stop one before starting another.

## Trust These Instructions

**These instructions have been validated by running all commands and inspecting the codebase thoroughly.** Only perform additional searches or exploration if:

1. The information here is incomplete for your specific task
2. You encounter an error not documented in "Common Issues"
3. The codebase has been modified since these instructions were created
4. You need to understand implementation details not covered here

For most implementation, build, test, and validation tasks, the information above should be sufficient to proceed without extensive codebase exploration.

---

*Last Updated: March 7, 2026*  
*Repository Version: 1.0.3*  
*Node Version Used for Validation: 25.6.1 (Docker uses 20-alpine)*
