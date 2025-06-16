
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Matching from '@/components/quiz/Matching';
import { Question } from '@/features/quiz/types';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

type MatchingActivityData = {
    id: string;
    description: string | null;
    [key: string]: any;
};

const fetchMatchingActivity = async (id: string): Promise<MatchingActivityData> => {
  const response = await fetch(`/api/matching/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch matching activity');
  }
  return response.json();
};

const transformToQuestion = (activity: MatchingActivityData): Question => {
  const pairs = [];
  for (let i = 1; i <= 6; i++) {
    if (activity[`prompt${i}`] && activity[`choice${i}`]) {
      pairs.push({ left: activity[`prompt${i}`], right: activity[`choice${i}`] });
    }
  }
  return {
    id: activity.id,
    question: activity.description || 'Match the corresponding items.',
    type: 'matching' as const,
    pairs: pairs,
  };
};

const MatchingActivityPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: activity, isLoading, error } = useQuery({
    queryKey: ['matchingActivity', id],
    queryFn: () => fetchMatchingActivity(id!),
    enabled: !!id,
  });

  const handleAnswer = (answer: any, isCorrect: boolean) => {
    console.log('Answer submitted', { answer, isCorrect });
    
    // Calculate score details for display
    const totalPairs = Object.keys(answer).length;
    let correctCount = 0;
    
    if (activity) {
      const question = transformToQuestion(activity);
      question.pairs?.forEach(pair => {
        if (answer[pair.left] === pair.right) {
          correctCount++;
        }
      });
    }
    
    const score = totalPairs > 0 ? Math.round((correctCount / totalPairs) * 100) : 0;
    
    toast({
      title: isCorrect ? 'Perfect Match!' : 'Good Effort!',
      description: isCorrect 
        ? 'You matched all items correctly! Great job!' 
        : `You got ${correctCount} out of ${totalPairs} matches correct (${score}%). Keep practicing!`,
      variant: isCorrect ? 'default' : 'destructive',
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-gray-900"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>;
  }

  if (error || !activity) {
    return <div className="flex justify-center items-center h-screen bg-gray-900"><p className="text-red-500">Error loading activity.</p></div>;
  }

  const question = transformToQuestion(activity);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Matching question={question} onAnswer={handleAnswer} />
      </div>
    </div>
  );
};

export default MatchingActivityPage;
