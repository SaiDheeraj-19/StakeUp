"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { Swords, Plus, ShieldAlert, Timer, ChevronRight, User } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";

interface BattleParticipant {
  id: string;
  user_id: string;
  status: string;
}

interface Battle {
  id: string;
  title: string;
  description: string;
  status: string;
  stake_amount: number;
  pot_size: number;
  battle_type: string;
  participants: BattleParticipant[];
  end_date: string;
}

export default function BattlesPage() {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchBattles = async () => {
      try {
        const res = await api.get("/battles/");
        setBattles(res.data);
      } catch (error) {
        console.error("Failed to load battles", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBattles();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#1a1a1a] tracking-tight">Stake Battles™</h1>
          <p className="text-lg text-[#1a1a1a]/60 mt-2 font-medium">Compete. Lock Stakes. Prove it with AI.</p>
        </div>
        <Link href="/battles/new">
          <button className="bg-[#1a1a1a] text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg">
            <Plus className="w-5 h-5" />
            Create Battle
          </button>
        </Link>
      </header>

      {/* Battles List */}
      <div className="space-y-6">
        <AnimatePresence>
          {battles.map((battle, index) => {
            const isPending = battle.status === "pending";
            const isCompleted = battle.status === "completed";
            const myStatus = battle.participants.find(p => p.user_id === user?.id)?.status;

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={battle.id}
              >
                <Link href={`/battles/${battle.id}`}>
                  <div className={`relative overflow-hidden rounded-[2rem] p-8 border transition-all hover:shadow-xl group
                    ${isCompleted ? 'bg-white border-[#1a1a1a]/5 opacity-70' : 'bg-white border-[#1a1a1a]/10 shadow-lg'}
                  `}>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                      
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full
                            ${isPending ? 'bg-yellow-100 text-yellow-700' : isCompleted ? 'bg-gray-100 text-gray-600' : 'bg-indigo-100 text-indigo-700'}
                          `}>
                            {battle.status}
                          </span>
                          <span className="text-xs font-bold text-[#1a1a1a]/40 uppercase tracking-wider bg-[#1a1a1a]/5 px-3 py-1 rounded-full">
                            {battle.battle_type}
                          </span>
                          {myStatus === "invited" && (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-rose-100 text-rose-700 animate-pulse">
                              Action Required
                            </span>
                          )}
                        </div>
                        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">{battle.title}</h2>
                        <p className="text-[#1a1a1a]/60 font-medium flex items-center gap-2">
                          <Timer className="w-4 h-4" />
                          Ends {new Date(battle.end_date).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-center md:text-right">
                          <p className="text-sm font-bold text-[#1a1a1a]/40 uppercase tracking-widest mb-1">Battle Pot</p>
                          <div className="text-3xl font-black text-indigo-600">
                            {battle.pot_size.toLocaleString()} SC
                          </div>
                        </div>
                        
                        <div className="w-12 h-12 rounded-full bg-[#1a1a1a]/5 flex items-center justify-center group-hover:bg-[#1a1a1a] group-hover:text-white transition-colors">
                          <ChevronRight className="w-6 h-6 text-[#1a1a1a]/40 group-hover:text-white" />
                        </div>
                      </div>

                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {battles.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-[#1a1a1a]/5">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Swords className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2">No active battles</h3>
            <p className="text-[#1a1a1a]/60 font-medium mb-8 max-w-sm mx-auto">
              Challenge a friend, lock in your StakeCoins, and let the AI Referee decide who wins.
            </p>
            <Link href="/battles/new">
              <button className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30">
                Start a Battle
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
