import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AllergyInput from './AllergyInput';
import type { Allergen, UserAllergy } from '@/lib/api';

describe('AllergyInput Component', () => {
  const mockAllergens: Allergen[] = [
    {
      id: '1',
      name: 'Peanuts',
      category: 'Nuts',
      is_major_allergen: true,
      description: 'Peanut allergy',
    },
    {
      id: '2',
      name: 'Shellfish',
      category: 'Seafood',
      is_major_allergen: true,
      description: 'Shellfish allergy',
    },
    {
      id: '3',
      name: 'Milk',
      category: 'Dairy',
      is_major_allergen: true,
      description: 'Milk allergy',
    },
  ];

  const mockAllergies: UserAllergy[] = [
    {
      id: 'allergy-1',
      health_profile_id: 'profile-1',
      allergen_id: '1',
      severity: 'severe',
      diagnosed_date: '2023-01-01',
      reaction_type: 'Anaphylaxis',
      notes: 'Carry EpiPen',
      is_verified: true,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
  ];

  let mockOnAdd: ReturnType<typeof vi.fn>;
  let mockOnDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnAdd = vi.fn().mockResolvedValue(undefined);
    mockOnDelete = vi.fn().mockResolvedValue(undefined);
  });

  it('displays existing allergies', () => {
    render(
      <AllergyInput
        allergens={mockAllergens}
        allergies={mockAllergies}
        onAdd={mockOnAdd}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Your Allergies')).toBeInTheDocument();
    expect(screen.getByText('Peanuts')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Carry EpiPen')).toBeInTheDocument();
  });

  it('filters out already added allergens from selection', () => {
    render(
      <AllergyInput
        allergens={mockAllergens}
        allergies={mockAllergies}
        onAdd={mockOnAdd}
        onDelete={mockOnDelete}
      />
    );

    // Get the allergen select element
    const allergenLabel = screen.getByText('Allergen *');
    const select = allergenLabel.parentElement?.querySelector('select');
    expect(select).toBeInTheDocument();

    // Get options from the select
    const options = Array.from(select?.querySelectorAll('option') || []);
    
    // Peanuts should not be in the select options since it's already added
    const peanutOption = options.find((opt) => opt.textContent?.includes('Peanuts'));
    expect(peanutOption).toBeUndefined();

    // But Shellfish should be available
    const shellfishOption = options.find((opt) => opt.textContent?.includes('Shellfish'));
    expect(shellfishOption).toBeDefined();
  });

  it('submits new allergy with all fields', async () => {
    render(
      <AllergyInput
        allergens={mockAllergens}
        allergies={[]}
        onAdd={mockOnAdd}
        onDelete={mockOnDelete}
      />
    );

    const severityLabel = screen.getByText('Severity *');
    const severitySelect = severityLabel.parentElement?.querySelector('select');
    expect(severitySelect).toBeInTheDocument();
    
    if (severitySelect) {
      fireEvent.change(severitySelect, { target: { value: 'life_threatening' } });
    }

    // Find inputs by type and placeholder
    const dateInput = document.querySelector('input[type="date"]');
    
    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: '2023-06-15' } });
    }

    const reactionTypeInput = screen.getByPlaceholderText(/e\.g\., Hives/i);
    fireEvent.change(reactionTypeInput, { target: { value: 'Swelling' } });

    const notesTextarea = screen.getByPlaceholderText(/additional information/i);
    fireEvent.change(notesTextarea, { target: { value: 'Severe reaction' } });

    const verifiedCheckbox = screen.getByRole('checkbox');
    fireEvent.click(verifiedCheckbox);

    const submitButton = screen.getByRole('button', { name: /add allergy/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith({
        allergen_id: '1',
        severity: 'life_threatening',
        diagnosed_date: '2023-06-15',
        reaction_type: 'Swelling',
        notes: 'Severe reaction',
        is_verified: true,
      });
    });
  });

  it('submits with only required fields', async () => {
    render(
      <AllergyInput
        allergens={mockAllergens}
        allergies={[]}
        onAdd={mockOnAdd}
        onDelete={mockOnDelete}
      />
    );

    const submitButton = screen.getByRole('button', { name: /add allergy/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith({
        allergen_id: '1',
        severity: 'mild',
        diagnosed_date: undefined,
        reaction_type: undefined,
        notes: undefined,
        is_verified: false,
      });
    });
  });

  it('calls onDelete when delete button is clicked', async () => {
    render(
      <AllergyInput
        allergens={mockAllergens}
        allergies={mockAllergies}
        onAdd={mockOnAdd}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getAllByRole('button')[0]; // First button should be delete
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('allergy-1');
    });
  });

  it('shows message when all allergens are added', () => {
    render(
      <AllergyInput
        allergens={mockAllergens}
        allergies={mockAllergies}
        onAdd={mockOnAdd}
        onDelete={mockOnDelete}
      />
    );

    // Add remaining allergens
    const remainingAllergies: UserAllergy[] = [
      ...mockAllergies,
      {
        id: 'allergy-2',
        health_profile_id: 'profile-1',
        allergen_id: '2',
        severity: 'moderate',
        is_verified: false,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
      {
        id: 'allergy-3',
        health_profile_id: 'profile-1',
        allergen_id: '3',
        severity: 'mild',
        is_verified: false,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    ];

    const { rerender } = render(
      <AllergyInput
        allergens={mockAllergens}
        allergies={remainingAllergies}
        onAdd={mockOnAdd}
        onDelete={mockOnDelete}
      />
    );

    rerender(
      <AllergyInput
        allergens={mockAllergens}
        allergies={remainingAllergies}
        onAdd={mockOnAdd}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/all available allergens have been added/i)).toBeInTheDocument();
  });

  it('disables submit button while submitting', async () => {
    const slowOnAdd = vi.fn(
      () => new Promise<void>(() => {}) // Explicitly type as Promise<void>
    );

    render(
      <AllergyInput
        allergens={mockAllergens}
        allergies={[]}
        onAdd={slowOnAdd}
        onDelete={mockOnDelete}
      />
    );

    const submitButton = screen.getByRole('button', { name: /add allergy/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Adding...');
    });
  });

  it('displays error message when submission fails', async () => {
    const failingOnAdd = vi.fn().mockRejectedValue(new Error('API Error'));

    render(
      <AllergyInput
        allergens={mockAllergens}
        allergies={[]}
        onAdd={failingOnAdd}
        onDelete={mockOnDelete}
      />
    );

    const submitButton = screen.getByRole('button', { name: /add allergy/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('shows severity warning preview', () => {
    render(
      <AllergyInput
        allergens={mockAllergens}
        allergies={[]}
        onAdd={mockOnAdd}
        onDelete={mockOnDelete}
      />
    );

    const severityLabel = screen.getByText('Severity *');
    const severitySelect = severityLabel.parentElement?.querySelector('select');

    // Initial mild severity
    expect(screen.getByText('MILD')).toBeInTheDocument();

    // Change to life threatening
    if (severitySelect) {
      fireEvent.change(severitySelect, { target: { value: 'life_threatening' } });
      expect(screen.getByText('LIFE THREATENING')).toBeInTheDocument();
    }
  });
});
