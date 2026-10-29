import { useState, useEffect, useCallback } from 'react';
import { DashboardStats } from '../types/dashboard';
import { dashboardService } from '../services/dashboardService';

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTemplates: 0,
    totalListings: 0,
    draftListings: 0,
    readyListings: 0,
    exportedListings: 0,
    estimatedTimeSavedHours: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError('Failed to load dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
};
