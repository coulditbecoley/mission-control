import { NextResponse } from "next/server";

export async function GET() {
  try {
    const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:8787";
    const token = process.env.OPENCLAW_TOKEN;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${gatewayUrl}/status`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Gateway returned ${res.status}` },
        { status: res.status }
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
