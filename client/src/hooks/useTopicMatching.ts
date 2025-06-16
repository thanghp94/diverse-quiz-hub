import { useQuery } from '@tanstack/react-query';

interface MatchingActivity {
  id: string;
  topicid: string | null;
}

const fetchMatchingByTopic = async (topicId: string): Promise<MatchingActivity[]> => {
  const response = await fetch(`/api/matching/topic/${topicId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch matching activities');
  }
  return response.json();
};

export const useTopicMatching = (topicId: string) => {
  const { data: matchingActivities, isLoading, error } = useQuery({
    queryKey: ['matchingByTopic', topicId],
    queryFn: () => fetchMatchingByTopic(topicId),
    enabled: !!topicId,
  });

  const hasMatchingActivities = matchingActivities && matchingActivities.length > 0;

  return {
    matchingActivities,
    hasMatchingActivities,
    isLoading,
    error
  };
};