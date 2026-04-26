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
  const allNationalities = [...new Set([...nationalities, ...NATIONALITIES])].sort();

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
      <select className="select select-bordered select-sm" value={filters.location_type}
        onChange={(e) => onFilterChange({ ...filters, location_type: e.target.value })}>
        <option value="">All Locations</option>
        <option value="inside">🇦🇪 Inside Country</option>
        <option value="outside">✈️ Outside Country</option>
      </select>
      <select className="select select-bordered select-sm" value={filters.status}
        onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}>
        <option value="">All Status</option>
        <option value="available">✅ Available</option>
        <option value="booked">📌 Booked</option>
      </select>
      {(filters.search || filters.nationality || filters.location_type || filters.status || filters.category) && (
        <button className="btn btn-ghost btn-sm"
          onClick={() => onFilterChange({ search: "", nationality: "", location_type: "", status: "", category: "" })}>
          Clear
        </button>
      )}
    </div>
  );
};
