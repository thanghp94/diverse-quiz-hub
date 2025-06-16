import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Content } from "./useContent";

interface UseQuizProps {
  content: Content | null;
  onClose: () => void;
  startQuizDirectly?: boolean;
}

export const useQuiz = ({ content, onClose, startQuizDirectly = false }: UseQuizProps) => {
  const [quizMode, setQuizMode] = useState(false);
  const [assignmentTry, setAssignmentTry] = useState<any>(null);
  const [studentTry, setStudentTry] = useState<any>(null);
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
      
      // Create quiz session using assignment_student_try (eliminates need for assignment table)
      const quizSessionData = {
        hocsinh_id: hocsinh_id,
        contentID: content.id,
        questionIDs: JSON.stringify(randomizedQuestionIds),
        start_time: new Date().toISOString(),
        typeoftaking: level || 'Overview'
      };

      const sessionResponse = await fetch('/api/assignment-student-tries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizSessionData)
      });

      if (!sessionResponse.ok) {
        throw new Error('Failed to create quiz session');
      }

      const quizSession = await sessionResponse.json();

      console.log('Quiz session created:', quizSession);

      setAssignmentTry(quizSession);
      setStudentTry(null); // Individual records will be created per question
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
  }, [content, onClose, startQuizDirectly, toast]);

  const closeQuiz = useCallback(() => {
    setQuizMode(false);
    setAssignmentTry(null);
    setStudentTry(null);
    setQuestionIds([]);
    onClose();
  }, [onClose]);

  return {
    quizMode,
    assignmentTry,
    studentTry,
    questionIds,
    startQuiz,
    closeQuiz,
    setStudentTry
  };
};