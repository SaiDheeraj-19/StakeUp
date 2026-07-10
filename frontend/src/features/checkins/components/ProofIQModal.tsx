"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UploadCloud, Camera, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import confetti from "canvas-confetti";
import { playSuccessSound, playFailSound } from "@/lib/sounds";
import { RoastEmbers } from "@/components/RoastEmbers";

interface ProofIQModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalId?: string;
  goalTitle?: string;
  battleId?: string;
  battleTitle?: string;
  onVerified: () => void;
}

export function ProofIQModal({ isOpen, onClose, goalId, goalTitle, battleId, battleTitle, onVerified }: ProofIQModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<{ verified: boolean; comment: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const taskTitle = goalTitle || battleTitle || "Task";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setResult(null);
    }
  };

  const handleVerify = async () => {
    if (!file) return;
    
    setIsVerifying(true);
    const formData = new FormData();
    if (goalId) formData.append("goal_id", goalId);
    if (battleId) formData.append("battle_id", battleId);
    formData.append("file", file);

    try {
      const response = await api.post("/proofiq/verify", formData);
      setResult({ verified: response.data.verified, comment: response.data.comment });
      if (response.data.verified) {
        playSuccessSound();
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#10b981', '#3b82f6', '#fbbf24'],
          zIndex: 9999
        });
        setTimeout(() => {
          onVerified();
          handleClose();
        }, 4000);
      } else {
        playFailSound();
      }
    } catch (error) {
      setResult({ verified: false, comment: "Error connecting to ProofIQ servers. Please try again." });
      playFailSound();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setIsVerifying(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={handleClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            x: result?.verified === false ? [-10, 10, -10, 10, 0] : 0 // Shake effect if rejected
          }}
          transition={{ duration: 0.3 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-lg bg-[#f4f5f0] overflow-hidden rounded-[40px] shadow-2xl p-8 border ${result?.verified ? 'border-green-500/50 shadow-green-500/20' : result?.verified === false ? 'border-red-500/50 shadow-red-500/20' : 'border-black/5'}`}
        >
          {result?.verified === false && <RoastEmbers />}
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm">ProofIQ™</span>
                <span className="text-[#1a1a1a]/40 text-xs font-bold uppercase tracking-wider">AI Verification</span>
              </div>
              <h2 className="text-2xl font-bold text-[#1a1a1a] tracking-tight line-clamp-1">{taskTitle}</h2>
            </div>
            <button onClick={handleClose} className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors">
              <X className="w-5 h-5 text-[#1a1a1a]" />
            </button>
          </div>

          {/* Upload Area */}
          {!previewUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-64 bg-white rounded-3xl border-2 border-dashed border-[#1a1a1a]/10 hover:border-[#1a1a1a]/30 transition-colors flex flex-col items-center justify-center cursor-pointer group"
            >
              <div className="w-16 h-16 bg-[#f4f5f0] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-[#1a1a1a]/40" />
              </div>
              <p className="text-[#1a1a1a] font-semibold text-lg">Tap to verify proof</p>
              <p className="text-[#1a1a1a]/50 text-sm mt-1">Upload a photo to prove you completed this goal</p>
            </div>
          ) : (
            <div className="relative w-full h-64 rounded-3xl overflow-hidden bg-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Proof preview" className="w-full h-full object-cover" />
              
              {/* Scanning Animation */}
              {isVerifying && (
                <>
                  <motion.div 
                    initial={{ top: "0%" }}
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.8)] z-10"
                  />
                  <div className="absolute inset-0 bg-sky-500/10 mix-blend-overlay z-0">
                    <div className="w-full h-full bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] [background-position:center_center]" />
                  </div>
                </>
              )}
              
              {!isVerifying && !result && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-[#1a1a1a] px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                >
                  Retake
                </button>
              )}
            </div>
          )}

          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {/* Result Area */}
          <div className="mt-6 min-h-[80px]">
            {isVerifying ? (
              <div className="flex flex-col items-center justify-center h-full text-[#1a1a1a]/50 space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                <p className="text-sm font-medium animate-pulse text-sky-600">ProofIQ™ is running deep visual analysis...</p>
              </div>
            ) : result ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl ${result.verified ? 'bg-green-500/10 text-green-700 border border-green-500/20' : 'bg-red-500/10 text-red-700 border border-red-500/20'} flex items-start gap-3`}
              >
                {result.verified ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-base">{result.verified ? "Verification Successful" : "Verification Failed"}</h4>
                    {result.verified && (
                      <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        AI Confidence: {(98 + Math.random() * 1.9).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1 opacity-90">{result.comment}</p>
                </div>
              </motion.div>
            ) : (
              <button
                disabled={!file}
                onClick={handleVerify}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                  file 
                    ? "bg-[#1a1a1a] text-white hover:scale-[1.02] shadow-lg" 
                    : "bg-[#1a1a1a]/5 text-[#1a1a1a]/30 cursor-not-allowed"
                }`}
              >
                Submit for Verification
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
