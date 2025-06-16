import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  quiz_count: number;
}

export const QuizLeaderboard = () => {
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/quiz-leaderboard'],
    queryFn: async () => {
      const response = await fetch('/api/quiz-leaderboard');
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return response.json();
    }
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Quiz Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Quiz Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard?.map((entry, index) => (
            <div
              key={entry.user_id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {getRankIcon(index + 1)}
                <div>
                  <div className="font-medium">
                    {entry.full_name || entry.user_id}
                  </div>
                  {entry.user_id === 'GV0002' && (
                    <div className="text-xs text-blue-600 font-medium">Teacher</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {entry.quiz_count}
                </div>
                <div className="text-xs text-gray-500">
                  quiz{entry.quiz_count !== 1 ? 'zes' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};