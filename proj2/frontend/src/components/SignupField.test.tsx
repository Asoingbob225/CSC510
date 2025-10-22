import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
    mockNavigate = vi.fn();
    vi.spyOn(ReactRouter, 'useNavigate').mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prevents submission with short username', async () => {
    render(
      <MemoryRouter>
        <SignupField />
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/your username/i);
    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/strong password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(usernameInput, { target: { value: 'ab' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it('prevents submission with invalid email', async () => {
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

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    // Form should not call API with invalid email
    await waitFor(
      () => {
        expect(global.fetch).not.toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it('prevents submission with short password', async () => {
    render(
      <MemoryRouter>
        <SignupField />
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/your username/i);
    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/strong password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form successfully with valid data', async () => {
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

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

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

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });

  it('disables button while submitting', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <MemoryRouter>
        <SignupField />
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/your username/i);
    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/strong password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});
