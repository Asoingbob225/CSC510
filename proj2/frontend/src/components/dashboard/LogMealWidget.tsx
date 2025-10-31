import { useState } from 'react';
import { Plus, UtensilsCrossed } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuickMealDrawer } from './QuickMealDrawer';

export function LogMealWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="justify-center border-2 border-dashed border-purple-300 bg-linear-to-br from-purple-50 to-pink-50 transition-all hover:border-purple-400 hover:shadow-lg lg:col-span-1">
        <CardContent className="flex flex-col items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-purple-100 p-4">
              <UtensilsCrossed className="size-8 text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="mb-1 text-xl font-bold text-gray-900">Log a Meal</h3>
              <p className="text-sm text-gray-600">Track your nutrition quickly</p>
            </div>
          </div>
          <Button
            size="lg"
            onClick={() => setOpen(true)}
            className="w-full max-w-64 gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="size-5" />
            Add Meal
          </Button>
        </CardContent>
      </Card>

      <QuickMealDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}
