import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecommendationItem {
  menu_item_id: string;
  score: number;
  explanation: string;
}

interface RecommendationCardProps {
  item: RecommendationItem;
  userId: string;
  onFeedback?: (success: boolean) => void;
}

function RecommendationCard({ item, userId, onFeedback }: RecommendationCardProps) {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (feedbackType: 'like' | 'dislike') => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/recommend/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          menu_item_id: item.menu_item_id,
          feedback_type: feedbackType,
        }),
      });

      if (response.ok) {
        setFeedback(feedbackType);
        onFeedback?.(true);
      } else {
        console.error('Failed to submit feedback');
        onFeedback?.(false);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      onFeedback?.(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Menu Item</span>
          <span className="text-sm font-normal text-muted-foreground">
            Score: {item.score.toFixed(2)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{item.explanation}</p>
        <div className="flex gap-2">
          <Button
            variant={feedback === 'like' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFeedback('like')}
            disabled={isSubmitting || feedback !== null}
            className="flex items-center gap-2"
          >
            <ThumbsUp className="h-4 w-4" />
            Like
          </Button>
          <Button
            variant={feedback === 'dislike' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => handleFeedback('dislike')}
            disabled={isSubmitting || feedback !== null}
            className="flex items-center gap-2"
          >
            <ThumbsDown className="h-4 w-4" />
            Dislike
          </Button>
        </div>
        {feedback && (
          <p className="text-xs text-muted-foreground mt-2">
            Thank you for your feedback!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default RecommendationCard;
