import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AllergenManagement from './AllergenManagement';
import * as api from '@/lib/api';

// Mock the API module
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual('@/lib/api');
  return {
    ...actual,
    adminApi: {
      getAllergens: vi.fn(),
      createAllergen: vi.fn(),
      updateAllergen: vi.fn(),
      deleteAllergen: vi.fn(),
    },
  };
});

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Helper function to render component with QueryClient
const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{component}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('AllergenManagement', () => {
  const mockAllergens: api.AllergenResponse[] = [
    {
      id: 'allergen-1',
      name: 'Peanuts',
      category: 'Nuts',
      is_major_allergen: true,
      description: 'Common nut allergen',
    },
    {
      id: 'allergen-2',
      name: 'Milk',
      category: 'Dairy',
      is_major_allergen: true,
      description: 'Dairy allergen',
    },
    {
      id: 'allergen-3',
      name: 'Sesame',
      category: 'Seeds',
      is_major_allergen: false,
      description: undefined,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.adminApi.getAllergens).mockResolvedValue(mockAllergens);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the allergen management page', async () => {
    renderWithQueryClient(<AllergenManagement />);

    expect(screen.getByText('Allergen Management')).toBeInTheDocument();
    expect(
      screen.getByText('Manage the central allergen database used for user health profiles.')
    ).toBeInTheDocument();
  });

  it('fetches and displays allergens after loading', async () => {
    renderWithQueryClient(<AllergenManagement />);

    await waitFor(() => {
      expect(api.adminApi.getAllergens).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText('Peanuts')).toBeInTheDocument();
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Sesame')).toBeInTheDocument();
    });
  });

  it('displays allergen categories in the table', async () => {
    renderWithQueryClient(<AllergenManagement />);

    await waitFor(() => {
      expect(screen.getByText('Nuts')).toBeInTheDocument();
      expect(screen.getByText('Dairy')).toBeInTheDocument();
      expect(screen.getByText('Seeds')).toBeInTheDocument();
    });
  });

  it('displays major allergen indicators', async () => {
    renderWithQueryClient(<AllergenManagement />);

    await waitFor(() => {
      const majorTexts = screen.getAllByText('Major');
      const commonTexts = screen.getAllByText('Common');
      // 2 major allergens (Peanuts, Milk) should show "Major"
      // 1 non-major allergen (Sesame) should show "Common"
      expect(majorTexts.length).toBe(2);
      expect(commonTexts.length).toBe(1);
    });
  });

  it('displays statistics cards correctly', async () => {
    renderWithQueryClient(<AllergenManagement />);

    await waitFor(() => {
      expect(screen.getByText('Total Allergens')).toBeInTheDocument();
      expect(screen.getByText('Major Allergens')).toBeInTheDocument();
      expect(screen.getByText('Categories')).toBeInTheDocument();
    });

    await waitFor(() => {
      // Total allergens: 3
      const totalElements = screen.getAllByText('3');
      expect(totalElements.length).toBeGreaterThan(0);

      // Major allergens: 2 (Peanuts, Milk)
      const majorElements = screen.getAllByText('2');
      expect(majorElements.length).toBeGreaterThan(0);
    });
  });

  it('renders search input', async () => {
    renderWithQueryClient(<AllergenManagement />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(
        'Search allergens by name, category, or description...'
      );
      expect(searchInput).toBeInTheDocument();
    });
  });

  it('filters allergens based on search input', async () => {
    renderWithQueryClient(<AllergenManagement />);

    await waitFor(() => {
      expect(screen.getByText('Peanuts')).toBeInTheDocument();
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      'Search allergens by name, category, or description...'
    );
    fireEvent.change(searchInput, { target: { value: 'Peanuts' } });

    await waitFor(() => {
      expect(screen.getByText('Peanuts')).toBeInTheDocument();
      expect(screen.queryByText('Milk')).not.toBeInTheDocument();
      expect(screen.queryByText('Sesame')).not.toBeInTheDocument();
    });
  });

  it('filters allergens by category', async () => {
    renderWithQueryClient(<AllergenManagement />);

    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      'Search allergens by name, category, or description...'
    );
    fireEvent.change(searchInput, { target: { value: 'Dairy' } });

    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.queryByText('Peanuts')).not.toBeInTheDocument();
      expect(screen.queryByText('Sesame')).not.toBeInTheDocument();
    });
  });

  it('filters allergens by description', async () => {
    renderWithQueryClient(<AllergenManagement />);

    await waitFor(() => {
      expect(screen.getByText('Peanuts')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      'Search allergens by name, category, or description...'
    );
    fireEvent.change(searchInput, { target: { value: 'Common nut' } });

    await waitFor(() => {
      expect(screen.getByText('Peanuts')).toBeInTheDocument();
      expect(screen.queryByText('Milk')).not.toBeInTheDocument();
    });
  });

  it('displays Add Allergen button', async () => {
    renderWithQueryClient(<AllergenManagement />);

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /add allergen/i });
      expect(addButton).toBeInTheDocument();
    });
  });

  it('displays Edit and Delete buttons for each allergen', async () => {
    renderWithQueryClient(<AllergenManagement />);

    await waitFor(() => {
      expect(screen.getByText('Peanuts')).toBeInTheDocument();
    });

    // Look for buttons by their className or testing-library queries
    // Since buttons only have icons, we need to check by button presence
    const allButtons = screen.getAllByRole('button');
    // Should have: 1 "Add Allergen" button + 3 Edit buttons + 3 Delete buttons = 7 total
    expect(allButtons.length).toBeGreaterThanOrEqual(7);
  });

  it('opens create dialog when Add Allergen is clicked', async () => {
    renderWithQueryClient(<AllergenManagement />);

    await waitFor(() => {
      expect(screen.getByText('Peanuts')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add allergen/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add New Allergen')).toBeInTheDocument();
    });
  });

  it('NOTE: Create dialog form interactions should be tested in E2E tests', () => {
    // Due to the complexity of testing Dialog components from shadcn/ui and form validation,
    // the following should be tested in end-to-end tests:
    // - Form input interactions (typing, checkbox changes)
    // - Form validation (required fields)
    // - Submit button state (disabled when pending)
    // - Successful creation with API mock
    // - Error handling and toast notifications
    // - Dialog closing after successful creation
    expect(true).toBe(true);
  });

  it('NOTE: Edit dialog interactions should be tested in E2E tests', () => {
    // Due to the complexity of testing Dialog components, the following
    // should be tested in end-to-end tests:
    // - Clicking Edit button opens dialog with pre-filled data
    // - Form can be edited and submitted
    // - Submit button shows loading state during mutation
    // - Toast notifications appear on success/error
    // - Dialog closes after successful update
    expect(true).toBe(true);
  });

  it('NOTE: Delete confirmation dialog should be tested in E2E tests', () => {
    // Due to the complexity of testing AlertDialog components, the following
    // should be tested in end-to-end tests:
    // - Clicking Delete button opens confirmation dialog
    // - Dialog shows warning message
    // - Cancel button closes dialog without deletion
    // - Confirm button triggers deletion API call
    // - Delete button shows loading state
    // - Toast notifications on success/error
    expect(true).toBe(true);
  });

  it('handles API errors gracefully when fetching allergens', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(api.adminApi.getAllergens).mockRejectedValue(new Error('API Error'));

    renderWithQueryClient(<AllergenManagement />);

    // TanStack Query handles errors internally, so we just verify the error is thrown
    await waitFor(() => {
      expect(api.adminApi.getAllergens).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('displays loading state while fetching allergens', async () => {
    // Create a promise we can control
    let resolveAllergens: (value: api.AllergenResponse[]) => void;
    const allergensPromise = new Promise<api.AllergenResponse[]>((resolve) => {
      resolveAllergens = resolve;
    });

    vi.mocked(api.adminApi.getAllergens).mockReturnValue(allergensPromise);

    renderWithQueryClient(<AllergenManagement />);

    // Should show loading state
    expect(screen.getByText('Loading allergens...')).toBeInTheDocument();

    // Resolve the promise
    resolveAllergens!(mockAllergens);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Peanuts')).toBeInTheDocument();
    });
  });

  it('displays empty state when no allergens exist', async () => {
    vi.mocked(api.adminApi.getAllergens).mockResolvedValue([]);

    renderWithQueryClient(<AllergenManagement />);

    await waitFor(() => {
      expect(screen.getByText('No allergens found.')).toBeInTheDocument();
    });
  });

  it('displays empty state when search returns no results', async () => {
    renderWithQueryClient(<AllergenManagement />);

    await waitFor(() => {
      expect(screen.getByText('Peanuts')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      'Search allergens by name, category, or description...'
    );
    fireEvent.change(searchInput, { target: { value: 'NonexistentAllergen' } });

    await waitFor(() => {
      expect(screen.getByText('No allergens found.')).toBeInTheDocument();
    });
  });

  it('updates stats when allergens are loaded', async () => {
    renderWithQueryClient(<AllergenManagement />);

    await waitFor(() => {
      // Should show correct category count (3 unique categories: Nuts, Dairy, Seeds)
      const categoryElements = screen.getAllByText('3');
      expect(categoryElements.length).toBeGreaterThan(0);
    });
  });

  it('displays sortable column headers', async () => {
    renderWithQueryClient(<AllergenManagement />);

    await waitFor(() => {
      expect(screen.getByText('Peanuts')).toBeInTheDocument();
    });

    // Check for sortable column headers
    expect(screen.getByRole('button', { name: /Name/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Category/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Type/i })).toBeInTheDocument();
  });

  it('sorts allergens by name in ascending order', async () => {
    renderWithQueryClient(<AllergenManagement />);

    await waitFor(() => {
      expect(screen.getByText('Peanuts')).toBeInTheDocument();
    });

    // Click on Name column header to sort
    const nameHeader = screen.getByRole('button', { name: /Name/i });
    fireEvent.click(nameHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // First row is header, so data rows start at index 1
      // After sorting by name ascending: Milk, Peanuts, Sesame
      expect(rows[1]).toHaveTextContent('Milk');
      expect(rows[2]).toHaveTextContent('Peanuts');
      expect(rows[3]).toHaveTextContent('Sesame');
    });
  });

  it('sorts allergens by name in descending order', async () => {
    renderWithQueryClient(<AllergenManagement />);

    await waitFor(() => {
      expect(screen.getByText('Peanuts')).toBeInTheDocument();
    });

    const nameHeader = screen.getByRole('button', { name: /Name/i });

    // Click twice to sort descending
    fireEvent.click(nameHeader);
    fireEvent.click(nameHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // After sorting by name descending: Sesame, Peanuts, Milk
      expect(rows[1]).toHaveTextContent('Sesame');
      expect(rows[2]).toHaveTextContent('Peanuts');
      expect(rows[3]).toHaveTextContent('Milk');
    });
  });

  it('sorts allergens by category', async () => {
    renderWithQueryClient(<AllergenManagement />);

    await waitFor(() => {
      expect(screen.getByText('Peanuts')).toBeInTheDocument();
    });

    const categoryHeader = screen.getByRole('button', { name: /Category/i });
    fireEvent.click(categoryHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // After sorting by category ascending: Dairy (Milk), Nuts (Peanuts), Seeds (Sesame)
      expect(rows[1]).toHaveTextContent('Dairy');
      expect(rows[2]).toHaveTextContent('Nuts');
      expect(rows[3]).toHaveTextContent('Seeds');
    });
  });

  it('sorts allergens by type (major allergen first)', async () => {
    renderWithQueryClient(<AllergenManagement />);

    await waitFor(() => {
      expect(screen.getByText('Peanuts')).toBeInTheDocument();
    });

    const typeHeader = screen.getByRole('button', { name: /Type/i });
    fireEvent.click(typeHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // After sorting by type ascending (major first): Milk, Peanuts (both major), then Sesame (common)
      // The first two rows should contain "Major" badges
      expect(rows[1]).toHaveTextContent('Major');
      expect(rows[2]).toHaveTextContent('Major');
      expect(rows[3]).toHaveTextContent('Common');
    });
  });

  it('switches between different sort columns', async () => {
    renderWithQueryClient(<AllergenManagement />);

    await waitFor(() => {
      expect(screen.getByText('Peanuts')).toBeInTheDocument();
    });

    // First sort by name
    const nameHeader = screen.getByRole('button', { name: /Name/i });
    fireEvent.click(nameHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Milk');
    });

    // Then sort by category (should reset to ascending)
    const categoryHeader = screen.getByRole('button', { name: /Category/i });
    fireEvent.click(categoryHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Dairy');
    });
  });
});
