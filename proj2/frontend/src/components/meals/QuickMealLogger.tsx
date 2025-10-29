import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

import { useLogMeal } from '@/hooks/useMeals';
import type { MealCreateRequest, MealTypeOption } from '@/lib/api';
import { cn } from '@/lib/utils';

const MEAL_TYPES: { label: string; value: MealTypeOption }[] = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Snack', value: 'snack' },
];

const DEFAULT_PORTION_UNITS = ['serving', 'cup', 'g', 'oz', 'ml', 'slice', 'piece'] as const;
type PortionUnitOption = (typeof DEFAULT_PORTION_UNITS)[number];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const numberString = z
  .string()
  .optional()
  .refine(
    (val) =>
      val === undefined ||
      val === '' ||
      (!Number.isNaN(Number(val)) && Number(val) >= 0 && Number(val) !== Infinity),
    'Enter a non-negative number'
  );

const foodItemSchema = z.object({
  food_name: z.string().min(1, 'Food name is required'),
  portion_size: z
    .string()
    .min(1, 'Portion size is required')
    .refine(
      (val) => !Number.isNaN(Number(val)) && Number(val) > 0,
      'Portion size must be greater than 0'
    ),
  portion_unit: z.string().min(1, 'Portion unit is required'),
  calories: numberString,
  protein_g: numberString,
  carbs_g: numberString,
  fat_g: numberString,
});

const mealFormSchema = z.object({
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  meal_time: z
    .string()
    .min(1, 'Meal time is required')
    .refine((val) => !Number.isNaN(Date.parse(val)), 'Enter a valid date and time'),
  notes: z.string().max(1000, 'Notes must be under 1000 characters').optional().or(z.literal('')),
  food_items: z.array(foodItemSchema).min(1, 'Add at least one food item'),
});

type MealFormValues = z.infer<typeof mealFormSchema>;
type PortionUnitFieldName = `food_items.${number}.portion_unit`;

const getDefaultDateTime = () => format(new Date(), "yyyy-MM-dd'T'HH:mm");

const createEmptyFoodItem = (): MealFormValues['food_items'][number] => ({
  food_name: '',
  portion_size: '',
  portion_unit: 'serving',
  calories: '',
  protein_g: '',
  carbs_g: '',
  fat_g: '',
});

export interface QuickMealLoggerProps {
  foodSuggestions?: string[];
}

export function QuickMealLogger({ foodSuggestions = [] }: QuickMealLoggerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isMealDateOpen, setIsMealDateOpen] = useState(false);

  const form = useForm<MealFormValues>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      meal_type: 'breakfast',
      meal_time: getDefaultDateTime(),
      notes: '',
      food_items: [createEmptyFoodItem()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'food_items',
  });

  const logMealMutation = useLogMeal({
    onSuccess: () => {
      toast.success('Meal logged successfully!');
      form.reset({
        meal_type: form.getValues('meal_type'),
        meal_time: getDefaultDateTime(),
        notes: '',
        food_items: [createEmptyFoodItem()],
      });
      setPhotoFile(null);
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
      setPhotoPreviewUrl(null);
      setPhotoError(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    onError: () => {
      toast.error('Failed to log meal. Please try again.');
    },
  });

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  const parseMealTimeValue = (value?: string): Date | undefined => {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  };

  const watchedItems = useWatch({
    control: form.control,
    name: 'food_items',
  }) as MealFormValues['food_items'] | undefined;

  const nutritionTotals = useMemo(() => {
    const items = watchedItems ?? [];
    const parseMetric = (value?: string) => {
      if (value === undefined || value === null || value === '') {
        return 0;
      }
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    return items.reduce(
      (acc, item) => {
        const calories = parseMetric(item.calories);
        const protein = parseMetric(item.protein_g);
        const carbs = parseMetric(item.carbs_g);
        const fat = parseMetric(item.fat_g);

        return {
          calories: acc.calories + calories,
          protein: acc.protein + protein,
          carbs: acc.carbs + carbs,
          fat: acc.fat + fat,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [watchedItems]);

  const uniqueSuggestions = useMemo(() => {
    const seen = new Set<string>();
    return foodSuggestions
      .map((suggestion) => suggestion.trim())
      .filter((suggestion) => {
        if (!suggestion) return false;
        const key = suggestion.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => a.localeCompare(b));
  }, [foodSuggestions]);

  const handleAddFoodItem = () => {
    append(createEmptyFoodItem());
  };

  const handleRemoveFoodItem = (index: number) => {
    if (fields.length === 1) {
      toast.error('A meal must contain at least one food item.');
      return;
    }
    remove(index);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setPhotoFile(null);
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
      setPhotoPreviewUrl(null);
      setPhotoError(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setPhotoFile(null);
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
      setPhotoPreviewUrl(null);
      setPhotoError('File must be 5MB or smaller.');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }

    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }

    setPhotoFile(file);
    setPhotoError(null);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoPreviewUrl(null);
    setPhotoError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const onSubmit = (values: MealFormValues) => {
    const toNumber = (value?: string) => {
      if (value === undefined || value === '') return undefined;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    };

    const payload: MealCreateRequest = {
      meal_type: values.meal_type,
      meal_time: new Date(values.meal_time).toISOString(),
      notes: values.notes?.trim() ? values.notes.trim() : undefined,
      photo_url: undefined,
      food_items: values.food_items.map((item) => ({
        food_name: item.food_name.trim(),
        portion_size: Number(item.portion_size),
        portion_unit: item.portion_unit.trim(),
        calories: toNumber(item.calories),
        protein_g: toNumber(item.protein_g),
        carbs_g: toNumber(item.carbs_g),
        fat_g: toNumber(item.fat_g),
      })),
    };

    if (photoFile) {
      // Upload service integration can populate payload.photo_url.
      // For now we only ensure the file passes validation and keep placeholder until backend support lands.
      payload.photo_url = photoPreviewUrl ?? `uploaded://${photoFile.name}`;
    }

    logMealMutation.mutate(payload);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Quick Meal Logger</CardTitle>
        <CardDescription>
          Record your meals with portion details and optional nutrition info. Attach a photo to keep
          visual context.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Controller
              name="meal_type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="meal_type">Meal type</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      id="meal_type"
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEAL_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <Controller
              name="meal_time"
              control={form.control}
              render={({ field: mealTimeField, fieldState }) => {
                const selectedDate = parseMealTimeValue(mealTimeField.value);
                const timeValue = selectedDate ? format(selectedDate, 'HH:mm') : '';

                const updateFieldWithDate = (date: Date) => {
                  const next = new Date(date);
                  const baseline = selectedDate ?? new Date();
                  next.setHours(baseline.getHours(), baseline.getMinutes(), 0, 0);
                  mealTimeField.onChange(format(next, "yyyy-MM-dd'T'HH:mm"));
                };

                const updateFieldWithTime = (time: string) => {
                  if (!time) {
                    if (selectedDate) {
                      const reset = new Date(selectedDate);
                      reset.setHours(0, 0, 0, 0);
                      mealTimeField.onChange(format(reset, "yyyy-MM-dd'T'HH:mm"));
                    } else {
                      mealTimeField.onChange('');
                    }
                    return;
                  }

                  const [hoursStr, minutesStr] = time.split(':');
                  const hours = Number(hoursStr);
                  const minutes = Number(minutesStr);

                  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
                    return;
                  }

                  const base = selectedDate ?? new Date();
                  const next = new Date(base);
                  next.setHours(hours, minutes, 0, 0);
                  mealTimeField.onChange(format(next, "yyyy-MM-dd'T'HH:mm"));
                };

                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="meal_time">Meal time</FieldLabel>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Popover open={isMealDateOpen} onOpenChange={setIsMealDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            id="meal_time"
                            type="button"
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal sm:max-w-[220px]',
                              !selectedDate && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, 'PPP') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              if (date) {
                                updateFieldWithDate(date);
                                mealTimeField.onBlur();
                              } else {
                                mealTimeField.onChange('');
                              }
                              setIsMealDateOpen(false);
                            }}
                            disabled={(date) => date > new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      <div className="flex w-full flex-col gap-3 sm:w-auto sm:max-w-[180px]">
                        <Input
                          type="time"
                          id="meal_time_picker"
                          step={60}
                          value={timeValue}
                          onChange={(event) => {
                            updateFieldWithTime(event.target.value);
                          }}
                          onBlur={mealTimeField.onBlur}
                          aria-invalid={fieldState.invalid}
                          className={cn(
                            'appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none',
                            'w-full sm:w-auto sm:max-w-[140px]'
                          )}
                        />
                      </div>
                    </div>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                );
              }}
            />
          </FieldGroup>

          <Field data-invalid={!!form.formState.errors.notes}>
            <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Add preparation notes, mood, or context"
              {...form.register('notes')}
            />
            <FieldError>{form.formState.errors.notes?.message}</FieldError>
          </Field>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Food items</h3>
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleAddFoodItem}
              >
                <Plus className="h-4 w-4" />
                Add item
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => {
                const nameError = form.formState.errors.food_items?.[index]?.food_name?.message;
                const portionError =
                  form.formState.errors.food_items?.[index]?.portion_size?.message;
                const caloriesError = form.formState.errors.food_items?.[index]?.calories?.message;
                const proteinError = form.formState.errors.food_items?.[index]?.protein_g?.message;
                const carbsError = form.formState.errors.food_items?.[index]?.carbs_g?.message;
                const fatError = form.formState.errors.food_items?.[index]?.fat_g?.message;
                const datalistId = `food-suggestions-${field.id}`;
                const portionUnitFieldName =
                  `food_items.${index}.portion_unit` as PortionUnitFieldName;

                return (
                  <div key={field.id} className="rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <Field className="flex-1" data-invalid={!!nameError}>
                        <FieldLabel htmlFor={`food_name_${index}`}>Food name</FieldLabel>
                        <Input
                          id={`food_name_${index}`}
                          aria-invalid={!!nameError}
                          placeholder="e.g. Grilled chicken breast"
                          list={datalistId}
                          {...form.register(`food_items.${index}.food_name`)}
                        />
                        <datalist id={datalistId}>
                          {uniqueSuggestions.map((suggestion) => (
                            <option key={`${field.id}-${suggestion}`} value={suggestion} />
                          ))}
                        </datalist>
                        <FieldError>{nameError}</FieldError>
                      </Field>

                      <Button
                        type="button"
                        variant="ghost"
                        className="mt-6 text-red-600 hover:text-red-700"
                        onClick={() => handleRemoveFoodItem(index)}
                        aria-label="Remove food item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <Field data-invalid={!!portionError}>
                        <FieldLabel htmlFor={`portion_size_${index}`}>Portion size</FieldLabel>
                        <Input
                          id={`portion_size_${index}`}
                          aria-invalid={!!portionError}
                          placeholder="1"
                          {...form.register(`food_items.${index}.portion_size`)}
                        />
                        <FieldError>{portionError}</FieldError>
                      </Field>

                      <Controller
                        key={`${field.id}-portion-unit-controller`}
                        name={portionUnitFieldName}
                        control={form.control}
                        render={({ field: portionUnitField, fieldState }) => {
                          const rawValue =
                            typeof portionUnitField.value === 'string'
                              ? portionUnitField.value
                              : '';
                          const isPreset =
                            rawValue !== '' &&
                            DEFAULT_PORTION_UNITS.includes(rawValue as PortionUnitOption);
                          const selectValue: PortionUnitOption | 'other' = isPreset
                            ? (rawValue as PortionUnitOption)
                            : 'other';
                          const showCustomInput = !isPreset;

                          return (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={`portion_unit_select_${index}`}>
                                Portion unit
                              </FieldLabel>
                              <Select
                                value={selectValue}
                                onValueChange={(value) => {
                                  if (value === 'other') {
                                    portionUnitField.onChange('');
                                  } else {
                                    portionUnitField.onChange(value);
                                  }
                                }}
                              >
                                <SelectTrigger
                                  id={`portion_unit_select_${index}`}
                                  aria-invalid={fieldState.invalid}
                                  className="w-full"
                                  onBlur={portionUnitField.onBlur}
                                >
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent>
                                  {DEFAULT_PORTION_UNITS.map((unit) => (
                                    <SelectItem
                                      key={`${field.id}-portion-unit-${unit}`}
                                      value={unit}
                                    >
                                      {unit}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              {showCustomInput && (
                                <Input
                                  id={`portion_unit_${index}`}
                                  className="mt-2"
                                  placeholder="Enter custom unit"
                                  value={rawValue}
                                  onChange={(event) =>
                                    portionUnitField.onChange(event.target.value)
                                  }
                                  onBlur={portionUnitField.onBlur}
                                  aria-invalid={fieldState.invalid}
                                />
                              )}
                              <FieldError>{fieldState.error?.message}</FieldError>
                            </Field>
                          );
                        }}
                      />

                      <Field data-invalid={!!caloriesError}>
                        <FieldLabel htmlFor={`calories_${index}`}>Calories (kcal)</FieldLabel>
                        <Input
                          id={`calories_${index}`}
                          inputMode="decimal"
                          placeholder="Optional"
                          aria-invalid={!!caloriesError}
                          {...form.register(`food_items.${index}.calories`)}
                        />
                        <FieldError>{caloriesError}</FieldError>
                      </Field>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <Field data-invalid={!!proteinError}>
                        <FieldLabel htmlFor={`protein_${index}`}>Protein (g)</FieldLabel>
                        <Input
                          id={`protein_${index}`}
                          inputMode="decimal"
                          placeholder="Optional"
                          aria-invalid={!!proteinError}
                          {...form.register(`food_items.${index}.protein_g`)}
                        />
                        <FieldError>{proteinError}</FieldError>
                      </Field>

                      <Field data-invalid={!!carbsError}>
                        <FieldLabel htmlFor={`carbs_${index}`}>Carbs (g)</FieldLabel>
                        <Input
                          id={`carbs_${index}`}
                          inputMode="decimal"
                          placeholder="Optional"
                          aria-invalid={!!carbsError}
                          {...form.register(`food_items.${index}.carbs_g`)}
                        />
                        <FieldError>{carbsError}</FieldError>
                      </Field>

                      <Field data-invalid={!!fatError}>
                        <FieldLabel htmlFor={`fat_${index}`}>Fat (g)</FieldLabel>
                        <Input
                          id={`fat_${index}`}
                          inputMode="decimal"
                          placeholder="Optional"
                          aria-invalid={!!fatError}
                          {...form.register(`food_items.${index}.fat_g`)}
                        />
                        <FieldError>{fatError}</FieldError>
                      </Field>
                    </div>
                  </div>
                );
              })}
            </div>
            {typeof form.formState.errors.food_items?.message === 'string' && (
              <FieldError>{form.formState.errors.food_items?.message}</FieldError>
            )}
          </div>

          <Field data-invalid={!!photoError}>
            <FieldLabel htmlFor="meal-photo">Meal photo (optional)</FieldLabel>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                id="meal-photo"
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              {photoPreviewUrl ? (
                <Button type="button" variant="ghost" onClick={handleRemovePhoto}>
                  Remove photo
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Upload className="h-4 w-4" />
                  <span>JPG, PNG up to 5MB</span>
                </div>
              )}
            </div>
            <FieldError>{photoError}</FieldError>
            {photoPreviewUrl && (
              <img
                src={photoPreviewUrl}
                alt="Meal preview"
                className="mt-2 max-h-48 rounded-md border object-cover"
              />
            )}
          </Field>

          <div className="rounded-md bg-purple-50 p-4 text-sm text-purple-800">
            <p className="font-medium">Current totals</p>
            <p className="mt-1 flex flex-wrap gap-4">
              <span>{nutritionTotals.calories.toFixed(0)} kcal</span>
              <span>{nutritionTotals.protein.toFixed(1)} g protein</span>
              <span>{nutritionTotals.carbs.toFixed(1)} g carbs</span>
              <span>{nutritionTotals.fat.toFixed(1)} g fat</span>
            </p>
          </div>

          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={logMealMutation.isPending || !!photoError}
          >
            {logMealMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging meal...
              </>
            ) : (
              'Log meal'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
