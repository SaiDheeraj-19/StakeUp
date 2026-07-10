"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Target, Zap, ShieldAlert, Award } from "lucide-react";

interface FeedItem {
  id: string;
  user: string;
  action: string;
  type: "success" | "fail" | "neutral";
  timestamp: Date;
}

const mockUsers = ["Alex_Dev", "SarahM", "CryptoKing", "DesignGuru", "FitnessFreak", "CodeNinja", "MorningPerson"];
const mockActions = [
  { text: "just secured 500 SC in a coding battle!", type: "success" as const, icon: <Award className="w-4 h-4 text-yellow-500" /> },
  { text: "verified their morning 5km run.", type: "success" as const, icon: <Zap className="w-4 h-4 text-green-500" /> },
  { text: "broke a 14-day streak... Ouch.", type: "fail" as const, icon: <ShieldAlert className="w-4 h-4 text-red-500" /> },
  { text: "created a new 1v1 battle.", type: "neutral" as const, icon: <Target className="w-4 h-4 text-blue-500" /> },
  { text: "completed 'Read 30 mins'.", type: "success" as const, icon: <ShieldCheck className="w-4 h-4 text-green-500" /> },
];

export function LiveArenaFeed() {
  const [feed, setFeed] = useState<FeedItem[]>([]);

  useEffect(() => {
    // Initial feed
    const initialFeed = Array.from({ length: 4 }).map((_, i) => ({
      id: Math.random().toString(),
      user: mockUsers[Math.floor(Math.random() * mockUsers.length)],
      ...mockActions[Math.floor(Math.random() * mockActions.length)],
      timestamp: new Date(Date.now() - i * 60000),
    }));
    setFeed(initialFeed);

    // Add new item every 5-15 seconds
    const interval = setInterval(() => {
      const newItem = {
        id: Math.random().toString(),
        user: mockUsers[Math.floor(Math.random() * mockUsers.length)],
        ...mockActions[Math.floor(Math.random() * mockActions.length)],
        timestamp: new Date(),
      };
      
      setFeed(prev => [newItem, ...prev].slice(0, 8)); // keep max 8 items
    }, Math.random() * 10000 + 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-black/5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <h3 className="font-bold text-[#1a1a1a] tracking-tight">Live Arena</h3>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent z-10" />
        
        <div className="space-y-4 pt-2">
          <AnimatePresence initial={false}>
            {feed.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex gap-3 text-sm"
              >
                <div className="mt-0.5 shrink-0 bg-[#f4f5f0] p-1.5 rounded-full h-fit">
                  {item.icon}
                </div>
                <div>
                  <span className="font-bold text-[#1a1a1a]">{item.user}</span>{" "}
                  <span className="text-[#1a1a1a]/60">{item.text}</span>
                  <div className="text-[10px] text-[#1a1a1a]/40 mt-0.5 font-medium uppercase tracking-wider">
                    {Math.floor((new Date().getTime() - item.timestamp.getTime()) / 1000)}s ago
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
