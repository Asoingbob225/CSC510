import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Filter, Loader2, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

import { useMeals } from '@/hooks/useMeals';
import type { MealListFilters, MealLogResponse, MealTypeOption } from '@/lib/api';

const MEAL_TYPE_LABELS: Record<MealTypeOption, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const PAGE_SIZE = 10;

const toISOStringOrUndefined = (date?: string, endOfDay = false) => {
  if (!date) return undefined;
  const base = endOfDay ? `${date}T23:59:59` : `${date}T00:00:00`;
  return new Date(base).toISOString();
};

export function MealHistory() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    meal_type: '' | MealTypeOption;
    start_date: string;
    end_date: string;
  }>({
    meal_type: '',
    start_date: '',
    end_date: '',
  });

  const queryFilters: MealListFilters = useMemo(() => {
    return {
      page,
      page_size: PAGE_SIZE,
      meal_type: filters.meal_type || undefined,
      start_date: toISOStringOrUndefined(filters.start_date),
      end_date: toISOStringOrUndefined(filters.end_date, true),
    };
  }, [filters, page]);

  const { data, isLoading, isFetching, isError, error, refetch } = useMeals(queryFilters, {
    enabled: true,
  });

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Meal history refreshed');
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;
  const meals: MealLogResponse[] = data?.meals ?? [];
  const showEmptyState = !isLoading && meals.length === 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Meal History</CardTitle>
        <CardDescription>
          Review past meals, filter by type or date range, and monitor nutrition trends.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="grid gap-4 md:grid-cols-4" aria-label="Meal history filters">
          <div className="space-y-2">
            <Label htmlFor="meal_type" className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-purple-500" />
              Meal type
            </Label>
            <select
              id="meal_type"
              name="meal_type"
              value={filters.meal_type}
              onChange={handleFilterChange}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
            >
              <option value="">All meals</option>
              {Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              Start date
            </Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              value={filters.start_date}
              max={filters.end_date || undefined}
              onChange={handleFilterChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              End date
            </Label>
            <Input
              id="end_date"
              name="end_date"
              type="date"
              value={filters.end_date}
              min={filters.start_date || undefined}
              onChange={handleFilterChange}
            />
          </div>

          <div className="flex items-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleRefresh}
              disabled={isFetching}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => {
                setFilters({
                  meal_type: '',
                  start_date: '',
                  end_date: '',
                });
                setPage(1);
              }}
              disabled={
                !filters.meal_type && !filters.start_date && !filters.end_date && !isFetching
              }
            >
              Clear
            </Button>
          </div>
        </form>

        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-purple-600">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm">Loading meal history...</span>
          </div>
        ) : isError ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600">
            <p className="font-medium">Unable to load meal history</p>
            <p className="mt-1 text-sm">{(error as Error)?.message ?? 'Please try again.'}</p>
            <Button className="mt-4" variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : showEmptyState ? (
          <div className="rounded-md border border-dashed border-gray-300 p-10 text-center text-gray-600">
            <p className="text-lg font-semibold">No meals logged for this range.</p>
            <p className="mt-2 text-sm">
              Adjust the filters or log a new meal using the Quick Meal Logger.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-purple-200"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm font-semibold tracking-wide text-purple-600 uppercase">
                      {MEAL_TYPE_LABELS[meal.meal_type]}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {format(parseISO(meal.meal_time), 'PPP p')}
                    </p>
                    {meal.notes && (
                      <p className="mt-2 text-sm text-gray-700">
                        <span className="font-medium text-gray-900">Notes:</span> {meal.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-start text-sm text-gray-600 sm:items-end">
                    <p>
                      Total calories:{' '}
                      <span className="font-medium text-gray-900">
                        {typeof meal.total_calories === 'number'
                          ? `${Math.round(meal.total_calories)} kcal`
                          : '—'}
                      </span>
                    </p>
                    <p>
                      Protein:{' '}
                      <span className="font-medium text-gray-900">
                        {typeof meal.total_protein_g === 'number'
                          ? `${meal.total_protein_g.toFixed(1)} g`
                          : '—'}
                      </span>
                    </p>
                    <p>
                      Carbs:{' '}
                      <span className="font-medium text-gray-900">
                        {typeof meal.total_carbs_g === 'number'
                          ? `${meal.total_carbs_g.toFixed(1)} g`
                          : '—'}
                      </span>
                    </p>
                    <p>
                      Fat:{' '}
                      <span className="font-medium text-gray-900">
                        {typeof meal.total_fat_g === 'number'
                          ? `${meal.total_fat_g.toFixed(1)} g`
                          : '—'}
                      </span>
                    </p>
                  </div>
                </div>

                {meal.photo_url && (
                  <img
                    src={meal.photo_url}
                    alt={`Meal ${MEAL_TYPE_LABELS[meal.meal_type]} photo`}
                    className="mt-4 max-h-56 w-full rounded-md object-cover"
                  />
                )}

                <Separator className="my-4" />

                <div className="grid gap-3 sm:grid-cols-2">
                  {meal.food_items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm"
                    >
                      <p className="font-medium text-gray-900">{item.food_name}</p>
                      <p className="mt-1 text-gray-600">
                        {item.portion_size} {item.portion_unit}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                        {typeof item.calories === 'number' && (
                          <span>{Math.round(item.calories)} kcal</span>
                        )}
                        {typeof item.protein_g === 'number' && (
                          <span>{item.protein_g.toFixed(1)} g protein</span>
                        )}
                        {typeof item.carbs_g === 'number' && (
                          <span>{item.carbs_g.toFixed(1)} g carbs</span>
                        )}
                        {typeof item.fat_g === 'number' && (
                          <span>{item.fat_g.toFixed(1)} g fat</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          Page {page} of {totalPages}
          {isFetching && !isLoading && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs text-purple-600">
              <Loader2 className="h-3 w-3 animate-spin" /> Updating…
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1 || isFetching}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages || isFetching}
          >
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
