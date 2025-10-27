import { useState } from 'react';
import { Brain } from 'lucide-react';
import { z } from 'zod';
import { type StressLogCreate } from '@/lib/api';
import { useCreateStressLog } from '@/hooks/useWellnessData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

// Zod schema for stress log validation
const stressLogSchema = z.object({
  stress_level: z.number().min(1).max(10),
  triggers: z.string().max(1000).optional(),
  notes: z.string().max(1000).optional(),
});

interface StressLogWidgetProps {
  onSubmit?: () => void;
}

function StressLogWidget({ onSubmit }: StressLogWidgetProps) {
  const [stressLevel, setStressLevel] = useState(5);
  const [triggers, setTriggers] = useState('');
  const [notes, setNotes] = useState('');

  const createStressLog = useCreateStressLog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate form data
      const formData = stressLogSchema.parse({
        stress_level: stressLevel,
        triggers: triggers.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];

      const stressData: StressLogCreate = {
        log_date: today,
        stress_level: formData.stress_level,
        triggers: formData.triggers,
        notes: formData.notes,
      };

      await createStressLog.mutateAsync(stressData);

      // Reset form
      setStressLevel(5);
      setTriggers('');
      setNotes('');

      // Notify parent component
      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error('Invalid input. Please check your entries.');
      }
      // Error toast is handled by the mutation hook
    }
  };

  // Get color based on stress level
  const getStressColor = (level: number) => {
    if (level >= 8) return 'text-red-600';
    if (level >= 6) return 'text-orange-600';
    if (level >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStressLabel = (level: number) => {
    if (level >= 8) return 'Very High';
    if (level >= 6) return 'High';
    if (level >= 4) return 'Moderate';
    return 'Low';
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Brain className="h-5 w-5 text-orange-600" />
        <h3 className="text-lg font-medium text-gray-900">Stress Log</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Stress Level Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="stress-level" className="text-sm font-medium text-gray-700">
              Current stress level
            </Label>
            <span className={`text-sm font-semibold ${getStressColor(stressLevel)}`}>
              {getStressLabel(stressLevel)}
            </span>
          </div>
          <div className="space-y-1">
            <Slider
              id="stress-level"
              min={1}
              max={10}
              step={1}
              value={[stressLevel]}
              onValueChange={(value: number[]) => setStressLevel(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Very Low (1)</span>
              <span className={`font-semibold ${getStressColor(stressLevel)}`}>{stressLevel}</span>
              <span>Very High (10)</span>
            </div>
          </div>
        </div>

        {/* Stress Triggers Input */}
        <div className="space-y-2">
          <Label htmlFor="stress-triggers" className="text-sm font-medium text-gray-700">
            Stress triggers (optional)
          </Label>
          <Input
            id="stress-triggers"
            type="text"
            placeholder="e.g., work deadline, traffic, etc."
            value={triggers}
            onChange={(e) => setTriggers(e.target.value)}
            maxLength={1000}
            className="w-full"
          />
        </div>

        {/* Notes Input */}
        <div className="space-y-2">
          <Label htmlFor="stress-notes" className="text-sm font-medium text-gray-700">
            Notes (optional)
          </Label>
          <Input
            id="stress-notes"
            type="text"
            placeholder="Additional details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={1000}
            className="w-full"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={createStressLog.isPending}
          className="w-full bg-orange-600 text-white hover:bg-orange-700"
        >
          {createStressLog.isPending ? 'Logging...' : 'Log Stress'}
        </Button>
      </form>
    </div>
  );
}

export default StressLogWidget;
