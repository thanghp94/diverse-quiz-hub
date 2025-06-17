
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Content } from "@/hooks/useContent";
import { useEffect } from "react";
import QuizView from "./QuizView";
import { cn } from "@/lib/utils";
import { MediaDisplay } from "./content-popup/MediaDisplay";
import { VideoPlayer } from "./content-popup/VideoPlayer";
import { ContentBody } from "./content-popup/ContentBody";
import { ContentRatingButtons } from "./ContentRatingButtons";
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

            {/* Two-column layout: Content + Media */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
              {/* Left: Content */}
              <div className="space-y-3">
                <ContentBody content={content} />
              </div>

              {/* Right: Media - Image, Video1, Video2 horizontally */}
              <div className="space-y-3">
                <MediaDisplay
                  imageUrl={imageUrl}
                  isImageLoading={isImageLoading}
                  title={content.title}
                  imageid={content.imageid}
                  isFullWidth={true}
                />
                {/* Videos arranged horizontally */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {videoEmbedUrl && (
                    <div className="aspect-video">
                      <iframe
                        src={videoEmbedUrl}
                        title={`Video 1 for ${content.title}`}
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                      />
                    </div>
                  )}
                  {video2EmbedUrl && (
                    <div className="aspect-video">
                      <iframe
                        src={video2EmbedUrl}
                        title={`Video 2 for ${content.title}`}
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation and Controls */}
            <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t">
              {/* Navigation Controls */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrevious} 
                  disabled={currentIndex <= 0}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  ← Previous
                </button>
                <span className="text-sm text-gray-600">
                  {currentIndex + 1} of {contentList.length}
                </span>
                <button 
                  onClick={handleNext} 
                  disabled={currentIndex >= contentList.length - 1}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  Next →
                </button>
              </div>

              {/* Quiz and Rating Controls */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => startQuiz('Easy')}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Easy Quiz
                </button>
                <button 
                  onClick={() => startQuiz('Hard')}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Hard Quiz
                </button>
                <ContentRatingButtons contentId={content.id} />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>;
};
export default ContentPopup;
