import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { Loader2, Target } from 'lucide-react';
import SharedNav from '@/components/SharedNav';

type MatchingActivity = {
  id: string;
  type: string | null;
  subject: string | null;
  topic: string | null;
  description: string | null;
};

const fetchMatchingActivities = async () => {
  const response = await fetch('/api/matching');
  if (!response.ok) {
    throw new Error('Failed to fetch matching activities');
  }
  return response.json() as Promise<MatchingActivity[]>;
};

const MatchingListPage = () => {
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['matchingActivities'],
    queryFn: fetchMatchingActivities
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white">
        <p className="text-red-500">Error fetching matching activities: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto p-4 md:p-8">
            <SharedNav />
            <h1 className="text-4xl font-bold mb-8 text-center">Matching Activities</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities?.map((activity) => (
                <Link to={`/matching/${activity.id}`} key={activity.id} className="block">
                    <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-4 text-white">
                        <div className="bg-blue-500/20 p-3 rounded-lg border-2 border-blue-400/30">
                            <Target className="h-6 w-6 text-blue-300" />
                        </div>
                        <span className="text-xl font-semibold">{activity.topic || activity.subject || 'Matching Activity'}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-300 line-clamp-2">{activity.description || 'No description available.'}</p>
                    </CardContent>
                    </Card>
                </Link>
                ))}
            </div>
        </div>
    </div>
  );
};

export default MatchingListPage;
