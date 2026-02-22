.PHONY: help dev prod simple up-dev up-prod up-simple down-dev down-prod down-simple build logs clean ci-build ci-push ci

# Default target
help:
	@echo "CatStrands Docker Commands"
	@echo "=========================="
	@echo ""
	@echo "Simple Setup:"
	@echo "  make simple        - Pull and run from GHCR (port 3000)"
	@echo "  make down-simple   - Stop simple setup"
	@echo ""
	@echo "Development:"
	@echo "  make dev           - Start development server (port 5173)"
	@echo "  make down-dev      - Stop development server"
	@echo ""
	@echo "Production:"
	@echo "  make prod          - Start production server (port 8080)"
	@echo "  make down-prod     - Stop production server"
	@echo ""
	@echo "General:"
	@echo "  make build         - Build Docker image"
	@echo "  make logs          - View container logs"
	@echo "  make clean         - Remove containers, images, and volumes"
	@echo ""
	@echo "CI/CD:"
	@echo "  make ci            - Build and push to GHCR (requires login)"
	@echo "  make ci-build      - Build image for GHCR"
	@echo "  make ci-push       - Push image to GHCR"

# Simple setup commands
simple:
	@echo "Pulling latest image from GHCR..."
	docker-compose -f docker-compose.simple.yml pull
	docker-compose -f docker-compose.simple.yml up -d
	@echo "CatStrands is running at http://localhost:3000 (pulled from ghcr.io/slmingol/catstrands)"

down-simple:
	docker-compose -f docker-compose.simple.yml down

# Development commands
dev:
	docker-compose --profile dev up
	@echo "Development server starting at http://localhost:5173"

up-dev:
	docker-compose --profile dev up -d
	@echo "Development server running at http://localhost:5173"

down-dev:
	docker-compose --profile dev down

# Production commands
prod:
	docker-compose --profile prod up -d
	@echo "Production server running at http://localhost:8080"

up-prod:
	docker-compose --profile prod up -d
	@echo "Production server running at http://localhost:8080"

down-prod:
	docker-compose --profile prod down

# Build command
build:
	docker build -t catstrands .

# Logs
logs:
	docker-compose logs -f

# Clean up everything
clean:
	docker-compose --profile dev down -v
	docker-compose --profile prod down -v
	docker-compose -f docker-compose.simple.yml down -v
	docker rmi catstrands 2>/dev/null || true
	docker rmi ghcr.io/slmingol/catstrands:latest 2>/dev/null || true
	@echo "Cleanup complete"

# CI/CD commands
ci-build:
	@echo "Building image for GHCR..."
	@if command -v docker >/dev/null 2>&1 && docker buildx version >/dev/null 2>&1; then \
		docker buildx build --platform linux/amd64,linux/arm64 \
			-t ghcr.io/slmingol/catstrands:latest \
			-t ghcr.io/slmingol/catstrands:$$(git rev-parse --short HEAD) \
			.; \
	else \
		docker build -t ghcr.io/slmingol/catstrands:latest \
			-t ghcr.io/slmingol/catstrands:$$(git rev-parse --short HEAD) \
			.; \
	fi
	@echo "Image built for GHCR"

ci-push:
	@echo "Building and pushing image to GHCR..."
	@if command -v docker >/dev/null 2>&1 && docker buildx version >/dev/null 2>&1; then \
		docker buildx build --platform linux/amd64,linux/arm64 \
			-t ghcr.io/slmingol/catstrands:latest \
			-t ghcr.io/slmingol/catstrands:$$(git rev-parse --short HEAD) \
			--push \
			.; \
	else \
		docker build -t ghcr.io/slmingol/catstrands:latest \
			-t ghcr.io/slmingol/catstrands:$$(git rev-parse --short HEAD) \
			. && \
		docker push ghcr.io/slmingol/catstrands:latest && \
		docker push ghcr.io/slmingol/catstrands:$$(git rev-parse --short HEAD); \
	fi
	@echo "Image pushed to ghcr.io/slmingol/catstrands"

ci: ci-push
	@echo "CI build complete!"
