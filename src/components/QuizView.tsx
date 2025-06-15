
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface QuizQuestion {
    id: string;
    noi_dung: string;
    cau_tra_loi_1: string | null;
    cau_tra_loi_2: string | null;
    cau_tra_loi_3: string | null;
    cau_tra_loi_4: string | null;
    correct_choice: string;
    explanation: string;
    contentid: string | null;
}

interface LinkedContent {
    title: string;
    short_description: string | null;
}

interface QuizViewProps {
    questionIds: string[];
    onQuizFinish: () => void;
    assignmentStudentTryId: string;
}

const QuizView = ({ questionIds, onQuizFinish, assignmentStudentTryId }: QuizViewProps) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    const [incorrectAnswersCount, setIncorrectAnswersCount] = useState(0);
    const [timeStart, setTimeStart] = useState<string | null>(null);
    const [showContent, setShowContent] = useState(false);
    const [didShowContent, setDidShowContent] = useState(false);
    const [linkedContent, setLinkedContent] = useState<LinkedContent | null>(null);
    const [isContentLoading, setIsContentLoading] = useState(false);
    const [isContentLoaded, setIsContentLoaded] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (currentQuestionIndex === 0) {
            sessionStorage.removeItem('quizResults');
            setCorrectAnswersCount(0);
            setIncorrectAnswersCount(0);
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
            setTimeStart(null);
            setShowContent(false);
            setDidShowContent(false);
            setLinkedContent(null);
            setIsContentLoaded(false);
            
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
                setTimeStart(new Date().toTimeString().slice(0, 8));
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
        if (correct) {
            setCorrectAnswersCount(prev => prev + 1);
        } else {
            setIncorrectAnswersCount(prev => prev + 1);
        }
        setShowFeedback(true);
    };

    const handleShowContent = async () => {
        if (showContent) {
            setShowContent(false);
            return;
        }

        if (isContentLoaded) {
            setShowContent(true);
            return;
        }

        if (!currentQuestion?.contentid) {
            toast({ title: "No content linked", description: "This question does not have associated content to show." });
            return;
        }

        setIsContentLoading(true);
        const { data, error } = await supabase
            .from('content')
            .select('title, short_description')
            .eq('id', currentQuestion.contentid)
            .single();
        
        setIsContentLoading(false);

        if (error) {
            console.error("Error fetching content:", error);
            toast({
                title: "Error",
                description: "Could not load content for this question.",
                variant: "destructive",
            });
        } else if (data) {
            setLinkedContent(data as LinkedContent);
            setIsContentLoaded(true);
            setShowContent(true);
            setDidShowContent(true);
        }
    };

    const handleNext = async () => {
        if (!currentQuestion || selectedAnswer === null) return;
        const timeEnd = new Date().toTimeString().slice(0, 8);

        try {
            const { error } = await supabase.from('student_try').insert({
                id: crypto.randomUUID(),
                question_id: currentQuestion.id,
                answer_choice: selectedAnswer,
                correct_answer: currentQuestion.correct_choice,
                quiz_result: isCorrect ? '✅' : '❌',
                assignment_student_try_id: assignmentStudentTryId,
                time_start: timeStart,
                time_end: timeEnd,
                currentindex: currentQuestionIndex,
                showcontent: didShowContent,
            });

            if (error) {
                console.error("Error saving student try:", error);
                toast({
                    title: "Error",
                    description: "There was an issue saving your answer. Please try again.",
                    variant: "destructive",
                });
            } else {
                 toast({
                    title: "Answer Saved",
                    description: "Your progress has been saved.",
                });
            }
        } catch (err) {
            console.error("Unexpected error saving student try:", err);
        }

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
                    <div className="flex justify-between items-center">
                        <CardTitle>Question {currentQuestionIndex + 1}/{questionIds.length}</CardTitle>
                        <div className="flex gap-2">
                            <Badge className="bg-green-100 text-green-800 border-green-500">
                                <Check className="h-4 w-4 mr-1" /> Correct: {correctAnswersCount}
                            </Badge>
                            <Badge className="bg-red-100 text-red-800 border-red-500">
                                <X className="h-4 w-4 mr-1" /> Incorrect: {incorrectAnswersCount}
                            </Badge>
                        </div>
                    </div>
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

                    <div className="mt-6 flex justify-start">
                        <Button variant="outline" onClick={handleShowContent} disabled={isContentLoading || showFeedback}>
                            {isContentLoading ? 'Loading Content...' : (showContent ? 'Hide Content' : 'Show Content')}
                        </Button>
                    </div>

                    {showContent && linkedContent && (
                        <Card className="mt-4 bg-gray-50 border-gray-200">
                            <CardHeader>
                                <CardTitle className="text-xl">{linkedContent.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700">{linkedContent.short_description || "No description available."}</p>
                            </CardContent>
                        </Card>
                    )}

                    {showFeedback && (
                         <Alert className={`mt-6 ${isCorrect ? 'border-green-500 text-green-800' : 'border-red-500 text-red-800'}`}>
                            {isCorrect ? <Check className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-red-600" />}
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

