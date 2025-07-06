import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Content } from "./useContent";
import { Question, convertBackendQuestion } from "@/features/quiz/types";
import type { DatabaseQuestion } from "@/features/quiz/types";

interface UseQuizProps {
  content: Content | null;
  onClose: () => void;
  startQuizDirectly?: boolean;
  level?: 'easy' | 'hard' | null;
}

interface QuizSession {
  id: number;
  assignmentid?: string;
  contentID: string;
  questionIDs: string;
  hocsinh_id: string;
  start_time: string;
  end_time?: string;
  typeoftaking: string;
}

interface StudentTry {
  id: string;
  assignment_student_try_id: string;
  hocsinh_id: string;
  question_id: string;
  answer_choice?: string;
  quiz_result?: '✅' | '❌';
  score?: number;
  time_start: string;
  time_end?: string;
  currentindex?: number;
  writing_answer?: string;
}

export const useQuiz = ({ content, onClose, startQuizDirectly = false, level }: UseQuizProps) => {
  const [quizMode, setQuizMode] = useState(false);
  const [assignmentTry, setAssignmentTry] = useState<QuizSession | null>(null);
  const [studentTry, setStudentTry] = useState<StudentTry | null>(null);
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const { toast } = useToast();

  const startQuiz = useCallback(async (level?: 'easy' | 'hard') => {
    if (!content) return;

    try {
      // Fetch questions for this content
      const url = level 
        ? `/api/questions?contentId=${content.id}&level=${level}`
        : `/api/questions?contentId=${content.id}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.statusText}`);
      }

      const backendQuestions = (await response.json()) as DatabaseQuestion[];

      if (!backendQuestions || backendQuestions.length === 0) {
        console.log("No questions available for this content.", level ? `Level: ${level}` : '');
        toast({
          title: "No Quiz Available",
          description: `There are no ${level ? level.toLowerCase() + ' ' : ''}questions for this content yet. Check back later!`,
        });
        if (startQuizDirectly) onClose();
        return;
      }

      // Convert backend questions to frontend format and randomize
      const questions = backendQuestions.map(convertBackendQuestion);
      const randomizedQuestionIds = questions.map(q => q.id).sort(() => Math.random() - 0.5);

      // Get current user ID from session (you should implement proper user session management)
      const hocsinh_id = 'user-123-placeholder'; // TODO: Get actual user ID from session

      // Create quiz session
      const quizSessionData = {
        hocsinh_id,
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
        throw new Error(`Failed to create quiz session: ${sessionResponse.statusText}`);
      }

      const quizSession = await sessionResponse.json() as QuizSession;
      console.log('Quiz session created:', quizSession);

      setAssignmentTry(quizSession);
      setStudentTry(null); // Individual records will be created per question
      setQuestionIds(randomizedQuestionIds);
      setQuizMode(true);
    } catch (error) {
      console.error("Error starting quiz:", error);
      toast({
        title: "Error Starting Quiz",
        description: error instanceof Error ? error.message : "Could not start the quiz due to a server error. Please try again.",
        variant: "destructive",
      });
      if (startQuizDirectly) onClose();
    }
  }, [content, onClose, startQuizDirectly, toast]);

  const closeQuiz = useCallback(() => {
    setQuizMode(false);
    setAssignmentTry(null);
    setStudentTry(null);
    setQuestionIds([]);
    onClose();
  }, [onClose]);

  // Auto-start quiz when startQuizDirectly is true and level is provided
  useEffect(() => {
    if (startQuizDirectly && content && level) {
      startQuiz(level);
    }
  }, [startQuizDirectly, content, level, startQuiz]);

  return {
    quizMode,
    assignmentTry,
    studentTry,
    questionIds,
    startQuiz,
    closeQuiz,
    setStudentTry: setStudentTry as React.Dispatch<React.SetStateAction<StudentTry | null>>
  };
};