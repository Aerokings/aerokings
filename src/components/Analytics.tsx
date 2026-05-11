"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  uniqueSessions: number;
  topPages: { page: string; count: number }[];
  hourlyData: { hour: string; count: number }[];
}

export function Analytics() {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const daysAgo = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : 30;
      const since = new Date();
      since.setDate(since.getDate() - daysAgo);

      // Total visitors in range
      const { data: allVisitors } = await supabase
        .from("visitors")
        .select("*", { count: "exact" })
        .gte("visited_at", since.toISOString());

      // Today's visitors
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: todayVisitors } = await supabase
        .from("visitors")
        .select("*", { count: "exact" })
        .gte("visited_at", today.toISOString());

      // Unique sessions
      const { data: allData } = await supabase
        .from("visitors")
        .select("session_id")
        .gte("visited_at", since.toISOString());

      const uniqueSessions = new Set(allData?.map(v => v.session_id)).size;

      // Top pages
      const { data: pageData } = await supabase
        .from("visitors")
        .select("page_path")
        .gte("visited_at", since.toISOString());

      const pageCounts = pageData?.reduce((acc: any, v) => {
        acc[v.page_path] = (acc[v.page_path] || 0) + 1;
        return acc;
      }, {}) || {};

      const topPages = Object.entries(pageCounts)
        .map(([page, count]) => ({ page, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Hourly breakdown
      const { data: hourlyData } = await supabase
        .from("visitors")
        .select("visited_at")
        .gte("visited_at", since.toISOString());

      const hourlyBreakdown: { [key: string]: number } = {};
      hourlyData?.forEach(v => {
        const hour = new Date(v.visited_at).getHours();
        hourlyBreakdown[hour] = (hourlyBreakdown[hour] || 0) + 1;
      });

      const hourlyStats = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        count: hourlyBreakdown[i] || 0,
      }));

      setStats({
        totalVisitors: allVisitors?.length || 0,
        todayVisitors: todayVisitors?.length || 0,
        uniqueSessions,
        topPages,
        hourlyData: hourlyStats,
      });
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📊 Analytics</h2>
        <div className="space-x-2">
          <button
            onClick={() => setTimeRange("24h")}
            className={`px-4 py-2 rounded ${timeRange === "24h" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            24h
          </button>
          <button
            onClick={() => setTimeRange("7d")}
            className={`px-4 py-2 rounded ${timeRange === "7d" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            7 days
          </button>
          <button
            onClick={() => setTimeRange("30d")}
            className={`px-4 py-2 rounded ${timeRange === "30d" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            30 days
          </button>
        </div>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-600">Total Visitors</div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.totalVisitors.toLocaleString()}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-gray-600">Today's Visitors</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.todayVisitors.toLocaleString()}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-sm text-gray-600">Unique Sessions</div>
              <div className="text-3xl font-bold text-purple-600">
                {stats.uniqueSessions.toLocaleString()}
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="text-sm text-gray-600">Avg/Day</div>
              <div className="text-3xl font-bold text-amber-600">
                {Math.round(stats.totalVisitors / (timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : 30)).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-bold mb-4">Top Pages</h3>
              <div className="space-y-2">
                {stats.topPages.map((page, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm">{page.page || "/"}</span>
                    <span className="font-bold">{page.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-bold mb-4">Peak Hours</h3>
              <div className="space-y-1 text-sm">
                {stats.hourlyData
                  .filter(h => h.count > 0)
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map((h, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{h.hour}</span>
                      <div className="w-32 bg-gray-200 rounded h-4" style={{
                        backgroundImage: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(h.count / Math.max(...stats.hourlyData.map(x => x.count))) * 100}%, #f3f4f6 ${(h.count / Math.max(...stats.hourlyData.map(x => x.count))) * 100}%, #f3f4f6 100%)`,
                      }} />
                      <span className="font-bold">{h.count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
