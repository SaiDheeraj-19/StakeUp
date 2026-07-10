"use client";

import { useAuthStore } from "@/store/auth";
import { User, Bell, Shield, Key, Mail, Calendar, Users, Settings2, MoreVertical, Plus } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("Profile");

  const tabs = [
    { id: "Profile", icon: User },
    { id: "Calendar sync", icon: Calendar },
    { id: "Users", icon: Users },
    { id: "Security", icon: Shield },
    { id: "General", icon: Settings2 },
  ];

  const providers = [
    { name: "Google", color: "text-red-500", bg: "bg-red-50" },
    { name: "Microsoft", color: "text-blue-500", bg: "bg-blue-50" },
    { name: "Apple", color: "text-gray-800", bg: "bg-gray-100" },
  ];

  return (
    <div className="space-y-8">
      
      {/* Horizontal Pill Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-6 py-3 rounded-full text-sm font-medium transition-all shrink-0 ${
              activeTab === tab.id 
                ? "bg-[#1a1a1a] text-white shadow-md" 
                : "bg-white text-[#1a1a1a]/60 hover:text-[#1a1a1a] hover:bg-gray-50 shadow-sm border border-black/5"
            }`}
          >
            <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? "text-indigo-400" : "opacity-50"}`} />
            {tab.id}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[40px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        
        {/* Connected Providers Row */}
        <div className="flex space-x-4 overflow-x-auto pb-8 mb-8 border-b border-gray-100 scrollbar-hide">
          {providers.map((p) => (
            <div key={p.name} className="flex-shrink-0 w-48 h-32 rounded-[24px] border border-gray-100 flex flex-col items-center justify-center hover:shadow-md transition-shadow cursor-pointer">
              <div className={`w-12 h-12 rounded-full ${p.bg} ${p.color} flex items-center justify-center mb-3`}>
                <Mail className="w-5 h-5" />
              </div>
              <span className="font-semibold text-[#1a1a1a]">{p.name}</span>
            </div>
          ))}
          <div className="flex-shrink-0 w-16 h-32 rounded-[24px] border border-gray-200 border-dashed flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer text-[#1a1a1a]/40 hover:text-[#1a1a1a]">
            <Plus className="w-6 h-6" />
          </div>
        </div>

        {/* Profile Details List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium text-[#1a1a1a] flex items-center">
              <Mail className="w-4 h-4 mr-2 opacity-50" />
              Your Account Details
            </h3>
            <span className="text-sm font-medium text-[#1a1a1a]/50">Status: Active</span>
          </div>

          <div className="space-y-2">
            {/* Row 1 */}
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors group">
              <div className="flex items-center w-1/3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold mr-4">
                  {user?.email?.[0].toUpperCase() || "U"}
                </div>
                <span className="font-semibold text-[#1a1a1a] text-sm">{user?.email?.split('@')[0] || "User"}</span>
              </div>
              <div className="w-1/3 text-sm text-[#1a1a1a]/50">
                {user?.email}
              </div>
              <div className="w-1/6">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full">
                  Primary
                </span>
              </div>
              <div className="w-1/6 flex justify-end">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#1a1a1a]/30 hover:text-[#1a1a1a] hover:bg-gray-100 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Row 2 (Mock Data) */}
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors group">
              <div className="flex items-center w-1/3">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 font-bold mr-4">
                  S
                </div>
                <span className="font-semibold text-[#1a1a1a] text-sm">Secondary Alias</span>
              </div>
              <div className="w-1/3 text-sm text-[#1a1a1a]/50">
                backup@stakeup.app
              </div>
              <div className="w-1/6">
                <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full">
                  Unverified
                </span>
              </div>
              <div className="w-1/6 flex justify-end">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#1a1a1a]/30 hover:text-[#1a1a1a] hover:bg-gray-100 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
