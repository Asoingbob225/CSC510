import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { HealthProfileOverview } from './HealthProfileOverview';
import * as healthProfileHooks from '@/hooks/useHealthProfile';
import type { HealthProfile, Allergen } from '@/lib/api';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const mockAllergens: Allergen[] = [
  {
    id: '1',
    name: 'Peanuts',
    category: 'tree_nuts',
    is_major_allergen: true,
    description: 'Peanut allergen',
  },
];

describe('HealthProfileOverview', () => {
  it('shows loading state while fetching data', () => {
    vi.spyOn(healthProfileHooks, 'useHealthProfile').mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as UseQueryResult<HealthProfile>);
    vi.spyOn(healthProfileHooks, 'useAllergens').mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as UseQueryResult<Allergen[]>);

    const queryClient = createTestQueryClient();
    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <HealthProfileOverview />
        </QueryClientProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Health Profile')).toBeInTheDocument();
  });

  it('shows create profile prompt when no profile exists', async () => {
    vi.spyOn(healthProfileHooks, 'useHealthProfile').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<HealthProfile>);
    vi.spyOn(healthProfileHooks, 'useAllergens').mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<Allergen[]>);

    const queryClient = createTestQueryClient();
    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <HealthProfileOverview />
        </QueryClientProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No health profile yet/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Create Profile/i })).toBeInTheDocument();
  });

  it('displays profile data when available', async () => {
    const mockProfile: HealthProfile = {
      id: '1',
      user_id: 'user1',
      weight_kg: 70,
      height_cm: 175,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      allergies: [
        {
          id: '1',
          health_profile_id: '1',
          allergen_id: '1',
          severity: 'mild',
          is_verified: true,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ],
      dietary_preferences: [],
    };

    vi.spyOn(healthProfileHooks, 'useHealthProfile').mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
    } as UseQueryResult<HealthProfile>);
    vi.spyOn(healthProfileHooks, 'useAllergens').mockReturnValue({
      data: mockAllergens,
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<Allergen[]>);

    const queryClient = createTestQueryClient();
    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <HealthProfileOverview />
        </QueryClientProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('70 kg')).toBeInTheDocument();
    });
    expect(screen.getByText(/BMI:/i)).toBeInTheDocument();
    expect(screen.getByText('Peanuts')).toBeInTheDocument();
  });

  it('navigates to health profile page when card is clicked', async () => {
    const user = userEvent.setup();
    const mockProfile: HealthProfile = {
      id: '1',
      user_id: 'user1',
      weight_kg: 70,
      height_cm: 175,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      allergies: [],
      dietary_preferences: [],
    };

    vi.spyOn(healthProfileHooks, 'useHealthProfile').mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
    } as UseQueryResult<HealthProfile>);
    vi.spyOn(healthProfileHooks, 'useAllergens').mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<Allergen[]>);

    const queryClient = createTestQueryClient();
    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <HealthProfileOverview />
        </QueryClientProvider>
      </BrowserRouter>
    );

    // Click the card (the entire card is clickable)
    const card = await screen.findByText('Health Profile');
    await user.click(card.closest('[data-slot="card"]')!);

    expect(mockNavigate).toHaveBeenCalledWith('/health-profile');
  });
});
