import { useQuery } from '@tanstack/react-query';
import { healthProfileApi, type HealthProfile, type Allergen } from '@/lib/api';

export function useHealthProfile() {
  return useQuery<HealthProfile>({
    queryKey: ['healthProfile'],
    queryFn: async () => {
      const response = await healthProfileApi.getProfile();
      return response.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAllergens() {
  return useQuery<Allergen[]>({
    queryKey: ['allergens'],
    queryFn: async () => {
      const response = await healthProfileApi.listAllergens();
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - allergen list changes rarely
  });
}
