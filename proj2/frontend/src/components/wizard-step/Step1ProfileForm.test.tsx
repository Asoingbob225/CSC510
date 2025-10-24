import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Step1ProfileForm } from './Step1ProfileForm';

describe('Step1ProfileForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with all required fields', () => {
    render(<Step1ProfileForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    expect(screen.getByText('Basic Health Information')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('170')).toBeInTheDocument(); // Height input
    expect(screen.getByPlaceholderText('70')).toBeInTheDocument(); // Weight input
    expect(screen.getByText(/activity level/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('has default values populated', () => {
    render(<Step1ProfileForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    const heightInput = screen.getByPlaceholderText('170') as HTMLInputElement;
    const weightInput = screen.getByPlaceholderText('70') as HTMLInputElement;

    expect(heightInput.value).toBe('170');
    expect(weightInput.value).toBe('70');
  });

  it('validates minimum height', async () => {
    render(<Step1ProfileForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    const heightInput = screen.getByPlaceholderText('170');
    const submitButton = screen.getByRole('button', { name: /next/i });

    fireEvent.change(heightInput, { target: { value: '30' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/height must be at least 50cm/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates maximum height', async () => {
    render(<Step1ProfileForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    const heightInput = screen.getByPlaceholderText('170');
    const submitButton = screen.getByRole('button', { name: /next/i });

    fireEvent.change(heightInput, { target: { value: '350' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/height must be less than 300cm/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates minimum weight', async () => {
    render(<Step1ProfileForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    const weightInput = screen.getByPlaceholderText('70');
    const submitButton = screen.getByRole('button', { name: /next/i });

    fireEvent.change(weightInput, { target: { value: '10' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/weight must be at least 20kg/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates maximum weight', async () => {
    render(<Step1ProfileForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    const weightInput = screen.getByPlaceholderText('70');
    const submitButton = screen.getByRole('button', { name: /next/i });

    fireEvent.change(weightInput, { target: { value: '550' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/weight must be less than 500kg/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    render(<Step1ProfileForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    const heightInput = screen.getByPlaceholderText('170');
    const weightInput = screen.getByPlaceholderText('70');
    const submitButton = screen.getByRole('button', { name: /next/i });

    fireEvent.change(heightInput, { target: { value: '175' } });
    fireEvent.change(weightInput, { target: { value: '75' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        {
          height_cm: 175,
          weight_kg: 75,
          activity_level: 'moderate',
        },
        expect.anything() // React form event
      );
    });
  });

  it('accepts decimal values for height and weight', async () => {
    render(<Step1ProfileForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    const heightInput = screen.getByPlaceholderText('170');
    const weightInput = screen.getByPlaceholderText('70');
    const submitButton = screen.getByRole('button', { name: /next/i });

    fireEvent.change(heightInput, { target: { value: '175.5' } });
    fireEvent.change(weightInput, { target: { value: '75.8' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        {
          height_cm: 175.5,
          weight_kg: 75.8,
          activity_level: 'moderate',
        },
        expect.anything() // React form event
      );
    });
  });

  it('disables submit button when submitting', () => {
    render(<Step1ProfileForm onSubmit={mockOnSubmit} isSubmitting={true} />);

    const submitButton = screen.getByRole('button', { name: /creating profile/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows loading state when submitting', () => {
    render(<Step1ProfileForm onSubmit={mockOnSubmit} isSubmitting={true} />);

    expect(screen.getByText(/creating profile/i)).toBeInTheDocument();
  });

  it('shows Next button text when not submitting', () => {
    render(<Step1ProfileForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    expect(screen.getByRole('button', { name: /^next$/i })).toBeInTheDocument();
  });
});
