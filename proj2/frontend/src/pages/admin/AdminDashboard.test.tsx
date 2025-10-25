import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import * as ReactRouter from 'react-router';
import AdminDashboard from './AdminDashboard';

describe('AdminDashboard', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNavigate = vi.fn();
    vi.spyOn(ReactRouter, 'useNavigate').mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the admin dashboard page', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Welcome to Admin Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText('Manage your Eatsential platform from this central control panel.')
    ).toBeInTheDocument();
  });

  it('renders all stat cards', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // Check for stat card titles
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Health Profiles')).toBeInTheDocument();
    expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    expect(screen.getByText('System Status')).toBeInTheDocument();
  });

  it('displays stat card values', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('987')).toBeInTheDocument();
    expect(screen.getByText('156')).toBeInTheDocument();
    expect(screen.getByText('Healthy')).toBeInTheDocument();
  });

  it('displays stat card descriptions', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Active registered users')).toBeInTheDocument();
    expect(screen.getByText('Completed health profiles')).toBeInTheDocument();
    expect(screen.getByText('Currently logged in')).toBeInTheDocument();
    expect(screen.getByText('All services operational')).toBeInTheDocument();
  });

  it('renders quick action links', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('System Settings')).toBeInTheDocument();
    expect(screen.getByText('Activity Logs')).toBeInTheDocument();
  });

  it('quick action links have correct descriptions', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(
      screen.getByText('View, edit, and manage user accounts and permissions')
    ).toBeInTheDocument();
    expect(screen.getByText('Configure system-wide settings and preferences')).toBeInTheDocument();
    expect(screen.getByText('Monitor system activities and user actions')).toBeInTheDocument();
  });

  it('quick action links navigate to correct routes', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    const userManagementLink = screen.getByRole('link', { name: /user management/i });
    expect(userManagementLink).toHaveAttribute('href', '/system-manage/users');

    const systemSettingsLink = screen.getByRole('link', { name: /system settings/i });
    expect(systemSettingsLink).toHaveAttribute('href', '/system-manage/settings');

    const activityLogsLink = screen.getByRole('link', { name: /activity logs/i });
    expect(activityLogsLink).toHaveAttribute('href', '/system-manage/logs');
  });

  it('renders recent activity section', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('New user registration')).toBeInTheDocument();
    expect(screen.getByText('Health profile created')).toBeInTheDocument();
    expect(screen.getByText('System update')).toBeInTheDocument();
  });

  it('displays recent activity details', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('user@example.com registered')).toBeInTheDocument();
    expect(screen.getByText('User completed health wizard')).toBeInTheDocument();
    expect(screen.getByText('Backend services updated to v1.2.0')).toBeInTheDocument();
  });

  it('displays recent activity timestamps', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('2 minutes ago')).toBeInTheDocument();
    expect(screen.getByText('15 minutes ago')).toBeInTheDocument();
    expect(screen.getByText('1 hour ago')).toBeInTheDocument();
  });

  it('displays trend information on stat cards', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('+12% from last month')).toBeInTheDocument();
    expect(screen.getByText('+8% from last month')).toBeInTheDocument();
  });

  // Note: The following functionalities should be tested in E2E tests:
  // - Actual navigation when clicking quick action links
  // - Hover effects and transitions
  // - Card interactions and visual feedback
  // - Real-time data updates
  // - Integration with actual backend APIs for stats and activities
});
