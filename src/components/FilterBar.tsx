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
      <div className="flex items-center gap-1">
        <span className="text-xs opacity-60 whitespace-nowrap">💰 Salary:</span>
        <input
          type="number"
          className="input input-bordered input-sm w-24"
          placeholder="Min AED"
          value={filters.priceMin}
          onChange={(e) => onFilterChange({ ...filters, priceMin: e.target.value })}
        />
        <span className="text-xs opacity-50">–</span>
        <input
          type="number"
          className="input input-bordered input-sm w-24"
          placeholder="Max AED"
          value={filters.priceMax}
          onChange={(e) => onFilterChange({ ...filters, priceMax: e.target.value })}
        />
      </div>
      {(filters.search || filters.nationality || filters.category || filters.priceMin || filters.priceMax) && (
        <button className="btn btn-ghost btn-sm"
          onClick={() => onFilterChange({ search: "", nationality: "", category: "", priceMin: "", priceMax: "" })}>
          Clear
        </button>
      )}
    </div>
  );
};
