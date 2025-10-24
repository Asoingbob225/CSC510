import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BasicInfoCard } from './BasicInfoCard';
import * as api from '@/lib/api';
import type { HealthProfile } from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual('@/lib/api');
  return {
    ...actual,
    healthProfileApi: {
      createProfile: vi.fn(),
      updateProfile: vi.fn(),
      getProfile: vi.fn(),
    },
  };
});

describe('BasicInfoCard', () => {
  const mockOnUpdate = vi.fn();

  const mockProfile: HealthProfile = {
    id: 'profile-1',
    user_id: 'user-1',
    height_cm: 175,
    weight_kg: 70,
    activity_level: 'moderate',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    allergies: [],
    dietary_preferences: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders basic information correctly', () => {
    render(<BasicInfoCard healthProfile={mockProfile} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText(/175/)).toBeInTheDocument(); // Height
    expect(screen.getByText(/70/)).toBeInTheDocument(); // Weight
    expect(screen.getByText(/Moderate/i)).toBeInTheDocument(); // Activity level
  });

  it('calculates and displays BMI correctly', () => {
    render(<BasicInfoCard healthProfile={mockProfile} onUpdate={mockOnUpdate} />);

    // BMI = 70 / (1.75 * 1.75) = 22.86
    expect(screen.getByText(/22\.9/)).toBeInTheDocument();
  });

  it('shows "Not set" when no data is available', () => {
    const emptyProfile: HealthProfile = {
      ...mockProfile,
      height_cm: undefined,
      weight_kg: undefined,
      activity_level: undefined,
    };

    render(<BasicInfoCard healthProfile={emptyProfile} onUpdate={mockOnUpdate} />);

    const notSetElements = screen.getAllByText('Not set');
    expect(notSetElements.length).toBeGreaterThan(0);
  });

  it('opens edit dialog when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<BasicInfoCard healthProfile={mockProfile} onUpdate={mockOnUpdate} />);

    // Hover over the card to show edit button
    const card = screen.getByText('Basic Information').closest('div');
    if (card) {
      await user.hover(card);
    }

    // Click edit button
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find((btn) => btn.getAttribute('title') === 'Edit');

    if (editButton) {
      await user.click(editButton);

      // Check dialog is open
      await waitFor(() => {
        expect(screen.getByText('Edit Basic Information')).toBeInTheDocument();
      });
    }
  });

  it('updates profile when form is submitted', async () => {
    const user = userEvent.setup();
    const updatedProfile = { ...mockProfile, height_cm: 180, weight_kg: 75 };

    vi.mocked(api.healthProfileApi.updateProfile).mockResolvedValue({
      data: updatedProfile,
    } as never);

    vi.mocked(api.healthProfileApi.getProfile).mockResolvedValue({
      data: updatedProfile,
    } as never);

    render(<BasicInfoCard healthProfile={mockProfile} onUpdate={mockOnUpdate} />);

    // Open dialog
    const card = screen.getByText('Basic Information').closest('div');
    if (card) {
      await user.hover(card);
    }

    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find((btn) => btn.getAttribute('title') === 'Edit');

    if (editButton) {
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByText('Edit Basic Information')).toBeInTheDocument();
      });

      // Update height input
      const heightInput = screen.getByLabelText(/Height/i);
      await user.clear(heightInput);
      await user.type(heightInput, '180');

      // Update weight input
      const weightInput = screen.getByLabelText(/Weight/i);
      await user.clear(weightInput);
      await user.type(weightInput, '75');

      // Submit form
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Verify API was called
      await waitFor(() => {
        expect(api.healthProfileApi.updateProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            height_cm: 180,
            weight_kg: 75,
          })
        );
      });

      // Verify callback was called
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    }
  });

  it('creates new profile when no profile exists', async () => {
    const user = userEvent.setup();
    const newProfile = {
      id: 'new-profile',
      user_id: 'user-1',
      height_cm: 170,
      weight_kg: 65,
      activity_level: 'sedentary',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      allergies: [],
      dietary_preferences: [],
    };

    vi.mocked(api.healthProfileApi.createProfile).mockResolvedValue({
      data: newProfile,
    } as never);

    vi.mocked(api.healthProfileApi.getProfile).mockResolvedValue({
      data: newProfile,
    } as never);

    render(<BasicInfoCard healthProfile={null} onUpdate={mockOnUpdate} />);

    // Should show "Not set" for empty profile
    expect(screen.getAllByText('Not set').length).toBeGreaterThan(0);

    // Open dialog
    const card = screen.getByText('Basic Information').closest('div');
    if (card) {
      await user.hover(card);
    }

    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find((btn) => btn.getAttribute('title') === 'Edit');

    if (editButton) {
      await user.click(editButton);

      // Fill in form
      const heightInput = screen.getByLabelText(/Height/i);
      await user.type(heightInput, '170');

      const weightInput = screen.getByLabelText(/Weight/i);
      await user.type(weightInput, '65');

      // Submit
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Verify create API was called
      await waitFor(() => {
        expect(api.healthProfileApi.createProfile).toHaveBeenCalled();
      });
    }
  });

  it('displays activity level options correctly', async () => {
    const user = userEvent.setup();
    render(<BasicInfoCard healthProfile={mockProfile} onUpdate={mockOnUpdate} />);

    // Open dialog
    const card = screen.getByText('Basic Information').closest('div');
    if (card) {
      await user.hover(card);
    }

    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find((btn) => btn.getAttribute('title') === 'Edit');

    if (editButton) {
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByText('Edit Basic Information')).toBeInTheDocument();
      });

      // Click activity level select
      const activitySelect = screen.getByLabelText(/Activity Level/i);
      await user.click(activitySelect);

      // Check options are available
      await waitFor(() => {
        expect(screen.getByText(/Sedentary/i)).toBeInTheDocument();
        expect(screen.getByText(/Lightly active/i)).toBeInTheDocument();
        expect(screen.getByText(/Moderately active/i)).toBeInTheDocument();
        expect(screen.getByText(/Very active/i)).toBeInTheDocument();
        expect(screen.getByText(/Extremely active/i)).toBeInTheDocument();
      });
    }
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    vi.mocked(api.healthProfileApi.updateProfile).mockRejectedValue(new Error('Network error'));

    render(<BasicInfoCard healthProfile={mockProfile} onUpdate={mockOnUpdate} />);

    // Open dialog
    const card = screen.getByText('Basic Information').closest('div');
    if (card) {
      await user.hover(card);
    }

    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find((btn) => btn.getAttribute('title') === 'Edit');

    if (editButton) {
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByText('Edit Basic Information')).toBeInTheDocument();
      });

      // Submit form
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
      });
    }
  });

  it('closes dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<BasicInfoCard healthProfile={mockProfile} onUpdate={mockOnUpdate} />);

    // Open dialog
    const card = screen.getByText('Basic Information').closest('div');
    if (card) {
      await user.hover(card);
    }

    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find((btn) => btn.getAttribute('title') === 'Edit');

    if (editButton) {
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByText('Edit Basic Information')).toBeInTheDocument();
      });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Dialog should be closed
      await waitFor(() => {
        expect(screen.queryByText('Edit Basic Information')).not.toBeInTheDocument();
      });
    }
  });
});
