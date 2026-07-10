"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Swords, Coins, Timer, Users, Trophy, BrainCircuit, Bot, Loader2, Sparkles, Bomb, ThumbsUp, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/auth";

interface BattleParticipant {
  id: string;
  user_id: string;
  status: string;
}

interface Battle {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  status: string;
  stake_amount: number;
  pot_size: number;
  battle_type: string;
  participants: BattleParticipant[];
  end_date: string;
  winner_id: string | null;
  ai_report: string | null;
}

import { ProofIQModal } from "@/features/checkins/components/ProofIQModal";

export default function BattleDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [refereeLoading, setRefereeLoading] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  
  const [timeLeftStr, setTimeLeftStr] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  
  const { user } = useAuthStore();

  const fetchBattle = async () => {
    try {
      const res = await api.get(`/battles/${id}`);
      setBattle(res.data);
    } catch (error) {
      console.error("Failed to load battle", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBattle();
  }, [id]);

  useEffect(() => {
    if (!battle) return;
    
    // Safely parse date as UTC if backend omitted timezone info
    let dateStr = battle.end_date;
    if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.includes('-')) {
      dateStr += 'Z';
    }
    const end = new Date(dateStr).getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = end - now;
      
      if (distance <= 0) {
        setIsExpired(true);
        setTimeLeftStr("Battle Ended");
        return;
      }
      
      setIsExpired(false);
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      let str = "";
      if (days > 0) str += `${days}d `;
      if (hours > 0 || days > 0) str += `${hours}h `;
      str += `${minutes}m ${seconds}s`;
      setTimeLeftStr(str);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [battle]);

  const handleJoin = async () => {
    try {
      await api.post(`/battles/${id}/join`);
      fetchBattle();
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      alert(error.response?.data?.detail || "Failed to join battle");
    }
  };

  const handleInteract = async (action: 'cheer' | 'sabotage', targetId: string) => {
    try {
      const res = await api.post(`/battles/${id}/interact`, {
        action,
        target_user_id: targetId
      });
      alert(res.data.message);
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      alert(error.response?.data?.detail || `Failed to ${action}`);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteLoading(true);
    try {
      await api.post(`/battles/${id}/invite`, { email: inviteEmail });
      setInviteEmail("");
      fetchBattle();
      alert("Friend invited successfully!");
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      alert(error.response?.data?.detail || "Failed to invite friend");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleTriggerReferee = async () => {
    setRefereeLoading(true);
    try {
      await api.post(`/battles/${id}/referee`);
      await fetchBattle();
    } catch (error) {
      console.error("Failed to trigger referee", error);
    } finally {
      setRefereeLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!confirm("Are you sure you want to cancel this battle? All locked stakes will be refunded.")) return;
    setRevokeLoading(true);
    try {
      const res = await api.delete(`/battles/${id}`);
      alert(res.data.message);
      router.push("/battles");
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      alert(error.response?.data?.detail || "Failed to revoke battle");
      setRevokeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!battle) return <div>Battle not found</div>;

  const isPending = battle.status === "pending";
  const isActive = battle.status === "active";
  const isCompleted = battle.status === "completed";
  const isCancelled = battle.status === "cancelled";
  const myStatus = battle.participants.find(p => p.user_id === user?.id)?.status;
  const isWinner = battle.winner_id === user?.id;
  const isOwner = battle.creator_id === user?.id;

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-black/5"
      >
        {/* Header Section */}
        <div className={`p-10 relative overflow-hidden ${
          isCompleted ? 'bg-gradient-to-br from-indigo-900 to-indigo-950 text-white' :
          isCancelled ? 'bg-gradient-to-br from-gray-700 to-gray-900 text-white' :
          'bg-gradient-to-br from-indigo-600 to-purple-700 text-white'
        }`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  {battle.status}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  {battle.battle_type}
                </span>
              </div>
              <h1 className="text-5xl font-black tracking-tight mb-2">{battle.title}</h1>
              <p className="text-white/80 font-medium flex items-center gap-2 text-lg">
                <Timer className="w-5 h-5" />
                {timeLeftStr || `Ends ${new Date(battle.end_date).toLocaleDateString()}`}
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-4">
              {isOwner && !isCompleted && !isCancelled && (
                <button
                  onClick={handleRevoke}
                  disabled={revokeLoading}
                  className="bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors disabled:opacity-50 backdrop-blur-md"
                >
                  {revokeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Cancel Battle
                </button>
              )}
              
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 text-center min-w-[200px]">
                <p className="text-white/70 font-bold uppercase tracking-widest text-sm mb-1">Total Pot</p>
                <div className="flex items-center justify-center gap-2 text-4xl font-black">
                  <Coins className="w-8 h-8 text-yellow-400" />
                  {battle.pot_size.toLocaleString()}
                </div>
                <p className="text-white/50 text-xs mt-2">{battle.stake_amount} SC entry per user</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-10">
          {/* Action Area */}
          {myStatus === "invited" && isPending && (
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="mb-10 bg-indigo-50 border-2 border-indigo-100 rounded-3xl p-8 text-center"
            >
              <h3 className="text-2xl font-bold text-indigo-900 mb-2">You have been challenged!</h3>
              <p className="text-indigo-700 mb-6 font-medium">Joining this battle will lock {battle.stake_amount} SC from your wallet into escrow.</p>
              <button 
                onClick={handleJoin}
                className="bg-indigo-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
              >
                Accept Challenge & Lock Stake
              </button>
            </motion.div>
          )}
          
          {myStatus === "accepted" && isPending && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-10 bg-gray-50 border border-gray-200 rounded-3xl p-8"
            >
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Invite a Friend</h3>
              <p className="text-[#1a1a1a]/60 mb-4">Send an invite to a friend to join this battle.</p>
              <form onSubmit={handleInvite} className="flex gap-2">
                <input 
                  type="email" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="flex-1 bg-white border border-gray-300 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <button 
                  type="submit" 
                  disabled={inviteLoading}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-full font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {inviteLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Invite"}
                </button>
              </form>
            </motion.div>
          )}

          {isActive && (
            <div className="mb-10 flex flex-col sm:flex-row justify-between items-center gap-4">
              {myStatus === "accepted" && !isExpired && (
                <button 
                  onClick={() => setIsProofModalOpen(true)}
                  className="bg-black text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors w-full sm:w-auto justify-center"
                >
                  <Sparkles className="w-5 h-5" />
                  Upload Daily Proof
                </button>
              )}
              {myStatus === "accepted" && isExpired && (
                <div className="bg-orange-100 text-orange-800 px-6 py-3 rounded-full font-bold text-sm text-center flex-1 sm:flex-none">
                  Battle timeframe has ended. Proof uploads disabled.
                </div>
              )}
              
              <button 
                onClick={handleTriggerReferee}
                disabled={refereeLoading}
                className={`${isExpired ? 'animate-pulse ring-4 ring-emerald-500/50' : ''} bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 w-full sm:w-auto justify-center`}
              >
                {refereeLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
                Trigger AI Referee (Demo)
              </button>
            </div>
          )}

          {isCancelled && (
            <div className="mb-10 bg-gray-50 border border-gray-200 rounded-3xl p-8 text-center">
              <Trash2 className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-600">Battle Cancelled</h3>
              <p className="text-gray-500">This battle was revoked by the creator. All stakes have been refunded.</p>
            </div>
          )}

          <ProofIQModal
            isOpen={isProofModalOpen}
            onClose={() => setIsProofModalOpen(false)}
            battleId={battle.id}
            battleTitle={battle.title}
            onVerified={fetchBattle}
          />

          {isCompleted && battle.ai_report && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-10 rounded-3xl p-8 border-2 ${isWinner ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isWinner ? 'bg-yellow-100' : 'bg-gray-200'}`}>
                  {isWinner ? <Trophy className="w-6 h-6 text-yellow-600" /> : <Bot className="w-6 h-6 text-gray-500" />}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#1a1a1a]">
                    {isWinner ? 'Victory!' : 'AI Referee Decision'}
                  </h3>
                  <p className="text-[#1a1a1a]/60 font-medium">Final analysis and escrow settlement</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 border border-black/5 text-[#1a1a1a] font-medium leading-relaxed">
                <div className="flex gap-2 items-start">
                  <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <p>{battle.ai_report}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Participants Area */}
          <div>
            <h3 className="text-xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-[#1a1a1a]/40" />
              Contenders ({battle.participants.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {battle.participants.map((p, i) => (
                <div key={p.id} className="bg-[#f4f5f0] rounded-2xl p-5 flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center font-bold text-[#1a1a1a]">
                        U{i+1}
                      </div>
                      <div>
                        <p className="font-bold text-[#1a1a1a]">{p.user_id === user?.id ? 'You' : `User ${p.user_id.substring(0, 4)}`}</p>
                        <p className="text-xs font-bold text-[#1a1a1a]/40 uppercase tracking-widest">{p.status}</p>
                      </div>
                    </div>
                    {battle.winner_id === p.user_id && (
                      <Trophy className="w-6 h-6 text-yellow-500" />
                    )}
                  </div>
                  
                  {isActive && p.user_id !== user?.id && (
                    <div className="flex gap-2 mt-2 pt-4 border-t border-black/5">
                      <button 
                        onClick={() => handleInteract('cheer', p.user_id)}
                        className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" /> Cheer (50 SC)
                      </button>
                      <button 
                        onClick={() => handleInteract('sabotage', p.user_id)}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Bomb className="w-4 h-4" /> Sabotage (50 SC)
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
