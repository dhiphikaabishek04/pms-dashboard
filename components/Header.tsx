import React from "react";
import { SearchIcon, BellIcon, PlusIcon } from "./Icons";

interface HeaderProps {
  title: string;
  subtitle: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddClick?: () => void;
  addButtonLabel?: string;
}

export default function Header({
  title,
  subtitle,
  searchQuery,
  setSearchQuery,
  onAddClick,
  addButtonLabel,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header-title-container">
        <h2>{title}</h2>
        <span className="header-subtitle">{subtitle}</span>
      </div>

      <div className="header-actions">
        <div className="search-container">
          <div className="search-icon-wrapper">
            <SearchIcon size={16} />
          </div>
          <input
            type="text"
            placeholder="Search workspace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            id="search-workspace-input"
          />
        </div>

        <div className="notification-bell" title="Notifications">
          <BellIcon size={18} />
          <div className="notification-dot"></div>
        </div>

        {onAddClick && addButtonLabel && (
          <button onClick={onAddClick} className="glow-btn" id="header-action-btn">
            <PlusIcon size={16} />
            <span>{addButtonLabel}</span>
          </button>
        )}
      </div>
    </header>
  );
}
