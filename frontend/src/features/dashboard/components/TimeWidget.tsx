"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export function TimeWidget() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[32px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between h-full border border-black/5"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[30px] pointer-events-none"></div>

      <div className="flex justify-between items-start z-10 relative">
        <div className="flex items-center gap-1 text-[#1a1a1a]/40 text-xs font-bold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" />
          <span>Local Time</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 z-10 relative">
        <div>
          <div className="text-3xl font-bold text-[#1a1a1a] tracking-tighter" style={{ fontVariantNumeric: "tabular-nums" }}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-sm font-medium text-[#1a1a1a]/60">
            {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
