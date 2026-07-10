"use client";

import { motion } from "framer-motion";

export default function DashboardLoading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full dark:border-zinc-50 dark:border-t-transparent mb-4"
      />
      <p className="text-sm font-medium text-zinc-500 animate-pulse">
        Loading your workspace...
      </p>
    </div>
  );
}
