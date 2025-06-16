import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useState, useRef, useEffect } from 'react';
import Matching from '@/components/quiz/Matching';
import { Question } from '@/features/quiz/types';
import { MatchingActivityTracker, type MatchingActivityTrackerRef } from '@/components/MatchingActivityTracker';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/Header';

type MatchingActivityData = {
    id: string;
    type: string | null;
    description: string | null;
    [key: string]: any;
};

interface ContentData {
  id: string;
  title: string;
  short_description: string | null;
  imageid: string | null;
}

interface ImageData {
  id: string;
  imagelink: string | null;
  contentid: string | null;
}

const fetchMatchingActivity = async (id: string): Promise<MatchingActivityData> => {
  const response = await fetch(`/api/matching/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch matching activity');
  }
  return response.json();
};

const fetchContent = async (): Promise<ContentData[]> => {
  const response = await fetch('/api/content');
  if (!response.ok) {
    throw new Error('Failed to fetch content');
  }
  return response.json();
};

const fetchImages = async (): Promise<ImageData[]> => {
  const response = await fetch('/api/images');
  if (!response.ok) {
    throw new Error('Failed to fetch images');
  }
  return response.json();
};

const transformToQuestions = async (activity: MatchingActivityData): Promise<Question[]> => {
  const questions: Question[] = [];
  const types = activity.type?.split(', ') || [];
  
  if (types.length === 0) {
    // Fallback to original behavior if no type specified
    const pairs = [];
    for (let i = 1; i <= 6; i++) {
      if (activity[`prompt${i}`] && activity[`choice${i}`]) {
        pairs.push({ left: activity[`prompt${i}`], right: activity[`choice${i}`] });
      }
    }
    return [{
      id: activity.id,
      question: activity.description || 'Match the corresponding items.',
      type: 'matching' as const,
      pairs: pairs,
    }];
  }

  const [content, images] = await Promise.all([fetchContent(), fetchImages()]);
  
  for (const type of types) {
    if (type === 'picture-title') {
      const pairs = [];
      
      // Get content IDs from prompt1-6 fields
      for (let i = 1; i <= 6; i++) {
        const contentId = activity[`prompt${i}`];
        if (contentId) {
          const contentItem = content.find(c => c.id === contentId);
          if (contentItem) {
            // Find image for this content
            const image = images.find(img => 
              img.contentid === contentId || 
              img.id === contentItem.imageid
            );
            
            if (image && image.imagelink && contentItem.title) {
              pairs.push({ 
                left: image.imagelink, 
                right: contentItem.title,
                leftType: 'image'
              });
            }
          }
        }
      }
      
      if (pairs.length > 0) {
        questions.push({
          id: `${activity.id}-picture-title`,
          question: 'Match the images with their corresponding titles.',
          type: 'matching' as const,
          pairs: pairs,
        });
      }
    }
    
    if (type === 'title-description') {
      const pairs = [];
      
      // Get content IDs from prompt1-6 fields
      for (let i = 1; i <= 6; i++) {
        const contentId = activity[`prompt${i}`];
        if (contentId) {
          const contentItem = content.find(c => c.id === contentId);
          if (contentItem && contentItem.title && contentItem.short_description) {
            pairs.push({ 
              left: contentItem.title, 
              right: contentItem.short_description 
            });
          }
        }
      }
      
      if (pairs.length > 0) {
        questions.push({
          id: `${activity.id}-title-description`,
          question: 'Match the titles with their descriptions.',
          type: 'matching' as const,
          pairs: pairs,
        });
      }
    }
  }
  
  return questions;
};

const MatchingActivityPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const trackerRef = useRef<MatchingActivityTrackerRef>(null);

  // Get current user from localStorage (assuming student is logged in)
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = currentUser.id || 'guest_user';

  const { data: activity, isLoading, error } = useQuery({
    queryKey: ['matchingActivity', id],
    queryFn: () => fetchMatchingActivity(id!),
    enabled: !!id,
  });

  // Transform activity to questions when activity data changes
  useEffect(() => {
    if (activity) {
      setIsLoadingQuestions(true);
      transformToQuestions(activity)
        .then(generatedQuestions => {
          setQuestions(generatedQuestions);
          setCurrentQuestionIndex(0);
        })
        .catch(error => {
          console.error('Error generating questions:', error);
          toast({
            title: 'Error',
            description: 'Failed to load matching questions',
            variant: 'destructive',
          });
        })
        .finally(() => {
          setIsLoadingQuestions(false);
        });
    }
  }, [activity, toast]);

  const handleAttemptStart = (attemptId: string) => {
    setCurrentAttemptId(attemptId);
    console.log('Attempt started:', attemptId);
  };

  const handleAnswer = (answer: any, isCorrect: boolean) => {
    console.log('Answer submitted', { answer, isCorrect });
    
    // Calculate score details for display
    const currentQuestion = questions[currentQuestionIndex];
    const totalPairs = currentQuestion?.pairs?.length || Object.keys(answer).length;
    let correctCount = 0;
    
    if (currentQuestion?.pairs) {
      currentQuestion.pairs.forEach((pair: any) => {
        if (answer[pair.left] === pair.right) {
          correctCount++;
        }
      });
    }
    
    const score = totalPairs > 0 ? Math.round((correctCount / totalPairs) * 100) : 0;
    
    // Check if there are more questions to complete
    const isLastQuestion = currentQuestionIndex >= questions.length - 1;
    
    if (isLastQuestion) {
      // Save the attempt with final scoring details
      if (trackerRef.current && currentAttemptId) {
        trackerRef.current.completeAttempt(answer, score, 100);
      }
      
      toast({
        title: isCorrect ? 'Perfect Match!' : 'Activity Complete!',
        description: isCorrect 
          ? 'You matched all items correctly! Great job!' 
          : `You got ${correctCount} out of ${totalPairs} matches correct (${score}%). Keep practicing!`,
        variant: isCorrect ? 'default' : 'destructive',
      });
    } else {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
      toast({
        title: 'Question Complete!',
        description: `You got ${correctCount} out of ${totalPairs} matches correct. Moving to the next question.`,
      });
    }
  };

  const handleAttemptComplete = (score: number, isCorrect: boolean) => {
    setCurrentAttemptId(null);
    console.log('Attempt completed with score:', score);
  };

  if (isLoading || isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <Header />
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <Header />
        <div className="flex justify-center items-center h-96">
          <p className="text-red-500">Error loading activity.</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <Header />
        <div className="flex justify-center items-center h-96">
          <p className="text-yellow-500">No matching questions found for this activity.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isMultiQuestion = questions.length > 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <Header />
      <div className="p-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Activity Area */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 text-white rounded-lg p-6">
              {isMultiQuestion && (
                <div className="mb-4 text-center">
                  <div className="text-sm text-gray-400">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </div>
                  <div className="text-xs text-gray-500">
                    {activity.type}
                  </div>
                </div>
              )}
              <Matching question={currentQuestion} onAnswer={handleAnswer} />
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
    </div>
  );
};

export default MatchingActivityPage;