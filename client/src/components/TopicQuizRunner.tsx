
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import QuizApp from "@/components/QuizApp";
import { Tables } from "@/integrations/supabase/types";
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
    const [assignmentTry, setAssignmentTry] = useState<Tables<'assignment_student_try'> | null>(null);
    const [questionIds, setQuestionIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const startQuiz = useCallback(async () => {
        setIsLoading(true);
        let query = supabase.from('question').select('id').eq('topicid', topicId);

        if (level === 'Easy' || level === 'Hard') {
            query = query.eq('questionlevel', level).limit(50);
        }

        const { data: questions, error: questionsError } = await query;

        if (questionsError) {
            console.error("Error fetching questions:", questionsError.message);
            toast({
                title: "Error Fetching Quiz",
                description: "Could not fetch questions for the quiz. Please try again.",
                variant: "destructive",
            });
            onClose();
            return;
        }

        if (!questions || questions.length === 0) {
            console.log("No questions available for this topic.", level ? `Level: ${level}` : '');
            toast({
                title: "No Quiz Available",
                description: `There are no ${level ? level.toLowerCase() + ' ' : ''}questions for this topic yet. Check back later!`,
            });
            onClose();
            return;
        }

        const randomizedQuestionIds = questions.map(q => q.id).sort(() => Math.random() - 0.5);
        
        const hocsinh_id = 'user-123-placeholder';
        
        const newAssignmentTry = {
            id: Date.now(),
            hocsinh_id,
            contentID: null,
            questionIDs: JSON.stringify(randomizedQuestionIds),
            typeoftaking: `topic_${level.toLowerCase()}`
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
            onClose();
            return;
        }

        setAssignmentTry(insertedData as Tables<'assignment_student_try'>);
        setQuestionIds(randomizedQuestionIds);
        setIsLoading(false);
    }, [topicId, level, toast, onClose]);

    useEffect(() => {
        if (topicId) {
            startQuiz();
        }
    }, [startQuiz, topicId]);

    const handleQuizFinish = () => {
        onClose();
    };

    if (!topicId) return null;

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col bg-slate-900/80 backdrop-blur-sm text-white border-slate-700">
                <DialogHeader>
                    <DialogTitle>Quiz: {topicName}</DialogTitle>
                    <DialogDescription className="text-slate-400">{level} level ({questionIds.length} questions)</DialogDescription>
                </DialogHeader>
                {isLoading ? (
                    <div className="flex-grow flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">Preparing your quiz...</span>
                    </div>
                ) : assignmentTry && questionIds.length > 0 ? (
                    <div className="flex-grow overflow-y-auto">
                        <QuizApp
                            assignmentTry={assignmentTry}
                            questionIds={questionIds}
                            onFinish={handleQuizFinish}
                            content={null}
                        />
                    </div>
                ) : (
                    <div className="flex-grow flex items-center justify-center">
                        <p>Could not load quiz.</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default TopicQuizRunner;
