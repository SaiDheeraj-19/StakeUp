"use client";

import { motion } from "framer-motion";
import { Trophy, Flame, Medal } from "lucide-react";
import { useLeaderboard, LeaderboardEntry } from "../api/useLeaderboard";

export function LeaderboardTable() {
  const { data, isLoading, error } = useLeaderboard(100);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-20 bg-white rounded-[24px] animate-pulse shadow-sm"></div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-48 flex items-center justify-center bg-white rounded-[32px] shadow-sm">
        <p className="text-sm text-[#1a1a1a]/50">Could not load leaderboard data.</p>
      </div>
    );
  }

  const renderRankIcon = (rank: number) => {
    if (rank === 1) return <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center"><Trophy className="w-4 h-4 text-amber-500" /></div>;
    if (rank === 2) return <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center"><Medal className="w-4 h-4 text-slate-400" /></div>;
    if (rank === 3) return <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center"><Medal className="w-4 h-4 text-orange-600" /></div>;
    return <span className="font-bold text-[#1a1a1a]/40 w-8 text-center">{rank}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Current User Summary Banner */}
      {data.current_user_rank && (
        <div className="bg-[#1a1a1a] rounded-[32px] p-8 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-sm text-white/50 font-medium tracking-wide uppercase">Your Global Rank</p>
            <p className="text-5xl font-medium text-white mt-2 tracking-tight">#{data.current_user_rank}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/70">Top {(data.current_user_rank / data.total_users * 100).toFixed(1)}%</p>
            <p className="text-xs text-white/40 mt-1 font-medium">of {data.total_users} users</p>
          </div>
        </div>
      )}

      {/* The Leaderboard List */}
      <div className="bg-white rounded-[40px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-6 border-b border-gray-100 text-xs font-semibold text-[#1a1a1a]/40 uppercase tracking-widest">
          <div className="col-span-2 md:col-span-1 text-center">Rank</div>
          <div className="col-span-5 md:col-span-6">Challenger</div>
          <div className="col-span-3 text-right">Score</div>
          <div className="col-span-2 text-right hidden md:block">Streak</div>
        </div>

        <div className="divide-y divide-gray-50 max-h-[700px] overflow-y-auto scrollbar-hide">
          {data.entries.map((entry: LeaderboardEntry, idx: number) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(idx * 0.02, 0.5) }}
              key={entry.user_id}
              className={`grid grid-cols-12 gap-4 p-6 items-center transition-colors hover:bg-gray-50 ${
                entry.is_current_user ? "bg-indigo-50/50" : ""
              }`}
            >
              <div className="col-span-2 md:col-span-1 flex justify-center">
                {renderRankIcon(entry.rank)}
              </div>
              <div className="col-span-5 md:col-span-6 flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0 ${
                   entry.is_current_user ? "bg-[#1a1a1a] text-white" : "bg-gray-100 text-[#1a1a1a]"
                }`}>
                  {entry.username.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="font-semibold text-base text-[#1a1a1a]">
                    {entry.username}
                    {entry.is_current_user && <span className="ml-2 px-2 py-0.5 bg-[#1a1a1a] rounded-full text-[10px] font-bold text-white tracking-wider uppercase">You</span>}
                  </p>
                </div>
              </div>
              <div className="col-span-3 text-right font-bold text-lg tabular-nums tracking-tight text-[#1a1a1a]">
                {entry.commitment_score.toLocaleString()}
              </div>
              <div className="col-span-2 text-right hidden md:flex items-center justify-end font-medium tabular-nums text-[#1a1a1a]/50">
                {entry.current_streak > 0 ? (
                  <div className="flex items-center px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold">
                    <span className="mr-1">{entry.current_streak}</span>
                    <Flame className="w-3 h-3" />
                  </div>
                ) : (
                  <span className="text-[#1a1a1a]/30">-</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
