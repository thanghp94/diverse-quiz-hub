import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
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

  // Fetch existing rating for this user and content
  const { data: existingRating } = useQuery<{ rating: string }>({
    queryKey: [`/api/content-ratings/${effectiveStudentId}/${contentId}`],
    enabled: !!effectiveStudentId && !!contentId,
  });

  // Update current rating when existing rating is fetched
  useEffect(() => {
    if (existingRating?.rating && !currentRating) {
      setCurrentRating(existingRating.rating);
    }
  }, [existingRating?.rating, currentRating]);

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
      
      // Invalidate queries to refresh the cache
      queryClient.invalidateQueries({ 
        queryKey: [`/api/content-ratings/${effectiveStudentId}/${contentId}`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/content-ratings/stats/${contentId}`] 
      });
      
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
    return (
      <>
        <Button
          variant={currentRating === 'really_bad' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleRating('really_bad')}
          disabled={isSubmitting}
          className={`flex items-center justify-center w-6 h-6 p-0 ${
            currentRating === 'really_bad' 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'hover:bg-red-50 hover:border-red-300'
          }`}
        >
          <ThumbsDown className="w-3 h-3" />
        </Button>
        
        <Button
          variant={currentRating === 'ok' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleRating('ok')}
          disabled={isSubmitting}
          className={`flex items-center justify-center w-6 h-6 p-0 ${
            currentRating === 'ok' 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'hover:bg-green-50 hover:border-green-300'
          }`}
        >
          <ThumbsUp className="w-3 h-3" />
        </Button>
      </>
    );
  }

  return null;
};