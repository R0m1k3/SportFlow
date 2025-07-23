#!/bin/sh
set -e

echo "Installing dependencies..."
npm install

echo "Building TypeScript..."
npx tsc

echo "Build completed successfully"