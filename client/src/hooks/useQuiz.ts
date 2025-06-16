
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
  const [assignmentTry, setAssignmentTry] = useState<Tables<'assignment_student_try'> | null>(null);
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const { toast } = useToast();

  const startQuiz = useCallback(async (level?: 'Easy' | 'Hard') => {
    if (!content) return;

    // Fetch questions for this content
    let query = supabase
        .from('question')
        .select('id')
        .eq('contentid', content.id);

    if (level) {
        query = query.eq('questionlevel', level);
    }

    const { data: questions, error: questionsError } = await query;

    if (questionsError) {
        console.error("Error fetching questions:", questionsError.message);
        toast({
            title: "Error Fetching Quiz",
            description: "Could not fetch questions for the quiz. Please try again.",
            variant: "destructive",
        });
        if (startQuizDirectly) onClose();
        return;
    }

    if (!questions || questions.length === 0) {
        console.log("No questions available for this content.", level ? `Level: ${level}` : '');
        toast({
            title: "No Quiz Available",
            description: `There are no ${level ? level.toLowerCase() + ' ' : ''}questions for this content yet. Check back later!`,
        });
        if (startQuizDirectly) onClose();
        return;
    }

    const randomizedQuestionIds = questions.map(q => q.id).sort(() => Math.random() - 0.5);
    
    const hocsinh_id = 'user-123-placeholder';
    
    const newAssignmentTry = {
        id: Date.now(),
        hocsinh_id,
        contentID: content.id,
        questionIDs: JSON.stringify(randomizedQuestionIds),
    };

    const { data: insertedData, error: insertError } = await supabase
        .from('assignment_student_try')
        .insert(newAssignmentTry)
        .select()
        .single();

    if (insertError) {
        console.error("Error starting quiz:", insertError.message);
        toast({
            title: "Error Starting Quiz",
            description: "Could not start the quiz due to a server error. Please try again.",
            variant: "destructive",
        });
        if (startQuizDirectly) onClose();
        return;
    }

    setAssignmentTry(insertedData as Tables<'assignment_student_try'>);
    setQuestionIds(randomizedQuestionIds);
    setQuizMode(true);
  }, [content, toast, startQuizDirectly, onClose]);

  const handleQuizFinish = () => {
      setQuizMode(false);
      setAssignmentTry(null);
      setQuestionIds([]);
  };

  return { quizMode, setQuizMode, assignmentTry, setAssignmentTry, questionIds, startQuiz, handleQuizFinish };
};
