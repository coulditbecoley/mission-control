import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
  const agents = await storage.getAgents();
  return NextResponse.json(agents);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const agents = await storage.getAgents();
    const agentIndex = agents.findIndex((a) => a.id === body.id);

    if (agentIndex === -1) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    agents[agentIndex] = { ...agents[agentIndex], ...body, lastSeen: new Date().toISOString() };
    await storage.saveAgents(agents);
    return NextResponse.json(agents[agentIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 400 });
  }
}
