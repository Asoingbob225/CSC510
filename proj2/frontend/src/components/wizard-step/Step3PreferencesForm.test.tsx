import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Step3PreferencesForm } from './Step3PreferencesForm';

describe('Step3PreferencesForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnPrevious = vi.fn();
  const mockOnSkip = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with title and description', () => {
    render(
      <Step3PreferencesForm
        onSubmit={mockOnSubmit}
        onPrevious={mockOnPrevious}
        onSkip={mockOnSkip}
        isSubmitting={false}
      />
    );

    expect(screen.getByText('Dietary Preferences (Optional)')).toBeInTheDocument();
    expect(screen.getByText(/add your dietary preferences to personalize/i)).toBeInTheDocument();
  });

  it('has Previous, Skip, and Submit buttons', () => {
    render(
      <Step3PreferencesForm
        onSubmit={mockOnSubmit}
        onPrevious={mockOnPrevious}
        onSkip={mockOnSkip}
        isSubmitting={false}
      />
    );

    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /skip to dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeInTheDocument();
  });

  it('calls onPrevious when Previous button is clicked', () => {
    render(
      <Step3PreferencesForm
        onSubmit={mockOnSubmit}
        onPrevious={mockOnPrevious}
        onSkip={mockOnSkip}
        isSubmitting={false}
      />
    );

    const previousButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(previousButton);

    expect(mockOnPrevious).toHaveBeenCalled();
  });

  it('calls onSkip when Skip button is clicked', () => {
    render(
      <Step3PreferencesForm
        onSubmit={mockOnSubmit}
        onPrevious={mockOnPrevious}
        onSkip={mockOnSkip}
        isSubmitting={false}
      />
    );

    const skipButton = screen.getByRole('button', { name: /skip to dashboard/i });
    fireEvent.click(skipButton);

    expect(mockOnSkip).toHaveBeenCalled();
  });

  it('calls onSkip when submitting with no preferences', async () => {
    render(
      <Step3PreferencesForm
        onSubmit={mockOnSubmit}
        onPrevious={mockOnPrevious}
        onSkip={mockOnSkip}
        isSubmitting={false}
      />
    );

    const submitButton = screen.getByRole('button', { name: /go to dashboard/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSkip).toHaveBeenCalled();
    });
  });

  it('has all preference type options', () => {
    render(
      <Step3PreferencesForm
        onSubmit={mockOnSubmit}
        onPrevious={mockOnPrevious}
        onSkip={mockOnSkip}
        isSubmitting={false}
      />
    );

    // Due to jsdom limitations with shadcn Select (pointer capture API),
    // we cannot fully test Select dropdown interactions in unit tests.
    // This functionality should be tested in E2E tests.
    // Here we verify the select exists
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('allows adding a preference to the list', async () => {
    render(
      <Step3PreferencesForm
        onSubmit={mockOnSubmit}
        onPrevious={mockOnPrevious}
        onSkip={mockOnSkip}
        isSubmitting={false}
      />
    );

    // Fill in preference name
    const nameInput = screen.getByPlaceholderText(/vegetarian, italian, organic/i);
    fireEvent.change(nameInput, { target: { value: 'Vegetarian' } });

    // Click Add button
    const addButton = screen.getByRole('button', { name: /add preference to list/i });
    fireEvent.click(addButton);

    // Check that preference appears in the list
    await waitFor(() => {
      expect(screen.getByText('Your Preferences (1)')).toBeInTheDocument();
      expect(screen.getByText('Vegetarian')).toBeInTheDocument();
    });
  });

  it('allows removing a preference from the list', async () => {
    render(
      <Step3PreferencesForm
        onSubmit={mockOnSubmit}
        onPrevious={mockOnPrevious}
        onSkip={mockOnSkip}
        isSubmitting={false}
      />
    );

    // Add a preference first
    const nameInput = screen.getByPlaceholderText(/vegetarian, italian, organic/i);
    fireEvent.change(nameInput, { target: { value: 'Vegetarian' } });

    const addButton = screen.getByRole('button', { name: /add preference to list/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Your Preferences (1)')).toBeInTheDocument();
    });

    // Remove the preference
    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('Your Preferences (1)')).not.toBeInTheDocument();
    });
  });

  it('allows adding notes to a preference', async () => {
    render(
      <Step3PreferencesForm
        onSubmit={mockOnSubmit}
        onPrevious={mockOnPrevious}
        onSkip={mockOnSkip}
        isSubmitting={false}
      />
    );

    // Fill in preference details
    const nameInput = screen.getByPlaceholderText(/vegetarian, italian, organic/i);
    fireEvent.change(nameInput, { target: { value: 'Vegetarian' } });

    const notesInput = screen.getByPlaceholderText(/additional details/i);
    fireEvent.change(notesInput, { target: { value: 'No meat or fish' } });

    // Add preference
    const addButton = screen.getByRole('button', { name: /add preference to list/i });
    fireEvent.click(addButton);

    // Check notes appear
    await waitFor(() => {
      expect(screen.getByText(/no meat or fish/i)).toBeInTheDocument();
    });
  });

  it('allows setting strict preference', async () => {
    render(
      <Step3PreferencesForm
        onSubmit={mockOnSubmit}
        onPrevious={mockOnPrevious}
        onSkip={mockOnSkip}
        isSubmitting={false}
      />
    );

    // Fill in preference name
    const nameInput = screen.getByPlaceholderText(/vegetarian, italian, organic/i);
    fireEvent.change(nameInput, { target: { value: 'Vegan' } });

    // Strict checkbox should be checked by default
    const strictCheckbox = screen.getByRole('checkbox');
    expect(strictCheckbox).toBeChecked();

    // Add preference
    const addButton = screen.getByRole('button', { name: /add preference to list/i });
    fireEvent.click(addButton);

    // Check strict indicator appears
    await waitFor(() => {
      expect(screen.getByText(/✓ strict/i)).toBeInTheDocument();
    });
  });

  it('allows unsetting strict preference', async () => {
    render(
      <Step3PreferencesForm
        onSubmit={mockOnSubmit}
        onPrevious={mockOnPrevious}
        onSkip={mockOnSkip}
        isSubmitting={false}
      />
    );

    // Fill in preference name
    const nameInput = screen.getByPlaceholderText(/vegetarian, italian, organic/i);
    fireEvent.change(nameInput, { target: { value: 'Italian' } });

    // Uncheck strict preference
    const strictCheckbox = screen.getByRole('checkbox');
    fireEvent.click(strictCheckbox);

    // Add preference
    const addButton = screen.getByRole('button', { name: /add preference to list/i });
    fireEvent.click(addButton);

    // Check strict indicator does not appear
    await waitFor(() => {
      expect(screen.queryByText(/✓ strict/i)).not.toBeInTheDocument();
    });
  });

  it('submits form with preferences data', async () => {
    render(
      <Step3PreferencesForm
        onSubmit={mockOnSubmit}
        onPrevious={mockOnPrevious}
        onSkip={mockOnSkip}
        isSubmitting={false}
      />
    );

    // Add a preference
    const nameInput = screen.getByPlaceholderText(/vegetarian, italian, organic/i);
    fireEvent.change(nameInput, { target: { value: 'Vegetarian' } });

    const addButton = screen.getByRole('button', { name: /add preference to list/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Your Preferences (1)')).toBeInTheDocument();
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /complete setup/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        preferences: [
          {
            preference_type: 'diet',
            preference_name: 'Vegetarian',
            is_strict: true,
            notes: undefined,
          },
        ],
      });
    });
  });

  it('disables Add button when preference name is empty', () => {
    render(
      <Step3PreferencesForm
        onSubmit={mockOnSubmit}
        onPrevious={mockOnPrevious}
        onSkip={mockOnSkip}
        isSubmitting={false}
      />
    );

    const addButton = screen.getByRole('button', { name: /add preference to list/i });
    expect(addButton).toBeDisabled();
  });

  it('disables submit button when submitting', () => {
    render(
      <Step3PreferencesForm
        onSubmit={mockOnSubmit}
        onPrevious={mockOnPrevious}
        onSkip={mockOnSkip}
        isSubmitting={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /completing/i });
    expect(submitButton).toBeDisabled();
  });

  it('changes button text to "Complete Setup" when preferences are added', async () => {
    render(
      <Step3PreferencesForm
        onSubmit={mockOnSubmit}
        onPrevious={mockOnPrevious}
        onSkip={mockOnSkip}
        isSubmitting={false}
      />
    );

    // Initially shows "Go to Dashboard"
    expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeInTheDocument();

    // Add a preference
    const nameInput = screen.getByPlaceholderText(/vegetarian, italian, organic/i);
    fireEvent.change(nameInput, { target: { value: 'Vegetarian' } });

    const addButton = screen.getByRole('button', { name: /add preference to list/i });
    fireEvent.click(addButton);

    // Now shows "Complete Setup"
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /complete setup/i })).toBeInTheDocument();
    });
  });

  it('clears input fields after adding a preference', async () => {
    render(
      <Step3PreferencesForm
        onSubmit={mockOnSubmit}
        onPrevious={mockOnPrevious}
        onSkip={mockOnSkip}
        isSubmitting={false}
      />
    );

    // Fill in preference details
    const nameInput = screen.getByPlaceholderText(
      /vegetarian, italian, organic/i
    ) as HTMLInputElement;
    const notesInput = screen.getByPlaceholderText(/additional details/i) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Vegetarian' } });
    fireEvent.change(notesInput, { target: { value: 'No meat' } });

    const addButton = screen.getByRole('button', { name: /add preference to list/i });
    fireEvent.click(addButton);

    // Check inputs are cleared
    await waitFor(() => {
      expect(nameInput.value).toBe('');
      expect(notesInput.value).toBe('');
    });
  });
});
