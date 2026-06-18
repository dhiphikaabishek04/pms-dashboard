import React from "react";
import { Employee, num, pct } from "./MockHRData";

interface LeadershipViewProps {
  employees: Employee[];
  searchQuery: string;
}

export default function LeadershipView({ employees, searchQuery }: LeadershipViewProps) {
  const HOD_COLORS = ["#1a7a4a", "#2563eb", "#7c3aed", "#0d9488", "#ea580c", "#6366f1", "#f59e0b", "#dc2626"];

  const filtered = employees.filter((emp) =>
    searchQuery
      ? (emp["Employee Name"] || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp["Function"] || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp["Designation"] || "").toString().toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const total = filtered.length;

  const getCountBy = (col: string) => {
    const m: Record<string, number> = {};
    filtered.forEach((r) => {
      const v = r[col];
      if (v !== null && v !== undefined && v !== "") {
        m[v] = (m[v] || 0) + 1;
      }
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  };

  const hods2 = getCountBy("Function HOD Name").slice(0, 8);

  const recentJoiners = filtered.filter((r) => {
    const d = r["Group Date Of Joining"];
    if (!d) return false;
    const y = new Date(d).getFullYear();
    return y >= 2024;
  }).length;

  const funcCount = new Set(filtered.map((r) => r["Function"]).filter(Boolean)).size;

  const tenures = filtered.map((r) => num(r["Tenure"])).filter((v): v is number => v !== null);
  const longestTenure = tenures.length ? Math.max(...tenures) : 0;

  const band6Count = filtered.filter((r) => num(r["Band"]) === 6).length;

  const perfCols = ["Performance rating_2026", "Performance rating_2025", "Performance rating_2024"];
  const perfRows = filtered.filter((r) => perfCols.some((c) => num(r[c]) !== null));

  // Priorities items logic
  const priorities: Array<{ color: string; bg: string; title: string; desc: string }> = [];
  if (perfRows.length < total) {
    priorities.push({
      color: "#1a7a4a",
      bg: "#f0fdf4",
      title: "Complete PMS Data Coverage",
      desc: `Fill performance ratings & CTC for all ${total} employees`,
    });
  }
  if (recentJoiners > 20) {
    priorities.push({
      color: "#2563eb",
      bg: "#eff6ff",
      title: "Onboard Recent Joiners",
      desc: `Structure onboarding tracks for ${recentJoiners} recent hires`,
    });
  }
  priorities.push({
    color: "#f59e0b",
    bg: "#fffbeb",
    title: "Governance on Promotions",
    desc: "Link PMS ratings to promotion pipeline and salary review cycles",
  });
  priorities.push({
    color: "#7c3aed",
    bg: "#fdf4ff",
    title: "Talent Pipeline Stability",
    desc: "Build succession and cross-training plans for dominant functions",
  });

  return (
    <div className="g35" style={{ animation: "fadeIn 0.3s ease-in-out" }}>
      {/* Left Column: HOD List */}
      <div className="card">
        <div className="card-title">
          <div className="ci" style={{ background: "#e0e7ff", color: "#3730a3" }}>
            👤
          </div>{" "}
          Function HOD Coverage
        </div>

        <div id="hod-list" style={{ display: "flex", flexDirection: "column" }}>
          {hods2.map(([h, c], i) => {
            const initials = h
              .trim()
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase();
            return (
              <div key={h} className="hod-row">
                <div className="hod-av" style={{ background: HOD_COLORS[i % HOD_COLORS.length] }}>
                  {initials || "H"}
                </div>
                <div className="hod-name">{h.trim().split(/\s+/).slice(0, 3).join(" ")}</div>
                <span
                  className="chip"
                  style={{
                    background: [
                      "#d1fae5",
                      "#dbeafe",
                      "#ede9fe",
                      "#ccfbf1",
                      "#ffedd5",
                      "#e0e7ff",
                      "#fef3c7",
                      "#fee2e2",
                    ][i % 8],
                    color: [
                      "#065f46",
                      "#1e40af",
                      "#5b21b6",
                      "#134e4a",
                      "#9a3412",
                      "#3730a3",
                      "#92400e",
                      "#991b1b",
                    ][i % 8],
                  }}
                >
                  {c}
                </span>
              </div>
            );
          })}

          {hods2.length > 0 && (
            <div style={{ marginTop: "12px", fontSize: "10px", color: "var(--muted)" }}>
              {hods2[0][0].split(/\s+/).slice(0, 2).join(" ")} covers{" "}
              <strong style={{ color: "var(--text)" }}>{pct(hods2[0][1], total)}</strong> of total workforce
            </div>
          )}

          {hods2.length === 0 && (
            <div style={{ color: "var(--foreground-muted)", fontSize: "12px", textAlign: "center", padding: "24px 0" }}>
              No HOD records found.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Highlights + Priorities */}
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Wins Grid */}
        <div className="card">
          <div className="card-title">
            <div className="ci" style={{ background: "#d1fae5", color: "var(--green)" }}>
              🏆
            </div>{" "}
            Workforce Highlights
          </div>

          <div
            id="wins-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <div style={{ textAlign: "center", padding: "8px", background: "var(--bg)", borderRadius: "7px" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#1a7a4a" }}>{recentJoiners}</div>
              <div style={{ fontSize: "10px", color: "var(--muted)" }}>Recent Hires (2024+)</div>
            </div>
            <div style={{ textAlign: "center", padding: "8px", background: "var(--bg)", borderRadius: "7px" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#0d9488" }}>{funcCount}</div>
              <div style={{ fontSize: "10px", color: "var(--muted)" }}>Active Functions</div>
            </div>
            <div style={{ textAlign: "center", padding: "8px", background: "var(--bg)", borderRadius: "7px" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#2563eb" }}>
                {longestTenure > 0 ? `${longestTenure} yrs` : "—"}
              </div>
              <div style={{ fontSize: "10px", color: "var(--muted)" }}>Longest Tenure</div>
            </div>
            <div style={{ textAlign: "center", padding: "8px", background: "var(--bg)", borderRadius: "7px" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#7c3aed" }}>
                {pct(band6Count, total)}
              </div>
              <div style={{ fontSize: "10px", color: "var(--muted)" }}>Band 6 Depth</div>
            </div>
          </div>
        </div>

        {/* Priority checklist */}
        <div className="card">
          <div className="card-title">
            <div className="ci" style={{ background: "#fef3c7", color: "var(--amber)" }}>
              📅
            </div>{" "}
            FY27 Priority Agenda
          </div>

          <div id="priorities">
            {priorities.map((p, idx) => (
              <div
                key={idx}
                className="p-item"
                style={{
                  background: p.bg,
                  borderLeft: `3px solid ${p.color}`,
                  marginBottom: "7px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "9px",
                  padding: "8px",
                  borderRadius: "8px",
                }}
              >
                <div className="p-num" style={{ color: p.color, fontWeight: 700, fontSize: "12px", width: "18px" }}>
                  0{idx + 1}
                </div>
                <div>
                  <div className="p-title" style={{ fontSize: "11px", fontWeight: 600 }}>
                    {p.title}
                  </div>
                  <div className="p-desc" style={{ fontSize: "10px", color: "var(--muted)", marginTop: "1px" }}>
                    {p.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
