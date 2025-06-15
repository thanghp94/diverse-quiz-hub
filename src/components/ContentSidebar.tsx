
import { Link, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, BookOpen, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// This would typically come from an API or database
const contentData = {
  "1": {
    id: 1,
    title: "Variables and Data Types",
    type: "video",
    duration: "15 min",
  },
  "2": {
    id: 2,
    title: "Functions and Scope",
    type: "video",
    duration: "20 min",
  },
  "3": {
    id: 3,
    title: "DOM Manipulation",
    type: "article",
  }
};

const ContentSidebar = () => {
  const { id } = useParams<{ id: string }>();
  const currentId = id || "";

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

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 h-fit">
      <div className="p-4">
        <h3 className="text-white font-semibold mb-4">Content Directory</h3>
        <div className="space-y-2">
          {Object.values(contentData).map((content) => (
            <Link
              key={content.id}
              to={`/content/${content.id}`}
              className={cn(
                "block p-3 rounded-lg border transition-all hover:bg-white/5",
                currentId === content.id.toString() 
                  ? "bg-white/10 border-white/30" 
                  : "border-white/10"
              )}
            >
              <div className="flex items-start gap-3">
                <Badge className={`${getContentTypeColor(content.type)} flex items-center gap-1 text-xs`}>
                  {getContentIcon(content.type)}
                  <span className="capitalize">{content.type}</span>
                </Badge>
              </div>
              <h4 className="text-white text-sm font-medium mt-2 line-clamp-2">
                {content.title}
              </h4>
              {(content as any).duration && (
                <p className="text-white/60 text-xs mt-1">{(content as any).duration}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ContentSidebar;
