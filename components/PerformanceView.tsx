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

// Helper to format currency in Crores (Cr)
const formatInCr = (val: number): string => {
  return `₹${(val / 10000000).toFixed(2)}Cr`;
};

// Helper to format currency in Lakhs (L)
const formatInLakhs = (val: number): string => {
  return `₹${(val / 100000).toFixed(2)}L`;
};


// Main Sheet Property Accessors (handles template carriage returns & headers)
const getEmpRating = (emp: Employee): number | null => {
  return num(emp["Rating\r\n(1-5)"]) !== null ? num(emp["Rating\r\n(1-5)"]) : num(emp["Performance rating_2026"]);
};
const getEmpCurrentCTC = (emp: Employee): number | null => {
  return cleanNum(emp["Current\r\nCTC"]) !== null ? cleanNum(emp["Current\r\nCTC"]) : cleanNum(emp["Current CTC"]);
};
const getEmpRevisedCTC = (emp: Employee): number | null => {
  return cleanNum(emp["Revised\r\nCTC"]) !== null ? cleanNum(emp["Revised\r\nCTC"]) : cleanNum(emp["Revised CTC"]);
};
const getEmpMeritPct = (emp: Employee): number | null => {
  const merit = num(emp["Merit %"]) !== null ? num(emp["Merit %"]) : num(emp["Salary Increment %"]);
  return merit;
};
const getEmpFunction = (emp: Employee): string => {
  return (emp["Department"] || emp["Function"] || "General").toString().trim();
};
const getEmpPromoStatus = (emp: Employee): boolean => {
  const promo = (emp["Promotion \r\n(Yes / No)"] || emp["PROMOTION ELIGIBILITY FOR CURRENT YEAR ("] || emp["Current year promotion status"] || "").toString().toLowerCase();
  return promo === "yes" || promo === "true";
};
const getEmpSpend = (emp: Employee): number => {
  const merit = cleanNum(emp["Merit\r\nAmount"]) || cleanNum(emp["Merit Amount"]) || 0;
  const promo = cleanNum(emp["Promotion\r\nAmount"]) || cleanNum(emp["Promotion Amount"]) || 0;
  const correction = cleanNum(emp["Salary\r\nCorrection"]) || cleanNum(emp["Salary Correction"]) || 0;
  const totalInc = cleanNum(emp["Total\r\nIncrement"]) || cleanNum(emp["Total Increment"]) || 0;
  
  if (merit !== 0 || promo !== 0 || correction !== 0) {
    return merit + promo + correction;
  }
  if (totalInc !== 0) return totalInc;
  
  const current = getEmpCurrentCTC(emp) || 0;
  const revised = getEmpRevisedCTC(emp) || 0;
  return revised > current ? revised - current : 0;
};

interface PerformanceViewProps {
  employees: Employee[];
  searchQuery: string;
  ratingSummary?: any[] | null;
  budgetSummary?: any[] | null;
}

export default function PerformanceView({
  employees,
  searchQuery,
  ratingSummary,
  budgetSummary,
}: PerformanceViewProps) {
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

  // Group high and low performers by Function/Department
  const deptPerformanceMap: Record<string, {
    high: { name: string; rating: number; grade: string; merit: number }[];
    low: { name: string; rating: number; grade: string; merit: number }[];
  }> = {};

  filtered.forEach((emp) => {
    const dept = getEmpFunction(emp);
    const ratingVal = getEmpRating(emp);
    const meritVal = getEmpMeritPct(emp) || 0;
    const grade = (emp["Grade"] || "").toString();
    const name = (emp["Employee Name"] || "Unknown").toString();

    if (ratingVal !== null) {
      if (!deptPerformanceMap[dept]) {
        deptPerformanceMap[dept] = { high: [], low: [] };
      }
      if (ratingVal >= 4) {
        deptPerformanceMap[dept].high.push({ name, rating: ratingVal, grade, merit: meritVal });
      } else if (ratingVal <= 2) {
        deptPerformanceMap[dept].low.push({ name, rating: ratingVal, grade, merit: meritVal });
      }
    }
  });

  // Sort lists
  Object.values(deptPerformanceMap).forEach((group) => {
    group.high.sort((a, b) => b.rating - a.rating || b.merit - a.merit);
    group.low.sort((a, b) => a.rating - b.rating || a.merit - b.merit);
  });

  // ----------------------------------------------------
  // 3. Budget Summary & Spend Analytics Calculations
  // ----------------------------------------------------
  let budgetKPIs = {
    allocated: 0,
    spend: 0,
    remaining: 0,
    utilization: 0,
    promotions: 0,
  };

  interface FuncBudgetRow {
    func: string;
    allocated: number;
    spend: number;
    remaining: number;
    utilization: number;
    promotions: number;
  }
  let funcBudgetList: FuncBudgetRow[] = [];

  const hasBudgetSummarySheet = budgetSummary && budgetSummary.length > 0;

  // Extract overall budget percentage from budgetSummary sheet if present
  let overallBudgetPct = 0.10; // Default to 10% (0.10) if not found
  if (budgetSummary && Array.isArray(budgetSummary)) {
    for (const row of budgetSummary) {
      if (Array.isArray(row)) {
        const idx = row.findIndex(cell => typeof cell === "string" && cell.toLowerCase().replace(/\s+/g, "").includes("overallbudget"));
        if (idx !== -1 && row[idx + 1] !== undefined) {
          const val = cleanNum(row[idx + 1]);
          if (val !== null) {
            overallBudgetPct = val > 1 ? val / 100 : val;
            break;
          }
        }
      }
    }
  }

  let calculatedSpend = 0;
  let totalCurrentCTC = 0;
  let promotionCount = 0;
  const funcDataMap: Record<string, { currentCTC: number; spend: number; promos: number }> = {};

  filtered.forEach((emp) => {
    const current = getEmpCurrentCTC(emp) || 0;
    const spend = getEmpSpend(emp);
    const func = getEmpFunction(emp);
    const isPromo = getEmpPromoStatus(emp);

    calculatedSpend += spend;
    totalCurrentCTC += current;
    if (isPromo) promotionCount++;

    if (!funcDataMap[func]) {
      funcDataMap[func] = { currentCTC: 0, spend: 0, promos: 0 };
    }
    funcDataMap[func].currentCTC += current;
    funcDataMap[func].spend += spend;
    if (isPromo) funcDataMap[func].promos++;
  });

  if (hasBudgetSummarySheet) {
    let keyMetricsHeaderIdx = -1;

    budgetSummary.forEach((row: any, idx: number) => {
      if (!Array.isArray(row)) return;
      if (row.some(cell => String(cell || "").toLowerCase().includes("total") && String(cell || "").toLowerCase().includes("budget"))) {
        if (keyMetricsHeaderIdx === -1) {
          keyMetricsHeaderIdx = idx;
        }
      }
    });

    if (keyMetricsHeaderIdx !== -1) {
      const headerRow = budgetSummary[keyMetricsHeaderIdx];
      const dataRow = budgetSummary[keyMetricsHeaderIdx + 1];
      if (dataRow) {
        headerRow.forEach((cell: any, colIdx: number) => {
          const s = String(cell || "").toLowerCase();
          const val = cleanNum(dataRow[colIdx]) || cleanNum(dataRow[colIdx + 1]) || 0;
          if (s.includes("total") && s.includes("budget") && !s.includes("spend") && !s.includes("utilization")) {
            budgetKPIs.allocated = val;
          }
          if (s.includes("spend") || s.includes("budget spend")) {
            budgetKPIs.spend = val;
          }
          if (s.includes("promotion") || s.includes("total promotion")) {
            budgetKPIs.promotions = val;
          }
        });
      }
    }

    if (budgetKPIs.allocated === 0) {
      budgetKPIs.allocated = totalCurrentCTC * overallBudgetPct;
    }
    if (budgetKPIs.spend === 0) {
      budgetKPIs.spend = calculatedSpend;
    }
    if (budgetKPIs.promotions === 0) {
      budgetKPIs.promotions = promotionCount;
    }

    budgetKPIs.remaining = budgetKPIs.allocated - budgetKPIs.spend;
    budgetKPIs.utilization = budgetKPIs.allocated > 0 ? (budgetKPIs.spend / budgetKPIs.allocated) * 100 : 0;
  } else {
    const calculatedBudget = totalCurrentCTC * overallBudgetPct;

    budgetKPIs = {
      allocated: calculatedBudget,
      spend: calculatedSpend,
      remaining: calculatedBudget - calculatedSpend,
      utilization: calculatedBudget > 0 ? (calculatedSpend / calculatedBudget) * 100 : 0,
      promotions: promotionCount,
    };
  }

  // Dynamically calculate budget, spend, promotions per function/department from the uploaded data
  funcBudgetList = Object.entries(funcDataMap).map(([func, fd]) => {
    const allocated = fd.currentCTC * overallBudgetPct;
    return {
      func: func.toUpperCase(), // Display in uppercase to match visual style
      allocated,
      spend: fd.spend,
      remaining: allocated - fd.spend,
      utilization: allocated > 0 ? (fd.spend / allocated) * 100 : 0,
      promotions: fd.promos,
    };
  });

  // Sort alphabetically by function name for clean display
  funcBudgetList.sort((a, b) => a.func.localeCompare(b.func));

  return (
    <div style={{ animation: "fadeIn 0.3s ease-in-out", fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>



      {/* ---------------------------------------------------- */}
      {/* SECTION 3: DEPARTMENT & FUNCTION TALENT ANALYSIS     */}
      {/* ---------------------------------------------------- */}
      <div className="card" style={{ padding: "28px", borderRadius: "16px", border: "1px solid #e2e8f0", background: "#ffffff", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", marginTop: "24px" }}>
        <div className="card-title" style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px", marginBottom: "20px" }}>
          <span style={{ fontSize: "24px" }}>👥</span>
          Department & Function Talent Analysis (High vs Low Performers)
        </div>
        <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "20px" }}>
          List of employees categorized by department or business function. **High Performers** are rated 4 or 5. **Low Performers** are rated 1 or 2.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          {Object.entries(deptPerformanceMap).map(([dept, data]) => {
            return (
              <div key={dept} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", boxShadow: "inset 0 1px 0 #fff" }}>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#1e293b", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  🏢 {dept}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  {/* High Performers */}
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "#166534", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px", borderBottom: "1px solid #dcfce7", paddingBottom: "4px" }}>
                      🟢 High ({data.high.length})
                    </div>
                    {data.high.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {data.high.map((emp, i) => (
                          <div key={i} style={{ fontSize: "11.5px", color: "#14532d", lineHeight: 1.4 }}>
                            <div style={{ fontWeight: 800 }}>{emp.name}</div>
                            <div style={{ fontSize: "10px", color: "#16a34a" }}>
                              Grade {emp.grade} · {emp.rating}★ · {(emp.merit * 100).toFixed(0)}% Inc
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: "10px", color: "#86efac", fontStyle: "italic" }}>None flagged</div>
                    )}
                  </div>

                  {/* Low Performers */}
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "#991b1b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px", borderBottom: "1px solid #fee2e2", paddingBottom: "4px" }}>
                      🔴 Low ({data.low.length})
                    </div>
                    {data.low.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {data.low.map((emp, i) => (
                          <div key={i} style={{ fontSize: "11.5px", color: "#7f1d1d", lineHeight: 1.4 }}>
                            <div style={{ fontWeight: 800 }}>{emp.name}</div>
                            <div style={{ fontSize: "10px", color: "#dc2626" }}>
                              Grade {emp.grade} · {emp.rating}★ · {(emp.merit * 100).toFixed(0)}% Inc
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: "10px", color: "#fca5a5", fontStyle: "italic" }}>None flagged</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {Object.keys(deptPerformanceMap).length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "#94a3b8" }}>
              No master department data flagged.
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECTION 4: BUDGET SUMMARY & SPEND ANALYTICS          */}
      {/* ---------------------------------------------------- */}
      <div className="card" style={{ padding: "28px", borderRadius: "16px", border: "1px solid #e2e8f0", background: "#ffffff", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", marginTop: "24px" }}>
        <div className="card-title" style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px", marginBottom: "20px" }}>
          <span style={{ fontSize: "24px" }}>💼</span>
          Budget Summary & Spend Analytics
        </div>

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          <div style={{ padding: "16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Allocated Budget</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1e293b", marginTop: "6px" }}>{formatInCr(budgetKPIs.allocated)}</div>
            <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>Standard target threshold</div>
          </div>

          <div style={{ padding: "16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Actual Spend</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10b981", marginTop: "6px" }}>{formatInCr(budgetKPIs.spend)}</div>
            <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>Sum of actual increments</div>
          </div>

          <div style={{ padding: "16px", borderRadius: "12px", background: budgetKPIs.remaining >= 0 ? "#f0fdf4" : "#fef2f2", border: "1px solid " + (budgetKPIs.remaining >= 0 ? "#bbf7d0" : "#fecaca"), textAlign: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: budgetKPIs.remaining >= 0 ? "#15803d" : "#b91c1c", textTransform: "uppercase", letterSpacing: "0.5px" }}>Remaining Budget</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: budgetKPIs.remaining >= 0 ? "#16a34a" : "#dc2626", marginTop: "6px" }}>{formatInCr(budgetKPIs.remaining)}</div>
            <div style={{ fontSize: "10px", color: budgetKPIs.remaining >= 0 ? "#166534" : "#991b1b", marginTop: "4px" }}>{budgetKPIs.remaining >= 0 ? "Under budget headroom" : "Budget deficit"}</div>
          </div>

          <div style={{ padding: "16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Budget Utilization</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: budgetKPIs.utilization > 100 ? "#ef4444" : "#3b82f6", marginTop: "6px" }}>{budgetKPIs.utilization.toFixed(1)}%</div>
            <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>Overall utilization index</div>
          </div>

          <div style={{ padding: "16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Promotion Count</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f59e0b", marginTop: "6px" }}>{budgetKPIs.promotions}</div>
            <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>Promoted employees count</div>
          </div>
        </div>

        {/* Budget vs Spend & Utilization Breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px" }}>
          {/* Left Column: Budget vs Spend Analysis */}
          <div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#475569", marginBottom: "16px" }}>Budget vs Spend by Function</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {funcBudgetList.map((item) => {
                const maxVal = Math.max(...funcBudgetList.map(i => Math.max(i.allocated, i.spend)), 1);
                const budgetWidth = (item.allocated / maxVal) * 100;
                const spendWidth = (item.spend / maxVal) * 100;

                return (
                  <div key={item.func} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#334155" }}>
                      <span>{item.func}</span>
                      <span style={{ color: "#64748b" }}>{formatInCr(item.spend)} spent vs {formatInCr(item.allocated)} budget</span>
                    </div>
                    {/* Double Bar chart */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px", background: "#f1f5f9", padding: "6px", borderRadius: "8px" }}>
                      {/* Budget row */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: "35px", fontSize: "9px", color: "#64748b", fontWeight: 700 }}>BUDGET</span>
                        <div style={{ flex: 1, height: "6px", background: "#e2e8f0", borderRadius: "3px" }}>
                          <div style={{ height: "100%", width: `${budgetWidth}%`, background: "#94a3b8", borderRadius: "3px" }} />
                        </div>
                      </div>
                      {/* Spend row */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: "35px", fontSize: "9px", color: "#10b981", fontWeight: 700 }}>SPEND</span>
                        <div style={{ flex: 1, height: "6px", background: "#e2e8f0", borderRadius: "3px" }}>
                          <div style={{ height: "100%", width: `${spendWidth}%`, background: item.spend > item.allocated ? "#ef4444" : "#10b981", borderRadius: "3px" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Spend Breakdown & Utilization Rank */}
          <div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#475569", marginBottom: "16px" }}>Function Budget Utilization</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f1f5f9", textAlign: "left", color: "#64748b" }}>
                    <th style={{ padding: "8px" }}>Function</th>
                    <th style={{ padding: "8px", textAlign: "right" }}>Actual</th>
                    <th style={{ padding: "8px", textAlign: "right" }}>Spend</th>
                    <th style={{ padding: "8px", textAlign: "right" }}>Promos</th>
                    <th style={{ padding: "8px", textAlign: "right" }}>Utilization</th>
                    <th style={{ padding: "8px", textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {funcBudgetList.map((item) => {
                    const isOver = item.utilization > 100;
                    const isUnder = item.utilization < 70;
                    const statusBg = isOver ? "#fee2e2" : isUnder ? "#fef3c7" : "#d1fae5";
                    const statusColor = isOver ? "#b91c1c" : isUnder ? "#b45309" : "#065f46";
                    const statusText = isOver ? "Over Budget" : isUnder ? "Underutilized" : "Optimal";

                    return (
                      <tr key={item.func} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px", fontWeight: 700, color: "#334155" }}>{item.func}</td>
                        <td style={{ padding: "8px", textAlign: "right" }}>{formatInLakhs(item.allocated)}</td>
                        <td style={{ padding: "8px", textAlign: "right" }}>{formatInLakhs(item.spend)}</td>
                        <td style={{ padding: "8px", textAlign: "right" }}>{item.promotions}</td>
                        <td style={{ padding: "8px", textAlign: "right", fontWeight: 800 }}>{item.utilization.toFixed(1)}%</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          <span style={{ padding: "2px 6px", borderRadius: "8px", fontSize: "10px", fontWeight: 700, background: statusBg, color: statusColor }}>
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECTION 5: OVERALL SUMMARY                           */}
      {/* ---------------------------------------------------- */}
      <div className="card" style={{ padding: "28px", borderRadius: "16px", border: "1px solid #e2e8f0", background: "#ffffff", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", marginTop: "24px" }}>
        <div className="card-title" style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px", marginBottom: "20px" }}>
          <span style={{ fontSize: "24px" }}>📊</span>
          OVERALL SUMMARY
        </div>
        <div>
          <img src="/33.83%20LAKH.png" alt="PMS Budget Utilization Summary" style={{ width: "100%", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
        </div>
      </div>

    </div>
  );
}
