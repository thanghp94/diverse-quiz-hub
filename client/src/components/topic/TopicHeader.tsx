import React from 'react';
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, HelpCircle, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ParentTopicMatchingButton } from "@/components/ParentTopicMatchingButton";

interface Topic {
  id: string;
  topic: string;
  short_summary?: string;
  challengesubject?: string;
  image?: string;
  parentid?: string;
  showstudent?: boolean;
}

interface TopicHeaderProps {
  topic: Topic;
  topicImageUrl: string | null;
  isExpanded: boolean;
  hasMatchingActivities: boolean;
  onToggleTopic: (topicId: string) => void;
  onStartTopicQuiz: (topicId: string, level: 'Overview' | 'Easy' | 'Hard', topicName: string) => void;
  onStartTopicMatching: (topicId: string, topicName: string) => void;
}

const formatDescription = (description: string) => {
  return description.split('\n').map((line, index) => (
    <span key={index} className="text-[#f1f1fd]">
      {line}
      {index < description.split('\n').length - 1 && <br />}
    </span>
  ));
};

export const TopicHeader: React.FC<TopicHeaderProps> = ({
  topic,
  topicImageUrl,
  isExpanded,
  hasMatchingActivities,
  onToggleTopic,
  onStartTopicQuiz,
  onStartTopicMatching
}) => {
  return (
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
  );
};
