
import { Content } from "@/hooks/useContent";
import { PopupHeader } from "./PopupHeader";
import { MediaDisplay } from "./MediaDisplay";
import { VideoPlayer } from "./VideoPlayer";
import { ContentBody } from "./ContentBody";

interface ContentPopupViewProps {
  content: Content;
  contentListLength: number;
  currentIndex: number;
  handlePrevious: () => void;
  handleNext: () => void;
  startQuiz: (level?: 'Easy' | 'Hard') => void;
  imageUrl: string | null | undefined;
  isImageLoading: boolean;
  videoEmbedUrl: string | null;
  video2EmbedUrl: string | null;
  videoData: {
    video_name?: string | null;
  } | null;
  video2Data: {
    video_name?: string | null;
  } | null;
}

export const ContentPopupView = ({
  content,
  contentListLength,
  currentIndex,
  handlePrevious,
  handleNext,
  startQuiz,
  imageUrl,
  isImageLoading,
  videoEmbedUrl,
  video2EmbedUrl,
  videoData,
  video2Data
}: ContentPopupViewProps) => {

  return (
    <div className="py-4 space-y-6">
      <PopupHeader
        contentListLength={contentListLength}
        currentIndex={currentIndex}
        handlePrevious={handlePrevious}
        handleNext={handleNext}
        startQuiz={startQuiz}
        translation={content.translation}
      />

      <MediaDisplay
        imageUrl={imageUrl}
        isImageLoading={isImageLoading}
        title={content.title}
        imageid={content.imageid}
      />
      
      <VideoPlayer 
        videoEmbedUrl={videoEmbedUrl}
        video2EmbedUrl={video2EmbedUrl}
        videoData={videoData}
        video2Data={video2Data}
      />

      <ContentBody content={content} />
    </div>
  );
};
