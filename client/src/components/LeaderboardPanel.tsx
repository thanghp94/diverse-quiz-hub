import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface LeaderboardData {
  totalPoints: Array<{
    student_id: string;
    total_points: string;
    full_name: string;
  }>;
  bestStreak: Array<{
    student_id: string;
    longest_streak: number;
    full_name: string;
  }>;
}

export const LeaderboardPanel = () => {
  const [activeTab, setActiveTab] = useState<'points' | 'tries'>('points');
  
  const { data: studentTriesData, isLoading: isLoadingTries } = useQuery({
    queryKey: ['/api/student-tries-leaderboard'],
    queryFn: () => fetch('/api/student-tries-leaderboard').then(res => res.json()),
    refetchInterval: 30000,
  });
  
  const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useQuery<LeaderboardData>({
    queryKey: ['/api/leaderboards'],
    queryFn: () => fetch('/api/leaderboards').then(res => res.json()),
    refetchInterval: 30000,
  });

  const isLoading = isLoadingTries || isLoadingLeaderboard;

  const getCurrentData = () => {
    if (activeTab === 'tries') {
      return studentTriesData || [];
    } else {
      return leaderboardData?.totalPoints || [];
    }
  };

  const getDisplayData = (data: any[]) => {
    if (!data || data.length === 0) return [];
    
    const currentUserId = 'GV0002';
    const top10 = data.slice(0, 10);
    
    const currentUserInTop10 = top10.some(item => item.student_id === currentUserId);
    
    if (!currentUserInTop10) {
      const currentUser = data.find(item => item.student_id === currentUserId);
      if (currentUser) {
        const currentUserRank = data.findIndex(item => item.student_id === currentUserId) + 1;
        return [...top10, { ...currentUser, rank: currentUserRank, isCurrentUser: true }];
      }
    }
    
    return top10;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-yellow-500 text-black";
      case 2: return "bg-gray-300 text-black";
      case 3: return "bg-orange-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const getDisplayValue = (item: any) => {
    return activeTab === 'tries' 
      ? item.total_tries || 0
      : item.total_points || 0;
  };

  const currentData = getCurrentData();
  const displayData = getDisplayData(currentData);

  return (
    <Card className="bg-gray-800/50 border-gray-600 w-80">
      <CardHeader className="pb-2 px-3 pt-3">
        <CardTitle className="text-white flex items-center gap-2 text-sm">
          <Trophy className="h-4 w-4 text-yellow-400" />
          Top Players
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="flex gap-1 mb-3">
          <Button
            variant={activeTab === 'points' ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab('points')}
            className={`flex items-center gap-1 text-xs h-7 ${
              activeTab === 'points'
                ? "bg-blue-600 text-white" 
                : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
            }`}
          >
            <Trophy className="h-3 w-3" />
            Points
          </Button>
          <Button
            variant={activeTab === 'tries' ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab('tries')}
            className={`flex items-center gap-1 text-xs h-7 ${
              activeTab === 'tries'
                ? "bg-blue-600 text-white" 
                : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
            }`}
          >
            <Users className="h-3 w-3" />
            Tries
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 bg-gray-700" />
            ))}
          </div>
        ) : displayData.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-sm">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <p>No data available</p>
          </div>
        ) : (
          <div className="space-y-1">
            {displayData.map((item, index) => {
              const rank = item.rank || index + 1;
              const value = getDisplayValue(item);
              const isCurrentUser = item.isCurrentUser || item.student_id === 'GV0002';
              
              return (
                <div 
                  key={`${item.student_id}-${rank}`}
                  className={`flex items-center justify-between p-2 rounded text-xs transition-all duration-200 ${
                    isCurrentUser
                      ? 'bg-blue-600/30 border border-blue-400/50'
                      : rank <= 3 
                        ? 'bg-yellow-600/20 border border-yellow-400/30' 
                        : 'bg-gray-700/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full font-bold text-xs ${
                      rank === 1 ? 'bg-yellow-500 text-black' :
                      rank === 2 ? 'bg-gray-300 text-black' :
                      rank === 3 ? 'bg-orange-600 text-white' :
                      isCurrentUser ? 'bg-blue-500 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {rank <= 3 ? getRankIcon(rank) : rank}
                    </div>
                    <div>
                      <div className="text-white font-medium truncate max-w-32">
                        {item.full_name || 'Anonymous'}
                      </div>
                    </div>
                  </div>
                  <Badge className={`text-xs h-5 ${getRankBadgeColor(rank)}`}>
                    {value}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardPanel;