import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Flame, Target, Calendar } from 'lucide-react';

export const LeaderboardPanel = () => {
  const { data: leaderboards, isLoading } = useQuery({
    queryKey: ['/api/leaderboards'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Leaderboards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const LeaderboardList = ({ 
    data, 
    title, 
    icon, 
    valueKey, 
    valueLabel 
  }: { 
    data: any[], 
    title: string, 
    icon: React.ReactNode, 
    valueKey: string, 
    valueLabel: string 
  }) => (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {data?.length > 0 ? (
        <div className="space-y-2">
          {data.slice(0, 10).map((entry, index) => (
            <div 
              key={entry.student_id} 
              className={`flex items-center justify-between p-3 rounded-lg ${
                index === 0 ? 'bg-yellow-50 border-yellow-200 border' :
                index === 1 ? 'bg-gray-50 border-gray-200 border' :
                index === 2 ? 'bg-orange-50 border-orange-200 border' :
                'bg-white border border-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-500 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </span>
                <span className="font-medium">
                  {entry.full_name || `Student ${entry.student_id.slice(0, 8)}`}
                </span>
              </div>
              <span className="font-bold text-sm">
                {entry[valueKey]} {valueLabel}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No data available</p>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Leaderboards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="points" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="points" className="text-xs">Total Points</TabsTrigger>
            <TabsTrigger value="streak" className="text-xs">Best Streak</TabsTrigger>
            <TabsTrigger value="today" className="text-xs">Today</TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs">This Week</TabsTrigger>
          </TabsList>
          
          <TabsContent value="points" className="mt-4">
            <LeaderboardList
              data={(leaderboards as any)?.totalPoints || []}
              title="Total Points"
              icon={<Trophy className="w-4 h-4 text-yellow-500" />}
              valueKey="total_points"
              valueLabel="pts"
            />
          </TabsContent>
          
          <TabsContent value="streak" className="mt-4">
            <LeaderboardList
              data={(leaderboards as any)?.bestStreak || []}
              title="Best Streak"
              icon={<Flame className="w-4 h-4 text-orange-500" />}
              valueKey="longest_streak"
              valueLabel="days"
            />
          </TabsContent>
          
          <TabsContent value="today" className="mt-4">
            <LeaderboardList
              data={(leaderboards as any)?.todayQuizzes || []}
              title="Most Active Today"
              icon={<Target className="w-4 h-4 text-blue-500" />}
              valueKey="today_count"
              valueLabel="activities"
            />
          </TabsContent>
          
          <TabsContent value="weekly" className="mt-4">
            <LeaderboardList
              data={(leaderboards as any)?.weeklyQuizzes || []}
              title="Most Active This Week"
              icon={<Calendar className="w-4 h-4 text-green-500" />}
              valueKey="weekly_count"
              valueLabel="activities"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};