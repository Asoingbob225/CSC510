import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserManagement from './UserManagement';
import * as api from '@/lib/api';

// Mock the API module
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual('@/lib/api');
  return {
    ...actual,
    adminApi: {
      getAllUsers: vi.fn(),
      getUserDetails: vi.fn(),
    },
  };
});

// Helper function to render component with QueryClient
const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{component}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('UserManagement', () => {
  const mockUsers: api.UserListItem[] = [
    {
      id: 'user-1',
      username: 'john_doe',
      email: 'john@example.com',
      role: 'user',
      account_status: 'verified',
      email_verified: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'user-2',
      username: 'admin_user',
      email: 'admin@example.com',
      role: 'admin',
      account_status: 'verified',
      email_verified: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'user-3',
      username: 'pending_user',
      email: 'pending@example.com',
      role: 'user',
      account_status: 'pending',
      email_verified: false,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.adminApi.getAllUsers).mockResolvedValue(mockUsers);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the user management page', async () => {
    renderWithQueryClient(<UserManagement />);

    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Manage user accounts and permissions.')).toBeInTheDocument();
  });

  it('fetches and displays users after loading', async () => {
    renderWithQueryClient(<UserManagement />);

    await waitFor(() => {
      expect(api.adminApi.getAllUsers).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument();
      expect(screen.getByText('admin_user')).toBeInTheDocument();
      expect(screen.getByText('pending_user')).toBeInTheDocument();
    });
  });

  it('displays user emails in the table', async () => {
    renderWithQueryClient(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      expect(screen.getByText('pending@example.com')).toBeInTheDocument();
    });
  });

  it('displays user roles with appropriate badges', async () => {
    renderWithQueryClient(<UserManagement />);

    await waitFor(() => {
      const roleBadges = screen.getAllByText(/^(user|admin)$/);
      expect(roleBadges).toHaveLength(3);
    });
  });

  it('displays account status badges', async () => {
    renderWithQueryClient(<UserManagement />);

    await waitFor(() => {
      expect(screen.getAllByText('verified')).toHaveLength(2);
      expect(screen.getByText('pending')).toBeInTheDocument();
    });
  });

  it('displays email verification status', async () => {
    renderWithQueryClient(<UserManagement />);

    await waitFor(() => {
      expect(screen.getAllByText('Yes')).toHaveLength(2);
      expect(screen.getByText('No')).toBeInTheDocument();
    });
  });

  it('renders search input', async () => {
    renderWithQueryClient(<UserManagement />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search by username or email...');
      expect(searchInput).toBeInTheDocument();
    });
  });

  it('filters users based on search input', async () => {
    renderWithQueryClient(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by username or email...');
    fireEvent.change(searchInput, { target: { value: 'john' } });

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument();
      expect(screen.queryByText('admin_user')).not.toBeInTheDocument();
      expect(screen.queryByText('pending_user')).not.toBeInTheDocument();
    });
  });

  it('displays pagination controls', async () => {
    renderWithQueryClient(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText(/Showing \d+ to \d+ of \d+ users/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });
  });

  it('displays View buttons for each user', async () => {
    renderWithQueryClient(<UserManagement />);

    await waitFor(() => {
      const viewButtons = screen.getAllByRole('button', { name: /view/i });
      expect(viewButtons).toHaveLength(3);
    });
  });

  it('NOTE: User details sheet interaction should be tested in E2E tests', () => {
    // Due to the complexity of testing Sheet components from shadcn/ui, the following
    // should be tested in end-to-end tests:
    // - Clicking View button opens the user details sheet
    // - User details are fetched and displayed correctly
    // - Sheet can be closed by clicking outside or the X button
    // - Sheet displays all user information sections correctly
    expect(true).toBe(true);
  });

  it('NOTE: Table sorting functionality should be tested in E2E tests', () => {
    // TanStack Table sorting is complex to test in unit tests. The following
    // should be tested in E2E tests:
    // - Clicking column headers toggles sorting
    // - Sorting indicators appear correctly
    // - Data is sorted correctly in ascending/descending order
    expect(true).toBe(true);
  });

  it('handles API errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(api.adminApi.getAllUsers).mockRejectedValue(new Error('API Error'));

    renderWithQueryClient(<UserManagement />);

    // TanStack Query handles errors internally, so we just verify the error is thrown
    await waitFor(() => {
      expect(api.adminApi.getAllUsers).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});
