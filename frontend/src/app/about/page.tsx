import Link from "next/link";
import { ArrowLeft, Code, Layout, ShieldCheck, Database, CheckSquare, Zap, Target, Lock } from "lucide-react";

const TEAM_MEMBERS = [
  {
    id: 1,
    name: "Sai Dheeraj",
    role: "Full Stack Architect",
    desc: "Architecting the core viral engine and orchestrating the platform's scalable infrastructure.",
    icon: <Code className="w-8 h-8" />,
    color: "from-blue-500/20 to-indigo-500/0 text-blue-500",
    border: "group-hover:border-blue-500/30",
    span: "lg:col-span-8 md:col-span-6 col-span-1",
  },
  {
    id: 2,
    name: "Padmasree Kunigiri",
    role: "QA & Backend Ops",
    desc: "Ensuring zero-downtime deployments and rigorous end-to-end feature validation.",
    icon: <Database className="w-8 h-8" />,
    color: "from-emerald-500/20 to-teal-500/0 text-emerald-500",
    border: "group-hover:border-emerald-500/30",
    span: "lg:col-span-4 md:col-span-3 col-span-1",
  },
  {
    id: 3,
    name: "Nakka Vyshnavi",
    role: "Frontend Dashboards",
    desc: "Crafting the premium, cinematic analytics interfaces that drive user retention.",
    icon: <Layout className="w-8 h-8" />,
    color: "from-purple-500/20 to-fuchsia-500/0 text-purple-500",
    border: "group-hover:border-purple-500/30",
    span: "lg:col-span-4 md:col-span-3 col-span-1",
  },
  {
    id: 4,
    name: "Kadiyala Goutam",
    role: "Systems Testing",
    desc: "Guaranteeing flawless execution across the entire StakeUp ecosystem.",
    icon: <CheckSquare className="w-8 h-8" />,
    color: "from-amber-500/20 to-orange-500/0 text-amber-500",
    border: "group-hover:border-amber-500/30",
    span: "lg:col-span-4 md:col-span-3 col-span-1",
  },
  {
    id: 5,
    name: "Sheerani Ahmed Yasin Khan",
    role: "Full Stack Engineer",
    desc: "Bridging the gap between beautiful client interfaces and robust backend logic.",
    icon: <ShieldCheck className="w-8 h-8" />,
    color: "from-rose-500/20 to-pink-500/0 text-rose-500",
    border: "group-hover:border-rose-500/30",
    span: "lg:col-span-4 md:col-span-3 col-span-1",
  }
];

export default function AboutPage() {
  return (
    <main className="bg-black min-h-screen text-white relative overflow-hidden selection:bg-white/30">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-full h-[800px] bg-gradient-to-b from-indigo-900/20 via-black to-black blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[20%] left-[-10%] w-[50%] h-[500px] bg-rose-900/10 blur-[150px] pointer-events-none z-0 rounded-full" />
      
      {/* Noise Texture */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      <div className="max-w-7xl mx-auto relative z-10 px-6 py-12 lg:py-24 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
        
        {/* Navigation */}
        <nav className="mb-16">
          <Link href="/" className="group inline-flex items-center text-white/40 hover:text-white transition-colors text-sm font-medium tracking-wide">
            <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-3 group-hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </span>
            Return to StakeUp
          </Link>
        </nav>
        
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end mb-20">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-widest uppercase mb-6 text-white/60 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              The Architects
            </div>
            <h1 className="text-6xl sm:text-8xl leading-[0.9] tracking-tight mb-6" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Team 2 &middot; <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">Tigers</span>
            </h1>
          </div>
          <div className="lg:col-span-4 pb-4">
            <p className="text-white/50 text-lg sm:text-xl leading-relaxed" style={{ fontFamily: "system-ui, sans-serif" }}>
              We are a collective of elite engineers, designers, and strategists driven by a singular mission: <strong className="text-white/90 font-medium">Build the most impressive product in the hackathon.</strong>
            </p>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 lg:gap-6">
          {TEAM_MEMBERS.map((member, idx) => (
            <div
              key={member.id}
              className={`${member.span} group relative bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black ${member.border} animate-in fade-in zoom-in-95 duration-700 fill-mode-backwards`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Card Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
              
              {/* Massive Number Watermark */}
              <div 
                className="absolute -right-4 -bottom-8 text-[12rem] font-bold text-white/[0.02] group-hover:text-white/[0.04] transition-colors duration-500 pointer-events-none select-none"
                style={{ fontFamily: "'Instrument Serif', serif", lineHeight: 1 }}
              >
                {member.id}
              </div>

              <div className="relative z-10 p-8 sm:p-10 h-full flex flex-col">
                <div className="flex items-start justify-between mb-auto pb-12">
                  <div className={`w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center shadow-xl`}>
                    {member.icon}
                  </div>
                </div>
                
                <div>
                  <p className="text-white/40 text-sm font-semibold uppercase tracking-widest mb-3" style={{ fontFamily: "system-ui, sans-serif" }}>
                    {member.role}
                  </p>
                  <h3 className="text-3xl sm:text-4xl text-white mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    {member.name}
                  </h3>
                  {member.desc && (
                    <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-sm" style={{ fontFamily: "system-ui, sans-serif" }}>
                      {member.desc}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Philosophy Section */}
        <div className="mt-32 border-t border-white/10 pt-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-6xl mb-6" style={{ fontFamily: "'Instrument Serif', serif" }}>Our Engineering Philosophy</h2>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">StakeUp is built on three core pillars of robust software architecture.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <Lock className="w-5 h-5 text-white/80" />
              </div>
              <h4 className="text-xl font-medium mb-3">Immutable Escrow</h4>
              <p className="text-white/50 text-sm leading-relaxed">Financial-grade database transactions ensure every StakeCoin is cryptographically locked and accounted for during battles.</p>
            </div>
            
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <Zap className="w-5 h-5 text-white/80" />
              </div>
              <h4 className="text-xl font-medium mb-3">Cinematic UX</h4>
              <p className="text-white/50 text-sm leading-relaxed">Performance isn't an afterthought. Every interaction is designed to feel instantaneous, deeply satisfying, and premium.</p>
            </div>

            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <Target className="w-5 h-5 text-white/80" />
              </div>
              <h4 className="text-xl font-medium mb-3">AI Defensibility</h4>
              <p className="text-white/50 text-sm leading-relaxed">Using cutting-edge vision models to act as impartial referees, completely removing human bias from accountability tracking.</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
