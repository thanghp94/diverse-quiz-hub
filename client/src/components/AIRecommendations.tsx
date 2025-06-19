
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sparkles, TrendingUp, Clock, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface ContentRecommendation {
  id: string;
  title: string;
  reason: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  confidence: number;
}

interface AIRecommendationsProps {
  studentId?: string;
  onSelectContent?: (contentId: string) => void;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  studentId = 'default',
  onSelectContent,
}) => {
  // This would typically call your AI recommendation API
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['ai-recommendations', studentId],
    queryFn: async () => {
      // Mock data for now - replace with actual AI API call
      return [
        {
          id: '1',
          title: 'Advanced Calculus Concepts',
          reason: 'Based on your strong performance in basic calculus',
          difficulty: 'hard' as const,
          estimatedTime: 45,
          confidence: 0.92,
        },
        {
          id: '2',
          title: 'Physics Applications',
          reason: 'Complements your recent math studies',
          difficulty: 'medium' as const,
          estimatedTime: 30,
          confidence: 0.85,
        },
        {
          id: '3',
          title: 'Problem Solving Strategies',
          reason: 'Identified as an area for improvement',
          difficulty: 'easy' as const,
          estimatedTime: 20,
          confidence: 0.78,
        },
      ] as ContentRecommendation[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.9) return <Star className="w-4 h-4 text-yellow-500" />;
    if (confidence >= 0.8) return <TrendingUp className="w-4 h-4 text-blue-500" />;
    return <Sparkles className="w-4 h-4 text-purple-500" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI-Powered Recommendations
        </CardTitle>
        <p className="text-sm text-gray-600">
          Personalized content suggestions based on your learning progress
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations?.map((rec) => (
            <div
              key={rec.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {rec.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {rec.reason}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {getConfidenceIcon(rec.confidence)}
                  <span className="text-xs text-gray-500">
                    {Math.round(rec.confidence * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(rec.difficulty)}>
                    {rec.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    {rec.estimatedTime}m
                  </div>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => onSelectContent?.(rec.id)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Start Learning
                </Button>
              </div>
            </div>
          ))}
          
          {(!recommendations || recommendations.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No recommendations available yet.</p>
              <p className="text-sm">Complete more content to get personalized suggestions!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIRecommendations;
