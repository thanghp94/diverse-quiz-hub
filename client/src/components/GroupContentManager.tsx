import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Content } from "@/hooks/useContent";
import { useGroupedContent } from "@/hooks/useGroupedContent";
import { GroupedContentCard } from "@/components/GroupedContentCard";
import { ContentCard } from "@/components/ContentCard";

interface GroupContentManagerProps {
  topicContent: Content[];
  onContentClick: (info: { content: Content; contextList: Content[] }) => void;
  onStartQuiz: (content: Content, contextList: Content[], level: 'Easy' | 'Hard') => void;
  onStartGroupMatching: (matchingId: string, matchingTitle: string) => void;
  activeContentId: string | null;
  customActions?: (content: Content) => React.ReactNode;
}

export const GroupContentManager: React.FC<GroupContentManagerProps> = ({
  topicContent,
  onContentClick,
  onStartQuiz,
  onStartGroupMatching,
  activeContentId,
  customActions
}) => {
  const { groupCards, ungroupedContent, groupedContentMap } = useGroupedContent(topicContent);

  return (
    <div className="space-y-4">
      {/* Display ungrouped content first */}
      {ungroupedContent.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-white/80 text-sm font-medium">Individual Content</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ungroupedContent.map((content: Content) => (
              <div key={content.id} className={cn(
                "transition-all duration-200 rounded-lg",
                activeContentId === content.id && "ring-4 ring-yellow-400/80 bg-yellow-500/20 shadow-lg shadow-yellow-400/20"
              )}>
                <ContentCard
                  content={content}
                  topicContent={topicContent}
                  onContentClick={onContentClick}
                  onStartQuiz={onStartQuiz}
                  activeContentId={activeContentId}
                  customActions={customActions}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display grouped content cards */}
      {groupCards.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-white/80 text-sm font-medium">Grouped Content</h4>
          <div className="space-y-4">
            {groupCards.map((groupContent: Content) => {
              const relatedContent: Content[] = groupedContentMap.get(groupContent.id) || [];
              return (
                <GroupedContentCard
                  key={groupContent.id}
                  groupContent={groupContent}
                  groupedContent={relatedContent}
                  onContentClick={onContentClick}
                  onStartQuiz={onStartQuiz}
                  activeContentId={activeContentId}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
