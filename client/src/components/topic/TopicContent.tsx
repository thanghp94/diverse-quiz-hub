import React from 'react';
import { Content } from "@/hooks/useContent";
import { GroupContentManager } from "@/components/GroupContentManager";
import { SubtopicGrid } from "./SubtopicGrid";

interface Topic {
  id: string;
  topic: string;
  short_summary?: string;
  challengesubject?: string;
  image?: string;
  parentid?: string;
  showstudent?: boolean;
}

interface TopicContentProps {
  topicContent: Content[];
  subtopics: Topic[];
  openContent: string[];
  getTopicContent: (topicId: string) => Content[];
  onToggleContent: (contentKey: string) => void;
  onContentClick: (info: { content: Content; contextList: Content[] }) => void;
  onStartQuiz: (content: Content, contextList: Content[], level: 'Easy' | 'Hard') => void;
  onStartTopicQuiz: (topicId: string, level: 'Overview' | 'Easy' | 'Hard', topicName: string) => void;
  onStartTopicMatching: (topicId: string, topicName: string) => void;
  onStartGroupMatching: (matchingId: string, matchingTitle: string) => void;
  activeContentId: string | null;
  customActions?: (content: Content) => React.ReactNode;
}

export const TopicContent: React.FC<TopicContentProps> = ({
  topicContent,
  subtopics,
  openContent,
  getTopicContent,
  onToggleContent,
  onContentClick,
  onStartQuiz,
  onStartTopicQuiz,
  onStartTopicMatching,
  onStartGroupMatching,
  activeContentId,
  customActions
}) => {
  const hasContent = topicContent.length > 0;
  const hasSubtopics = subtopics.length > 0;

  if (!hasContent && !hasSubtopics) {
    return (
      <div className="text-center py-4">
        <p className="text-white/60 text-sm">No content available for this topic</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Main topic content using GroupContentManager */}
      {hasContent && (
        <GroupContentManager
          topicContent={topicContent}
          onContentClick={onContentClick}
          onStartQuiz={onStartQuiz}
          onStartGroupMatching={onStartGroupMatching}
          activeContentId={activeContentId}
          customActions={customActions}
        />
      )}

      {/* Subtopics */}
      <SubtopicGrid
        subtopics={subtopics}
        openContent={openContent}
        getTopicContent={getTopicContent}
        onToggleContent={onToggleContent}
        onStartTopicQuiz={onStartTopicQuiz}
        onStartTopicMatching={onStartTopicMatching}
        onContentClick={onContentClick}
        onStartQuiz={onStartQuiz}
        onStartGroupMatching={onStartGroupMatching}
        activeContentId={activeContentId}
        customActions={customActions}
      />
    </div>
  );
};
