import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import Matching from '@/components/quiz/Matching';
import { Question } from '@/features/quiz/types';
import { MatchingActivityTracker, type MatchingActivityTrackerRef } from '@/components/MatchingActivityTracker';
import { useToast } from "@/hooks/use-toast";

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

interface MatchingActivityPopupProps {
  isOpen: boolean;
  onClose: () => void;
  matchingId: string;
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
  
  // Debug logging for content ID verification
  console.log('🔍 Activity data:', activity);
  console.log('📋 Content IDs from prompts:', {
    prompt1: activity.prompt1,
    prompt2: activity.prompt2,
    prompt3: activity.prompt3,
    prompt4: activity.prompt4,
    prompt5: activity.prompt5,
    prompt6: activity.prompt6,
  });
  
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
  console.log('📚 Total content items loaded:', content.length);
  console.log('🖼️ Total images loaded:', images.length);
  
  for (const type of types) {
    if (type === 'picture-title') {
      const pairs = [];
      
      // Get content IDs from prompt1-6 fields
      for (let i = 1; i <= 6; i++) {
        const contentId = activity[`prompt${i}`];
        if (contentId) {
          console.log(`🔗 Processing prompt${i} with contentId:`, contentId);
          
          const contentItem = content.find(c => c.id === contentId);
          if (contentItem) {
            console.log('✅ Found content:', { 
              id: contentItem.id, 
              title: contentItem.title, 
              imageid: contentItem.imageid,
              hasTitle: !!contentItem.title,
              titleLength: contentItem.title?.length || 0
            });
            
            // Find image for this content
            const image = images.find(img => 
              img.contentid === contentId || 
              img.id === contentItem.imageid
            );
            
            if (image && image.imagelink) {
              console.log('🖼️ Found image:', { 
                imagelink: image.imagelink.substring(0, 50) + '...', 
                contentId,
                hasImagelink: !!image.imagelink
              });
              
              if (contentItem.title && contentItem.title.trim()) {
                console.log('✅ Adding picture-title pair:', { 
                  image: image.imagelink.substring(0, 30) + '...', 
                  title: contentItem.title 
                });
                pairs.push({ 
                  left: image.imagelink, 
                  right: contentItem.title,
                  leftType: 'image'
                });
              } else {
                console.log('❌ Content has image but no title:', contentId);
              }
            } else {
              console.log('❌ No image found for content:', contentId, {
                imageByContentId: images.find(img => img.contentid === contentId) ? 'found' : 'not found',
                imageByImageId: images.find(img => img.id === contentItem.imageid) ? 'found' : 'not found',
                contentImageId: contentItem.imageid
              });
            }
          } else {
            console.log('❌ Content not found for ID:', contentId);
          }
        }
      }
      
      console.log('🎯 Picture-title pairs generated:', pairs.length);
      
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
          console.log(`📝 Processing prompt${i} for title-description with contentId:`, contentId);
          
          const contentItem = content.find(c => c.id === contentId);
          if (contentItem) {
            console.log('📋 Content details:', {
              id: contentItem.id,
              hasTitle: !!contentItem.title,
              hasShortDescription: !!contentItem.short_description,
              title: contentItem.title?.substring(0, 30) + '...',
              shortDescLength: contentItem.short_description?.length || 0
            });
            
            if (contentItem.title && contentItem.title.trim() && 
                contentItem.short_description && contentItem.short_description.trim()) {
              console.log('✅ Adding title-description pair:', { 
                title: contentItem.title, 
                description: contentItem.short_description?.substring(0, 50) + '...' 
              });
              pairs.push({ 
                left: contentItem.title, 
                right: contentItem.short_description 
              });
            } else {
              console.log('❌ Missing title or description for content:', contentId, {
                missingTitle: !contentItem.title || !contentItem.title.trim(),
                missingDescription: !contentItem.short_description || !contentItem.short_description.trim()
              });
            }
          } else {
            console.log('❌ Content not found for ID:', contentId);
          }
        }
      }
      
      console.log('📋 Title-description pairs generated:', pairs.length);
      
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
  
  console.log('🎮 Total questions generated:', questions.length);
  return questions;
};

export const MatchingActivityPopup = ({ isOpen, onClose, matchingId }: MatchingActivityPopupProps) => {
  const { toast } = useToast();
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const trackerRef = useRef<MatchingActivityTrackerRef>(null);

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = currentUser.id || 'guest_user';

  const { data: activity, isLoading, error } = useQuery({
    queryKey: ['matchingActivity', matchingId],
    queryFn: () => fetchMatchingActivity(matchingId),
    enabled: !!matchingId && isOpen,
  });

  // Transform activity to questions when activity data changes
  useEffect(() => {
    if (activity && isOpen) {
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
  }, [activity, isOpen, toast]);

  // Reset state when popup opens/closes
  useEffect(() => {
    if (!isOpen) {
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setCurrentAttemptId(null);
    }
  }, [isOpen]);

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
      
      // Close popup after completion
      setTimeout(() => {
        onClose();
      }, 2000);
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

  if (!isOpen) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const isMultiQuestion = questions.length > 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">
            {activity?.description || 'Matching Activity'}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          {/* Main Activity Area */}
          <div className="lg:col-span-2 flex flex-col">
            {isLoading || isLoadingQuestions ? (
              <div className="flex-1 flex justify-center items-center bg-gray-900 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            ) : error || !activity ? (
              <div className="flex-1 flex justify-center items-center bg-gray-900 rounded-lg">
                <p className="text-red-500">Error loading activity.</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="flex-1 flex justify-center items-center bg-gray-900 rounded-lg">
                <p className="text-yellow-500">No matching questions found for this activity.</p>
              </div>
            ) : (
              <div className="flex-1 bg-gray-900 text-white rounded-lg p-6 flex flex-col">
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
                <div className="flex-1">
                  <Matching question={currentQuestion} onAnswer={handleAnswer} />
                </div>
              </div>
            )}
          </div>
          
          {/* Activity Tracker Sidebar */}
          <div className="lg:col-span-1 flex flex-col">
            <MatchingActivityTracker
              ref={trackerRef}
              matchingId={matchingId}
              studentId={studentId}
              onAttemptStart={handleAttemptStart}
              onAttemptComplete={handleAttemptComplete}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchingActivityPopup;