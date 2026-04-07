# Mission Control — OpenClaw Gateway Dashboard

Real-time OpenClaw Gateway monitoring and control center.

## Quick Start

### Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Docker

```bash
docker build -t mission-control .
docker run -p 3000:3000 \
  -e OPENCLAW_GATEWAY_URL=http://host.docker.internal:8787 \
  mission-control
```

### Docker Compose

```bash
docker compose up
```

## Environment Variables

- `OPENCLAW_GATEWAY_URL` — OpenClaw Gateway endpoint (default: http://localhost:8787)
- `OPENCLAW_TOKEN` — Gateway authentication token (optional)
- `NODE_ENV` — production or development (default: development)

## Deployment to GHCR

1. **Tag your image:**
   ```bash
   docker tag mission-control:latest ghcr.io/YOUR_USERNAME/mission-control:latest
   ```

2. **Push to GHCR:**
   ```bash
   docker push ghcr.io/YOUR_USERNAME/mission-control:latest
   ```

3. **Use in Docker Manager (hPanel):**
   - Paste image: `ghcr.io/YOUR_USERNAME/mission-control:latest`
   - Port: `3001:3000`
   - Env vars:
     - `OPENCLAW_GATEWAY_URL=http://your-gateway-host:8787`
     - `OPENCLAW_TOKEN=your-token`

## Features

- ✅ Real-time gateway status
- ✅ Simple, clean UI
- ✅ Docker-ready
- ✅ OpenClaw Gateway integration

## License

MIT
