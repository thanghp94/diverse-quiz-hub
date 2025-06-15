import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Content } from "@/hooks/useContent";
import { useState, useEffect, useCallback } from "react";
import QuizView from "./QuizView";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { ContentPopupView } from "./content-popup/ContentPopupView";

interface ContentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content | null;
  contentList: Content[];
  onContentChange: (newContent: Content) => void;
  startQuizDirectly?: boolean;
}
const ContentPopup = ({
  isOpen,
  onClose,
  content,
  contentList,
  onContentChange,
  startQuizDirectly = false,
}: ContentPopupProps) => {
  const [quizMode, setQuizMode] = useState(false);
  const [assignmentTry, setAssignmentTry] = useState<Tables<'assignment_student_try'> | null>(null);
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const { toast } = useToast();

  const startQuiz = useCallback(async () => {
    if (!content) return;

    // Fetch questions for this content
    const { data: questions, error: questionsError } = await supabase
        .from('question')
        .select('id')
        .eq('contentid', content.id);

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
        console.log("No questions available for this content.");
        toast({
            title: "No Quiz Available",
            description: "There are no questions for this content yet. Check back later!",
        });
        if (startQuizDirectly) onClose();
        return;
    }

    const randomizedQuestionIds = questions.map(q => q.id).sort(() => Math.random() - 0.5);
    
    // This is a placeholder. In a real app, you'd get the current user's ID
    // from your authentication system (e.g., supabase.auth.getUser()).
    const hocsinh_id = 'user-123-placeholder';
    
    // The `assignment_student_try` table has a `bigint` for ID without auto-increment.
    // Using Date.now() as a temporary unique ID.
    // A robust solution would be a database sequence or UUID.
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

  useEffect(() => {
    if (isOpen && startQuizDirectly && !quizMode) {
      startQuiz();
    }
  }, [isOpen, startQuizDirectly, quizMode, startQuiz]);

  const handleQuizFinish = () => {
      setQuizMode(false);
      setAssignmentTry(null);
      setQuestionIds([]);
  };

  // Fetch related image data
  const {
    data: imageData
  } = useQuery({
    queryKey: ['image', content?.imageid],
    queryFn: async () => {
      if (!content?.imageid) return null;
      const {
        data,
        error
      } = await supabase.from('image').select('*').eq('id', content.imageid).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!content?.imageid
  });

  // Fetch related video data
  const {
    data: videoData
  } = useQuery({
    queryKey: ['video', content?.videoid],
    queryFn: async () => {
      if (!content?.videoid) return null;
      const {
        data,
        error
      } = await supabase.from('video').select('*').eq('id', content.videoid).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!content?.videoid
  });

  // Fetch related video data for videoid2
  const {
    data: video2Data
  } = useQuery({
    queryKey: ['video2', content?.videoid2],
    queryFn: async () => {
      if (!content?.videoid2) return null;
      const {
        data,
        error
      } = await supabase.from('video').select('*').eq('id', content.videoid2).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!content?.videoid2
  });
  if (!content) return null;

  const imageUrl = content.imagelink || imageData?.imagelink;

  const currentIndex = contentList.findIndex(item => item.id === content.id);
  const handlePrevious = () => {
    if (currentIndex > 0) {
      onContentChange(contentList[currentIndex - 1]);
    }
  };
  const handleNext = () => {
    if (currentIndex < contentList.length - 1) {
      onContentChange(contentList[currentIndex + 1]);
    }
  };
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
  };
  const videoEmbedUrl = videoData?.videolink ? getYouTubeEmbedUrl(videoData.videolink) : null;
  const video2EmbedUrl = video2Data?.videolink ? getYouTubeEmbedUrl(video2Data.videolink) : null;

  return <Dialog open={isOpen} onOpenChange={(open) => { if(!open) { setQuizMode(false); setAssignmentTry(null); } onClose(); }}>
      <DialogContent className={cn("max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto", quizMode && "max-w-6xl")}>
        {quizMode && questionIds.length > 0 && assignmentTry ? (
          <QuizView 
            questionIds={questionIds} 
            onQuizFinish={handleQuizFinish}
            assignmentStudentTryId={assignmentTry.id.toString()}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-blue-600">
                {content.title}
              </DialogTitle>
              <DialogDescription>
                {content.short_description || "Detailed content view."}
              </DialogDescription>
            </DialogHeader>

            <ContentPopupView
                content={content}
                contentListLength={contentList.length}
                currentIndex={currentIndex}
                handlePrevious={handlePrevious}
                handleNext={handleNext}
                startQuiz={startQuiz}
                imageUrl={imageUrl}
                videoEmbedUrl={videoEmbedUrl}
                video2EmbedUrl={video2EmbedUrl}
                videoData={videoData}
                video2Data={video2Data}
            />
          </>
        )}
      </DialogContent>
    </Dialog>;
};
export default ContentPopup;
