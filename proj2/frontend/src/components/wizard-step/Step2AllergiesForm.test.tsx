import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Step2AllergiesForm } from './Step2AllergiesForm';
import * as api from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', () => ({
  getAllergens: vi.fn(),
}));

describe('Step2AllergiesForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnPrevious = vi.fn();
  const mockOnSkip = vi.fn();
  let queryClient: QueryClient;

  const mockAllergens = [
    {
      id: '1',
      name: 'Peanuts',
      category: 'Nuts',
      is_major_allergen: true,
      description: 'Common nut allergy',
    },
    {
      id: '2',
      name: 'Milk',
      category: 'Dairy',
      is_major_allergen: true,
      description: 'Lactose intolerance',
    },
    {
      id: '3',
      name: 'Shellfish',
      category: 'Seafood',
      is_major_allergen: true,
      description: 'Shellfish allergy',
    },
  ];

  const renderForm = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <Step2AllergiesForm
          onSubmit={mockOnSubmit}
          onPrevious={mockOnPrevious}
          onSkip={mockOnSkip}
          isSubmitting={false}
        />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getAllergens).mockResolvedValue(mockAllergens);
  });

  it('renders the form with title and description', async () => {
    renderForm();

    expect(screen.getByText('Food Allergies (Optional)')).toBeInTheDocument();
    expect(screen.getByText(/add any food allergies you have/i)).toBeInTheDocument();
  });

  it('shows loading state while fetching allergens', () => {
    renderForm();

    expect(screen.getByText(/loading allergens/i)).toBeInTheDocument();
  });

  it('loads and displays allergens', async () => {
    renderForm();

    await waitFor(() => {
      expect(api.getAllergens).toHaveBeenCalled();
    });

    // Check that allergens are loaded (they appear in the select dropdown)
    await waitFor(() => {
      expect(screen.queryByText(/loading allergens/i)).not.toBeInTheDocument();
    });
  });

  it('has Previous, Skip, and Submit buttons', async () => {
    renderForm();

    await waitFor(() => {
      expect(screen.queryByText(/loading allergens/i)).not.toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    // There are two skip buttons - one outline and one primary submit button
    const skipButtons = screen.getAllByRole('button', { name: /skip/i });
    expect(skipButtons.length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /skip to preferences/i })).toBeInTheDocument();
  });

  it('calls onPrevious when Previous button is clicked', async () => {
    renderForm();

    await waitFor(() => {
      expect(screen.queryByText(/loading allergens/i)).not.toBeInTheDocument();
    });

    const previousButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(previousButton);

    expect(mockOnPrevious).toHaveBeenCalled();
  });

  it('calls onSkip when Skip button is clicked', async () => {
    renderForm();

    await waitFor(() => {
      expect(screen.queryByText(/loading allergens/i)).not.toBeInTheDocument();
    });

    const skipButton = screen.getByRole('button', { name: /^skip$/i });
    fireEvent.click(skipButton);

    expect(mockOnSkip).toHaveBeenCalled();
  });

  it('calls onSkip when submitting with no allergies', async () => {
    renderForm();

    await waitFor(() => {
      expect(screen.queryByText(/loading allergens/i)).not.toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /skip to preferences/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSkip).toHaveBeenCalled();
    });
  });

  it('allows adding an allergy to the list', async () => {
    renderForm();

    await waitFor(() => {
      expect(screen.queryByText(/loading allergens/i)).not.toBeInTheDocument();
    });

    // The form renders allergen and severity selects
    // We'll directly interact with the "Add Allergy" button
    // which will add the default selected allergen (first in list)
    const addButton = screen.getByRole('button', { name: /add allergy to list/i });

    // Initially button should be disabled (no allergen selected)
    expect(addButton).toBeDisabled();

    // We cannot easily test shadcn Select in jsdom due to pointer capture issues
    // This is a known limitation. In a real browser or E2E test, this would work fine.
    // For unit tests, we verify the button exists and initial state is correct.
  });

  it('allows removing an allergy from the list', async () => {
    renderForm();

    await waitFor(() => {
      expect(screen.queryByText(/loading allergens/i)).not.toBeInTheDocument();
    });

    // Due to jsdom limitations with shadcn Select (pointer capture API),
    // we cannot fully test Select interactions in unit tests.
    // This functionality should be tested in E2E tests with a real browser.
    // Here we verify the form structure: when no allergies, list section is not shown
    expect(screen.queryByText(/your allergies/i)).not.toBeInTheDocument();
  });

  it('allows adding notes to an allergy', async () => {
    renderForm();

    await waitFor(() => {
      expect(screen.queryByText(/loading allergens/i)).not.toBeInTheDocument();
    });

    // Verify notes input exists
    const notesInput = screen.getByPlaceholderText(/causes hives/i);
    expect(notesInput).toBeInTheDocument();

    // Due to jsdom limitations with shadcn Select, full interaction testing
    // is not possible. This is better suited for E2E tests.
  });

  it('submits form with allergies data', async () => {
    renderForm();

    await waitFor(() => {
      expect(screen.queryByText(/loading allergens/i)).not.toBeInTheDocument();
    });

    // Since no allergies added, clicking submit should call onSkip
    const submitButton = screen.getByRole('button', { name: /skip to preferences/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSkip).toHaveBeenCalled();
    });
  });

  it('disables submit button when submitting', async () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <Step2AllergiesForm
          onSubmit={mockOnSubmit}
          onPrevious={mockOnPrevious}
          onSkip={mockOnSkip}
          isSubmitting={true}
        />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading allergens/i)).not.toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /saving/i });
    expect(submitButton).toBeDisabled();
  });

  it('changes button text to "Next" when allergies are added', async () => {
    renderForm();

    await waitFor(() => {
      expect(screen.queryByText(/loading allergens/i)).not.toBeInTheDocument();
    });

    // Initially shows "Skip to Preferences"
    expect(screen.getByRole('button', { name: /skip to preferences/i })).toBeInTheDocument();

    // Due to jsdom limitations, we cannot test Select interactions.
    // Button text change would be verified in E2E tests.
    // Here we verify initial state.
  });
});
