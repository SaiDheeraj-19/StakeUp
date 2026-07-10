"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { AiInsights } from "@/components/AiInsights";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { WeatherWidget } from "@/features/dashboard/components/WeatherWidget";
import { TimeWidget } from "@/features/dashboard/components/TimeWidget";
import { UpcomingChallenges } from "@/features/dashboard/components/UpcomingChallenges";
import { LiveArenaFeed } from "@/features/dashboard/components/LiveArenaFeed";
import { HeatmapTimeline } from "@/features/planner/components/HeatmapTimeline";
import { api } from "@/lib/api";

export default function Dashboard() {
  const { user } = useAuthStore();
  const [greeting, setGreeting] = useState("Good morning");

  const [repairing, setRepairing] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const handleRepairStreak = async () => {
    setRepairing(true);
    try {
      await api.post('/auth/repair-streak');
      window.location.reload();
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      alert(error.response?.data?.detail || "Failed to repair streak");
    } finally {
      setRepairing(false);
    }
  };

  const hasLostStreak = user && user.current_streak === 0 && user.highest_streak > 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[32px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-4">
        <h1 className="text-2xl font-medium tracking-tight text-[#1a1a1a]">{greeting}, {user?.email?.split('@')[0]}</h1>
        <p className="text-[#1a1a1a]/50 mt-1 font-medium">Here's what's happening with your challenges today.</p>
      </div>

      {hasLostStreak && (
        <div className="bg-red-50 border-2 border-red-100 rounded-[32px] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
              <span className="text-2xl">💔</span> Streak Broken!
            </h2>
            <p className="text-red-600/80 font-medium">You lost your {user.highest_streak}-day streak! Repair it now to get it back.</p>
          </div>
          <button 
            onClick={handleRepairStreak}
            disabled={repairing}
            className="bg-red-600 text-white px-6 py-3 rounded-full font-bold hover:bg-red-700 transition-colors shrink-0 disabled:opacity-50"
          >
            {repairing ? "Repairing..." : "Repair for 500 SC"}
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <WeatherWidget />
        <TimeWidget />
        <UpcomingChallenges />
      </div>

      <AiInsights />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsDashboard />
        </div>
        <div className="lg:col-span-1 pt-6 flex flex-col">
          <HeatmapTimeline events={[]} />
          <div className="h-[430px]">
            <LiveArenaFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
