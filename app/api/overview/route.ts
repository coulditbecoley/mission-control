import { NextResponse } from "next/server";

// Mock data - replace with real data sources
async function getOverviewData() {
  try {
    // In production, these would come from:
    // - Database (tasks, projects)
    // - CoinGecko API (Bitcoin price)
    // - Your portfolio tracking system

    const mockData = {
      taskProgress: 72, // 0-100
      projectProgress: 58, // 0-100
      portfolioValue: 142500.5,
      bitcoinPrice: 42850,
      taskCount: {
        total: 24,
        completed: 17,
      },
      projectCount: {
        total: 8,
        completed: 5,
      },
    };

    return mockData;
  } catch (error) {
    console.error("Failed to fetch overview data:", error);
    throw error;
  }
}

export async function GET() {
  try {
    const data = await getOverviewData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch overview data" },
      { status: 500 }
    );
  }
}
