"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Maid, Filters, ViewMode } from "@/types";
import { Header } from "@/components/Header";
import { FilterBar } from "@/components/FilterBar";
import { MaidGrid } from "@/components/MaidGrid";
import { MaidDetail } from "@/components/MaidDetail";
import { AdminPanel } from "@/components/AdminPanel";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("browse");
  const [maids, setMaids] = useState<Maid[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: "", nationality: "", category: "", rate: ""
  });
  const [selectedMaid, setSelectedMaid] = useState<Maid | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminAuth, setAdminAuth] = useState(false);

  const loadMaids = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("maids")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMaids((data || []) as Maid[]);
    } catch (err) {
      console.error("Failed to load maids:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMaids();
  }, [loadMaids]);

  const handleViewChange = (mode: ViewMode) => {
    if (mode === "admin" && !adminAuth) {
      const pwd = prompt("Enter admin password:");
      if (pwd === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "Summer@2025")) {
        setAdminAuth(true);
        setViewMode("admin");
      } else {
        alert("Incorrect password");
      }
    } else {
      setViewMode(mode);
    }
  };

  const nationalities = Array.from(new Set(maids.map((m) => m.nationality))).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Header viewMode={viewMode} onViewChange={handleViewChange} maidCount={maids.length} />
      <div className="p-4 max-w-6xl mx-auto">
        {viewMode === "browse" ? (
          <div className="flex flex-col gap-4">
            <FilterBar filters={filters} onFilterChange={setFilters} nationalities={nationalities} />
            <MaidGrid maids={maids} filters={filters} onViewDetail={setSelectedMaid} />
          </div>
        ) : (
          <AdminPanel maids={maids} onRefresh={loadMaids} />
        )}
      </div>
      {selectedMaid && (
        <MaidDetail
          maid={selectedMaid}
          onClose={() => setSelectedMaid(null)}
          onRefresh={loadMaids}
        />
      )}
    </div>
  );
}
