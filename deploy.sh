#!/bin/bash
set -e

echo "========================================="
echo "   BioMindQ Production Deployment Script  "
echo "========================================="

# 1. Build and start with Docker Compose
echo "[1/2] Building and launching containers..."
docker compose down || true
docker compose build
docker compose up -d

echo "[2/2] Checking system health..."
sleep 3
curl -s http://localhost:8000/api/health || true

echo ""
echo "========================================="
echo " BioMindQ is live:"
echo " Frontend: http://localhost"
echo " Backend API: http://localhost:8000/docs"
echo "========================================="
