import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award, Star, TrendingUp, Calendar, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface LeaderboardData {
  bestStreak: Array<{
    student_id: string;
    longest_streak: number;
    full_name: string;
  }>;
  todayQuizzes: Array<{
    student_id: string;
    today_count: number;
    full_name: string;
  }>;
  weeklyQuizzes: Array<{
    student_id: string;
    weekly_count: number;
    full_name: string;
  }>;
}

export const LeaderboardPanel = () => {
  const [activeTab, setActiveTab] = useState<'tries' | 'streak' | 'today' | 'weekly'>('tries');
  
  const { data: studentTriesData, isLoading: isLoadingTries } = useQuery({
    queryKey: ['/api/student-tries-leaderboard'],
    refetchInterval: 30000,
  });
  
  const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useQuery<LeaderboardData>({
    queryKey: ['/api/leaderboards'],
    refetchInterval: 30000,
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-300" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-500" />;
      default:
        return <span className="text-sm font-bold text-white/70">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return "bg-gradient-to-r from-yellow-400 to-orange-500 text-black";
    if (rank <= 5) return "bg-gradient-to-r from-blue-400 to-blue-600 text-white";
    return "bg-white/10 text-white";
  };

  const getCurrentLeaderboard = () => {
    if (activeTab === 'tries') {
      return Array.isArray(studentTriesData) ? studentTriesData : [];
    }
    
    if (!leaderboardData) return [];
    
    switch (activeTab) {
      case 'streak':
        return Array.isArray(leaderboardData.bestStreak) ? leaderboardData.bestStreak : [];
      case 'today':
        return Array.isArray(leaderboardData.todayQuizzes) ? leaderboardData.todayQuizzes : [];
      case 'weekly':
        return Array.isArray(leaderboardData.weeklyQuizzes) ? leaderboardData.weeklyQuizzes : [];
      default:
        return [];
    }
  };

  const isLoading = activeTab === 'tries' ? isLoadingTries : isLoadingLeaderboard;

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'streak':
        return <Zap className="h-4 w-4" />;
      case 'today':
        return <Calendar className="h-4 w-4" />;
      case 'weekly':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return null;
    }
  };



  const getValue = (item: any, tab: string) => {
    switch (tab) {
      case 'tries':
        return item.total_tries || 0;
      case 'streak':
        return item.longest_streak || 0;
      case 'today':
        return item.today_count || 0;
      case 'weekly':
        return item.weekly_count || 0;
      default:
        return 0;
    }
  };

  const getValueLabel = (tab: string) => {
    switch (tab) {
      case 'tries':
        return 'tries';
      case 'streak':
        return 'streak';
      case 'today':
        return 'today';
      case 'weekly':
        return 'this week';
      default:
        return '';
    }
  };



  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
        >
          <Trophy className="h-4 w-4 mr-2" />
          Leaderboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-400" />
            Quiz Leaderboard
          </DialogTitle>

        </DialogHeader>
        
        <div className="space-y-4">
          {/* Tab Selection */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'tries', label: 'Student Tries', icon: 'tries' },
              { key: 'today', label: 'Today', icon: 'today' },
              { key: 'weekly', label: 'Weekly', icon: 'weekly' },
              { key: 'streak', label: 'Best Streak', icon: 'streak' }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 ${
                  activeTab === tab.key 
                    ? "bg-purple-600 text-white" 
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                }`}
              >
                {getTabIcon(tab.key)}
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Leaderboard Content */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg">
                {activeTab === 'tries' && 'Student Quiz Attempts'}
                {activeTab === 'streak' && 'Best Streaks'}
                {activeTab === 'today' && "Today's Quiz Champions"}
                {activeTab === 'weekly' && 'Weekly Quiz Leaders'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-white/60">Loading leaderboard...</div>
                </div>
              ) : !Array.isArray(getCurrentLeaderboard()) || getCurrentLeaderboard().length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-white/60">No data available</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {getCurrentLeaderboard().slice(0, 10).map((item: any, index: number) => {
                    const rank = index + 1;
                    const value = getValue(item, activeTab);
                    
                    return (
                      <div
                        key={`${activeTab}-${item.student_id}-${rank}`}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          rank <= 3 ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20" : "bg-white/5"
                        } border border-white/10`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(rank)}
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {item.full_name || item.name || item.student_id || 'Anonymous'}
                            </div>
                            <div className="text-white/60 text-sm">
                              {value} {getValueLabel(activeTab)}
                            </div>
                          </div>
                        </div>
                        <Badge className={getRankBadgeColor(rank)}>
                          {value}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaderboardPanel;