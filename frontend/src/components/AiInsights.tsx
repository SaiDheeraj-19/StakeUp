"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { Sparkles, Flame, Loader2, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useGeolocation } from "@/hooks/useGeolocation";

export function AiInsights() {
  const { user } = useAuthStore();
  const [insight, setInsight] = useState("Loading your daily motivation...");
  const [mode, setMode] = useState<"toast" | "roast">("toast");
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const { lat, lon } = useGeolocation();

  useEffect(() => {
    // Toggle Hardcore Mode CSS class on body
    if (mode === "roast") {
      document.body.classList.add("hardcore-mode");
    } else {
      document.body.classList.remove("hardcore-mode");
    }
  }, [mode]);

  useEffect(() => {
    const fetchInsight = async () => {
      if (!user) return;
      setLoading(true);
      try {
        let url = `/insights/?mode=${mode}`;
        if (lat && lon) {
          url += `&lat=${lat}&lon=${lon}`;
        }
        const response = await api.get(url);
        setInsight(response.data.insight);
      } catch (error) {
        setInsight(mode === "roast" 
          ? "Your couch is comfortable, but it doesn't pay the bills. Get to work."
          : "Your consistency is outstanding. Keep protecting your streak.");
      } finally {
        setLoading(false);
      }
    };
    fetchInsight();
  }, [user, lat, lon, mode]);

  const playAudio = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    
    try {
      const url = `${api.defaults.baseURL}/insights/tts?text=${encodeURIComponent(insight)}&mode=${mode}`;
      const audio = new Audio(url);
      
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      
      await audio.play();
    } catch (err) {
      console.error("Failed to play audio:", err);
      setIsPlaying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className={`rounded-[32px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between transition-colors duration-500 ${mode === "roast" ? "bg-red-50/50" : "bg-white"}`}>
        
        {/* Soft colorful blur background purely for decoration */}
        <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[60px] pointer-events-none transition-colors duration-500 ${mode === "roast" ? "bg-red-500/10" : "bg-teal-500/10"}`}></div>
        <div className={`absolute -left-20 -bottom-20 w-40 h-40 rounded-full blur-[40px] pointer-events-none transition-colors duration-500 ${mode === "roast" ? "bg-orange-500/10" : "bg-purple-500/10"}`}></div>
        
        <div className="flex items-start space-x-6 relative z-10 flex-1">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg transition-colors duration-500 ${mode === "roast" ? "bg-red-500" : "bg-black"}`}>
            {mode === "roast" ? <Flame className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-white" />}
          </div>
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1a1a1a]/40">
                {mode === "roast" ? "Reality Check" : "Daily Motivation"}
              </h3>
              {!loading && (
                <button 
                  onClick={playAudio} 
                  disabled={isPlaying}
                  className={`p-1.5 rounded-full transition-colors ${isPlaying ? 'bg-[#1a1a1a]/10' : 'hover:bg-[#1a1a1a]/5'}`}
                  title="Listen to Insight"
                >
                  <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-blue-500 animate-pulse' : 'text-[#1a1a1a]/40'}`} />
                </button>
              )}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={insight}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-[#1a1a1a] text-lg font-medium leading-relaxed max-w-3xl min-h-[56px] flex items-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#1a1a1a]/30" /> : insight}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Roast/Toast Toggle */}
        <div className="relative z-10 mt-6 md:mt-0 flex items-center bg-black/5 rounded-full p-1 shrink-0">
          <button
            onClick={() => setMode("toast")}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${mode === "toast" ? "bg-white shadow-sm text-black" : "text-[#1a1a1a]/50 hover:text-[#1a1a1a]"}`}
          >
            Toast
          </button>
          <button
            onClick={() => setMode("roast")}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1 ${mode === "roast" ? "bg-red-500 shadow-sm text-white" : "text-[#1a1a1a]/50 hover:text-[#1a1a1a]"}`}
          >
            <Flame className="w-3.5 h-3.5" /> Roast
          </button>
        </div>
      </div>
    </motion.div>
  );
}
