"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Activity, Target, Flame, Calendar, MapPin, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/goals/history");
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 p-2 rounded-[24px] border border-black/5 shadow-sm">
        <div className="flex-1 max-w-md relative pl-2">
          <Search className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 text-[#1a1a1a]/40" />
          <input 
            type="text" 
            placeholder="Search history..." 
            className="w-full bg-white pl-10 pr-4 py-2.5 rounded-full text-sm font-medium border-none shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10"
          />
        </div>
        <div className="flex items-center gap-2 pr-2">
          <button className="flex items-center px-4 py-2.5 bg-white rounded-full text-sm font-medium text-[#1a1a1a]/70 shadow-sm hover:text-[#1a1a1a] transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-[32px] animate-pulse shadow-[0_2px_10px_rgba(0,0,0,0.02)]"></div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center bg-white rounded-[40px] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <Activity className="w-12 h-12 text-[#1a1a1a]/20 mb-4" />
          <h3 className="text-xl font-medium text-[#1a1a1a] mb-2">No history yet</h3>
          <p className="text-sm text-[#1a1a1a]/50 text-center max-w-sm">
            Complete or abandon a challenge for it to appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4 relative">
          
          <div className="absolute left-8 top-8 bottom-8 w-px bg-gray-200 z-0"></div>

          {history.map((goal: any, idx: number) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="relative z-10 flex"
            >
              <div className="w-16 flex-shrink-0 flex justify-center pt-8">
                <div className="w-3 h-3 rounded-full bg-[#1a1a1a] ring-4 ring-white shadow-sm"></div>
              </div>
              
              <div className="flex-1 bg-white rounded-[32px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-lg transition-shadow border border-transparent hover:border-black/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                  <div>
                    <h3 className="font-semibold text-[#1a1a1a] text-lg">{goal.title}</h3>
                    <p className="text-sm text-[#1a1a1a]/50 flex items-center mt-1">
                      <Calendar className="w-4 h-4 mr-1.5 opacity-70" />
                      {new Date(goal.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {goal.status === "completed" && (
                      <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold">
                        Completed
                      </div>
                    )}
                    {goal.status === "abandoned" && (
                      <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold">
                        Abandoned
                      </div>
                    )}
                    {goal.mock_stake > 0 && (
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        goal.status === "completed" 
                          ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                          : "bg-red-50 border-red-100 text-red-600"
                      }`}>
                        {goal.status === "completed" ? "+" : "-"}{goal.mock_stake} pts
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-[#1a1a1a]/50 font-medium mb-1 uppercase tracking-wider">Final Streak</p>
                    <p className="font-semibold text-[#1a1a1a] flex items-center">
                      <Flame className="w-4 h-4 text-orange-500 mr-1.5" />
                      {goal.current_streak} days
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#1a1a1a]/50 font-medium mb-1 uppercase tracking-wider">Frequency</p>
                    <p className="font-semibold text-[#1a1a1a] flex items-center">
                      <Target className="w-4 h-4 text-blue-500 mr-1.5" />
                      {goal.target_frequency}x daily
                    </p>
                  </div>
                  <div className="md:col-span-2 flex justify-end items-center">
                    <button className="text-sm font-semibold text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors">
                      View details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
