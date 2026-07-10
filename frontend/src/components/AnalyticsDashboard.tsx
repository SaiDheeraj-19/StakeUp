/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Trophy, TrendingUp, AlertTriangle, ShieldAlert } from "lucide-react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

export function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("7d");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get("/analytics/summary");
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch analytics summary", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-[32px] animate-pulse shadow-sm"></div>
          ))}
        </div>
        <div className="h-[320px] bg-white rounded-[32px] animate-pulse shadow-sm"></div>
      </div>
    );
  }

  if (!data) return null;

  const chartData = data.weekly_consistency.map((item: any) => ({
    name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    checkins: item.count
  }));

  const timeframes = ["24h", "7d", "31d", "All"];

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-medium text-[#1a1a1a]">Overview</h2>
          <p className="text-sm text-[#1a1a1a]/50 mt-1">Key metrics across your active challenges</p>
        </div>
        
        {/* Pill-shaped Tabs */}
        <div className="flex items-center bg-white rounded-full p-1 shadow-sm">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                timeframe === tf 
                  ? "bg-[#1a1a1a] text-white shadow-md" 
                  : "text-[#1a1a1a]/60 hover:text-[#1a1a1a]"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Metric Card 1 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.0 }}>
          <div className="bg-white rounded-[32px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] h-full flex flex-col justify-between">
            <div className="flex items-center text-[#1a1a1a]/60 mb-6">
              <TrendingUp className="w-5 h-5 mr-3 text-emerald-500" />
              <span className="text-sm font-medium">Completion Rate</span>
            </div>
            <div>
              <div className="flex items-end space-x-3">
                <span className="text-5xl font-medium text-[#1a1a1a] tracking-tight">{data.completion_rate}%</span>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold mb-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />+5
                </span>
              </div>
              <p className="text-xs text-[#1a1a1a]/40 mt-2">vs previous period</p>
            </div>
          </div>
        </motion.div>
        
        {/* Metric Card 2 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-white rounded-[32px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] h-full flex flex-col justify-between">
            <div className="flex items-center text-[#1a1a1a]/60 mb-6">
              <ShieldAlert className="w-5 h-5 mr-3 text-amber-500" />
              <span className="text-sm font-medium">Total Staked</span>
            </div>
            <div>
              <div className="flex items-end space-x-3">
                <span className="text-5xl font-medium text-[#1a1a1a] tracking-tight">{data.total_staked}</span>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold mb-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />+12
                </span>
              </div>
              <p className="text-xs text-[#1a1a1a]/40 mt-2">vs previous period</p>
            </div>
          </div>
        </motion.div>

        {/* Metric Card 3 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="bg-white rounded-[32px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] h-full flex flex-col justify-between">
            <div className="flex items-center text-[#1a1a1a]/60 mb-6">
              <Trophy className="w-5 h-5 mr-3 text-emerald-500" />
              <span className="text-sm font-medium">Points Won</span>
            </div>
            <div>
              <div className="flex items-end space-x-3">
                <span className="text-5xl font-medium text-[#1a1a1a] tracking-tight">{data.total_won}</span>
              </div>
              <p className="text-xs text-[#1a1a1a]/40 mt-2">From completed challenges</p>
            </div>
          </div>
        </motion.div>

        {/* Metric Card 4 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="bg-white rounded-[32px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] h-full flex flex-col justify-between">
            <div className="flex items-center text-[#1a1a1a]/60 mb-6">
              <AlertTriangle className="w-5 h-5 mr-3 text-red-400" />
              <span className="text-sm font-medium">Points Lost</span>
            </div>
            <div>
              <div className="flex items-end space-x-3">
                <span className="text-5xl font-medium text-[#1a1a1a] tracking-tight">{data.total_lost}</span>
                <span className="px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold mb-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1 rotate-180" />-3
                </span>
              </div>
              <p className="text-xs text-[#1a1a1a]/40 mt-2">From failed challenges</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chart Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="bg-white rounded-[32px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-medium text-[#1a1a1a]">Check-in Activity</h3>
              <p className="text-sm text-[#1a1a1a]/50">Analysis across all active challenges</p>
            </div>
            
            <div className="flex items-center space-x-2 bg-gray-50 rounded-full p-1">
              <button className="px-4 py-1.5 text-xs font-medium bg-white shadow-sm rounded-full">Chart</button>
              <button className="px-4 py-1.5 text-xs font-medium text-[#1a1a1a]/50">List</button>
            </div>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCheckinsLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#1a1a1a', opacity: 0.5, fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                    color: '#1a1a1a',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ color: '#0f766e', fontWeight: 600 }}
                  cursor={{ stroke: 'rgba(0,0,0,0.05)', strokeWidth: 1 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="checkins" 
                  stroke="#2dd4bf" 
                  fillOpacity={1} 
                  fill="url(#colorCheckinsLight)" 
                  strokeWidth={4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
