import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HealthProfileWizard from './HealthProfileWizard';
import * as api from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', () => ({
  createHealthProfile: vi.fn(),
  addAllergy: vi.fn(),
  addDietaryPreference: vi.fn(),
  getAllergens: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('HealthProfileWizard', () => {
  let queryClient: QueryClient;

  const renderWizard = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <HealthProfileWizard />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getAllergens).mockResolvedValue([
      {
        id: '1',
        name: 'Peanuts',
        category: 'Nuts',
        is_major_allergen: true,
      },
    ]);
  });

  it('renders the wizard with step 1 initially', async () => {
    renderWizard();

    await waitFor(() => {
      expect(screen.getByText('Basic Health Information')).toBeInTheDocument();
    });
  });

  it('shows step indicator with all three steps', async () => {
    renderWizard();

    await waitFor(() => {
      // Check for step numbers instead of labels to avoid conflicts with page title
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      // Verify the step labels exist
      const stepLabels = screen.getAllByText(/profile|allergies|preferences/i);
      expect(stepLabels.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('has Next button on step 1', async () => {
    renderWizard();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });
  });
});
