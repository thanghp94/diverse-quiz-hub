import React from 'react';
import { Content } from "@/hooks/useContent";
import { SubtopicItem } from "./SubtopicItem";

interface Topic {
  id: string;
  topic: string;
  short_summary?: string;
  challengesubject?: string;
  image?: string;
  parentid?: string;
  showstudent?: boolean;
}

interface SubtopicGridProps {
  subtopics: Topic[];
  openContent: string[];
  getTopicContent: (topicId: string) => Content[];
  onToggleContent: (contentKey: string) => void;
  onStartTopicQuiz: (topicId: string, level: 'Overview' | 'Easy' | 'Hard', topicName: string) => void;
  onStartTopicMatching: (topicId: string, topicName: string) => void;
  onContentClick: (info: { content: Content; contextList: Content[] }) => void;
  onStartQuiz: (content: Content, contextList: Content[], level: 'Easy' | 'Hard') => void;
  onStartGroupMatching: (matchingId: string, matchingTitle: string) => void;
  activeContentId: string | null;
  customActions?: (content: Content) => React.ReactNode;
}

export const SubtopicGrid: React.FC<SubtopicGridProps> = ({
  subtopics,
  openContent,
  getTopicContent,
  onToggleContent,
  onStartTopicQuiz,
  onStartTopicMatching,
  onContentClick,
  onStartQuiz,
  onStartGroupMatching,
  activeContentId,
  customActions
}) => {
  if (subtopics.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {subtopics.map((subtopic) => {
          const isSubtopicExpanded = openContent.includes(`subtopic-${subtopic.id}`);
          const subtopicContent = getTopicContent(subtopic.id);
          
          return (
            <SubtopicItem
              key={subtopic.id}
              subtopic={subtopic}
              isExpanded={isSubtopicExpanded}
              subtopicContent={subtopicContent}
              onToggleContent={onToggleContent}
              onStartTopicQuiz={onStartTopicQuiz}
              onStartTopicMatching={onStartTopicMatching}
              onContentClick={onContentClick}
              onStartQuiz={onStartQuiz}
              onStartGroupMatching={onStartGroupMatching}
              activeContentId={activeContentId}
              customActions={customActions}
            />
          );
        })}
      </div>
    </div>
  );
};
