import { NextResponse } from 'next/server';
import { readDataFile, writeDataFile } from '@/lib/paths';

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const asset = searchParams.get('asset');
    const limit = searchParams.get('limit') || '50';

    let trades = await readDataFile<Trade[]>('trades.json', DEFAULT_TRADES);

    if (asset) {
      trades = trades.filter(t => t.asset === asset);
    }

    trades = trades.slice(0, parseInt(limit, 10));
    return NextResponse.json(trades);
  } catch (error) {
    console.error('[Trades GET] Error:', error);
    return NextResponse.json(DEFAULT_TRADES);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, trade } = body;

    if (!action || !trade) {
      return NextResponse.json(
        { error: 'Missing action or trade in request body' },
        { status: 400 }
      );
    }

    let trades = await readDataFile<Trade[]>('trades.json', DEFAULT_TRADES);

    if (action === 'add-trade') {
      // Validate required fields
      if (!trade.date || !trade.asset || !trade.type || trade.entryPrice === undefined || trade.exitPrice === undefined) {
        return NextResponse.json(
          { error: 'Trade must have: date, asset, type, entryPrice, exitPrice' },
          { status: 400 }
        );
      }

      const validTypes = ['long', 'short'];
      if (!validTypes.includes(trade.type)) {
        return NextResponse.json(
          { error: `Invalid trade type. Must be: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }

      const newTrade: Trade = {
        ...trade,
        id: Date.now().toString(),
      };
      trades.unshift(newTrade);
    } else if (action === 'update-trade') {
      if (!trade.id) {
        return NextResponse.json(
          { error: 'Trade ID is required for update' },
          { status: 400 }
        );
      }

      const idx = trades.findIndex(t => t.id === trade.id);
      if (idx < 0) {
        return NextResponse.json(
          { error: 'Trade not found' },
          { status: 404 }
        );
      }
      trades[idx] = trade;
    } else if (action === 'close-trade') {
      if (!trade.id) {
        return NextResponse.json(
          { error: 'Trade ID is required for close' },
          { status: 400 }
        );
      }

      const idx = trades.findIndex(t => t.id === trade.id);
      if (idx < 0) {
        return NextResponse.json(
          { error: 'Trade not found' },
          { status: 404 }
        );
      }
      trades[idx] = {
        ...trades[idx],
        ...trade,
        status: trade.pnl >= 0 ? 'win' : 'loss',
      };
    } else if (action === 'delete-trade') {
      if (!trade.id) {
        return NextResponse.json(
          { error: 'Trade ID is required for delete' },
          { status: 400 }
        );
      }
      trades = trades.filter(t => t.id !== trade.id);
    } else {
      return NextResponse.json(
        { error: 'Unknown action. Use: add-trade, update-trade, close-trade, or delete-trade' },
        { status: 400 }
      );
    }

    await writeDataFile('trades.json', trades);
    return NextResponse.json(trades);
  } catch (error) {
    console.error('[Trades POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update trades', details: String(error) },
      { status: 500 }
    );
  }
}
