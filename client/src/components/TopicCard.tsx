
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { BookOpen, Target } from "lucide-react";
import { Topic } from "@/hooks/useTopics";

interface TopicCardProps {
  topic: Topic;
}

const TopicCard = ({ topic }: TopicCardProps) => {
  return (
    <Link to={`/content/${topic.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-blue-100">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          {topic.challengesubject && (
            <Badge variant="outline" className="text-xs">
              {topic.challengesubject}
            </Badge>
          )}
        </div>
        <h3 className="font-medium text-gray-800 text-sm mb-1">{topic.topic}</h3>
        {topic.short_summary && (
          <p className="text-xs text-gray-600 line-clamp-2">{topic.short_summary}</p>
        )}
      </Card>
    </Link>
  );
};

export default TopicCard;
