"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import { CustomCalendar } from "@/features/planner/components/Calendar";
import { Sparkles, Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import { HeatmapTimeline } from "@/features/planner/components/HeatmapTimeline";

export default function PlannerPage() {
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [tasksText, setTasksText] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  const fetchEvents = async () => {
    try {
      const response = await api.get("/events/");
      setEvents(response.data);
    } catch (error) {
      console.error("Failed to fetch events", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEvents();
  }, [user]);

  const handleAutoSchedule = async () => {
    if (!tasksText.trim()) return;
    setIsScheduling(true);
    
    // Split by newlines or commas
    const tasks = tasksText.split(/\n|,/).map(t => t.trim()).filter(t => t.length > 0);
    
    try {
      await api.post("/events/auto-schedule", { tasks });
      setTasksText("");
      await fetchEvents();
    } catch (error) {
      console.error("Failed to auto schedule", error);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-160px)]">
      
      {/* Sidebar: AI Scheduler Input */}
      <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
        <div className="bg-white rounded-[32px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-black/5 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-[#1a1a1a]">AI Scheduler</h2>
              <p className="text-xs text-[#1a1a1a]/50">Powered by Gemini</p>
            </div>
          </div>
          
          <p className="text-sm text-[#1a1a1a]/70 mb-4">
            Type out your loose tasks (one per line). AI will find the optimal time slots for them in your calendar.
          </p>

          <textarea
            value={tasksText}
            onChange={(e) => setTasksText(e.target.value)}
            placeholder="e.g.&#10;1 hour deep work session&#10;30 min cardio&#10;Read 2 chapters"
            className="w-full flex-1 bg-[#f4f5f0] border-none text-[#1a1a1a] rounded-2xl p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/20 shadow-inner resize-none mb-4 text-sm"
          />

          <button
            onClick={handleAutoSchedule}
            disabled={isScheduling || !tasksText.trim()}
            className="w-full h-12 bg-[#1a1a1a] hover:bg-black text-white rounded-full font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isScheduling ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isScheduling ? "Scheduling..." : "Auto-Schedule"}
          </button>
        </div>
      </div>

      {/* Main Calendar View */}
      <div className="flex-1 min-w-0 flex flex-col">
        <HeatmapTimeline events={events} />
        <div className="flex-1 min-h-0">
          <CustomCalendar events={events} setEvents={setEvents} fetchEvents={fetchEvents} />
        </div>
      </div>

    </div>
  );
}
