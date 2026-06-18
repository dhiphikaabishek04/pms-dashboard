import React from "react";
import { Employee, num, pct } from "./MockHRData";

interface OverviewViewProps {
  employees: Employee[];
  searchQuery: string;
}

export default function OverviewView({ employees, searchQuery }: OverviewViewProps) {
  const filtered = employees.filter((emp) =>
    searchQuery
      ? (emp["Employee Name"] || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp["Function"] || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp["Designation"] || "").toString().toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const total = filtered.length;

  const tenures = filtered.map((r) => num(r["Tenure"])).filter((v): v is number => v !== null);
  const avgTenure = tenures.length
    ? (tenures.reduce((a, b) => a + b, 0) / tenures.length).toFixed(1)
    : "—";

  const incRows = filtered.filter((r) => num(r["Salary Increment %"]) !== null);
  const avgInc = incRows.length
    ? ((incRows.reduce((a, r) => a + (num(r["Salary Increment %"]) || 0), 0) / incRows.length) * 100).toFixed(1)
    : null;

  const funcCount = new Set(filtered.map((r) => r["Function"]).filter(Boolean)).size;

  const perfCols = ["Performance rating_2026", "Performance rating_2025", "Performance rating_2024"];
  const perfRows = filtered.filter((r) => perfCols.some((c) => num(r[c]) !== null));
  const ctcRows = filtered.filter((r) => num(r["Current CTC"]) !== null);

  const recentJoiners = filtered.filter((r) => {
    const d = r["Group Date Of Joining"];
    if (!d) return false;
    return new Date(d).getFullYear() >= 2024;
  }).length;

  const longestTenure = tenures.length ? Math.max(...tenures) : 0;
  const band6Count = filtered.filter((r) => num(r["Band"]) === 6).length;

  const alertParts: string[] = [];
  if (perfRows.length < total)
    alertParts.push(`Performance ratings available for ${perfRows.length} of ${total} employees — full PMS data entry needed`);
  if (ctcRows.length < total)
    alertParts.push(`CTC data available for ${ctcRows.length} of ${total} employees`);
  const alertText = alertParts.length
    ? alertParts.join("  ·  ")
    : "Dashboard loaded successfully — all data integrity constraints verified.";

  const kpiCards = [
    {
      icon: "👥",
      label: "PMS Eligible Headcount",
      value: total.toLocaleString(),
      unit: "",
      sub: "Across all functions",
      trend: "Active Workforce",
      trendClass: "up",
      accentColor: "rgba(99,102,241,0.12)",
      blobColor: "rgba(99,102,241,0.07)",
      borderAccent: "rgba(99,102,241,0.25)",
    },
    {
      icon: "⏱️",
      label: "Avg. Tenure",
      value: avgTenure,
      unit: "yrs",
      sub: `${tenures.filter((v) => v < 2).length} with <2 yrs  ·  ${tenures.filter((v) => v >= 20).length} with 20+ yrs`,
      trend: "Mixed Seniority",
      trendClass: "neutral",
      accentColor: "rgba(59,130,246,0.1)",
      blobColor: "rgba(59,130,246,0.07)",
      borderAccent: "rgba(59,130,246,0.25)",
    },
    {
      icon: "💸",
      label: "Salary Increment",
      value: avgInc !== null ? avgInc + "%" : "N/A",
      unit: "",
      sub: `${incRows.length} employees with increment data`,
      trend: incRows.length < total ? "Partial Data" : "Full Coverage",
      trendClass: incRows.length < total ? "warn" : "up",
      accentColor: "rgba(245,158,11,0.1)",
      blobColor: "rgba(245,158,11,0.07)",
      borderAccent: "rgba(245,158,11,0.25)",
    },
    {
      icon: "🏢",
      label: "Functions",
      value: String(funcCount),
      unit: "",
      sub: `Performance data: ${perfRows.length} of ${total} employees`,
      trend: "Multi-Function",
      trendClass: "vibe",
      accentColor: "rgba(139,92,246,0.1)",
      blobColor: "rgba(139,92,246,0.07)",
      borderAccent: "rgba(139,92,246,0.25)",
    },
  ];

  return (
    <div style={{ animation: "fadeIn 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
      {/* Alert Bar */}
      {alertParts.length > 0 && (
        <div className="alert-bar" style={{ marginBottom: "28px" }}>
          <span style={{ fontSize: "16px", flexShrink: 0 }}>⚠️</span>
          <span style={{ lineHeight: 1.5 }}>{alertText}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="g4" id="kpi-row">
        {kpiCards.map((k, i) => (
          <div
            key={k.label}
            className="kpi"
            style={
              {
                "--kpi-accent": k.borderAccent,
                "--kpi-blob": k.blobColor,
                "--kpi-icon-bg": k.accentColor,
                animationDelay: `${i * 60}ms`,
              } as React.CSSProperties
            }
          >
            {/* Corner decoration */}
            <div className="kpi-blob" />

            {/* Icon badge */}
            <div className="kpi-icon" style={{ background: k.accentColor }}>
              {k.icon}
            </div>

            <div className="kpi-lbl">{k.label}</div>

            <div className="kpi-val">
              {k.value}
              {k.unit && <span className="kpi-unit"> {k.unit}</span>}
            </div>

            <div className="kpi-sub">{k.sub}</div>

            <div className="kpi-footer">
              <span className={`kpi-trend ${k.trendClass}`}>
                {k.trendClass === "up" && "↑ "}
                {k.trendClass === "neutral" && "→ "}
                {k.trendClass === "warn" && "⚡ "}
                {k.trendClass === "vibe" && "✦ "}
                {k.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Executive AI Intelligence Summary */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-title">
          <div className="ci" style={{ background: "#eef2ff", color: "#6366f1" }}>💡</div>
          Executive AI Intelligence Summary
        </div>
        <div className="ai-insight">
          <div className="ai-title">Workforce Health Analysis</div>
          <div className="ai-text">
            Roster metrics demonstrate an average tenure profile of <strong>{avgTenure} years</strong>, with{" "}
            <strong>{tenures.filter((v) => v < 5).length}</strong> employees in their early integration years (&lt;5 years).
            Compensation structure audit shows an average annual increment of{" "}
            <strong>{avgInc !== null ? `${avgInc}%` : "N/A"}</strong>. Dynamic audit flags{" "}
            <strong>{perfRows.length < total ? "partial PMS coverage" : "complete PMS mapping"}</strong>.{" "}
            {recentJoiners > 0
              ? `There are ${recentJoiners} new hires registered since 2024, indicating active recruitment pipeline velocity.`
              : "No new hires have been added since 2024."}
          </div>
        </div>
      </div>

      {/* Key Workforce Highlights */}
      <div className="card">
        <div className="card-title">
          <div className="ci" style={{ background: "#fef9c3", color: "#b45309" }}>🏆</div>
          Key Workforce Highlights
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "14px",
            marginTop: "4px",
          }}
        >
          {[
            { value: recentJoiners, label: "Recent Hires (2024+)", color: "#6366f1", bg: "#eef2ff" },
            { value: funcCount, label: "Active Functions", color: "#06b6d4", bg: "#ecfeff" },
            { value: longestTenure > 0 ? `${longestTenure} yrs` : "—", label: "Longest Tenure", color: "#3b82f6", bg: "#eff6ff" },
            { value: pct(band6Count, total), label: "Band 6 Depth", color: "#8b5cf6", bg: "#faf5ff" },
          ].map((h) => (
            <div
              key={h.label}
              style={{
                textAlign: "center",
                padding: "18px 12px",
                background: h.bg,
                borderRadius: "12px",
                border: `1px solid ${h.color}18`,
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.transform = "")}
            >
              <div style={{ fontSize: "24px", fontWeight: 800, color: h.color, letterSpacing: "-0.5px" }}>
                {h.value}
              </div>
              <div style={{ fontSize: "11px", color: "var(--foreground-secondary)", marginTop: "4px", fontWeight: 500 }}>
                {h.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
