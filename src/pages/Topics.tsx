
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, BookOpen, Play, Image, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Topic {
  id: number;
  topic: string;
  short_summary?: string;
  challengesubject?: string;
  image?: string;
  parentid?: string;
  showstudent?: boolean;
}

const Topics = () => {
  const [openTopics, setOpenTopics] = useState<number[]>([]);

  // Fetch topics with specific IDs (14-23 and 90-92)
  const { data: topics, isLoading, error } = useQuery({
    queryKey: ['bowl-challenge-topics'],
    queryFn: async () => {
      console.log('Fetching Bowl & Challenge topics from Supabase...');
      const targetIds = [
        ...Array.from({ length: 10 }, (_, i) => i + 14), // 14-23
        90, 91, 92 // 90-92
      ];
      
      const { data, error } = await supabase
        .from('topic')
        .select('*')
        .in('id', targetIds)
        .order('id', { ascending: true });
      
      if (error) {
        console.error('Error fetching topics:', error);
        throw error;
      }
      
      console.log('Bowl & Challenge topics fetched:', data);
      return data as Topic[];
    },
  });

  const toggleTopic = (topicId: number) => {
    setOpenTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-3 w-3" />;
      case 'article':
        return <BookOpen className="h-3 w-3" />;
      case 'quiz':
        return <Image className="h-3 w-3" />;
      default:
        return <BookOpen className="h-3 w-3" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-500/20 text-red-200';
      case 'article':
        return 'bg-blue-500/20 text-blue-200';
      case 'quiz':
        return 'bg-green-500/20 text-green-200';
      default:
        return 'bg-gray-500/20 text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-3">Bowl & Challenge Topics</h1>
            <p className="text-lg text-white/80">
              Loading topics...
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
            <span className="ml-3 text-white text-lg">Loading topics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-3">Bowl & Challenge Topics</h1>
            <p className="text-lg text-white/80">
              Error loading topics
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-white">Error loading topics. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-3">Bowl & Challenge Topics</h1>
          <p className="text-lg text-white/80">
            Specialized topics for Bowl & Challenge competitions ({topics?.length || 0} topics)
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {topics?.map((topic) => (
            <Card key={topic.id} className="bg-white/10 backdrop-blur-lg border-white/20">
              <Collapsible 
                open={openTopics.includes(topic.id)} 
                onOpenChange={() => toggleTopic(topic.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors py-3">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-white text-lg">{topic.topic}</CardTitle>
                          {topic.challengesubject && (
                            <Badge variant="outline" className="border-white/30 text-white/70 text-xs">
                              {topic.challengesubject}
                            </Badge>
                          )}
                        </div>
                        {topic.short_summary && (
                          <p className="text-white/80 text-sm">{topic.short_summary}</p>
                        )}
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 mt-1 text-xs">
                          Topic ID: {topic.id}
                        </Badge>
                      </div>
                      <ChevronDown 
                        className={`h-5 w-5 text-white transition-transform duration-200 ${
                          openTopics.includes(topic.id) ? 'rotate-180' : ''
                        }`} 
                      />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-3">
                    <div className="space-y-2">
                      <Link 
                        to={`/content/${topic.id}`}
                        className="block"
                      >
                        <div className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 hover:scale-[1.02] rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-500/20 text-blue-200 text-xs">
                                <BookOpen className="h-3 w-3" />
                                <span className="ml-1">Content</span>
                              </Badge>
                              <span className="text-white font-medium text-sm">View Topic Content</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Topics;
