import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import QuizView from "./QuizView";
import { useQuiz } from "@/hooks/useQuiz";
import type { Content } from "@shared/schema";

interface Question {
  id: string;
  topic: string;
  questiontext: string;
  A: string;
  B: string;
  C: string;
  D: string;
  answer: string;
  level: string;
}

interface QuizDialogProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  assignmentName: string;
  totalQuestions: number;
  content?: Content | null;
  level?: 'easy' | 'hard';
}

const QuizDialog: React.FC<QuizDialogProps> = ({
  isOpen,
  onClose,
  questions,
  assignmentName,
  totalQuestions,
  content = null,
  level = 'easy'
}) => {
  const {
    quizMode,
    assignmentTry,
    studentTry,
    questionIds,
    startQuiz,
    closeQuiz,
    setStudentTry,
  } = useQuiz({ 
    content, 
    onClose, 
    startQuizDirectly: false, 
    level 
  });

  const [questionIdsFromProps, setQuestionIdsFromProps] = useState<string[]>([]);
  const [mockAssignmentTry, setMockAssignmentTry] = useState<any>(null);
  
  useEffect(() => {
    if (isOpen && questions.length > 0) {
      const ids = questions.map(q => q.id);
      setQuestionIdsFromProps(ids);
      
      // Create a mock assignment try for the quiz
      const mockTry = {
        id: `quiz_${Date.now()}`,
        hocsinh_id: 'user-123-placeholder',
        contentID: content?.id || 'quiz-content',
        questionIDs: JSON.stringify(ids),
        start_time: new Date().toISOString(),
        typeoftaking: level || 'Overview'
      };
      
      setMockAssignmentTry(mockTry);
    }
  }, [isOpen, questions, content, level]);

  const handleClose = () => {
    closeQuiz();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-white flex items-center gap-2">
            {assignmentName || "Quiz"}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {questionIdsFromProps.length > 0 && mockAssignmentTry ? (
          <QuizView 
            questionIds={questionIdsFromProps} 
            onQuizFinish={handleClose}
            assignmentStudentTryId={mockAssignmentTry.id.toString()}
            studentTryId={mockAssignmentTry?.id}
            contentId={content?.id}
          />
        ) : (
          <div className="text-white text-center py-8">
            Loading quiz...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuizDialog;