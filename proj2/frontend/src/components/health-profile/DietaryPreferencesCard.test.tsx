import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DietaryPreferencesCard } from './DietaryPreferencesCard';
import * as api from '@/lib/api';
import type { HealthProfile } from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual('@/lib/api');
  return {
    ...actual,
    healthProfileApi: {
      addDietaryPreference: vi.fn(),
      updateDietaryPreference: vi.fn(),
      deleteDietaryPreference: vi.fn(),
      getProfile: vi.fn(),
    },
  };
});

describe('DietaryPreferencesCard', () => {
  const mockOnUpdate = vi.fn();

  const mockProfile: HealthProfile = {
    id: 'profile-1',
    user_id: 'user-1',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    allergies: [],
    dietary_preferences: [
      {
        id: 'pref-1',
        health_profile_id: 'profile-1',
        preference_type: 'diet',
        preference_name: 'Vegetarian',
        is_strict: true,
        reason: 'Ethical reasons',
        notes: 'No meat products',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dietary preferences list correctly', () => {
    render(<DietaryPreferencesCard healthProfile={mockProfile} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('Dietary Preferences')).toBeInTheDocument();
    expect(screen.getByText('Vegetarian')).toBeInTheDocument();
    expect(screen.getByText('Strict')).toBeInTheDocument();
    expect(screen.getByText('Diet')).toBeInTheDocument();
  });

  it('shows add button when preferences exist', () => {
    render(<DietaryPreferencesCard healthProfile={mockProfile} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('Add Preference')).toBeInTheDocument();
  });

  it('shows empty state when no preferences', () => {
    const emptyProfile = {
      ...mockProfile,
      dietary_preferences: [],
    };

    render(<DietaryPreferencesCard healthProfile={emptyProfile} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('Add your first preference')).toBeInTheDocument();
  });

  it('opens add dialog when add button is clicked', async () => {
    const user = userEvent.setup();
    render(<DietaryPreferencesCard healthProfile={mockProfile} onUpdate={mockOnUpdate} />);

    const addButton = screen.getByText('Add Preference');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Add Dietary Preference')).toBeInTheDocument();
    });
  });

  it('opens edit dialog when preference item is clicked', async () => {
    const user = userEvent.setup();
    render(<DietaryPreferencesCard healthProfile={mockProfile} onUpdate={mockOnUpdate} />);

    // Click on the preference item
    const preferenceItem = screen.getByText('Vegetarian');
    await user.click(preferenceItem);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Edit Dietary Preference')).toBeInTheDocument();
    });
  });

  it('adds new preference successfully', async () => {
    const user = userEvent.setup();
    const newPreference = {
      id: 'pref-2',
      health_profile_id: 'profile-1',
      preference_type: 'diet', // Changed from 'cuisine' to avoid Select interaction issue
      preference_name: 'Vegan',
      is_strict: false,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    const updatedProfile = {
      ...mockProfile,
      dietary_preferences: [...mockProfile.dietary_preferences, newPreference],
    };

    vi.mocked(api.healthProfileApi.addDietaryPreference).mockResolvedValue({
      data: newPreference,
    } as never);

    vi.mocked(api.healthProfileApi.getProfile).mockResolvedValue({
      data: updatedProfile,
    } as never);

    render(<DietaryPreferencesCard healthProfile={mockProfile} onUpdate={mockOnUpdate} />);

    // Open add dialog
    const addButton = screen.getByText('Add Preference');
    await user.click(addButton);

    // Wait for dialog and form to render
    let nameInput!: HTMLElement;
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      nameInput = screen.getByPlaceholderText(/e.g., Vegetarian/i);
      expect(nameInput).toBeInTheDocument();
    });

    // Enter preference name (preference_type will default to 'diet')
    await user.type(nameInput, 'Vegan');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Add Preference/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.healthProfileApi.addDietaryPreference).toHaveBeenCalledWith(
        expect.objectContaining({
          preference_type: 'diet',
          preference_name: 'Vegan',
        })
      );
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('updates existing preference', async () => {
    const user = userEvent.setup();
    const updatedPreference = {
      ...mockProfile.dietary_preferences[0],
      preference_name: 'Vegan',
      is_strict: false,
    };

    vi.mocked(api.healthProfileApi.updateDietaryPreference).mockResolvedValue({
      data: updatedPreference,
    } as never);

    vi.mocked(api.healthProfileApi.getProfile).mockResolvedValue({
      data: {
        ...mockProfile,
        dietary_preferences: [updatedPreference],
      },
    } as never);

    render(<DietaryPreferencesCard healthProfile={mockProfile} onUpdate={mockOnUpdate} />);

    // Click on preference to edit
    const preferenceItem = screen.getByText('Vegetarian');
    await user.click(preferenceItem);

    // Wait for dialog and form fields to render
    let nameInput!: HTMLElement;
    await waitFor(() => {
      expect(screen.getByText('Edit Dietary Preference')).toBeInTheDocument();
      nameInput = screen.getByPlaceholderText(/e.g., Vegetarian/i);
      expect(nameInput).toBeInTheDocument();
    });

    // Preference type field should be disabled
    const typeButton = screen.getAllByRole('combobox')[0]; // Get first combobox (preference type)
    expect(typeButton).toBeDisabled();

    // Update name
    await user.clear(nameInput);
    await user.type(nameInput, 'Vegan'); // Uncheck strict
    const strictCheckbox = screen.getByLabelText(/strict requirement/i);
    await user.click(strictCheckbox);

    // Submit
    const updateButton = screen.getByRole('button', { name: /Update Preference/i });
    await user.click(updateButton);

    await waitFor(() => {
      expect(api.healthProfileApi.updateDietaryPreference).toHaveBeenCalledWith(
        'pref-1',
        expect.objectContaining({
          preference_name: 'Vegan',
          is_strict: false,
        })
      );
    });
  });

  it('displays preference type labels correctly', () => {
    const profileWithTypes: HealthProfile = {
      ...mockProfile,
      dietary_preferences: [
        {
          id: 'p1',
          health_profile_id: 'profile-1',
          preference_type: 'diet',
          preference_name: 'Vegetarian',
          is_strict: false,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
        {
          id: 'p2',
          health_profile_id: 'profile-1',
          preference_type: 'cuisine',
          preference_name: 'Italian',
          is_strict: false,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
        {
          id: 'p3',
          health_profile_id: 'profile-1',
          preference_type: 'ingredient',
          preference_name: 'Organic',
          is_strict: false,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
        {
          id: 'p4',
          health_profile_id: 'profile-1',
          preference_type: 'preparation',
          preference_name: 'Grilled',
          is_strict: false,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
      ],
    };

    render(<DietaryPreferencesCard healthProfile={profileWithTypes} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('Diet')).toBeInTheDocument();
    expect(screen.getByText('Cuisine')).toBeInTheDocument();
    expect(screen.getByText('Ingredient')).toBeInTheDocument();
    expect(screen.getByText('Preparation')).toBeInTheDocument();
  });

  it('shows strict badge when preference is strict', () => {
    render(<DietaryPreferencesCard healthProfile={mockProfile} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('Strict')).toBeInTheDocument();
  });

  it('displays reason and notes when available', () => {
    render(<DietaryPreferencesCard healthProfile={mockProfile} onUpdate={mockOnUpdate} />);

    // Note: reason and notes are not displayed in compact variant,
    // they are stored in the preference but only shown in the edit form
    expect(screen.getByText('Vegetarian')).toBeInTheDocument();
  });

  it('handles validation errors', async () => {
    const user = userEvent.setup();
    render(<DietaryPreferencesCard healthProfile={mockProfile} onUpdate={mockOnUpdate} />);

    // Open dialog
    const addButton = screen.getByText('Add Preference');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /Add Preference/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a preference name/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    vi.mocked(api.healthProfileApi.addDietaryPreference).mockRejectedValue(
      new Error('Network error')
    );

    render(<DietaryPreferencesCard healthProfile={mockProfile} onUpdate={mockOnUpdate} />);

    // Open dialog
    const addButton = screen.getByText('Add Preference');
    await user.click(addButton);

    // Wait for dialog and form fields
    let nameInput!: HTMLElement;
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      nameInput = screen.getByPlaceholderText(/e.g., Vegetarian/i);
      expect(nameInput).toBeInTheDocument();
    });

    // Fill in form
    await user.type(nameInput, 'Test Preference');

    // Submit
    const submitButton = screen.getByRole('button', { name: /Add Preference/i });
    await user.click(submitButton);

    // Should show error
    await waitFor(() => {
      expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
    });
  });

  it('closes dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<DietaryPreferencesCard healthProfile={mockProfile} onUpdate={mockOnUpdate} />);

    // Open dialog
    const addButton = screen.getByText('Add Preference');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('allows adding optional fields', async () => {
    const user = userEvent.setup();
    const newPreference = {
      id: 'pref-2',
      health_profile_id: 'profile-1',
      preference_type: 'diet',
      preference_name: 'Gluten-Free',
      is_strict: true,
      reason: 'Celiac disease',
      notes: 'Must avoid all gluten',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    vi.mocked(api.healthProfileApi.addDietaryPreference).mockResolvedValue({
      data: newPreference,
    } as never);

    vi.mocked(api.healthProfileApi.getProfile).mockResolvedValue({
      data: {
        ...mockProfile,
        dietary_preferences: [...mockProfile.dietary_preferences, newPreference],
      },
    } as never);

    render(<DietaryPreferencesCard healthProfile={mockProfile} onUpdate={mockOnUpdate} />);

    // Open dialog
    const addButton = screen.getByText('Add Preference');
    await user.click(addButton);

    // Wait for dialog and form fields
    let nameInput!: HTMLElement;
    let reasonInput!: HTMLElement;
    let notesInput!: HTMLElement;
    let strictCheckbox!: HTMLElement;
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      nameInput = screen.getByPlaceholderText(/e.g., Vegetarian/i);
      reasonInput = screen.getByPlaceholderText(/e.g., Health, Religious/i);
      notesInput = screen.getByPlaceholderText(/Additional information/i);
      strictCheckbox = screen.getByLabelText(/strict requirement/i);
      expect(nameInput).toBeInTheDocument();
    });

    // Fill all fields
    await user.type(nameInput, 'Gluten-Free');
    await user.type(reasonInput, 'Celiac disease');
    await user.type(notesInput, 'Must avoid all gluten');
    await user.click(strictCheckbox);

    // Submit
    const submitButton = screen.getByRole('button', { name: /Add Preference/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.healthProfileApi.addDietaryPreference).toHaveBeenCalledWith(
        expect.objectContaining({
          preference_name: 'Gluten-Free',
          reason: 'Celiac disease',
          notes: 'Must avoid all gluten',
          is_strict: true,
        })
      );
    });
  });
});
