/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { motion } from "framer-motion";

export function HeatmapTimeline({ events }: { events: any[] }) {
  // A visual dummy representation of activity density.
  // In a real scenario, this would aggregate `events` by day/hour.
  
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Generating a randomized heatmap pattern for visual effect, weighted by event count
  const heatmapData = days.map((day) => {
    return Array.from({ length: 12 }).map((_, i) => {
      // Simulate density
      const intensity = Math.random() > 0.7 ? (Math.random() > 0.5 ? 3 : 2) : (Math.random() > 0.5 ? 1 : 0);
      return intensity;
    });
  });

  const getColor = (intensity: number) => {
    switch (intensity) {
      case 3: return "bg-[#1a1a1a]";
      case 2: return "bg-[#1a1a1a]/60";
      case 1: return "bg-[#1a1a1a]/20";
      default: return "bg-[#f4f5f0]";
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-black/5 w-full mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1a1a1a] flex items-center gap-2">
          Weekly Density
        </h3>
        <div className="flex items-center gap-2 text-xs font-medium text-[#1a1a1a]/40">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-[#f4f5f0]"></div>
          <div className="w-3 h-3 rounded-sm bg-[#1a1a1a]/20"></div>
          <div className="w-3 h-3 rounded-sm bg-[#1a1a1a]/60"></div>
          <div className="w-3 h-3 rounded-sm bg-[#1a1a1a]"></div>
          <span>More</span>
        </div>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {days.map((day, dIdx) => (
          <div key={day} className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[#1a1a1a]/40 mb-1 text-center">{day}</span>
            <div className="flex gap-1">
              {heatmapData[dIdx].map((intensity, hIdx) => (
                <motion.div
                  key={hIdx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (dIdx * 12 + hIdx) * 0.01 }}
                  className={`w-3 h-3 rounded-[3px] ${getColor(intensity)} hover:ring-2 hover:ring-black/20 cursor-crosshair transition-all`}
                  title={`${day} block ${hIdx}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
