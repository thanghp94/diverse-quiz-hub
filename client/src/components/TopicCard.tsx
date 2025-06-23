
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookOpen, Target, HelpCircle } from "lucide-react";
import { Topic } from "@/hooks/useTopics";
import { useState } from "react";
import TopicQuizRunner from "./TopicQuizRunner";

interface TopicCardProps {
  topic: Topic;
}

const TopicCard = ({ topic }: TopicCardProps) => {
  const [topicQuizInfo, setTopicQuizInfo] = useState<{
    topicId: string;
    level: "Overview" | "Easy" | "Hard";
    topicName: string;
  } | null>(null);

  const handleStartTopicQuiz = (level: "Overview" | "Easy" | "Hard") => {
    setTopicQuizInfo({
      topicId: topic.id,
      level: level,
      topicName: topic.topic
    });
  };

  const closeTopicQuiz = () => {
    setTopicQuizInfo(null);
  };

  return (
    <>
      <Card className="p-4 hover:shadow-md transition-shadow">
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
        
        <Link to={`/content/${topic.id}`}>
          <div className="cursor-pointer">
            <h3 className="font-medium text-gray-800 text-sm mb-1">{topic.topic}</h3>
            {topic.short_summary && (
              <p className="text-xs text-gray-600 line-clamp-2 mb-3">{topic.short_summary}</p>
            )}
          </div>
        </Link>

        {/* Quiz Buttons */}
        <div className="flex gap-1 mt-3 pt-2 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 hover:bg-blue-50 border-blue-200 text-xs px-2 py-1 h-6 flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handleStartTopicQuiz("Overview");
            }}
            title="Overview Quiz"
          >
            <HelpCircle className="h-3 w-3 mr-1" />
            Overview
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="text-green-600 hover:bg-green-50 border-green-200 text-xs px-2 py-1 h-6 flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handleStartTopicQuiz("Easy");
            }}
            title="Easy Quiz"
          >
            <HelpCircle className="h-3 w-3 mr-1" />
            Easy
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50 border-red-200 text-xs px-2 py-1 h-6 flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handleStartTopicQuiz("Hard");
            }}
            title="Hard Quiz"
          >
            <HelpCircle className="h-3 w-3 mr-1" />
            Hard
          </Button>
        </div>
      </Card>

      {/* Topic Quiz Runner */}
      {topicQuizInfo && (
        <TopicQuizRunner
          topicId={topicQuizInfo.topicId}
          level={topicQuizInfo.level}
          topicName={topicQuizInfo.topicName}
          onClose={closeTopicQuiz}
        />
      )}
    </>
  );
};

export default TopicCard;
