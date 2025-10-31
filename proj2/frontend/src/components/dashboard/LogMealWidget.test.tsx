import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogMealWidget } from './LogMealWidget';

describe('LogMealWidget', () => {
  it('renders the widget correctly', () => {
    const mockOnLogMeal = vi.fn();
    render(<LogMealWidget onLogMeal={mockOnLogMeal} />);

    expect(screen.getByText('Log a Meal')).toBeInTheDocument();
    expect(
      screen.getByText(/Track your nutrition by logging what you've eaten today/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Meal/i })).toBeInTheDocument();
  });

  it('calls onLogMeal when button is clicked', () => {
    const mockOnLogMeal = vi.fn();
    render(<LogMealWidget onLogMeal={mockOnLogMeal} />);

    const button = screen.getByRole('button', { name: /Add Meal/i });
    fireEvent.click(button);

    expect(mockOnLogMeal).toHaveBeenCalledTimes(1);
  });

  it('displays helper text', () => {
    const mockOnLogMeal = vi.fn();
    render(<LogMealWidget onLogMeal={mockOnLogMeal} />);

    expect(screen.getByText(/Takes less than a minute to log your meal/i)).toBeInTheDocument();
  });
});
