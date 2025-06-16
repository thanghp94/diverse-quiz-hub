import React from 'react';
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, BookOpen, Play, HelpCircle, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Content } from "@/hooks/useContent";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useContentImage } from "@/hooks/useContentImage";
import { useTopicMatching } from "@/hooks/useTopicMatching";
import { SubtopicMatchingButton } from "@/components/SubtopicMatchingButton";
import { ParentTopicMatchingButton } from "@/components/ParentTopicMatchingButton";
import { CompactContentDifficultyIndicator } from "@/components/ContentDifficultyIndicator";
import { ContentRatingButtons } from "@/components/ContentRatingButtons";

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

interface TopicListItemProps {
    topic: Topic;
    subtopics: Topic[];
    topicContent: Content[];
    allImages: Image[] | undefined;
    isExpanded: boolean;
    openContent: string[];
    onToggleTopic: (topicId: string) => void;
    onToggleContent: (contentKey: string) => void;
    onContentClick: (info: { content: Content; contextList: Content[] }) => void;
    onSubtopicClick: (topicId: string) => void;
    onStartQuiz: (content: Content, contextList: Content[], level?: 'Easy' | 'Hard') => void;
    getTopicContent: (topicId: string) => Content[];
    onStartTopicQuiz: (topicId: string, level: 'Overview' | 'Easy' | 'Hard', topicName: string) => void;
    onStartTopicMatching: (topicId: string, topicName: string) => void;
}

const getContentIcon = (content: any) => {
    if (content.videoid || content.videoid2) return <Play className="h-3 w-3" />;
    if (content.url) return <BookOpen className="h-3 w-3" />;
    return <BookOpen className="h-3 w-3" />;
};

// Component for content item thumbnail
const ContentThumbnail = ({ content }: { content: any }) => {
  const { data: imageUrl } = useContentImage(content.imageid);
  
  // Only show thumbnail if there's an imageid
  if (!content.imageid || !imageUrl) {
    return null;
  }
  
  return (
    <div className="w-24 h-28 rounded-md overflow-hidden flex-shrink-0">
      <img 
        src={imageUrl} 
        alt={content.title} 
        className="w-full h-full object-cover"
      />
    </div>
  );
};

const getContentTypeColor = (content: any) => {
    if (content.videoid || content.videoid2) return 'bg-red-500/20 text-red-200';
    if (content.url) return 'bg-blue-500/20 text-blue-200';
    return 'bg-green-500/20 text-green-200';
};







const getSubtopicLabel = (parentTopic: string, index: number) => {
    const letter = parentTopic.charAt(0).toUpperCase();
    return `${letter}.${index + 1}`;
};

const formatDescription = (description: string) => {
    return description.split('\n').map((line, index) => <span key={index}>
        {line}
        {index < description.split('\n').length - 1 && <br />}
      </span>);
};

export const TopicListItem = ({
    topic,
    subtopics,
    topicContent,
    allImages,
    isExpanded,
    openContent,
    onToggleTopic,
    onToggleContent,
    onContentClick,
    onSubtopicClick,
    onStartQuiz,
    getTopicContent,
    onStartTopicQuiz,
    onStartTopicMatching
}: TopicListItemProps) => {
    const { hasMatchingActivities } = useTopicMatching(topic.id);
    
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
            isExpanded ? "md:col-span-2" : "md:col-span-1"
          )}
        >
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
                  <div className="flex items-center gap-2">
                    {/* Show parent topic matching button if this is a parent topic (no parentid) */}
                    {!topic.parentid && (
                      <ParentTopicMatchingButton 
                        parentTopicId={topic.id} 
                        parentTopicName={topic.topic} 
                        onStartTopicMatching={onStartTopicMatching} 
                      />
                    )}
                    {/* Show individual topic matching button if this topic has its own activities */}
                    {hasMatchingActivities && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-white/70 hover:bg-white/20 hover:text-white h-8 w-8 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartTopicMatching(topic.id, topic.topic);
                        }}
                      >
                        <Shuffle className="h-5 w-5" />
                        <span className="sr-only">Start Matching for {topic.topic}</span>
                      </Button>
                    )}
                    <div className="flex flex-col items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-white/70 hover:bg-white/20 hover:text-white h-8 w-8 flex-shrink-0">
                            <HelpCircle className="h-5 w-5" />
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
                      <ContentRatingButtons 
                        contentId={topic.id}
                        compact={true}
                      />
                    </div>
                    <ChevronDown className={cn("h-6 w-6 text-white/80 shrink-0 transition-transform duration-200", isExpanded && "rotate-180")} />
                  </div>
                </div>
                {topic.short_summary && (
                  <p className="text-white/80 text-sm font-normal">{formatDescription(topic.short_summary)}</p>
                )}
              </div>
            </div>
          </div>
          
          {isExpanded && (
            <div className="px-3 pb-3 pt-1">
              <div className="space-y-1">
                {topicContent.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {topicContent.map(content => (
                      <div key={content.id} className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div
                            onClick={() => onContentClick({
                              content,
                              contextList: topicContent
                            })}
                            className="flex-grow cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <ContentThumbnail content={content} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-2 mb-1">
                                  <Badge className={`${getContentTypeColor(content)} text-sm`}>
                                    {getContentIcon(content)}
                                  </Badge>
                                </div>
                                <h4 className="text-white/90 text-base font-medium leading-tight mb-2">{content.title}</h4>
                                {content.short_description && <p className="text-white/60 text-sm leading-relaxed">{formatDescription(content.short_description)}</p>}
                                <div className="mt-2">
                                  <CompactContentDifficultyIndicator contentId={content.id} />
                                </div>
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-white/70 hover:bg-white/20 hover:text-white flex-shrink-0 mt-1">
                                <HelpCircle className="h-5 w-5" />
                                <span className="sr-only">Start Quiz for {content.title}</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => onStartQuiz(content, topicContent, 'Easy')}>
                                Easy Quiz
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onStartQuiz(content, topicContent, 'Hard')}>
                                Hard Quiz
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              
                {subtopics.length > 0 && (
                  <div className="mt-3">
                    <div className="space-y-2">
                      {subtopics.map((subtopic, index) => {
                        const subtopicContent = getTopicContent(subtopic.id);
                        return (
                          <div key={subtopic.id} className="bg-white/5 border border-white/10 rounded-lg p-2">
                            <div 
                              className="flex items-start justify-between cursor-pointer"
                              onClick={() => onToggleContent(`subtopic-${subtopic.id}`)}
                            >
                              <div className="flex-grow">
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge className="bg-green-500/20 text-green-200 text-xs">
                                    <BookOpen className="h-3 w-3" />
                                  </Badge>
                                  <span className="text-white/90 text-lg font-bold">{getSubtopicLabel(topic.topic, index)} - {subtopic.topic}</span>

                                </div>
                                {subtopic.short_summary && <p className="text-white/60 text-xs ml-6">{formatDescription(subtopic.short_summary)}</p>}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <SubtopicMatchingButton 
                                  topicId={subtopic.id} 
                                  topicName={subtopic.topic}
                                  onStartTopicMatching={onStartTopicMatching}
                                />
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="text-white/70 hover:bg-white/20 hover:text-white" onClick={(e) => e.stopPropagation()}>
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
                                <ChevronDown className={cn("h-5 w-5 text-white/80 transition-transform duration-200", openContent.includes(`subtopic-${subtopic.id}`) && "rotate-180")} />
                              </div>
                            </div>
                          
                            {subtopicContent.length > 0 && openContent.includes(`subtopic-${subtopic.id}`) && (
                              <div className="mt-3 grid grid-cols-2 gap-3">
                                {subtopicContent.map(content => (
                                  <div key={content.id} className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 rounded-lg p-3">
                                    <div className="flex items-start justify-between gap-2">
                                      <div
                                        onClick={() => onContentClick({
                                          content,
                                          contextList: subtopicContent
                                        })}
                                        className="flex-grow cursor-pointer"
                                      >
                                        <div className="flex items-center gap-2">
                                          <ContentThumbnail content={content} />
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                              <h4 className="text-white/90 text-base font-medium leading-tight">{content.title}</h4>
                                              <CompactContentDifficultyIndicator contentId={content.id} />
                                            </div>
                                            {content.short_description && <p className="text-white/60 text-sm leading-relaxed">{formatDescription(content.short_description)}</p>}
                                          </div>
                                        </div>
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="text-white/70 hover:bg-white/20 hover:text-white flex-shrink-0 mt-1">
                                            <HelpCircle className="h-5 w-5" />
                                            <span className="sr-only">Start Quiz for {content.title}</span>
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                          <DropdownMenuItem onClick={() => onStartQuiz(content, subtopicContent, 'Easy')}>
                                            Easy Quiz
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => onStartQuiz(content, subtopicContent, 'Hard')}>
                                            Hard Quiz
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              
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
}

export default TopicListItem;
