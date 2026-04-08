# Deployment Checklist

Before making ANY changes to Mission Control, follow this checklist:

## 1. Create Backup
```bash
cd /data/.openclaw/workspace/mission-control
./scripts/backup.sh "description-of-changes"
git checkout main
```

## 2. Make Changes
- Edit only ONE component/file at a time
- Test locally before pushing:
```bash
npm run dev
# Visit http://localhost:3000 and verify
```

## 3. Push to GitHub
```bash
git add <specific-files>
git commit -m "Clear description of changes"
git push origin main
```

## 4. Verify Build
- Wait for GitHub Actions to complete (check Actions tab)
- Verify build succeeded with green checkmark

## 5. Deploy to VPS
```bash
cd /docker/mission_control
docker pull ghcr.io/coulditbecoley/mission-control:latest
docker compose restart mission_control
```

## 6. Verify on VPS
- Wait 10 seconds
- Visit: `http://76.13.116.122:3001`
- Hard refresh: `Cmd+Shift+R` or `Ctrl+F5`
- Verify changes are visible
- Check container logs for errors:
```bash
docker logs mission_control | tail -20
```

## If Something Breaks

### Immediate Rollback
```bash
# Find the backup branch
git branch -a | grep backup

# Switch to backup
git checkout backup/main_YYYY-MM-DD_HH-MM-SS_HASH_description

# Force push to main
git push origin backup/main_YYYY-MM-DD_HH-MM-SS_HASH_description:main --force

# Rebuild and deploy
cd /docker/mission_control
docker rmi ghcr.io/coulditbecoley/mission-control:latest -f
docker pull ghcr.io/coulditbecoley/mission-control:latest
docker compose restart mission_control
```

## Current Working Version
- **Last Good Commit:** a448f87 (Fix: Include app source files in Docker image)
- **Status:** ✓ Dark theme working, all cards dark, dashboard live
- **URL:** http://76.13.116.122:3001
