import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import * as ReactRouter from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminDashboard from './AdminDashboard';
import * as api from '@/lib/api';

// Mock API module
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual('@/lib/api');
  return {
    ...actual,
    adminApi: {
      getAllergens: vi.fn(),
      getAllUsers: vi.fn(),
    },
    githubApi: {
      getRecentIssues: vi.fn(),
      getRecentPRs: vi.fn(),
    },
  };
});

// Mock data
const mockAllergens = [
  { id: '1', name: 'Peanuts', category: 'Nuts', is_major_allergen: true },
  { id: '2', name: 'Milk', category: 'Dairy', is_major_allergen: true },
  { id: '3', name: 'Sesame', category: 'Seeds', is_major_allergen: false },
];

const mockUsers = [
  {
    id: '1',
    username: 'user1',
    email: 'user1@test.com',
    role: 'user',
    account_status: 'active',
    email_verified: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    username: 'user2',
    email: 'user2@test.com',
    role: 'user',
    account_status: 'active',
    email_verified: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    username: 'admin',
    email: 'admin@test.com',
    role: 'admin',
    account_status: 'active',
    email_verified: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

const mockGitHubIssues = [
  {
    number: 123,
    title: 'Add allergen sorting feature',
    state: 'open',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: { login: 'testuser', avatar_url: 'https://example.com/avatar.jpg' },
    html_url: 'https://github.com/test/repo/issues/123',
    labels: [{ name: 'enhancement', color: '84b6eb' }],
  },
  {
    number: 122,
    title: 'Fix authentication bug',
    state: 'closed',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    user: { login: 'contributor', avatar_url: 'https://example.com/avatar2.jpg' },
    html_url: 'https://github.com/test/repo/issues/122',
    labels: [{ name: 'bug', color: 'd73a4a' }],
    pull_request: { url: 'https://api.github.com/repos/test/repo/pulls/122' },
  },
];

describe('AdminDashboard', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;
  let queryClient: QueryClient;

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{component}</MemoryRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    mockNavigate = vi.fn();
    vi.spyOn(ReactRouter, 'useNavigate').mockReturnValue(mockNavigate);

    // Setup default mocks
    vi.mocked(api.adminApi.getAllergens).mockResolvedValue(mockAllergens);
    vi.mocked(api.adminApi.getAllUsers).mockResolvedValue(mockUsers);
    vi.mocked(api.githubApi.getRecentIssues).mockResolvedValue(mockGitHubIssues);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the admin dashboard page', () => {
    renderWithProviders(<AdminDashboard />);

    expect(screen.getByText('Welcome to Admin Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText('Manage your Eatsential platform from this central control panel.')
    ).toBeInTheDocument();
  });

  it('renders all stat cards', async () => {
    renderWithProviders(<AdminDashboard />);

    // Wait for async data to load
    await waitFor(() => {
      // Check for stat card titles
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Total Allergens')).toBeInTheDocument();
      expect(screen.getByText('Major Allergens')).toBeInTheDocument();
      expect(screen.getByText('Allergen Categories')).toBeInTheDocument();
    });
  });

  it('displays stat card values from API data', async () => {
    renderWithProviders(<AdminDashboard />);

    // Wait for the user card to show the loaded data
    await waitFor(() => {
      const userCard = screen.getByText('Total Users').closest('[data-slot="card"]');
      expect(userCard).toHaveTextContent('3');
      expect(userCard).toHaveTextContent('Active registered users');
    });

    // Verify major allergens card
    const majorAllergensCard = screen.getByText('Major Allergens').closest('[data-slot="card"]');
    expect(majorAllergensCard).toHaveTextContent('2');
    expect(majorAllergensCard).toHaveTextContent('FDA major allergens tracked');
  });

  it('displays stat card descriptions', async () => {
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Active registered users')).toBeInTheDocument();
      expect(screen.getByText('In allergen database')).toBeInTheDocument();
      expect(screen.getByText('FDA major allergens tracked')).toBeInTheDocument();
      expect(screen.getByText('Distinct allergen categories')).toBeInTheDocument();
    });
  });

  it('renders quick action links', () => {
    renderWithProviders(<AdminDashboard />);

    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Allergen Management')).toBeInTheDocument();
    expect(screen.getByText('System Settings')).toBeInTheDocument();
    expect(screen.getByText('Activity Logs')).toBeInTheDocument();
  });

  it('quick action links have correct descriptions', () => {
    renderWithProviders(<AdminDashboard />);

    expect(
      screen.getByText('View, edit, and manage user accounts and permissions')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Manage the central allergen database for health profiles')
    ).toBeInTheDocument();
    expect(screen.getByText('Configure system-wide settings and preferences')).toBeInTheDocument();
    expect(screen.getByText('Monitor system activities and user actions')).toBeInTheDocument();
  });

  it('quick action links navigate to correct routes', () => {
    renderWithProviders(<AdminDashboard />);

    const userManagementLink = screen.getByRole('link', { name: /user management/i });
    expect(userManagementLink).toHaveAttribute('href', '/system-manage/users');

    const allergenManagementLink = screen.getByRole('link', { name: /allergen management/i });
    expect(allergenManagementLink).toHaveAttribute('href', '/system-manage/allergens');

    const systemSettingsLink = screen.getByRole('link', { name: /system settings/i });
    expect(systemSettingsLink).toHaveAttribute('href', '/system-manage/settings');

    const activityLogsLink = screen.getByRole('link', { name: /activity logs/i });
    expect(activityLogsLink).toHaveAttribute('href', '/system-manage/logs');
  });

  it('renders recent GitHub activity section', async () => {
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent GitHub Activity')).toBeInTheDocument();
    });
  });

  it('displays GitHub issues and PRs', async () => {
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Add allergen sorting feature/i)).toBeInTheDocument();
      expect(screen.getByText(/Fix authentication bug/i)).toBeInTheDocument();
      expect(screen.getByText(/@testuser/i)).toBeInTheDocument();
      expect(screen.getByText(/@contributor/i)).toBeInTheDocument();
    });
  });

  it('displays issue/PR numbers and labels', async () => {
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/#123/)).toBeInTheDocument();
      expect(screen.getByText(/#122/)).toBeInTheDocument();
      expect(screen.getByText('enhancement')).toBeInTheDocument();
      expect(screen.getByText('bug')).toBeInTheDocument();
    });
  });

  it('displays loading state for GitHub activity', () => {
    vi.mocked(api.githubApi.getRecentIssues).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithProviders(<AdminDashboard />);

    expect(screen.getByText('Loading GitHub activity...')).toBeInTheDocument();
  });

  it('displays empty state when no GitHub activity', async () => {
    vi.mocked(api.githubApi.getRecentIssues).mockResolvedValue([]);

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No recent activity')).toBeInTheDocument();
    });
  });

  it('GitHub issue links are clickable and open in new tab', async () => {
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      const issueLink = screen.getByRole('link', { name: /#123 Add allergen sorting feature/i });
      expect(issueLink).toHaveAttribute('href', 'https://github.com/test/repo/issues/123');
      expect(issueLink).toHaveAttribute('target', '_blank');
      expect(issueLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('displays trend information on user stat card', async () => {
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('+12% from last month')).toBeInTheDocument();
    });
  });

  // Note: The following functionalities should be tested in E2E tests:
  // - Actual navigation when clicking quick action links
  // - Actual navigation when clicking GitHub issue/PR links
  // - Hover effects and transitions
  // - Card interactions and visual feedback
  // - Real-time data updates and refresh
  // - Integration with actual GitHub API
  // - Integration with actual backend APIs for stats and activities
  // - Badge rendering for different issue/PR states (open/closed/merged)
  // - Relative time formatting (just now, minutes ago, hours ago, days ago)
});
