"use client";

import { useState, useEffect } from "react";
import { Target, Plus, CheckCircle2, AlertCircle, Clock, CheckSquare } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Hover3DCard } from "@/components/Hover3DCard";

export default function ChallengesPage() {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Active");

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await api.get("/goals/");
        setGoals(response.data);
      } catch (error) {
        console.error("Failed to fetch goals", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const tabs = ["Active", "Completed", "Abandoned", "All"];

  return (
    <div className="space-y-6">
      
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 p-2 rounded-full border border-black/5 shadow-sm">
        
        {/* Pill-shaped Tabs */}
        <div className="flex items-center space-x-1 pl-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === tab 
                  ? "bg-white text-[#1a1a1a] shadow-sm" 
                  : "text-[#1a1a1a]/50 hover:text-[#1a1a1a]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pr-2">
          <Link 
            href="/goals/new" 
            className="bg-[#1a1a1a] text-white hover:bg-black px-6 py-2.5 rounded-full text-sm font-medium transition-transform inline-flex items-center shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add challenge
          </Link>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-[32px] animate-pulse shadow-[0_2px_10px_rgba(0,0,0,0.02)]"></div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center bg-white rounded-[40px] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <Target className="w-12 h-12 text-[#1a1a1a]/20 mb-4" />
          <h3 className="text-xl font-medium text-[#1a1a1a] mb-2">No active challenges</h3>
          <p className="text-sm text-[#1a1a1a]/50 text-center max-w-sm mb-6">
            Commit to something meaningful today and start tracking your consistency.
          </p>
          <Link href="/goals/new" className="bg-[#1a1a1a] text-white hover:bg-black px-8 py-3 rounded-full text-sm font-medium shadow-md">
            Create your first challenge
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal: any, i) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="group h-full"
            >
              <Hover3DCard>
                <div className="bg-white rounded-[32px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-transparent hover:border-black/5" style={{ transform: "translateZ(20px)" }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1a1a1a] text-base leading-tight line-clamp-1">{goal.title}</h3>
                      <p className="text-xs text-[#1a1a1a]/50 mt-1">Started {new Date(goal.start_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-6">
                  <div className="flex space-x-2">
                    {(() => {
                      const todayStr = new Date().toISOString().split('T')[0];
                      const todayCount = goal.check_ins?.filter((c: any) => c.created_at.startsWith(todayStr)).length || 0;
                      const isCompletedToday = todayCount >= goal.target_frequency;
                      
                      return (
                        <div className={`px-3 py-1 text-xs font-semibold rounded-full capitalize border ${
                          isCompletedToday 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                            : "bg-emerald-50 text-emerald-600 border-transparent"
                        }`}>
                          {isCompletedToday ? "Completed Today" : goal.status}
                        </div>
                      );
                    })()}
                    {goal.mock_stake > 0 && (
                      <div className="px-3 py-1 bg-gray-50 text-[#1a1a1a]/60 text-xs font-semibold rounded-full border border-gray-100">
                        {goal.mock_stake} pts
                      </div>
                    )}
                  </div>
                  <Link 
                    href={`/goals/${goal.id}`}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-[#1a1a1a]/40 hover:text-[#1a1a1a] hover:border-[#1a1a1a]/20 transition-colors"
                  >
                    <CheckSquare className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              </Hover3DCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
