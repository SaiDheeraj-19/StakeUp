/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export interface AdminStats {
  total_users: number;
  total_active_challenges: number;
  total_mock_stakes: number;
}

export interface AdminUser {
  id: string;
  email: string;
  commitment_score: number;
  is_superuser: boolean;
  created_at: string;
}

export function useAdminStats() {
  const [data, setData] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load admin stats");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return { data, isLoading, error };
}

export function useAdminUsers(skip: number = 0, limit: number = 50) {
  const [data, setData] = useState<{items: AdminUser[], total: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get(`/admin/users?skip=${skip}&limit=${limit}`);
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load admin users");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [skip, limit]);

  return { data, isLoading, error };
}
