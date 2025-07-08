import React, { useState } from 'react';
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, HelpCircle, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Content } from "@/hooks/useContent";
import { useGroupedContent } from "@/hooks/useGroupedContent";
import { useTopicMatching } from "@/hooks/useTopicMatching";
import { SubtopicMatchingButton } from "@/components/SubtopicMatchingButton";
import { ParentTopicMatchingButton } from "@/components/ParentTopicMatchingButton";
import { GroupedContentCard } from "@/components/GroupedContentCard";
import { ContentCard } from "@/components/ContentCard";
import { useQuery } from "@tanstack/react-query";

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

interface RefactoredTopicListItemProps {
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

const formatDescription = (description: string) => {
  return description.split('\n').map((line, index) => (
    <span key={index} className="text-[#f1f1fd]">
      {line}
      {index < description.split('\n').length - 1 && <br />}
    </span>
  ));
};

// Main content display component using the new hook
const MainContentDisplay = ({ 
  topicContent, 
  onContentClick, 
  onStartQuiz,
  activeContentId,
  customActions 
}: {
  topicContent: Content[];
  onContentClick: (info: { content: Content; contextList: Content[] }) => void;
  onStartQuiz: (content: Content, contextList: Content[], level: 'Easy' | 'Hard') => void;
  activeContentId: string | null;
  customActions?: (content: Content) => React.ReactNode;
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
              <ContentCard
                key={content.id}
                content={content}
                topicContent={topicContent}
                onContentClick={onContentClick}
                onStartQuiz={onStartQuiz}
                activeContentId={activeContentId}
                customActions={customActions}
              />
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

// Subtopic component
const SubtopicItem = ({
  subtopic,
  index,
  isExpanded,
  onToggleContent,
  onStartTopicQuiz,
  onStartTopicMatching,
  getTopicContent,
  onContentClick,
  onStartQuiz,
  activeContentId,
  customActions
}: {
  subtopic: Topic;
  index: number;
  isExpanded: boolean;
  onToggleContent: (contentKey: string) => void;
  onStartTopicQuiz: (topicId: string, level: 'Overview' | 'Easy' | 'Hard', topicName: string) => void;
  onStartTopicMatching: (topicId: string, topicName: string) => void;
  getTopicContent: (topicId: string) => Content[];
  onContentClick: (info: { content: Content; contextList: Content[] }) => void;
  onStartQuiz: (content: Content, contextList: Content[], level: 'Easy' | 'Hard') => void;
  activeContentId: string | null;
  customActions?: (content: Content) => React.ReactNode;
}) => {
  const subtopicContent = getTopicContent(subtopic.id);

  return (
    <div className={cn(
      "bg-white/5 border border-white/20 rounded-lg px-2 pt-2 pb-1 transition-all duration-200",
      isExpanded && "md:col-span-2"
    )}>
      <div 
        className="flex items-center justify-between cursor-pointer py-1"
        onClick={() => onToggleContent(`subtopic-${subtopic.id}`)}
      >
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-bold text-center text-[#ffff78e6]">{subtopic.topic}</span>
          </div>
          {subtopic.short_summary && (
            <p className="text-white/60 text-xs ml-4">{formatDescription(subtopic.short_summary)}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <SubtopicMatchingButton 
            topicId={subtopic.id} 
            topicName={subtopic.topic}
            onStartTopicMatching={onStartTopicMatching}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white/70 hover:bg-white/20 hover:text-white h-6 w-6" onClick={(e) => e.stopPropagation()}>
                <HelpCircle className="h-4 w-4" />
                <span className="sr-only">Start Quiz for {subtopic.topic}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => onStartTopicQuiz(subtopic.id, 'Overview', subtopic.topic)}>Overview Quiz</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStartTopicQuiz(subtopic.id, 'Easy', subtopic.topic)}>Easy Quiz</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStartTopicQuiz(subtopic.id, 'Hard', subtopic.topic)}>Hard Quiz</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ChevronDown className={cn("h-4 w-4 text-white/80 transition-transform duration-200", isExpanded && "rotate-180")} />
        </div>
      </div>
      {subtopicContent.length > 0 && isExpanded && (
        <div className="mt-2">
          <MainContentDisplay
            topicContent={subtopicContent}
            onContentClick={onContentClick}
            onStartQuiz={onStartQuiz}
            activeContentId={activeContentId}
            customActions={customActions}
          />
        </div>
      )}
    </div>
  );
};

export const RefactoredTopicListItem: React.FC<RefactoredTopicListItemProps> = ({
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
  const { matchingActivities, hasMatchingActivities } = useTopicMatching(topic.id);

  // Find topic image
  let topicImageUrl: string | undefined | null = null;
  if (allImages && topicContent.length > 0) {
    for (const content of topicContent) {
      if (content.imageid) {
        const image = allImages.find(img => img.id === content.imageid && img.default === 'Yes');
        if (image && image.imagelink) {
          topicImageUrl = image.imagelink;
          break;
        }
      }
    }
  }

  return (
    <div
      className={cn(
        "bg-white/10 backdrop-blur-lg border-white/20 rounded-lg overflow-hidden border-b-0 transition-all duration-300",
        isExpanded ? "md:col-span-2" : "md:col-span-1",
        isActive && "ring-4 ring-yellow-400/80 bg-yellow-500/20 border-yellow-400/70 shadow-lg shadow-yellow-400/20"
      )}
    >
      {/* Topic Header */}
      <div
        className={cn(
          "flex items-start p-3 text-white w-full text-left cursor-pointer transition-colors hover:bg-white/5",
          isExpanded && "bg-white/5"
        )}
        onClick={() => onToggleTopic(topic.id)}
      >
        {topicImageUrl && (
          <img src={topicImageUrl} alt={topic.topic} className="w-16 h-16 object-cover rounded-md mr-4 flex-shrink-0" />
        )}
        <div className="flex-grow flex items-start justify-between">
          <div className="w-full">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-3 flex-wrap">
                <CardTitle className="text-white text-2xl font-bold">{topic.topic}</CardTitle>
                {topic.challengesubject && (
                  <Badge variant="outline" className="border-white/30 text-white/70 text-sm">
                    {topic.challengesubject}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!topic.parentid && (
                  <ParentTopicMatchingButton 
                    parentTopicId={topic.id} 
                    parentTopicName={topic.topic} 
                    onStartTopicMatching={onStartTopicMatching} 
                  />
                )}
                {hasMatchingActivities && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white/70 hover:bg-white/20 hover:text-white h-6 w-6 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartTopicMatching(topic.id, topic.topic);
                    }}
                  >
                    <Shuffle className="h-4 w-4" />
                    <span className="sr-only">Start Matching for {topic.topic}</span>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white/70 hover:bg-white/20 hover:text-white h-6 w-6 flex-shrink-0">
                      <HelpCircle className="h-4 w-4" />
                      <span className="sr-only">Start Quiz for {topic.topic}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onStartTopicQuiz(topic.id, 'Overview', topic.topic)}>
                      Overview Quiz
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStartTopicQuiz(topic.id, 'Easy', topic.topic)}>
                      Easy Quiz
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStartTopicQuiz(topic.id, 'Hard', topic.topic)}>
                      Hard Quiz
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <ChevronDown className={cn("h-5 w-5 text-white/80 shrink-0 transition-transform duration-200", isExpanded && "rotate-180")} />
              </div>
            </div>
            {topic.short_summary && (
              <p className="text-white/80 text-sm font-normal">{formatDescription(topic.short_summary)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1">
          <div className="space-y-1">
            {/* Main topic content */}
            {topicContent.length > 0 && (
              <MainContentDisplay 
                topicContent={topicContent}
                onContentClick={onContentClick}
                onStartQuiz={onStartQuiz}
                activeContentId={activeContentId}
                customActions={customActions}
              />
            )}

            {/* Subtopics */}
            {subtopics.length > 0 && (
              <div className="mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {subtopics.map((subtopic, index) => {
                    const isSubtopicExpanded = openContent.includes(`subtopic-${subtopic.id}`);
                    return (
                      <SubtopicItem
                        key={subtopic.id}
                        subtopic={subtopic}
                        index={index}
                        isExpanded={isSubtopicExpanded}
                        onToggleContent={onToggleContent}
                        onStartTopicQuiz={onStartTopicQuiz}
                        onStartTopicMatching={onStartTopicMatching}
                        getTopicContent={getTopicContent}
                        onContentClick={onContentClick}
                        onStartQuiz={onStartQuiz}
                        activeContentId={activeContentId}
                        customActions={customActions}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {topicContent.length === 0 && subtopics.length === 0 && (
              <div className="text-center py-4">
                <p className="text-white/60 text-sm">No content available for this topic</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RefactoredTopicListItem;
