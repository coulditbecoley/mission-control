import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { existsSync } from 'fs';

export async function GET() {
  try {
    const logPath = '/var/log/mission-control-deployments.log';

    // Check if log file exists
    if (!existsSync(logPath)) {
      return NextResponse.json([]);
    }

    // Read log file
    const content = readFileSync(logPath, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim());

    // Parse logs
    const logs = lines.map((line) => {
      const match = line.match(/\[([\d\-\s:]+)\]\s(.*)/);
      if (match) {
        const [, timestamp, message] = match;
        let status: 'info' | 'success' | 'error' | 'warning' = 'info';

        if (message.includes('✓')) {
          status = 'success';
        } else if (message.includes('✗')) {
          status = 'error';
        } else if (message.includes('warning')) {
          status = 'warning';
        }

        return { timestamp, message, status };
      }
      return null;
    });

    // Filter out nulls and reverse (newest first)
    const parsedLogs = logs.filter((l) => l !== null).reverse();

    return NextResponse.json(parsedLogs);
  } catch (error) {
    console.error('Failed to read logs:', error);
    return NextResponse.json([], { status: 500 });
  }
}
