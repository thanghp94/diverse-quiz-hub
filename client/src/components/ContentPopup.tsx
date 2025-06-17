
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Content } from "@/hooks/useContent";
import { useEffect } from "react";
import QuizView from "./QuizView";
import { cn } from "@/lib/utils";
import { MediaDisplay } from "./content-popup/MediaDisplay";
import { VideoPlayer } from "./content-popup/VideoPlayer";
import { ContentBody } from "./content-popup/ContentBody";
import { PopupHeader } from "./content-popup/PopupHeader";
import MarkdownRenderer from "./MarkdownRenderer";
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
  quizLevel,
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
  } = useQuiz({ content, onClose, startQuizDirectly, level: quizLevel });

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

  if (!content) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => { if(!open) onClose(); }}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh]">
          <div>No content available</div>
        </DialogContent>
      </Dialog>
    );
  }

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
      <DialogContent className={cn("max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto", quizMode && "max-w-7xl")}>
        {quizMode && questionIds.length > 0 && assignmentTry ? (
          <QuizView 
            questionIds={questionIds} 
            onQuizFinish={closeQuiz}
            assignmentStudentTryId={assignmentTry.id.toString()}
            studentTryId={studentTry?.id}
            contentId={content?.id}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-blue-600">
                {content.title}
              </DialogTitle>
              <DialogDescription className="whitespace-pre-line text-lg leading-relaxed">
                {content.short_description || "Detailed content view."}
              </DialogDescription>
            </DialogHeader>

            {/* Second Short Blurb directly under DialogDescription */}
            {content.second_short_blurb && (
              <div className="mb-4">
                <div className="p-4 border rounded-lg bg-muted/30">
                  <MarkdownRenderer className="text-base leading-relaxed">
                    {content.second_short_blurb}
                  </MarkdownRenderer>
                </div>
              </div>
            )}

            {/* Two-column layout: Image + Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
              {/* Left: Image and Video */}
              <div className="space-y-3">
                <MediaDisplay
                  imageUrl={imageUrl}
                  isImageLoading={isImageLoading}
                  title={content.title}
                  imageid={content.imageid}
                  isFullWidth={true}
                />
                {/* Video section directly under image */}
                <div className="mt-3">
                  <VideoPlayer 
                    videoEmbedUrl={videoEmbedUrl}
                    video2EmbedUrl={video2EmbedUrl}
                    videoData={videoData}
                    video2Data={video2Data}
                    compact={true}
                  />
                </div>
              </div>

              {/* Right: Content */}
              <div className="space-y-3">
                <ContentBody content={content} />
              </div>
            </div>

            {/* Popup Header */}
            <PopupHeader
              contentListLength={contentList.length}
              currentIndex={currentIndex}
              handlePrevious={handlePrevious}
              handleNext={handleNext}
              startQuiz={startQuiz}
              translation={content.translation}
              contentId={content.id}
            />
          </>
        )}
      </DialogContent>
    </Dialog>;
};
export default ContentPopup;
