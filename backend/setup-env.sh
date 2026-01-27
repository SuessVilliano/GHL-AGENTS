#!/bin/bash

# LIV8 GHL - Vercel Environment Setup Script

echo "Setting up Vercel environment variables..."

# Set GEMINI_API_KEY
echo "AIzaSyDDWyWQg4ZF3ZNN3rUVNeVqW1nHkQZ44fY" | vercel env add GEMINI_API_KEY production

# Set HIGHLEVEL_MCP_URL
echo "https://services.leadconnectorhq.com/mcp/" | vercel env add HIGHLEVEL_MCP_URL production

# Set JWT_SECRET
echo "KOhBZsWFIj3ZJKgPAbLXVBdzzEmHZVZpWZMPJ2TazlE=" | vercel env add JWT_SECRET production

# Set GHL_TEST_TOKEN
echo "pit-1b141389-ba1e-4ac6-b85a-30b2b069bee5" | vercel env add GHL_TEST_TOKEN production

echo "✅ Environment variables configured!"
echo "Now run: vercel --prod"
