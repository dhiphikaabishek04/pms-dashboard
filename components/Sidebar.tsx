"use client";
import React from "react";
import {
  DashboardIcon,
  TeamIcon,
  TrendUpIcon,
  HierarchyIcon,
  FinanceIcon,
  TargetIcon,
  BrainIcon,
} from "./Icons";

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  teamCount: number;
  onReset?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export default function Sidebar({ currentView, setView, teamCount, onReset }: SidebarProps) {
  const menuItems: MenuItem[] = [
    { id: "overview",    label: "Overview",                              icon: <DashboardIcon size={16} /> },
    { id: "workforce",   label: "Workforce Composition",                 icon: <TeamIcon size={16} /> },
    { id: "hiring",      label: "Hiring & Tenure Profile",               icon: <TrendUpIcon size={16} /> },
    { id: "grade",       label: "Grade & Designation",                   icon: <HierarchyIcon size={16} /> },
    { id: "rating-merit",label: "Rating Distribution & Merit Analytics", icon: <BrainIcon size={16} /> },
    { id: "performance", label: "Performance & Compensation",            icon: <FinanceIcon size={16} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <img
              src="/image (1).png"
              alt="ProConnect Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <h1 className="sidebar-title">
            PMS
          </h1>
        </div>

        {/* Section label */}
        <div className="nav-section-label">Analytics</div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`nav-item ${currentView === item.id ? "active" : ""}`}
              id={`nav-link-${item.id}`}
            >
              <span className="nav-item-icon">
                {item.icon}
              </span>
              <span style={{ flex: 1, lineHeight: 1.3 }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    background: "rgba(99,102,241,0.2)",
                    color: "#a5b4fc",
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "20px",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Headcount badge */}
        <div
          style={{
            margin: "20px 0 0",
            padding: "12px 14px",
            background: "rgba(15,23,42,0.025)",
            borderRadius: "10px",
            border: "1px solid rgba(15,23,42,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>
            Total Workforce
          </span>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 800,
              color: "#4f46e5",
              background: "rgba(99,102,241,0.1)",
              padding: "2px 10px",
              borderRadius: "20px",
              border: "1px solid rgba(99,102,241,0.15)",
            }}
          >
            {teamCount.toLocaleString()}
          </span>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          {onReset && (
            <button onClick={onReset} className="sidebar-upload-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" /><polyline points="23 20 23 14 17 14" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
              Upload New Roster
            </button>
          )}

          <div className="user-profile">
            <div className="avatar online">HA</div>
            <div className="user-info">
              <span className="user-name">HR Admin</span>
              <span className="user-role">HR Administrator</span>
            </div>
            <div className="user-status-dot" />
          </div>
        </div>

      </div>
    </aside>
  );
}
