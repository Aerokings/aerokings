"use client";
import React from "react";
import { Search, Filter } from "lucide-react";
import { Filters } from "@/types";
import { NATIONALITIES, CATEGORIES } from "@/utils/helpers";

interface FilterBarProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  nationalities: string[];
}

const RATE_RANGES = [
  { label: "Under AED 5,000", value: "0-5000" },
  { label: "AED 5,000 - 10,000", value: "5000-10000" },
  { label: "AED 10,000 - 15,000", value: "10000-15000" },
];

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, nationalities }) => {
  const allNationalities = Array.from(new Set([...nationalities, ...NATIONALITIES])).sort();

  return (
    <div className="bg-base-200 p-4 rounded-xl flex flex-wrap gap-3 items-center">
      <Filter size={16} className="opacity-50" />
      <label className="input input-bordered input-sm flex items-center gap-2 flex-1 min-w-[180px]">
        <Search className="h-[1em] opacity-50" />
        <input
          type="search"
          className="grow"
          placeholder="Search by name..."
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        />
      </label>
      <select className="select select-bordered select-sm" value={filters.nationality}
        onChange={(e) => onFilterChange({ ...filters, nationality: e.target.value })}>
        <option value="">All Nationalities</option>
        {allNationalities.map((n) => (<option key={n} value={n}>{n}</option>))}
      </select>
      <select className="select select-bordered select-sm" value={filters.category}
        onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}>
        <option value="">All Categories</option>
        {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
      </select>
      <select className="select select-bordered select-sm" value={filters.rateRange}
        onChange={(e) => onFilterChange({ ...filters, rateRange: e.target.value })}>
        <option value="">All Rates</option>
        {RATE_RANGES.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
      </select>
      {(filters.search || filters.nationality || filters.category || filters.rateRange) && (
        <button className="btn btn-ghost btn-sm"
          onClick={() => onFilterChange({ search: "", nationality: "", category: "", rateRange: "" })}>
          Clear
        </button>
      )}
    </div>
  );
};
