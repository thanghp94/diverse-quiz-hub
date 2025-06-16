
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Content } from "@/hooks/useContent";

interface UseQuizProps {
  content: Content | null;
  onClose: () => void;
  startQuizDirectly?: boolean;
}

export const useQuiz = ({ content, onClose, startQuizDirectly = false }: UseQuizProps) => {
  const [quizMode, setQuizMode] = useState(false);
  const [assignmentTry, setAssignmentTry] = useState<any>(null);
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const { toast } = useToast();

  const startQuiz = useCallback(async (level?: 'Easy' | 'Hard') => {
    if (!content) return;

    // Fetch questions for this content
    const url = level 
      ? `/api/questions?contentId=${content.id}&level=${level}`
      : `/api/questions?contentId=${content.id}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const questions = await response.json();

      if (!questions || questions.length === 0) {
          console.log("No questions available for this content.", level ? `Level: ${level}` : '');
          toast({
              title: "No Quiz Available",
              description: `There are no ${level ? level.toLowerCase() + ' ' : ''}questions for this content yet. Check back later!`,
          });
          if (startQuizDirectly) onClose();
          return;
      }

      const randomizedQuestionIds = questions.map((q: any) => q.id).sort(() => Math.random() - 0.5);
      
      const hocsinh_id = 'user-123-placeholder';
      
      const newAssignmentTry = {
          id: Date.now(),
          hocsinh_id,
          contentID: content.id,
          questionIDs: JSON.stringify(randomizedQuestionIds),
      };

      // Note: Assignment tracking will be implemented when authentication is added
      console.log('Quiz started:', newAssignmentTry);

      setAssignmentTry(newAssignmentTry);
      setQuestionIds(randomizedQuestionIds);
      setQuizMode(true);
    } catch (error) {
        console.error("Error starting quiz:", error);
        toast({
            title: "Error Starting Quiz",
            description: "Could not start the quiz due to a server error. Please try again.",
            variant: "destructive",
        });
        if (startQuizDirectly) onClose();
        return;
    }
  }, [content, toast, startQuizDirectly, onClose]);

  const handleQuizFinish = () => {
      setQuizMode(false);
      setAssignmentTry(null);
      setQuestionIds([]);
  };

  return { quizMode, setQuizMode, assignmentTry, setAssignmentTry, questionIds, startQuiz, handleQuizFinish };
};
