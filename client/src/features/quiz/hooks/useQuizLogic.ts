
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { Question } from "../types";

export interface QuizAppProps {
    assignmentTry?: Tables<'assignment_student_try'>;
    questionIds?: string[];
    onFinish?: () => void;
    content?: any;
}

export const useQuizLogic = ({ assignmentTry, questionIds, onFinish }: QuizAppProps) => {
  const isExternalQuiz = !!(assignmentTry && questionIds && onFinish);
  const { toast } = useToast();

  const [currentView, setCurrentView] = useState<'home' | 'quiz' | 'results'>(isExternalQuiz ? 'quiz' : 'home');
  const [selectedQuiz, setSelectedQuiz] = useState<{ questions: Question[], title: string } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [score, setScore] = useState(0);

  const { data: fetchedQuestions, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ['quiz-questions', questionIds],
    queryFn: async () => {
        if (!questionIds || questionIds.length === 0) return [];
        const { data, error } = await supabase.from('question').select('*').in('id', questionIds);
        if (error) {
            toast({ title: "Error fetching questions", description: error.message, variant: "destructive" });
            throw new Error(error.message);
        }
        
        const orderedQuestions = questionIds.map(id => data.find(q => q.id === id)).filter(q => q) as Tables<'question'>[];

        return orderedQuestions.map((q): Question | null => {
            if (q.question_type === 'multiple-choice') {
                const options = [q.cau_tra_loi_1, q.cau_tra_loi_2, q.cau_tra_loi_3, q.cau_tra_loi_4].filter((o): o is string => !!o);
                let correctIndex = -1;
                if (q.correct_choice) {
                    const parsed = parseInt(q.correct_choice, 10);
                    if (!isNaN(parsed) && parsed >= 1 && parsed <= options.length) {
                        correctIndex = parsed - 1;
                    } else {
                        correctIndex = options.indexOf(q.correct_choice);
                    }
                }
                return {
                    id: q.id,
                    type: 'multiple-choice',
                    question: q.noi_dung || '',
                    options: options,
                    correct: correctIndex
                };
            }
            // For now, other types are not supported from DB
            return null;
        }).filter((q): q is Question => q !== null);
    },
    enabled: isExternalQuiz,
  });

  useEffect(() => {
    if (isExternalQuiz && fetchedQuestions) {
        if (fetchedQuestions.length > 0) {
            setSelectedQuiz({ questions: fetchedQuestions, title: assignmentTry?.typeoftaking || 'Quiz' });
            setCurrentView('quiz');
            setCurrentQuestionIndex(0);
            setAnswers([]);
            setScore(0);
        }
    }
  }, [isExternalQuiz, fetchedQuestions, assignmentTry]);

  const startQuiz = useCallback((quiz: { questions: Question[], title: string }) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setScore(0);
    setCurrentView('quiz');
  }, []);

  const handleAnswer = async (answer: any, isCorrect: boolean) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
    
    if (isCorrect) {
      setScore(score + 1);
    }

    if (isExternalQuiz && assignmentTry && selectedQuiz) {
        const question = selectedQuiz.questions[currentQuestionIndex];
        const { error } = await supabase.from('student_try').insert({
            id: crypto.randomUUID(),
            hocsinh_id: assignmentTry.hocsinh_id,
            assignment_student_try_id: String(assignmentTry.id),
            question_id: String(question.id),
            answer_choice: String(answer),
            correct_answer: String(question.correct),
            quiz_result: isCorrect ? 'correct' : 'incorrect',
        });

        if (error) {
            console.error('Error saving answer:', error);
            toast({
                title: "Error Saving Answer",
                description: "Your answer could not be saved. Please check your connection.",
                variant: "destructive",
            });
        }
    }

    if (selectedQuiz && currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentView('results');
    }
  };

  const resetQuiz = useCallback(() => {
    if (isExternalQuiz) {
        onFinish?.();
    } else {
        setCurrentView('home');
        setSelectedQuiz(null);
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setScore(0);
    }
  }, [isExternalQuiz, onFinish]);

  return {
    currentView,
    selectedQuiz,
    currentQuestionIndex,
    answers,
    score,
    startQuiz,
    handleAnswer,
    resetQuiz,
    isExternalQuiz,
    isLoadingQuestions
  };
};
