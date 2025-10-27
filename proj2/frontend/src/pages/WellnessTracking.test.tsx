import { render, screen, waitFor } from '@testing-library/react';
import WellnessTrackingPage from './WellnessTracking';
import { BrowserRouter } from 'react-router';
import { wellnessApi } from '@/lib/api';
import { vi } from 'vitest';

// Mock the DashboardNavbar component
vi.mock('@/components/DashboardNavbar', () => ({
  DashboardNavbar: () => <div>Mocked DashboardNavbar</div>,
}));

// Mock the wellness API
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual('@/lib/api');
  return {
    ...actual,
    wellnessApi: {
      getWellnessLogs: vi.fn(),
      getGoals: vi.fn(),
    },
  };
});

describe('WellnessTrackingPage', () => {
  beforeEach(() => {
    // Mock localStorage for auth token
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'eatsential_auth_token') return 'mock-token';
      return null;
    });

    // Mock wellness API responses
    vi.mocked(wellnessApi.getWellnessLogs).mockResolvedValue([]);
    vi.mocked(wellnessApi.getGoals).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders dashboard navbar and main sections', async () => {
    render(
      <BrowserRouter>
        <WellnessTrackingPage />
      </BrowserRouter>
    );

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.getByText(/Wellness Tracking/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Daily Check-in/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Your Trends/i })).toBeInTheDocument();
    expect(screen.getByText(/Wellness Goals/i)).toBeInTheDocument();
  });
});
