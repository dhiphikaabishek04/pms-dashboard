"use client";
import React, { useState } from "react";
import { Employee, num, pct } from "./MockHRData";

interface AIInsightsViewProps {
  employees: Employee[];
  searchQuery: string;
}

/* ─────────────────────────────────────────────
   Hierarchy mapping (mirrors GradeView)
───────────────────────────────────────────── */
const HIERARCHY_MAPPING: Record<string, string> = {
  "Managing Director": "Top Management",
  "Chief Executive Officer": "Top Management",
  "Chief Financial Officer": "Top Management",
  "Chief Sales Officer": "Top Management",
  "Chief Operating Officer": "Top Management",
  "Chief Business Officer": "Top Management",
  "Chief Marketing Officer": "Top Management",
  "Chief Information Officer": "Top Management",
  "Chief Technology Officer": "Top Management",
  President: "Top Management",
  "Executive Vice President": "Leadership Team",
  "Senior Vice President": "Leadership Team",
  "Vice President": "Leadership Team",
  "Associate Vice President": "Leadership Team",
  "Senior General Manager": "Leadership Team",
  "SLP Head": "Leadership Team",
  "General Manager": "Leadership Team",
  "Marketing Head": "Leadership Team",
  "Deputy General Manager": "Leadership Team",
  "Assistant General Manager": "Senior Management",
  "Regional Operation Manager": "Senior Management",
  "Regional Manager": "Senior Management",
  "Senior Manager": "Senior Management",
  "Company Secretary": "Senior Management",
  "State Head": "Middle Management",
  "Zonal Manager": "Middle Management",
  Manager: "Middle Management",
  "Cluster Head": "Middle Management",
  "DC Head": "Middle Management",
  "Assistant Manager": "Junior Management",
  "Senior Programmer": "Junior Management",
  "DC Incharge": "Junior Management",
  "Executive Secretary": "Junior Management",
  "Senior Executive": "Junior Management",
  Executive: "Junior Cadre",
  Programmer: "Junior Cadre",
  "Marketing Coordinator": "Junior Cadre",
  "Sales Coordinator": "Junior Cadre",
  Assistant: "Junior Cadre",
  "Graduate Trainee": "Junior Cadre",
  "Management Trainee": "Junior Cadre",
};

const HIERARCHY_ORDER = [
  "Top Management",
  "Leadership Team",
  "Senior Management",
  "Middle Management",
  "Junior Management",
  "Junior Cadre",
  "Uncategorized",
];

/* ─────────────────────────────────────────────
   Severity Badge
───────────────────────────────────────────── */
type Severity = "critical" | "warning" | "good" | "info";

const SEV: Record<Severity, { bg: string; text: string; dot: string; label: string }> = {
  critical: { bg: "#fef2f2", text: "#991b1b", dot: "#dc2626", label: "Critical" },
  warning:  { bg: "#fffbeb", text: "#92400e", dot: "#f59e0b", label: "Attention" },
  good:     { bg: "#f0fdf4", text: "#065f46", dot: "#10b981", label: "Healthy" },
  info:     { bg: "#eff6ff", text: "#1e40af", dot: "#3b82f6", label: "Insight" },
};

function SeverityBadge({ sev }: { sev: Severity }) {
  const s = SEV[sev];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 999,
        background: s.bg,
        color: s.text,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.3,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.dot,
          display: "inline-block",
        }}
      />
      {s.label}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Insight Card
───────────────────────────────────────────── */
interface InsightCardProps {
  emoji: string;
  title: string;
  sev: Severity;
  summary: string;
  metrics: { label: string; value: string | number; color?: string }[];
  detail: React.ReactNode;
  accentColor: string;
  id: string;
}

function InsightCard({
  emoji, title, sev, summary, metrics, detail, accentColor, id,
}: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      id={id}
      style={{
        background: "#fff",
        border: `1px solid ${accentColor}28`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 8px 28px rgba(15,23,42,0.09)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 2px 12px rgba(15,23,42,0.04)";
        (e.currentTarget as HTMLDivElement).style.transform = "";
      }}
    >
      {/* Accent top strip */}
      <div
        style={{ height: 4, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }}
      />

      {/* Header */}
      <div style={{ padding: "20px 24px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: `${accentColor}14`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              {emoji}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>
                {title}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{summary}</div>
            </div>
          </div>
          <SeverityBadge sev={sev} />
        </div>

        {/* Metric Pills */}
        {metrics.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            {metrics.map((m) => (
              <div
                key={m.label}
                style={{
                  padding: "8px 14px",
                  background: "#f8fafc",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: m.color || accentColor,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {m.value}
                </div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1, fontWeight: 600 }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expandable Detail */}
      <div
        style={{
          borderTop: `1px solid ${accentColor}18`,
          background: `${accentColor}06`,
          padding: expanded ? "16px 24px 20px" : "0 24px",
          maxHeight: expanded ? 9999 : 0,
          overflow: "hidden",
          transition: "max-height 0.4s cubic-bezier(0.16,1,0.3,1), padding 0.3s ease",
        }}
      >
        {detail}
      </div>

      {/* Toggle */}
      <button
        onClick={() => setExpanded((p) => !p)}
        style={{
          width: "100%",
          padding: "10px 24px",
          background: "transparent",
          border: "none",
          borderTop: `1px solid ${accentColor}14`,
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 600,
          color: accentColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontFamily: "inherit",
          transition: "background 0.15s ease",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = `${accentColor}08`)
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
        }
      >
        {expanded ? "▲ Collapse" : "▼ View Deep Analysis"}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function AIInsightsView({ employees, searchQuery }: AIInsightsViewProps) {
  const filtered = employees.filter((emp) =>
    searchQuery
      ? (emp["Employee Name"] || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp["Function"] || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp["Designation"] || "").toString().toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const total = filtered.length;
  if (total === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 48, color: "var(--muted)" }}>
        No employee data to analyse.
      </div>
    );
  }

  /* ── 1. Workforce Hierarchy Composition ──────────────────── */
  const hierarchyCounts: Record<string, number> = {};
  HIERARCHY_ORDER.forEach((h) => (hierarchyCounts[h] = 0));
  filtered.forEach((emp) => {
    const desig = emp["Designation"]?.toString().trim() || "";
    hierarchyCounts[HIERARCHY_MAPPING[desig] || "Uncategorized"] += 1;
  });

  const topMgmt =
    hierarchyCounts["Top Management"] +
    hierarchyCounts["Leadership Team"] +
    hierarchyCounts["Senior Management"];
  const midCadre =
    hierarchyCounts["Middle Management"] + hierarchyCounts["Junior Management"];
  const juniorCadre = hierarchyCounts["Junior Cadre"] + hierarchyCounts["Uncategorized"];
  const pyramidRatio = topMgmt > 0 ? (total / topMgmt).toFixed(1) : "—";

  /* ── 2. Leadership Coverage Strength ─────────────────────── */
  const hods = filtered
    .map((r) => r["Function HOD Name"]?.toString().trim())
    .filter(Boolean);
  const uniqueHODs = new Set(hods).size;
  const funcs = new Set(filtered.map((r) => r["Function"]).filter(Boolean));
  const hodCoverage = funcs.size > 0 ? ((uniqueHODs / funcs.size) * 100).toFixed(0) : "0";

  // HOD concentration – top HOD's span
  const hodMap: Record<string, number> = {};
  hods.forEach((h) => { hodMap[h!] = (hodMap[h!] || 0) + 1; });
  const hodArr = Object.entries(hodMap).sort((a, b) => b[1] - a[1]);
  const topHOD = hodArr[0];
  const topHODPct = topHOD ? ((topHOD[1] / total) * 100).toFixed(1) : "0";

  /* ── 3. Promotion Bottlenecks ────────────────────────────── */
  const promoElig = filtered.filter(
    (r) =>
      (r["PROMOTION ELIGIBILITY FOR CURRENT YEAR ("] || "").toString().toLowerCase() === "yes"
  );
  const promoEligCount = promoElig.length;
  const promoEligPct = total > 0 ? ((promoEligCount / total) * 100).toFixed(1) : "0";

  // Average promotions from joining per level
  const promoByLevel: Record<string, number[]> = {};
  filtered.forEach((emp) => {
    const desig = emp["Designation"]?.toString().trim() || "";
    const level = HIERARCHY_MAPPING[desig] || "Uncategorized";
    const p = num(emp["No.of promotions from Time of joining"]);
    if (p !== null) {
      if (!promoByLevel[level]) promoByLevel[level] = [];
      promoByLevel[level].push(p);
    }
  });
  const promoLevelStats = Object.entries(promoByLevel)
    .map(([level, arr]) => ({
      level,
      avg: arr.reduce((a, b) => a + b, 0) / arr.length,
      count: arr.length,
    }))
    .sort((a, b) => {
      const ia = HIERARCHY_ORDER.indexOf(a.level);
      const ib = HIERARCHY_ORDER.indexOf(b.level);
      return ia - ib;
    });

  // Zero-promotion employees
  const zeroPromo = filtered.filter((r) => {
    const p = num(r["No.of promotions from Time of joining"]);
    return p !== null && p === 0;
  }).length;

  /* ── 4. Compensation Concentration ──────────────────────── */
  const ctcRows = filtered
    .map((r) => num(r["Current CTC"]))
    .filter((v): v is number => v !== null && v > 0);
  const totalCTC = ctcRows.reduce((a, b) => a + b, 0);
  const avgCTC = ctcRows.length ? totalCTC / ctcRows.length : 0;

  // Top 10% earners – concentration
  const sortedCTC = [...ctcRows].sort((a, b) => b - a);
  const top10Count = Math.max(1, Math.round(sortedCTC.length * 0.1));
  const top10Sum = sortedCTC.slice(0, top10Count).reduce((a, b) => a + b, 0);
  const top10Share = totalCTC > 0 ? ((top10Sum / totalCTC) * 100).toFixed(1) : "0";

  // CTC by hierarchy
  const ctcByHierarchy: Record<string, number[]> = {};
  filtered.forEach((emp) => {
    const desig = emp["Designation"]?.toString().trim() || "";
    const level = HIERARCHY_MAPPING[desig] || "Uncategorized";
    const ctc = num(emp["Current CTC"]);
    if (ctc && ctc > 0) {
      if (!ctcByHierarchy[level]) ctcByHierarchy[level] = [];
      ctcByHierarchy[level].push(ctc);
    }
  });
  const ctcHierarchyStats = HIERARCHY_ORDER.map((level) => {
    const arr = ctcByHierarchy[level] || [];
    const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    return { level, avg, count: arr.length };
  }).filter((x) => x.count > 0);

  const maxCTCHierarchy = ctcHierarchyStats.length
    ? Math.max(...ctcHierarchyStats.map((x) => x.avg))
    : 1;

  /* ── 5. Leadership Pipeline Readiness ───────────────────── */
  // High performers (FY26 rating >= 4) at middle management and below – future leaders
  const perfRated = filtered.filter((r) => num(r["Performance rating_2026"]) !== null);
  const highPerformers = filtered.filter((r) => (num(r["Performance rating_2026"]) || 0) >= 4);
  const highPerfAtMid = highPerformers.filter((r) => {
    const desig = r["Designation"]?.toString().trim() || "";
    const level = HIERARCHY_MAPPING[desig] || "Uncategorized";
    return ["Middle Management", "Junior Management", "Junior Cadre"].includes(level);
  }).length;

  // Tenure > 5 years at junior levels → potential for promotion
  const tenuredJunior = filtered.filter((r) => {
    const desig = r["Designation"]?.toString().trim() || "";
    const level = HIERARCHY_MAPPING[desig] || "Uncategorized";
    const tenure = num(r["Tenure"]);
    return ["Junior Management", "Middle Management"].includes(level) && tenure !== null && tenure >= 5;
  }).length;

  // Average FY26 rating by hierarchy
  const ratingByLevel: Record<string, number[]> = {};
  filtered.forEach((emp) => {
    const desig = emp["Designation"]?.toString().trim() || "";
    const level = HIERARCHY_MAPPING[desig] || "Uncategorized";
    const r = num(emp["Performance rating_2026"]);
    if (r !== null) {
      if (!ratingByLevel[level]) ratingByLevel[level] = [];
      ratingByLevel[level].push(r);
    }
  });
  const ratingLevelStats = HIERARCHY_ORDER.map((level) => {
    const arr = ratingByLevel[level] || [];
    const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    return { level, avg, count: arr.length };
  }).filter((x) => x.count > 0);

  const avgOrgRating = perfRated.length
    ? (
        filtered
          .map((r) => num(r["Performance rating_2026"]) || 0)
          .filter((v) => v > 0)
          .reduce((a, b) => a + b, 0) / perfRated.length
      ).toFixed(2)
    : "—";

  /* ── 6. Succession Planning ──────────────────────────────── */
  // Band distribution  
  const bandCounts: Record<string, number> = {};
  filtered.forEach((r) => {
    const b = r["Band"]?.toString().trim();
    if (b) bandCounts[b] = (bandCounts[b] || 0) + 1;
  });
  const bandArr = Object.entries(bandCounts).sort((a, b) => Number(b[0]) - Number(a[0]));

  // Critical single-person HODs (span of 1)
  const singlePersonHODs = hodArr.filter(([, c]) => c < 5).length;
  const keyPersonRisk = singlePersonHODs;

  // Multi-year top performers (rated >=4 in 2 or more years)
  const consistentTopPerf = filtered.filter((r) => {
    const years = [
      num(r["Performance rating_2026"]),
      num(r["Performance rating_2025"]),
      num(r["Performance rating_2024"]),
    ].filter((v): v is number => v !== null);
    return years.filter((v) => v >= 4).length >= 2;
  }).length;

  // Succession readiness score (0-100)
  const successionScore = Math.min(
    100,
    Math.round(
      (consistentTopPerf / Math.max(total, 1)) * 40 +
        (tenuredJunior / Math.max(total, 1)) * 30 +
        (promoEligCount / Math.max(total, 1)) * 30
    ) * 5
  );

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <div style={{ animation: "fadeIn 0.3s ease-in-out" }}>
      {/* Hero Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
          borderRadius: 18,
          padding: "28px 32px",
          marginBottom: 28,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow orbs */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: 120,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "rgba(139,92,246,0.25)",
                border: "1px solid rgba(139,92,246,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              🤖
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.4px" }}>
                Executive AI Insights
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 1 }}>
                Dynamic workforce intelligence · {total.toLocaleString()} employees analysed
              </div>
            </div>
          </div>

          {/* Scorecard pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
            {[
              { label: "PMS Eligible Headcount", value: total.toLocaleString(), color: "#a5b4fc" },
              {
                label: "Leadership Coverage",
                value: `${hodCoverage}%`,
                color:
                  Number(hodCoverage) >= 80 ? "#6ee7b7" : Number(hodCoverage) >= 60 ? "#fde68a" : "#fca5a5",
              },
              { label: "Promo Eligible", value: promoEligCount, color: "#fbbf24" },
              { label: "Consistent Top Performers", value: consistentTopPerf, color: "#34d399" },
              {
                label: "Succession Score",
                value: `${successionScore}/100`,
                color:
                  successionScore >= 60 ? "#6ee7b7" : successionScore >= 40 ? "#fde68a" : "#fca5a5",
              },
            ].map((p) => (
              <div
                key={p.label}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 800, color: p.color }}>{p.value}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>
                  {p.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Insight Cards Grid ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))",
          gap: 20,
        }}
      >
        {/* ── 1. Workforce Hierarchy Composition ── */}
        <InsightCard
          id="insight-workforce-hierarchy"
          emoji="🏛️"
          title="Workforce Hierarchy Composition"
          sev={
            topMgmt / total > 0.25
              ? "warning"
              : topMgmt / total < 0.03
              ? "warning"
              : "good"
          }
          summary={`${pct(topMgmt, total)} leadership · ${pct(midCadre, total)} middle · ${pct(juniorCadre, total)} junior`}
          accentColor="#6366f1"
          metrics={[
            { label: "Leadership", value: topMgmt, color: "#6366f1" },
            { label: "Mid-Level", value: midCadre, color: "#0891b2" },
            { label: "Junior Cadre", value: juniorCadre, color: "#64748b" },
            { label: "1 Leader : N Staff", value: pyramidRatio, color: "#8b5cf6" },
          ]}
          detail={
            <div>
              <div
                style={{
                  fontSize: 13,
                  color: "#334155",
                  lineHeight: 1.7,
                  marginBottom: 16,
                }}
              >
                {topMgmt > 0 ? (
                  <>
                    The organisation maintains a{" "}
                    <strong>1:{pyramidRatio}</strong> leadership-to-staff span.{" "}
                    {Number(pyramidRatio) > 20
                      ? "This wide span may indicate lean leadership — consider whether each leader has adequate bandwidth to mentor and support their teams."
                      : Number(pyramidRatio) < 8
                      ? "This narrow span suggests heavy management overhead. Review if senior roles are optimally deployed."
                      : "This span is within the healthy 8–20 range, suggesting a balanced managerial structure."}{" "}
                    Junior Cadre makes up <strong>{pct(juniorCadre, total)}</strong>{" "}
                    of the workforce — the operational backbone of the organisation.
                  </>
                ) : (
                  "No hierarchy mapping data available. Verify that Designation column is populated."
                )}
              </div>

              {/* Mini pyramid bars */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {HIERARCHY_ORDER.map((level, i) => {
                  const cnt = hierarchyCounts[level] || 0;
                  if (cnt === 0) return null;
                  const COLORS = [
                    "#6366f1","#8b5cf6","#0891b2","#06b6d4","#10b981","#64748b","#94a3b8",
                  ];
                  return (
                    <div key={level} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 140, fontSize: 12, color: "#475569", fontWeight: 500 }}>
                        {level}
                      </div>
                      <div style={{ flex: 1, height: 12, background: "#f1f5f9", borderRadius: 6, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${((cnt / total) * 100).toFixed(1)}%`,
                            height: "100%",
                            background: COLORS[i % COLORS.length],
                            borderRadius: 6,
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                      <div style={{ width: 55, fontSize: 12, fontWeight: 700, textAlign: "right", color: "#1e293b" }}>
                        {cnt} · {pct(cnt, total)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          }
        />

        {/* ── 2. Leadership Coverage Strength ── */}
        <InsightCard
          id="insight-leadership-coverage"
          emoji="👑"
          title="Leadership Coverage Strength"
          sev={
            Number(hodCoverage) >= 80
              ? "good"
              : Number(hodCoverage) >= 60
              ? "warning"
              : "critical"
          }
          summary={`${uniqueHODs} HODs covering ${funcs.size} functions · Top HOD spans ${topHODPct}% of workforce`}
          accentColor="#dc2626"
          metrics={[
            { label: "Unique HODs", value: uniqueHODs, color: "#dc2626" },
            { label: "Functions", value: funcs.size, color: "#0891b2" },
            { label: "HOD Coverage", value: `${hodCoverage}%`, color: "#10b981" },
            { label: "Top HOD Span %", value: `${topHODPct}%`, color: "#f59e0b" },
          ]}
          detail={
            <div>
              <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.7, marginBottom: 16 }}>
                {Number(hodCoverage) >= 80 ? (
                  <>
                    Leadership coverage is <strong>strong at {hodCoverage}%</strong>. Each major function
                    has designated oversight, reducing decision bottlenecks.
                  </>
                ) : Number(hodCoverage) >= 60 ? (
                  <>
                    Coverage at <strong>{hodCoverage}%</strong> — some functions may be operating without
                    a named HOD. Expedite assignment of functional heads for uncovered units.
                  </>
                ) : (
                  <>
                    <strong>Low HOD coverage ({hodCoverage}%)</strong>. Critical leadership gaps exist.
                    Immediate action required to prevent governance failures.
                  </>
                )}
                {topHOD && (
                  <>
                    {" "}
                    The most dominant HOD (<strong>{topHOD[0].split(" ").slice(0, 2).join(" ")}</strong>)
                    oversees <strong>{topHOD[1]} employees ({topHODPct}%)</strong> — assess if this span
                    is sustainable and whether deputies are required.
                  </>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {hodArr.slice(0, 8).map(([name, count], i) => {
                  const COLORS = [
                    "#dc2626","#ea580c","#f59e0b","#10b981","#0891b2","#6366f1","#8b5cf6","#64748b",
                  ];
                  const initials = name
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase();
                  return (
                    <div key={name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          background: COLORS[i % COLORS.length],
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {initials || "H"}
                      </div>
                      <div style={{ width: 130, fontSize: 12, color: "#475569", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {name.split(" ").slice(0, 3).join(" ")}
                      </div>
                      <div style={{ flex: 1, height: 10, background: "#f1f5f9", borderRadius: 5, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${((count / (hodArr[0]?.[1] || 1)) * 100).toFixed(1)}%`,
                            height: "100%",
                            background: COLORS[i % COLORS.length],
                            borderRadius: 5,
                          }}
                        />
                      </div>
                      <div style={{ width: 45, fontSize: 12, fontWeight: 700, textAlign: "right", color: "#1e293b" }}>
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          }
        />

        {/* ── 3. Promotion Bottlenecks ── */}
        <InsightCard
          id="insight-promotion-bottleneck"
          emoji="🚧"
          title="Promotion Bottlenecks"
          sev={
            zeroPromo / total > 0.5
              ? "critical"
              : Number(promoEligPct) < 10
              ? "warning"
              : Number(promoEligPct) > 30
              ? "warning"
              : "good"
          }
          summary={`${promoEligCount} eligible (${promoEligPct}%) · ${zeroPromo} employees with zero promotions`}
          accentColor="#f59e0b"
          metrics={[
            { label: "Promo-Eligible", value: promoEligCount, color: "#f59e0b" },
            { label: "Eligible %", value: `${promoEligPct}%`, color: "#ea580c" },
            { label: "Zero Promotions", value: zeroPromo, color: "#dc2626" },
          ]}
          detail={
            <div>
              <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.7, marginBottom: 16 }}>
                {zeroPromo / total > 0.5 ? (
                  <>
                    <strong>{pct(zeroPromo, total)}</strong> of employees have received no promotions since
                    joining. This signals a <strong>systemic promotion bottleneck</strong>. Review whether
                    career ladders are clearly defined and accessible across all functions and bands.
                  </>
                ) : (
                  <>
                    {promoEligCount} employees are eligible for promotion this cycle. With{" "}
                    <strong>{pct(zeroPromo, total)}</strong> carrying no promotion history, establishing a
                    clear promotion governance framework linked to PMS ratings is recommended.
                  </>
                )}
              </div>

              {promoLevelStats.length > 0 && (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
                    Average Promotions by Hierarchy Level
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {promoLevelStats.map((s, i) => {
                      const COLORS = ["#6366f1","#8b5cf6","#0891b2","#06b6d4","#10b981","#64748b"];
                      const maxAvg = Math.max(...promoLevelStats.map((x) => x.avg), 1);
                      return (
                        <div key={s.level} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 130, fontSize: 12, color: "#475569", fontWeight: 500 }}>
                            {s.level}
                          </div>
                          <div style={{ flex: 1, height: 10, background: "#f1f5f9", borderRadius: 5, overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${((s.avg / maxAvg) * 100).toFixed(1)}%`,
                                height: "100%",
                                background: COLORS[i % COLORS.length],
                                borderRadius: 5,
                              }}
                            />
                          </div>
                          <div style={{ width: 65, fontSize: 12, fontWeight: 700, textAlign: "right", color: "#1e293b" }}>
                            {s.avg.toFixed(1)} avg
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          }
        />

        {/* ── 4. Compensation Concentration ── */}
        <InsightCard
          id="insight-compensation-concentration"
          emoji="💰"
          title="Compensation Concentration"
          sev={Number(top10Share) > 50 ? "critical" : Number(top10Share) > 40 ? "warning" : "good"}
          summary={`Top 10% earners hold ${top10Share}% of payroll · Avg CTC ₹${(avgCTC / 100000).toFixed(1)}L`}
          accentColor="#10b981"
          metrics={[
            {
              label: "Top 10% Payroll Share",
              value: `${top10Share}%`,
              color: Number(top10Share) > 50 ? "#dc2626" : "#10b981",
            },
            { label: "Avg CTC", value: `₹${(avgCTC / 100000).toFixed(1)}L`, color: "#10b981" },
            {
              label: "Max CTC",
              value: sortedCTC.length ? `₹${(sortedCTC[0] / 100000).toFixed(1)}L` : "—",
              color: "#6366f1",
            },
            {
              label: "Min CTC",
              value: sortedCTC.length ? `₹${(sortedCTC[sortedCTC.length - 1] / 100000).toFixed(1)}L` : "—",
              color: "#64748b",
            },
          ]}
          detail={
            <div>
              <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.7, marginBottom: 16 }}>
                {Number(top10Share) > 50 ? (
                  <>
                    Significant compensation concentration — the top <strong>10%</strong> of earners
                    absorb <strong>{top10Share}%</strong> of total payroll. This level of concentration
                    warrants a pay equity audit to ensure fair distribution aligned with performance and grade.
                  </>
                ) : (
                  <>
                    The top 10% earners account for <strong>{top10Share}%</strong> of total payroll,
                    which is within reasonable bounds. The CTC spread from ₹
                    {sortedCTC.length ? (sortedCTC[sortedCTC.length - 1] / 100000).toFixed(1) : "—"}L to ₹
                    {sortedCTC.length ? (sortedCTC[0] / 100000).toFixed(1) : "—"}L reflects the hierarchy.
                  </>
                )}
              </div>

              {ctcHierarchyStats.length > 0 && (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
                    Average CTC by Hierarchy
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {ctcHierarchyStats.map((h, i) => {
                      const COLORS = ["#6366f1","#8b5cf6","#0891b2","#06b6d4","#10b981","#64748b"];
                      return (
                        <div key={h.level} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 130, fontSize: 12, color: "#475569", fontWeight: 500 }}>
                            {h.level}
                          </div>
                          <div style={{ flex: 1, height: 10, background: "#f1f5f9", borderRadius: 5, overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${((h.avg / maxCTCHierarchy) * 100).toFixed(1)}%`,
                                height: "100%",
                                background: COLORS[i % COLORS.length],
                                borderRadius: 5,
                              }}
                            />
                          </div>
                          <div style={{ width: 70, fontSize: 12, fontWeight: 700, textAlign: "right", color: "#1e293b" }}>
                            ₹{(h.avg / 100000).toFixed(1)}L
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          }
        />

        {/* ── 5. Leadership Pipeline Readiness ── */}
        <InsightCard
          id="insight-pipeline-readiness"
          emoji="🚀"
          title="Leadership Pipeline Readiness"
          sev={
            highPerfAtMid > 20
              ? "good"
              : highPerfAtMid > 5
              ? "info"
              : "warning"
          }
          summary={`${highPerfAtMid} high-performers at mid/junior level · ${tenuredJunior} tenured junior staff (5+ yrs)`}
          accentColor="#8b5cf6"
          metrics={[
            { label: "High Perf at Mid-Level", value: highPerfAtMid, color: "#8b5cf6" },
            { label: "Tenured Juniors (5yr+)", value: tenuredJunior, color: "#6366f1" },
            { label: "Org Avg FY26 Rating", value: avgOrgRating, color: "#10b981" },
            { label: "Total High Performers", value: highPerformers.length, color: "#f59e0b" },
          ]}
          detail={
            <div>
              <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.7, marginBottom: 16 }}>
                {highPerfAtMid > 10 ? (
                  <>
                    The pipeline is <strong>actively populated</strong> with{" "}
                    <strong>{highPerfAtMid} high-performers</strong> (FY26 rating ≥ 4) at mid and junior
                    levels who are potential leadership candidates. Pair them with executive mentors and
                    fast-track development programmes.
                  </>
                ) : (
                  <>
                    Only <strong>{highPerfAtMid} employees</strong> at middle/junior levels have a high FY26
                    rating (≥ 4). The pipeline may be thin. Introduce structured talent identification and
                    leadership readiness assessment programmes.
                  </>
                )}{" "}
                Additionally, <strong>{tenuredJunior} junior-level employees</strong> with 5+ years of tenure
                represent experienced internal candidates who may be promotion-ready.
              </div>

              {ratingLevelStats.length > 0 && (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
                    Avg FY26 Rating by Hierarchy
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {ratingLevelStats.map((s, i) => {
                      const COLORS = ["#6366f1","#8b5cf6","#0891b2","#06b6d4","#10b981","#64748b"];
                      return (
                        <div key={s.level} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 130, fontSize: 12, color: "#475569", fontWeight: 500 }}>
                            {s.level}
                          </div>
                          <div style={{ flex: 1, height: 10, background: "#f1f5f9", borderRadius: 5, overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${((s.avg / 5) * 100).toFixed(1)}%`,
                                height: "100%",
                                background: COLORS[i % COLORS.length],
                                borderRadius: 5,
                              }}
                            />
                          </div>
                          <div style={{ width: 55, fontSize: 12, fontWeight: 700, textAlign: "right", color: "#1e293b" }}>
                            {s.avg.toFixed(2)} / 5
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          }
        />

        {/* ── 6. Succession Planning Recommendations ── */}
        <InsightCard
          id="insight-succession-planning"
          emoji="♟️"
          title="Succession Planning Recommendations"
          sev={
            successionScore >= 60 ? "good" : successionScore >= 35 ? "warning" : "critical"
          }
          summary={`Succession readiness score: ${successionScore}/100 · ${consistentTopPerf} consistent top performers · ${keyPersonRisk} key-person risks`}
          accentColor="#0891b2"
          metrics={[
            {
              label: "Readiness Score",
              value: `${successionScore}/100`,
              color:
                successionScore >= 60 ? "#10b981" : successionScore >= 35 ? "#f59e0b" : "#dc2626",
            },
            { label: "Consistent Top Performers", value: consistentTopPerf, color: "#0891b2" },
            { label: "Key-Person Risk Roles", value: keyPersonRisk, color: "#dc2626" },
            { label: "Promo-Ready Pipeline", value: promoEligCount, color: "#8b5cf6" },
          ]}
          detail={
            <div>
              <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.7, marginBottom: 16 }}>
                {successionScore >= 60 ? (
                  <>
                    Succession health is <strong>solid</strong>. With {consistentTopPerf} multi-year
                    high-performers and {promoEligCount} promotion-ready staff, the organisation has a
                    credible internal talent bench. Formalise succession maps for senior roles.
                  </>
                ) : successionScore >= 35 ? (
                  <>
                    Succession readiness is <strong>moderate</strong>. Identify critical roles with no
                    clear successors and initiate cross-training and development plans. Focus on the{" "}
                    {consistentTopPerf} consistent performers as primary succession candidates.
                  </>
                ) : (
                  <>
                    <strong>Low succession readiness.</strong> The organisation faces elevated key-person
                    risk across {keyPersonRisk} HOD roles. Immediate action: identify at least 2
                    internal or external successors per senior position and establish a 12-month
                    readiness programme.
                  </>
                )}
              </div>

              {/* Action plan */}
              <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 10 }}>
                Recommended Actions
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  {
                    icon: "🎯",
                    text: `Map ${consistentTopPerf} consistent top-performers to critical senior vacancies`,
                    color: "#0891b2",
                  },
                  {
                    icon: "🔒",
                    text: `Address ${keyPersonRisk} key-person concentration risks in HOD coverage`,
                    color: "#dc2626",
                  },
                  {
                    icon: "📈",
                    text: `Fast-track ${highPerfAtMid} high-performing middle managers into leadership readiness programmes`,
                    color: "#8b5cf6",
                  },
                  {
                    icon: "⏳",
                    text: `Convert ${tenuredJunior} tenured junior-level employees into promotion pipeline`,
                    color: "#f59e0b",
                  },
                  {
                    icon: "🔗",
                    text: "Link PMS ratings directly to promotion decisions & compensation revision cycles",
                    color: "#10b981",
                  },
                ].map((action, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "10px 12px",
                      background: "#f8fafc",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{action.icon}</span>
                    <span style={{ fontSize: 12, color: "#334155", lineHeight: 1.5 }}>
                      {action.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Band distribution mini-view */}
              {bandArr.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
                    Band Distribution
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {bandArr.map(([band, cnt]) => (
                      <div
                        key={band}
                        style={{
                          padding: "6px 12px",
                          background: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          borderRadius: 8,
                          fontSize: 12,
                          color: "#1e40af",
                          fontWeight: 700,
                        }}
                      >
                        Band {band}: {cnt} ({pct(cnt, total)})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          }
        />
      </div>

      {/* Bottom disclaimer */}
      <div
        style={{
          marginTop: 24,
          padding: "14px 20px",
          background: "#f8fafc",
          borderRadius: 10,
          border: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 11,
          color: "#94a3b8",
        }}
      >
        <span style={{ fontSize: 14 }}>ℹ️</span>
        All insights are derived dynamically from the uploaded workforce roster. Ratings, hierarchy
        levels, and CTC values are computed in real-time from your dataset — no external data or AI
        model calls are made.
      </div>
    </div>
  );
}
