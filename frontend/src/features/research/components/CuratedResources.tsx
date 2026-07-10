/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Video, Map, FileText, ExternalLink, Brain } from "lucide-react";
import { api } from "@/lib/api";
import { DeepReadModal } from "./DeepReadModal";

interface Resource {
  title: string;
  url: string;
  description: string;
  type: string;
}

interface CuratedResourcesProps {
  topic: string;
  summary: string;
  resources: Resource[];
}

export function CuratedResources({ topic, summary, resources }: CuratedResourcesProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [deepReadData, setDeepReadData] = useState<any>(null);
  const [isDeepReading, setIsDeepReading] = useState(false);

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "video": return <Video className="w-5 h-5 text-red-500" />;
      case "roadmap": return <Map className="w-5 h-5 text-blue-500" />;
      case "docs": return <BookOpen className="w-5 h-5 text-green-600" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case "video": return "Video Tutorial";
      case "roadmap": return "Learning Roadmap";
      case "docs": return "Official Documentation";
      default: return "Article / Guide";
    }
  };

  const handleDeepRead = async (res: Resource) => {
    setModalTitle(res.title);
    setModalOpen(true);
    setIsDeepReading(true);
    setDeepReadData(null);
    try {
      const response = await api.post("/research/deep-read", { url: res.url });
      setDeepReadData(response.data);
    } catch (error) {
      console.error("Deep read failed", error);
      // Data remains null, modal handles error state
    } finally {
      setIsDeepReading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-black/5"
        >
          <h2 className="text-2xl font-medium tracking-tight text-[#1a1a1a] mb-3">
            Research: <span className="font-bold italic" style={{ fontFamily: "'Instrument Serif', serif" }}>{topic}</span>
          </h2>
          <p className="text-[#1a1a1a]/70 leading-relaxed text-sm">
            {summary}
          </p>
        </motion.div>

        {/* Resources List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((res, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-white rounded-[24px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-black/5 hover:shadow-md transition-all flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 bg-[#f4f5f0] px-3 py-1.5 rounded-full">
                  {getIcon(res.type)}
                  <span className="text-xs font-semibold text-[#1a1a1a]/70 uppercase tracking-wide">
                    {getLabel(res.type)}
                  </span>
                </div>
                <div className="flex gap-2 shrink-0">
                  {/* Deep Read Button for non-videos */}
                  {res.type.toLowerCase() !== "video" && (
                    <button
                      onClick={() => handleDeepRead(res)}
                      className="h-8 px-3 rounded-full bg-[#e8f5e9] flex items-center justify-center text-green-700 hover:bg-green-700 hover:text-white transition-colors text-xs font-bold gap-1.5"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      Deep Read
                    </button>
                  )}
                  <a 
                    href={res.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-[#f4f5f0] flex items-center justify-center text-[#1a1a1a]/40 hover:bg-[#1a1a1a] hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
              
              <h3 className="font-bold text-[#1a1a1a] mb-2 leading-tight">
                {res.title}
              </h3>
              
              <p className="text-sm text-[#1a1a1a]/60 line-clamp-3 mt-auto">
                {res.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <DeepReadModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        data={deepReadData} 
        isLoading={isDeepReading} 
        title={modalTitle} 
      />
    </>
  );
}
