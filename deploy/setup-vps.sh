#!/bin/bash
# Script di setup iniziale VPS per SicurApp
# Eseguire UNA SOLA VOLTA sul server

set -e

APP_DIR="/opt/sicurapp"
REPO_URL="https://github.com/felicevitulano/sicurapp-sopralluoghi.git"

echo "=== SicurApp Deploy Setup ==="

# 1. Clona il repository
if [ -d "$APP_DIR" ]; then
  echo "Directory $APP_DIR già esistente — aggiorno il codice"
  cd "$APP_DIR" && git pull origin main
else
  echo "Clono il repository..."
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# 2. Crea il file .env di produzione se non esiste
if [ ! -f "$APP_DIR/.env.prod" ]; then
  echo ""
  echo "ATTENZIONE: crea il file $APP_DIR/.env.prod con le variabili d'ambiente"
  echo "Vedi .env.prod.example per il template"
  cp "$APP_DIR/deploy/.env.prod.example" "$APP_DIR/.env.prod"
  echo "Modifica $APP_DIR/.env.prod e riesegui lo script"
  exit 1
fi

# 3. Crea directory media
mkdir -p /opt/sicurapp-media
chmod 755 /opt/sicurapp-media

# 4. Avvia i container
cd "$APP_DIR"
docker compose -f docker-compose.prod.yml --env-file .env.prod pull 2>/dev/null || true
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# 5. Esegui le migration del database
echo "Attendo che il database sia pronto..."
sleep 5
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

echo ""
echo "=== Deploy completato! ==="
echo "SicurApp disponibile su: http://$(hostname -I | awk '{print $1}'):8090"
