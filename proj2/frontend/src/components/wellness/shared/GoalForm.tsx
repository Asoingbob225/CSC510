import { useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { z } from 'zod';
import { type GoalCreate } from '@/lib/api';
import { useCreateGoal } from '@/hooks/useGoalsData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Zod schema for goal validation
const goalSchema = z
  .object({
    goal_type: z.enum(['nutrition', 'wellness']),
    target_type: z.string().min(1, 'Target type is required'),
    target_value: z.number().positive('Target value must be positive'),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    notes: z.string().max(1000).optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      return end > start;
    },
    {
      message: 'End date must be after start date',
      path: ['end_date'],
    }
  );

interface GoalFormProps {
  onSuccess?: () => void;
}

function GoalForm({ onSuccess }: GoalFormProps) {
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    goal_type: 'wellness' as 'nutrition' | 'wellness',
    target_type: '',
    target_value: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: '',
  });

  const createGoal = useCreateGoal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate form data
      const validatedData = goalSchema.parse(formData);

      const goalData: GoalCreate = {
        goal_type: validatedData.goal_type,
        target_type: validatedData.target_type,
        target_value: validatedData.target_value,
        start_date: validatedData.start_date,
        end_date: validatedData.end_date,
        notes: validatedData.notes || undefined,
      };

      await createGoal.mutateAsync(goalData);

      // Reset form
      setFormData({
        goal_type: 'wellness',
        target_type: '',
        target_value: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: '',
      });

      setOpen(false);

      // Notify parent component
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        toast.error(firstError.message);
      }
      // Error toast is handled by the mutation hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 text-white hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Create New Goal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Type */}
          <div className="space-y-2">
            <Label htmlFor="goal-type">Goal Type</Label>
            <Select
              value={formData.goal_type}
              onValueChange={(value: 'nutrition' | 'wellness') =>
                setFormData({ ...formData, goal_type: value })
              }
            >
              <SelectTrigger id="goal-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nutrition">Nutrition</SelectItem>
                <SelectItem value="wellness">Wellness</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Type */}
          <div className="space-y-2">
            <Label htmlFor="target-type">Target Type</Label>
            <Select
              value={formData.target_type}
              onValueChange={(value) => setFormData({ ...formData, target_type: value })}
            >
              <SelectTrigger id="target-type">
                <SelectValue placeholder="Select target metric" />
              </SelectTrigger>
              <SelectContent>
                {formData.goal_type === 'nutrition' ? (
                  <>
                    <SelectItem value="calories">Calories</SelectItem>
                    <SelectItem value="protein">Protein (g)</SelectItem>
                    <SelectItem value="carbs">Carbohydrates (g)</SelectItem>
                    <SelectItem value="fat">Fat (g)</SelectItem>
                    <SelectItem value="water">Water (ml)</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="mood_score">Mood Score</SelectItem>
                    <SelectItem value="stress_level">Stress Level</SelectItem>
                    <SelectItem value="sleep_hours">Sleep Hours</SelectItem>
                    <SelectItem value="meditation_minutes">Meditation Minutes</SelectItem>
                    <SelectItem value="steps">Steps</SelectItem>
                    <SelectItem value="exercise_minutes">Exercise Minutes</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Target Value */}
          <div className="space-y-2">
            <Label htmlFor="target-value">Target Value</Label>
            <Input
              id="target-value"
              type="number"
              min="0"
              step="0.1"
              placeholder="e.g., 2000, 8, 10000"
              value={formData.target_value || ''}
              onChange={(e) =>
                setFormData({ ...formData, target_value: parseFloat(e.target.value) || 0 })
              }
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Additional details about your goal"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              maxLength={1000}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={createGoal.isPending} className="w-full">
            {createGoal.isPending ? 'Creating...' : 'Create Goal'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default GoalForm;
