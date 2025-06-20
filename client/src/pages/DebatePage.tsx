import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, Users, MessageSquare } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';

interface Topic {
  id: string;
  topic: string;
  short_summary: string | null;
  challengesubject: string | null;
  image: string;
  parentid: string | null;
  showstudent: boolean;
}

interface Content {
  id: string;
  topicid: string;
  imageid: string | null;
  videoid: string | null;
  videoid2: string | null;
  challengesubject: string[] | null;
  parentid: string | null;
  prompt: string;
  information: string;
  title?: string;
  short_blurb?: string;
  short_description?: string;
}

export default function DebatePage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Fetch all topics
  const { data: allTopics = [], isLoading: topicsLoading } = useQuery<Topic[]>({
    queryKey: ['/api/topics'],
  });

  // Fetch all content
  const { data: allContent = [], isLoading: contentLoading } = useQuery<Content[]>({
    queryKey: ['/api/content'],
  });

  // Filter debate topics and content
  const debateTopics = allTopics.filter(topic => 
    topic.challengesubject === 'debate' &&
    topic.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const debateContent = allContent.filter(item => 
    item.parentid === 'debate' &&
    (item.information?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.short_blurb?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.title?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter content by selected topic if any
  const filteredContent = selectedTopic 
    ? debateContent.filter(item => item.topicid === selectedTopic)
    : debateContent;

  const isLoading = topicsLoading || contentLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Debate Center</h1>
          </div>
          <p className="text-gray-600 mb-6">
            Explore debate topics and engaging content to develop your argumentation skills
          </p>
          
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search debate topics and content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading debate content...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Topics Section */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Debate Topics
                    <Badge variant="secondary" className="ml-auto">
                      {debateTopics.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {debateTopics.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No debate topics found</p>
                      <p className="text-sm mt-1">Try adjusting your search terms</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        variant={selectedTopic === null ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setSelectedTopic(null)}
                      >
                        All Topics
                      </Button>
                      {debateTopics.map((topic) => (
                        <Button
                          key={topic.id}
                          variant={selectedTopic === topic.id ? "default" : "outline"}
                          className="w-full justify-start text-left h-auto p-3"
                          onClick={() => setSelectedTopic(topic.id)}
                        >
                          <div>
                            <div className="font-medium text-sm">{topic.topic}</div>
                            {topic.short_summary && (
                              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {topic.short_summary}
                              </div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Content Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Debate Content
                    <Badge variant="secondary" className="ml-auto">
                      {filteredContent.length}
                    </Badge>
                  </CardTitle>
                  {selectedTopic && (
                    <p className="text-sm text-gray-600">
                      Filtered by: {debateTopics.find(t => t.id === selectedTopic)?.topic}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  {filteredContent.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">No debate content found</h3>
                      <p className="text-sm">
                        {selectedTopic 
                          ? "No content available for the selected topic" 
                          : "Try adjusting your search terms or check back later"
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {filteredContent.map((item) => (
                        <Card key={item.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  {item.title || item.short_blurb || `Content ${item.id}`}
                                </h3>
                                {item.short_description && (
                                  <p className="text-gray-600 text-sm mb-3">
                                    {item.short_description}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col gap-2 ml-4">
                                {item.challengesubject && (
                                  <div className="flex flex-wrap gap-1">
                                    {item.challengesubject.map((subject, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {subject}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  ID: {item.id}
                                </Badge>
                              </div>
                            </div>
                            
                            {item.information && (
                              <div className="prose prose-sm max-w-none">
                                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                  {item.information.length > 500 
                                    ? `${item.information.substring(0, 500)}...`
                                    : item.information
                                  }
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                {item.topicid && (
                                  <span>Topic: {item.topicid}</span>
                                )}
                                {item.imageid && (
                                  <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Has Image
                                  </span>
                                )}
                                {item.videoid && (
                                  <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    Has Video
                                  </span>
                                )}
                              </div>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}