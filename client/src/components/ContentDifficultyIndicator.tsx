import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { ThumbsDown, Minus, ThumbsUp } from "lucide-react";

interface ContentDifficultyIndicatorProps {
  contentId: string;
  className?: string;
}

export const ContentDifficultyIndicator = ({ contentId, className = "" }: ContentDifficultyIndicatorProps) => {
  const { data: stats } = useQuery({
    queryKey: ['/content-ratings/stats', contentId],
    enabled: !!contentId,
  });

  if (!stats || (stats.easy === 0 && stats.normal === 0 && stats.hard === 0)) {
    return null;
  }

  const total = stats.easy + stats.normal + stats.hard;
  const predominantDifficulty = 
    stats.hard > stats.normal && stats.hard > stats.easy ? 'hard' :
    stats.easy > stats.normal && stats.easy > stats.hard ? 'easy' : 'normal';

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'hard':
        return {
          icon: <ThumbsDown className="w-3 h-3" />,
          label: 'Really Hard',
          className: 'bg-red-100 text-red-800 border-red-200',
          bgColor: 'bg-red-500/20',
          textColor: 'text-red-200'
        };
      case 'easy':
        return {
          icon: <ThumbsUp className="w-3 h-3" />,
          label: 'Easy',
          className: 'bg-green-100 text-green-800 border-green-200',
          bgColor: 'bg-green-500/20',
          textColor: 'text-green-200'
        };
      default:
        return {
          icon: <Minus className="w-3 h-3" />,
          label: 'Normal',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          bgColor: 'bg-yellow-500/20',
          textColor: 'text-yellow-200'
        };
    }
  };

  const config = getDifficultyConfig(predominantDifficulty);

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} flex items-center gap-1 text-xs ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
      <span className="text-xs opacity-75">({total})</span>
    </Badge>
  );
};

// For dark backgrounds (like gradient content displays)
export const ContentDifficultyIndicatorDark = ({ contentId, className = "" }: ContentDifficultyIndicatorProps) => {
  const { data: stats } = useQuery({
    queryKey: ['/content-ratings/stats', contentId],
    enabled: !!contentId,
  });

  if (!stats || (stats.easy === 0 && stats.normal === 0 && stats.hard === 0)) {
    return null;
  }

  const total = stats.easy + stats.normal + stats.hard;
  const predominantDifficulty = 
    stats.hard > stats.normal && stats.hard > stats.easy ? 'hard' :
    stats.easy > stats.normal && stats.easy > stats.hard ? 'easy' : 'normal';

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'hard':
        return {
          icon: <ThumbsDown className="w-3 h-3" />,
          label: 'Really Hard',
          className: 'bg-red-500/20 text-red-200 border-red-400/30'
        };
      case 'easy':
        return {
          icon: <ThumbsUp className="w-3 h-3" />,
          label: 'Easy',
          className: 'bg-green-500/20 text-green-200 border-green-400/30'
        };
      default:
        return {
          icon: <Minus className="w-3 h-3" />,
          label: 'Normal',
          className: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30'
        };
    }
  };

  const config = getDifficultyConfig(predominantDifficulty);

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} flex items-center gap-1 text-xs ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
      <span className="text-xs opacity-75">({total})</span>
    </Badge>
  );
};