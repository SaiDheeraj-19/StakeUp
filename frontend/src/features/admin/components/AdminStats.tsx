"use client";

import { Users, Target, Activity } from "lucide-react";
import { useAdminStats } from "../api/useAdmin";
import { motion } from "framer-motion";

export function AdminStats() {
  const { data, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-zinc-900/50 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-32 flex items-center justify-center bg-red-900/20 border border-red-500/50 text-red-400 rounded-xl">
        <p>{error || "Failed to load stats"}</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: data.total_users, icon: Users, color: "text-blue-400" },
    { label: "Active Challenges", value: data.total_active_challenges, icon: Target, color: "text-emerald-400" },
    { label: "Total Mock Stakes", value: data.total_mock_stakes.toLocaleString(), icon: Activity, color: "text-amber-400" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statCards.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium text-sm">{stat.label}</h3>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <p className="text-3xl font-bold text-zinc-100">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
