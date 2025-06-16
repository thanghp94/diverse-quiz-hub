
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Content } from "@/hooks/useContent";
import { useEffect, useState } from "react";
import QuizView from "./QuizView";
import { cn } from "@/lib/utils";
import { ContentPopupView } from "./content-popup/ContentPopupView";
import { MediaDisplay } from "./content-popup/MediaDisplay";
import { useQuiz } from "@/hooks/useQuiz";
import { useContentMedia } from "@/hooks/useContentMedia";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X } from "lucide-react";

interface ContentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content | null;
  contentList: Content[];
  onContentChange: (newContent: Content) => void;
  startQuizDirectly?: boolean;
  quizLevel?: 'Easy' | 'Hard' | null;
  imageUrl: string | null | undefined;
  isImageLoading: boolean;
}

const ContentPopup = ({
  isOpen,
  onClose,
  content,
  contentList,
  onContentChange,
  startQuizDirectly = false,
  quizLevel,
  imageUrl,
  isImageLoading,
}: ContentPopupProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [editedBlurb, setEditedBlurb] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const currentUser = localStorage.getItem('currentUser') 
    ? JSON.parse(localStorage.getItem('currentUser')!) 
    : { id: 'GV0002' };
  const canEdit = currentUser.id === 'GV0002';

  const {
    quizMode,
    assignmentTry,
    studentTry,
    questionIds,
    startQuiz,
    closeQuiz,
    setStudentTry,
  } = useQuiz({ content, onClose, startQuizDirectly, level: quizLevel });

  const {
    videoData,
    video2Data,
    videoEmbedUrl,
    video2EmbedUrl,
  } = useContentMedia(content);

  const updateContentMutation = useMutation({
    mutationFn: async (updates: { short_description?: string; short_blurb?: string }) => {
      return apiRequest(`/api/content/${content!.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          userId: currentUser.id,
          ...updates
        })
      });
    },
    onSuccess: (updatedContent) => {
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
      toast({
        title: "Content updated successfully",
        description: "Your changes have been saved."
      });
      setIsEditing(false);
      
      // Update the current content object
      if (onContentChange && updatedContent) {
        onContentChange(updatedContent);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update content",
        description: error.message || "An error occurred while saving your changes.",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (isOpen && startQuizDirectly && !quizMode) {
      startQuiz();
    }
  }, [isOpen, startQuizDirectly, quizMode, startQuiz]);

  useEffect(() => {
    if (content && isEditing) {
      setEditedDescription(content.short_description || '');
      setEditedBlurb(content.short_blurb || '');
    }
  }, [content, isEditing]);

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedDescription(content?.short_description || '');
    setEditedBlurb(content?.short_blurb || '');
  };

  const handleSaveEdit = () => {
    updateContentMutation.mutate({
      short_description: editedDescription,
      short_blurb: editedBlurb
    });
  };

  if (!content) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => { if(!open) onClose(); }}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh]">
          <div>No content available</div>
        </DialogContent>
      </Dialog>
    );
  }

  const currentIndex = contentList.findIndex(item => item.id === content.id);
  const handlePrevious = () => {
    if (currentIndex > 0) {
      onContentChange(contentList[currentIndex - 1]);
    }
  };
  const handleNext = () => {
    if (currentIndex < contentList.length - 1) {
      onContentChange(contentList[currentIndex + 1]);
    }
  };

  return <Dialog open={isOpen} onOpenChange={(open) => { if(!open) { closeQuiz(); } onClose(); }}>
      <DialogContent className={cn("max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto", quizMode && "max-w-6xl")}>
        {quizMode && questionIds.length > 0 && assignmentTry ? (
          <QuizView 
            questionIds={questionIds} 
            onQuizFinish={closeQuiz}
            assignmentStudentTryId={assignmentTry.id.toString()}
            studentTryId={studentTry?.id}
            contentId={content?.id}
          />
        ) : (
          <>
            {/* Header with title, description and image */}
            <div className="flex flex-col lg:flex-row lg:gap-4 mb-3">
              {/* Left: Title and Description */}
              <div className="flex-1 lg:w-1/2">
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-2xl font-bold text-blue-600 flex-1">
                      {content.title}
                    </DialogTitle>
                    {canEdit && !isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleStartEdit}
                        className="ml-2"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    {canEdit && isEditing && (
                      <div className="flex gap-2 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={updateContentMutation.isPending}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={updateContentMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                  <DialogDescription className="whitespace-pre-line text-lg leading-relaxed">
                    {isEditing ? (
                      <div className="space-y-3 mt-3">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Short Description</label>
                          <Textarea
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            placeholder="Enter short description..."
                            className="min-h-[100px]"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Short Blurb</label>
                          <Textarea
                            value={editedBlurb}
                            onChange={(e) => setEditedBlurb(e.target.value)}
                            placeholder="Enter short blurb..."
                            className="min-h-[80px]"
                          />
                        </div>
                      </div>
                    ) : (
                      content.short_description || "Detailed content view."
                    )}
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Right: Image */}
              <div className="flex-1 lg:w-1/2 mt-4 lg:mt-0">
                <MediaDisplay
                  imageUrl={imageUrl}
                  isImageLoading={isImageLoading}
                  title={content.title}
                  imageid={content.imageid}
                  isFullWidth={true}
                />
              </div>
            </div>

            {/* Content below */}
            <ContentPopupView
                content={content}
                contentListLength={contentList.length}
                currentIndex={currentIndex}
                handlePrevious={handlePrevious}
                handleNext={handleNext}
                startQuiz={startQuiz}
                imageUrl={imageUrl}
                isImageLoading={isImageLoading}
                videoEmbedUrl={videoEmbedUrl}
                video2EmbedUrl={video2EmbedUrl}
                videoData={videoData}
                video2Data={video2Data}
                hideMediaDisplay={true}
            />
          </>
        )}
      </DialogContent>
    </Dialog>;
};
export default ContentPopup;
