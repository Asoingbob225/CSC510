import axios from 'axios';

// Token management
export const TOKEN_KEY = 'eatsential_auth_token';

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Create axios instance
const apiClient = axios.create({
  baseURL: '/api', // Use relative path, Vite will proxy automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: automatically add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired, clear and redirect to login page
      clearAuthToken();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Health Profile API Types
export type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'life_threatening';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type PreferenceType = 'diet' | 'cuisine' | 'ingredient' | 'preparation';

export interface Allergen {
  id: string;
  name: string;
  category: string;
  is_major_allergen: boolean;
  description?: string;
}

export interface UserAllergy {
  id: string;
  health_profile_id: string;
  allergen_id: string;
  severity: string;
  diagnosed_date?: string;
  reaction_type?: string;
  notes?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface DietaryPreference {
  id: string;
  health_profile_id: string;
  preference_type: string;
  preference_name: string;
  is_strict: boolean;
  reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthProfile {
  id: string;
  user_id: string;
  height_cm?: number;
  weight_kg?: number;
  activity_level?: string;
  metabolic_rate?: number;
  created_at: string;
  updated_at: string;
  allergies: UserAllergy[];
  dietary_preferences: DietaryPreference[];
}

// Health Profile API functions
export const healthProfileApi = {
  // Get user's health profile
  getProfile: () => apiClient.get<HealthProfile>('/health/profile'),

  // Create health profile
  createProfile: (data: {
    height_cm?: number;
    weight_kg?: number;
    activity_level?: ActivityLevel;
    metabolic_rate?: number;
  }) => apiClient.post<HealthProfile>('/health/profile', data),

  // Update health profile
  updateProfile: (data: {
    height_cm?: number;
    weight_kg?: number;
    activity_level?: ActivityLevel;
    metabolic_rate?: number;
  }) => apiClient.put<HealthProfile>('/health/profile', data),

  // Delete health profile
  deleteProfile: () => apiClient.delete('/health/profile'),

  // List all allergens
  listAllergens: () => apiClient.get<Allergen[]>('/health/allergens'),

  // Add allergy
  addAllergy: (data: {
    allergen_id: string;
    severity: AllergySeverity;
    diagnosed_date?: string;
    reaction_type?: string;
    notes?: string;
    is_verified?: boolean;
  }) => apiClient.post<UserAllergy>('/health/allergies', data),

  // Update allergy
  updateAllergy: (
    allergyId: string,
    data: {
      severity?: AllergySeverity;
      diagnosed_date?: string;
      reaction_type?: string;
      notes?: string;
      is_verified?: boolean;
    }
  ) => apiClient.put<UserAllergy>(`/health/allergies/${allergyId}`, data),

  // Delete allergy
  deleteAllergy: (allergyId: string) => apiClient.delete(`/health/allergies/${allergyId}`),

  // Add dietary preference
  addDietaryPreference: (data: {
    preference_type: PreferenceType;
    preference_name: string;
    is_strict?: boolean;
    reason?: string;
    notes?: string;
  }) => apiClient.post<DietaryPreference>('/health/dietary-preferences', data),

  // Update dietary preference
  updateDietaryPreference: (
    preferenceId: string,
    data: {
      preference_name?: string;
      is_strict?: boolean;
      reason?: string;
      notes?: string;
    }
  ) => apiClient.put<DietaryPreference>(`/health/dietary-preferences/${preferenceId}`, data),

  // Delete dietary preference
  deleteDietaryPreference: (preferenceId: string) =>
    apiClient.delete(`/health/dietary-preferences/${preferenceId}`),
};

export default apiClient;
