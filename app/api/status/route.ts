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

    // Try /status endpoint first, then fallback to /health or /ping
    const endpoints = ["/status", "/health", "/"];
    let res = null;
    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        const url = `${gatewayUrl}${endpoint}`;
        console.log(`Trying endpoint: ${url}`);
        
        res = await fetch(url, {
          headers,
          cache: "no-store",
          timeout: 5000,
        });

        if (res.ok) {
          break;
        }
      } catch (e) {
        lastError = e;
        console.error(`Endpoint ${endpoint} failed:`, e);
        continue;
      }
    }

    if (!res || !res.ok) {
      return NextResponse.json(
        { 
          error: "Failed to connect to gateway",
          url: gatewayUrl,
          tried_endpoints: endpoints,
          details: lastError ? String(lastError) : `HTTP ${res?.status}`,
        },
        { status: 503 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gateway status", details: String(error) },
      { status: 500 }
    );
  }
}
