import React from "react";
import { Employee, num, pct } from "./MockHRData";

// Helper to safely parse numbers, stripping commas, currencies and spaces
const cleanNum = (v: any): number | null => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return v;
  const cleaned = v.toString().replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return isNaN(n) ? null : n;
};

const getEmpRating = (emp: Employee): number | null => {
  return num(emp["Rating (1-5)"]) !== null ? num(emp["Rating (1-5)"]) : num(emp["Performance rating_2026"]);
};

const getEmpMeritPct = (emp: Employee): number | null => {
  return num(emp["Merit %"]) !== null ? num(emp["Merit %"]) : num(emp["Salary Increment %"]);
};

const getEmpCurrentCTC = (emp: Employee): number | null => {
  return cleanNum(emp["Current CTC"]) || cleanNum(emp["Current\r\nCTC"]);
};

const getEmpRevisedCTC = (emp: Employee): number | null => {
  return cleanNum(emp["Revised CTC"]) || cleanNum(emp["Revised\r\nCTC"]);
};

const getEmpFunction = (emp: Employee): string => {
  return (emp["Department"] || "General").toString().trim();
};

interface RatingMeritViewProps {
  employees: Employee[];
  searchQuery: string;
  ratingSummary?: any[] | null;
}

export default function RatingMeritView({
  employees,
  searchQuery,
  ratingSummary,
}: RatingMeritViewProps) {
  // Filter employees based on search query
  const filtered = employees.filter((emp) =>
    searchQuery
      ? (emp["Employee Name"] || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp["Department"] || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp["Function"] || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp["Designation"] || "").toString().toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const total = filtered.length;

  // Department rating calculations for insights
  const deptRatingMap: Record<string, { totalRating: number; count: number }> = {};
  filtered.forEach((emp) => {
    const dept = getEmpFunction(emp);
    const rating = getEmpRating(emp);
    if (rating !== null) {
      if (!deptRatingMap[dept]) {
        deptRatingMap[dept] = { totalRating: 0, count: 0 };
      }
      deptRatingMap[dept].totalRating += rating;
      deptRatingMap[dept].count += 1;
    }
  });

  const deptRatingList = Object.entries(deptRatingMap)
    .map(([name, data]) => ({
      name,
      avgRating: data.count > 0 ? data.totalRating / data.count : 0,
      count: data.count,
    }))
    .filter((d) => d.count >= 1);

  deptRatingList.sort((a, b) => b.avgRating - a.avgRating);

  const highestRatedDept = deptRatingList.length > 0 ? deptRatingList[0] : null;
  const lowestRatedDept = deptRatingList.length > 1 ? deptRatingList[deptRatingList.length - 1] : (deptRatingList.length === 1 ? deptRatingList[0] : null);

  // ----------------------------------------------------
  // 1. Rating Summary Analytics Calculations
  // ----------------------------------------------------
  const guidelines: Record<number, number> = {
    1: 5,   // 5%
    2: 10,  // 10%
    3: 65,  // 65%
    4: 15,  // 15%
    5: 5,   // 5%
  };

  let ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let ratingTotalCount = 0;

  const hasRatingSummarySheet = ratingSummary && ratingSummary.length > 0;
  let ratingDistribution: any[] = [];
  let sheetMerits: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let hasSheetMerits = false;

  if (hasRatingSummarySheet) {
    let distHeaderIdx = -1;
    let distDataIdx = -1;
    let guidelineIdx = -1;
    let meritHeaderIdx = -1;

    ratingSummary.forEach((row: any, idx: number) => {
      if (!Array.isArray(row)) return;
      if (row.some(cell => String(cell || "").toLowerCase().includes("rating 1"))) {
        if (distHeaderIdx === -1) {
          distHeaderIdx = idx;
        } else if (meritHeaderIdx === -1) {
          meritHeaderIdx = idx;
        }
      }
      if (row.some(cell => String(cell || "").toLowerCase() === "guideline")) {
        guidelineIdx = idx;
      }
    });

    if (distHeaderIdx !== -1) {
      distDataIdx = distHeaderIdx + 1;
      const headerRow = ratingSummary[distHeaderIdx];
      const dataRow = ratingSummary[distDataIdx];

      if (dataRow && dataRow.length > 1) {
        for (let colIdx = 1; colIdx < headerRow.length; colIdx++) {
          const headerVal = String(headerRow[colIdx] || "").toLowerCase();
          const countVal = cleanNum(dataRow[colIdx]) || 0;
          if (headerVal.includes("rating 1")) ratingCounts[1] = countVal;
          if (headerVal.includes("rating 2")) ratingCounts[2] = countVal;
          if (headerVal.includes("rating 3")) ratingCounts[3] = countVal;
          if (headerVal.includes("rating 4")) ratingCounts[4] = countVal;
          if (headerVal.includes("rating 5")) ratingCounts[5] = countVal;
          if (headerVal.includes("total") || headerVal.includes("headcount")) ratingTotalCount = countVal;
        }
      }
    }

    if (guidelineIdx !== -1) {
      const guideRow = ratingSummary[guidelineIdx];
      let guideCol = 2;
      [1, 2, 3, 4, 5].forEach(r => {
        const val = cleanNum(guideRow[guideCol++]);
        if (val !== null) {
          guidelines[r] = val <= 1 ? val * 100 : val;
        }
      });
    }

    if (meritHeaderIdx !== -1) {
      const headerRow = ratingSummary[meritHeaderIdx];
      const dataRow = ratingSummary[meritHeaderIdx + 1];
      if (dataRow && dataRow.length > 1) {
        for (let colIdx = 1; colIdx < headerRow.length; colIdx++) {
          const headerVal = String(headerRow[colIdx] || "").toLowerCase();
          const meritVal = cleanNum(dataRow[colIdx]) || 0;
          const meritPct = meritVal <= 1 ? meritVal * 100 : meritVal;
          if (headerVal.includes("rating 1")) { sheetMerits[1] = meritPct; hasSheetMerits = true; }
          if (headerVal.includes("rating 2")) { sheetMerits[2] = meritPct; hasSheetMerits = true; }
          if (headerVal.includes("rating 3")) { sheetMerits[3] = meritPct; hasSheetMerits = true; }
          if (headerVal.includes("rating 4")) { sheetMerits[4] = meritPct; hasSheetMerits = true; }
          if (headerVal.includes("rating 5")) { sheetMerits[5] = meritPct; hasSheetMerits = true; }
        }
      }
    }

    ratingDistribution = [1, 2, 3, 4, 5].map((r) => {
      const count = ratingCounts[r];
      const actualPct = ratingTotalCount > 0 ? (count / ratingTotalCount) * 100 : 0;
      const guidePct = guidelines[r];
      const variance = actualPct - guidePct;
      return {
        rating: r,
        label: r === 1 ? "Rating 1 (Low)" : r === 3 ? "Rating 3 (Mid)" : r === 5 ? "Rating 5 (High)" : `Rating ${r}`,
        count,
        actualPct,
        guidePct,
        variance,
      };
    });
  } else {
    filtered.forEach((emp) => {
      const val = getEmpRating(emp);
      if (val !== null) {
        const rounded = Math.min(5, Math.max(1, Math.round(val)));
        ratingCounts[rounded]++;
        ratingTotalCount++;
      }
    });

    ratingDistribution = [1, 2, 3, 4, 5].map((r) => {
      const count = ratingCounts[r];
      const actualPct = ratingTotalCount > 0 ? (count / ratingTotalCount) * 100 : 0;
      const guidePct = guidelines[r];
      const variance = actualPct - guidePct;
      return {
        rating: r,
        label: r === 1 ? "Rating 1 (Low)" : r === 3 ? "Rating 3 (Mid)" : r === 5 ? "Rating 5 (High)" : `Rating ${r}`,
        count,
        actualPct,
        guidePct,
        variance,
      };
    });
  }

  // ----------------------------------------------------
  // 2. Average Merit % Awarded by Rating Calculations
  // ----------------------------------------------------
  const meritDistribution = [1, 2, 3, 4, 5].map((r) => {
    if (hasSheetMerits) {
      return {
        rating: r,
        label: r === 1 ? "Rating 1 (Low)" : r === 3 ? "Rating 3 (Mid)" : r === 5 ? "Rating 5 (High)" : `Rating ${r}`,
        count: ratingCounts[r],
        avgMeritPct: sheetMerits[r],
      };
    } else {
      let sum = 0;
      let count = 0;
      filtered.forEach((emp) => {
        const ratingVal = getEmpRating(emp);
        const incVal = getEmpMeritPct(emp);
        if (ratingVal !== null && incVal !== null) {
          const rounded = Math.min(5, Math.max(1, Math.round(ratingVal)));
          if (rounded === r) {
            sum += incVal;
            count++;
          }
        }
      });
      let avgMeritPct = count > 0 ? (sum / count) : 0;
      if (avgMeritPct > 0 && avgMeritPct <= 1) {
        avgMeritPct *= 100;
      }
      return {
        rating: r,
        label: r === 1 ? "Rating 1 (Low)" : r === 3 ? "Rating 3 (Mid)" : r === 5 ? "Rating 5 (High)" : `Rating ${r}`,
        count,
        avgMeritPct,
      };
    }
  });

  // ----------------------------------------------------
  // 3. Function-wise Increment Analysis Calculations
  // ----------------------------------------------------
  const funcIncMap: Record<string, { totalIncPct: number; count: number }> = {};
  let orgTotalIncPct = 0;
  let orgCount = 0;

  filtered.forEach((emp) => {
    const current = getEmpCurrentCTC(emp);
    const revised = getEmpRevisedCTC(emp);
    const func = getEmpFunction(emp);

    if (current !== null && current > 0 && revised !== null && revised > 0) {
      const incPct = ((revised - current) / current) * 100;
      
      if (!funcIncMap[func]) {
        funcIncMap[func] = { totalIncPct: 0, count: 0 };
      }
      funcIncMap[func].totalIncPct += incPct;
      funcIncMap[func].count += 1;

      orgTotalIncPct += incPct;
      orgCount += 1;
    }
  });

  const funcIncList = Object.entries(funcIncMap).map(([name, data]) => ({
    name,
    avgIncPct: data.count > 0 ? data.totalIncPct / data.count : 0,
    count: data.count,
  }));

  // Sort from highest to lowest Increment %
  funcIncList.sort((a, b) => b.avgIncPct - a.avgIncPct);

  // Org Average
  const orgAvgIncPct = orgCount > 0 ? orgTotalIncPct / orgCount : 0;

  // Highest and Lowest
  const highestFunc = funcIncList.length > 0 ? funcIncList[0] : null;
  const lowestFunc = funcIncList.length > 1 ? funcIncList[funcIncList.length - 1] : (funcIncList.length === 1 ? funcIncList[0] : null);

  const maxAvgInc = funcIncList.length > 0 ? Math.max(...funcIncList.map(f => f.avgIncPct)) : 1;

  return (
    <div style={{ animation: "fadeIn 0.3s ease-in-out", fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      {/* ---------------------------------------------------- */}
      {/* SECTION 1: RATING SUMMARY ANALYTICS                  */}
      {/* ---------------------------------------------------- */}
      <div className="card" style={{ padding: "28px", borderRadius: "16px", border: "1px solid #e2e8f0", background: "#ffffff", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
        <div className="card-title" style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px", marginBottom: "20px" }}>
          <span style={{ fontSize: "24px" }}>⭐</span>
          Rating Summary & Performance Distribution
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px" }}>
          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f1f5f9", textAlign: "left", color: "#64748b" }}>
                  <th style={{ padding: "12px 8px" }}>Rating Category</th>
                  <th style={{ padding: "12px 8px", textAlign: "right" }}>Employee Count</th>
                  <th style={{ padding: "12px 8px", textAlign: "right" }}>Workforce %</th>
                  <th style={{ padding: "12px 8px", textAlign: "right" }}>Guideline %</th>
                  <th style={{ padding: "12px 8px", textAlign: "right" }}>Variance</th>
                </tr>
              </thead>
              <tbody>
                {ratingDistribution.map((row) => {
                  const isPositive = row.variance > 0;
                  const absVar = Math.abs(row.variance).toFixed(1);
                  const badgeBg = row.variance === 0 ? "#f1f5f9" : isPositive ? "#fee2e2" : "#eff6ff";
                  const badgeColor = row.variance === 0 ? "#475569" : isPositive ? "#b91c1c" : "#1e40af";

                  return (
                    <tr key={row.rating} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 8px", fontWeight: 700, color: "#334155" }}>{row.label}</td>
                      <td style={{ padding: "12px 8px", textAlign: "right" }}>{row.count}</td>
                      <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: 800 }}>{row.actualPct.toFixed(1)}%</td>
                      <td style={{ padding: "12px 8px", textAlign: "right", color: "#64748b" }}>{row.guidePct.toFixed(1)}%</td>
                      <td style={{ padding: "12px 8px", textAlign: "right" }}>
                        <span style={{ padding: "3px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 800, background: badgeBg, color: badgeColor }}>
                          {row.variance === 0 ? "0.0%" : `${isPositive ? "+" : "-"}${absVar}%`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bell Curve SVG */}
          <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#475569" }}>PMS Bell Curve Visualizer</span>
              <div style={{ display: "flex", gap: "8px", fontSize: "11px", fontWeight: 700 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#3b82f6" }}>
                  <span style={{ width: "8px", height: "8px", background: "#3b82f6", borderRadius: "50%" }} /> Recommended
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#10b981" }}>
                  <span style={{ width: "8px", height: "8px", background: "#10b981", borderRadius: "50%" }} /> Actual
                </span>
              </div>
            </div>

            <div style={{ width: "100%", height: "180px" }}>
              {(() => {
                const maxPct = Math.max(...ratingDistribution.map(d => Math.max(d.actualPct, d.guidePct)), 70);
                const getX = (idx: number) => 40 + idx * 70;
                const getY = (percentage: number) => 150 - (percentage / maxPct) * 120;

                const recPath = `M ${getX(0)} ${getY(guidelines[1])} C ${getX(0) + 25} ${getY(guidelines[1]) - 15}, ${getX(1) - 25} ${getY(guidelines[2])}, ${getX(1)} ${getY(guidelines[2])} C ${getX(1) + 25} ${getY(guidelines[2]) - 25}, ${getX(2) - 25} ${getY(guidelines[3])}, ${getX(2)} ${getY(guidelines[3])} C ${getX(2) + 25} ${getY(guidelines[3])}, ${getX(3) - 25} ${getY(guidelines[4]) - 25}, ${getX(3)} ${getY(guidelines[4])} C ${getX(3) + 25} ${getY(guidelines[4])}, ${getX(4) - 25} ${getY(guidelines[5]) - 15}, ${getX(4)} ${getY(guidelines[5])}`;
                const actPath = `M ${getX(0)} ${getY(ratingDistribution[0].actualPct)} C ${getX(0) + 25} ${getY(ratingDistribution[0].actualPct) - 15}, ${getX(1) - 25} ${getY(ratingDistribution[1].actualPct)}, ${getX(1)} ${getY(ratingDistribution[1].actualPct)} C ${getX(1) + 25} ${getY(ratingDistribution[1].actualPct) - 25}, ${getX(2) - 25} ${getY(ratingDistribution[2].actualPct)}, ${getX(2)} ${getY(ratingDistribution[2].actualPct)} C ${getX(2) + 25} ${getY(ratingDistribution[2].actualPct)}, ${getX(3) - 25} ${getY(ratingDistribution[3].actualPct) - 25}, ${getX(3)} ${getY(ratingDistribution[3].actualPct)} C ${getX(3) + 25} ${getY(ratingDistribution[3].actualPct)}, ${getX(4) - 25} ${getY(ratingDistribution[4].actualPct) - 15}, ${getX(4)} ${getY(ratingDistribution[4].actualPct)}`;

                return (
                  <svg width="100%" height="100%" viewBox="0 0 340 180">
                    {/* Gridlines */}
                    {[0, 25, 50, 75].map((gVal) => (
                      <g key={gVal}>
                        <line x1="30" y1={getY(gVal)} x2="330" y2={getY(gVal)} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />
                        <text x="25" y={getY(gVal) + 3} fontSize="9" fill="#94a3b8" textAnchor="end">{gVal}%</text>
                      </g>
                    ))}
                    {/* Curve Paths */}
                    <path d={recPath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />
                    <path d={actPath} fill="none" stroke="#10b981" strokeWidth="3" />
                    {/* Dots */}
                    {ratingDistribution.map((row, idx) => (
                      <g key={idx}>
                        <circle cx={getX(idx)} cy={getY(row.guidePct)} r="3" fill="#3b82f6" />
                        <circle cx={getX(idx)} cy={getY(row.actualPct)} r="4.5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                        <text x={getX(idx)} y="172" fontSize="9" fill="#64748b" textAnchor="middle" fontWeight="bold">R{row.rating}</text>
                      </g>
                    ))}
                  </svg>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Rating Quality Insight */}
        <div style={{ marginTop: "24px", padding: "16px", background: "#eff6ff", borderRadius: "12px", border: "1px solid #bfdbfe", display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <div style={{ fontSize: "20px" }}>💡</div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#1e40af", marginBottom: "4px" }}>Rating Quality Insight</div>
            <div style={{ fontSize: "12px", color: "#1e3a8a", lineHeight: 1.5 }}>
              {highestRatedDept && lowestRatedDept ? (
                <>
                  The highest-rated department is <strong>{highestRatedDept.name}</strong> with an average performance rating of <strong>{highestRatedDept.avgRating.toFixed(1)}★</strong> (across {highestRatedDept.count} employees). 
                  The lowest-rated department is <strong>{lowestRatedDept.name}</strong> with an average performance rating of <strong>{lowestRatedDept.avgRating.toFixed(1)}★</strong> (across {lowestRatedDept.count} employees).
                </>
              ) : (
                "Insufficient rating data per department to generate comparative insights."
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECTION 2: AVERAGE MERIT % AWARDED BY RATING         */}
      {/* ---------------------------------------------------- */}
      <div className="card" style={{ padding: "28px", borderRadius: "16px", border: "1px solid #e2e8f0", background: "#ffffff", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", marginTop: "24px" }}>
        <div className="card-title" style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px", marginBottom: "20px" }}>
          <span style={{ fontSize: "24px" }}>💸</span>
          Average Merit % Awarded by Rating
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px" }}>
          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f1f5f9", textAlign: "left", color: "#64748b" }}>
                  <th style={{ padding: "12px 8px" }}>Rating Level</th>
                  <th style={{ padding: "12px 8px", textAlign: "right" }}>Employee Count</th>
                  <th style={{ padding: "12px 8px", textAlign: "right" }}>Average Merit %</th>
                </tr>
              </thead>
              <tbody>
                {meritDistribution.map((row) => (
                  <tr key={row.rating} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 8px", fontWeight: 700, color: "#334155" }}>{row.label}</td>
                    <td style={{ padding: "12px 8px", textAlign: "right" }}>{row.count}</td>
                    <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: 800, color: "#8b5cf6" }}>{row.avgMeritPct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bar Chart */}
          <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#475569", marginBottom: "16px" }}>Merit Allocation by Rating</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {meritDistribution.map((row, idx) => {
                const maxMerit = Math.max(...meritDistribution.map(d => d.avgMeritPct), 10);
                const pctWidth = maxMerit > 0 ? (row.avgMeritPct / maxMerit) * 100 : 0;
                const colors = ["#fda4af", "#c084fc", "#a78bfa", "#818cf8", "#6366f1"];

                return (
                  <div key={row.rating} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ width: "60px", fontSize: "11px", fontWeight: 700, color: "#64748b" }}>Rating {row.rating}</span>
                    <div style={{ flex: 1, height: "14px", background: "#e2e8f0", borderRadius: "7px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pctWidth}%`, background: colors[idx], borderRadius: "7px" }} />
                    </div>
                    <span style={{ width: "45px", fontSize: "11px", fontWeight: 800, color: "#475569", textAlign: "right" }}>{row.avgMeritPct.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECTION 3: FUNCTION-WISE INCREMENT ANALYSIS          */}
      {/* ---------------------------------------------------- */}
      <div className="card" style={{ padding: "28px", borderRadius: "16px", border: "1px solid #e2e8f0", background: "#ffffff", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", marginTop: "24px" }}>
        <div className="card-title" style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px", marginBottom: "20px" }}>
          <span style={{ fontSize: "24px" }}>📈</span>
          Function-wise Increment Analysis
        </div>

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          <div style={{ padding: "16px", borderRadius: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", textAlign: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.5px" }}>Highest Increment Function</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#166534", marginTop: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {highestFunc ? `${highestFunc.name}` : "N/A"}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#15803d", marginTop: "4px" }}>
              {highestFunc ? `${highestFunc.avgIncPct.toFixed(1)}%` : "—"}
            </div>
          </div>

          <div style={{ padding: "16px", borderRadius: "12px", background: "#fef2f2", border: "1px solid #fecaca", textAlign: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#991b1b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Lowest Increment Function</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#7f1d1d", marginTop: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {lowestFunc ? `${lowestFunc.name}` : "N/A"}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#991b1b", marginTop: "4px" }}>
              {lowestFunc ? `${lowestFunc.avgIncPct.toFixed(1)}%` : "—"}
            </div>
          </div>

          <div style={{ padding: "16px", borderRadius: "12px", background: "#eff6ff", border: "1px solid #bfdbfe", textAlign: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.5px" }}>Organization Avg Increment</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1e3a8a", marginTop: "6px" }}>
              {orgAvgIncPct.toFixed(1)}%
            </div>
            <div style={{ fontSize: "10px", color: "#60a5fa", marginTop: "4px" }}>Across all active functions</div>
          </div>
        </div>

        {/* Chart + Insight */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px" }}>
          {/* Horizontal Bar Chart */}
          <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#475569", marginBottom: "18px" }}>Average Increment by Function</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {funcIncList.map((item, idx) => {
                const pctWidth = maxAvgInc > 0 ? (item.avgIncPct / maxAvgInc) * 100 : 0;
                const colors = ["#10b981", "#059669", "#0d9488", "#0f766e", "#115e59", "#134e4a"];
                const barColor = colors[idx % colors.length];

                return (
                  <div
                    key={item.name}
                    title={`Function: ${item.name} | Avg Increment: ${item.avgIncPct.toFixed(1)}% | Employees: ${item.count}`}
                    style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "help" }}
                  >
                    <span style={{ width: "130px", fontSize: "11.5px", fontWeight: 700, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.name}
                    </span>
                    <div style={{ flex: 1, height: "14px", background: "#e2e8f0", borderRadius: "7px", overflow: "hidden", position: "relative" }}>
                      <div style={{ height: "100%", width: `${pctWidth}%`, background: barColor, borderRadius: "7px", transition: "width 0.4s ease" }} />
                    </div>
                    <span style={{ width: "50px", fontSize: "11px", fontWeight: 800, color: "#1e293b", textAlign: "right" }}>
                      {item.avgIncPct.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
              {funcIncList.length === 0 && (
                <div style={{ color: "var(--foreground-muted)", fontSize: "12px", textAlign: "center", padding: "20px 0" }}>
                  No function increment data available.
                </div>
              )}
            </div>
          </div>

          {/* Executive Insight Card */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ padding: "20px", background: "#f0fdf4", borderRadius: "12px", border: "1px solid #ccfbf1", display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div style={{ fontSize: "24px" }}>💡</div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f766e", marginBottom: "6px" }}>Executive Insight</div>
                <div style={{ fontSize: "13px", color: "#115e59", lineHeight: 1.6 }}>
                  {highestFunc && lowestFunc ? (
                    <>
                      The highest average salary increment was recorded in the <strong>{highestFunc.name}</strong> function at <strong>{highestFunc.avgIncPct.toFixed(1)}%</strong> (across {highestFunc.count} employees). 
                      In contrast, the lowest average increment was in <strong>{lowestFunc.name}</strong> at <strong>{lowestFunc.avgIncPct.toFixed(1)}%</strong> (across {lowestFunc.count} employees). 
                      The overall organization-wide average increment stands at <strong>{orgAvgIncPct.toFixed(1)}%</strong>.
                    </>
                  ) : (
                    "Insufficient data to compute top/bottom business functions."
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
