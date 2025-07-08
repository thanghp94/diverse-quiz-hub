import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Play, HelpCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Content } from "@/hooks/useContent";
import { useContentImage } from "@/hooks/useContentImage";
import { useContentMedia } from "@/hooks/useContentMedia";
import { ContentRatingButtons } from "@/components/ContentRatingButtons";
import { CompactContentDifficultyIndicator } from "@/components/ContentDifficultyIndicator";
import { VideoPopup } from "@/components/VideoPopup";
import { NoteDialog } from "@/components/NoteDialog";

// Global state for blocking content clicks when note button is clicked
let globalClickBlocked = false;
let globalClickBlockTimeout: NodeJS.Timeout | null = null;

interface ContentCardProps {
  content: Content;
  topicContent: Content[];
  onContentClick: (info: { content: Content; contextList: Content[] }) => void;
  onStartQuiz: (content: Content, contextList: Content[], level: 'Easy' | 'Hard') => void;
  activeContentId?: string | null;
  customActions?: (content: Content) => React.ReactNode;
  compact?: boolean;
}

const ContentThumbnail = ({ content, onClick }: { content: Content, onClick?: () => void }) => {
  const { data: imageUrl } = useContentImage(content.imageid);

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

const NoteButton = ({ contentId, studentId, compact = false, onOpenNote }: {
  contentId: string;
  studentId: string;
  compact?: boolean;
  onOpenNote: () => void;
}) => {
  return (
    <Button 
      variant="outline" 
      size={compact ? "sm" : "default"}
      className={cn(
        "text-white hover:bg-white/20 hover:text-white bg-transparent border-white/50",
        compact ? "px-2 py-1 h-6" : "px-2 py-2"
      )}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();

        // Block all content clicks globally for a brief moment
        globalClickBlocked = true;
        if (globalClickBlockTimeout) {
          clearTimeout(globalClickBlockTimeout);
        }
        globalClickBlockTimeout = setTimeout(() => {
          globalClickBlocked = false;
        }, 100);

        onOpenNote();
      }}
    >
      <FileText className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
    </Button>
  );
};

export const ContentCard: React.FC<ContentCardProps> = ({
  content,
  topicContent,
  onContentClick,
  onStartQuiz,
  activeContentId,
  customActions,
  compact = false
}) => {
  const { videoData, video2Data, videoEmbedUrl, video2EmbedUrl } = useContentMedia(content);
  const [videoPopupOpen, setVideoPopupOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);

  const hasVideo1 = videoEmbedUrl && videoData;
  const hasVideo2 = video2EmbedUrl && video2Data;

  const handleContentClick = () => {
    if (globalClickBlocked) return;
    onContentClick({
      content,
      contextList: topicContent
    });
  };

  const getCurrentUserId = () => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      return currentUser ? JSON.parse(currentUser).id : 'GV0002';
    } catch {
      return 'GV0002';
    }
  };

  return (
    <>
      <div className={cn(
        "bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 rounded-lg p-3",
        activeContentId === content.id && "ring-4 ring-yellow-400/80 bg-yellow-500/20 border-yellow-400/70 shadow-lg shadow-yellow-400/20"
      )}>
        <div className="flex items-start justify-between gap-2">
          <div
            onClick={handleContentClick}
            className="flex-grow cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ContentThumbnail 
                content={content} 
                onClick={handleContentClick}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-base font-medium leading-tight flex-1 min-w-0 text-left" style={{ color: '#ffff78e6' }}>
                    {content.title}
                  </h4>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <ContentRatingButtons 
                      contentId={content.id}
                      compact={true}
                      studentId={getCurrentUserId()}
                    />
                    <NoteButton
                      contentId={content.id}
                      studentId={getCurrentUserId()}
                      compact={true}
                      onOpenNote={() => setNoteDialogOpen(true)}
                    />
                    {(hasVideo1 || hasVideo2) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-white hover:bg-red-500/20 hover:text-white bg-red-500/10 border-red-400/50 text-xs px-1 py-0.5 h-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVideoPopupOpen(true);
                        }}
                        title={(hasVideo1 && hasVideo2) ? '2 Videos' : 'Video'}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="text-black hover:bg-white/20 hover:text-black bg-white/90 border-white/50 text-xs px-1 py-0.5 h-5 opacity-60 hover:opacity-80" title="Quiz">
                          <HelpCircle className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onStartQuiz(content, topicContent, 'Easy');
                        }}>
                          Easy Quiz
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onStartQuiz(content, topicContent, 'Hard');
                        }}>
                          Hard Quiz
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {customActions && customActions(content)}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <CompactContentDifficultyIndicator contentId={content.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video popup */}
      <VideoPopup
        isOpen={videoPopupOpen}
        onClose={() => setVideoPopupOpen(false)}
        content={content}
      />

      {/* Note dialog */}
      <NoteDialog
        isOpen={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        contentId={content.id}
        studentId={getCurrentUserId()}
      />
    </>
  );
};
