"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { Swords, Coins, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function CreateBattlePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stake_amount: 100,
    end_date: "",
    battle_type: "1v1"
  });

  useEffect(() => {
    // Set default end date to 7 days from now
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setFormData(prev => ({ ...prev, end_date: nextWeek.toISOString().split('T')[0] }));
    
    // Fetch wallet to know max stake
    api.get("/wallet/").then(res => setWalletBalance(res.data.balance));
  }, []);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        start_date: new Date().toISOString(),
        end_date: new Date(formData.end_date).toISOString()
      };
      const res = await api.post("/battles/", payload);
      router.push(`/battles/${res.data.id}`);
    } catch (error: any) {
      alert(error.response?.data?.detail || "Failed to create battle");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <header className="mb-10 text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Swords className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-4xl font-bold text-[#1a1a1a] tracking-tight">Declare a Battle</h1>
        <p className="text-lg text-[#1a1a1a]/60 mt-2 font-medium">Put your StakeCoins where your mouth is.</p>
      </header>

      <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-[#1a1a1a]/10 shadow-xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-bold text-[#1a1a1a] mb-2 uppercase tracking-widest">Battle Title</label>
                <input
                  type="text"
                  placeholder="e.g. 100 Days of Code"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#f4f5f0] text-xl font-medium p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1a1a1a] mb-2 uppercase tracking-widest">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full bg-[#f4f5f0] text-xl font-medium p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <button
                disabled={!formData.title}
                onClick={() => setStep(2)}
                className="w-full mt-8 bg-[#1a1a1a] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                Next Step
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <label className="block text-sm font-bold text-[#1a1a1a] mb-6 uppercase tracking-widest">Set The Stake</label>
                
                <div className="flex items-center justify-center gap-4 text-5xl font-black text-indigo-600 mb-6">
                  <Coins className="w-12 h-12 text-yellow-400" />
                  {formData.stake_amount} SC
                </div>
                
                <input
                  type="range"
                  min="0"
                  max={Math.min(walletBalance, 10000)}
                  step="50"
                  value={formData.stake_amount}
                  onChange={(e) => setFormData({ ...formData, stake_amount: parseInt(e.target.value) })}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                
                <p className="text-sm text-[#1a1a1a]/50 font-medium mt-4">
                  Available Balance: {walletBalance.toLocaleString()} SC
                </p>
              </div>

              <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200 flex gap-4">
                <ShieldCheck className="w-8 h-8 text-yellow-600 shrink-0" />
                <p className="text-sm font-medium text-yellow-800">
                  Your stake of {formData.stake_amount} SC will be locked in escrow. If you win, you claim the entire pot. If you lose, your stake is forfeited.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-4 rounded-2xl font-bold text-[#1a1a1a] bg-[#f4f5f0] hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading || formData.stake_amount > walletBalance}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Declare Battle"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
