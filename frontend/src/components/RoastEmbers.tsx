"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function RoastEmbers() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate 40 particles
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 2,
      duration: 1.5 + Math.random() * 2,
      size: 4 + Math.random() * 12,
      color: Math.random() > 0.5 ? "#f97316" : Math.random() > 0.5 ? "#ef4444" : "#eab308", // orange, red, yellow
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none rounded-[40px]">
      {/* Background glow when roasted */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        className="absolute inset-0 bg-red-600 mix-blend-overlay"
      />
      
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ 
            y: "110%", 
            x: 0, 
            opacity: 0,
            scale: 0.5
          }}
          animate={{ 
            y: "-20%", 
            x: (Math.random() - 0.5) * 100, // Drift left/right
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.2, 0.8, 0]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeOut"
          }}
          className="absolute bottom-0 rounded-full blur-[1px]"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.size / 2}px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}
