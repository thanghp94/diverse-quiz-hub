import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, BookOpen, Play, Folder, HelpCircle, Shuffle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Content } from "@/hooks/useContent";
import { useContentImage } from "@/hooks/useContentImage";
import { CompactContentDifficultyIndicator } from "@/components/ContentDifficultyIndicator";
import { ContentRatingButtons } from "@/components/ContentRatingButtons";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useContentMedia } from "@/hooks/useContentMedia";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

// --- Helper Components and Functions defined locally within this file ---

// Global state for blocking content clicks when note button is clicked
let globalClickBlocked = false;
let globalClickBlockTimeout: NodeJS.Timeout | null = null;

// Helper function to validate translation dictionary (if MarkdownRenderer is used)
const isValidTranslationDictionary = (dict: any): dict is Record<string, string> => {
  return dict && typeof dict === 'object' && !Array.isArray(dict) &&
             Object.values(dict).every(value => typeof value === 'string');
};

// Thumbnail component for gallery images
interface ThumbnailImageProps {
  content: Content;
  onContentClick: (info: { content: Content; contextList: Content[] }) => void;
  contextList: Content[];
}

const ThumbnailImageComponent: React.FC<ThumbnailImageProps> = ({ content, onContentClick, contextList }) => {
  const { data: thumbUrl } = useContentImage(content.imageid);
  
  if (!thumbUrl) return null;
  
  return (
    <div 
      className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={(e) => {
        e.stopPropagation();
        onContentClick({ content, contextList });
      }}
    >
      <img 
        src={thumbUrl} 
        alt={content.title || 'Content'} 
        className="w-full h-full object-cover"
      />
    </div>
  );
};

// PersonalNoteContent component
interface PersonalNoteContentProps {
  contentId: string;
  studentId: string;
  onClose: () => void;
}

const PersonalNoteContent: React.FC<PersonalNoteContentProps> = ({ contentId, studentId, onClose }) => {
  const [noteText, setNoteText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: existingRating } = useQuery<{ rating: string; personal_note?: string } | null>({
    queryKey: ['/api/content-ratings', studentId, contentId],
    queryFn: async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 200));
        const mockNotes: Record<string, { rating: string; personal_note?: string }> = {
          'content1-GV0002': { rating: 'up', personal_note: 'This is a test note for content 1.' },
          'content2-GV0002': { rating: 'none' },
        };
        const key = `${contentId}-${studentId}`;
        const data = mockNotes[key];
        if (data) return data;
        return null;
      } catch (error) {
        console.error('Error fetching rating:', error);
        return null;
      }
    },
  });

  React.useEffect(() => {
    if (existingRating) {
      setNoteText(existingRating.personal_note || '');
    }
  }, [existingRating]);

  const saveNoteMutation = useMutation({
    mutationFn: async (note: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`Saving note for ${contentId} by ${studentId}: ${note}`);
      return { personal_note: note };
    },
    onSuccess: () => {
      toast({
        title: "Note saved",
        description: "Your personal note has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/content-ratings', studentId, contentId] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSaveNote = () => {
    setIsLoading(true);
    saveNoteMutation.mutate(noteText);
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-600 text-sm">
        Add your personal notes about this content. Only you can see these notes.
      </p>
      <div>
        <Label htmlFor="note-text" className="text-gray-700">Your Note</Label>
        <Textarea
          id="note-text"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Write your personal note here..."
          className="min-h-[100px] mt-2"
        />
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <Button variant="outline" onClick={onClose} className="mb-2 sm:mb-0">
          Cancel
        </Button>
        <Button 
          onClick={handleSaveNote} 
          disabled={isLoading || saveNoteMutation.isPending}
        >
          {isLoading || saveNoteMutation.isPending ? "Saving..." : "Save Note"}
        </Button>
      </div>
    </div>
  );
};

// NoteButton component
interface NoteButtonProps {
  contentId: string;
  studentId: string;
  compact?: boolean;
  onOpenNote: () => void;
}

const NoteButton: React.FC<NoteButtonProps> = ({ contentId, studentId, compact = false, onOpenNote }) => {
  const { data: existingRating } = useQuery<{ rating: string; personal_note?: string } | null>({
    queryKey: ['/api/content-ratings', studentId, contentId],
    queryFn: async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 200));
        const mockNotes: Record<string, { rating: string; personal_note?: string }> = {
            'content1-GV0002': { rating: 'up', personal_note: 'This is a test note for content 1.' },
            'content3-GV0002': { rating: 'none', personal_note: 'Another note here for content 3.' },
            'content6-GV0002': { rating: 'none', personal_note: ''}, // No note
            'content7-GV0002': { rating: 'none', personal_note: 'Important concept to remember.'},
        };
        const key = `${contentId}-${studentId}`;
        const data = mockNotes[key];
        if (data) return data;
        return null;
      } catch (error) {
        console.error('Error fetching rating:', error);
        return null;
      }
    },
  });

  const hasNote = existingRating?.personal_note && existingRating.personal_note.trim() !== '';

  return (
    <>
      <Button 
        variant="outline" 
        size={compact ? "sm" : "default"}
        className={cn(
          "text-white hover:bg-white/20 hover:text-white bg-transparent border-white/50",
          compact ? "px-2 py-1 h-6" : "px-2 py-2",
          hasNote && "bg-white/10 border-white/70"
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
        {hasNote && <span className="ml-1 text-xs">*</span>}
      </Button>
    </>
  );
};

// VideoPlayer component
const VideoPlayer: React.FC<{ content: Content }> = ({ content }) => {
  const { videoData, video2Data, videoEmbedUrl, video2EmbedUrl } = useContentMedia(content);

  const hasVideo1 = videoEmbedUrl && videoData;
  const hasVideo2 = video2EmbedUrl && video2Data;

  return (
    <>
      {hasVideo1 && (
        <div>
          {videoData?.video_name && (
            <h4 className="text-white font-medium mb-3 text-base">{videoData.video_name}</h4>
          )}
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe 
              className="w-full h-full" 
              src={videoEmbedUrl || ''} 
              title={videoData?.video_name || 'Video 1'} 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          </div>
        </div>
      )}
      {hasVideo2 && (
        <div>
          {video2Data?.video_name && (
            <h4 className="text-white font-medium mb-3 text-base">{video2Data.video_name}</h4>
          )}
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe 
              className="w-full h-full" 
              src={video2EmbedUrl || ''} 
              title={video2Data?.video_name || 'Video 2'} 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
};


// NestedContentCard component (renders individual content items within the group)
interface NestedContentCardProps {
  content: Content;
  onClick: (e: React.MouseEvent) => void;
  onStartQuiz: (content: Content, contextList: Content[], level: 'Easy' | 'Hard') => void;
  contextList: Content[];
  customActions?: (content: Content) => React.ReactNode;
  // Props for controlling popups from the parent GroupedContentCard
  setVideoPopupOpen: (isOpen: boolean) => void;
  setSelectedVideoContent: (content: Content | null) => void;
  setNoteDialogOpen: (isOpen: boolean) => void;
  setNoteDialogContentId: (id: string) => void;
}

const NestedContentCard: React.FC<NestedContentCardProps> = ({
  content,
  onClick,
  onStartQuiz,
  contextList,
  customActions,
  setVideoPopupOpen,
  setSelectedVideoContent,
  setNoteDialogOpen,
  setNoteDialogContentId,
}) => {
  const { data: imageUrl } = useContentImage(content.imageid);
  const { videoData, video2Data, videoEmbedUrl, video2EmbedUrl } = useContentMedia(content);

  const hasVideo1 = videoEmbedUrl && videoData;
  const hasVideo2 = video2EmbedUrl && video2Data;

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
      onClick={(e) => {
        // Only trigger onClick if globalClickBlocked is false (for note button)
        if (globalClickBlocked) {
          e.stopPropagation();
          return;
        }
        onClick(e);
      }}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3"> {/* Changed to items-start for better alignment with thumbnail */}
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
              <h4 className="text-white font-medium text-sm line-clamp-2">
                {content.title || content.short_description || 'Untitled Content'}
              </h4>
            </div>
            
            {content.short_description && (
              <div className="text-white/60 text-xs leading-relaxed mt-1"> {/* Added mt-1 for spacing */}
                <MarkdownRenderer 
                  className="text-xs leading-relaxed"
                  translationDictionary={isValidTranslationDictionary(content.translation_dictionary) ? content.translation_dictionary : null}
                  textColor="text-white/60"
                  tooltipStyle="dark"
                >
                  {content.short_description}
                </MarkdownRenderer>
              </div>
            )}

            <div className="flex items-center gap-2 mt-2 flex-wrap" 
                 onPointerDown={(e) => e.stopPropagation()} 
                 onClick={(e) => e.stopPropagation()} 
                 onMouseDown={(e) => e.stopPropagation()}>
              
              <CompactContentDifficultyIndicator contentId={content.id} />
              
              <div className="scale-75">
                <ContentRatingButtons 
                  contentId={content.id} 
                  compact={true}
                  studentId={localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!).id : 'GV0002'}
                />
              </div>

              <NoteButton
                contentId={content.id}
                studentId={localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!).id : 'GV0002'}
                compact={true}
                onOpenNote={() => {
                  setNoteDialogContentId(content.id);
                  setNoteDialogOpen(true);
                }}
              />

              {(hasVideo1 || hasVideo2) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-6 px-2 text-xs bg-red-500/10 border-red-400/50 text-white hover:bg-red-500/20 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVideoPopupOpen(true);
                    setSelectedVideoContent(content); 
                  }}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Video{((hasVideo1 && hasVideo2) ? 's' : '')}
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-black hover:bg-white/20 hover:text-black bg-white/90 border-white/50 text-xs px-1 py-0.5 h-5 opacity-60 hover:opacity-80">
                    Quiz
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onStartQuiz(content, contextList, 'Easy');
                  }}>
                    Easy Quiz
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onStartQuiz(content, contextList, 'Hard');
                  }}>
                    Hard Quiz
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {customActions && customActions(content)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// --- Main GroupedContentCard component START ---

interface GroupedContentCardProps {
  groupContent: Content; // The main content item where prompt = "groupcard"
  groupedContent: Content[]; // Related content items where contentgroup = groupContent.id
  onContentClick: (info: { content: Content; contextList: Content[] }) => void;
  onStartQuiz: (content: Content, contextList: Content[], level: 'Easy' | 'Hard') => void;
  onStartGroupMatching: (matchingId: string, matchingTitle: string) => void; // Passed from parent
  className?: string;
  activeContentId?: string | null;
  customActions?: (content: Content) => React.ReactNode; // Pass through to nested cards
}

export const GroupedContentCard: React.FC<GroupedContentCardProps> = ({
  groupContent,
  groupedContent,
  onContentClick,
  onStartQuiz,
  onStartGroupMatching,
  className,
  activeContentId,
  customActions
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: groupImageUrl } = useContentImage(groupContent.imageid);

  // States for popups, managed by the GroupedContentCard to control nested dialogs
  const [videoPopupOpen, setVideoPopupOpen] = useState(false);
  const [selectedVideoContent, setSelectedVideoContent] = useState<Content | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteDialogContentId, setNoteDialogContentId] = useState<string>('');

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent clicks if this component is nested
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

  return (
    <Card 
      className={cn(
        // Background and border colors from image_456860.jpg (light purple/lavender)
        "bg-purple-700/20 border-purple-400/30 hover:bg-purple-700/30 transition-all duration-200 backdrop-blur-sm",
        // Apply col-span-2 when expanded to take full width in a 2-column grid
        isExpanded && "col-span-2", 
        activeContentId === groupContent.id && "ring-4 ring-yellow-400/80 bg-yellow-500/20 border-yellow-400/70 shadow-lg shadow-yellow-400/20",
        className
      )}
    >
      <CardContent className="p-4">
        {/* Group Header with title, buttons, and expand/collapse */}
        <div 
          className="flex items-center justify-between mb-3 cursor-pointer"
          onClick={toggleExpanded}
        >
          {/* Left section: Folder icon and Main thumbnail */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex-shrink-0">
              {/* Folder color to match light purple theme */}
              <Folder className="h-5 w-5 text-purple-300" /> 
            </div>
            
            {/* Main thumbnail - showing full picture with object-contain */}
            {groupImageUrl && (
              <div 
                className="w-20 h-16 rounded-md overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleGroupContentClick} // Still allows opening main content by clicking thumbnail
              >
                <img 
                  src={groupImageUrl} 
                  alt={groupContent.title || 'Group content'} 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
          
          {/* Centered Title */}
          <div className="flex-1 text-center mx-4 min-w-0">
            <h3 
              className="font-semibold text-lg line-clamp-1"
              // Removed direct style={{ color: 'white !important', textDecoration: 'none' }}
              // Prefer Tailwind for consistency or ensure it's truly needed.
              // If you want it always white, add text-white to the className
              style={{ color: 'white', textDecoration: 'none' }} // Re-added with better style
            >
              {groupContent.title || groupContent.short_description || 'Grouped Content'}
            </h3>
          </div>

          {/* Right section: Quiz/Match buttons and Expand/Collapse button */}
          <div className="flex items-center ml-3">
            <div className="flex flex-col gap-1 mr-3"> {/* Moved buttons back to right */}
              {/* Quiz button for the group card */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <HelpCircle className="h-3 w-3 mr-1" />
                    Quiz
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onStartQuiz(groupContent, [groupContent, ...groupedContent], 'Easy');
                  }}>
                    Easy Quiz
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onStartQuiz(groupContent, [groupContent, ...groupedContent], 'Hard');
                  }}>
                    Hard Quiz
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Match button for the group card */}
              {groupContent.parentid && onStartGroupMatching && (
                <Button 
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-xs bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartGroupMatching(groupContent.parentid!, groupContent.title || 'Group Match');
                  }}
                >
                  <Shuffle className="h-3 w-3 mr-1" />
                  Match
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="p-1 h-8 w-8 text-white/70 hover:text-white hover:bg-white/20"
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Thumbnail Gallery - hidden when expanded */}
        {!isExpanded && groupedContent.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2 justify-center">
              {groupedContent.slice(0, 8).map((content) => (
                <ThumbnailImageComponent 
                  key={content.id}
                  content={content}
                  onContentClick={onContentClick}
                  contextList={[groupContent, ...groupedContent]}
                />
              ))}
              {groupedContent.length > 8 && (
                <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center text-white/60 text-xs">
                  +{groupedContent.length - 8}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Short Description - hidden when expanded */}
        {!isExpanded && groupContent.short_description && (
          <div className="text-center">
            <p className="text-white/70 text-sm">
              <MarkdownRenderer 
                className="text-sm leading-relaxed"
                translationDictionary={isValidTranslationDictionary(groupContent.translation_dictionary) ? groupContent.translation_dictionary : null}
                textColor="text-white/70"
                tooltipStyle="dark"
              >
                {groupContent.short_description}
              </MarkdownRenderer>
            </p>
          </div>
        )}

        {/* Grouped Content - Collapsible (shown when expanded) */}
        {isExpanded && groupedContent.length > 0 && (
          <div className="mt-4 space-y-2 pl-4 border-l-2 border-purple-400/30"> {/* Border color consistent with group card */}
            {/* The nested content items should also be in a 2-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2"> 
              {groupedContent.map((nestedContent) => (
                <div key={nestedContent.id} className={cn(
                  "transition-all duration-200 rounded-lg",
                  activeContentId === nestedContent.id && "ring-4 ring-yellow-400/80 bg-yellow-500/20 border-yellow-400/70 shadow-lg shadow-yellow-400/20"
                )}>
                  <NestedContentCard
                    content={nestedContent}
                    onClick={(e) => handleNestedContentClick(nestedContent, e)}
                    onStartQuiz={onStartQuiz}
                    contextList={[groupContent, ...groupedContent]}
                    customActions={customActions}
                    // Pass down popup controls
                    setVideoPopupOpen={setVideoPopupOpen}
                    setSelectedVideoContent={setSelectedVideoContent}
                    setNoteDialogOpen={setNoteDialogOpen}
                    setNoteDialogContentId={setNoteDialogContentId}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Video Popup for nested content */}
      <Dialog open={videoPopupOpen} onOpenChange={(open) => {
          setVideoPopupOpen(open);
          if (!open) setSelectedVideoContent(null);
      }}>
          <DialogContent className="max-w-5xl max-h-[90vh] p-0 bg-gray-900 border-gray-700">
              <VisuallyHidden>
                  <h3>Video Content</h3>
                  <p>Video content for {selectedVideoContent?.title || 'content'}</p>
              </VisuallyHidden>
              <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
                  <h3 className="text-white text-lg font-medium truncate mr-4">
                      {selectedVideoContent?.title || 'Video'}
                  </h3>
                  <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                          setVideoPopupOpen(false);
                          setSelectedVideoContent(null);
                      }}
                      className="text-white hover:bg-white/20 flex-shrink-0"
                  >
                      ✕
                  </Button>
              </div>
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                  {selectedVideoContent && <VideoPlayer content={selectedVideoContent} />}
              </div>
          </DialogContent>
      </Dialog>

      {/* Personal Note Dialog for nested content */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
          <DialogContent className="max-w-md p-0 bg-white border-gray-300">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-gray-900 text-lg font-medium">Personal Note</h3>
                  <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setNoteDialogOpen(false)}
                      className="text-gray-500 hover:bg-gray-200 flex-shrink-0"
                  >
                      ✕
                  </Button>
              </div>
              <div className="p-6">
                  <PersonalNoteContent 
                      contentId={noteDialogContentId}
                      studentId={localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!).id : 'GV0002'}
                      onClose={() => setNoteDialogOpen(false)}
                  />
              </div>
          </DialogContent>
      </Dialog>
    </Card>
  );
};

export default GroupedContentCard;