import { promises as fs } from 'fs';
import path from 'path';

const TRADES_FILE = '/docker/mission_control/trades-data.json';

interface Trade {
  id: string;
  date: string;
  asset: string;
  type: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  status: 'win' | 'loss' | 'open';
  portfolioTotal: number;
  notes: string;
  entryTime?: string;
  exitTime?: string;
}

const DEFAULT_TRADES: Trade[] = [
  {
    id: '1',
    date: '2026-04-08',
    asset: 'BTC',
    type: 'long',
    entryPrice: 42500,
    exitPrice: 45200,
    quantity: 1.5,
    pnl: 4050,
    pnlPercent: 6.4,
    status: 'win',
    portfolioTotal: 125000,
    notes: 'Golden cross + RSI divergence',
  },
];

async function readTrades(): Promise<Trade[]> {
  try {
    const data = await fs.readFile(TRADES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return DEFAULT_TRADES;
  }
}

async function writeTrades(trades: Trade[]): Promise<void> {
  const dir = path.dirname(TRADES_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(TRADES_FILE, JSON.stringify(trades, null, 2));
  } catch (error) {
    console.error('Failed to write trades:', error);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const asset = searchParams.get('asset');
  const limit = searchParams.get('limit') || '50';

  let trades = await readTrades();

  if (asset) {
    trades = trades.filter(t => t.asset === asset);
  }

  trades = trades.slice(0, parseInt(limit));
  return Response.json(trades);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, trade } = body;

    let trades = await readTrades();

    if (action === 'add-trade') {
      const newTrade: Trade = {
        ...trade,
        id: Date.now().toString(),
      };
      trades.unshift(newTrade);
    } else if (action === 'update-trade') {
      const idx = trades.findIndex(t => t.id === trade.id);
      if (idx >= 0) {
        trades[idx] = trade;
      }
    } else if (action === 'close-trade') {
      const idx = trades.findIndex(t => t.id === trade.id);
      if (idx >= 0) {
        trades[idx] = {
          ...trades[idx],
          ...trade,
          status: trade.pnl >= 0 ? 'win' : 'loss',
        };
      }
    } else if (action === 'delete-trade') {
      trades = trades.filter(t => t.id !== trade.id);
    }

    await writeTrades(trades);
    return Response.json(trades);
  } catch (error) {
    console.error('Trades API error:', error);
    return Response.json({ error: 'Failed to update trades' }, { status: 500 });
  }
}
