/**
 * TanStack Query hooks for wellness data management
 * Provides caching, automatic refetching, and optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  wellnessApi,
  type MoodLogCreate,
  type StressLogCreate,
  type SleepLogCreate,
  type WellnessLogResponse,
} from '@/lib/api';
import { toast } from 'sonner';

// Query keys for wellness data
export const wellnessKeys = {
  all: ['wellness'] as const,
  logs: (params?: { start_date?: string; end_date?: string }) =>
    [...wellnessKeys.all, 'logs', params] as const,
  todayLog: (date: string) => [...wellnessKeys.all, 'today', date] as const,
};

/**
 * Hook to fetch wellness logs with date range
 */
export function useWellnessLogs(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: wellnessKeys.logs(params),
    queryFn: async () => {
      const result = await wellnessApi.getWellnessLogs(params);
      // Ensure we always return an array
      return Array.isArray(result) ? result : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
  });
}

/**
 * Hook to fetch today's wellness log
 * Returns separate logs for mood, stress, and sleep
 */
export function useTodayWellnessLog() {
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: wellnessKeys.todayLog(today),
    queryFn: async () => {
      const logs = await wellnessApi.getWellnessLogs({
        start_date: today,
        end_date: today,
      });
      // Ensure logs is an array before accessing
      const logsArray = Array.isArray(logs) ? logs : [];

      // Find each type of log for today
      const moodLog = logsArray.find((log) => log.mood_score !== undefined);
      const stressLog = logsArray.find((log) => log.stress_level !== undefined);
      const sleepLog = logsArray.find((log) => log.quality_score !== undefined);

      // Return combined data from all three logs
      return {
        mood_score: moodLog?.mood_score,
        stress_level: stressLog?.stress_level,
        quality_score: sleepLog?.quality_score,
        duration_hours: sleepLog?.duration_hours,
        log_date: today,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes for today's data
  });
}

/**
 * Hook to create a mood log with optimistic updates
 */
export function useCreateMoodLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MoodLogCreate) => wellnessApi.createMoodLog(data),
    onSuccess: () => {
      // Invalidate all wellness logs queries to refetch
      queryClient.invalidateQueries({ queryKey: wellnessKeys.all });
      toast.success('Mood logged successfully! 😊');
    },
    onError: (error: AxiosError) => {
      console.error('Error logging mood:', error);

      // Check if it's a duplicate entry error (409 Conflict)
      if (error.response?.status === 409) {
        toast.error(
          'You already logged your mood today. Please update the existing entry instead.'
        );
      } else {
        toast.error('Failed to log mood. Please try again.');
      }
    },
  });
}

/**
 * Hook to create a stress log with optimistic updates
 */
export function useCreateStressLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StressLogCreate) => wellnessApi.createStressLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wellnessKeys.all });
      toast.success('Stress level logged successfully!');
    },
    onError: (error: AxiosError) => {
      console.error('Error logging stress:', error);

      // Check if it's a duplicate entry error (409 Conflict)
      if (error.response?.status === 409) {
        toast.error(
          'You already logged your stress level today. Please update the existing entry instead.'
        );
      } else {
        toast.error('Failed to log stress. Please try again.');
      }
    },
  });
}

/**
 * Hook to create a sleep log with optimistic updates
 */
export function useCreateSleepLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SleepLogCreate) => wellnessApi.createSleepLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wellnessKeys.all });
      toast.success('Sleep logged successfully! 💤');
    },
    onError: (error: AxiosError) => {
      console.error('Error logging sleep:', error);

      // Check if it's a duplicate entry error (409 Conflict)
      if (error.response?.status === 409) {
        toast.error(
          'You already logged your sleep today. Please update the existing entry instead.'
        );
      } else {
        toast.error('Failed to log sleep. Please try again.');
      }
    },
  });
}

/**
 * Transform wellness logs into chart data format
 */
export function useWellnessChartData(days = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const {
    data: logs,
    isLoading,
    error,
  } = useWellnessLogs({
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
  });

  const chartData = {
    mood: [] as Array<{ date: string; value: number }>,
    stress: [] as Array<{ date: string; value: number }>,
    sleep: [] as Array<{ date: string; value: number }>,
  };

  if (logs && logs.length > 0) {
    logs.forEach((log: WellnessLogResponse) => {
      if (log.mood_score !== undefined && log.mood_score !== null) {
        chartData.mood.push({ date: log.log_date, value: log.mood_score });
      }
      if (log.stress_level !== undefined && log.stress_level !== null) {
        chartData.stress.push({ date: log.log_date, value: log.stress_level });
      }
      if (log.quality_score !== undefined && log.quality_score !== null) {
        chartData.sleep.push({ date: log.log_date, value: log.quality_score });
      }
    });
  }

  return { data: chartData, isLoading, error };
}
