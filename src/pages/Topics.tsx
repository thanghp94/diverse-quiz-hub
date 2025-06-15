import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, BookOpen, Play, Image, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useContent } from "@/hooks/useContent";

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

  // Fetch topics where parentid is blank and topic is not blank
  const {
    data: topics,
    isLoading,
    error
  } = useQuery({
    queryKey: ['bowl-challenge-topics'],
    queryFn: async () => {
      console.log('Fetching Bowl & Challenge topics from Supabase...');
      const { data, error } = await supabase
        .from('topic')
        .select('*')
        .is('parentid', null)
        .not('topic', 'is', null)
        .neq('topic', '')
        .order('id', { ascending: true });
      
      if (error) {
        console.error('Error fetching topics:', error);
        throw error;
      }
      console.log('Bowl & Challenge topics fetched:', data);
      return data as Topic[];
    }
  });

  // Fetch all subtopics for the dropdown
  const {
    data: allTopics
  } = useQuery({
    queryKey: ['all-topics'],
    queryFn: async () => {
      console.log('Fetching all topics for subtopics...');
      const {
        data,
        error
      } = await supabase.from('topic').select('*').order('id', {
        ascending: true
      });
      if (error) {
        console.error('Error fetching all topics:', error);
        throw error;
      }
      console.log('All topics fetched:', data);
      return data as Topic[];
    }
  });

  // Fetch all content to show related content for each topic
  const { data: allContent } = useContent();
  
  const toggleTopic = (topicId: number) => {
    setOpenTopics(prev => prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]);
  };
  
  const getSubtopics = (parentId: number) => {
    if (!allTopics) return [];
    return allTopics.filter(topic => topic.parentid === parentId.toString());
  };

  const getTopicContent = (topicId: number) => {
    if (!allContent) return [];
    return allContent.filter(content => content.topicid === topicId);
  };
  
  const getContentIcon = (content: any) => {
    if (content.videoid || content.videoid2) return <Play className="h-3 w-3" />;
    if (content.url) return <BookOpen className="h-3 w-3" />;
    return <BookOpen className="h-3 w-3" />;
  };
  
  const getContentTypeColor = (content: any) => {
    if (content.videoid || content.videoid2) return 'bg-red-500/20 text-red-200';
    if (content.url) return 'bg-blue-500/20 text-blue-200';
    return 'bg-green-500/20 text-green-200';
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
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
      </div>;
  }
  
  if (error) {
    return <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
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
      </div>;
  }
  
  return <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-3">Bowl & Challenge Topics</h1>
          <p className="text-lg text-white/80">
            Topics with no parent topic ({topics?.length || 0} topics)
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {topics?.map(topic => {
            const subtopics = getSubtopics(topic.id);
            const topicContent = getTopicContent(topic.id);
            
            return <Card key={topic.id} className="bg-white/10 backdrop-blur-lg border-white/20">
                <Collapsible open={openTopics.includes(topic.id)} onOpenChange={() => toggleTopic(topic.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors py-3">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-white text-lg">{topic.topic}</CardTitle>
                            {topic.challengesubject && <Badge variant="outline" className="border-white/30 text-white/70 text-xs">
                                {topic.challengesubject}
                              </Badge>}
                          </div>
                          {topic.short_summary && <p className="text-white/80 text-sm">{topic.short_summary}</p>}
                        </div>
                        <ChevronDown className={`h-5 w-5 text-white transition-transform duration-200 ${openTopics.includes(topic.id) ? 'rotate-180' : ''}`} />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-3">
                      <div className="space-y-2">
                        {/* Show main topic content */}
                        {topicContent.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-white/90 text-sm font-medium mb-2">Content</h4>
                            <div className="space-y-1">
                              {topicContent.map(content => (
                                <Link key={content.id} to={`/content/${content.id}`} className="block">
                                  <div className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 rounded-lg p-2">
                                    <div className="flex items-center gap-2">
                                      <Badge className={`${getContentTypeColor(content)} text-xs`}>
                                        {getContentIcon(content)}
                                      </Badge>
                                      <span className="text-white/90 text-sm">{content.title}</span>
                                    </div>
                                    {content.short_description && (
                                      <p className="text-white/60 text-xs mt-1 ml-6">{content.short_description}</p>
                                    )}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Show subtopics */}
                        {subtopics.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-white/90 text-sm font-medium mb-2">Subtopics</h4>
                            <div className="space-y-1">
                              {subtopics.map(subtopic => (
                                <Link key={subtopic.id} to={`/content/${subtopic.id}`} className="block">
                                  <div className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 rounded-lg p-2">
                                    <div className="flex items-center gap-2">
                                      <Badge className="bg-green-500/20 text-green-200 text-xs">
                                        <BookOpen className="h-3 w-3" />
                                      </Badge>
                                      <span className="text-white/90 text-sm">{subtopic.topic}</span>
                                    </div>
                                    {subtopic.short_summary && (
                                      <p className="text-white/60 text-xs mt-1 ml-6">{subtopic.short_summary}</p>
                                    )}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {topicContent.length === 0 && subtopics.length === 0 && (
                          <div className="text-center py-4">
                            <p className="text-white/60 text-sm">No content available for this topic</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>;
        })}
        </div>
      </div>
    </div>;
};

export default Topics;
