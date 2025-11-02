import { useState } from 'react';
import { Smile } from 'lucide-react';
import { z } from 'zod';
import { type MoodLogCreate } from '@/lib/api';
import { getCurrentTimestamp } from '@/lib/dateUtils';
import { useCreateMoodLog } from '@/hooks/useWellnessData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

// Zod schema for mood log validation
const moodLogSchema = z.object({
  mood_score: z.number().min(1).max(10),
  notes: z.string().max(1000).optional(),
});

interface MoodLogWidgetProps {
  onSubmit?: () => void;
}

function MoodLogWidget({ onSubmit }: MoodLogWidgetProps) {
  const [moodScore, setMoodScore] = useState(5);
  const [notes, setNotes] = useState('');

  const createMoodLog = useCreateMoodLog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate form data
      const formData = moodLogSchema.parse({
        mood_score: moodScore,
        notes: notes.trim() || undefined,
      });

      // Get current timestamp with timezone
      const occurredAt = getCurrentTimestamp();

      const moodData: MoodLogCreate = {
        occurred_at: occurredAt,
        mood_score: formData.mood_score,
        notes: formData.notes,
      };

      await createMoodLog.mutateAsync(moodData);

      // Reset form
      setMoodScore(5);
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

  // Get emoji based on mood score
  const getMoodEmoji = (score: number) => {
    if (score >= 9) return '🤩';
    if (score >= 7) return '😊';
    if (score >= 5) return '😐';
    if (score >= 3) return '😕';
    return '😢';
  };

  // Get mood label based on mood score
  const getMoodLabel = (score: number) => {
    if (score >= 9) return 'Very Happy';
    if (score >= 7) return 'Happy';
    if (score >= 5) return 'Neutral';
    if (score >= 3) return 'Sad';
    return 'Very Sad';
  };

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Smile className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Mood Log</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col space-y-4">
        {/* Mood Score Slider */}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="mood-score" className="text-sm font-medium text-gray-700">
              How are you feeling today?
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getMoodEmoji(moodScore)}</span>
              <span className="text-sm font-medium text-gray-700">{getMoodLabel(moodScore)}</span>
            </div>
          </div>
          <div className="space-y-1">
            <Slider
              id="mood-score"
              min={1}
              max={10}
              step={1}
              value={[moodScore]}
              onValueChange={(value: number[]) => setMoodScore(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Very Low (1)</span>
              <span className="font-semibold text-blue-600">{moodScore}</span>
              <span>Very High (10)</span>
            </div>
          </div>
        </div>

        {/* Notes Input */}
        <div className="space-y-2">
          <Label htmlFor="mood-notes" className="text-sm font-medium text-gray-700">
            Notes (optional)
          </Label>
          <Input
            id="mood-notes"
            type="text"
            placeholder="What's on your mind?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={1000}
            className="w-full"
          />
        </div>

        <div className="flex-1"></div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={createMoodLog.isPending}
          className="w-full bg-blue-600 text-white hover:bg-blue-700"
        >
          {createMoodLog.isPending ? 'Logging...' : 'Log Mood'}
        </Button>
      </form>
    </div>
  );
}

export default MoodLogWidget;
