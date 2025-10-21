import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import * as ReactRouter from 'react-router';
import VerifyEmail from './VerifyEmail';

// Mock fetch globally
global.fetch = vi.fn();

describe('VerifyEmail', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate = vi.fn();
    vi.spyOn(ReactRouter, 'useNavigate').mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows error when no token is provided', async () => {
    render(
      <MemoryRouter initialEntries={['/verify-email']}>
        <VerifyEmail />
      </MemoryRouter>
    );

    // Should show pending state initially
    expect(screen.getByText('Verify Your Email')).toBeInTheDocument();

    // Click verify button
    const verifyButton = screen.getByRole('button', { name: /verify email/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      expect(screen.getByText('Invalid verification link. No token provided.')).toBeInTheDocument();
    });
  });

  it('shows loading state initially with token', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading state
    );

    render(
      <MemoryRouter initialEntries={['/verify-email?token=test-token']}>
        <VerifyEmail />
      </MemoryRouter>
    );

    // Should show pending state initially
    expect(screen.getByText('Verify Your Email')).toBeInTheDocument();

    // Click verify button
    const verifyButton = screen.getByRole('button', { name: /verify email/i });
    fireEvent.click(verifyButton);

    // Should show verifying state
    await waitFor(() => {
      expect(screen.getByText('Verifying Your Email')).toBeInTheDocument();
      expect(screen.getByText('Verifying your email...')).toBeInTheDocument();
    });
  });

  it('shows success message when verification succeeds', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Email verified successfully!' }),
    });

    render(
      <MemoryRouter initialEntries={['/verify-email?token=valid-token']}>
        <VerifyEmail />
      </MemoryRouter>
    );

    // Click verify button
    const verifyButton = screen.getByRole('button', { name: /verify email/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('Email Verified!')).toBeInTheDocument();
      expect(screen.getByText('Email verified successfully!')).toBeInTheDocument();
      expect(screen.getByText('Continue to Login')).toBeInTheDocument();
    });
  });

  it('shows error message when verification fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Invalid or expired token' }),
    });

    render(
      <MemoryRouter initialEntries={['/verify-email?token=invalid-token']}>
        <VerifyEmail />
      </MemoryRouter>
    );

    // Click verify button
    const verifyButton = screen.getByRole('button', { name: /verify email/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      expect(screen.getByText('Invalid or expired token')).toBeInTheDocument();
      expect(screen.getByText('Back to Signup')).toBeInTheDocument();
    });
  });

  it('shows error message when network request fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter initialEntries={['/verify-email?token=test-token']}>
        <VerifyEmail />
      </MemoryRouter>
    );

    // Click verify button
    const verifyButton = screen.getByRole('button', { name: /verify email/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      expect(
        screen.getByText('An error occurred while verifying your email. Please try again later.')
      ).toBeInTheDocument();
    });
  });

  it('calls correct API endpoint with token', async () => {
    const testToken = 'test-verification-token';

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success' }),
    });

    render(
      <MemoryRouter initialEntries={[`/verify-email?token=${testToken}`]}>
        <VerifyEmail />
      </MemoryRouter>
    );

    // Click verify button
    const verifyButton = screen.getByRole('button', { name: /verify email/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/auth/verify-email/${testToken}`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });
  });

  it('navigates to home on success button click', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Email verified successfully!' }),
    });

    render(
      <MemoryRouter initialEntries={['/verify-email?token=valid-token']}>
        <VerifyEmail />
      </MemoryRouter>
    );

    // Click verify button
    const verifyButton = screen.getByRole('button', { name: /verify email/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      const continueButton = screen.getByText('Continue to Login');
      continueButton.click();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates to signup on error button click', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Invalid token' }),
    });

    render(
      <MemoryRouter initialEntries={['/verify-email?token=invalid-token']}>
        <VerifyEmail />
      </MemoryRouter>
    );

    // Click verify button
    const verifyButton = screen.getByRole('button', { name: /verify email/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      const backButton = screen.getByText('Back to Signup');
      backButton.click();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });
});
