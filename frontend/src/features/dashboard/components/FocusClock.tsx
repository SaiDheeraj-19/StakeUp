"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Timer, Play, Pause, RotateCcw } from "lucide-react";

export function FocusClock() {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(focusMinutes * 60);
  };

  const adjustTime = (amount: number) => {
    if (isActive) return;
    const newMins = Math.max(1, Math.min(120, focusMinutes + amount));
    setFocusMinutes(newMins);
    setTimeLeft(newMins * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1a1a] rounded-[32px] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-full text-white"
    >
      <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[30px] pointer-events-none"></div>

      <div className="flex justify-between items-start z-10 relative">
        <div className="flex items-center gap-1 text-white/50 text-xs font-bold uppercase tracking-wider">
          <Timer className="w-3.5 h-3.5" />
          <span>Focus Time</span>
        </div>
        {!isActive && (
          <div className="flex gap-2">
            <button onClick={() => adjustTime(-5)} className="text-white/50 hover:text-white px-2 rounded bg-white/5">-5m</button>
            <button onClick={() => adjustTime(5)} className="text-white/50 hover:text-white px-2 rounded bg-white/5">+5m</button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center mt-2 z-10 relative">
        <div className="text-4xl font-bold tracking-tighter" style={{ fontVariantNumeric: "tabular-nums" }}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        
        <div className="flex items-center gap-3 mt-3">
          <button 
            onClick={toggleTimer}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-white/10 hover:bg-white/20' : 'bg-white text-black hover:bg-gray-100'}`}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-1" />}
          </button>
          
          <button 
            onClick={resetTimer}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white/70"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
