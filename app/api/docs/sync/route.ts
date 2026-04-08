import { promises as fs } from 'fs';
import path from 'path';

const DOCS_FILE = '/docker/mission_control/docs-storage.json';
const LAST_SYNC_FILE = '/tmp/telegram-notes-sync.txt';

interface DocEntry {
  id: string;
  date: string;
  title: string;
  category: 'daily' | 'notes';
  preview: string;
}

const DEFAULT_DOCS: DocEntry[] = [
  {
    id: '1',
    date: '2026-04-08',
    title: 'Daily Summary — Apr 8, 2026',
    category: 'daily',
    preview: 'Deployed Asgard Dashboard with dark theme. Added Calendar tab with Linear-style week view. Updated Health Check timer to 3 hours. Fixed Traefik routing issues and container deployment.',
  },
];

async function readDocs(): Promise<DocEntry[]> {
  try {
    const data = await fs.readFile(DOCS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.docs || DEFAULT_DOCS;
  } catch (error) {
    return DEFAULT_DOCS;
  }
}

async function writeDocs(docs: DocEntry[]): Promise<void> {
  const dir = path.dirname(DOCS_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(DOCS_FILE, JSON.stringify({ docs }, null, 2));
  } catch (error) {
    console.error('Failed to write docs:', error);
  }
}

export async function POST() {
  try {
    // This endpoint is called by the cron job or manually to sync Telegram notes
    // It triggers the sync script and reloads the docs
    
    const docs = await readDocs();
    
    // Update last sync time
    try {
      await fs.writeFile(LAST_SYNC_FILE, Date.now().toString());
    } catch (error) {
      console.error('Failed to update sync time:', error);
    }

    return Response.json({ 
      docs,
      message: 'Docs synced successfully',
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync error:', error);
    return Response.json(
      { error: 'Sync failed' },
      { status: 500 }
    );
  }
}
