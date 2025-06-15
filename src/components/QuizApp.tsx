import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MultipleChoice from "./quiz/MultipleChoice";
import Matching from "./quiz/Matching";
import FillInBlank from "./quiz/FillInBlank";
import Categorize from "./quiz/Categorize";
import QuizResults from "./quiz/QuizResults";
import { Play, Trophy, Star, BookOpen, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";

export interface Question {
  id: number | string;
  type: 'multiple-choice' | 'matching' | 'fill-blank' | 'categorize';
  question: string;
  options?: string[];
  correct?: string | number;
  pairs?: { left: string; right: string }[];
  blanks?: { text: string; answers: string[] }[];
  categories?: { name: string; items: string[] }[];
  items?: string[];
}

const sampleQuizzes = [
  {
    id: 1,
    title: "General Knowledge Quiz",
    description: "Test your knowledge across various topics",
    questions: [
      {
        id: 1,
        type: 'multiple-choice' as const,
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correct: 2
      },
      {
        id: 2,
        type: 'matching' as const,
        question: "Match the countries with their capitals:",
        pairs: [
          { left: "Italy", right: "Rome" },
          { left: "Japan", right: "Tokyo" },
          { left: "Australia", right: "Canberra" },
          { left: "Brazil", right: "Brasília" }
        ]
      },
      {
        id: 3,
        type: 'fill-blank' as const,
        question: "Fill in the blanks:",
        blanks: [
          { text: "The largest planet in our solar system is ___.", answers: ["Jupiter", "jupiter"] },
          { text: "Water boils at ___ degrees Celsius.", answers: ["100", "one hundred"] }
        ]
      },
      {
        id: 4,
        type: 'categorize' as const,
        question: "Categorize these animals:",
        categories: [
          { name: "Mammals", items: [] },
          { name: "Birds", items: [] },
          { name: "Fish", items: [] }
        ],
        items: ["Dog", "Eagle", "Shark", "Cat", "Parrot", "Salmon", "Lion", "Penguin"]
      }
    ]
  },
  {
    id: 2,
    title: "Science Quiz",
    description: "Challenge your scientific knowledge",
    questions: [
      {
        id: 1,
        type: 'multiple-choice' as const,
        question: "What is H2O commonly known as?",
        options: ["Oxygen", "Hydrogen", "Water", "Carbon Dioxide"],
        correct: 2
      },
      {
        id: 2,
        type: 'fill-blank' as const,
        question: "Complete the scientific facts:",
        blanks: [
          { text: "The speed of light is approximately ___ meters per second.", answers: ["299792458", "300000000"] },
          { text: "DNA stands for ___ acid.", answers: ["Deoxyribonucleic", "deoxyribonucleic"] }
        ]
      }
    ]
  }
];

interface QuizAppProps {
    assignmentTry?: Tables<'assignment_student_try'>;
    questionIds?: string[];
    onFinish?: () => void;
    content?: any;
}

const QuizApp = ({ assignmentTry, questionIds, onFinish }: QuizAppProps) => {
  const isExternalQuiz = !!(assignmentTry && questionIds && onFinish);
  const { toast } = useToast();

  const [currentView, setCurrentView] = useState<'home' | 'quiz' | 'results'>(isExternalQuiz ? 'quiz' : 'home');
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
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

  const startQuiz = (quiz: any) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setScore(0);
    setCurrentView('quiz');
  };

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
            hocsinh_id: assignmentTry.hocsinh_id,
            assignment_student_try_id: String(assignmentTry.id),
            question_id: question.id,
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

  const resetQuiz = () => {
    if (isExternalQuiz) {
        onFinish?.();
    } else {
        setCurrentView('home');
        setSelectedQuiz(null);
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setScore(0);
    }
  };

  const renderQuestion = () => {
    if (!selectedQuiz) return null;
    
    const question = selectedQuiz.questions[currentQuestionIndex];
    
    switch (question.type) {
      case 'multiple-choice':
        return <MultipleChoice question={question} onAnswer={handleAnswer} />;
      case 'matching':
        return <Matching question={question} onAnswer={handleAnswer} />;
      case 'fill-blank':
        return <FillInBlank question={question} onAnswer={handleAnswer} />;
      case 'categorize':
        return <Categorize question={question} onAnswer={handleAnswer} />;
      default:
        return null;
    }
  };

  if (isExternalQuiz && isLoadingQuestions) {
    return (
        <div className="flex-grow flex items-center justify-center text-white">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading quiz...</span>
        </div>
    );
  }

  if (currentView === 'results') {
    return (
      <QuizResults 
        score={score} 
        total={selectedQuiz.questions.length} 
        onRestart={resetQuiz}
        quizTitle={selectedQuiz.title}
      />
    );
  }

  if (currentView === 'quiz' && selectedQuiz && selectedQuiz.questions.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2 bg-white/10 text-white border-white/30">
                Score: {score}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{selectedQuiz.title}</h1>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100}%` }}
              />
            </div>
          </div>
          {renderQuestion()}
        </div>
      </div>
    );
  }
  
  if (isExternalQuiz && (!selectedQuiz || selectedQuiz.questions.length === 0)) {
    return (
        <div className="flex-grow flex items-center justify-center text-white">
            <p>No questions available for this quiz.</p>
        </div>
    );
  }

  if (!isExternalQuiz) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-4xl w-full">
            <div className="mb-8 animate-fade-in">
              <Trophy className="mx-auto mb-4 text-yellow-300" size={64} />
              <h1 className="text-5xl font-bold text-white mb-4">Quiz Master</h1>
              <p className="text-xl text-white/80 mb-8">
                Challenge yourself with different types of questions and test your knowledge!
              </p>
              <div className="flex gap-4 justify-center mb-8">
                <Link to="/topics">
                  <Button 
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <BookOpen className="mr-2" size={16} />
                    Browse Learning Topics
                  </Button>
                </Link>
              </div>
            </div>
    
            <div className="grid md:grid-cols-2 gap-6">
              {sampleQuizzes.map((quiz) => (
                <Card key={quiz.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-xl">{quiz.title}</CardTitle>
                      <Star className="text-yellow-300" size={24} />
                    </div>
                    <p className="text-white/80">{quiz.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-200">
                        {quiz.questions.length} Questions
                      </Badge>
                      <div className="flex gap-2">
                        {quiz.questions.map((q, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-white/30 text-white/70">
                            {q.type === 'multiple-choice' ? 'MC' : 
                             q.type === 'matching' ? 'Match' :
                             q.type === 'fill-blank' ? 'Fill' : 'Cat'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      onClick={() => startQuiz(quiz)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                      <Play className="mr-2" size={16} />
                      Start Quiz
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      );
  }

  return null;
};

export default QuizApp;
