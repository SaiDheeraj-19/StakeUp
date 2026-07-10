"use client";

import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const VIDEOS = [
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4",
    label: "Golden Hour",
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4",
    label: "Still Water",
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4",
    label: "Deep Woods",
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4",
    label: "Quiet Dawn",
  }
];

const NAV_LINKS: { name: string; href: string }[] = [];

const FAQS = [
  {
    question: "What is StakeUp?",
    answer: "StakeUp is a high-stakes accountability platform that enforces consistency through structured challenges, social leaderboards, and mock wagers. It transforms self-improvement into a competitive, measurable experience."
  },
  {
    question: "How do Stake Battles work?",
    answer: "Stake Battles are head-to-head accountability challenges. You and a friend lock up a wager of StakeCoins into our Virtual Escrow. Over the battle period, you both check-in. The winner takes the entire pot. If you fail, your stake is distributed to the winner."
  },
  {
    question: "What is ProofIQ™ and how does it prevent cheating?",
    answer: "ProofIQ™ is our proprietary AI vision system. Instead of simply tapping a button to say you completed a task, you upload a photo (e.g., your gym equipment, a book, your coding screen). ProofIQ™ analyzes the image to verify it matches your goal before granting you credit."
  },
  {
    question: "What is the Virtual Escrow system?",
    answer: "When you join a Stake Battle, your staked coins are immediately deducted and held in an immutable, cryptographically secure escrow pool. Neither player can touch those coins until the AI Referee resolves the battle at the end of the challenge period."
  },
  {
    question: "What happens if there's a tie in a Stake Battle?",
    answer: "If both participants achieve a perfect score or end the battle with the exact same completion rate, the AI Referee declares a draw and the escrowed pot is evenly refunded to both players."
  },
  {
    question: "Is StakeUp free to use?",
    answer: "Yes! Our core accountability features, ProofIQ™ verification, and public leaderboards are entirely free. You are wagering mock-currency (StakeCoins), not real money."
  },
  {
    question: "How do I earn more StakeCoins?",
    answer: "You start with an initial grant of StakeCoins when you sign up. From there, you earn more by maintaining daily streaks, winning Stake Battles against friends, and climbing the global leaderboard tiers."
  },
  {
    question: "Can I cheat the system?",
    answer: "While ProofIQ™ makes it incredibly difficult to fake check-ins, the ultimate truth is that StakeUp is a tool for personal growth. You can try to trick the AI, but you're only lying to yourself. StakeUp is for those who actually want to change."
  }
];

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left transition-colors hover:text-white/80"
      >
        <span className="text-xl font-medium">{question}</span>
        <svg 
          className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-white/60 leading-relaxed text-sm">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


export default function LandingPage() {
  const [activeVideo, setActiveVideo] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleVideoSwitch = (index: number) => {
    if (index === activeVideo || isTransitioning) return;
    setIsTransitioning(true);
    setActiveVideo(index);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  const isDarkMode = activeVideo === 2;

  // Colors for transition
  const textColor = isDarkMode ? "text-[#182C41]" : "text-white";
  const badgeBg = isDarkMode ? "bg-[#182C41]/10" : "bg-white/10";
  const badgeBorder = isDarkMode ? "border-[#182C41]/20" : "border-white/20";
  const subtextColor = isDarkMode ? "text-[#182C41]/80" : "text-white/80";
  const buttonBg = isDarkMode ? "bg-[#182C41]" : "bg-white";
  const buttonText = isDarkMode ? "text-white" : "text-black";

  return (
    <main className="bg-black flex flex-col min-h-screen">
      <section 
        className="relative w-full h-[100dvh] overflow-hidden bg-black flex flex-col"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
      {/* Background Videos */}
      <div className="absolute inset-0 z-0">
        {VIDEOS.map((video, idx) => (
          <video
            key={idx}
            src={video.url}
            autoPlay={idx === activeVideo}
            preload={idx === 0 ? "auto" : "none"}
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover bg-black transition-opacity duration-1000 ease-in-out ${
              idx === activeVideo ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Transparent PNG Overlay */}
      <div className="absolute inset-0 z-[1] pointer-events-none animate-train-bob">
        <img
          src="https://soft-zoom-63098134.figma.site/_assets/v11/0b4a435b2df2747593c43d7a1c9b4578f7d8d90c.png"
          alt="Texture overlay"
          className="w-full h-full object-cover opacity-60"
        />
      </div>

      {/* Navigation Layer */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-10 shrink-0">
        <div className="text-white text-xl sm:text-2xl italic tracking-wide">
          StakeUp.
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center">
          <div className="liquid-glass rounded-full flex items-center p-1 pl-6" style={{ fontFamily: "system-ui, sans-serif" }}>
            <div className="flex items-center gap-6 mr-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-white/90 text-sm hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <Link href="/login" className="text-white/90 text-sm hover:text-white transition-colors font-medium">
                Log In
              </Link>
            </div>
            <Link
              href="/register"
              className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden liquid-glass w-12 h-12 rounded-full flex items-center justify-center relative overflow-hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div
            className="absolute transition-all duration-300 ease-in-out"
            style={{
              transform: mobileMenuOpen ? "rotate(90deg) scale(0.75)" : "rotate(0deg) scale(1)",
              opacity: mobileMenuOpen ? 0 : 1
            }}
          >
            <Menu className="w-5 h-5" />
          </div>
          <div
            className="absolute transition-all duration-300 ease-in-out"
            style={{
              transform: mobileMenuOpen ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.75)",
              opacity: mobileMenuOpen ? 1 : 0
            }}
          >
            <X className="w-5 h-5" />
          </div>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            <button
              className="absolute top-6 right-6 text-white p-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-8 h-8" />
            </button>
            <div className="flex flex-col items-center gap-8">
              {NAV_LINKS.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.1 + idx * 0.05,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  <Link
                    href={link.href}
                    className="text-white text-4xl hover:opacity-70 transition-opacity"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{
                  duration: 0.5,
                  delay: 0.1 + NAV_LINKS.length * 0.05,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="mt-4"
              >
                <Link
                  href="/login"
                  className="text-white/80 text-2xl hover:text-white transition-opacity"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  Log In
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.5,
                  delay: 0.1 + (NAV_LINKS.length + 1) * 0.05,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="mt-6"
              >
                <Link
                  href="/register"
                  className="bg-white text-black px-8 py-4 rounded-full text-lg font-medium shadow-xl"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  Get Started
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 text-center transition-colors duration-700">
        


        {/* Heading */}
        <h1 className={`text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.1] max-w-4xl tracking-tight transition-colors duration-700 ${textColor}`}>
          Discipline in an Endlessly <br className="hidden sm:block" />
          Distracted World
        </h1>

        {/* Subtext */}
        <p 
          className={`mt-6 max-w-xl text-sm sm:text-base leading-relaxed transition-colors duration-700 ${subtextColor}`}
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          Stop relying on fleeting motivation. StakeUp enforces consistency through structured challenges, social leaderboards, and high-stakes mock wagers.
        </p>

        {/* Main CTA */}
        <div className="mt-10" style={{ fontFamily: "system-ui, sans-serif" }}>
          <Link
            href="/register"
            className={`px-8 py-3.5 rounded-full text-base font-semibold transition-all duration-700 ${buttonBg} ${buttonText} hover:opacity-90 inline-block shadow-lg hover:scale-105`}
          >
            Start Staking Now
          </Link>
        </div>


      </main>


    </section>

    {/* The Method Section */}
    <section className="relative w-full bg-black text-white py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl sm:text-6xl mb-16 text-center" style={{ fontFamily: "'Instrument Serif', serif" }}>
          The Method
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12" style={{ fontFamily: "system-ui, sans-serif" }}>
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium">Accountability Pledges</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Commit to a goal and stake your reputation. We hold you accountable with daily check-ins and unyielding consistency tracking.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium">Social Leaderboards</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Compete with friends or the community. Ascend the ranks by maintaining your streaks and proving your dedication.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium">Hard Data</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Analyze your performance with comprehensive analytics. Visualize your consistency and find areas for improvement.
            </p>
          </div>

        </div>
      </div>
    </section>

    {/* FAQ Section */}
    <section className="relative w-full bg-black text-white py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl sm:text-6xl mb-12 text-center" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col" style={{ fontFamily: "system-ui, sans-serif" }}>
          {FAQS.map((faq, idx) => (
            <FAQItem key={idx} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
    
      {/* Video Footer Section */}
      <footer className="relative w-full min-h-[300px] sm:min-h-[400px] overflow-hidden flex flex-col items-center justify-center py-12 px-8 text-center text-white">
        <video
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40 z-0"
        />
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/60 z-0 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center w-full max-w-5xl mx-auto h-full justify-center">
          <div className="mt-auto flex flex-col items-center space-y-4">
            <h2 className="text-3xl sm:text-5xl font-medium tracking-wide opacity-90" style={{ fontFamily: "'Instrument Serif', serif" }}>
              &quot;Discipline is destiny.&quot;
            </h2>
            <p className="text-white/50 text-xs sm:text-sm tracking-[0.2em] uppercase" style={{ fontFamily: "system-ui, sans-serif" }}>
              Build Yours With StakeUp
            </p>
          </div>
          
          <div className="mt-auto w-full flex flex-col sm:flex-row items-center justify-between text-white/50 text-sm pt-6" style={{ fontFamily: "system-ui, sans-serif" }}>
            <div className="italic text-white/70 text-xl mb-4 sm:mb-0" style={{ fontFamily: "'Instrument Serif', serif" }}>StakeUp.</div>
            <div className="flex gap-6 mb-4 sm:mb-0">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
            </div>
            <div>© 2026 StakeUp. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </main>
  );
}
