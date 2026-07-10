"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, LayoutDashboard, Target, Swords, Wallet, Settings, PlusCircle, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface CommandItem {
  icon: any;
  label: string;
  href?: string;
  shortcut?: string;
  action?: () => void;
}

export function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Listen for Cmd+K (Mac) or Ctrl+K (Windows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items: CommandItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", shortcut: "D" },
    { icon: Target, label: "My Challenges", href: "/challenges", shortcut: "C" },
    { icon: PlusCircle, label: "Create Challenge", href: "/goals/new", shortcut: "N" },
    { icon: Swords, label: "Live Battles", href: "/battles", shortcut: "B" },
    { icon: Wallet, label: "Wallet & History", href: "/wallet", shortcut: "W" },
    { icon: Settings, label: "Settings", href: "/settings", shortcut: "S" },
    { 
      icon: PartyPopper, 
      label: "Hackathon Easter Egg", 
      action: () => {
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
        setIsOpen(false);
      }
    }
  ];

  const filteredItems = items.filter(item => 
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleSelect = (item: CommandItem) => {
    setIsOpen(false);
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && filteredItems.length > 0) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-black/10"
          >
            <div className="flex items-center border-b border-black/5 px-4">
              <Search className="w-5 h-5 text-[#1a1a1a]/40 mr-3" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Type a command or search..."
                className="w-full h-14 bg-transparent border-none outline-none text-lg text-[#1a1a1a] placeholder:text-[#1a1a1a]/30"
              />
              <div className="flex gap-1 text-[10px] font-bold text-[#1a1a1a]/40 bg-black/5 px-2 py-1 rounded">
                <span>ESC</span>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-[#1a1a1a]/50 text-sm">
                  No results found for "{search}"
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors ${
                        isSelected ? "bg-[#1a1a1a] text-white" : "text-[#1a1a1a] hover:bg-black/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-[#1a1a1a]/50"}`} />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.shortcut && (
                        <div className={`text-[10px] font-bold px-2 py-1 rounded border ${
                          isSelected ? "border-white/20 text-white/70" : "border-black/10 text-black/40"
                        }`}>
                          ⌘{item.shortcut}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
