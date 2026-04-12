# VPS Dashboard Update Instructions
**Date:** April 12, 2026  
**Status:** Ready for deployment  
**Latest Commit:** f49d91d (Trades API standardization fix)

---

## Quick Update (5 minutes)

SSH into your VPS and run these commands:

```bash
# SSH to VPS
ssh root@76.13.116.122

# Navigate to docker directory
cd /docker/mission_control

# Stop current container
docker compose down

# Pull latest Docker image
docker pull ghcr.io/coulditbecoley/mission-control:latest

# Start new container
docker compose up -d

# Verify deployment
curl http://localhost:3001/api/status | jq '.status'
# Expected: "ok"

curl http://localhost:3001/api/gateway | jq '.paired'
# Expected: true (if gateway token configured)
```

---

## What Changed in Latest Build

### Bug Fixed
- **Trades API Route:** Migrated from hardcoded paths to centralized utility
  - File: `app/api/trading/trades/route.ts`
  - Change: Uses `lib/paths.ts` for data persistence
  - Impact: Fixes data persistence on VPS (was silently failing before)

### Verification
- ✅ Build: 0 errors
- ✅ TypeScript: All files compile
- ✅ API Routes: All 6 API endpoints working
- ✅ Security: CSP headers enabled
- ✅ Docker: Ready to deploy

---

## Health Checks After Deployment

```bash
# Check if container is healthy
docker ps | grep mission-control
# Should show: mission-control (healthy)

# Check logs
docker logs mission-control | tail -20

# Test API endpoints
curl http://localhost:3001/api/status
curl http://localhost:3001/api/gateway
curl http://localhost:3001/api/trading/trades
curl http://localhost:3001/api/tasks
```

---

## If Something Goes Wrong

### Container won't start
```bash
# Check logs for errors
docker logs mission-control

# Try restarting
docker compose restart

# Check if port 3001 is in use
netstat -tulpn | grep 3001
```

### API returns errors
```bash
# Verify environment variables
docker exec mission-control env | grep OPENCLAW

# Check if gateway is reachable
curl -v https://openclaw-ke4f.srv1566532.hstgr.cloud
```

### Rollback to previous version
```bash
# Stop and remove current
docker compose down

# Use previous image hash if available
docker pull ghcr.io/coulditbecoley/mission-control:main-<previous-sha>
docker compose up -d
```

---

## GitHub Actions Status

Docker image builds automatically when commits are pushed to main.

**Monitor builds at:** https://github.com/coulditbecoley/mission-control/actions

**Build artifacts:**
- Image: `ghcr.io/coulditbecoley/mission-control:latest`
- Tags: `latest`, `main-<commit-sha>`, branch name

---

## Deployment Checklist

- [ ] Pull latest Docker image (`docker pull ghcr.io/coulditbecoley/mission-control:latest`)
- [ ] Stop old container (`docker compose down`)
- [ ] Start new container (`docker compose up -d`)
- [ ] Verify `/api/status` returns `"ok"`
- [ ] Verify `/api/gateway` returns `"ok"`
- [ ] Check dashboard loads at http://76.13.116.122:3001
- [ ] Check sidebar navigation works
- [ ] Check trading pages load (Portfolio, Bitcoin, Journal)
- [ ] Verify no console errors in browser DevTools
- [ ] Check container health (`docker ps` shows healthy)

---

## Contact / Support

- **Repository:** https://github.com/coulditbecoley/mission-control
- **Dashboard:** http://76.13.116.122:3001
- **Docs:** See VPS_DEPLOYMENT_GUIDE.md for detailed instructions

