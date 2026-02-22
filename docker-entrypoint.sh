#!/bin/sh

# Start the backend API server in the background
echo "Starting backend API server on port 3001..."
node /app/server/index.js &

# Start nginx in the foreground
echo "Starting nginx..."
nginx -g 'daemon off;'
