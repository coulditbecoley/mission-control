import { promises as fs } from 'fs';
import path from 'path';

const DAILY_BRIEF_FILE = '/docker/mission_control/daily-brief.json';

interface DailyBrief {
  date: string;
  timestamp: string;
  btcPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  keySupport: number;
  keyResistance: number;
  technicalAnalysis: {
    rsi: string;
    macd: string;
    movingAverages: string;
    volume: string;
  };
  macroContext: string;
  tradingSignals: string[];
}

const DEFAULT_BRIEF: DailyBrief = {
  date: new Date().toISOString().split('T')[0],
  timestamp: new Date().toISOString(),
  btcPrice: 45200,
  priceChange24h: 1200,
  priceChangePercent24h: 2.7,
  keySupport: 42500,
  keyResistance: 48200,
  technicalAnalysis: {
    rsi: 'Neutral zone (45-55)',
    macd: 'Bullish crossover',
    movingAverages: 'Golden cross forming',
    volume: 'Above 30-day average',
  },
  macroContext: 'Fed policy, inflation data, and institutional flows are key drivers.',
  tradingSignals: [
    'Potential breakout above 46k resistance',
    'Support holding at 44k',
    'Watch for 4H close above MA200',
  ],
};

async function readDailyBrief(): Promise<DailyBrief> {
  try {
    const data = await fs.readFile(DAILY_BRIEF_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return DEFAULT_BRIEF;
  }
}

async function writeDailyBrief(brief: DailyBrief): Promise<void> {
  const dir = path.dirname(DAILY_BRIEF_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(DAILY_BRIEF_FILE, JSON.stringify(brief, null, 2));
  } catch (error) {
    console.error('Failed to write daily brief:', error);
  }
}

export async function GET() {
  const brief = await readDailyBrief();
  return Response.json(brief);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const brief: DailyBrief = {
      ...body,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
    };

    await writeDailyBrief(brief);
    return Response.json(brief);
  } catch (error) {
    console.error('Daily Brief API error:', error);
    return Response.json({ error: 'Failed to update daily brief' }, { status: 500 });
  }
}
