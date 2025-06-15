import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, HelpCircle, Languages } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Content } from "@/hooks/useContent";

interface ContentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content | null;
  contentList: Content[];
  onContentChange: (newContent: Content) => void;
}

const ContentPopup = ({ isOpen, onClose, content, contentList, onContentChange }: ContentPopupProps) => {
  // Fetch related image data
  const { data: imageData } = useQuery({
    queryKey: ['image', content?.imageid],
    queryFn: async () => {
      if (!content?.imageid) return null;
      const { data, error } = await supabase
        .from('image')
        .select('*')
        .eq('id', content.imageid)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!content?.imageid,
  });

  // Fetch related video data
  const { data: videoData } = useQuery({
    queryKey: ['video', content?.videoid],
    queryFn: async () => {
      if (!content?.videoid) return null;
      const { data, error } = await supabase
        .from('video')
        .select('*')
        .eq('id', content.videoid)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!content?.videoid,
  });

  // Fetch related video data for videoid2
  const { data: video2Data } = useQuery({
    queryKey: ['video2', content?.videoid2],
    queryFn: async () => {
      if (!content?.videoid2) return null;
      const { data, error } = await supabase
        .from('video')
        .select('*')
        .eq('id', content.videoid2)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!content?.videoid2,
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
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-600">
            {content.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative w-full h-64 bg-gradient-to-r from-blue-500 via-orange-500 to-red-500 rounded-lg overflow-hidden">
              {imageData?.imagelink ? (
                <img 
                  src={imageData.imagelink} 
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 via-orange-600 to-red-600 flex items-center justify-center">
                  <span className="text-white text-xl font-semibold">{content.title}</span>
                </div>
              )}
            </div>

            {(videoEmbedUrl || video2EmbedUrl) && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-3">Videos</h3>
                  <div className="space-y-4">
                    {videoEmbedUrl && (
                      <div>
                        {videoData?.video_name && <h4 className="font-medium text-sm text-gray-600 mb-2">{videoData.video_name}</h4>}
                        <div className="aspect-video">
                          <iframe
                            className="w-full h-full rounded-lg"
                            src={videoEmbedUrl}
                            title={videoData?.video_name || 'YouTube video player'}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>
                    )}
                    {video2EmbedUrl && (
                      <div>
                        {video2Data?.video_name && <h4 className="font-medium text-sm text-gray-600 mb-2">{video2Data.video_name}</h4>}
                        <div className="aspect-video">
                          <iframe
                            className="w-full h-full rounded-lg"
                            src={video2EmbedUrl}
                            title={video2Data?.video_name || 'YouTube video player 2'}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-3">Content Information</h3>
                
                {content.short_description && (
                  <div className="mb-3">
                    <h4 className="font-medium text-sm text-gray-600 mb-1">Description:</h4>
                    <p className="text-sm">{formatText(content.short_description)}</p>
                  </div>
                )}
                
                {content.short_blurb && (
                  <div className="mb-3">
                    <h4 className="font-medium text-sm text-gray-600 mb-1">Short Blurb:</h4>
                    <p className="text-sm">{formatText(content.short_blurb)}</p>
                  </div>
                )}
                
                {content.second_short_blurb && (
                  <div className="mb-3">
                    <h4 className="font-medium text-sm text-gray-600 mb-1">Second Short Blurb:</h4>
                    <p className="text-sm">{formatText(content.second_short_blurb)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {content.url && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-3">External Link</h3>
                  <a 
                    href={content.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {content.url}
                  </a>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-3">Navigation</h3>
                <div className="flex justify-between gap-2">
                  <Button onClick={handlePrevious} disabled={currentIndex <= 0} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button onClick={handleNext} disabled={contentList.length === 0 || currentIndex >= contentList.length - 1} className="flex-1">
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
                {contentList.length > 0 && (
                  <div className="text-center text-sm text-gray-500 mt-2">
                    {currentIndex + 1} / {contentList.length}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-1 justify-center">
                    <HelpCircle className="h-4 w-4" />
                    <span>Quiz</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1 justify-center">
                    <Languages className="h-4 w-4" />
                    <span>Translation</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-3">Media References</h3>
                
                {content.imageid && (
                  <div className="mb-3">
                    <Badge variant="outline" className="mb-2">Image ID: {content.imageid}</Badge>
                    {imageData && (
                      <div className="text-sm text-gray-600">
                        <p><strong>Name:</strong> {imageData.name || 'N/A'}</p>
                        <p><strong>Description:</strong> {imageData.description || 'N/A'}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {content.videoid && (
                  <div className="mb-3">
                    <Badge variant="outline" className="mb-2">Video ID: {content.videoid}</Badge>
                    {videoData && (
                      <div className="text-sm text-gray-600">
                        <p><strong>Name:</strong> {videoData.video_name || 'N/A'}</p>
                        <p><strong>Description:</strong> {videoData.description || 'N/A'}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {content.videoid2 && (
                  <div className="mb-3">
                    <Badge variant="outline" className="mb-2">Video ID 2: {content.videoid2}</Badge>
                    {video2Data && (
                      <div className="text-sm text-gray-600">
                        <p><strong>Name:</strong> {video2Data.video_name || 'N/A'}</p>
                        <p><strong>Description:</strong> {video2Data.description || 'N/A'}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {(content.translation || content.vocabulary) && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-3">Language Support</h3>
                  
                  {content.translation && (
                    <div className="mb-3">
                      <h4 className="font-medium text-sm text-gray-600 mb-1">Translation:</h4>
                      <p className="text-sm">{formatText(content.translation)}</p>
                    </div>
                  )}
                  
                  {content.vocabulary && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 mb-1">Vocabulary:</h4>
                      <p className="text-sm">{formatText(content.vocabulary)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentPopup;
