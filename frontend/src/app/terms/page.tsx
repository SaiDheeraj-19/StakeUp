import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="bg-black min-h-screen text-white py-20 px-6 relative overflow-hidden">
      {/* Cinematic Background Orbs */}
      <div className="absolute top-0 right-1/4 w-1/2 h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
      
      <div className="max-w-3xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link href="/" className="inline-flex items-center text-white/50 hover:text-white transition-colors mb-10 text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div>
          <h1 className="text-5xl sm:text-7xl mb-8" style={{ fontFamily: "'Instrument Serif', serif" }}>Terms of Service</h1>
          <div className="space-y-8 text-white/70 leading-relaxed font-medium" style={{ fontFamily: "system-ui, sans-serif" }}>
            <p>
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <section className="space-y-4">
              <h2 className="text-3xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>1. Agreement to Terms</h2>
              <p>
                By accessing or using StakeUp, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-3xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>2. Use of the Service</h2>
              <p>
                StakeUp is an accountability platform. You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>In any way that violates any applicable national or international law or regulation.</li>
                <li>To attempt to exploit, harm, or trick the leaderboard algorithms.</li>
                <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-3xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>3. Mock Currency (Points)</h2>
              <p>
                StakeUp utilizes a &quot;points&quot; system to simulate stakes. These points hold no real-world monetary value, cannot be exchanged for cash, and are solely used as a gamification mechanism within the ecosystem. We reserve the right to modify or reset point balances in cases of suspected fraud or system resets.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-3xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>4. Account Termination</h2>
              <p>
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-3xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>5. Limitation of Liability</h2>
              <p>
                In no event shall StakeUp, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
