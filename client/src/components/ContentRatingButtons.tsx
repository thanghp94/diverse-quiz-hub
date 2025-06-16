import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ThumbsDown, ThumbsUp } from 'lucide-react';

interface ContentRatingButtonsProps {
  contentId: string;
  studentId?: string;
  initialRating?: string;
  onRatingChange?: (rating: string) => void;
  compact?: boolean;
}

export const ContentRatingButtons = ({ 
  contentId, 
  studentId, 
  initialRating, 
  onRatingChange,
  compact = false 
}: ContentRatingButtonsProps) => {
  const [currentRating, setCurrentRating] = useState(initialRating);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Get studentId from localStorage if not provided
  const effectiveStudentId = studentId || (typeof window !== 'undefined' && localStorage.getItem('currentUser') 
    ? JSON.parse(localStorage.getItem('currentUser')!).id 
    : 'GV0002'); // Default demo student

  const handleRating = async (rating: string) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await apiRequest(`/content-ratings/${effectiveStudentId}/${contentId}`, {
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

  if (compact) {
    return null;
  }

  return null;
};