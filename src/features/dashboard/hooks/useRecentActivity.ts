import { useState, useEffect, useCallback } from 'react';
import { ActivityItem } from '../../../types';
import { dashboardService } from '../services/dashboardService';

export const useRecentActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getRecentActivities();
      setActivities(data);
    } catch {
      setError('Failed to load recent activity.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { activities, isLoading, error, refetch: fetchActivities };
};
