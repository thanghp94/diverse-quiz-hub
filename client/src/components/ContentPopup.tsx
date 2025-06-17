
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Content } from "@/hooks/useContent";
import { useEffect, useState } from "react";
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
  const [isSecondBlurbOpen, setIsSecondBlurbOpen] = useState(false);
  
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
            {/* Two-column layout: Title/Content + Media */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-3">
              {/* Left: Title, Description, Short Blurb, Second Short Blurb */}
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-blue-600">
                    {content.title}
                  </DialogTitle>
                  <DialogDescription className="whitespace-pre-line text-lg leading-relaxed">
                    {content.short_description || "Detailed content view."}
                  </DialogDescription>
                </DialogHeader>

                {/* Short Blurb directly under title */}
                {content.short_blurb && (
                  <div className="space-y-2">
                    <MarkdownRenderer className="text-base leading-relaxed">
                      {content.short_blurb}
                    </MarkdownRenderer>
                  </div>
                )}

                {/* Second Short Blurb as collapsible card */}
                {content.second_short_blurb && (
                  <div className="border border-gray-200 rounded-lg">
                    <button 
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg"
                      onClick={() => setIsSecondBlurbOpen(!isSecondBlurbOpen)}
                    >
                      <h3 className="font-semibold text-lg">Additional Information</h3>
                      <svg 
                        className={`w-5 h-5 transition-transform duration-200 ${isSecondBlurbOpen ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isSecondBlurbOpen && (
                      <div className="px-3 pb-3 border-t border-gray-100">
                        <MarkdownRenderer className="text-base leading-relaxed">
                          {content.second_short_blurb}
                        </MarkdownRenderer>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Image and Videos */}
              <div className="space-y-6">
                {content.imageid && (
                  <div className="w-full">
                    <img
                      src={content.imageid}
                      alt={content.title}
                      className="w-full h-auto max-h-32 object-contain rounded-lg"
                      style={{ aspectRatio: 'auto' }}
                      onLoad={() => console.log('Image loaded successfully:', content.imageid)}
                      onError={() => console.log('Image failed to load:', content.imageid)}
                    />
                  </div>
                )}
                
                <div className="space-y-4">
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
