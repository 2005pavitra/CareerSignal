#!/usr/bin/env bash
set -e

USERNAME="${1:-pavitrapandey}"
TAG="${2:-latest}"

echo "================================================="
echo " CareerSignal Docker Build & Push"
echo " Docker Hub Account: $USERNAME"
echo " Image Tag:          $TAG"
echo "================================================="

echo -e "\n[1/4] Building Backend Image ($USERNAME/careersignal-backend:$TAG)..."
docker build -t "${USERNAME}/careersignal-backend:${TAG}" ./backend

echo -e "\n[2/4] Building Frontend Image ($USERNAME/careersignal-frontend:$TAG)..."
docker build -t "${USERNAME}/careersignal-frontend:${TAG}" --build-arg VITE_API_URL=http://localhost:4000 ./frontend

echo -e "\n[3/4] Pushing ${USERNAME}/careersignal-backend:${TAG} to Docker Hub..."
docker push "${USERNAME}/careersignal-backend:${TAG}"

echo -e "\n[4/4] Pushing ${USERNAME}/careersignal-frontend:${TAG} to Docker Hub..."
docker push "${USERNAME}/careersignal-frontend:${TAG}"

echo -e "\n================================================="
echo " SUCCESS! Docker images pushed to Docker Hub:"
echo " 1. https://hub.docker.com/r/${USERNAME}/careersignal-backend"
echo " 2. https://hub.docker.com/r/${USERNAME}/careersignal-frontend"
echo "================================================="
