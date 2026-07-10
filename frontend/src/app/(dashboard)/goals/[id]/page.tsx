"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, ArrowLeft, Target, Calendar, CheckCircle2, Trash2, Edit2, Timer } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import { ProofIQModal } from "@/features/checkins/components/ProofIQModal";

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [goal, setGoal] = useState<any>(null);
  const [checkins, setCheckins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProofIQOpen, setIsProofIQOpen] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  const { fetchUser } = useAuthStore();

  const [timeLeftStr, setTimeLeftStr] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const [goalRes, checkinsRes] = await Promise.all([
          api.get(`/goals/${params.id}`),
          api.get(`/check-ins/goal/${params.id}`),
        ]);
        setGoal(goalRes.data);
        setCheckins(checkinsRes.data);
      } catch (error) {
        console.error("Failed to fetch goal data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGoal();
  }, [params.id]);

  useEffect(() => {
    if (!goal || !goal.end_date) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(goal.end_date).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeftStr("Expired");
        clearInterval(interval);
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      let parts = [];
      if (d > 0) parts.push(`${d}d`);
      if (h > 0) parts.push(`${h}h`);
      if (m > 0 || d === 0) parts.push(`${m}m`);
      parts.push(`${s}s`);
      
      setTimeLeftStr(parts.join(' '));
    }, 1000);

    return () => clearInterval(interval);
  }, [goal]);

  const handleVerified = async () => {
    try {
      const newCheckins = await api.get(`/check-ins/goal/${params.id}`);
      setCheckins(newCheckins.data);
      setCheckinSuccess(true);
      setTimeout(() => setCheckinSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to refresh checkins", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this challenge?")) return;
    try {
      await api.delete(`/goals/${params.id}`);
      router.back();
    } catch (e) {
      console.error(e);
      alert("Failed to delete challenge.");
    }
  };

  const handleEdit = async () => {
    const newTitle = prompt("Enter new title for this challenge:", goal.title);
    if (!newTitle || newTitle === goal.title) return;
    try {
      await api.put(`/goals/${params.id}`, { title: newTitle });
      setGoal({ ...goal, title: newTitle });
    } catch (e) {
      console.error(e);
      alert("Failed to update challenge.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-zinc-500 animate-pulse">Loading challenge details...</p>
      </div>
    );
  }

  if (!goal) return <div>Challenge not found</div>;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCheckins = checkins.filter((c: any) => c.created_at.startsWith(todayStr));
  const progressPercentage = Math.min(100, Math.round((todayCheckins.length / goal.target_frequency) * 100));
  const isCompletedToday = todayCheckins.length >= goal.target_frequency;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <button onClick={() => router.back()} className={buttonVariants({ variant: "ghost", size: "sm" }) + " mb-4 -ml-4 text-zinc-500"}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              {goal.title}
              <button onClick={handleEdit} className="text-zinc-400 hover:text-zinc-800 transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            </h1>
            <p className="text-zinc-500 mt-1">{goal.description || "No description provided."}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button onClick={handleDelete} className="p-1.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className={`px-3 py-1 text-sm rounded-full font-medium capitalize ${
                isCompletedToday 
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200" 
                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-transparent"
              }`}>
                {isCompletedToday ? "Completed Today" : goal.status}
              </div>
            </div>
            {goal.mock_stake > 0 && (
              <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-sm rounded-full font-bold shadow-sm border border-indigo-100 dark:border-indigo-800">
                {goal.mock_stake} pts staked
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle>Today's Progress</CardTitle>
            <CardDescription>Stay consistent to build the habit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {todayCheckins.length} <span className="text-lg text-zinc-500 font-normal">/ {goal.target_frequency}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">Daily Target</div>
                <div className="text-xs text-zinc-500">Check-ins required</div>
              </div>
            </div>
            
            <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-zinc-900 dark:bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-semibold mb-4">Today's Activity</h3>
              {todayCheckins.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800">
                  <CheckCircle2 className="w-8 h-8 mb-2 text-zinc-300 dark:text-zinc-700" />
                  <p className="text-sm">No check-ins yet.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                  {todayCheckins.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((checkin: any) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      key={checkin.id} 
                      className="flex items-start pb-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0 last:pb-0"
                    >
                      <div className="mt-1 p-1 bg-green-100 dark:bg-green-900/30 rounded-full mr-4">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Checked in successfully</p>
                        <p className="text-xs text-zinc-500">{new Date(checkin.created_at).toLocaleString()}</p>
                        {checkin.notes && <p className="text-sm mt-1 text-zinc-700 dark:text-zinc-300">{checkin.notes}</p>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Challenge Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm">
                <Target className="w-4 h-4 text-zinc-500 mr-3" />
                <div>
                  <p className="text-zinc-500 text-xs">Frequency</p>
                  <p className="font-medium">{goal.target_frequency}x daily</p>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 text-zinc-500 mr-3" />
                <div>
                  <p className="text-zinc-500 text-xs">Started</p>
                  <p className="font-medium">{new Date(goal.start_date).toLocaleDateString()}</p>
                </div>
              </div>
              {goal.end_date && (
                <div className="flex items-center text-sm">
                  <Timer className="w-4 h-4 text-zinc-500 mr-3" />
                  <div>
                    <p className="text-zinc-500 text-xs">Time Remaining</p>
                    <p className={`font-medium tabular-nums ${isExpired ? 'text-red-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                      {timeLeftStr || "Calculating..."}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <AnimatePresence mode="wait">
            {!checkinSuccess ? (
              <div className="mt-8">
                {isExpired ? (
                  <div className="w-full bg-red-50 border border-red-200 text-red-700 rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 shadow-sm">
                    <Timer className="w-5 h-5" />
                    Challenge Expired
                  </div>
                ) : isCompletedToday ? (
                  <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 shadow-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    Target Completed
                  </div>
                ) : (
                  <button
                    onClick={() => setIsProofIQOpen(true)}
                    className="w-full relative overflow-hidden bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-2xl py-4 font-bold text-lg group shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <div className="relative flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Verify with ProofIQ™
                    </div>
                  </button>
                )}
              </div>
            ) : (
              <motion.div 
                key="success" 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-full bg-green-500 text-white rounded-md py-3 px-8 flex items-center justify-center font-medium shadow-lg shadow-green-500/20"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Checked In! +10 Score
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {goal && (
        <ProofIQModal
          isOpen={isProofIQOpen}
          onClose={() => setIsProofIQOpen(false)}
          goalId={goal.id}
          goalTitle={goal.title}
          onVerified={handleVerified}
        />
      )}
    </div>
  );
}
