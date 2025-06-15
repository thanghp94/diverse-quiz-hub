
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Matching from '@/components/quiz/Matching';
import { Question } from '@/types/quiz';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

type MatchingActivityData = {
    id: string;
    description: string | null;
    [key: string]: any;
};

const fetchMatchingActivity = async (id: string): Promise<MatchingActivityData> => {
  const { data, error } = await supabase.from('matching').select('*').eq('id', id).single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
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
    type: 'matching',
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
    toast({
      title: isCorrect ? 'Congratulations!' : 'Almost there!',
      description: isCorrect ? 'You matched all items correctly!' : 'Some matches were incorrect. You can try again.',
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
