import axios from 'axios';

// Token management
export const TOKEN_KEY = 'eatsential_auth_token';
export const USER_ROLE_KEY = 'eatsential_user_role';

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
};

export const setUserRole = (role: string) => {
  localStorage.setItem(USER_ROLE_KEY, role);
};

export const getUserRole = (): string | null => {
  return localStorage.getItem(USER_ROLE_KEY);
};

export const isAdmin = (): boolean => {
  return getUserRole() === 'admin';
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

// User and Auth Types
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse extends User {
  access_token: string;
  token_type: string;
  message: string;
  has_completed_wizard: boolean;
}

export interface UserResponse extends User {
  message: string;
}

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

// --- Health Profile API ---

export interface HealthProfileCreate {
  height_cm?: number;
  weight_kg?: number;
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  metabolic_rate?: number;
}

export interface HealthProfileResponse {
  id: string;
  user_id: string;
  height_cm?: number;
  weight_kg?: number;
  activity_level?: string;
  metabolic_rate?: number;
  created_at: string;
  updated_at: string;
  allergies: UserAllergyResponse[];
  dietary_preferences: DietaryPreferenceResponse[];
}

export interface UserAllergyCreate {
  allergen_id: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  diagnosed_date?: string;
  reaction_type?: string;
  notes?: string;
  is_verified?: boolean;
}

export interface UserAllergyResponse {
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

export interface DietaryPreferenceCreate {
  preference_type: 'diet' | 'cuisine' | 'ingredient' | 'preparation';
  preference_name: string;
  is_strict?: boolean;
  reason?: string;
  notes?: string;
}

export interface DietaryPreferenceResponse {
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

export interface AllergenResponse {
  id: string;
  name: string;
  category: string;
  is_major_allergen: boolean;
  description?: string;
}

export interface AllergenCreate {
  name: string;
  category: string;
  is_major_allergen: boolean;
  description?: string;
}

export interface AllergenUpdate {
  name?: string;
  category?: string;
  is_major_allergen?: boolean;
  description?: string;
}

// Create health profile
export const createHealthProfile = async (
  data: HealthProfileCreate
): Promise<HealthProfileResponse> => {
  const response = await apiClient.post('/health/profile', data);
  return response.data;
};

// Get health profile
export const getHealthProfile = async (): Promise<HealthProfileResponse> => {
  const response = await apiClient.get('/health/profile');
  return response.data;
};

// Add allergy
export const addAllergy = async (data: UserAllergyCreate): Promise<UserAllergyResponse> => {
  const response = await apiClient.post('/health/allergies', data);
  return response.data;
};

// Add dietary preference
export const addDietaryPreference = async (
  data: DietaryPreferenceCreate
): Promise<DietaryPreferenceResponse> => {
  const response = await apiClient.post('/health/dietary-preferences', data);
  return response.data;
};

// Get all allergens from database
export const getAllergens = async (): Promise<AllergenResponse[]> => {
  const response = await apiClient.get('/health/allergens');
  return response.data;
};

// Admin User Management Types
export interface UserListItem {
  id: string;
  username: string;
  email: string;
  role: string;
  account_status: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserDetailData {
  id: string;
  username: string;
  email: string;
  role: string;
  account_status: string;
  email_verified: boolean;
  verification_token_expires?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpdate {
  username?: string;
  role?: string;
  account_status?: string;
  email_verified?: boolean;
}

// Auth API functions
export const getCurrentUser = async (): Promise<UserResponse> => {
  const response = await apiClient.get('/users/me');
  return response.data;
};

// Admin API functions
export const adminApi = {
  // Get all users (admin only)
  getAllUsers: async (): Promise<UserListItem[]> => {
    const response = await apiClient.get('/users/admin/users');
    return response.data;
  },

  // Get user details (admin only)
  getUserDetails: async (userId: string): Promise<UserDetailData> => {
    const response = await apiClient.get(`/users/admin/users/${userId}`);
    return response.data;
  },

  // Update user profile (admin only)
  updateUser: async (userId: string, data: UserProfileUpdate): Promise<UserDetailData> => {
    const response = await apiClient.put(`/users/admin/users/${userId}`, data);
    return response.data;
  },

  // Allergen management (admin only)
  getAllergens: async (): Promise<AllergenResponse[]> => {
    const response = await apiClient.get('/health/allergens');
    return response.data;
  },

  createAllergen: async (data: AllergenCreate): Promise<AllergenResponse> => {
    const response = await apiClient.post('/health/admin/allergens', data);
    return response.data;
  },

  updateAllergen: async (allergenId: string, data: AllergenUpdate): Promise<AllergenResponse> => {
    const response = await apiClient.put(`/health/admin/allergens/${allergenId}`, data);
    return response.data;
  },

  deleteAllergen: async (allergenId: string): Promise<void> => {
    await apiClient.delete(`/health/admin/allergens/${allergenId}`);
  },
};

// Mental Wellness API Types
export interface MoodLogCreate {
  mood_score: number;
  notes?: string;
  log_date?: string;
}

export interface StressLogCreate {
  stress_level: number;
  triggers?: string;
  notes?: string;
  log_date?: string;
}

export interface SleepLogCreate {
  sleep_duration: number;
  sleep_quality: number;
  notes?: string;
  log_date?: string;
}

export interface GoalCreate {
  goal_type: 'nutrition' | 'mental_wellness';
  title: string;
  description?: string;
  target_value?: number;
  current_value?: number;
  target_date?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface WellnessLogResponse {
  id: string;
  user_id: string;
  mood_score?: number;
  stress_level?: number;
  sleep_duration?: number;
  sleep_quality?: number;
  notes?: string;
  triggers?: string;
  log_date: string;
  created_at: string;
}

export interface GoalResponse {
  id: string;
  user_id: string;
  goal_type: string;
  title: string;
  description?: string;
  target_value?: number;
  current_value?: number;
  target_date?: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Mental Wellness API
export const wellnessApi = {
  // Mood logs
  createMoodLog: async (data: MoodLogCreate): Promise<WellnessLogResponse> => {
    const response = await apiClient.post('/wellness/mood-logs', data);
    return response.data;
  },

  // Stress logs
  createStressLog: async (data: StressLogCreate): Promise<WellnessLogResponse> => {
    const response = await apiClient.post('/wellness/stress-logs', data);
    return response.data;
  },

  // Sleep logs
  createSleepLog: async (data: SleepLogCreate): Promise<WellnessLogResponse> => {
    const response = await apiClient.post('/wellness/sleep-logs', data);
    return response.data;
  },

  // Get all wellness logs
  getWellnessLogs: async (params?: {
    start_date?: string;
    end_date?: string;
    log_type?: string;
  }): Promise<WellnessLogResponse[]> => {
    const response = await apiClient.get('/wellness/logs', { params });
    return response.data;
  },

  // Goals
  createGoal: async (data: GoalCreate): Promise<GoalResponse> => {
    const response = await apiClient.post('/goals', data);
    return response.data;
  },

  getGoals: async (params?: { goal_type?: string; status?: string }): Promise<GoalResponse[]> => {
    const response = await apiClient.get('/goals', { params });
    return response.data;
  },

  deleteGoal: async (goalId: string): Promise<void> => {
    await apiClient.delete(`/goals/${goalId}`);
  },
};

// GitHub API types
export interface GitHubIssue {
  number: number;
  title: string;
  state: string;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  labels: Array<{
    name: string;
    color: string;
  }>;
  pull_request?: {
    url: string;
  };
}

// GitHub API client (no auth needed for public repos)
const GITHUB_REPO = 'Asoingbob225/CSC510'; // Your repo

export const githubApi = {
  getRecentIssues: async (limit = 5): Promise<GitHubIssue[]> => {
    const response = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
      params: {
        state: 'all',
        sort: 'updated',
        direction: 'desc',
        per_page: limit,
      },
    });
    return response.data;
  },

  getRecentPRs: async (limit = 5): Promise<GitHubIssue[]> => {
    const response = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/pulls`, {
      params: {
        state: 'all',
        sort: 'updated',
        direction: 'desc',
        per_page: limit,
      },
    });
    return response.data;
  },
};
