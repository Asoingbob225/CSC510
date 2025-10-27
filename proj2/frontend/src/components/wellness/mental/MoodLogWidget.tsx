import { useState } from 'react';
import { Smile } from 'lucide-react';
import { z } from 'zod';
import { wellnessApi, type MoodLogCreate } from '@/lib/api';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate form data
      const formData = moodLogSchema.parse({
        mood_score: moodScore,
        notes: notes.trim() || undefined,
      });

      setIsSubmitting(true);

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];

      const moodData: MoodLogCreate = {
        log_date: today,
        mood_score: formData.mood_score,
        notes: formData.notes,
      };

      await wellnessApi.createMoodLog(moodData);

      toast.success('Mood logged successfully! 😊');

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
      } else {
        console.error('Error logging mood:', error);
        toast.error('Failed to log mood. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Smile className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Mood Log</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mood Score Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="mood-score" className="text-sm font-medium text-gray-700">
              How are you feeling today?
            </Label>
            <span className="text-2xl">{getMoodEmoji(moodScore)}</span>
          </div>
          <div className="space-y-1">
            <Slider
              id="mood-score"
              min={1}
              max={10}
              step={1}
              value={[moodScore]}
              onValueChange={(value) => setMoodScore(value[0])}
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

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white hover:bg-blue-700"
        >
          {isSubmitting ? 'Logging...' : 'Log Mood'}
        </Button>
      </form>
    </div>
  );
}

export default MoodLogWidget;
