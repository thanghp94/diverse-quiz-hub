
import { Link, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, BookOpen, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContent, useContentById } from "@/hooks/useContent";

const ContentSidebar = () => {
  const { id } = useParams<{ id: string }>();
  const currentContentId = id || "";
  
  // First get the current content to find its topic ID
  const { data: currentContent } = useContentById(currentContentId);
  
  // Then get all content for that topic
  const { data: contentItems, isLoading, error } = useContent(currentContent?.topicid);

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'article':
        return <BookOpen className="h-4 w-4" />;
      case 'quiz':
        return <ImageIcon className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-500/20 text-red-200 border-red-500/30';
      case 'article':
        return 'bg-blue-500/20 text-blue-200 border-blue-500/30';
      case 'quiz':
        return 'bg-green-500/20 text-green-200 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-200 border-gray-500/30';
    }
  };

  const getContentType = (content: any) => {
    if (content.videoid || content.videoid2) return 'video';
    if (content.url) return 'article';
    return 'content';
  };

  if (isLoading || !currentContent) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 h-fit">
        <div className="p-4">
          <h3 className="text-white font-semibold mb-4">Content Directory</h3>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
            <span className="ml-2 text-white/80">Loading content...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 h-fit">
        <div className="p-4">
          <h3 className="text-white font-semibold mb-4">Content Directory</h3>
          <div className="text-center py-4">
            <p className="text-white/80">Error loading content</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 h-fit">
      <div className="p-4">
        <h3 className="text-white font-semibold mb-4">Content Directory</h3>
        <div className="space-y-2">
          {contentItems && contentItems.length > 0 ? contentItems.map((content) => {
            const contentType = getContentType(content);
            return (
              <Link
                key={content.id}
                to={`/content/${content.id}`}
                className={cn(
                  "block p-3 rounded-lg border transition-all hover:bg-white/5",
                  currentContentId === content.id.toString() 
                    ? "bg-white/10 border-white/30" 
                    : "border-white/10"
                )}
              >
                <div className="flex items-start gap-3">
                  <Badge className={`${getContentTypeColor(contentType)} flex items-center gap-1 text-xs`}>
                    {getContentIcon(contentType)}
                    <span className="capitalize">{contentType}</span>
                  </Badge>
                </div>
                <h4 className="text-white text-sm font-medium mt-2 line-clamp-2">
                  {content.title}
                </h4>
                {content.short_description && (
                  <p className="text-white/60 text-xs mt-1 line-clamp-2">{content.short_description}</p>
                )}
              </Link>
            );
          }) : (
            <div className="text-center py-4">
              <p className="text-white/60 text-sm">No related content available</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ContentSidebar;
