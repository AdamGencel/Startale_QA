#!/bin/bash

# Script to setup Synpress cache with correct IDs

echo "Setting up Synpress cache..."

# Remove old cache
rm -rf .cache-synpress/c8a075012501572ab07a 2>/dev/null
rm -rf .cache-synpress/26f71a4cc60122318d6f 2>/dev/null

# Build the cache - use e2e directory where our wallet setup file is located
npx synpress ./e2e

# Copy the cache to the expected ID (Synpress generates different IDs for setup vs test fixtures)
if [ -d ".cache-synpress/c8a075012501572ab07a" ]; then
  echo "Copying cache to expected ID..."
  cp -r .cache-synpress/c8a075012501572ab07a .cache-synpress/26f71a4cc60122318d6f
  echo "✓ Cache setup complete!"
else
  echo "✗ Cache creation failed!"
  exit 1
fi

