import React from 'react';
import { cn } from "@/lib/utils";
import { Content } from "@/hooks/useContent";
import { useTopicMatching } from "@/hooks/useTopicMatching";
import { TopicHeader } from "./TopicHeader";
import { TopicContent } from "./TopicContent";

interface Topic {
  id: string;
  topic: string;
  short_summary?: string;
  challengesubject?: string;
  image?: string;
  parentid?: string;
  showstudent?: boolean;
}

interface Image {
  id: string;
  imagelink: string | null;
  contentid: string | null;
  default: string | null;
}

interface ModularTopicListItemProps {
  topic: Topic;
  subtopics: Topic[];
  topicContent: Content[];
  allImages: Image[] | undefined;
  isExpanded: boolean;
  isActive: boolean;
  openContent: string[];
  onToggleTopic: (topicId: string) => void;
  onToggleContent: (contentKey: string) => void;
  onContentClick: (info: { content: Content; contextList: Content[] }) => void;
  onSubtopicClick: (topicId: string) => void;
  onStartQuiz: (content: Content, contextList: Content[], level: 'Easy' | 'Hard') => void;
  getTopicContent: (topicId: string) => Content[];
  onStartTopicQuiz: (topicId: string, level: 'Overview' | 'Easy' | 'Hard', topicName: string) => void;
  onStartTopicMatching: (topicId: string, topicName: string) => void;
  onStartGroupMatching: (matchingId: string, matchingTitle: string) => void;
  onToggleGroupCard: (groupCardId: string) => void;
  isGroupCardExpanded: (groupCardId: string) => boolean;
  activeContentId: string | null;
  customActions?: (content: Content) => React.ReactNode;
}

// Helper function to find topic image
const findTopicImage = (topicContent: Content[], allImages: Image[] | undefined): string | null => {
  if (!allImages || topicContent.length === 0) return null;
  
  for (const content of topicContent) {
    if (content.imageid) {
      const image = allImages.find(img => img.id === content.imageid && img.default === 'Yes');
      if (image && image.imagelink) {
        return image.imagelink;
      }
    }
  }
  return null;
};

export const ModularTopicListItem: React.FC<ModularTopicListItemProps> = ({
  topic,
  subtopics,
  topicContent,
  allImages,
  isExpanded,
  isActive,
  openContent,
  onToggleTopic,
  onToggleContent,
  onContentClick,
  onSubtopicClick,
  onStartQuiz,
  getTopicContent,
  onStartTopicQuiz,
  onStartTopicMatching,
  onStartGroupMatching,
  onToggleGroupCard,
  isGroupCardExpanded,
  activeContentId,
  customActions
}) => {
  const { hasMatchingActivities = false } = useTopicMatching(topic.id);
  const topicImageUrl = findTopicImage(topicContent, allImages);

  return (
    <div
      className={cn(
        "bg-white/10 backdrop-blur-lg border-white/20 rounded-lg overflow-hidden border-b-0 transition-all duration-300",
        isExpanded ? "md:col-span-2" : "md:col-span-1",
        isActive && "ring-4 ring-yellow-400/80 bg-yellow-500/20 border-yellow-400/70 shadow-lg shadow-yellow-400/20"
      )}
    >
      {/* Topic Header */}
      <TopicHeader
        topic={topic}
        topicImageUrl={topicImageUrl}
        isExpanded={isExpanded}
        hasMatchingActivities={hasMatchingActivities}
        onToggleTopic={onToggleTopic}
        onStartTopicQuiz={onStartTopicQuiz}
        onStartTopicMatching={onStartTopicMatching}
      />

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1">
          <TopicContent
            topicContent={topicContent}
            subtopics={subtopics}
            openContent={openContent}
            getTopicContent={getTopicContent}
            onToggleContent={onToggleContent}
            onContentClick={onContentClick}
            onStartQuiz={onStartQuiz}
            onStartTopicQuiz={onStartTopicQuiz}
            onStartTopicMatching={onStartTopicMatching}
            onStartGroupMatching={onStartGroupMatching}
            activeContentId={activeContentId}
            customActions={customActions}
          />
        </div>
      )}
    </div>
  );
};

export default ModularTopicListItem;
