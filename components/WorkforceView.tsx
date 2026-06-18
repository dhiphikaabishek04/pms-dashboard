import React from "react";
import { Employee, num, pct } from "./MockHRData";

interface WorkforceViewProps {
  employees: Employee[];
  searchQuery: string;
}

export default function WorkforceView({ employees, searchQuery }: WorkforceViewProps) {
  // Color palette matching the ProConnect dashboard spec
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

  // Count by helper
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

  // Function Distribution
  const funcs = getCountBy("Function").slice(0, 9);
  const maxFuncCount = funcs.length ? funcs[0][1] : 1;

  // HOD highlights inside function card
  const hods = getCountBy("Function HOD Name").slice(0, 3);

  // Age Distribution
  const ageBuckets = [
    [20, 30, "20–30 yrs"],
    [30, 40, "30–40 yrs"],
    [40, 50, "40–50 yrs"],
    [50, 60, "50–60 yrs"],
    [60, 100, "60+ yrs"],
  ] as const;

  const ageCounts = ageBuckets.map(([lo, hi, label]) => {
    const count = filtered.filter((r) => {
      const a = num(r["Age"]);
      return a !== null && a > lo && a <= hi;
    }).length;
    return [label, count] as [string, number];
  });
  const maxAgeCount = Math.max(...ageCounts.map((a) => a[1]), 1);

  // Band Structure
  const bandCounts: Record<string, number> = {};
  filtered.forEach((r) => {
    const b = num(r["Band"]);
    if (b !== null) {
      bandCounts[b] = (bandCounts[b] || 0) + 1;
    }
  });
  const bands = Object.entries(bandCounts).sort((a, b) => Number(a[0]) - Number(b[0]));
  const bandMax = bands.length ? Math.max(...bands.map((b) => b[1])) : 1;
  const pyrColors = ["#dc2626", "#ea580c", "#f59e0b", "#2563eb", "#1a7a4a", "#2d9e62", "#6366f1"];

  // Note for dominant band
  const topBand = bands.length ? [...bands].sort((a, b) => b[1] - a[1])[0] : null;

  return (
    <div className="g53" style={{ animation: "fadeIn 0.3s ease-in-out" }}>
      {/* Left Column: Function Distribution */}
      <div className="card">
        <div className="card-title">
          <div className="ci" style={{ background: "#e6f4ec", color: "var(--green)" }}>
            📊
          </div>{" "}
          Function Distribution
        </div>

        <div id="func-bars" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {funcs.map(([lbl, cnt], i) => (
            <div key={lbl} className="bar-row">
              <div className="bar-lbl" style={{ width: "130px" }}>
                {lbl}
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${((cnt / maxFuncCount) * 100).toFixed(1)}%`,
                    background: COLORS[i % COLORS.length],
                  }}
                ></div>
              </div>
              <div className="bar-val">{cnt}</div>
            </div>
          ))}
          {funcs.length === 0 && (
            <div style={{ color: "var(--foreground-muted)", fontSize: "12px", textAlign: "center", padding: "24px 0" }}>
              No function data loaded.
            </div>
          )}
        </div>

        {/* HOD summaries in card footer */}
        <div
          id="func-stat"
          style={{
            display: "flex",
            justifyContent: "space-around",
            textAlign: "center",
            paddingTop: "12px",
            borderTop: "1px solid var(--border)",
            marginTop: "16px",
          }}
        >
          {hods.map(([h, c], i) => (
            <div key={h}>
              <div style={{ fontSize: "16px", fontWeight: 800, color: COLORS[i % COLORS.length] }}>
                {c}
              </div>
              <div style={{ fontSize: "9px", color: "var(--muted)", maxWidth: "90px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {h.split(/\s+/).slice(0, 2).join(" ")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Age + Bands */}
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Age card */}
        <div className="card">
          <div className="card-title">
            <div className="ci" style={{ background: "#ede9fe", color: "var(--purple)" }}>
              📅
            </div>{" "}
            Age Distribution
          </div>

          <div id="age-bars" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {ageCounts.map(([lbl, cnt], i) => (
              <div key={lbl} className="bar-row">
                <div className="bar-lbl" style={{ width: "70px" }}>
                  {lbl}
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${((cnt / maxAgeCount) * 100).toFixed(1)}%`,
                      background: COLORS[(i + 3) % COLORS.length],
                    }}
                  ></div>
                </div>
                <div className="bar-val">{cnt}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Band card */}
        <div className="card">
          <div className="card-title">
            <div className="ci" style={{ background: "#fef3c7", color: "var(--amber)" }}>
              🪜
            </div>{" "}
            Band Structure
          </div>

          <div className="pyramid" id="band-pyramid">
            {bands.map(([b, cnt], i) => (
              <div key={b} className="pyr-row">
                <div className="pyr-lbl">Band {b}</div>
                <div className="pyr-wrap">
                  <div
                    className="pyr-bar"
                    style={{
                      width: `${Math.max(15, (cnt / bandMax) * 100).toFixed(1)}%`,
                      background: pyrColors[i % pyrColors.length],
                    }}
                  >
                    {cnt}
                  </div>
                </div>
                <div className="pyr-cnt">{cnt}</div>
              </div>
            ))}
          </div>

          <div
            id="band-note"
            style={{
              fontSize: "10px",
              color: "var(--muted)",
              marginTop: "12px",
              textAlign: "center",
            }}
          >
            {topBand && (
              <>
                Band {topBand[0]} represents <strong>{pct(topBand[1], total)}</strong> of the workforce
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
