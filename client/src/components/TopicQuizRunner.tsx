import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import QuizView from './QuizView';

interface TopicQuizRunnerProps {
    topicId: string;
    level: 'Overview' | 'Easy' | 'Hard';
    topicName: string;
    onClose: () => void;
}

const TopicQuizRunner = ({ topicId, level, onClose, topicName }: TopicQuizRunnerProps) => {
    const [assignmentTry, setAssignmentTry] = useState<any>(null);
    const [questionIds, setQuestionIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const startQuiz = useCallback(async () => {
        setIsLoading(true);

        try {
            // Fetch questions for this topic with proper level parameter
            const url = `/api/questions?topicId=${topicId}&level=${level}`;

            console.log(`Fetching questions from: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch questions');
            }
            const questions = await response.json();

            if (!questions || questions.length === 0) {
                console.log(`No ${level} questions available for topic ${topicId}`);
                toast({
                    title: "No Quiz Available",
                    description: `There are no ${level.toLowerCase()} questions for this topic yet. Check back later!`,
                });
                onClose();
                return;
            }

            console.log(`Found ${questions.length} ${level} questions for topic ${topicId}`);

            // Randomize questions
            const randomizedQuestionIds = questions.map((q: any) => q.id).sort(() => Math.random() - 0.5);

            // Get current user ID
            const getCurrentUser = () => {
                const storedUser = localStorage.getItem('currentUser');
                if (storedUser) {
                    return JSON.parse(storedUser);
                }
                return { id: 'GV0002', name: 'Default User' };
            };

            const currentUser = getCurrentUser();

            // Create quiz session using assignment_student_try
            const quizSessionData = {
                hocsinh_id: currentUser.id,
                topicID: topicId,
                questionIDs: JSON.stringify(randomizedQuestionIds),
                start_time: new Date().toISOString(),
                level: level
            };

            console.log('Creating student try with assignment_student_try_id:', null);

            // Create a student_try record first
            const studentTryData = {
                assignment_student_try_id: null,
                hocsinh_id: currentUser.id,
                question_id: null,
                answer_choice: null,
                quiz_result: null,
                time_start: null,
                time_end: null,
                currentindex: null,
                showcontent: null,
                score: null
            };

            const studentTryResponse = await fetch('/api/student-tries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentTryData)
            });

            if (!studentTryResponse.ok) {
                throw new Error('Failed to create student try record');
            }

            const studentTry = await studentTryResponse.json();
            console.log('Student try created successfully:', studentTry);

            // Now create assignment_student_try record
            const sessionResponse = await fetch('/api/assignment-student-tries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...quizSessionData,
                    studentTryId: studentTry.id
                })
            });

            if (!sessionResponse.ok) {
                throw new Error('Failed to create quiz session');
            }

            const quizSession = await sessionResponse.json();
            console.log('Topic quiz started with database tracking:', quizSession);

            // Use the assignment_student_try ID as the assignmentStudentTryId
            setAssignmentTry({
                ...quizSession,
                assignmentStudentTryId: quizSession.id
            });
            setQuestionIds(randomizedQuestionIds);
        } catch (error) {
            console.error("Error starting topic quiz:", error);
            toast({
                title: "Error Starting Quiz",
                description: "Could not start the quiz due to a server error. Please try again.",
                variant: "destructive",
            });
            onClose();
        } finally {
            setIsLoading(false);
        }
    }, [topicId, level, onClose, toast]);

    useEffect(() => {
        startQuiz();
    }, [startQuiz]);

    const handleQuizFinish = () => {
        onClose();
    };

    if (isLoading) {
        return (
            <Dialog open onOpenChange={onClose}>
                <DialogContent className="max-w-7xl w-[95vw] h-[90vh] overflow-hidden p-6">
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading {level} quiz for {topicName}...</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!assignmentTry || questionIds.length === 0) {
        return null;
    }

    return (
        <Dialog open onOpenChange={handleQuizFinish}>
            <DialogContent className="max-w-7xl w-[95vw] h-[90vh] overflow-hidden p-0">
                <QuizView
                    questionIds={questionIds}
                    onQuizFinish={handleQuizFinish}
                    assignmentStudentTryId={assignmentTry.assignmentStudentTryId || assignmentTry.id}
                    studentTryId={assignmentTry.studentTryId}
                    topicId={topicId}
                />
            </DialogContent>
        </Dialog>
    );
};

export default TopicQuizRunner;