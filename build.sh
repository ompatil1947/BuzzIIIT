#!/usr/bin/env bash
set -e

echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Wiring frontend into backend..."
rm -rf backend/frontend_dist
cp -r frontend/dist backend/frontend_dist

echo "Installing backend deps..."
cd backend
pip install -r requirements.txt
