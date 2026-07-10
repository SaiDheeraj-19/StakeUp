"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Coins, Shield, History, ArrowDownToLine, ArrowUpRight, Lock, Zap } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  tx_type: string;
  description: string;
  created_at: string;
}

interface Wallet {
  id: string;
  balance: number;
  locked_balance: number;
  transactions: Transaction[];
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await api.get("/wallet/");
        setWallet(res.data);
      } catch (error) {
        console.error("Failed to load wallet", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!wallet) return <div>Failed to load wallet</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-[#1a1a1a] tracking-tight">Stake Wallet™</h1>
        <p className="text-lg text-[#1a1a1a]/60 mt-2 font-medium">Your virtual escrow and battle ledger.</p>
      </header>

      {/* Apple Card Style Wallet */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] p-10 text-white shadow-2xl mb-12"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8 opacity-80">
            <Shield className="w-5 h-5" />
            <span className="font-semibold uppercase tracking-widest text-sm">Protected by Stake Escrow</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <p className="text-white/60 font-medium mb-1">Available Balance</p>
              <div className="flex items-baseline gap-2">
                <Coins className="w-8 h-8 text-yellow-400" />
                <h2 className="text-6xl font-black tracking-tighter">{wallet.balance.toLocaleString()}</h2>
                <span className="text-xl font-bold opacity-50">SC</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2 opacity-70">
                <Lock className="w-4 h-4" />
                <span className="font-semibold text-sm">Locked in Escrow</span>
              </div>
              <div className="text-2xl font-bold">
                {wallet.locked_balance.toLocaleString()} SC
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Transactions List */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <History className="w-5 h-5 text-[#1a1a1a]/50" />
          <h3 className="text-xl font-bold text-[#1a1a1a]">Transaction History</h3>
        </div>

        <div className="space-y-4">
          {wallet.transactions.map((tx, index) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              key={tx.id}
              className="bg-white rounded-3xl p-6 border border-[#1a1a1a]/5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {tx.amount > 0 ? <ArrowDownToLine className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-[#1a1a1a] text-lg capitalize">{tx.tx_type.replace('_', ' ')}</h4>
                  <p className="text-[#1a1a1a]/60 text-sm mt-0.5">{tx.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-black text-xl ${tx.amount > 0 ? 'text-green-600' : 'text-[#1a1a1a]'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </div>
                <div className="text-[#1a1a1a]/40 text-sm font-medium mt-1">
                  {new Date(tx.created_at).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
          
          {wallet.transactions.length === 0 && (
            <div className="text-center py-12 text-[#1a1a1a]/40 font-medium">
              No transactions yet. Start a battle to earn StakeCoins!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
