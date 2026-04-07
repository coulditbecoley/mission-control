import { NextResponse } from "next/server";

export async function GET() {
  try {
    let gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || "wss://openclaw-ke4f.srv1566532.hstgr.cloud";
    const token = process.env.OPENCLAW_GATEWAY_TOKEN;

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
      headers["Authorization"] = `Bearer ${token}`;
      console.log("Token passed in Authorization header");
    } else {
      console.log("WARNING: No OPENCLAW_GATEWAY_TOKEN found in environment");
    }

    console.log("Gateway URL:", gatewayUrl);
    console.log("Headers:", { ...headers, Authorization: headers.Authorization ? "***" : "missing" });

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
      gatewayTokenPresent: !!token,
      environment: {
        OPENCLAW_GATEWAY_URL: !!process.env.OPENCLAW_GATEWAY_URL,
        OPENCLAW_GATEWAY_TOKEN: !!process.env.OPENCLAW_GATEWAY_TOKEN,
      }
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
