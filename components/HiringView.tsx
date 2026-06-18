import React from "react";
import { Employee, num, pct } from "./MockHRData";

interface HiringViewProps {
  employees: Employee[];
  searchQuery: string;
}

export default function HiringView({ employees, searchQuery }: HiringViewProps) {
  const COLORS = [
    "#1a7a4a",
    "#2d9e62",
    "#0d9488",
    "#2563eb",
    "#7c3aed",
    "#ea580c",
    "#f59e0b",
    "#6366f1",
    "#dc2626",
    "#9ca3af",
  ];

  const filtered = employees.filter((emp) =>
    searchQuery
      ? (emp["Employee Name"] || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp["Function"] || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp["Designation"] || "").toString().toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const total = filtered.length;

  // Tenure buckets mapping
  const tenureBuckets = [
    [0, 2, "0–2 yrs", "#dc2626", "#fee2e2", "#991b1b"],
    [2, 5, "2–5 yrs", "#f59e0b", "#fef3c7", "#92400e"],
    [5, 10, "5–10 yrs", "#2563eb", "#dbeafe", "#1e40af"],
    [10, 15, "10–15 yrs", "#0d9488", "#ccfbf1", "#134e4a"],
    [15, 20, "15–20 yrs", "#7c3aed", "#ede9fe", "#5b21b6"],
    [20, 999, "20+ yrs", "#1a7a4a", "#d1fae5", "#065f46"],
  ] as const;

  const tenureCounts = tenureBuckets.map(([lo, hi, lbl, col, bg, tc]) => {
    const count = filtered.filter((r) => {
      const t = num(r["Tenure"]);
      return t !== null && t >= lo && t < hi;
    }).length;
    return { name: lbl, count, color: col, bg, textColor: tc };
  });
  const maxTenureCount = Math.max(...tenureCounts.map((t) => t.count), 1);

  // Tenure insight: <5 years share
  const lt5Count = tenureCounts.slice(0, 2).reduce((acc, t) => acc + t.count, 0);

  // Joiners by Year (Last 6 Years)
  const allYears = filtered
    .map((r) => {
      const d = r["Group Date Of Joining"];
      if (!d) return null;
      // Handle Date object or string
      const dateVal = d instanceof Date ? d : new Date(d);
      return isNaN(dateVal.getTime()) ? null : dateVal.getFullYear();
    })
    .filter((v): v is number => v !== null);

  const currentYear = new Date().getFullYear();
  const recentYears: number[] = [];
  for (let y = currentYear - 5; y <= currentYear; y++) {
    recentYears.push(y);
  }

  const joinerByYear = recentYears.map((y) => {
    const count = allYears.filter((yr) => yr === y).length;
    return { year: y, count };
  });
  const maxJoinerCount = Math.max(...joinerByYear.map((j) => j.count), 1);

  // Joiner stats metrics
  const recent2yJoiners = joinerByYear.slice(-2).reduce((acc, j) => acc + j.count, 0);
  const mgmtTrainees = filtered.filter((r) =>
    (r["Designation"] || "").toString().toLowerCase().includes("management trainee")
  ).length;

  // Top States by Headcount
  const stateCounts: Record<string, number> = {};
  filtered.forEach((r) => {
    const l = (r["Location"] || "").toString().trim();
    const match = l.match(/^([A-Z]{2})/);
    if (match) {
      const state = match[1];
      stateCounts[state] = (stateCounts[state] || 0) + 1;
    }
  });
  const topStates = Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxStateCount = topStates.length ? topStates[0][1] : 1;

  return (
    <div className="g2" style={{ animation: "fadeIn 0.3s ease-in-out" }}>
      {/* Left Card: Tenure Distribution */}
      <div className="card">
        <div className="card-title">
          <div className="ci" style={{ background: "#e6f4ec", color: "var(--green)" }}>
            ⏳
          </div>{" "}
          Tenure Distribution
        </div>

        <div id="tenure-bars" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {tenureCounts.map((t) => (
            <div key={t.name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ fontSize: "11px", color: "var(--muted)", width: "68px", flexShrink: 0 }}>
                {t.name}
              </div>
              <div className="bar-track" style={{ flex: 1, height: "13px" }}>
                <div
                  className="bar-fill"
                  style={{
                    width: `${((t.count / maxTenureCount) * 100).toFixed(1)}%`,
                    background: t.color,
                    height: "100%",
                  }}
                ></div>
              </div>
              <div style={{ fontSize: "11px", fontWeight: 600, width: "28px", textAlign: "right" }}>
                {t.count}
              </div>
              <span className="chip" style={{ background: t.bg, color: t.textColor, fontSize: "10px" }}>
                {pct(t.count, total)}
              </span>
            </div>
          ))}
        </div>

        <div
          id="tenure-insight"
          style={{
            background: "var(--bg)",
            borderRadius: "7px",
            padding: "10px",
            marginTop: "16px",
            fontSize: "12px",
          }}
        >
          <strong>{pct(lt5Count, total)}</strong> of employees have &lt;5 years tenure —{" "}
          <span style={{ color: "var(--muted)" }}>active growth phase</span>
        </div>
      </div>

      {/* Right Card: New Joiners + Top States */}
      <div className="card">
        <div className="card-title">
          <div className="ci" style={{ background: "#dbeafe", color: "var(--blue)" }}>
            📈
          </div>{" "}
          New Joiners by Year (Last 6 Years)
        </div>

        {/* Vertical Chart */}
        <div className="vchart" id="joiner-chart" style={{ height: "120px", display: "flex", alignItems: "flex-end" }}>
          {joinerByYear.map((j) => {
            const isHighest = j.count === maxJoinerCount && j.count > 0;
            const barBg = isHighest ? "#1a7a4a" : "#60a5fa";
            return (
              <div key={j.year} className="vcol">
                <div className="vcol-val" style={{ color: barBg }}>
                  {j.count}
                </div>
                <div
                  className="vcol-fill"
                  style={{
                    height: `${Math.max(3, (j.count / maxJoinerCount) * 100).toFixed(1)}%`,
                    background: barBg,
                  }}
                ></div>
                <div className="vcol-lbl">{j.year}</div>
              </div>
            );
          })}
        </div>

        {/* Joiner Stats Indicators */}
        <div
          id="joiner-stats"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
            marginTop: "16px",
            borderTop: "1px solid var(--border)",
            paddingTop: "12px",
          }}
        >
          <div style={{ textAlign: "center", padding: "8px", background: "var(--bg)", borderRadius: "7px" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#1a7a4a" }}>{recent2yJoiners}</div>
            <div style={{ fontSize: "9px", color: "var(--muted)" }}>Joined in last 2 years</div>
          </div>
          <div style={{ textAlign: "center", padding: "8px", background: "var(--bg)", borderRadius: "7px" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#2563eb" }}>{pct(recent2yJoiners, total)}</div>
            <div style={{ fontSize: "9px", color: "var(--muted)" }}>of total workforce</div>
          </div>
          <div style={{ textAlign: "center", padding: "8px", background: "var(--bg)", borderRadius: "7px" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#f59e0b" }}>{mgmtTrainees}</div>
            <div style={{ fontSize: "9px", color: "var(--muted)" }}>Management Trainees</div>
          </div>
        </div>

        {/* Geographical Headcounts */}
        <div style={{ marginTop: "18px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>
            Top States by Headcount
          </div>
          <div id="state-bars" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {topStates.map(([s, c], i) => (
              <div key={s} className="bar-row">
                <div className="bar-lbl" style={{ width: "45px" }}>
                  {s}
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${((c / maxStateCount) * 100).toFixed(1)}%`,
                      background: COLORS[i % COLORS.length],
                    }}
                  ></div>
                </div>
                <div className="bar-val">{c}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
