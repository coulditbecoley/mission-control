# VPS Deployment Guide - Mission Control Dashboard

**Date:** April 9, 2026  
**Version:** 1.1.0 (Critical Fixes Applied)  
**Target:** Hostinger VPS (76.13.116.122:3001)

---

## Pre-Deployment Checklist

- [x] All CRITICAL issues fixed and tested
- [x] Build successful with 0 errors
- [x] Docker image configured for port 3001
- [x] Code pushed to GitHub (main branch)
- [x] GitHub Actions will auto-build and push to GHCR

---

## Step 1: Wait for GitHub Actions Build

The Docker image is being built automatically by GitHub Actions.

**Monitor Build Status:**
```bash
# View at: https://github.com/coulditbecoley/mission-control/actions

# Expected build time: 3-5 minutes
# Status will show as "Build and Push Docker Image" workflow
```

**Build Artifacts:**
- **Image URL:** `ghcr.io/coulditbecoley/mission-control:latest`
- **Registry:** GitHub Container Registry (GHCR)
- **Tags:**
  - `latest` - Points to main branch latest commit
  - `main-<sha>` - Specific commit hash
  - Branch name tags

---

## Step 2: SSH to VPS and Prepare Environment

```bash
# SSH into VPS
ssh root@76.13.116.122

# Navigate to docker directory (from DEPLOYMENT_CHECKLIST.md)
cd /docker/mission_control

# Create .env file with credentials
cat > .env << 'EOF'
OPENCLAW_GATEWAY_URL=wss://openclaw-ke4f.srv1566532.hstgr.cloud
OPENCLAW_GATEWAY_TOKEN=<YOUR_TOKEN_HERE>
NODE_ENV=production
EOF

# Verify .env was created correctly
cat .env
```

**Important:** Replace `<YOUR_TOKEN_HERE>` with actual OpenClaw Gateway token.

---

## Step 3: Stop Old Container (if running)

```bash
# Navigate to docker directory
cd /docker/mission_control

# Stop and remove existing container
docker compose down

# Verify it's stopped
docker ps | grep mission-control
# (should return nothing)
```

---

## Step 4: Pull Latest Docker Image

```bash
# Pull the latest image from GHCR
docker pull ghcr.io/coulditbecoley/mission-control:latest

# Verify pull was successful
docker images | grep mission-control
# Should show latest image with today's date
```

---

## Step 5: Start New Container

```bash
# From /docker/mission_control directory
docker compose up -d

# Verify container started
docker ps | grep mission-control
# Should show: mission-control (running)
```

---

## Step 6: Verify Deployment

### Health Check (Immediate)
```bash
# Check if API responds
curl http://localhost:3001/api/status

# Expected response:
# {
#   "status": "ok",
#   "healthy": true,
#   "message": "Mission Control API is healthy",
#   "timestamp": "2026-04-09T..."
# }
```

### Gateway Check (After 5-10 seconds)
```bash
# Check gateway connectivity
curl http://localhost:3001/api/gateway | jq '.status'

# Expected response: "ok"
```

### Full Gateway Response
```bash
curl http://localhost:3001/api/gateway | jq '.debug'

# Expected:
# {
#   "hasCredentials": true,
#   "gatewayConnected": true,
#   "gatewayError": null,
#   "fallbackMode": false
# }
```

### Browser Test
```
http://76.13.116.122:3001

# Should load the Asgard Dashboard UI
# Dark theme with Sidebar navigation
# Overview page with metrics and charts
```

---

## Step 7: Monitor Container Logs

```bash
# View real-time logs
docker logs -f mission-control

# View last 50 lines
docker logs --tail 50 mission-control

# Exit logs: Press Ctrl+C
```

### Expected Log Output
```
> mission-control@1.0.0 start
> next start -p 3001

   ▲ Next.js 15.5.14
   - Local:        http://localhost:3001
   ✓ Ready in Xs

[RPC] Gateway URL: wss://openclaw-ke4f.srv1566532.hstgr.cloud - Token configured
```

---

## Step 8: Verify Data Persistence

The application now properly persists data to `/docker/mission_control/`:

```bash
# Check for data files
ls -la /docker/mission_control/*.json

# Expected files (created on first data write):
# - tasks.json
# - portfolio.json
# - activity.json
```

These files will persist data between container restarts.

---

## Testing Checklist

- [ ] `/api/status` returns `status: "ok"`
- [ ] `/api/gateway` returns `status: "ok"`
- [ ] Dashboard loads at `http://76.13.116.122:3001`
- [ ] Sidebar navigation works
- [ ] All pages load without errors
- [ ] Console shows no JavaScript errors
- [ ] Docker healthcheck passes (check every 30s)

---

## Troubleshooting

### Container Won't Start
```bash
# Check logs for errors
docker logs mission-control

# Common issues:
# 1. Port 3001 already in use
#    → Stop other containers: docker ps, docker stop <id>
# 2. Memory insufficient
#    → Check: docker stats
# 3. Image not found
#    → Re-pull: docker pull ghcr.io/coulditbecoley/mission-control:latest
```

### API Returns Error
```bash
# Check if container is healthy
docker ps mission-control
# STATUS should show "healthy"

# If unhealthy, check logs
docker logs mission-control | tail -20

# Try restarting
docker compose restart
```

### Gateway Not Connected
```bash
# Verify environment variables are set
docker exec mission-control env | grep OPENCLAW

# Check if gateway is reachable from VPS
curl -v https://openclaw-ke4f.srv1566532.hstgr.cloud
```

### Performance Issues
```bash
# Check container resource usage
docker stats mission-control

# Check VPS system resources
df -h                    # Disk space
free -h                  # Memory
top -b -n1 | head -10   # CPU
```

---

## Rollback Plan

If deployment fails or issues are discovered:

### Option 1: Revert to Previous Version
```bash
# Stop current container
docker compose down

# Remove failed image
docker rmi ghcr.io/coulditbecoley/mission-control:latest

# Restore from backup branch
cd /data/.openclaw/workspace/mission-control
git log --oneline -10   # Find previous good commit

# Checkout backup branch (from DEPLOYMENT_CHECKLIST.md)
git checkout backup/main_<date>_<hash>_<description>

# Re-push to main
git push origin backup/main_<date>_<hash>_<description>:main --force

# Rebuild and deploy
docker pull ghcr.io/coulditbecoley/mission-control:latest
docker compose up -d
```

### Option 2: Quick Reset
```bash
# Stop and remove
docker compose down

# Remove all local data to reset to defaults
rm /docker/mission_control/*.json

# Restart with latest image
docker compose up -d
```

---

## Post-Deployment Steps

### 1. Update DNS/Proxy Records (if needed)
```
mission-control.tyrcapital.io → 76.13.116.122:3001
```

### 2. Configure Firewall
```bash
# Allow port 3001 (if not already open)
# Hostinger hPanel > Firewall > Add Rule
# Port: 3001, Protocol: TCP, Direction: Inbound
```

### 3. Set Up Monitoring
```bash
# Optional: Configure health check monitoring
# Visit: https://status.tyrcapital.io
# Add endpoint: http://76.13.116.122:3001/api/status
```

### 4. Enable Auto-Restart
```bash
# Docker compose already has restart: unless-stopped
# Verify container restarts after VPS reboot
docker compose logs mission-control | grep -i restart
```

---

## Version Information

**Current Build:** ad1446e (Apr 9, 2026)

**Key Changes in This Release:**
- ✅ Fixed 6 CRITICAL issues
- ✅ Proper data persistence (/docker/mission_control/)
- ✅ Security headers re-enabled
- ✅ Port binding corrected (3001)
- ✅ Input validation on all APIs
- ✅ Consistent API responses

---

## Support & Documentation

**Quick Links:**
- [CRITICAL_FIXES.md](./CRITICAL_FIXES.md) - Detailed explanation of fixes
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Original deployment procedures
- [README.md](./README.md) - Project overview

**Contact:**
- GitHub: https://github.com/coulditbecoley/mission-control
- VPS: 76.13.116.122:3001

---

## Sign-Off

✅ **Deployment Ready:** April 9, 2026, 19:28 EDT  
✅ **Build Status:** Passed  
✅ **Tests:** Passed  
✅ **Security Review:** Passed  

**Next Steps:** Follow Step 1 (wait for GitHub Actions build), then proceed with Steps 2-8.

---

**Estimated Total Deployment Time:** 10-15 minutes
- 3-5 min: GitHub Actions build
- 1 min: SSH and environment setup
- 1 min: Stop old container
- 1 min: Pull image
- 1 min: Start container
- 3 min: Verify deployment and test
- 1 min: Final checks

