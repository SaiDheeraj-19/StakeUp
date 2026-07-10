import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="bg-black min-h-screen text-white py-20 px-6 relative overflow-hidden">
      {/* Cinematic Background Orbs */}
      <div className="absolute top-0 left-1/4 w-1/2 h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
      
      <div className="max-w-3xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link href="/" className="inline-flex items-center text-white/50 hover:text-white transition-colors mb-10 text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div>
          <h1 className="text-5xl sm:text-7xl mb-8" style={{ fontFamily: "'Instrument Serif', serif" }}>Privacy Policy</h1>
          <div className="space-y-8 text-white/70 leading-relaxed font-medium" style={{ fontFamily: "system-ui, sans-serif" }}>
            <p>
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <section className="space-y-4">
              <h2 className="text-3xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>1. Introduction</h2>
              <p>
                At StakeUp, we take your privacy and personal data seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our application.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-3xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>2. Information We Collect</h2>
              <p>
                We may collect information about you in a variety of ways. The information we may collect includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number.</li>
                <li><strong>Usage Data:</strong> Information our servers automatically collect when you access the application, such as your IP address, browser type, operating system, and the times of your visits.</li>
                <li><strong>Goal & Challenge Data:</strong> Information regarding the habits you are tracking, your check-ins, and mock stakes to facilitate the leaderboard functionality.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-3xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>3. How We Use Your Information</h2>
              <p>
                Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create and manage your account.</li>
                <li>Compile anonymous statistical data and analysis for use internally or with third parties.</li>
                <li>Monitor and analyze usage and trends to improve your experience with StakeUp.</li>
                <li>Calculate your standing on the public leaderboard.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-3xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>4. Security of Your Information</h2>
              <p>
                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-3xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>5. Contact Us</h2>
              <p>
                If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@stakeup.app" className="text-indigo-400 hover:underline">privacy@stakeup.app</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
