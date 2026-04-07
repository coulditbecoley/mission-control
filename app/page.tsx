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
    <main style={{ padding: "2rem" }}>
      <h1>⚡ Mission Control</h1>
      <p style={{ marginBottom: "2rem", opacity: 0.7 }}>
        OpenClaw Gateway Control Center
      </p>

      {loading ? (
        <p>Loading...</p>
      ) : status ? (
        <div style={{ maxWidth: "800px" }}>
          <h2>Gateway Status</h2>
          <pre
            style={{
              background: "#f0f0f0",
              padding: "1rem",
              borderRadius: "8px",
              overflow: "auto",
              marginTop: "1rem",
            }}
          >
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
      ) : (
        <p style={{ color: "red" }}>Failed to connect to OpenClaw Gateway</p>
      )}
    </main>
  );
}
