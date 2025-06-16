
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Content } from "@/hooks/useContent";
import { useEffect } from "react";
import QuizView from "./QuizView";
import { cn } from "@/lib/utils";
import { ContentPopupView } from "./content-popup/ContentPopupView";
import { useQuiz } from "@/hooks/useQuiz";
import { useContentMedia } from "@/hooks/useContentMedia";

interface ContentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content | null;
  contentList: Content[];
  onContentChange: (newContent: Content) => void;
  startQuizDirectly?: boolean;
  imageUrl: string | null | undefined;
  isImageLoading: boolean;
}

const ContentPopup = ({
  isOpen,
  onClose,
  content,
  contentList,
  onContentChange,
  startQuizDirectly = false,
  imageUrl,
  isImageLoading,
}: ContentPopupProps) => {
  const {
    quizMode,
    setQuizMode,
    assignmentTry,
    setAssignmentTry,
    questionIds,
    startQuiz,
    handleQuizFinish,
  } = useQuiz({ content, onClose, startQuizDirectly });

  const {
    videoData,
    video2Data,
    videoEmbedUrl,
    video2EmbedUrl,
  } = useContentMedia(content);

  useEffect(() => {
    if (isOpen && startQuizDirectly && !quizMode) {
      startQuiz();
    }
  }, [isOpen, startQuizDirectly, quizMode, startQuiz]);

  if (!content) return null;

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
                isImageLoading={isImageLoading}
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
