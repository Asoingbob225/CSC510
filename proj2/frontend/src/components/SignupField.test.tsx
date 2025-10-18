import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SignupField from './SignupField';

describe('SignupField Component', () => {
  it('prevents submission with short username', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    render(<SignupField />);

    const usernameInput = screen.getByPlaceholderText(/your username/i);
    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/strong password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(usernameInput, { target: { value: 'ab' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
    });
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('prevents submission with invalid email', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    render(<SignupField />);

    const usernameInput = screen.getByPlaceholderText(/your username/i);
    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/strong password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Form should not submit with invalid email
    await waitFor(
      () => {
        expect(consoleSpy).not.toHaveBeenCalled();
      },
      { timeout: 1000 }
    );

    consoleSpy.mockRestore();
  });

  it('prevents submission with short password', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    render(<SignupField />);

    const usernameInput = screen.getByPlaceholderText(/your username/i);
    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/strong password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('submits form successfully with valid data', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    render(<SignupField />);

    const usernameInput = screen.getByPlaceholderText(/your username/i);
    const emailInput = screen.getByPlaceholderText(/e\.g\. user@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/strong password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    });

    consoleSpy.mockRestore();
  });
});
