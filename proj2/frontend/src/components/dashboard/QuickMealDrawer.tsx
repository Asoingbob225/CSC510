import { useState } from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import * as z from 'zod';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useLogMeal } from '@/hooks/useMeals';
import type { MealTypeOption } from '@/lib/api';
import { cn } from '@/lib/utils';

const MEAL_TYPES: { label: string; value: MealTypeOption }[] = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Snack', value: 'snack' },
];

const DEFAULT_PORTION_UNITS = ['serving', 'cup', 'g', 'oz', 'ml', 'slice', 'piece'] as const;

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

const quickMealSchema = z.object({
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  meal_time: z
    .string()
    .min(1, 'Meal time is required')
    .refine((val) => !Number.isNaN(Date.parse(val)), 'Enter a valid date and time'),
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

type QuickMealFormValues = z.infer<typeof quickMealSchema>;

const getDefaultDateTime = () => format(new Date(), "yyyy-MM-dd'T'HH:mm");

interface QuickMealDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickMealDrawer({ open, onOpenChange }: QuickMealDrawerProps) {
  const [isMealDateOpen, setIsMealDateOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<QuickMealFormValues>({
    resolver: zodResolver(quickMealSchema),
    defaultValues: {
      meal_type: 'breakfast',
      meal_time: getDefaultDateTime(),
      food_name: '',
      portion_size: '',
      portion_unit: 'serving',
      calories: '',
      protein_g: '',
      carbs_g: '',
      fat_g: '',
    },
  });

  const mealTime = watch('meal_time');

  const { mutate: logMeal, isPending } = useLogMeal({
    onSuccess: () => {
      toast.success('Meal logged successfully!');
      reset();
      onOpenChange(false);
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to log meal. Please try again.';
      toast.error(message);
    },
  });

  const onSubmit = (data: QuickMealFormValues) => {
    const payload = {
      meal_type: data.meal_type,
      meal_time: data.meal_time,
      food_items: [
        {
          food_name: data.food_name,
          portion_size: Number(data.portion_size),
          portion_unit: data.portion_unit,
          calories: data.calories ? Number(data.calories) : undefined,
          protein_g: data.protein_g ? Number(data.protein_g) : undefined,
          carbs_g: data.carbs_g ? Number(data.carbs_g) : undefined,
          fat_g: data.fat_g ? Number(data.fat_g) : undefined,
        },
      ],
    };

    logMeal(payload);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Quick Meal Log</DrawerTitle>
          <DrawerDescription>Log a single food item quickly</DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mx-auto space-y-4 p-4 sm:w-2xl">
          {/* Meal Type and Time */}
          <div className="grid gap-4 md:grid-cols-2">
            <FieldGroup>
              <FieldLabel>Meal Type</FieldLabel>
              <Field>
                <Select
                  value={watch('meal_type')}
                  onValueChange={(value) => setValue('meal_type', value as MealTypeOption)}
                >
                  <SelectTrigger>
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
              </Field>
              {errors.meal_type && <FieldError>{errors.meal_type.message}</FieldError>}
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Meal Time</FieldLabel>
              <Popover open={isMealDateOpen} onOpenChange={setIsMealDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !mealTime && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {mealTime ? format(new Date(mealTime), 'PPP HH:mm') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={mealTime ? new Date(mealTime) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setValue('meal_time', format(date, "yyyy-MM-dd'T'HH:mm"));
                        setIsMealDateOpen(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
              {errors.meal_time && <FieldError>{errors.meal_time.message}</FieldError>}
            </FieldGroup>
          </div>

          {/* Food Item */}
          <FieldGroup>
            <FieldLabel>Food Name</FieldLabel>
            <Field>
              <Input {...register('food_name')} placeholder="e.g., Grilled Chicken Breast" />
            </Field>
            {errors.food_name && <FieldError>{errors.food_name.message}</FieldError>}
          </FieldGroup>

          {/* Portion */}
          <div className="grid gap-4 md:grid-cols-2">
            <FieldGroup>
              <FieldLabel>Portion Size</FieldLabel>
              <Field>
                <Input {...register('portion_size')} type="number" step="0.1" placeholder="1" />
              </Field>
              {errors.portion_size && <FieldError>{errors.portion_size.message}</FieldError>}
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Unit</FieldLabel>
              <Field>
                <Select
                  value={watch('portion_unit')}
                  onValueChange={(value) => setValue('portion_unit', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_PORTION_UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              {errors.portion_unit && <FieldError>{errors.portion_unit.message}</FieldError>}
            </FieldGroup>
          </div>

          {/* Nutrition (Optional) */}
          <div className="grid gap-4 md:grid-cols-2">
            <FieldGroup>
              <FieldLabel>Calories (optional)</FieldLabel>
              <Field>
                <Input {...register('calories')} type="number" step="1" placeholder="0" />
              </Field>
              {errors.calories && <FieldError>{errors.calories.message}</FieldError>}
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Protein (g) (optional)</FieldLabel>
              <Field>
                <Input {...register('protein_g')} type="number" step="0.1" placeholder="0" />
              </Field>
              {errors.protein_g && <FieldError>{errors.protein_g.message}</FieldError>}
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Carbs (g) (optional)</FieldLabel>
              <Field>
                <Input {...register('carbs_g')} type="number" step="0.1" placeholder="0" />
              </Field>
              {errors.carbs_g && <FieldError>{errors.carbs_g.message}</FieldError>}
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Fat (g) (optional)</FieldLabel>
              <Field>
                <Input {...register('fat_g')} type="number" step="0.1" placeholder="0" />
              </Field>
              {errors.fat_g && <FieldError>{errors.fat_g.message}</FieldError>}
            </FieldGroup>
          </div>

          <DrawerFooter>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
