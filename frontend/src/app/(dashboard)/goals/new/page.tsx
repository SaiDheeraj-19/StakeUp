"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { ArrowLeft, Target, Coins } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NewGoalPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_frequency: 1,
    mock_stake: 0,
  });
  const [durationDays, setDurationDays] = useState(0);
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const now = new Date();
      let endDate = null;
      const totalMinutes = (durationDays * 24 * 60) + (durationHours * 60) + durationMinutes;
      
      if (totalMinutes > 0) {
        endDate = new Date(now.getTime() + totalMinutes * 60000).toISOString();
      }

      const payload = {
        ...formData,
        start_date: now.toISOString(),
        ...(endDate && { end_date: endDate }),
      };
      const res = await api.post("/goals/", payload);
      router.push(`/goals/${res.data.id}`);
    } catch (error) {
      console.error("Failed to create goal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link href="/dashboard" className="inline-flex items-center text-[#1a1a1a]/50 hover:text-[#1a1a1a] mb-8 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-transparent hover:border-black/5 transition-all">
          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-[#f4f5f0] text-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-medium tracking-tight text-[#1a1a1a]">Create a New Challenge</h1>
            <p className="text-[#1a1a1a]/50 mt-2 max-w-md mx-auto">Define your commitment, set your frequency, and hold yourself accountable.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-sm font-semibold text-[#1a1a1a] uppercase tracking-wider">Challenge Name</Label>
              <Input
                id="title"
                required
                placeholder="e.g. Read 10 pages daily"
                className="bg-[#f4f5f0] border-none text-[#1a1a1a] h-14 rounded-2xl px-6 focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/20 shadow-inner"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-sm font-semibold text-[#1a1a1a] uppercase tracking-wider">Description (Optional)</Label>
              <textarea
                id="description"
                placeholder="Why is this important to you?"
                className="bg-[#f4f5f0] border-none text-[#1a1a1a] min-h-[120px] rounded-2xl p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/20 shadow-inner resize-none w-full"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-sm font-semibold text-[#1a1a1a] uppercase tracking-wider">Time Limit / Deadline (Optional)</Label>
              <p className="text-xs text-zinc-500 mb-2">Leave at 0 for an ongoing habit, or set a countdown timer.</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="bg-[#f4f5f0] border-none text-[#1a1a1a] h-14 rounded-2xl pl-4 pr-12 focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/20 shadow-inner font-bold text-lg"
                    value={durationDays || ""}
                    onChange={(e) => setDurationDays(parseInt(e.target.value) || 0)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium text-sm pointer-events-none">Days</div>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="bg-[#f4f5f0] border-none text-[#1a1a1a] h-14 rounded-2xl pl-4 pr-12 focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/20 shadow-inner font-bold text-lg"
                    value={durationHours || ""}
                    onChange={(e) => setDurationHours(parseInt(e.target.value) || 0)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium text-sm pointer-events-none">Hrs</div>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="bg-[#f4f5f0] border-none text-[#1a1a1a] h-14 rounded-2xl pl-4 pr-12 focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/20 shadow-inner font-bold text-lg"
                    value={durationMinutes || ""}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium text-sm pointer-events-none">Mins</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-3">
                <Label htmlFor="frequency" className="text-sm font-semibold text-[#1a1a1a] uppercase tracking-wider flex items-center">
                  Daily Check-ins
                </Label>
                <div className="relative">
                  <Input
                    id="frequency"
                    type="number"
                    min="1"
                    max="10"
                    required
                    className="bg-[#f4f5f0] border-none text-[#1a1a1a] h-14 rounded-2xl pl-6 pr-12 focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/20 shadow-inner font-bold text-lg"
                    value={formData.target_frequency}
                    onChange={(e) => setFormData({ ...formData, target_frequency: parseInt(e.target.value) || 1 })}
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[#1a1a1a]/40 font-bold">x</div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="stake" className="text-sm font-semibold text-[#1a1a1a] uppercase tracking-wider flex items-center">
                  <Coins className="w-4 h-4 mr-2" />
                  Mock Stake (Points)
                </Label>
                <div className="relative">
                  <Input
                    id="stake"
                    type="number"
                    min="0"
                    className="bg-[#f4f5f0] border-none text-[#1a1a1a] h-14 rounded-2xl pl-12 pr-6 focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/20 shadow-inner font-bold text-lg"
                    value={formData.mock_stake}
                    onChange={(e) => setFormData({ ...formData, mock_stake: parseInt(e.target.value) || 0 })}
                  />
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1a1a1a]/40 font-bold">$</div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-[#1a1a1a] hover:bg-black text-white rounded-full font-bold text-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full mr-3"
                    />
                    Creating...
                  </div>
                ) : (
                  "Create Challenge"
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
