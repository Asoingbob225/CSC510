import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import * as ReactRouter from 'react-router';
import LoginField from './LoginField';

// Mock fetch globally
global.fetch = vi.fn();

describe('LoginField Component', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate = vi.fn();
    vi.spyOn(ReactRouter, 'useNavigate').mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders login form with all required fields', () => {
    render(
      <MemoryRouter>
        <LoginField />
      </MemoryRouter>
    );

    expect(screen.getByText(/log in to eatsential/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. user@example\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\? sign up/i)).toBeInTheDocument();
  });

  it('prevents submission with invalid email', async () => {
    render(
      <MemoryRouter>
        <LoginField />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/your password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Trigger blur to activate validation
    fireEvent.blur(emailInput);
    fireEvent.click(submitButton);

    // Form should not call API with invalid email
    await waitFor(
      () => {
        expect(global.fetch).not.toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it('prevents submission with empty password', async () => {
    render(
      <MemoryRouter>
        <LoginField />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('submits form successfully with valid credentials', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Login successful!',
        token: 'mock-jwt-token',
      }),
    });

    render(
      <MemoryRouter>
        <LoginField />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/your password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/login successful/i)).toBeInTheDocument();
    });

    // Should call the API with correct data
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Password123!',
        }),
      })
    );
  });

  it('shows error message on failed login with string detail', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        detail: 'Invalid credentials',
      }),
    });

    render(
      <MemoryRouter>
        <LoginField />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/your password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('shows error message on failed login with array detail', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        detail: [{ msg: 'Email not found' }, { message: 'Account locked' }],
      }),
    });

    render(
      <MemoryRouter>
        <LoginField />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/your password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email not found, account locked/i)).toBeInTheDocument();
    });
  });

  it('shows generic error message on network failure', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <LoginField />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/your password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/an error occurred\. please try again later\./i)).toBeInTheDocument();
    });
  });

  it('disables button while submitting', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <MemoryRouter>
        <LoginField />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/your password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /log in/i });
      expect(button).toBeDisabled();
    });
  });

  it('clears previous errors on new submission', async () => {
    // First submission - fail
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        detail: 'Invalid credentials',
      }),
    });

    render(
      <MemoryRouter>
        <LoginField />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/your password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    // Second submission - success
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Login successful!',
      }),
    });

    fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/login successful/i)).toBeInTheDocument();
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
    });
  });

  it('navigates to dashboard after successful login', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Login successful!',
      }),
    });

    render(
      <MemoryRouter>
        <LoginField />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/your password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/login successful/i)).toBeInTheDocument();
    });

    // Wait for navigation to be called (setTimeout is 1000ms)
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith('/health-profile-wizard');
      },
      { timeout: 1500 }
    );
  });

  it('has link to signup page', () => {
    render(
      <MemoryRouter>
        <LoginField />
      </MemoryRouter>
    );

    const signupLink = screen.getByText(/don't have an account\? sign up/i).closest('a');
    expect(signupLink).toHaveAttribute('href', '/signup');
  });
});
