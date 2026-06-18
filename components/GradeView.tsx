import React from "react";
import { Employee, pct, num } from "./MockHRData";

interface GradeViewProps {
  employees: Employee[];
  searchQuery: string;
}

export default function GradeView({ employees, searchQuery }: GradeViewProps) {
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

  // Designation counts
  const desigs = getCountBy("Designation").slice(0, 10);
  const maxDesigCount = desigs.length ? desigs[0][1] : 1;

  // Grade split counts
  const grades = getCountBy("Grade").slice(0, 10);
  const maxGradeCount = grades.length ? grades[0][1] : 1;

  // Organization Hierarchy Distribution Mapping
  const hierarchyMapping: Record<string, string> = {
    // Top Management
    "managing director": "Top Management",
    "dir": "Top Management",
    "chief executive officer": "Top Management",
    "ceo": "Top Management",
    "chief financial officer": "Top Management",
    "cfo": "Top Management",
    "chief sales officer": "Top Management",
    "cso": "Top Management",
    "chief operating officer": "Top Management",
    "coo": "Top Management",
    "chief business officer": "Top Management",
    "cbo": "Top Management",
    "chief marketing officer": "Top Management",
    "mkth": "Top Management",
    "chief information officer": "Top Management",
    "cio": "Top Management",
    "chief technology officer": "Top Management",
    "cto": "Top Management",
    "president": "Top Management",
    "pre": "Top Management",

    // Leadership Team
    "executive vice president": "Leadership Team",
    "evp": "Leadership Team",
    "senior vice president": "Leadership Team",
    "svp": "Leadership Team",
    "vice president": "Leadership Team",
    "vp": "Leadership Team",
    "associate vice president": "Leadership Team",
    "avp": "Leadership Team",
    "senior general manager": "Leadership Team",
    "sgm": "Leadership Team",
    "slp head": "Leadership Team",
    "slph": "Leadership Team",
    "general manager": "Leadership Team",
    "gm": "Leadership Team",
    "marketing head": "Leadership Team",
    "mh": "Leadership Team",
    "deputy general manager": "Leadership Team",
    "dgm": "Leadership Team",

    // Senior Management
    "assistant general manager": "Senior Management",
    "agm": "Senior Management",
    "regional operation manager": "Senior Management",
    "rom": "Senior Management",
    "regional manager": "Senior Management",
    "rm": "Senior Management",
    "senior manager": "Senior Management",
    "sm": "Senior Management",
    "company secretary": "Senior Management",
    "cmp": "Senior Management",

    // Middle Management
    "state head": "Middle Management",
    "sh": "Middle Management",
    "zonal manager": "Middle Management",
    "zm": "Middle Management",
    "manager": "Middle Management",
    "mgr": "Middle Management",
    "cluster head": "Middle Management",
    "ch": "Middle Management",
    "dc head": "Middle Management",
    "dch": "Middle Management",

    // Junior Management
    "assistant manager": "Junior Management",
    "am": "Junior Management",
    "senior programmer": "Junior Management",
    "sprg": "Junior Management",
    "dc incharge": "Junior Management",
    "dcin": "Junior Management",
    "executive secretary": "Junior Management",
    "exesecrt": "Junior Management",
    "senior executive": "Junior Management",
    "sre": "Junior Management",

    // Junior Cadre
    "executive": "Junior Cadre",
    "exe": "Junior Cadre",
    "programmer": "Junior Cadre",
    "prg": "Junior Cadre",
    "marketing coordinator": "Junior Cadre",
    "mco": "Junior Cadre",
    "sales coordinator": "Junior Cadre",
    "sco": "Junior Cadre",
    "assistant": "Junior Cadre",
    "asi": "Junior Cadre",
    "graduate trainee": "Junior Cadre",
    "gt": "Junior Cadre",
    "management trainee": "Junior Cadre",
    "mt": "Junior Cadre"
  };

  const hierarchyOrder = [
    "Top Management",
    "Leadership Team",
    "Senior Management",
    "Middle Management",
    "Junior Management",
    "Junior Cadre",
    "Uncategorized"
  ];

  const hierarchyCounts: Record<string, number> = {};
  hierarchyOrder.forEach(h => hierarchyCounts[h] = 0);

  filtered.forEach(emp => {
    const desig = emp["Designation"]?.toString().trim().toLowerCase() || "";
    const hierarchy = hierarchyMapping[desig] || "Uncategorized";
    hierarchyCounts[hierarchy] += 1;
  });

  const hierarchyData = hierarchyOrder
    .map(level => ({ level, count: hierarchyCounts[level] }))
    .filter(item => item.count > 0 || item.level !== "Uncategorized"); // Only show uncategorized if it has items

  const maxHierarchyCount = Math.max(...hierarchyData.map(h => h.count), 1);
  const midAndJunCount = hierarchyCounts["Middle Management"] + hierarchyCounts["Junior Management"];
  const midAndJunShare = total > 0 ? ((midAndJunCount / total) * 100).toFixed(1) : "0";

  // Section 3: Average Current CTC by Hierarchy
  const hierarchyCTC: Record<string, number[]> = {};
  hierarchyOrder.forEach(h => hierarchyCTC[h] = []);

  filtered.forEach(emp => {
    const desig = emp["Designation"]?.toString().trim().toLowerCase() || "";
    const hierarchy = hierarchyMapping[desig] || "Uncategorized";
    const ctc = num(emp["Current CTC"]);
    if (ctc !== null && ctc > 0) {
      hierarchyCTC[hierarchy].push(ctc);
    }
  });

  const avgCTCData = hierarchyOrder
    .map(level => {
      const arr = hierarchyCTC[level];
      const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      return { level, avg, count: arr.length };
    })
    .filter(item => item.count > 0 || item.level !== "Uncategorized")
    .sort((a, b) => b.avg - a.avg);

  const maxAvgCTC = avgCTCData.length ? Math.max(...avgCTCData.map(h => h.avg), 1) : 1;

  // Section 5: Promotion Readiness by Hierarchy
  const promoDataByHierarchy: Record<string, { total: number; eligible: number }> = {};
  hierarchyOrder.forEach(h => promoDataByHierarchy[h] = { total: 0, eligible: 0 });

  filtered.forEach(emp => {
    const desig = emp["Designation"]?.toString().trim().toLowerCase() || "";
    const hierarchy = hierarchyMapping[desig] || "Uncategorized";
    const isEligible = (emp["PROMOTION ELIGIBILITY FOR CURRENT YEAR ("] || "").toString().trim().toLowerCase() === "yes";

    promoDataByHierarchy[hierarchy].total += 1;
    if (isEligible) {
      promoDataByHierarchy[hierarchy].eligible += 1;
    }
  });

  const promoReadinessData = hierarchyOrder
    .map(level => {
      const { total, eligible } = promoDataByHierarchy[level];
      const eligiblePct = total > 0 ? (eligible / total) * 100 : 0;
      return { level, total, eligible, eligiblePct };
    })
    .filter(item => item.total > 0 || item.level !== "Uncategorized")
    .sort((a, b) => b.eligible - a.eligible);

  const maxEligible = promoReadinessData.length ? Math.max(...promoReadinessData.map(h => h.eligible), 1) : 1;
  const topPromoPipeline = promoReadinessData.length > 0 && promoReadinessData[0].eligible > 0 ? promoReadinessData[0] : null;

  return (
    <div style={{ animation: "fadeIn 0.3s ease-in-out" }}>
      {/* Section 1: Organization Hierarchy Distribution */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-title">
          <div className="ci" style={{ background: "#eef2ff", color: "#6366f1" }}>
            🏛️
          </div>{" "}
          Organization Hierarchy Distribution
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
          {hierarchyData.map((h, idx) => (
            <div key={h.level} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "160px", fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>
                {h.level}
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="bar-track" style={{ height: "16px", flex: 1, background: "#f1f5f9", borderRadius: "8px", overflow: "hidden" }}>
                  <div
                    className="bar-fill"
                    style={{
                      width: `${((h.count / maxHierarchyCount) * 100).toFixed(1)}%`,
                      background: COLORS[idx % COLORS.length],
                      height: "100%",
                      borderRadius: "8px"
                    }}
                  ></div>
                </div>
                <div style={{ width: "60px", textAlign: "right", fontSize: "13px", fontWeight: 700 }}>
                  {h.count}
                </div>
                <div style={{ width: "50px", textAlign: "right", fontSize: "12px", color: "var(--muted)" }}>
                  {pct(h.count, total)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Executive Insight for Hierarchy */}
        <div style={{ marginTop: "24px", padding: "16px", background: "#f0fdfa", borderRadius: "8px", border: "1px solid #ccfbf1", display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <div style={{ fontSize: "20px" }}>💡</div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#0f766e", marginBottom: "4px" }}>Executive Insight</div>
            <div style={{ fontSize: "13px", color: "#115e59", lineHeight: 1.5 }}>
              Middle Management and Junior Management account for {midAndJunShare}% of the workforce, indicating a strong operational workforce structure.
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Leadership Layer Analysis */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-title">
          <div className="ci" style={{ background: "#fef2f2", color: "#dc2626" }}>
            👑
          </div>{" "}
          Leadership Layer Analysis
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginTop: "16px" }}>
          <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#1e293b" }}>{hierarchyCounts["Top Management"] + hierarchyCounts["Leadership Team"] + hierarchyCounts["Senior Management"]}</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Total Leadership Employees</div>
          </div>
          <div style={{ padding: "16px", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#15803d" }}>{total > 0 ? (((hierarchyCounts["Leadership Team"] + hierarchyCounts["Senior Management"]) / total) * 100).toFixed(1) : "0"}%</div>
            <div style={{ fontSize: "12px", color: "#166534", marginTop: "4px" }}>Leadership Strength %</div>
          </div>
          <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#ea580c" }}>{(hierarchyCounts["Leadership Team"] + hierarchyCounts["Senior Management"]) > 0 ? `1 : ${(total / (hierarchyCounts["Leadership Team"] + hierarchyCounts["Senior Management"])).toFixed(1)}` : "N/A"}</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Leadership-to-Workforce Ratio</div>
          </div>
        </div>
      </div>

      {/* Section 3: Average Current CTC by Hierarchy */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-title">
          <div className="ci" style={{ background: "#fdf4ff", color: "#c026d3" }}>
            💰
          </div>{" "}
          Average Current CTC by Hierarchy
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
          {avgCTCData.map((h, idx) => (
            <div key={h.level} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "160px", fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>
                {h.level}
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="bar-track" style={{ height: "16px", flex: 1, background: "#f1f5f9", borderRadius: "8px", overflow: "hidden" }}>
                  <div
                    className="bar-fill"
                    style={{
                      width: `${((h.avg / maxAvgCTC) * 100).toFixed(1)}%`,
                      background: COLORS[idx % COLORS.length],
                      height: "100%",
                      borderRadius: "8px"
                    }}
                  ></div>
                </div>
                <div style={{ width: "80px", textAlign: "right", fontSize: "13px", fontWeight: 700 }}>
                  {h.avg > 0 ? `₹${(h.avg / 100000).toFixed(1)}L` : "—"}
                </div>
              </div>
            </div>
          ))}
          {avgCTCData.length === 0 && <div style={{ fontSize: "12px", color: "var(--muted)" }}>No CTC data available for hierarchy analysis.</div>}
        </div>
      </div>

      {/* Section 5: Promotion Readiness by Hierarchy */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-title">
          <div className="ci" style={{ background: "#fffbeb", color: "#d97706" }}>
            🚀
          </div>{" "}
          Promotion Readiness by Hierarchy
        </div>

        {topPromoPipeline && (
          <div style={{ padding: "12px 16px", background: "#fef3c7", borderRadius: "8px", border: "1px solid #fde68a", marginBottom: "16px", display: "inline-block" }}>
            <span style={{ fontSize: "16px", marginRight: "8px" }}>🔥</span>
            <span style={{ fontSize: "13px", color: "#92400e", fontWeight: 600 }}>Largest Pipeline: </span>
            <span style={{ fontSize: "13px", color: "#b45309", fontWeight: 700 }}>{topPromoPipeline.level}</span>
            <span style={{ fontSize: "12px", color: "#b45309", marginLeft: "6px" }}>({topPromoPipeline.eligible} eligible)</span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {promoReadinessData.map((h, idx) => (
            <div key={h.level} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "160px", fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>
                {h.level}
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="bar-track" style={{ height: "16px", flex: 1, background: "#f1f5f9", borderRadius: "8px", overflow: "hidden" }}>
                  <div
                    className="bar-fill"
                    style={{
                      width: `${((h.eligible / maxEligible) * 100).toFixed(1)}%`,
                      background: h === topPromoPipeline ? "#f59e0b" : COLORS[idx % COLORS.length],
                      height: "100%",
                      borderRadius: "8px"
                    }}
                  ></div>
                </div>
                <div style={{ width: "80px", textAlign: "right", fontSize: "13px", fontWeight: 700 }}>
                  {h.eligible} <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--muted)" }}>eligible</span>
                </div>
                <div style={{ width: "60px", textAlign: "right", fontSize: "12px", color: "var(--muted)" }}>
                  {h.eligiblePct.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
          {promoReadinessData.length === 0 && <div style={{ fontSize: "12px", color: "var(--muted)" }}>No promotion data available.</div>}
        </div>
      </div>

      <div className="g3">
        {/* Designation Table card (takes 2/3 width) */}
        <div className="card" style={{ gridColumn: "span 2" }}>
          <div className="card-title">
            <div className="ci" style={{ background: "#fef3c7", color: "var(--amber)" }}>
              💼
            </div>{" "}
            Designation Distribution
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "8px", textAlign: "left" }}>Designation</th>
                <th style={{ padding: "8px", textAlign: "left" }}>Count</th>
                <th style={{ padding: "8px", textAlign: "left" }}>Share</th>
                <th style={{ padding: "8px", textAlign: "left", width: "110px" }}>Bar</th>
              </tr>
            </thead>
            <tbody>
              {desigs.map(([d, c], i) => (
                <tr key={d} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px" }}>
                    <strong>{d}</strong>
                  </td>
                  <td style={{ padding: "8px" }}>
                    <strong>{c}</strong>
                  </td>
                  <td style={{ padding: "8px" }}>
                    <span
                      className="chip"
                      style={{
                        background: i < 3 ? "#d1fae5" : "#dbeafe",
                        color: i < 3 ? "#065f46" : "#1e40af",
                        fontSize: "10px",
                      }}
                    >
                      {pct(c, total)}
                    </span>
                  </td>
                  <td style={{ padding: "8px" }}>
                    <div className="bar-track" style={{ height: "6px" }}>
                      <div
                        className="bar-fill"
                        style={{
                          width: `${((c / maxDesigCount) * 100).toFixed(1)}%`,
                          background: COLORS[i % COLORS.length],
                          height: "100%",
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
              {desigs.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "24px 0", color: "var(--foreground-muted)" }}>
                    No designation records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Grade split card (takes 1/3 width) */}
        <div className="card">
          <div className="card-title">
            <div className="ci" style={{ background: "#ccfbf1", color: "var(--teal)" }}>
              📊
            </div>{" "}
            Grade Split
          </div>

          <div id="grade-bars" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {grades.map(([lbl, cnt], i) => (
              <div key={lbl} className="bar-row">
                <div className="bar-lbl" style={{ width: "40px" }}>
                  {lbl}
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${((cnt / maxGradeCount) * 100).toFixed(1)}%`,
                      background: COLORS[i % COLORS.length],
                    }}
                  ></div>
                </div>
                <div className="bar-val">{cnt}</div>
              </div>
            ))}
            {grades.length === 0 && (
              <div style={{ color: "var(--foreground-muted)", fontSize: "12px", textAlign: "center", padding: "24px 0" }}>
                No grade distribution records found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
