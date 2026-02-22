.PHONY: help dev prod simple up-dev up-prod up-simple down-dev down-prod down-simple build logs clean

# Default target
help:
	@echo "CatStrands Docker Commands"
	@echo "=========================="
	@echo ""
	@echo "Simple Setup:"
	@echo "  make simple        - Start app with simple compose (port 3000)"
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

# Simple setup commands
simple:
	docker-compose -f docker-compose.simple.yml up -d
	@echo "CatStrands is running at http://localhost:3000"

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
	@echo "Cleanup complete"
