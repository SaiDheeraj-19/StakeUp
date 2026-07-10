"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Target, Brain } from "lucide-react";

interface DeepReadResponse {
  summary: string;
  key_takeaways: string[];
  action_plan: string;
}

interface DeepReadModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DeepReadResponse | null;
  isLoading: boolean;
  title: string;
}

export function DeepReadModal({ isOpen, onClose, data, isLoading, title }: DeepReadModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1a1a1a]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[32px] p-8 shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-hide relative border border-black/5"
            >
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#f4f5f0] flex items-center justify-center text-[#1a1a1a]/40 hover:bg-[#1a1a1a] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pr-12 mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#e8f5e9] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-green-700" />
                  </div>
                  <span className="text-sm font-bold tracking-wide text-green-700 uppercase">AI Deep Read</span>
                </div>
                <h2 className="text-2xl font-bold text-[#1a1a1a] leading-tight">{title}</h2>
              </div>

              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-[#1a1a1a]/40 gap-4">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-[#1a1a1a]/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[#1a1a1a] rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="font-medium animate-pulse text-sm">Jina AI is extracting & summarizing the article...</p>
                </div>
              ) : data ? (
                <div className="space-y-8">
                  {/* Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-[#1a1a1a]/40" />
                      Executive Summary
                    </h3>
                    <p className="text-[#1a1a1a]/70 leading-relaxed text-sm bg-[#f4f5f0] p-4 rounded-2xl">
                      {data.summary}
                    </p>
                  </div>

                  {/* Key Takeaways */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#1a1a1a]/40" />
                      Key Takeaways
                    </h3>
                    <ul className="space-y-3">
                      {data.key_takeaways.map((takeaway, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-[#1a1a1a]/70 leading-relaxed">
                          <span className="w-6 h-6 rounded-full bg-[#1a1a1a]/5 flex items-center justify-center shrink-0 font-medium text-[#1a1a1a]/60 text-xs">
                            {idx + 1}
                          </span>
                          <span className="pt-0.5">{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Plan */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#1a1a1a]/40" />
                      Actionable Next Step
                    </h3>
                    <div className="bg-[#1a1a1a] text-white p-5 rounded-2xl text-sm leading-relaxed">
                      {data.action_plan}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-red-500">
                  <p>Failed to extract content.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
