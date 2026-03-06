# Docker Files

This directory contains all Docker-related configuration files for CatStrands.

## Files

- `Dockerfile` - Multi-stage build for production (frontend + backend)
- `docker-compose.yml` - Full setup with dev and prod profiles
- `docker-compose.simple.yml` - Production using pre-built image
- `nginx.conf` - Nginx web server configuration
- `docker-entrypoint.sh` - Container startup script

## Quick Start

All docker-compose commands should be run from the **project root**:

```bash
# Production build
docker-compose --profile prod up -d

# Development mode with hot reload
docker-compose --profile dev up

# Using pre-built image
docker-compose -f docker-compose.simple.yml up -d
```

See [docs/README.md](../docs/README.md) for detailed documentation.
