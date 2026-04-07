#!/bin/bash
# Script di aggiornamento SicurApp (deploy successivi)
set -e

APP_DIR="/opt/sicurapp"

echo "=== Aggiornamento SicurApp ==="
cd "$APP_DIR"

git pull origin main

docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Esegui eventuali nuove migration
sleep 3
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

echo "=== Aggiornamento completato! ==="
docker compose -f docker-compose.prod.yml ps
