import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, BookOpen, Play, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { Content } from "@/hooks/useContent";
import { useContentImage } from "@/hooks/useContentImage";
import { CompactContentDifficultyIndicator } from "@/components/ContentDifficultyIndicator";
import { ContentRatingButtons } from "@/components/ContentRatingButtons";

interface GroupedContentCardProps {
  groupContent: Content; // The main content item where prompt = "groupcard"
  groupedContent: Content[]; // Related content items where contentgroup = groupContent.id
  onContentClick: (info: { content: Content; contextList: Content[] }) => void;
  onStartQuiz: (content: Content, contextList: Content[], level: 'Easy' | 'Hard') => void;
  className?: string;
}

export const GroupedContentCard: React.FC<GroupedContentCardProps> = ({
  groupContent,
  groupedContent,
  onContentClick,
  onStartQuiz,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: groupImageUrl } = useContentImage(groupContent.imageid);

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  const handleGroupContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContentClick({ content: groupContent, contextList: [groupContent, ...groupedContent] });
  };

  const handleNestedContentClick = (content: Content, e: React.MouseEvent) => {
    e.stopPropagation();
    onContentClick({ content, contextList: [groupContent, ...groupedContent] });
  };

  const getContentIcon = (content: Content) => {
    if (content.videoid || content.videoid2) return <Play className="h-3 w-3" />;
    if (content.url) return <BookOpen className="h-3 w-3" />;
    return <BookOpen className="h-3 w-3" />;
  };

  const getContentTypeColor = (content: Content) => {
    if (content.videoid || content.videoid2) return 'bg-red-500/20 text-red-200';
    if (content.url) return 'bg-blue-500/20 text-blue-200';
    return 'bg-green-500/20 text-green-200';
  };

  return (
    <Card 
      className={cn(
        "bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20 border-purple-400/30 hover:from-purple-600/30 hover:via-blue-600/30 hover:to-indigo-600/30 transition-all duration-200 backdrop-blur-sm",
        className
      )}
    >
      <CardContent className="p-4">
        {/* Group Header */}
        <div 
          className="flex items-center gap-3 cursor-pointer mb-3"
          onClick={toggleExpanded}
        >
          <div className="flex-shrink-0">
            <Folder className="h-5 w-5 text-purple-300" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-purple-500/30 text-purple-200 text-xs">
                <Folder className="h-3 w-3 mr-1" />
                Group ({groupedContent.length + 1} items)
              </Badge>
            </div>
            
            <h3 className="text-white font-semibold text-lg line-clamp-1">
              {groupContent.title || groupContent.short_description || 'Grouped Content'}
            </h3>
            
            {groupContent.short_blurb && (
              <p className="text-white/70 text-sm line-clamp-2 mt-1">
                {groupContent.short_blurb}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-white/70" />
            ) : (
              <ChevronRight className="h-5 w-5 text-white/70" />
            )}
          </div>
        </div>

        {/* Main Group Content - Always Visible */}
        <div className="mb-3">
          <Card 
            className="bg-white/10 border-white/20 hover:bg-white/15 cursor-pointer transition-all duration-200"
            onClick={handleGroupContentClick}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                {groupImageUrl && (
                  <div className="w-16 h-20 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={groupImageUrl} 
                      alt={groupContent.title || 'Group content'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={cn("text-xs", getContentTypeColor(groupContent))}>
                      {getContentIcon(groupContent)}
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-200 text-xs">
                      Main
                    </Badge>
                  </div>
                  
                  <h4 className="text-white font-medium text-sm mb-1 line-clamp-2">
                    {groupContent.title || groupContent.short_description || 'Untitled Content'}
                  </h4>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <CompactContentDifficultyIndicator contentId={groupContent.id} />
                    <div className="scale-75">
                      <ContentRatingButtons 
                        contentId={groupContent.id} 
                        compact={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grouped Content - Collapsible */}
        {isExpanded && groupedContent.length > 0 && (
          <div className="space-y-2 pl-4 border-l-2 border-purple-400/30">
            <h5 className="text-white/80 font-medium text-sm mb-2">Related Content:</h5>
            {groupedContent.map((content) => (
              <NestedContentCard
                key={content.id}
                content={content}
                onClick={(e) => handleNestedContentClick(content, e)}
                onStartQuiz={onStartQuiz}
                contextList={[groupContent, ...groupedContent]}
              />
            ))}
          </div>
        )}

        {/* Summary Footer */}
        {!isExpanded && groupedContent.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-white/60 text-xs">
              +{groupedContent.length} more items in this group
            </span>
            <span className="text-white/60 text-xs">
              Click to expand
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface NestedContentCardProps {
  content: Content;
  onClick: (e: React.MouseEvent) => void;
  onStartQuiz: (content: Content, contextList: Content[], level: 'Easy' | 'Hard') => void;
  contextList: Content[];
}

const NestedContentCard: React.FC<NestedContentCardProps> = ({
  content,
  onClick,
  onStartQuiz,
  contextList
}) => {
  const { data: imageUrl } = useContentImage(content.imageid);

  const getContentIcon = () => {
    if (content.videoid || content.videoid2) return <Play className="h-3 w-3" />;
    if (content.url) return <BookOpen className="h-3 w-3" />;
    return <BookOpen className="h-3 w-3" />;
  };

  const getContentTypeColor = () => {
    if (content.videoid || content.videoid2) return 'bg-red-500/20 text-red-200';
    if (content.url) return 'bg-blue-500/20 text-blue-200';
    return 'bg-green-500/20 text-green-200';
  };

  return (
    <Card 
      className="bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {imageUrl && (
            <div className="w-12 h-15 rounded-md overflow-hidden flex-shrink-0">
              <img 
                src={imageUrl} 
                alt={content.title || 'Content'} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn("text-xs", getContentTypeColor())}>
                {getContentIcon()}
              </Badge>
            </div>
            
            <h4 className="text-white font-medium text-sm mb-1 line-clamp-2">
              {content.title || content.short_description || 'Untitled Content'}
            </h4>
            
            <div className="flex items-center gap-2 mt-2">
              <CompactContentDifficultyIndicator contentId={content.id} />
              <div className="scale-75">
                <ContentRatingButtons 
                  contentId={content.id} 
                  compact={true}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupedContentCard;