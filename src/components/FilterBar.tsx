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
  { label: "Under 3,000 AED", min: 0, max: 3000 },
  { label: "3,000 – 5,000 AED", min: 3000, max: 5000 },
  { label: "5,000 – 7,000 AED", min: 5000, max: 7000 },
  { label: "7,000 – 10,000 AED", min: 7000, max: 10000 },
  { label: "Above 10,000 AED", min: 10000, max: 999999 },
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
      <select className="select select-bordered select-sm" value={filters.rate}
        onChange={(e) => onFilterChange({ ...filters, rate: e.target.value })}>
        <option value="">All Rates</option>
        {RATE_RANGES.map((r, i) => (<option key={i} value={String(i)}>{r.label}</option>))}
      </select>
      {(filters.search || filters.nationality || filters.category || filters.rate) && (
        <button className="btn btn-ghost btn-sm"
          onClick={() => onFilterChange({ search: "", nationality: "", category: "", rate: "" })}>
          Clear
        </button>
      )}
    </div>
  );
};

export { RATE_RANGES };
