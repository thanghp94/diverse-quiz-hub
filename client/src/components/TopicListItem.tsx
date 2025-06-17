import React, { useState } from 'react';
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChevronDown, BookOpen, Play, HelpCircle, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Content } from "@/hooks/useContent";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useContentImage } from "@/hooks/useContentImage";
import { useContentMedia } from "@/hooks/useContentMedia";
import { useTopicMatching } from "@/hooks/useTopicMatching";
import { SubtopicMatchingButton } from "@/components/SubtopicMatchingButton";
import { ParentTopicMatchingButton } from "@/components/ParentTopicMatchingButton";
import { CompactContentDifficultyIndicator } from "@/components/ContentDifficultyIndicator";
import { ContentRatingButtons } from "@/components/ContentRatingButtons";
import { ContentGroupCard, ContentGroupPopup } from "@/components/ContentGroupCard";
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
    onStartQuiz: (content: Content, contextList: Content[], level: 'Easy' | 'Hard') => void;
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
const ContentThumbnail = ({ content, onClick }: { content: any, onClick?: () => void }) => {
  const { data: imageUrl } = useContentImage(content.imageid);

  // Only show thumbnail if there's an imageid
  if (!content.imageid || !imageUrl) {
    return null;
  }

  return (
    <div className="w-24 h-28 rounded-md overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={onClick}>
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

// Shared ContentCard component
const ContentCard = ({ content, topicContent, onContentClick, onStartQuiz }: { 
  content: Content; 
  topicContent: Content[];
  onContentClick: (info: { content: Content; contextList: Content[] }) => void;
  onStartQuiz: (content: Content, contextList: Content[], level: 'Easy' | 'Hard') => void;
}) => {
  const { videoData, video2Data, videoEmbedUrl, video2EmbedUrl } = useContentMedia(content);
  const [videoPopupOpen, setVideoPopupOpen] = useState(false);

  const hasVideo1 = videoEmbedUrl && videoData;
  const hasVideo2 = video2EmbedUrl && video2Data;

  return (
    <>
      <div className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 rounded-lg p-3">
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
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-white/90 text-base font-medium leading-tight flex-1 min-w-0">{content.title}</h4>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="text-black hover:bg-white/20 hover:text-black bg-white/90 border-white/50 text-xs px-2 py-1 h-6">
                          Quiz
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          console.log('Easy Quiz clicked for content:', content.id, content.title);
                          onStartQuiz(content, topicContent, 'Easy');
                        }}>
                          Easy Quiz
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          console.log('Hard Quiz clicked for content:', content.id, content.title);
                          onStartQuiz(content, topicContent, 'Hard');
                        }}>
                          Hard Quiz
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {(hasVideo1 || hasVideo2) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-black hover:bg-white/20 hover:text-black bg-white/90 border-white/50 text-xs px-2 py-1 h-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVideoPopupOpen(true);
                        }}
                      >
                        Video
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video popup */}
      {videoPopupOpen && (
        <VideoPopup
          isOpen={videoPopupOpen}
          onClose={() => setVideoPopupOpen(false)}
          content={content}
          videoData={videoData}
          video2Data={video2Data}
          videoEmbedUrl={videoEmbedUrl}
          video2EmbedUrl={video2EmbedUrl}
        />
      )}
    </>
  );
};

// Component to display content organized by contentgroup
const GroupedContentDisplay = ({ 
  topicId, 
  topicContent, 
  onContentClick, 
  onStartQuiz 
}: {
  topicId: string;
  topicContent: Content[];
  onContentClick: (info: { content: Content; contextList: Content[] }) => void;
  onStartQuiz: (content: Content, contextList: Content[], level: 'Easy' | 'Hard') => void;
}) => {
  const [selectedContentGroup, setSelectedContentGroup] = useState<{
    groupName: string;
    content: Content[];
  } | null>(null);

  // Group content by contentgroup field
  const groupedContent = React.useMemo(() => {
    const groups: { [key: string]: Content[] } = {};
    const ungrouped: Content[] = [];
    
    topicContent.forEach(content => {
      if (content.contentgroup && content.contentgroup.trim() !== '') {
        if (!groups[content.contentgroup]) {
          groups[content.contentgroup] = [];
        }
        groups[content.contentgroup].push(content);
      } else {
        ungrouped.push(content);
      }
    });
    
    return { groups, ungrouped };
  }, [topicContent]);

  const handleContentGroupClick = (groupName: string, content: Content[]) => {
    setSelectedContentGroup({ groupName, content });
  };

  const handleGroupContentClick = (content: Content, contextList: Content[]) => {
    setSelectedContentGroup(null);
    onContentClick({ content, contextList });
  };

  const getGroupDescription = (groupName: string): string => {
    switch (groupName.toLowerCase()) {
      case 'return of kings':
        return 'Real kings in history that was not in power but due to some unexpected event, return to the throne and how they deal with their kingdom afterward';
      case 'returns of characters':
        return 'Some characters in books, movies that also had to hide away but return through their bravery or unexpected events.';
      case 'speech by famous people':
        return 'Notable speeches delivered by influential historical figures.';
      default:
        return `Content related to ${groupName}`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Display individual content cards for ungrouped content */}
      {groupedContent.ungrouped.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-white/80 text-sm font-medium">Main Content</h4>
          <div className="grid grid-cols-2 gap-3">
            {groupedContent.ungrouped.map(content => (
              <ContentCard 
                key={content.id} 
                content={content} 
                topicContent={topicContent}
                onContentClick={onContentClick}
                onStartQuiz={onStartQuiz}
              />
            ))}
          </div>
        </div>
      )}

      {/* Display content group cards */}
      {Object.entries(groupedContent.groups).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-white/80 text-sm font-medium">Content Categories</h4>
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(groupedContent.groups).map(([groupName, content]) => (
              <ContentGroupCard
                key={groupName}
                groupName={groupName}
                description={getGroupDescription(groupName)}
                contentCount={content.length}
                onClick={() => handleContentGroupClick(groupName, content)}
                className="w-full"
              />
            ))}
          </div>
        </div>
      )}

      {/* Content Group Popup */}
      {selectedContentGroup && (
        <ContentGroupPopup
          isOpen={true}
          onClose={() => setSelectedContentGroup(null)}
          groupName={selectedContentGroup.groupName}
          content={selectedContentGroup.content}
          onContentClick={handleGroupContentClick}
        />
      )}
    </div>
  );
};

// Component to organize content by matching activities (kept for compatibility)
const TopicContentWithMatching = ({ 
  topicId, 
  topicContent, 
  onContentClick, 
  onStartQuiz 
}: {
  topicId: string;
  topicContent: Content[];
  onContentClick: (info: { content: Content; contextList: Content[] }) => void;
  onStartQuiz: (content: Content, contextList: Content[], level: 'Easy' | 'Hard') => void;
}) => {
  const [expandedMatching, setExpandedMatching] = React.useState<string | null>(null);

  // Fetch matching activities for this topic
  const { data: matchingActivities } = useQuery({
    queryKey: ['matchingByTopic', topicId],
    queryFn: async () => {
      const response = await fetch(`/api/matching/topic/${topicId}`);
      if (!response.ok) throw new Error('Failed to fetch matching activities');
      return response.json();
    },
  });

  // Debug log
  React.useEffect(() => {
    if (matchingActivities) {
      console.log(`Topic ${topicId} matching activities:`, matchingActivities);
      console.log(`Topic ${topicId} content:`, topicContent);
    }
  }, [matchingActivities, topicContent, topicId]);

  // Enhanced function to get content IDs from prompt
  const getContentIdsFromPrompt = (matching: any) => {
    const contentIds = new Set<string>();

    // Check all prompt fields
    const promptFields = ['prompt', 'prompt1', 'prompt2', 'prompt3', 'prompt4', 'prompt5', 'prompt6'];

    promptFields.forEach(field => {
      if (matching[field]) {
        const promptText = matching[field].toString();

        // Try to match UUID patterns (both full and short)
        const uuidPattern = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}|[a-f0-9]{8}/gi;
        const matches = promptText.match(uuidPattern) || [];
        matches.forEach(id => contentIds.add(id));

        // Also try to match content by title or partial text match
        topicContent.forEach(content => {
          if (promptText.toLowerCase().includes(content.title?.toLowerCase() || '')) {
            contentIds.add(content.id);
          }
        });
      }
    });

    return Array.from(contentIds);
  };

  // Group content by matching activities
  const organizedContent = React.useMemo(() => {
    if (!matchingActivities?.length || !topicContent?.length) {
      return {
        ungrouped: topicContent || [],
        grouped: []
      };
    }

    const grouped: Array<{
      matching: any;
      content: Content[];
    }> = [];

    const usedContentIds = new Set<string>();

    // For each matching activity, find associated content
    matchingActivities.forEach((matching: any) => {
      const contentIds = getContentIdsFromPrompt(matching);
      console.log(`Matching ${matching.id} content IDs:`, contentIds);

      const associatedContent = topicContent.filter(content => 
        contentIds.includes(content.id)
      );

      console.log(`Matching ${matching.id} associated content:`, associatedContent);

      // Even if no content is directly associated, still show the matching activity
      // This way users can see that matching activities exist for this topic
      grouped.push({
        matching,
        content: associatedContent
      });

      associatedContent.forEach(content => usedContentIds.add(content.id));
    });

    // Remaining content that wasn't grouped
    const ungrouped = topicContent.filter(content => !usedContentIds.has(content.id));

    console.log(`Topic ${topicId} organized:`, { ungrouped: ungrouped.length, grouped: grouped.length });
    return { ungrouped, grouped };
  }, [matchingActivities, topicContent, topicId]);

  const ContentCard = ({ content }: { content: Content }) => {
    const { videoData, video2Data, videoEmbedUrl, video2EmbedUrl } = useContentMedia(content);
    const [videoPopupOpen, setVideoPopupOpen] = useState(false);

    const hasVideo1 = videoEmbedUrl && videoData;
    const hasVideo2 = video2EmbedUrl && video2Data;

    return (
      <>
        <div className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 rounded-lg p-3">
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
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-white/90 text-base font-medium leading-tight flex-1 min-w-0">{content.title}</h4>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="text-black hover:bg-white/20 hover:text-black bg-white/90 border-white/50 text-xs px-2 py-1 h-6">
                            Quiz
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            console.log('Easy Quiz clicked for content:', content.id, content.title);
                            onStartQuiz(content, topicContent, 'Easy');
                          }}>
                            Easy Quiz
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            console.log('Hard Quiz clicked for content:', content.id, content.title);
                            onStartQuiz(content, topicContent, 'Hard');
                          }}>
                            Hard Quiz
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {(hasVideo1 || hasVideo2) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-white hover:bg-red-500/20 hover:text-white bg-red-500/10 border-red-400/50 text-xs px-2 py-1 h-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            setVideoPopupOpen(true);
                          }}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Video{(hasVideo1 && hasVideo2) ? 's' : ''}
                        </Button>
                      )}
                    </div>
                  </div>
                  {content.short_description && <p className="text-white/60 text-sm leading-relaxed">{formatDescription(content.short_description)}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <CompactContentDifficultyIndicator contentId={content.id} />
                    <div className="flex items-center gap-1">
                      <ContentRatingButtons 
                        key={`${content.id}-rating`}
                        contentId={content.id}
                        compact={true}
                        studentId={localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!).id : 'GV0002'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Popup - Using Dialog */}
        <Dialog open={videoPopupOpen} onOpenChange={setVideoPopupOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] p-0 bg-gray-900 border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
              <h3 className="text-white text-lg font-medium truncate mr-4">{content.title}</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setVideoPopupOpen(false)}
                className="text-white hover:bg-white/20 flex-shrink-0"
              >
                ✕
              </Button>
            </div>
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {hasVideo1 && (
                <div>
                  {videoData.video_name && (
                    <h4 className="text-white font-medium mb-3 text-base">{videoData.video_name}</h4>
                  )}
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe 
                      className="w-full h-full" 
                      src={videoEmbedUrl} 
                      title={videoData.video_name || 'Video 1'} 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
              {hasVideo2 && (
                <div>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe 
                      className="w-full h-full" 
                      src={video2EmbedUrl} 
                      title={video2Data.video_name || 'Video 2'} 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  return (
    <div className="space-y-4">
      {/* Debug info */}
      {matchingActivities && matchingActivities.length > 0 && (
        <div className="text-xs text-gray-400 mb-2">
          Found {matchingActivities.length} matching activities for this topic
        </div>
      )}

      {/* Ungrouped content at the top */}
      {organizedContent.ungrouped.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-white/80 text-sm font-medium">Content</h4>
          <div className="grid grid-cols-2 gap-3">
            {organizedContent.ungrouped.map(content => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        </div>
      )}

      {/* Matching activity section */}
      {organizedContent.grouped.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-white/80 text-sm font-medium">Matching Activities</h4>

          {/* Matching activity cards in 2-column layout */}
          <div className="grid grid-cols-2 gap-3">
            {organizedContent.grouped.map(({ matching, content }) => (
              <div
                key={matching.id}
                className={cn(
                  "cursor-pointer bg-blue-500/10 border border-blue-400/30 hover:bg-blue-500/20 transition-all duration-200 rounded-lg p-3",
                  expandedMatching === matching.id && "ring-2 ring-blue-400/50"
                )}
                onClick={() => setExpandedMatching(expandedMatching === matching.id ? null : matching.id)}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="bg-blue-500/30 p-2 rounded-lg border border-blue-400/40">
                    <Shuffle className="h-5 w-5 text-blue-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white/90 text-sm font-medium leading-tight">
                      {matching.topic || matching.description || matching.subject || 'Matching Activity'}
                    </h4>
                    <p className="text-white/60 text-xs mt-1">
                      {content.length > 0 ? `${content.length} content items` : 'Click to start'}
                    </p>
                    <Badge variant="outline" className="border-blue-300/30 text-blue-200 text-xs mt-2">
                      Matching
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Expanded content for selected matching activity - breaks out of grid */}
          {expandedMatching && (
            <div className="mt-4 p-4 bg-blue-500/5 border border-blue-400/20 rounded-lg">
              {(() => {
                const selectedGroup = organizedContent.grouped.find(g => g.matching.id === expandedMatching);
                if (!selectedGroup) return null;

                return (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-white/90 font-medium">
                        {selectedGroup.matching.topic || selectedGroup.matching.description || 'Matching Activity Content'}
                      </h5>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedMatching(null)}
                        className="text-white/60 hover:text-white"
                      >
                        Collapse
                      </Button>
                    </div>

                    {selectedGroup.content.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {selectedGroup.content.map(contentItem => (
                          <ContentCard key={contentItem.id} content={contentItem} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-white/60 text-sm">
                          No specific content items are linked to this matching activity.
                        </p>
                        <p className="text-white/60 text-xs mt-1">
                          The activity may use content from multiple topics or external sources.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
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
                  <GroupedContentDisplay 
                    topicId={topic.id}
                    topicContent={topicContent}
                    onContentClick={onContentClick}
                    onStartQuiz={onStartQuiz}
                  />
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
                                  <span className="text-white/90 text-lg font-bold text-center">{subtopic.topic}</span>

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
                                {subtopicContent.map(content => {
                                  const SubtopicContentCard = () => {
                                    const { videoData, video2Data, videoEmbedUrl, video2EmbedUrl } = useContentMedia(content);
                                    const [videoPopupOpen, setVideoPopupOpen] = useState(false);

                                    const hasVideo1 = videoEmbedUrl && videoData;
                                    const hasVideo2 = video2EmbedUrl && video2Data;

                                    return (
                                      <>
                                        <div className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 rounded-lg p-3">
                                          <div className="flex items-start justify-between gap-2">
                                            <div
                                              onClick={() => onContentClick({
                                                content,
                                                contextList: subtopicContent
                                              })}
                                              className="flex-grow cursor-pointer"
                                            >
                                              <div className="flex items-center gap-2">
                                                <ContentThumbnail 
                                                  content={content} 
                                                  onClick={() => onContentClick({
                                                    content,
                                                    contextList: subtopicContent
                                                  })}
                                                />
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-center justify-between gap-2 mb-2">
                                                    <h4 className="text-white/90 text-base font-medium leading-tight flex-1 min-w-0">{content.title}</h4>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <ContentRatingButtons 
                                                          key={`${content.id}-rating`}
                                                          contentId={content.id}
                                                          compact={true}
                                                          studentId={localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!).id : 'GV0002'}
                                                        />
                                                        {(hasVideo1 || hasVideo2) && (
                                                          <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="text-white hover:bg-red-500/20 hover:text-white bg-red-500/10 border-red-400/50 text-xs px-2 py-1 h-6"
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setVideoPopupOpen(true);
                                                            }}
                                                          >
                                                            <Play className="h-3 w-3 mr-1" />
                                                            Video{(hasVideo1 && hasVideo2) ? 's' : ''}
                                                          </Button>
                                                        )}
                                                        <DropdownMenu>
                                                          <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm" className="text-black hover:bg-white/20 hover:text-black bg-white/90 border-white/50 text-xs px-2 py-1 h-6">
                                                              Quiz
                                                            </Button>
                                                          </DropdownMenuTrigger>
                                                          <DropdownMenuContent>
                                                            <DropdownMenuItem onClick={(e) => {
                                                              e.stopPropagation();
                                                              console.log('Easy Quiz clicked for subtopic content:', content.id, content.title);
                                                              onStartQuiz(content, subtopicContent, 'Easy');
                                                            }}>
                                                              Easy Quiz
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={(e) => {
                                                              e.stopPropagation();
                                                              console.log('Hard Quiz clicked for subtopic content:', content.id, content.title);
                                                              onStartQuiz(content, subtopicContent, 'Hard');
                                                            }}>
                                                              Hard Quiz
                                                            </DropdownMenuItem>
                                                          </DropdownMenuContent>
                                                        </DropdownMenu>
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                      <CompactContentDifficultyIndicator contentId={content.id} />
                                                    </div>
                                                  {content.short_description && <p className="text-white/60 text-sm leading-relaxed">{formatDescription(content.short_description)}</p>}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Video Popup - Using Dialog */}
                                        <Dialog open={videoPopupOpen} onOpenChange={setVideoPopupOpen}>
                                          <DialogContent className="max-w-5xl max-h-[90vh] p-0 bg-gray-900 border-gray-700">
                                            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
                                              <h3 className="text-white text-lg font-medium truncate mr-4">{content.title}</h3>
                                              <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => setVideoPopupOpen(false)}
                                                className="text-white hover:bg-white/20 flex-shrink-0"
                                              >
                                                ✕
                                              </Button>
                                            </div>
                                            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                                              {hasVideo1 && (
                                                <div>
                                                  {videoData.video_name && (
                                                    <h4 className="text-white font-medium mb-3 text-base">{videoData.video_name}</h4>
                                                  )}
                                                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                                    <iframe 
                                                      className="w-full h-full" 
                                                      src={videoEmbedUrl} 
                                                      title={videoData.video_name || 'Video 1'} 
                                                      frameBorder="0" 
                                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                      allowFullScreen
                                                    />
                                                  </div>
                                                </div>
                                              )}
                                              {hasVideo2 && (
                                                <div>
                                                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                                    <iframe 
                                                      className="w-full h-full" 
                                                      src={video2EmbedUrl} 
                                                      title={video2Data.video_name || 'Video 2'} 
                                                      frameBorder="0" 
                                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                      allowFullScreen
                                                    />
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                      </>
                                    );
                                  };

                                  return <SubtopicContentCard key={content.id} />;
                                })}
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