"use client";
import React from "react";
import { Crown, Users, Settings } from "lucide-react";
import { ViewMode } from "@/types";

interface HeaderProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  maidCount: number;
}

export const Header: React.FC<HeaderProps> = ({ viewMode, onViewChange, maidCount }) => {
  return (
    <div className="navbar bg-base-200 px-4 shadow-sm sticky top-0 z-50">
      <div className="navbar-start">
        <div className="flex items-center gap-2">
          <Crown className="text-primary" size={24} />
          <span className="text-lg font-bold tracking-wide">
            <span className="text-primary">AERO</span>
            <span className="text-secondary">KINGS</span>
          </span>
        </div>
      </div>
      <div className="navbar-center">
        <div className="tabs tabs-boxed bg-base-300">
          <button
            className={`tab gap-1 ${viewMode === "browse" ? "tab-active" : ""}`}
            onClick={() => onViewChange("browse")}
          >
            <Users size={14} />
            Browse ({maidCount})
          </button>
          <button
            className={`tab gap-1 ${viewMode === "admin" ? "tab-active" : ""}`}
            onClick={() => onViewChange("admin")}
          >
            <Settings size={14} />
            Admin
          </button>
        </div>
      </div>
      <div className="navbar-end">
        <span className="text-xs text-base-content/50">Dubai Recruitment</span>
      </div>
    </div>
  );
};
