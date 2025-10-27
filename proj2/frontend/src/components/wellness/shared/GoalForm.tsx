import { useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { z } from 'zod';
import { wellnessApi, type GoalCreate } from '@/lib/api';
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
const goalSchema = z.object({
  goal_type: z.string().min(1, 'Goal type is required'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  target_value: z.number().positive('Target value must be positive'),
  current_value: z.number().min(0, 'Current value must be non-negative'),
  unit: z.string().min(1, 'Unit is required'),
  start_date: z.string().min(1, 'Start date is required'),
  target_date: z.string().min(1, 'Target date is required'),
  priority: z.enum(['low', 'medium', 'high']),
});

interface GoalFormProps {
  onSuccess?: () => void;
}

function GoalForm({ onSuccess }: GoalFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    goal_type: 'nutrition',
    description: '',
    target_value: 0,
    current_value: 0,
    unit: '',
    start_date: new Date().toISOString().split('T')[0],
    target_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate form data
      const validatedData = goalSchema.parse(formData);

      setIsSubmitting(true);

      const goalData: GoalCreate = {
        goal_type: validatedData.goal_type as 'nutrition' | 'mental_wellness',
        description: validatedData.description,
        target_value: validatedData.target_value,
        current_value: validatedData.current_value,
        target_date: validatedData.target_date,
        priority: validatedData.priority,
      };

      await wellnessApi.createGoal(goalData);

      toast.success('Goal created successfully! 🎯');

      // Reset form
      setFormData({
        goal_type: 'nutrition',
        description: '',
        target_value: 0,
        current_value: 0,
        unit: '',
        start_date: new Date().toISOString().split('T')[0],
        target_date: '',
        priority: 'medium',
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
      } else {
        console.error('Error creating goal:', error);
        toast.error('Failed to create goal. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
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
              onValueChange={(value) => setFormData({ ...formData, goal_type: value })}
            >
              <SelectTrigger id="goal-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nutrition">Nutrition</SelectItem>
                <SelectItem value="mental_wellness">Mental Wellness</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="weight">Weight Management</SelectItem>
                <SelectItem value="sleep">Sleep</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g., Reduce daily calorie intake"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          {/* Target Value and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-value">Target Value</Label>
              <Input
                id="target-value"
                type="number"
                min="0"
                step="0.1"
                value={formData.target_value}
                onChange={(e) =>
                  setFormData({ ...formData, target_value: parseFloat(e.target.value) || 0 })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                placeholder="e.g., calories, kg, hours"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Current Value */}
          <div className="space-y-2">
            <Label htmlFor="current-value">Current Value</Label>
            <Input
              id="current-value"
              type="number"
              min="0"
              step="0.1"
              value={formData.current_value}
              onChange={(e) =>
                setFormData({ ...formData, current_value: parseFloat(e.target.value) || 0 })
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
              <Label htmlFor="target-date">Target Date</Label>
              <Input
                id="target-date"
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: 'low' | 'medium' | 'high') =>
                setFormData({ ...formData, priority: value })
              }
            >
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating...' : 'Create Goal'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default GoalForm;
