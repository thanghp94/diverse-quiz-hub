import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import QuizApp from "@/components/QuizApp";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface TopicQuizRunnerProps {
    topicId: string;
    level: 'Overview' | 'Easy' | 'Hard';
    onClose: () => void;
    topicName: string;
}

const TopicQuizRunner = ({ topicId, level, onClose, topicName }: TopicQuizRunnerProps) => {
    const [assignmentTry, setAssignmentTry] = useState<any>(null);
    const [questionIds, setQuestionIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const startQuiz = useCallback(async () => {
        setIsLoading(true);
        
        try {
            // Fetch questions for this topic
            const url = level === 'Overview' 
                ? `/api/questions?topicId=${topicId}`
                : `/api/questions?topicId=${topicId}&level=${level}`;
            
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

            const randomizedQuestionIds = questions.map((q: any) => q.id).sort(() => Math.random() - 0.5);
            
            // Get current user from localStorage
            const currentUser = localStorage.getItem('currentUser');
            const studentId = currentUser ? JSON.parse(currentUser).id : null;
            
            if (!studentId) {
                toast({
                    title: "Authentication Required",
                    description: "Please log in to take quizzes.",
                    variant: "destructive",
                });
                onClose();
                return;
            }

            // Create assignment and assignment_student_try in database
            const assignmentResponse = await fetch('/api/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic_id: topicId,
                    level: level,
                    question_ids: randomizedQuestionIds
                })
            });

            if (!assignmentResponse.ok) {
                throw new Error('Failed to create assignment');
            }

            const assignment = await assignmentResponse.json();

            // Create student try
            const tryResponse = await fetch('/api/student-tries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assignment_id: assignment.id,
                    student_id: studentId,
                    level: level
                })
            });

            if (!tryResponse.ok) {
                throw new Error('Failed to create student try');
            }

            const studentTry = await tryResponse.json();
            
            const newAssignmentTry = {
                id: studentTry.id,
                assignment_id: assignment.id,
                student_id: studentId,
                topicID: topicId,
                questionIDs: JSON.stringify(randomizedQuestionIds),
                level: level
            };

            console.log('Topic quiz started with database tracking:', newAssignmentTry);

            setAssignmentTry(newAssignmentTry);
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
    }, [topicId, level, toast, onClose]);

    useEffect(() => {
        startQuiz();
    }, [startQuiz]);

    const handleQuizFinish = () => {
        setAssignmentTry(null);
        setQuestionIds([]);
        onClose();
    };

    if (isLoading) {
        return (
            <Dialog open onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Loading Quiz</DialogTitle>
                        <DialogDescription>
                            Preparing your {level.toLowerCase()} quiz for {topicName}...
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!assignmentTry || questionIds.length === 0) {
        return null;
    }

    return (
        <QuizApp
            questionIds={questionIds}
            onFinish={handleQuizFinish}
            assignmentTry={assignmentTry}
        />
    );
};

export default TopicQuizRunner;