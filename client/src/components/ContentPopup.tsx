import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Play, Pause, ThumbsUp, ThumbsDown, Brain, Star, Trophy, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';
import QuizView from './QuizView';
import { ContentEditor } from './ContentEditor';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Content } from '@shared/schema';

interface ContentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content | null;
  contentList: Content[];
  onContentChange: (newContent: Content) => void;
  startQuizDirectly?: boolean;
  quizLevel?: 'easy' | 'hard' | null;
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
  const [isSecondBlurbOpen, setIsSecondBlurbOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [modalVideoUrl, setModalVideoUrl] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [hasViewedContent, setHasViewedContent] = useState(false);
  
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Admin editor logic
  const getCurrentUser = () => {
    if (authUser && typeof authUser === 'object' && authUser !== null && 'id' in authUser) {
      return authUser as { id: string; [key: string]: any };
    }
    
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      return null;
    } catch (error) {
      console.error('Error parsing current user:', error);
      return null;
    }
  };

  const currentUser = getCurrentUser();
  const isAuthorized = (currentUser?.id === 'GV0002');

  // Track content view when popup opens
  const trackContentViewMutation = useMutation({
    mutationFn: async () => {
      if (!content || !currentUser?.id) return;
      
      const response = await fetch('/api/content-views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: currentUser.id,
          content_id: content.id,
          session_id: localStorage.getItem('currentSessionId') || null
        })
      });
      
      if (!response.ok) throw new Error('Failed to track content view');
      return response.json();
    }
  });

  // Content rating mutations
  const rateContentMutation = useMutation({
    mutationFn: async ({ rating }: { rating: 'thumbs_up' | 'thumbs_down' }) => {
      if (!content || !currentUser?.id) return;
      
      const response = await fetch('/api/content-ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: currentUser.id,
          content_id: content.id,
          rating,
          session_id: localStorage.getItem('currentSessionId') || null
        })
      });
      
      if (!response.ok) throw new Error('Failed to rate content');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Rating Saved',
        description: 'Thank you for your feedback!'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/content-ratings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/student-badges'] });
    }
  });

  // Quiz starter mutation
  const startQuizMutation = useMutation({
    mutationFn: async ({ level }: { level: 'easy' | 'hard' }) => {
      if (!content || !currentUser?.id) return;
      
      const response = await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: currentUser.id,
          content_id: content.id,
          quiz_level: level,
          session_id: localStorage.getItem('currentSessionId') || null
        })
      });
      
      if (!response.ok) throw new Error('Failed to start quiz');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Quiz Started',
        description: 'Good luck with your quiz!'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quiz-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/student-badges'] });
    }
  });

  // Track content view when popup opens
  useEffect(() => {
    if (isOpen && content && currentUser?.id && !hasViewedContent) {
      trackContentViewMutation.mutate();
      setHasViewedContent(true);
    }
  }, [isOpen, content?.id, currentUser?.id]);

  // Reset when content changes
  useEffect(() => {
    setHasViewedContent(false);
  }, [content?.id]);

  if (!content) return null;

  const handleRating = (rating: 'thumbs_up' | 'thumbs_down') => {
    rateContentMutation.mutate({ rating });
  };

  const handleQuizStart = (level: 'easy' | 'hard') => {
    startQuizMutation.mutate({ level });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => { 
        if(!open && !isImageModalOpen && !isVideoModalOpen) { 
          onClose(); 
        } 
      }}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-3">
            {/* Left: Title, Description, Content Actions */}
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-blue-600 text-center">
                  {content.title}
                </DialogTitle>
                <DialogDescription className="whitespace-pre-line text-[16px] text-[#131b2a]">
                  {content.short_description || content.information?.substring(0, 200) + '...'}
                </DialogDescription>
              </DialogHeader>

              {/* Content Actions Bar */}
              <div className="flex flex-wrap gap-2 justify-center p-4 bg-gray-50 rounded-lg">
                {/* Rating Buttons */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRating('thumbs_up')}
                  disabled={rateContentMutation.isPending}
                  className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Like
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRating('thumbs_down')}
                  disabled={rateContentMutation.isPending}
                  className="flex items-center gap-2 hover:bg-red-50 hover:border-red-300"
                >
                  <ThumbsDown className="h-4 w-4" />
                  Dislike
                </Button>

                {/* Quiz Buttons */}
                <Button
                  size="sm"
                  onClick={() => handleQuizStart('easy')}
                  disabled={startQuizMutation.isPending}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                >
                  <Brain className="h-4 w-4" />
                  Easy Quiz
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => handleQuizStart('hard')}
                  disabled={startQuizMutation.isPending}
                  className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600"
                >
                  <Brain className="h-4 w-4" />
                  Hard Quiz
                </Button>
              </div>

              {/* Short Blurb */}
              {content.short_blurb && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 text-blue-700">Key Points</h3>
                    <p className="text-gray-700 whitespace-pre-line">{content.short_blurb}</p>
                  </CardContent>
                </Card>
              )}

              {/* Second Short Blurb */}
              {content.second_short_blurb && (
                <div>
                  <Button
                    variant="outline"
                    onClick={() => setIsSecondBlurbOpen(!isSecondBlurbOpen)}
                    className="w-full flex items-center justify-between"
                  >
                    <span>Additional Information</span>
                    {isSecondBlurbOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  {isSecondBlurbOpen && (
                    <Card className="mt-2">
                      <CardContent className="p-4">
                        <p className="text-gray-700 whitespace-pre-line">{content.second_short_blurb}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>

            {/* Right: Media Content */}
            <div className="space-y-4">
              {/* Image Display */}
              {(content.imageid || imageUrl) && (
                <div className="relative">
                  {isImageLoading ? (
                    <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">Loading image...</span>
                    </div>
                  ) : (
                    <img
                      src={imageUrl ?? content.imageid ?? ''}
                      alt={content.title}
                      className="w-full h-auto max-h-96 object-cover rounded-lg cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                      onClick={() => setIsImageModalOpen(true)}
                      onError={(e) => {
                        console.error('Image load error for:', imageUrl || content.imageid);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>
              )}

              {/* Video Players */}
              {content.videoid && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-blue-700">Video Content</h3>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      className="w-full h-full"
                      src={content.videoid}
                      title={content.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {content.videoid2 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-blue-700">Additional Video</h3>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      className="w-full h-full"
                      src={content.videoid2}
                      title={`${content.title} - Additional`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full Content Information */}
          {content.information && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-xl mb-4 text-blue-700">Detailed Content</h3>
                <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                  {content.information}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Editor */}
          {isAuthorized && (
            <div className="mt-4 pt-4 border-t-4 border-red-500 bg-red-50 animate-pulse">
              <div className="mb-4 text-center">
                <div className="text-2xl font-bold text-red-600 mb-2">
                  🔧 ADMIN PANEL ACTIVE 🔧
                </div>
                <div className="text-sm text-red-600 font-bold uppercase tracking-wide">
                  USER: {currentUser?.id || 'Unknown'} | CONTENT: {content?.id || 'No content'}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsEditorOpen(!isEditorOpen)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-red-200 rounded-lg border-4 border-red-400 bg-red-100 shadow-lg transform hover:scale-105 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">⚙️</div>
                  <div>
                    <div className="font-bold text-red-700 text-xl">CONTENT EDITOR</div>
                    <div className="text-red-600 text-sm">Click to {isEditorOpen ? 'close' : 'open'} admin tools</div>
                  </div>
                </div>
                <div className="text-2xl text-red-600">
                  {isEditorOpen ? '🔽' : '▶️'}
                </div>
              </Button>
              {isEditorOpen && (
                <div className="mt-4 p-4 border-2 border-blue-300 bg-blue-50 rounded-lg">
                  <div className="text-blue-800 font-bold mb-2">📝 EDITOR PANEL:</div>
                  <ContentEditor content={content} onContentUpdate={onContentChange} />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full-screen Image Modal */}
      {isImageModalOpen && (content.imageid || imageUrl) && createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setIsImageModalOpen(false)}
          style={{ zIndex: 9999 }}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={(imageUrl || content.imageid) ?? ''}
              alt={content.title}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ContentPopup;