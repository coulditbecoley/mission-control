#!/bin/bash

# Backup current code before making changes
# Usage: ./scripts/backup.sh "description of changes"

DESCRIPTION="${1:-manual-backup}"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
COMMIT_HASH=$(git rev-parse --short HEAD)
BACKUP_BRANCH="backup/main_${TIMESTAMP}_${COMMIT_HASH}_${DESCRIPTION}"

echo "Creating backup: $BACKUP_BRANCH"

# Check if branch already exists locally
if git show-ref --quiet refs/heads/"$BACKUP_BRANCH"; then
  echo "⚠️  Branch already exists locally. Switching to it..."
  git checkout "$BACKUP_BRANCH"
else
  git checkout -b "$BACKUP_BRANCH"
fi

# Push and handle errors
if git push -u origin "$BACKUP_BRANCH"; then
  echo "✓ Backup created successfully"
  echo "To restore: git checkout $BACKUP_BRANCH"
  git checkout main
  exit 0
else
  echo "✗ Failed to push backup branch"
  # Fallback: stay on main and create tag instead
  git checkout main
  git tag "backup/${TIMESTAMP}_${COMMIT_HASH}_${DESCRIPTION}"
  git push origin "backup/${TIMESTAMP}_${COMMIT_HASH}_${DESCRIPTION}"
  echo "✓ Created backup tag instead"
  exit 1
fi
