
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import Matching from '@/components/quiz/Matching';
import { Question } from '@/features/quiz/types';
import { MatchingActivityTracker } from '@/components/MatchingActivityTracker';
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
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const trackerRef = useRef<any>(null);

  // Get current user from localStorage (assuming student is logged in)
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = currentUser.id || 'guest_user';

  const { data: activity, isLoading, error } = useQuery({
    queryKey: ['matchingActivity', id],
    queryFn: () => fetchMatchingActivity(id!),
    enabled: !!id,
  });

  const handleAttemptStart = (attemptId: string) => {
    setCurrentAttemptId(attemptId);
    console.log('Attempt started:', attemptId);
  };

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
    
    // Save the attempt with scoring details
    if (trackerRef.current && currentAttemptId) {
      trackerRef.current.completeAttempt(answer, score, 100);
    }
    
    toast({
      title: isCorrect ? 'Perfect Match!' : 'Good Effort!',
      description: isCorrect 
        ? 'You matched all items correctly! Great job!' 
        : `You got ${correctCount} out of ${totalPairs} matches correct (${score}%). Keep practicing!`,
      variant: isCorrect ? 'default' : 'destructive',
    });
  };

  const handleAttemptComplete = (score: number, isCorrect: boolean) => {
    setCurrentAttemptId(null);
    console.log('Attempt completed with score:', score);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-gray-900"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>;
  }

  if (error || !activity) {
    return <div className="flex justify-center items-center h-screen bg-gray-900"><p className="text-red-500">Error loading activity.</p></div>;
  }

  const question = transformToQuestion(activity);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Activity Area */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 text-white rounded-lg p-6">
            <Matching question={question} onAnswer={handleAnswer} />
          </div>
        </div>
        
        {/* Activity Tracker Sidebar */}
        <div className="lg:col-span-1">
          <MatchingActivityTracker
            ref={trackerRef}
            matchingId={id!}
            studentId={studentId}
            onAttemptStart={handleAttemptStart}
            onAttemptComplete={handleAttemptComplete}
          />
        </div>
      </div>
    </div>
  );
};

export default MatchingActivityPage;
