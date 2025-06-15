import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface QuizQuestion {
    id: string;
    noi_dung: string;
    cau_tra_loi_1: string | null;
    cau_tra_loi_2: string | null;
    cau_tra_loi_3: string | null;
    cau_tra_loi_4: string | null;
    correct_choice: string;
    explanation: string;
}

interface QuizViewProps {
    questionIds: string[];
    onQuizFinish: () => void;
}

const QuizView = ({ questionIds, onQuizFinish }: QuizViewProps) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (currentQuestionIndex === 0) {
            sessionStorage.removeItem('quizResults');
        }

        const fetchQuestion = async () => {
            if (currentQuestionIndex >= questionIds.length) {
                onQuizFinish();
                return;
            }
            setIsLoading(true);
            setShowFeedback(false);
            setSelectedAnswer(null);
            setIsCorrect(null);
            
            const questionId = questionIds[currentQuestionIndex];
            const { data, error } = await supabase
                .from('question')
                .select('*')
                .eq('id', questionId)
                .single();

            if (error) {
                console.error("Error fetching question", error);
                toast({
                    title: "Error",
                    description: "Failed to load the next question.",
                    variant: "destructive"
                });
                setCurrentQuestion(null);
            } else {
                setCurrentQuestion(data as QuizQuestion);
            }
            setIsLoading(false);
        };

        fetchQuestion();
    }, [currentQuestionIndex, questionIds, onQuizFinish, toast]);
    
    const handleAnswerSelect = (choiceIndex: number) => {
        if (showFeedback || !currentQuestion) return;

        const choiceLetter = String.fromCharCode(65 + choiceIndex);
        setSelectedAnswer(choiceLetter);
        
        const correct = choiceLetter === currentQuestion.correct_choice;
        setIsCorrect(correct);
        setShowFeedback(true);
    };

    const handleNext = () => {
        const existingResults = JSON.parse(sessionStorage.getItem('quizResults') || '[]');
        existingResults.push(isCorrect);
        sessionStorage.setItem('quizResults', JSON.stringify(existingResults));
        setCurrentQuestionIndex(prev => prev + 1);
    };

    if (isLoading) {
        return <div className="p-4 text-center">Loading quiz question...</div>;
    }

    if (!currentQuestion) {
        return <div className="p-4 text-center text-red-500">Question not found. Could not load quiz.</div>;
    }

    const choices = [currentQuestion.cau_tra_loi_1, currentQuestion.cau_tra_loi_2, currentQuestion.cau_tra_loi_3, currentQuestion.cau_tra_loi_4].filter((c): c is string => c !== null && c !== '');

    return (
        <div className="p-4">
            <Card className="border-gray-200 shadow-lg">
                <CardHeader>
                    <CardTitle>Question {currentQuestionIndex + 1}/{questionIds.length}</CardTitle>
                    <CardDescription className="text-lg pt-2">{currentQuestion.noi_dung}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {choices.map((choice, index) => {
                            const choiceLetter = String.fromCharCode(65 + index);
                            let buttonClass = "";
                            if (showFeedback) {
                                if (choiceLetter === currentQuestion.correct_choice) {
                                    buttonClass = "bg-green-100 border-green-500 hover:bg-green-100";
                                } else if (choiceLetter === selectedAnswer) {
                                    buttonClass = "bg-red-100 border-red-500 hover:bg-red-100";
                                }
                            }
                            return (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className={`justify-start text-left h-auto py-3 px-4 whitespace-normal ${buttonClass}`}
                                    onClick={() => handleAnswerSelect(index)}
                                    disabled={showFeedback}
                                >
                                    <span className="font-bold mr-4">{choiceLetter}</span>
                                    <span>{choice}</span>
                                </Button>
                            )
                        })}
                    </div>

                    {showFeedback && (
                         <Alert className={`mt-6 ${isCorrect ? 'border-green-500 text-green-800' : 'border-red-500 text-red-800'}`}>
                            {isCorrect ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                             <AlertTitle className="font-bold">
                                {isCorrect ? 'Correct!' : 'Incorrect'}
                             </AlertTitle>
                             <AlertDescription className="pt-2">
                                 {currentQuestion.explanation || (isCorrect ? 'Excellent!' : "That's not quite right, but don't give up!")}
                             </AlertDescription>
                         </Alert>
                    )}

                    {showFeedback && (
                        <div className="mt-6 flex justify-end">
                            <Button onClick={handleNext}>
                                {currentQuestionIndex < questionIds.length - 1 ? 'Next Question' : 'Finish Quiz'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default QuizView;
