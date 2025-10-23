import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AllergySeverityWarning from './AllergySeverityWarning';

describe('AllergySeverityWarning Component', () => {
  it('renders mild severity with correct styling', () => {
    render(<AllergySeverityWarning severity="mild" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('bg-yellow-400', 'text-gray-900');
    expect(screen.getByText('MILD')).toBeInTheDocument();
  });

  it('renders moderate severity with correct styling', () => {
    render(<AllergySeverityWarning severity="moderate" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-orange-500', 'text-white');
    expect(screen.getByText('MODERATE')).toBeInTheDocument();
  });

  it('renders severe severity with correct styling', () => {
    render(<AllergySeverityWarning severity="severe" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-red-500', 'text-white');
    expect(screen.getByText('SEVERE')).toBeInTheDocument();
  });

  it('renders life threatening severity with correct styling and animation', () => {
    render(<AllergySeverityWarning severity="life_threatening" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-red-600', 'text-white', 'animate-pulse');
    expect(screen.getByText('LIFE THREATENING')).toBeInTheDocument();
  });

  it('displays allergen name when provided', () => {
    render(<AllergySeverityWarning severity="severe" allergenName="Peanuts" />);
    
    expect(screen.getByText(/Peanuts:/)).toBeInTheDocument();
    expect(screen.getByText(/SEVERE/)).toBeInTheDocument();
  });

  it('sets correct aria-live attribute for severe allergies', () => {
    const { rerender } = render(<AllergySeverityWarning severity="life_threatening" />);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
    
    rerender(<AllergySeverityWarning severity="severe" />);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });

  it('sets correct aria-live attribute for non-severe allergies', () => {
    const { rerender } = render(<AllergySeverityWarning severity="mild" />);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    
    rerender(<AllergySeverityWarning severity="moderate" />);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
  });

  it('applies custom className when provided', () => {
    render(<AllergySeverityWarning severity="mild" className="custom-class" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('custom-class');
  });
});
