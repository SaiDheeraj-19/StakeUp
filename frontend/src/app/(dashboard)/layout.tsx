"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { LogOut, Home, Target, Settings, Activity, Trophy, Bell, HelpCircle, LayoutDashboard, CalendarDays, History, BookOpen, Wallet, Swords } from "lucide-react";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { CommandMenu } from "@/components/CommandMenu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, fetchUser, logout, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f5f0]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#1a1a1a]/20 border-t-[#1a1a1a] rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Planner", href: "/planner", icon: CalendarDays },
    { name: "Battles", href: "/battles", icon: Swords },
    { name: "Wallet", href: "/wallet", icon: Wallet },
    { name: "Research", href: "/research", icon: BookOpen },
    { name: "Challenges", href: "/challenges", icon: Target },
    { name: "History", href: "/history", icon: History },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  ];

  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard": return "Dashboard";
      case "/planner": return "Planner";
      case "/battles": return "Stake Battles™";
      case "/wallet": return "Stake Wallet™";
      case "/challenges": return "Challenges";
      case "/history": return "History";
      case "/leaderboard": return "Leaderboard";
      case "/settings": return "Settings";
      case "/goals/new": return "New Challenge";
      default: return "Overview";
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#f4f5f0] text-[#1a1a1a] font-sans overflow-hidden flex flex-col md:flex-row p-0 md:p-4 gap-0 md:gap-6 selection:bg-[#1a1a1a] selection:text-white">
      <CommandMenu />
      <OfflineIndicator />
      
      {/* Floating Sidebar / Bottom Nav on Mobile */}
      <aside className="order-last md:order-first w-full md:w-20 h-16 md:h-auto md:rounded-[32px] bg-[#e9ebe3] flex flex-row md:flex-col items-center justify-between md:justify-start md:py-8 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:shadow-sm border-t border-black/5 md:border relative shrink-0 px-2 md:px-0 pb-safe md:pb-8">
        <Link href="/dashboard" className="hidden md:flex w-12 h-12 bg-[#1a1a1a] text-white rounded-full items-center justify-center mb-10 hover:scale-105 transition-transform shadow-lg">
          <span className="font-bold text-xl italic" style={{ fontFamily: "'Instrument Serif', serif" }}>S</span>
        </Link>
        
        <nav className="flex-1 flex flex-row md:flex-col items-center justify-around md:justify-start md:space-y-4 w-full md:w-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} title={item.name}>
                <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-[#1a1a1a] rounded-full shadow-md"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-white' : 'text-[#1a1a1a]/40 hover:text-[#1a1a1a]'}`} strokeWidth={isActive ? 2.5 : 2} />
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="flex flex-row md:flex-col items-center space-x-2 md:space-x-0 md:space-y-4 pr-2 md:pr-0 md:mt-auto">
          <Link href="/settings" title="Settings" className="hidden md:block">
            <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
              {pathname === "/settings" && (
                <motion.div
                  layoutId="activeNavTab"
                  className="absolute inset-0 bg-[#1a1a1a] rounded-full shadow-md"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Settings className={`w-5 h-5 relative z-10 transition-colors ${pathname === "/settings" ? 'text-white' : 'text-[#1a1a1a]/40 hover:text-[#1a1a1a]'}`} />
            </div>
          </Link>
          <button 
            onClick={() => {
              logout();
              router.push("/login");
            }}
            title="Sign out"
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-[#1a1a1a]/40 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          >
            <LogOut className="w-5 h-5 md:ml-1" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden md:rounded-[40px] bg-transparent">
        
        {/* Top Header */}
        <header className="h-16 md:h-24 flex items-center justify-between px-4 md:px-6 shrink-0 bg-transparent pt-safe md:pt-0">
          <h1 className="text-xl md:text-3xl font-medium tracking-tight text-[#1a1a1a] truncate mr-2">{getPageTitle()}</h1>
          
          <div className="flex items-center space-x-2 md:space-x-3 shrink-0">
            <button className="hidden sm:flex w-8 h-8 md:w-10 md:h-10 bg-white rounded-full items-center justify-center shadow-sm border border-black/5 hover:bg-gray-50 transition-colors text-[#1a1a1a]/60 hover:text-[#1a1a1a]">
              <HelpCircle className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <div className="h-8 md:h-10 bg-white rounded-full px-3 md:px-4 flex items-center space-x-1 md:space-x-2 shadow-sm border border-black/5 cursor-default">
              <span className="text-orange-500 font-medium text-sm">🔥</span>
              <span className="text-xs md:text-sm font-bold text-[#1a1a1a]">{user?.current_streak || 0}</span>
            </div>
            <button className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-black/5 hover:bg-gray-50 transition-colors text-[#1a1a1a]/60 hover:text-[#1a1a1a]">
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <div className="h-8 md:h-10 bg-white rounded-full pl-1 pr-2 md:pr-4 flex items-center space-x-2 shadow-sm border border-black/5 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#e9ebe3] flex items-center justify-center text-[10px] md:text-xs font-bold text-[#1a1a1a]">
                {user?.email?.[0].toUpperCase() || "U"}
              </div>
              <span className="hidden sm:block text-sm font-medium text-[#1a1a1a]">
                {user?.email?.split('@')[0] || "User"}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-6 pb-6 scrollbar-hide">
          <div className="max-w-[1400px] mx-auto w-full pb-6 md:pb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
