import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, SkipBack, SkipForward, HelpCircle, Languages } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Content } from "@/hooks/useContent";

interface ContentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content | null;
}

const ContentPopup = ({ isOpen, onClose, content }: ContentPopupProps) => {
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-600">
            {content.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Image */}
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

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 py-4">
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2 px-3"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-xs">Back to main topic</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2 px-3"
            >
              <SkipBack className="h-4 w-4" />
              <span className="text-xs">Previous content</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2 px-3"
            >
              <SkipForward className="h-4 w-4" />
              <span className="text-xs">Next content</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2 px-3"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="text-xs">Quiz</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2 px-3"
            >
              <Languages className="h-4 w-4" />
              <span className="text-xs">Translation</span>
            </Button>
          </div>

          {/* Content Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Content Information */}
            <div className="space-y-4">
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

              {/* Media IDs */}
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
            </div>

            {/* Right Column - Additional Information */}
            <div className="space-y-4">
              {content.information && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-3">Detailed Information</h3>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: content.information }}
                    />
                  </CardContent>
                </Card>
              )}

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

              {content.url && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-3">External Link</h3>
                    <a 
                      href={content.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {content.url}
                    </a>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentPopup;
