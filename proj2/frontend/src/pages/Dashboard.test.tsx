import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import * as ReactRouter from 'react-router';
import Dashboard from './Dashboard';
import * as api from '@/lib/api';

describe('Dashboard', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNavigate = vi.fn();
    vi.spyOn(ReactRouter, 'useNavigate').mockReturnValue(mockNavigate);
    // Mock getAuthToken to return a valid token
    vi.spyOn(api, 'getAuthToken').mockReturnValue('fake-token');
    // Mock apiClient.get to simulate successful verification
    vi.spyOn(api.default, 'get').mockResolvedValue({ data: { id: 1, username: 'testuser' } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the dashboard page', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Wait for verification to complete
    await waitFor(() => {
      expect(screen.getByText('Eatsential Dashboard')).toBeInTheDocument();
    });
    expect(screen.getByText('Welcome to Your Dashboard')).toBeInTheDocument();
  });

  it('renders placeholder cards', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Wait for verification to complete
    await waitFor(() => {
      expect(screen.getByText('My Recipes')).toBeInTheDocument();
    });
    expect(screen.getByText('Meal Plans')).toBeInTheDocument();
    expect(screen.getByText('Shopping List')).toBeInTheDocument();
  });

  it('has a logout button', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Wait for verification to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });
  });

  it('navigates to home when logout is clicked', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Wait for verification to complete and get the logout button
    const logoutButton = await waitFor(() => screen.getByRole('button', { name: /logout/i }));
    fireEvent.click(logoutButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
