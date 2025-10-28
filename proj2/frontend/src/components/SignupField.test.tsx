import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import * as ReactRouter from 'react-router';
import SignupField from './SignupField';

// Mock fetch globally
global.fetch = vi.fn();

describe('SignupField Component', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
    mockNavigate = vi.fn();
    vi.spyOn(ReactRouter, 'useNavigate').mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prevents submission with short username', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SignupField />
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/your username/i);
    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/strong password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await user.type(usernameInput, 'ab');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it('prevents submission with invalid email', async () => {
    const user = userEvent.setup();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success' }),
    });

    render(
      <MemoryRouter>
        <SignupField />
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/your username/i);
    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/strong password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'Password123!');
    await user.click(submitButton);

    // Form should not call API with invalid email
    await waitFor(
      () => {
        expect(global.fetch).not.toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it('prevents submission with short password', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SignupField />
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/your username/i);
    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/strong password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '12345');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form successfully with valid data', async () => {
    const user = userEvent.setup();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        message: 'Registration successful!',
      }),
    });

    render(
      <MemoryRouter>
        <SignupField />
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/your username/i);
    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/strong password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });

    // Should call the API with correct data
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/register',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123!',
        }),
      })
    );
  });

  it('shows error message on failed registration', async () => {
    const user = userEvent.setup();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        detail: 'Email already exists',
      }),
    });

    render(
      <MemoryRouter>
        <SignupField />
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/your username/i);
    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/strong password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });

  it('disables button while submitting', async () => {
    const user = userEvent.setup();
    let resolvePromise: () => void;
    const pendingPromise = new Promise<Response>((resolve) => {
      resolvePromise = () => {
        resolve({
          ok: true,
          json: async () => ({ message: 'Success' }),
        } as Response);
      };
    });

    (global.fetch as ReturnType<typeof vi.fn>).mockReturnValue(pendingPromise);

    render(
      <MemoryRouter>
        <SignupField />
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/your username/i);
    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/strong password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.click(submitButton);

    // Button should be disabled during submission
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    // Resolve the promise to clean up
    resolvePromise!();
  });
});
