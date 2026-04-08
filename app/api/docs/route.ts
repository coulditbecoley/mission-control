import { promises as fs } from 'fs';
import path from 'path';

const DOCS_FILE = '/docker/mission_control/docs-storage.json';

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

export async function GET() {
  const docs = await readDocs();
  return Response.json({ docs });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { doc } = body;

    if (!doc || !doc.id) {
      return Response.json(
        { error: 'Invalid doc entry' },
        { status: 400 }
      );
    }

    const docs = await readDocs();
    
    // Check if doc already exists
    const existingIndex = docs.findIndex((d) => d.id === doc.id);
    if (existingIndex >= 0) {
      docs[existingIndex] = doc;
    } else {
      docs.unshift(doc);
    }

    await writeDocs(docs);
    return Response.json({ docs });
  } catch (error) {
    console.error('Error creating/updating doc:', error);
    return Response.json(
      { error: 'Failed to save doc' },
      { status: 500 }
    );
  }
}
