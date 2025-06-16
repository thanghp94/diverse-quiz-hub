import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Target } from 'lucide-react';
import MatchingActivityPopup from './MatchingActivityPopup';

interface MatchingActivityButtonProps {
  matchingId: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const MatchingActivityButton = ({ 
  matchingId, 
  title = 'Start Matching Activity',
  description,
  variant = 'default',
  size = 'default',
  className = ''
}: MatchingActivityButtonProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      <Button
        onClick={handleOpenPopup}
        variant={variant}
        size={size}
        className={`flex items-center gap-2 ${className}`}
      >
        <Target className="h-4 w-4" />
        {title}
        <Play className="h-4 w-4" />
      </Button>
      
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {description}
        </p>
      )}

      <MatchingActivityPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        matchingId={matchingId}
      />
    </>
  );
};

export default MatchingActivityButton;