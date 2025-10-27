import { useState } from 'react';
import { Moon } from 'lucide-react';
import { z } from 'zod';
import { wellnessApi, type SleepLogCreate } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

// Zod schema for sleep log validation
const sleepLogSchema = z.object({
  duration_hours: z.number().min(0).max(24),
  quality_score: z.number().min(1).max(10),
  notes: z.string().max(1000).optional(),
});

interface SleepLogWidgetProps {
  onSubmit?: () => void;
}

function SleepLogWidget({ onSubmit }: SleepLogWidgetProps) {
  const [durationHours, setDurationHours] = useState(7.5);
  const [qualityScore, setQualityScore] = useState(7);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate form data
      const formData = sleepLogSchema.parse({
        duration_hours: durationHours,
        quality_score: qualityScore,
        notes: notes.trim() || undefined,
      });

      setIsSubmitting(true);

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];

      const sleepData: SleepLogCreate = {
        log_date: today,
        duration_hours: formData.duration_hours,
        quality_score: formData.quality_score,
        notes: formData.notes,
      };

      await wellnessApi.createSleepLog(sleepData);

      toast.success('Sleep logged successfully! 💤');

      // Reset form
      setDurationHours(7.5);
      setQualityScore(7);
      setNotes('');

      // Notify parent component
      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error('Invalid input. Please check your entries.');
      } else {
        console.error('Error logging sleep:', error);
        toast.error('Failed to log sleep. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get quality description
  const getQualityLabel = (score: number) => {
    if (score >= 9) return 'Excellent';
    if (score >= 7) return 'Good';
    if (score >= 5) return 'Fair';
    if (score >= 3) return 'Poor';
    return 'Very Poor';
  };

  const getQualityColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Moon className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-medium text-gray-900">Sleep Log</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sleep Duration Input */}
        <div className="space-y-2">
          <Label htmlFor="sleep-duration" className="text-sm font-medium text-gray-700">
            Sleep duration (hours)
          </Label>
          <Input
            id="sleep-duration"
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={durationHours}
            onChange={(e) => setDurationHours(parseFloat(e.target.value) || 0)}
            className="w-full"
          />
          <p className="text-xs text-gray-500">Recommended: 7-9 hours per night</p>
        </div>

        {/* Sleep Quality Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="sleep-quality" className="text-sm font-medium text-gray-700">
              Sleep quality
            </Label>
            <span className={`text-sm font-semibold ${getQualityColor(qualityScore)}`}>
              {getQualityLabel(qualityScore)}
            </span>
          </div>
          <div className="space-y-1">
            <Slider
              id="sleep-quality"
              min={1}
              max={10}
              step={1}
              value={[qualityScore]}
              onValueChange={(value) => setQualityScore(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Very Poor (1)</span>
              <span className={`font-semibold ${getQualityColor(qualityScore)}`}>
                {qualityScore}
              </span>
              <span>Excellent (10)</span>
            </div>
          </div>
        </div>

        {/* Notes Input */}
        <div className="space-y-2">
          <Label htmlFor="sleep-notes" className="text-sm font-medium text-gray-700">
            Notes (optional)
          </Label>
          <Input
            id="sleep-notes"
            type="text"
            placeholder="How did you sleep?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={1000}
            className="w-full"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-600 text-white hover:bg-purple-700"
        >
          {isSubmitting ? 'Logging...' : 'Log Sleep'}
        </Button>
      </form>
    </div>
  );
}

export default SleepLogWidget;
