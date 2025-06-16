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
      
      // Create assignment record
      const assignmentData = {
        id: `assignment_${Date.now()}`,
        assignmentname: `${content.title} Quiz`,
        contentid: content.id,
        question_id: JSON.stringify(randomizedQuestionIds),
        testtype: 'content_quiz',
        typeofquestion: level || 'Overview'
      };

      const assignmentResponse = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData)
      });

      if (!assignmentResponse.ok) {
        throw new Error('Failed to create assignment');
      }

      const assignment = await assignmentResponse.json();

      // Create student try
      const studentTryResponse = await fetch('/api/student-tries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_id: assignment.id,
          student_id: hocsinh_id,
          level: level || 'Overview',
          question_ids: randomizedQuestionIds
        })
      });

      if (!studentTryResponse.ok) {
        throw new Error('Failed to create student try');
      }

      const studentTryRecord = await studentTryResponse.json();

      const newAssignmentTry = {
          id: studentTryRecord.assignment_student_try_id,
          hocsinh_id,
          contentID: content.id,
          questionIDs: JSON.stringify(randomizedQuestionIds),
      };

      console.log('Quiz started with database tracking:', { assignment, studentTryRecord });

      setAssignmentTry(newAssignmentTry);
      setStudentTry(studentTryRecord);
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
      setStudentTry(null);
      setQuestionIds([]);
  };

  return { quizMode, setQuizMode, assignmentTry, setAssignmentTry, studentTry, questionIds, startQuiz, handleQuizFinish };
};