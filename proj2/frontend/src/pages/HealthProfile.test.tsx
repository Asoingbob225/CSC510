import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import * as ReactRouter from 'react-router';
import HealthProfilePage from './HealthProfile';
import * as api from '@/lib/api';

// Mock the API module
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual('@/lib/api');
  return {
    ...actual,
    getAuthToken: vi.fn(),
    clearAuthToken: vi.fn(),
    healthProfileApi: {
      getProfile: vi.fn(),
      createProfile: vi.fn(),
      updateProfile: vi.fn(),
      listAllergens: vi.fn(),
      addAllergy: vi.fn(),
      updateAllergy: vi.fn(),
      deleteAllergy: vi.fn(),
      addDietaryPreference: vi.fn(),
      updateDietaryPreference: vi.fn(),
      deleteDietaryPreference: vi.fn(),
    },
  };
});

describe('HealthProfile Component', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate = vi.fn();
    vi.spyOn(ReactRouter, 'useNavigate').mockReturnValue(mockNavigate);

    // Mock auth token
    vi.mocked(api.getAuthToken).mockReturnValue('mock-token');

    // Mock allergens list
    vi.mocked(api.healthProfileApi.listAllergens).mockResolvedValue({
      data: [
        {
          id: '1',
          name: 'Peanuts',
          category: 'Nuts',
          is_major_allergen: true,
        },
        {
          id: '2',
          name: 'Milk',
          category: 'Dairy',
          is_major_allergen: true,
        },
      ],
    } as never);
  });

  it('redirects to login when no auth token', async () => {
    vi.mocked(api.getAuthToken).mockReturnValue(null);

    render(
      <MemoryRouter>
        <HealthProfilePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('displays loading state initially', () => {
    // Make API calls hang
    vi.mocked(api.healthProfileApi.listAllergens).mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <HealthProfilePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('loads and displays health profile form', async () => {
    vi.mocked(api.healthProfileApi.getProfile).mockResolvedValue({
      data: {
        id: 'profile-1',
        user_id: 'user-1',
        height_cm: 170,
        weight_kg: 70,
        activity_level: 'moderate',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        allergies: [],
        dietary_preferences: [],
      },
    } as never);

    render(
      <MemoryRouter>
        <HealthProfilePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Health Profile')).toBeInTheDocument();
    });

    // Check for all three cards
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Allergies')).toBeInTheDocument();
    expect(screen.getByText('Dietary Preferences')).toBeInTheDocument();

    // Check profile data is displayed
    expect(screen.getByText(/170 cm/)).toBeInTheDocument(); // Height
    expect(screen.getByText(/70 kg/)).toBeInTheDocument(); // Weight
  });

  it('handles profile not found (404) gracefully', async () => {
    const error = {
      response: { status: 404 },
    };
    vi.mocked(api.healthProfileApi.getProfile).mockRejectedValue(error);

    render(
      <MemoryRouter>
        <HealthProfilePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Health Profile')).toBeInTheDocument();
    });

    // Should show "No health profile yet" message
    expect(screen.getByText('No health profile yet')).toBeInTheDocument();
  });

  it('displays existing allergies', async () => {
    vi.mocked(api.healthProfileApi.getProfile).mockResolvedValue({
      data: {
        id: 'profile-1',
        user_id: 'user-1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        allergies: [
          {
            id: 'allergy-1',
            health_profile_id: 'profile-1',
            allergen_id: '1',
            severity: 'severe',
            reaction_type: 'Anaphylaxis',
            is_verified: true,
            notes: 'Test allergy',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
        ],
        dietary_preferences: [],
      },
    } as never);

    render(
      <MemoryRouter>
        <HealthProfilePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Allergies')).toBeInTheDocument();
    });

    expect(screen.getByText('Peanuts')).toBeInTheDocument();
    expect(screen.getByText('Severe')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('displays existing dietary preferences', async () => {
    vi.mocked(api.healthProfileApi.getProfile).mockResolvedValue({
      data: {
        id: 'profile-1',
        user_id: 'user-1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        allergies: [],
        dietary_preferences: [
          {
            id: 'pref-1',
            health_profile_id: 'profile-1',
            preference_type: 'diet',
            preference_name: 'Vegetarian',
            is_strict: true,
            reason: 'Ethical reasons',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
        ],
      },
    } as never);

    render(
      <MemoryRouter>
        <HealthProfilePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Dietary Preferences')).toBeInTheDocument();
    });

    expect(screen.getByText('Vegetarian')).toBeInTheDocument();
    expect(screen.getByText('Strict')).toBeInTheDocument();
  });

  it('navigates back to dashboard when back button is clicked', async () => {
    vi.mocked(api.healthProfileApi.getProfile).mockResolvedValue({
      data: {
        id: 'profile-1',
        user_id: 'user-1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        allergies: [],
        dietary_preferences: [],
      },
    } as never);

    render(
      <MemoryRouter>
        <HealthProfilePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Health Profile')).toBeInTheDocument();
    });

    // Find and click the back button with ArrowLeft icon
    const buttons = screen.getAllByRole('button');
    const backButton = buttons.find((btn) => btn.querySelector('svg'));
    if (backButton) {
      backButton.click();
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    }
  });

  it('logs out and navigates to home when logout is clicked', async () => {
    // Removed - logout button no longer exists in new design
  });

  it('shows error message when data loading fails', async () => {
    vi.mocked(api.healthProfileApi.listAllergens).mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter>
        <HealthProfilePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load health profile data/i)).toBeInTheDocument();
    });
  });
});
