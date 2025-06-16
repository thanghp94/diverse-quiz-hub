
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Content } from "@/hooks/useContent";
import { useEffect } from "react";
import QuizView from "./QuizView";
import { cn } from "@/lib/utils";
import { ContentPopupView } from "./content-popup/ContentPopupView";
import { MediaDisplay } from "./content-popup/MediaDisplay";
import { useQuiz } from "@/hooks/useQuiz";
import { useContentMedia } from "@/hooks/useContentMedia";

interface ContentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content | null;
  contentList: Content[];
  onContentChange: (newContent: Content) => void;
  startQuizDirectly?: boolean;
  quizLevel?: 'Easy' | 'Hard' | null;
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
  quizLevel = null,
  imageUrl,
  isImageLoading,
}: ContentPopupProps) => {
  const {
    quizMode,
    assignmentTry,
    studentTry,
    questionIds,
    startQuiz,
    closeQuiz,
    setStudentTry,
  } = useQuiz({ content, onClose, startQuizDirectly });

  const {
    videoData,
    video2Data,
    videoEmbedUrl,
    video2EmbedUrl,
  } = useContentMedia(content);

  useEffect(() => {
    if (isOpen && startQuizDirectly && !quizMode) {
      startQuiz(quizLevel || undefined);
    }
  }, [isOpen, startQuizDirectly, quizMode, startQuiz, quizLevel]);

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

  return <Dialog open={isOpen} onOpenChange={(open) => { if(!open) { closeQuiz(); } onClose(); }}>
      <DialogContent className={cn("max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto", quizMode && "max-w-6xl")}>
        {quizMode && questionIds.length > 0 && assignmentTry ? (
          <QuizView 
            questionIds={questionIds} 
            onQuizFinish={closeQuiz}
            assignmentStudentTryId={assignmentTry.id.toString()}
            studentTryId={studentTry?.id}
          />
        ) : (
          <>
            {/* Header with title, description and image */}
            <div className="flex flex-col lg:flex-row lg:gap-6 mb-6">
              {/* Left: Title and Description */}
              <div className="flex-1 lg:w-1/2">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-blue-600">
                    {content.title}
                  </DialogTitle>
                  <DialogDescription className="whitespace-pre-line text-lg leading-relaxed">
                    {content.short_description || "Detailed content view."}
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Right: Image */}
              <div className="flex-1 lg:w-1/2 mt-4 lg:mt-0">
                <MediaDisplay
                  imageUrl={imageUrl}
                  isImageLoading={isImageLoading}
                  title={content.title}
                  imageid={content.imageid}
                  isFullWidth={true}
                />
              </div>
            </div>

            {/* Content below */}
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
                hideMediaDisplay={true}
            />
          </>
        )}
      </DialogContent>
    </Dialog>;
};
export default ContentPopup;
