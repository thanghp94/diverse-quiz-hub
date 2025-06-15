
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, BookOpen, Play, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useContent, Content } from "@/hooks/useContent";
import ContentPopup from "@/components/ContentPopup";

interface Topic {
  id: string;
  topic: string;
  short_summary?: string;
  challengesubject?: string;
  image?: string;
  parentid?: string;
  showstudent?: boolean;
}

const Topics = () => {
  const [openTopics, setOpenTopics] = useState<string[]>([]);
  const [openContent, setOpenContent] = useState<string[]>([]);
  const [selectedContentInfo, setSelectedContentInfo] = useState<{ content: Content; contextList: Content[] } | null>(null);

  // Fetch topics where parentid is blank and topic is not blank, ordered alphabetically
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
        .order('topic', { ascending: true });
      
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
      } = await supabase.from('topic').select('*').order('topic', {
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
  
  const toggleTopic = (topicId: string) => {
    setOpenTopics(prev => prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]);
  };

  const toggleContent = (contentKey: string) => {
    setOpenContent(prev => prev.includes(contentKey) ? prev.filter(key => key !== contentKey) : [...prev, contentKey]);
  };

  const handleTopicClick = (topicId: string) => {
    if (!allContent) return;
    const contentItem = allContent.find(c => c.id === topicId);
    if (contentItem) {
      const subtopicContentList = getTopicContent(topicId);
      setSelectedContentInfo({ content: contentItem, contextList: subtopicContentList });
    } else {
      console.warn(`Content for topic ID ${topicId} not found`);
    }
  };
  
  const getSubtopics = (parentId: string) => {
    if (!allTopics) return [];
    return allTopics.filter(topic => topic.parentid === parentId).sort((a, b) => a.topic.localeCompare(b.topic));
  };

  const getTopicContent = (topicId: string) => {
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

  const getSubtopicLabel = (parentTopic: string, index: number) => {
    const letter = parentTopic.charAt(0).toUpperCase();
    return `${letter}.${index + 1}`;
  };

  const formatDescription = (description: string) => {
    return description.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < description.split('\n').length - 1 && <br />}
      </span>
    ));
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
                          {topic.short_summary && <p className="text-white/80 text-sm">{formatDescription(topic.short_summary)}</p>}
                        </div>
                        <ChevronDown className={`h-5 w-5 text-white transition-transform duration-200 ${openTopics.includes(topic.id) ? 'rotate-180' : ''}`} />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-3">
                      <div className="space-y-2">
                        {/* Show main topic content in dropdown */}
                        {topicContent.length > 0 && (
                          <div className="mb-3">
                            <Collapsible open={openContent.includes(`topic-${topic.id}`)} onOpenChange={() => toggleContent(`topic-${topic.id}`)}>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="w-full justify-between text-white/90 hover:bg-white/5 p-2">
                                  <span className="text-sm font-medium">Content ({topicContent.length})</span>
                                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openContent.includes(`topic-${topic.id}`) ? 'rotate-180' : ''}`} />
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="space-y-1 mt-2">
                                  {topicContent.map(content => (
                                    <div key={content.id} onClick={() => setSelectedContentInfo({ content, contextList: topicContent })} className="block cursor-pointer">
                                      <div className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 rounded-lg p-2">
                                        <div className="flex items-center gap-2">
                                          <Badge className={`${getContentTypeColor(content)} text-xs`}>
                                            {getContentIcon(content)}
                                          </Badge>
                                          <span className="text-white/90 text-sm">{content.title}</span>
                                        </div>
                                        {content.short_description && (
                                          <p className="text-white/60 text-xs mt-1 ml-6">{formatDescription(content.short_description)}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        )}
                        
                        {/* Show subtopics */}
                        {subtopics.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-white/90 text-sm font-medium mb-2">Subtopics</h4>
                            <div className="space-y-2">
                              {subtopics.map((subtopic, index) => {
                                const subtopicContent = getTopicContent(subtopic.id);
                                return (
                                  <div key={subtopic.id} className="bg-white/5 border border-white/10 rounded-lg p-2">
                                    <div onClick={() => handleTopicClick(subtopic.id)} className="block cursor-pointer">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge className="bg-green-500/20 text-green-200 text-xs">
                                          <BookOpen className="h-3 w-3" />
                                        </Badge>
                                        <span className="text-white/90 text-sm">{getSubtopicLabel(topic.topic, index)} - {subtopic.topic}</span>
                                      </div>
                                      {subtopic.short_summary && (
                                        <p className="text-white/60 text-xs ml-6">{formatDescription(subtopic.short_summary)}</p>
                                      )}
                                    </div>
                                    
                                    {/* Show content for this subtopic in dropdown */}
                                    {subtopicContent.length > 0 && (
                                      <div className="mt-2 ml-6">
                                        <Collapsible open={openContent.includes(`subtopic-${subtopic.id}`)} onOpenChange={() => toggleContent(`subtopic-${subtopic.id}`)}>
                                          <CollapsibleTrigger asChild>
                                            <Button variant="ghost" className="w-full justify-between text-white/70 hover:bg-white/5 p-1 h-auto">
                                              <span className="text-xs">Content ({subtopicContent.length})</span>
                                              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${openContent.includes(`subtopic-${subtopic.id}`) ? 'rotate-180' : ''}`} />
                                            </Button>
                                          </CollapsibleTrigger>
                                          <CollapsibleContent>
                                            <div className="space-y-1 mt-1">
                                              {subtopicContent.map(content => (
                                                <div key={content.id} onClick={() => setSelectedContentInfo({ content, contextList: subtopicContent })} className="block cursor-pointer">
                                                  <div className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 rounded-lg p-2">
                                                    <div className="flex items-center gap-2">
                                                      <Badge className={`${getContentTypeColor(content)} text-xs`}>
                                                        {getContentIcon(content)}
                                                      </Badge>
                                                      <span className="text-white/90 text-xs">{content.title}</span>
                                                    </div>
                                                    {content.short_description && (
                                                      <p className="text-white/60 text-xs mt-1 ml-6">{formatDescription(content.short_description)}</p>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </CollapsibleContent>
                                        </Collapsible>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
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
      <ContentPopup
        isOpen={!!selectedContentInfo}
        onClose={() => setSelectedContentInfo(null)}
        content={selectedContentInfo?.content ?? null}
        contentList={selectedContentInfo?.contextList ?? []}
        onContentChange={(newContent) => {
          if (selectedContentInfo) {
            setSelectedContentInfo({ ...selectedContentInfo, content: newContent });
          }
        }}
      />
    </div>;
};

export default Topics;
