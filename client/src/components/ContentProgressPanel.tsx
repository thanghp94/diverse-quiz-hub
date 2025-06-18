import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BarChart3, CheckCircle, Circle, Star } from "lucide-react";

interface ContentProgress {
  id: string;
  topicid: string;
  topic: string;
  title: string;
  difficulty_rating: 'easy' | 'normal' | 'hard' | null;
  question_count: number;
  completed_at: string;
  parentid: string | null;
}

export const ContentProgressPanel = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'easy' | 'normal' | 'hard'>('all');
  
  // Fetch content ratings for current user
  const { data: progressData, isLoading } = useQuery({
    queryKey: ['/api/content-progress', 'GV0002'],
    queryFn: async () => {
      const response = await fetch('/api/content-progress/GV0002');
      if (!response.ok) throw new Error('Failed to fetch content progress');
      return response.json();
    },
    refetchInterval: 30000,
  });

  const getFilteredData = () => {
    if (!progressData) return [];
    if (activeFilter === 'all') return progressData;
    return progressData.filter((item: ContentProgress) => item.difficulty_rating === activeFilter);
  };

  const getDifficultyColor = (rating: string | null) => {
    switch (rating) {
      case 'easy': return 'bg-green-600 text-white';
      case 'normal': return 'bg-yellow-600 text-white';
      case 'hard': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getDifficultyIcon = (rating: string | null) => {
    switch (rating) {
      case 'easy': return <CheckCircle className="h-3 w-3" />;
      case 'normal': return <Circle className="h-3 w-3" />;
      case 'hard': return <Star className="h-3 w-3" />;
      default: return <Circle className="h-3 w-3" />;
    }
  };

  const getStats = () => {
    if (!progressData) return { total: 0, easy: 0, normal: 0, hard: 0, unrated: 0 };
    
    return {
      total: progressData.length,
      easy: progressData.filter((item: ContentProgress) => item.difficulty_rating === 'easy').length,
      normal: progressData.filter((item: ContentProgress) => item.difficulty_rating === 'normal').length,
      hard: progressData.filter((item: ContentProgress) => item.difficulty_rating === 'hard').length,
      unrated: progressData.filter((item: ContentProgress) => item.difficulty_rating === null).length,
    };
  };

  const filteredData = getFilteredData();
  const stats = getStats();

  // Group by topic
  const groupedData = filteredData.reduce((acc: any, item: ContentProgress) => {
    const topicKey = item.topic || 'Other';
    if (!acc[topicKey]) {
      acc[topicKey] = [];
    }
    acc[topicKey].push(item);
    return acc;
  }, {});

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-blue-600/12 border-blue-400/30 text-white/60 hover:bg-blue-600/30 hover:text-white transition-all duration-300 group"
          title="Content Progress"
        >
          <BarChart3 className="h-4 w-4" />
          <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">Content Progress</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Your Content Progress
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Card className="bg-gray-800 border-gray-700 p-2">
              <div className="text-center">
                <div className="text-xl font-bold text-white">{stats.total}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
            </Card>
            <Card className="bg-gray-800 border-gray-700 p-2">
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">{stats.easy}</div>
                <div className="text-xs text-gray-400">Easy</div>
              </div>
            </Card>
            <Card className="bg-gray-800 border-gray-700 p-2">
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-400">{stats.normal}</div>
                <div className="text-xs text-gray-400">Normal</div>
              </div>
            </Card>
            <Card className="bg-gray-800 border-gray-700 p-2">
              <div className="text-center">
                <div className="text-xl font-bold text-red-400">{stats.hard}</div>
                <div className="text-xs text-gray-400">Hard</div>
              </div>
            </Card>
            <Card className="bg-gray-800 border-gray-700 p-2">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-400">{stats.unrated}</div>
                <div className="text-xs text-gray-400">Unrated</div>
              </div>
            </Card>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'All', count: stats.total },
              { key: 'easy', label: 'Easy', count: stats.easy },
              { key: 'normal', label: 'Normal', count: stats.normal },
              { key: 'hard', label: 'Hard', count: stats.hard }
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={activeFilter === filter.key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter.key as any)}
                className={`flex items-center gap-1 text-xs ${
                  activeFilter === filter.key 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                }`}
              >
                {filter.label} ({filter.count})
              </Button>
            ))}
          </div>

          {/* Content List */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 bg-gray-700" />
              ))}
            </div>
          ) : Object.keys(groupedData).length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-600" />
              <p>No content progress found</p>
              <p className="text-sm">Start rating content difficulty to see your progress here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedData).map(([topic, items]: [string, any]) => (
                <Card key={topic} className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm font-medium">
                      {topic}
                      <Badge className="ml-2 bg-gray-600 text-white text-xs">
                        {items.length} items
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {items.map((item: ContentProgress) => (
                        <div 
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded bg-gray-700/50 text-sm"
                        >
                          <div className="flex-1">
                            <div className="text-white font-medium truncate">
                              {item.title || 'Untitled Content'}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {item.question_count} questions • Completed: {new Date(item.completed_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs h-6 flex items-center gap-1 ${getDifficultyColor(item.difficulty_rating)}`}>
                              {getDifficultyIcon(item.difficulty_rating)}
                              {item.difficulty_rating || 'unrated'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentProgressPanel;