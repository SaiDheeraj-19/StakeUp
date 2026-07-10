import { LeaderboardTable } from "@/features/leaderboard/components/LeaderboardTable";

export default function LeaderboardPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-4xl sm:text-5xl tracking-wide mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>Global Leaderboard</h1>
        <p className="text-white/60 font-medium">Compare your consistency against the StakeUp community.</p>
      </div>

      <LeaderboardTable />
    </div>
  );
}
