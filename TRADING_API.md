# Trading API Documentation

The Asgard Dashboard includes REST APIs for managing portfolio data, trades, and daily briefs.

## Base URL
```
http://76.13.116.122:3001/api/trading
```

## Endpoints

### Portfolio

#### GET `/portfolio`
Fetch current portfolio data.

**Response:**
```json
{
  "totalValue": 125000,
  "totalInvested": 106500,
  "totalPnL": 18500,
  "totalPnLPercent": 17.4,
  "positions": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "amount": 2.5,
      "entryPrice": 44000,
      "currentPrice": 45200,
      "value": 113000,
      "pnl": 3000,
      "pnlPercent": 2.7
    }
  ],
  "lastUpdated": "2026-04-08T16:09:00Z"
}
```

#### POST `/portfolio`
Update portfolio data.

**Request Body:**
```json
{
  "action": "add-position",
  "position": {
    "symbol": "ETH",
    "name": "Ethereum",
    "amount": 50,
    "entryPrice": 2000,
    "currentPrice": 2400,
    "value": 120000,
    "pnl": 20000,
    "pnlPercent": 20.0
  }
}
```

**Actions:**
- `add-position` - Add a new position
- `update-position` - Update an existing position (by symbol)
- `remove-position` - Remove a position (by symbol)
- `update-portfolio` - Update entire portfolio data

---

### Trades

#### GET `/trades`
Fetch trade history.

**Query Parameters:**
- `asset` (optional) - Filter by asset symbol (e.g., "BTC")
- `limit` (optional) - Number of trades to return (default: 50)

**Response:**
```json
[
  {
    "id": "1",
    "date": "2026-04-08",
    "asset": "BTC",
    "type": "long",
    "entryPrice": 42500,
    "exitPrice": 45200,
    "quantity": 1.5,
    "pnl": 4050,
    "pnlPercent": 6.4,
    "status": "win",
    "portfolioTotal": 125000,
    "notes": "Golden cross + RSI divergence",
    "entryTime": "2026-04-08T10:30:00Z",
    "exitTime": "2026-04-08T14:45:00Z"
  }
]
```

#### POST `/trades`
Add or update trades.

**Request Body:**
```json
{
  "action": "add-trade",
  "trade": {
    "date": "2026-04-08",
    "asset": "BTC",
    "type": "long",
    "entryPrice": 42500,
    "exitPrice": 45200,
    "quantity": 1.5,
    "pnl": 4050,
    "pnlPercent": 6.4,
    "status": "win",
    "portfolioTotal": 125000,
    "notes": "Your trade notes here"
  }
}
```

**Actions:**
- `add-trade` - Create new trade
- `update-trade` - Update trade (requires `id`)
- `close-trade` - Close an open trade
- `delete-trade` - Delete a trade

---

### Daily Brief

#### GET `/daily-brief`
Fetch today's Bitcoin daily brief.

**Response:**
```json
{
  "date": "2026-04-08",
  "timestamp": "2026-04-08T16:09:00Z",
  "btcPrice": 45200,
  "priceChange24h": 1200,
  "priceChangePercent24h": 2.7,
  "keySupport": 42500,
  "keyResistance": 48200,
  "technicalAnalysis": {
    "rsi": "Neutral zone (45-55)",
    "macd": "Bullish crossover",
    "movingAverages": "Golden cross forming",
    "volume": "Above 30-day average"
  },
  "macroContext": "Fed policy and institutional flows are key drivers.",
  "tradingSignals": [
    "Potential breakout above 46k resistance",
    "Support holding at 44k"
  ]
}
```

#### POST `/daily-brief`
Update daily brief (typically via cron at 8 AM EST).

**Request Body:**
```json
{
  "btcPrice": 45200,
  "priceChange24h": 1200,
  "priceChangePercent24h": 2.7,
  "keySupport": 42500,
  "keyResistance": 48200,
  "technicalAnalysis": {
    "rsi": "Neutral zone (45-55)",
    "macd": "Bullish crossover",
    "movingAverages": "Golden cross forming",
    "volume": "Above 30-day average"
  },
  "macroContext": "Your analysis text here",
  "tradingSignals": ["Signal 1", "Signal 2"]
}
```

---

## Example Usage

### Add a new trade
```bash
curl -X POST http://76.13.116.122:3001/api/trading/trades \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add-trade",
    "trade": {
      "date": "2026-04-08",
      "asset": "BTC",
      "type": "long",
      "entryPrice": 45000,
      "exitPrice": 46000,
      "quantity": 1,
      "pnl": 1000,
      "pnlPercent": 2.2,
      "status": "win",
      "portfolioTotal": 126000,
      "notes": "Morning breakout trade"
    }
  }'
```

### Update portfolio
```bash
curl -X POST http://76.13.116.122:3001/api/trading/portfolio \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add-position",
    "position": {
      "symbol": "SOL",
      "name": "Solana",
      "amount": 1000,
      "entryPrice": 100,
      "currentPrice": 115,
      "value": 115000,
      "pnl": 15000,
      "pnlPercent": 15.0
    }
  }'
```

### Fetch trades for BTC only
```bash
curl http://76.13.116.122:3001/api/trading/trades?asset=BTC&limit=10
```

---

## Daily Brief Cron (8 AM EST)

To set up automated daily brief updates at 8 AM EST, create an OpenClaw cron job:

```bash
openclaw cron add \
  --name "bitcoin-daily-brief" \
  --description "Update Bitcoin daily brief at 8 AM EST" \
  --cron "0 8 * * *" \
  --tz "America/New_York" \
  --message "your-script-or-command-here"
```

The brief will POST to `/api/trading/daily-brief` with current analysis.

---

## Data Persistence

All data is stored in JSON files:
- `/docker/mission_control/portfolio-data.json`
- `/docker/mission_control/trades-data.json`
- `/docker/mission_control/daily-brief.json`

These persist across container restarts.
