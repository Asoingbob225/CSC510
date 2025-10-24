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
