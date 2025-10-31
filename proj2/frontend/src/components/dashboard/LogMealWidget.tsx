import { useState } from 'react';
import { Plus, UtensilsCrossed } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuickMealDrawer } from './QuickMealDrawer';

export function LogMealWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="col-span-full border-2 border-dashed border-purple-300 bg-linear-to-br from-purple-50 to-pink-50 transition-all hover:border-purple-400 hover:shadow-lg lg:col-span-1">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full bg-purple-100 p-6">
            <UtensilsCrossed className="size-12 text-purple-600" />
          </div>
          <h3 className="mb-2 text-2xl font-bold text-gray-900">Log a Meal</h3>
          <p className="mb-6 text-sm text-gray-600">
            Track your nutrition by logging what you&apos;ve eaten today
          </p>
          <Button
            size="lg"
            onClick={() => setOpen(true)}
            className="gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="size-5" />
            Add Meal
          </Button>
          <p className="mt-4 text-xs text-gray-500">Takes less than a minute to log your meal</p>
        </CardContent>
      </Card>

      <QuickMealDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}
