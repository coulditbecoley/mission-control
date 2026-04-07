import { NextResponse } from "next/server";

export async function GET() {
  try {
    let gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:8787";
    const token = process.env.OPENCLAW_TOKEN;

    // Convert WebSocket URL to HTTPS
    if (gatewayUrl.startsWith("wss://")) {
      gatewayUrl = gatewayUrl.replace("wss://", "https://");
    } else if (gatewayUrl.startsWith("ws://")) {
      gatewayUrl = gatewayUrl.replace("ws://", "http://");
    }

    // Remove trailing slash if present
    gatewayUrl = gatewayUrl.replace(/\/$/, "");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Health check: just verify the gateway is reachable
    const res = await fetch(gatewayUrl, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { 
          status: "error",
          message: `Gateway returned HTTP ${res.status}`,
          url: gatewayUrl,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    // Gateway is up
    return NextResponse.json({
      status: "healthy",
      message: "OpenClaw Gateway is reachable",
      url: gatewayUrl,
      timestamp: new Date().toISOString(),
      authenticated: !!token,
    });
  } catch (error) {
    console.error("Status error:", error);
    return NextResponse.json(
      { 
        status: "error",
        message: "Failed to reach OpenClaw Gateway",
        details: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
