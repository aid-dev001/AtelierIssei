#!/bin/bash
# Production deployment script

echo "Building application for production..."
npm run build

echo "Copying static files..."
mkdir -p server/public
cp -r dist/public/* server/public/

echo "Starting production server..."
NODE_ENV=production node dist/index.js