import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, X, ThumbsUp, Minus, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import MarkdownRenderer from "@/components/MarkdownRenderer";

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
    id: string;
    title: string;
    short_description: string | null;
    short_blurb: string | null;
    imageid: string | null;
    topicid: string;
    videoid: string | null;
    videoid2: string | null;
    information: string | null;
}

interface QuizViewProps {
    questionIds: string[];
    onQuizFinish: () => void;
    assignmentStudentTryId: string;
    studentTryId?: string;
    contentId?: string;
}

const QuizView = ({ questionIds, onQuizFinish, assignmentStudentTryId, studentTryId, contentId }: QuizViewProps) => {
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
    const [contentRating, setContentRating] = useState<string | null>(null);
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
            try {
                const response = await fetch(`/api/questions/${questionId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch question');
                }
                const data = await response.json();
                setCurrentQuestion(data as QuizQuestion);
                setTimeStart(new Date().toTimeString().slice(0, 8));
            } catch (error) {
                console.error("Error fetching question", error);
                toast({
                    title: "Error",
                    description: "Failed to load the next question.",
                    variant: "destructive"
                });
                setCurrentQuestion(null);
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
        try {
            const response = await fetch(`/api/content/${currentQuestion.contentid}`);
            if (!response.ok) {
                throw new Error('Failed to fetch content');
            }
            const data = await response.json();
            setLinkedContent(data as LinkedContent);
            setIsContentLoaded(true);
            setShowContent(true);
            setDidShowContent(true);
        } catch (error) {
            console.error("Error fetching content:", error);
            toast({
                title: "Error",
                description: "Could not load content for this question.",
                variant: "destructive",
            });
        } finally {
            setIsContentLoading(false);
        }
    };

    const handleContentRating = async (rating: string) => {
        if (!contentId) return;

        try {
            // Get current user for tracking
            const getCurrentUser = () => {
                const storedUser = localStorage.getItem('currentUser');
                if (storedUser) {
                    return JSON.parse(storedUser);
                }
                // Fallback to a default user if no user is stored
                return { id: 'GV0002', name: 'Default User' };
            };

            const currentUser = getCurrentUser();
            const response = await fetch('/api/content-ratings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    student_id: currentUser.id,
                    content_id: contentId,
                    rating: rating
                })
            });

            if (response.ok) {
                setContentRating(rating);
                toast({
                    title: "Rating Saved",
                    description: `Content rated as ${rating}`,
                });
            }
        } catch (error) {
            console.error('Error saving content rating:', error);
            toast({
                title: "Error",
                description: "Failed to save rating",
                variant: "destructive"
            });
        }
    };

    const handleNext = async () => {
        if (!currentQuestion || selectedAnswer === null) return;
        const timeEnd = new Date().toTimeString().slice(0, 8);

        try {
            // Create new student_try record for each question response
            const getCurrentUser = () => {
                const storedUser = localStorage.getItem('currentUser');
                if (storedUser) {
                    return JSON.parse(storedUser);
                }
                // Fallback to a default user if no user is stored
                return { id: 'GV0002', name: 'Default User' };
            };

            const currentUser = getCurrentUser();

            if (assignmentStudentTryId) {
                const responseData = {
                    assignment_student_try_id: assignmentStudentTryId,
                    hocsinh_id: currentUser.id,
                    question_id: currentQuestion.id,
                    answer_choice: selectedAnswer,
                    correct_answer: currentQuestion.correct_choice,
                    quiz_result: isCorrect ? '✅' : '❌',
                    time_start: timeStart,
                    time_end: timeEnd,
                    currentindex: currentQuestionIndex,
                    showcontent: didShowContent,
                };

                await fetch('/api/student-tries', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(responseData)
                });
            }

            console.log('Student answer recorded:', {
                question_id: currentQuestion.id,
                answer_choice: selectedAnswer,
                correct_answer: currentQuestion.correct_choice,
                quiz_result: isCorrect ? '✅' : '❌',
                time_start: timeStart,
                time_end: timeEnd,
                currentindex: currentQuestionIndex,
                showcontent: didShowContent,
            });
        } catch (err) {
            console.error("Error saving student response:", err);
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

    const totalQuestions = questionIds.length;
    const correctPercentage = totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 0;
    const incorrectPercentage = totalQuestions > 0 ? Math.round((incorrectAnswersCount / totalQuestions) * 100) : 0;

    return (
        <div className="p-6 h-full">
            <Card className="border-gray-200 shadow-lg h-full">
                <CardHeader className="pb-6">
                    <div className="flex justify-between items-center mb-4">
                        <CardTitle className="text-xl">Question {currentQuestionIndex + 1}/{questionIds.length}</CardTitle>
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                                <div className="text-sm text-gray-600 font-medium mb-2">Progress</div>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                                        <div 
                                            className="bg-green-500 rounded-full h-3 transition-all duration-300 absolute left-0"
                                            style={{ width: `${correctPercentage}%` }}
                                        />
                                        <div 
                                            className="bg-red-500 rounded-full h-3 transition-all duration-300 absolute right-0"
                                            style={{ width: `${incorrectPercentage}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold">
                                        <span className="text-green-600">{correctPercentage}%</span>
                                        <span className="text-gray-400">|</span>
                                        <span className="text-red-600">{incorrectPercentage}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <CardDescription className="text-2xl font-semibold text-blue-600 pt-2 leading-relaxed">{currentQuestion.noi_dung}</CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    className={`justify-start text-left h-auto py-6 px-6 whitespace-normal text-lg min-h-[80px] ${buttonClass}`}
                                    onClick={() => handleAnswerSelect(index)}
                                    disabled={showFeedback}
                                >
                                    <span className="font-bold mr-4 text-blue-600 text-xl">{choiceLetter}</span>
                                    <span className="text-blue-700 font-medium">{choice}</span>
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
                        <Card className="mt-6 bg-blue-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-2xl text-blue-700">{linkedContent.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Left side: Text content */}
                                    <div className="space-y-4">
                                        {linkedContent.short_description && (
                                            <div>
                                                <h4 className="font-semibold text-blue-600 mb-2">Description:</h4>
                                                <div className="text-gray-700 leading-relaxed whitespace-pre-line">{linkedContent.short_description}</div>
                                            </div>
                                        )}
                                        {linkedContent.short_blurb && (
                                            <div>
                                                <h4 className="font-semibold text-blue-600 mb-2">Details:</h4>
                                                <MarkdownRenderer className="text-gray-700 leading-relaxed">
                                                    {linkedContent.short_blurb}
                                                </MarkdownRenderer>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Right side: Image */}
                                    {linkedContent.imageid && (
                                        <div className="flex justify-center">
                                            <img
                                                src={linkedContent.imageid}
                                                alt={linkedContent.title}
                                                className="max-w-full h-auto rounded-lg shadow-md"
                                                style={{ maxHeight: '400px' }}
                                                onError={(e) => {
                                                    console.log('Content image failed to load:', linkedContent.imageid);
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
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