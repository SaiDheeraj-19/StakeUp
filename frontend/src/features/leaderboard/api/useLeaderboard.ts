import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  commitment_score: number;
  current_streak: number;
  is_current_user: boolean;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  total_users: number;
  current_user_rank: number | null;
}

export function useLeaderboard(limit: number = 100) {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get(`/leaderboard/?limit=${limit}`);
        setData(response.data);
      } catch (err) {
        setError("Failed to load leaderboard");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit]);

  return { data, isLoading, error };
}
