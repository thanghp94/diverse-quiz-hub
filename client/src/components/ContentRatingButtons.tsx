import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ThumbsDown, Minus, ThumbsUp } from 'lucide-react';

interface ContentRatingButtonsProps {
  contentId: string;
  studentId: string;
  initialRating?: string;
  onRatingChange?: (rating: string) => void;
}

export const ContentRatingButtons = ({ 
  contentId, 
  studentId, 
  initialRating, 
  onRatingChange 
}: ContentRatingButtonsProps) => {
  const [currentRating, setCurrentRating] = useState(initialRating);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRating = async (rating: string) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/content-ratings/${studentId}/${contentId}`, {
        method: 'PUT',
        body: JSON.stringify({ rating }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setCurrentRating(rating);
      onRatingChange?.(rating);
      
      const ratingText = rating === 'really_bad' ? 'Really Hard' : 
                        rating === 'normal' ? 'Normal' : 'Easy';
      
      toast({
        title: "Rating Saved",
        description: `Content marked as ${ratingText}`,
      });
    } catch (error) {
      console.error('Error saving rating:', error);
      toast({
        title: "Error",
        description: "Failed to save rating",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <span className="text-sm text-gray-600 mr-2">Rate difficulty:</span>
      
      <Button
        variant={currentRating === 'really_bad' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleRating('really_bad')}
        disabled={isSubmitting}
        className={`flex items-center gap-1 ${
          currentRating === 'really_bad' 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'hover:bg-red-50 hover:border-red-300'
        }`}
      >
        <ThumbsDown className="w-3 h-3" />
        Really Hard
      </Button>
      
      <Button
        variant={currentRating === 'normal' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleRating('normal')}
        disabled={isSubmitting}
        className={`flex items-center gap-1 ${
          currentRating === 'normal' 
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
            : 'hover:bg-yellow-50 hover:border-yellow-300'
        }`}
      >
        <Minus className="w-3 h-3" />
        Normal
      </Button>
      
      <Button
        variant={currentRating === 'ok' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleRating('ok')}
        disabled={isSubmitting}
        className={`flex items-center gap-1 ${
          currentRating === 'ok' 
            ? 'bg-green-500 hover:bg-green-600 text-white' 
            : 'hover:bg-green-50 hover:border-green-300'
        }`}
      >
        <ThumbsUp className="w-3 h-3" />
        Easy
      </Button>
    </div>
  );
};