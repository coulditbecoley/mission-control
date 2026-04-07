"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error("Failed to fetch status", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>⚡ Mission Control</h1>
      <p style={{ marginBottom: "2rem", opacity: 0.7 }}>
        OpenClaw Gateway Control Center
      </p>

      {loading ? (
        <p>Loading...</p>
      ) : status && !status.error ? (
        <div style={{ maxWidth: "800px" }}>
          <h2>✓ Gateway Status</h2>
          <pre
            style={{
              background: "#f0f0f0",
              padding: "1rem",
              borderRadius: "8px",
              overflow: "auto",
              marginTop: "1rem",
              fontSize: "0.9rem",
              color: "#333",
            }}
          >
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
      ) : (
        <div style={{ maxWidth: "600px", color: "#c33" }}>
          <h2>✗ Connection Failed</h2>
          <pre
            style={{
              background: "#fee",
              padding: "1rem",
              borderRadius: "8px",
              overflow: "auto",
              fontSize: "0.9rem",
              border: "1px solid #fcc",
            }}
          >
            {JSON.stringify(status, null, 2)}
          </pre>
          <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
            <strong>Troubleshooting:</strong><br/>
            1. Verify OPENCLAW_GATEWAY_URL is set correctly<br/>
            2. Check OPENCLAW_TOKEN is valid<br/>
            3. Ensure gateway is accessible from this container<br/>
            4. Check docker logs: <code>docker logs mission-control</code>
          </p>
        </div>
      )}
    </main>
  );
}
