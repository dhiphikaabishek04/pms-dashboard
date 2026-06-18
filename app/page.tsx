"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ExcelUploadView from "../components/ExcelUploadView";
import { Employee } from "../components/MockHRData";

// HR Tab views
import OverviewView from "../components/OverviewView";
import WorkforceView from "../components/WorkforceView";
import HiringView from "../components/HiringView";
import GradeView from "../components/GradeView";
import PerformanceView from "../components/PerformanceView";
import LeadershipView from "../components/LeadershipView";
import RatingMeritView from "../components/RatingMeritView";

export default function Home() {
  const [currentView, setView] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [ratingSummary, setRatingSummary] = useState<any[] | null>(null);
  const [budgetSummary, setBudgetSummary] = useState<any[] | null>(null);
  const [fileName, setFileName] = useState("ProConnect_HR_Sheet.xlsx");

  // Client-side initialization: Load database from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem("aura_hr_employees");
    const storedName = localStorage.getItem("aura_hr_filename");
    const storedRating = localStorage.getItem("aura_hr_rating_summary");
    const storedBudget = localStorage.getItem("aura_hr_budget_summary");
    if (stored) {
      try {
        setEmployees(JSON.parse(stored));
        if (storedName) {
          setFileName(storedName);
        }
      } catch (e) {
        console.error("Failed to restore HR database.");
      }
    }
    if (storedRating) {
      try {
        setRatingSummary(JSON.parse(storedRating));
      } catch (e) {
        console.error("Failed to restore Rating Summary.");
      }
    }
    if (storedBudget) {
      try {
        setBudgetSummary(JSON.parse(storedBudget));
      } catch (e) {
        console.error("Failed to restore Budget Summary.");
      }
    }
  }, []);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleUploadSuccess = (parsedData: any[], name: string, parsedRating?: any[], parsedBudget?: any[]) => {
    setEmployees(parsedData);
    setFileName(name);
    localStorage.setItem("aura_hr_employees", JSON.stringify(parsedData));
    localStorage.setItem("aura_hr_filename", name);

    if (parsedRating) {
      setRatingSummary(parsedRating);
      localStorage.setItem("aura_hr_rating_summary", JSON.stringify(parsedRating));
    } else {
      setRatingSummary(null);
      localStorage.removeItem("aura_hr_rating_summary");
    }

    if (parsedBudget) {
      setBudgetSummary(parsedBudget);
      localStorage.setItem("aura_hr_budget_summary", JSON.stringify(parsedBudget));
    } else {
      setBudgetSummary(null);
      localStorage.removeItem("aura_hr_budget_summary");
    }
  };

  const handleResetData = () => {
    setEmployees(null);
    setFileName("");
    setRatingSummary(null);
    setBudgetSummary(null);
    localStorage.removeItem("aura_hr_employees");
    localStorage.removeItem("aura_hr_filename");
    localStorage.removeItem("aura_hr_rating_summary");
    localStorage.removeItem("aura_hr_budget_summary");
  };

  const getViewDetails = (viewId: string) => {
    switch (viewId) {
      case "overview":
        return {
          title: "ProConnect HR Intelligence Dashboard",
          subtitle: `Workforce analytics, performance, compensation & mobility insights · ${fileName}`,
        };
      case "workforce":
        return {
          title: "Workforce Composition",
          subtitle: `Headcount by function, band, designation & age · ${fileName}`,
        };
      case "hiring":
        return {
          title: "Hiring Momentum & Tenure Profile",
          subtitle: `Joining trends and workforce stability · ${fileName}`,
        };
      case "grade":
        return {
          title: "Grade & Designation Breakdown",
          subtitle: `Role-level distribution · ${fileName}`,
        };
      case "rating-merit":
        return {
          title: "RATING DISTRIBUTION & MERIT ANALYTICS",
          subtitle: `Bell curve alignment and average merit percentages · ${fileName}`,
        };
      case "performance":
        return {
          title: "Performance & Compensation",
          subtitle: `PMS ratings and salary data · ${fileName}`,
        };
      case "leadership":
        return {
          title: "Leadership Coverage & FY27 Priorities",
          subtitle: `HOD coverage and strategic agenda · ${fileName}`,
        };
      default:
        return {
          title: "ProConnect HR Intelligence",
          subtitle: `Workforce Analytics Console · ${fileName}`,
        };
    }
  };

  // If no workforce database has been initialized, prompt Excel Onboarding
  if (!employees) {
    return (
      <main className="app-container" style={{ justifyContent: "center", alignItems: "center" }}>
        <ExcelUploadView onUploadSuccess={handleUploadSuccess} />
      </main>
    );
  }

  const headerDetails = getViewDetails(currentView);

  return (
    <main className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setView={setView}
        teamCount={employees.length}
        onReset={handleResetData}
      />

      {/* Main Workspace Frame */}
      <div className="main-layout">
        <Header
          title={headerDetails.title}
          subtitle={headerDetails.subtitle}
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
        />

        {/* Content Viewport */}
        <div className="content-viewport">
          {currentView === "overview" && (
            <OverviewView employees={employees} searchQuery={searchQuery} />
          )}

          {currentView === "workforce" && (
            <WorkforceView employees={employees} searchQuery={searchQuery} />
          )}

          {currentView === "hiring" && (
            <HiringView employees={employees} searchQuery={searchQuery} />
          )}

          {currentView === "grade" && (
            <GradeView employees={employees} searchQuery={searchQuery} />
          )}

          {currentView === "rating-merit" && (
            <RatingMeritView
              employees={employees}
              searchQuery={searchQuery}
              ratingSummary={ratingSummary}
            />
          )}

          {currentView === "performance" && (
            <PerformanceView
              employees={employees}
              searchQuery={searchQuery}
              ratingSummary={ratingSummary}
              budgetSummary={budgetSummary}
            />
          )}

          {currentView === "leadership" && (
            <LeadershipView employees={employees} searchQuery={searchQuery} />
          )}
        </div>

        {/* Page Footer */}
        <footer
          style={{
            padding: "16px 32px",
            borderTop: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.8rem",
            color: "var(--foreground-muted)",
            background: "var(--bg-secondary)",
            flexShrink: 0,
          }}
        >
          <span>ProConnect HR Intelligence Dashboard</span>
          <span>© 2026 ProConnect. Confidential.</span>
        </footer>
      </div>
    </main>
  );
}
