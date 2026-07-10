/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Search } from "lucide-react";
import { CuratedResources } from "@/features/research/components/CuratedResources";

export default function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsSearching(true);
    setError("");
    setResults(null);

    try {
      const response = await api.post("/research/curate", { topic });
      setResults(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to compile research. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-160px)] pt-10">
      
      {/* Search Input Area */}
      <motion.div 
        layout
        className="w-full max-w-2xl bg-white rounded-[32px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-black/5 mb-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-[#1a1a1a]">AI Research Assistant</h2>
            <p className="text-xs text-[#1a1a1a]/50">Powered by Tavily & Gemini</p>
          </div>
        </div>

        <form onSubmit={handleResearch} className="flex items-center gap-3 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1a1a]/40">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What do you want to learn? (e.g. React 19)"
            className="w-full h-14 pl-12 pr-32 bg-[#f4f5f0] border-none text-[#1a1a1a] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/20 shadow-inner font-medium text-sm"
          />
          <button
            type="submit"
            disabled={isSearching || !topic.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 bg-[#1a1a1a] hover:bg-black text-white rounded-full font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Research"}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-4 px-2">{error}</p>}
      </motion.div>

      {/* Results Area */}
      <AnimatePresence mode="wait">
        {isSearching && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center text-[#1a1a1a]/40 gap-4 mt-10"
          >
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-[#1a1a1a]/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#1a1a1a] rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="font-medium animate-pulse">Scouring the web & curating best resources...</p>
          </motion.div>
        )}

        {!isSearching && results && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <CuratedResources 
              topic={results.topic}
              summary={results.summary}
              resources={results.resources}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
