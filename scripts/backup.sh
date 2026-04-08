#!/bin/bash

# Backup current code before making changes
# Usage: ./scripts/backup.sh "description of changes"

DESCRIPTION="${1:-manual-backup}"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
COMMIT_HASH=$(git rev-parse --short HEAD)
BACKUP_BRANCH="backup/main_${TIMESTAMP}_${COMMIT_HASH}_${DESCRIPTION}"

echo "Creating backup: $BACKUP_BRANCH"
git checkout -b "$BACKUP_BRANCH"
git push origin "$BACKUP_BRANCH"

echo "✓ Backup created successfully"
echo "To restore: git checkout $BACKUP_BRANCH"
