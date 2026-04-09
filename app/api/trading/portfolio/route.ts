import { NextResponse } from 'next/server';
import { readDataFile, writeDataFile } from '@/lib/paths';

interface Position {
  symbol: string;
  name: string;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
}

interface PortfolioData {
  totalValue: number;
  totalInvested: number;
  totalPnL: number;
  totalPnLPercent: number;
  positions: Position[];
  lastUpdated: string;
}

const DEFAULT_PORTFOLIO: PortfolioData = {
  totalValue: 125000,
  totalInvested: 106500,
  totalPnL: 18500,
  totalPnLPercent: 17.4,
  positions: [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      amount: 2.5,
      entryPrice: 44000,
      currentPrice: 45200,
      value: 113000,
      pnl: 3000,
      pnlPercent: 2.7,
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      amount: 25,
      entryPrice: 2000,
      currentPrice: 2400,
      value: 60000,
      pnl: 10000,
      pnlPercent: 20.0,
    },
  ],
  lastUpdated: new Date().toISOString(),
};

export async function GET() {
  try {
    const portfolio = await readDataFile<PortfolioData>('portfolio.json', DEFAULT_PORTFOLIO);
    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('[Portfolio GET] Error:', error);
    return NextResponse.json(DEFAULT_PORTFOLIO);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, position, portfolioData } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action in request body' },
        { status: 400 }
      );
    }

    let portfolio = await readDataFile<PortfolioData>('portfolio.json', DEFAULT_PORTFOLIO);

    if (action === 'add-position') {
      if (!position || !position.symbol) {
        return NextResponse.json(
          { error: 'Position with symbol is required' },
          { status: 400 }
        );
      }

      // Validate position data
      if (!position.amount || !position.entryPrice || !position.currentPrice) {
        return NextResponse.json(
          { error: 'Position must have amount, entryPrice, and currentPrice' },
          { status: 400 }
        );
      }

      portfolio.positions.push(position);
      portfolio.totalValue = portfolio.positions.reduce((sum, p) => sum + p.value, 0);
      portfolio.totalPnL = portfolio.positions.reduce((sum, p) => sum + p.pnl, 0);
      portfolio.totalPnLPercent = portfolio.totalValue > 0 
        ? (portfolio.totalPnL / portfolio.totalValue) * 100 
        : 0;
      portfolio.lastUpdated = new Date().toISOString();
    } else if (action === 'update-position') {
      if (!position || !position.symbol) {
        return NextResponse.json(
          { error: 'Position with symbol is required' },
          { status: 400 }
        );
      }

      const idx = portfolio.positions.findIndex(p => p.symbol === position.symbol);
      if (idx < 0) {
        return NextResponse.json(
          { error: 'Position not found' },
          { status: 404 }
        );
      }

      portfolio.positions[idx] = position;
      portfolio.totalValue = portfolio.positions.reduce((sum, p) => sum + p.value, 0);
      portfolio.totalPnL = portfolio.positions.reduce((sum, p) => sum + p.pnl, 0);
      portfolio.lastUpdated = new Date().toISOString();
    } else if (action === 'remove-position') {
      if (!position || !position.symbol) {
        return NextResponse.json(
          { error: 'Position symbol is required' },
          { status: 400 }
        );
      }

      portfolio.positions = portfolio.positions.filter(p => p.symbol !== position.symbol);
      portfolio.totalValue = portfolio.positions.reduce((sum, p) => sum + p.value, 0);
      portfolio.totalPnL = portfolio.positions.reduce((sum, p) => sum + p.pnl, 0);
      portfolio.lastUpdated = new Date().toISOString();
    } else if (action === 'update-portfolio') {
      if (!portfolioData) {
        return NextResponse.json(
          { error: 'Portfolio data is required' },
          { status: 400 }
        );
      }

      portfolio = {
        ...portfolio,
        ...portfolioData,
        lastUpdated: new Date().toISOString(),
      };
    } else {
      return NextResponse.json(
        { error: 'Unknown action. Use: add-position, update-position, remove-position, or update-portfolio' },
        { status: 400 }
      );
    }

    await writeDataFile('portfolio.json', portfolio);
    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('[Portfolio POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update portfolio', details: String(error) },
      { status: 500 }
    );
  }
}
