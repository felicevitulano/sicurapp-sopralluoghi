#!/bin/bash
# Backup giornaliero SicurApp (aggiungere a crontab)
# crontab: 0 3 * * * /opt/sicurapp/deploy/backup.sh

set -e

BACKUP_DIR="/opt/sicurapp-backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/opt/sicurapp"

mkdir -p "$BACKUP_DIR"

# Carica variabili d'ambiente
source "$APP_DIR/.env.prod"

# Backup database
echo "Backup database..."
docker compose -f "$APP_DIR/docker-compose.prod.yml" exec -T postgres \
  pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Backup media
echo "Backup media..."
tar -czf "$BACKUP_DIR/media_$DATE.tar.gz" /opt/sicurapp-media/

# Rimuovi backup più vecchi di 30 giorni
find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete

echo "Backup completato: $BACKUP_DIR"
ls -lh "$BACKUP_DIR" | tail -5
