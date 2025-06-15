import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, HelpCircle, Languages, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Content } from "@/hooks/useContent";
import { useState } from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import QuizView from "./QuizView";
import { Tables } from "@/integrations/supabase/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ContentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content | null;
  contentList: Content[];
  onContentChange: (newContent: Content) => void;
}

const MarkdownRenderer = ({ content }: { content: string | null | undefined }) => {
  if (!content) return null;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
        strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

const ContentPopup = ({
  isOpen,
  onClose,
  content,
  contentList,
  onContentChange
}: ContentPopupProps) => {
  const [isSecondBlurbOpen, setIsSecondBlurbOpen] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [assignmentTry, setAssignmentTry] = useState<Tables<'assignment_student_try'> | null>(null);
  const [questionIds, setQuestionIds] = useState<string[]>([]);

  const startQuiz = async () => {
    if (!content) return;

    // Fetch questions for this content
    const { data: questions, error: questionsError } = await supabase
        .from('question')
        .select('id')
        .eq('contentid', content.id);

    if (questionsError) {
        console.error("Error fetching questions:", questionsError.message);
        // TODO: Add a toast notification for the user
        return;
    }

    if (!questions || questions.length === 0) {
        console.log("No questions available for this content.");
        // TODO: Add a toast notification for the user
        return;
    }

    const randomizedQuestionIds = questions.map(q => q.id).sort(() => Math.random() - 0.5);
    
    // This is a placeholder. In a real app, you'd get the current user's ID
    // from your authentication system (e.g., supabase.auth.getUser()).
    const hocsinh_id = 'user-123-placeholder';
    
    // The `assignment_student_try` table has a `bigint` for ID without auto-increment.
    // Using Date.now() as a temporary unique ID.
    // A robust solution would be a database sequence or UUID.
    const newAssignmentTry = {
        id: Date.now(),
        hocsinh_id,
        contentID: content.id,
        questionIDs: JSON.stringify(randomizedQuestionIds),
    };

    const { data: insertedData, error: insertError } = await supabase
        .from('assignment_student_try')
        .insert(newAssignmentTry)
        .select()
        .single();

    if (insertError) {
        console.error("Error starting quiz:", insertError.message);
        // TODO: Add a toast notification for the user
        return;
    }

    setAssignmentTry(insertedData as Tables<'assignment_student_try'>);
    setQuestionIds(randomizedQuestionIds);
    setQuizMode(true);
  };

  const handleQuizFinish = () => {
      setQuizMode(false);
      setAssignmentTry(null);
      setQuestionIds([]);
  };

  // Fetch related image data
  const {
    data: imageData
  } = useQuery({
    queryKey: ['image', content?.imageid],
    queryFn: async () => {
      if (!content?.imageid) return null;
      const {
        data,
        error
      } = await supabase.from('image').select('*').eq('id', content.imageid).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!content?.imageid
  });

  // Fetch related video data
  const {
    data: videoData
  } = useQuery({
    queryKey: ['video', content?.videoid],
    queryFn: async () => {
      if (!content?.videoid) return null;
      const {
        data,
        error
      } = await supabase.from('video').select('*').eq('id', content.videoid).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!content?.videoid
  });

  // Fetch related video data for videoid2
  const {
    data: video2Data
  } = useQuery({
    queryKey: ['video2', content?.videoid2],
    queryFn: async () => {
      if (!content?.videoid2) return null;
      const {
        data,
        error
      } = await supabase.from('video').select('*').eq('id', content.videoid2).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!content?.videoid2
  });
  if (!content) return null;
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
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
  };
  const videoEmbedUrl = videoData?.videolink ? getYouTubeEmbedUrl(videoData.videolink) : null;
  const video2EmbedUrl = video2Data?.videolink ? getYouTubeEmbedUrl(video2Data.videolink) : null;
  const formatText = (text: string) => {
    if (!text) return '';
    return text.split('\n').map((line, index) => <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>);
  };
  return <Dialog open={isOpen} onOpenChange={(open) => { if(!open) { setQuizMode(false); } onClose(); }}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        {quizMode && questionIds.length > 0 ? (
          <QuizView 
            questionIds={questionIds} 
            onQuizFinish={handleQuizFinish}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-blue-600">
                {content.title}
              </DialogTitle>
              <DialogDescription>
                {content.short_description || "Detailed content view."}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Button onClick={handlePrevious} disabled={currentIndex <= 0} size="sm">
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button onClick={handleNext} disabled={contentList.length === 0 || currentIndex >= contentList.length - 1} size="sm">
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                   {contentList.length > 0 && <div className="text-sm text-gray-500">
                    {currentIndex + 1} / {contentList.length}
                  </div>}
                </div>
               
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={startQuiz}>
                    <HelpCircle className="h-4 w-4" />
                    Quiz
                  </Button>
                  <Button variant="outline" size="sm">
                    <Languages className="h-4 w-4" />
                    Translation
                  </Button>
                </div>
              </div>

              <div className="relative w-full h-64 bg-gradient-to-r from-blue-500 via-orange-500 to-red-500 rounded-lg overflow-hidden">
            {imageData?.imagelink ? <img src={imageData.imagelink} alt={content.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-blue-600 via-orange-600 to-red-600 flex items-center justify-center">
                <span className="text-white text-xl font-semibold">{content.title}</span>
              </div>}
          </div>

          {content.short_blurb && <Card>
              <CardHeader>
                <h3 className="font-semibold text-lg">Short Blurb</h3>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <MarkdownRenderer content={content.short_blurb} />
                </div>
              </CardContent>
            </Card>}

          {content.second_short_blurb && <Card>
                <Collapsible open={isSecondBlurbOpen} onOpenChange={setIsSecondBlurbOpen}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-6 text-left rounded-lg hover:bg-muted/50">
                    <h3 className="font-semibold text-lg">Second Short Blurb</h3>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isSecondBlurbOpen ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-6 px-6">
                      <div className="text-sm">
                        <MarkdownRenderer content={content.second_short_blurb} />
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>}
          
          {(videoEmbedUrl || video2EmbedUrl) && <Card>
              <CardHeader>
                <h3 className="font-semibold text-lg">Videos</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {videoEmbedUrl && <div>
                      {videoData?.video_name && <h4 className="font-medium text-sm text-gray-600 mb-2">{videoData.video_name}</h4>}
                      <div className="aspect-video">
                        <iframe className="w-full h-full rounded-lg" src={videoEmbedUrl} title={videoData?.video_name || 'YouTube video player'} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                      </div>
                    </div>}
                  {video2EmbedUrl && <div>
                      {video2Data?.video_name && <h4 className="font-medium text-sm text-gray-600 mb-2">{video2Data.video_name}</h4>}
                      <div className="aspect-video">
                        <iframe className="w-full h-full rounded-lg" src={video2EmbedUrl} title={video2Data?.video_name || 'YouTube video player 2'} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                      </div>
                    </div>}
                </div>
              </CardContent>
            </Card>}

          {(content.translation || content.vocabulary) && <Card>
              <CardHeader>
                <h3 className="font-semibold text-lg">Language Support</h3>
              </CardHeader>
              <CardContent>
                {content.translation && <div className="mb-3">
                    <h4 className="font-medium text-sm text-gray-600 mb-1">Translation:</h4>
                    <div className="text-sm">
                      <MarkdownRenderer content={content.translation} />
                    </div>
                  </div>}
                
                {content.vocabulary && <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-1">Vocabulary:</h4>
                    <div className="text-sm">
                      <MarkdownRenderer content={content.vocabulary} />
                    </div>
                  </div>}
              </CardContent>
            </Card>}

          {content.url && <Card>
              <CardHeader>
                <h3 className="font-semibold text-lg">External Link</h3>
              </CardHeader>
              <CardContent>
                <a href={content.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline break-all">
                  {content.url}
                </a>
              </CardContent>
            </Card>}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>;
};
export default ContentPopup;
