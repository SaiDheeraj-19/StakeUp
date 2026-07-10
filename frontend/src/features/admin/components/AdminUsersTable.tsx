"use client";

import { useAdminUsers, AdminUser } from "../api/useAdmin";
import { motion } from "framer-motion";
import { Shield, ShieldAlert } from "lucide-react";

export function AdminUsersTable() {
  const { data, isLoading, error } = useAdminUsers();

  if (isLoading) {
    return (
      <div className="space-y-4 mt-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-zinc-900/50 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-48 mt-8 flex items-center justify-center bg-red-900/20 border border-red-500/50 text-red-400 rounded-xl">
        <p>{error || "Failed to load users"}</p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-zinc-100">User Management</h2>
        <span className="text-xs text-zinc-500">{data.total} total users</span>
      </div>
      
      <div className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-800 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
        <div className="col-span-5">Email</div>
        <div className="col-span-3">Commitment Score</div>
        <div className="col-span-2 text-center">Role</div>
        <div className="col-span-2 text-right">Joined</div>
      </div>

      <div className="divide-y divide-zinc-800 max-h-[500px] overflow-y-auto">
        {data.items.map((user: AdminUser, idx: number) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.05, 0.5) }}
            key={user.id}
            className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-zinc-800/50 transition-colors"
          >
            <div className="col-span-5 font-medium text-sm text-zinc-300 truncate">
              {user.email}
            </div>
            <div className="col-span-3 font-mono text-zinc-400">
              {user.commitment_score}
            </div>
            <div className="col-span-2 flex justify-center">
              {user.is_superuser ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-900/50 text-indigo-400 border border-indigo-500/30">
                  <Shield className="w-3 h-3 mr-1" /> Admin
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400">
                  User
                </span>
              )}
            </div>
            <div className="col-span-2 text-right text-xs text-zinc-500">
              {new Date(user.created_at).toLocaleDateString()}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
