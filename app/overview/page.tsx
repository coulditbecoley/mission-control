"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Zap, CheckCircle2, BarChart3 } from "lucide-react";

interface OverviewData {
  taskProgress: number;
  projectProgress: number;
  portfolioValue: number;
  bitcoinPrice: number;
  taskCount: { total: number; completed: number };
  projectCount: { total: number; completed: number };
}

export default function Overview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
    const interval = setInterval(fetchOverviewData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  async function fetchOverviewData() {
    try {
      const res = await fetch("/api/overview");
      const overviewData = await res.json();
      setData(overviewData);
    } catch (err) {
      console.error("Failed to fetch overview", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main style={{ padding: "2rem" }}>
        <h1>Overview</h1>
        <p style={{ opacity: 0.7, marginTop: "1rem" }}>Loading...</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main style={{ padding: "2rem" }}>
        <h1>Overview</h1>
        <p style={{ color: "red", marginTop: "1rem" }}>Failed to load overview data</p>
      </main>
    );
  }

  const ProgressBar = ({ progress, label }: { progress: number; label: string }) => (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>{Math.round(progress)}%</span>
      </div>
      <div
        style={{
          width: "100%",
          height: "8px",
          background: "#e5e7eb",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );

  const StatCard = ({
    icon: Icon,
    label,
    value,
    change,
    color,
  }: {
    icon: any;
    label: string;
    value: string;
    change?: string;
    color: string;
  }) => (
    <div
      style={{
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "1.5rem",
        marginBottom: "1rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          <Icon size={20} />
        </div>
        <div>
          <p style={{ fontSize: "0.85rem", opacity: 0.7, margin: 0 }}>{label}</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>{value}</p>
        </div>
      </div>
      {change && (
        <p style={{ fontSize: "0.8rem", color: "#10b981", margin: 0 }}>
          <TrendingUp size={14} style={{ display: "inline", marginRight: "0.25rem" }} />
          {change}
        </p>
      )}
    </div>
  );

  return (
    <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>⚡ Overview</h1>
      <p style={{ opacity: 0.6, marginBottom: "2rem" }}>
        Real-time dashboard summary • {new Date().toLocaleString()}
      </p>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        <StatCard
          icon={BarChart3}
          label="Portfolio Value"
          value={`$${data.portfolioValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          change="+2.4% today"
          color="#3b82f6"
        />
        <StatCard
          icon={TrendingUp}
          label="Bitcoin Price"
          value={`$${data.bitcoinPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          change="+1.2% 24h"
          color="#f59e0b"
        />
        <StatCard
          icon={CheckCircle2}
          label="Task Completion"
          value={`${data.taskCount.completed}/${data.taskCount.total}`}
          change={`${Math.round((data.taskCount.completed / data.taskCount.total) * 100)}% done`}
          color="#10b981"
        />
        <StatCard
          icon={Zap}
          label="Project Progress"
          value={`${data.projectCount.completed}/${data.projectCount.total}`}
          change={`${Math.round((data.projectCount.completed / data.projectCount.total) * 100)}% active`}
          color="#8b5cf6"
        />
      </div>

      {/* Progress Bars */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "2rem" }}>
        <h2 style={{ marginTop: 0, marginBottom: "2rem" }}>Progress</h2>
        <ProgressBar progress={data.taskProgress} label="Tasks Completed" />
        <ProgressBar progress={data.projectProgress} label="Projects Active" />
      </div>

      {/* Quick Stats */}
      <div style={{ marginTop: "2rem", padding: "1.5rem", background: "#f0f9ff", borderRadius: "12px", border: "1px solid #e0f2fe" }}>
        <h3 style={{ marginTop: 0 }}>📊 Quick Stats</h3>
        <ul style={{ opacity: 0.8, lineHeight: 1.8 }}>
          <li>Tasks: {data.taskCount.completed}/{data.taskCount.total} completed</li>
          <li>Projects: {data.projectCount.completed}/{data.projectCount.total} in progress</li>
          <li>Portfolio: ${data.portfolioValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</li>
          <li>BTC: ${data.bitcoinPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}</li>
        </ul>
      </div>
    </main>
  );
}
