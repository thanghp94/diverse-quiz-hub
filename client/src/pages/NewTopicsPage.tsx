import React, { useState } from 'react';
import { ChevronDown, Search, User, MoreVertical, Star, ArrowUpRight, HelpCircle, Trophy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useContent, Content } from "@/hooks/useContent";
import { LeaderboardPanel } from "@/components/LeaderboardPanel";

interface Topic {
  id: string;
  topic: string;
  short_summary?: string;
  challengesubject?: string;
  image?: string;
  parentid?: string;
  showstudent?: boolean;
}

const colorVariants = [
  { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-800' },
  { bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-800' },
  { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-800' },
  { bg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-800' },
  { bg: 'bg-pink-100', border: 'border-pink-200', text: 'text-pink-800' },
  { bg: 'bg-indigo-100', border: 'border-indigo-200', text: 'text-indigo-800' },
];

const NewTopicsPage = () => {
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // Fetch real topics data
  const { data: topics, isLoading: topicsLoading } = useQuery<Topic[]>({
    queryKey: ['/api/topics/bowl-challenge'],
  });

  // Fetch all content
  const { data: allContent = [] } = useQuery<any[]>({
    queryKey: ['/api/content'],
  });

  const handleTopicClick = (topicId: string) => {
    setExpandedTopic(expandedTopic === topicId ? null : topicId);
  };

  const getSubtopics = (parentId: string) => {
    if (!topics) return [];
    return topics.filter(topic => topic.parentid === parentId);
  };

  const getTopicContent = (topicId: string): any[] => {
    if (!Array.isArray(allContent)) return [];
    return allContent.filter((content: any) => content.topicid === topicId);
  };

  const getTopicColor = (index: number) => {
    return colorVariants[index % colorVariants.length];
  };

  const QuizButton = ({ variant = "primary" }: { variant?: "primary" | "secondary" }) => (
    <Button 
      size="sm" 
      className={cn(
        "rounded-full px-4 py-1 text-sm font-medium",
        variant === "primary" 
          ? "bg-orange-500 hover:bg-orange-600 text-white" 
          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
      )}
    >
      Quiz
    </Button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Students</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <LeaderboardPanel />
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bowl & Challenge Topics</h1>
        </div>

        {/* Loading State */}
        {topicsLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading topics...</p>
            </div>
          </div>
        )}

        {/* Topics Grid */}
        <div className="space-y-4">
          {topics?.filter(topic => topic.showstudent).map((topic, index) => {
            const isExpanded = expandedTopic === topic.id;
            const subtopics = getSubtopics(topic.id);
            const topicContent = getTopicContent(topic.id);
            const colors = getTopicColor(index);
            
            return (
              <div key={topic.id} className="w-full">
                <Card 
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                    colors.bg,
                    colors.border,
                    isExpanded && "shadow-lg"
                  )}
                  onClick={() => handleTopicClick(topic.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={cn("text-xl font-semibold", colors.text)}>
                            {topic.topic}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                          {topic.short_summary || 'Explore this comprehensive learning topic'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <QuizButton />
                        <ChevronDown 
                          className={cn(
                            "h-5 w-5 text-gray-400 transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )} 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Expanded Content - Two Column Layout */}
                {isExpanded && (
                  <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        {topic.topic} - Content & Subtopics
                      </h4>
                      
                      {/* Two Column Grid for Content and Subtopics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Topic Content */}
                        {topicContent.slice(0, 4).map((content) => (
                          <Card key={content.id} className="border border-gray-200 hover:shadow-sm transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 mb-1">
                                    {content.title || `Content ${content.id.slice(0, 8)}`}
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    {content.short_description || 'Learning content available'}
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-2 ml-4">
                                  <QuizButton variant="primary" />
                                  <Button variant="ghost" size="sm">
                                    <HelpCircle className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <ArrowUpRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        {/* Subtopics */}
                        {subtopics.map((subtopic) => (
                          <Card key={subtopic.id} className="border border-gray-200 hover:shadow-sm transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 mb-1">
                                    {subtopic.topic}
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    {subtopic.short_summary || 'Subtopic content available'}
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-2 ml-4">
                                  <QuizButton variant="secondary" />
                                  <Button variant="ghost" size="sm">
                                    <HelpCircle className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <ArrowUpRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default NewTopicsPage;