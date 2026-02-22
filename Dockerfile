# Multi-stage build for CatStrands with backend API
# Stage 1: Build the frontend application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the frontend application
RUN npm run build

# Stage 2: Production image with both frontend and backend
FROM node:20-alpine

# Install nginx
RUN apk add --no-cache nginx

# Create app directory
WORKDIR /app

# Copy package files for backend
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built frontend from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy server code
COPY server ./server

# Copy nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create data directory for cache backups
RUN mkdir -p /app/data && chmod 777 /app/data

# Set environment variable for cache file location
ENV CACHE_FILE=/app/data/cache-backup.json
ENV NODE_ENV=production

# Expose ports (80 for nginx, 3001 for API)
EXPOSE 80 3001

# Start both nginx and backend server
ENTRYPOINT ["docker-entrypoint.sh"]
