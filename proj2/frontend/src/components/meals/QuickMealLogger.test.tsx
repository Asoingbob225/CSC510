import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach, beforeAll, afterEach, vi } from 'vitest';

import { QuickMealLogger } from './QuickMealLogger';
import type { MealLogResponse } from '@/lib/api';
import { useLogMeal } from '@/hooks/useMeals';

vi.mock('@/hooks/useMeals', () => ({
  useLogMeal: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createObjectURLMock = vi.fn(() => 'blob:mock-url');
const revokeObjectURLMock = vi.fn();

beforeAll(() => {
  // jsdom does not provide these implementations by default
  global.URL.createObjectURL = createObjectURLMock;
  global.URL.revokeObjectURL = revokeObjectURLMock;
});

afterEach(() => {
  createObjectURLMock.mockClear();
  revokeObjectURLMock.mockClear();
});

describe('QuickMealLogger', () => {
  const user = userEvent.setup();
  const mutateMock = vi.fn();
  let capturedOptions: Parameters<typeof useLogMeal>[0] | undefined;

  beforeEach(() => {
    mutateMock.mockReset();
    capturedOptions = undefined;
    vi.mocked(useLogMeal).mockImplementation((options) => {
      capturedOptions = options;
      return {
        mutate: mutateMock,
        isPending: false,
      } as unknown as ReturnType<typeof useLogMeal>;
    });
  });

  it('submits a valid meal log payload', async () => {
    render(<QuickMealLogger foodSuggestions={['Oatmeal', 'Yogurt']} />);

    await user.type(screen.getByLabelText(/food name/i), 'Oatmeal');
    await user.clear(screen.getByLabelText(/portion size/i));
    await user.type(screen.getByLabelText(/portion size/i), '1.5');
    await user.type(screen.getByLabelText(/calories/i), '220');
    await user.type(screen.getByLabelText(/protein \(g\)/i), '10');

    await user.click(screen.getByRole('button', { name: /log meal/i }));

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledTimes(1);
    });

    const payload = mutateMock.mock.calls[0][0];
    const mealTimeInput = screen.getByLabelText(/meal time/i) as HTMLInputElement;
    const expectedIso = new Date(mealTimeInput.value).toISOString();

    expect(payload.meal_type).toBe('breakfast');
    expect(payload.meal_time).toBe(expectedIso);
    expect(payload.photo_url).toBeUndefined();
    expect(payload.food_items).toHaveLength(1);
    expect(payload.food_items[0]).toMatchObject({
      food_name: 'Oatmeal',
      portion_size: 1.5,
      portion_unit: 'serving',
      calories: 220,
      protein_g: 10,
    });
  });

  it('prevents photo uploads larger than 5MB', async () => {
    render(<QuickMealLogger foodSuggestions={[]} />);

    const largeFile = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.jpg', {
      type: 'image/jpeg',
    });

    const fileInput = screen.getByLabelText(/meal photo/i) as HTMLInputElement;
    await user.upload(fileInput, largeFile);

    expect(screen.getByText('File must be 5MB or smaller.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log meal/i })).toBeDisabled();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('resets the form after a successful submission', async () => {
    const { act } = await import('@testing-library/react');
    render(<QuickMealLogger foodSuggestions={[]} />);

    await user.type(screen.getByLabelText(/food name/i), 'Pasta');
    await user.clear(screen.getByLabelText(/portion size/i));
    await user.type(screen.getByLabelText(/portion size/i), '2');

    await user.click(screen.getByRole('button', { name: /log meal/i }));

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledTimes(1);
    });

    const mockResponse: MealLogResponse = {
      id: 'meal-1',
      user_id: 'user-1',
      meal_type: 'breakfast',
      meal_time: new Date().toISOString(),
      notes: null,
      photo_url: null,
      total_calories: 500,
      total_protein_g: 20,
      total_carbs_g: 60,
      total_fat_g: 15,
      food_items: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await act(async () => {
      capturedOptions?.onSuccess?.(mockResponse);
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/food name/i)).toHaveValue('');
    });
  });
});
