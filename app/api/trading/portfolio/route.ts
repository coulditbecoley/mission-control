import { promises as fs } from 'fs';
import path from 'path';

const PORTFOLIO_FILE = '/docker/mission_control/portfolio-data.json';

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

async function readPortfolio(): Promise<PortfolioData> {
  try {
    const data = await fs.readFile(PORTFOLIO_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return DEFAULT_PORTFOLIO;
  }
}

async function writePortfolio(portfolio: PortfolioData): Promise<void> {
  const dir = path.dirname(PORTFOLIO_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(PORTFOLIO_FILE, JSON.stringify(portfolio, null, 2));
  } catch (error) {
    console.error('Failed to write portfolio:', error);
  }
}

export async function GET() {
  const portfolio = await readPortfolio();
  return Response.json(portfolio);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, position, portfolioData } = body;

    let portfolio = await readPortfolio();

    if (action === 'add-position') {
      portfolio.positions.push(position);
      portfolio.totalValue = portfolio.positions.reduce((sum, p) => sum + p.value, 0);
      portfolio.totalPnL = portfolio.positions.reduce((sum, p) => sum + p.pnl, 0);
      portfolio.totalPnLPercent = (portfolio.totalPnL / (portfolio.totalValue - portfolio.totalPnL)) * 100;
    } else if (action === 'update-position') {
      const idx = portfolio.positions.findIndex(p => p.symbol === position.symbol);
      if (idx >= 0) {
        portfolio.positions[idx] = position;
        portfolio.totalValue = portfolio.positions.reduce((sum, p) => sum + p.value, 0);
        portfolio.totalPnL = portfolio.positions.reduce((sum, p) => sum + p.pnl, 0);
      }
    } else if (action === 'remove-position') {
      portfolio.positions = portfolio.positions.filter(p => p.symbol !== position.symbol);
      portfolio.totalValue = portfolio.positions.reduce((sum, p) => sum + p.value, 0);
      portfolio.totalPnL = portfolio.positions.reduce((sum, p) => sum + p.pnl, 0);
    } else if (action === 'update-portfolio') {
      portfolio = {
        ...portfolio,
        ...portfolioData,
        lastUpdated: new Date().toISOString(),
      };
    }

    await writePortfolio(portfolio);
    return Response.json(portfolio);
  } catch (error) {
    console.error('Portfolio API error:', error);
    return Response.json({ error: 'Failed to update portfolio' }, { status: 500 });
  }
}
