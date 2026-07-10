import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Target, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function UpcomingChallenges() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await api.get("/goals/");
        // Filter for active goals and sort by end date (closest first)
        const activeGoals = res.data
          .filter((g: any) => g.status === "active")
          .sort((a: any, b: any) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
        setGoals(activeGoals.slice(0, 3)); // Only show top 3
      } catch (error) {
        console.error("Failed to fetch goals", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGoals();
  }, []);

  if (loading) {
    return (
      <Card className="rounded-[32px] shadow-sm border-zinc-100 h-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" />
            Upcoming Challenges
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[32px] shadow-sm border-zinc-100 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-500" />
          Upcoming Challenges
        </CardTitle>
        <Link href="/challenges" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {goals.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-6 text-zinc-500 bg-zinc-50 rounded-2xl">
            <p>No active challenges right now.</p>
            <Link href="/goals/new" className="block mt-2 text-indigo-600 font-medium hover:underline">
              Create one today!
            </Link>
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            {goals.map((goal, index) => {
              const endDate = new Date(goal.end_date);
              const isDueToday = endDate.toDateString() === new Date().toDateString();
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={goal.id} 
                  className="flex items-center justify-between p-4 bg-zinc-50/80 rounded-[20px] border border-zinc-100 hover:border-indigo-200 transition-colors"
                >
                  <div>
                    <h4 className="font-semibold text-zinc-900 line-clamp-1">{goal.title}</h4>
                    <p className="text-xs text-zinc-500 mt-1">
                      {isDueToday ? (
                        <span className="text-red-500 font-medium">Due today!</span>
                      ) : (
                        `Ends ${endDate.toLocaleDateString()}`
                      )}
                    </p>
                  </div>
                  <Link 
                    href={`/goals/${goal.id}`}
                    className="px-4 py-2 bg-white border border-zinc-200 shadow-sm text-sm font-medium rounded-full hover:bg-zinc-50 hover:text-indigo-600 transition-colors shrink-0"
                  >
                    Check In
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
