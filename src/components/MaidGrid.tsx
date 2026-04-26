"use client";
import React from "react";
import { Users } from "lucide-react";
import { Maid, Filters } from "@/types";
import { MaidCard } from "./MaidCard";

interface MaidGridProps {
  maids: Maid[];
  filters: Filters;
  onViewDetail: (maid: Maid) => void;
}

export const MaidGrid: React.FC<MaidGridProps> = ({ maids, filters, onViewDetail }) => {
  const filtered = maids.filter((m) => {
    if (filters.search && !m.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.nationality && m.nationality !== filters.nationality) return false;
    if (filters.location_type && m.location_type !== filters.location_type) return false;
    if (filters.status && m.status !== filters.status) return false;
    if (filters.category && m.category !== filters.category) return false;
    return true;
  });

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40">
        <Users size={48} />
        <p className="mt-3 text-lg">No housemaids found</p>
        <p className="text-sm">{maids.length === 0 ? "No housemaids available yet" : "Try adjusting your filters"}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-base-content/50 mb-3">Showing {filtered.length} of {maids.length} housemaids</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((maid) => (<MaidCard key={maid.id} maid={maid} onViewDetail={onViewDetail} />))}
      </div>
    </div>
  );
};
