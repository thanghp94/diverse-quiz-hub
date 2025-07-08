import React from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Content } from "@/hooks/useContent";
import { SubtopicMatchingButton } from "@/components/SubtopicMatchingButton";
import { GroupContentManager } from "@/components/GroupContentManager";

interface Topic {
  id: string;
  topic: string;
  short_summary?: string;
  challengesubject?: string;
  image?: string;
  parentid?: string;
  showstudent?: boolean;
}

interface SubtopicItemProps {
  subtopic: Topic;
  isExpanded: boolean;
  subtopicContent: Content[];
  onToggleContent: (contentKey: string) => void;
  onStartTopicQuiz: (topicId: string, level: 'Overview' | 'Easy' | 'Hard', topicName: string) => void;
  onStartTopicMatching: (topicId: string, topicName: string) => void;
  onContentClick: (info: { content: Content; contextList: Content[] }) => void;
  onStartQuiz: (content: Content, contextList: Content[], level: 'Easy' | 'Hard') => void;
  onStartGroupMatching: (matchingId: string, matchingTitle: string) => void;
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

export const SubtopicItem: React.FC<SubtopicItemProps> = ({
  subtopic,
  isExpanded,
  subtopicContent,
  onToggleContent,
  onStartTopicQuiz,
  onStartTopicMatching,
  onContentClick,
  onStartQuiz,
  onStartGroupMatching,
  activeContentId,
  customActions
}) => {
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
          <GroupContentManager
            topicContent={subtopicContent}
            onContentClick={onContentClick}
            onStartQuiz={onStartQuiz}
            onStartGroupMatching={onStartGroupMatching}
            activeContentId={activeContentId}
            customActions={customActions}
          />
        </div>
      )}
    </div>
  );
};
