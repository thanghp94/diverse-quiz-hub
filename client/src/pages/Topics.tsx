import { useState, useCallback, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useContent, Content } from "@/hooks/useContent";
import ContentPopup from "@/components/ContentPopup";
import { TopicListItem } from "@/components/TopicListItem";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import TopicQuizRunner from "@/components/TopicQuizRunner";
import TopicMatchingPopup from "@/components/TopicMatchingPopup";
import MatchingListPopup from "@/components/MatchingListPopup";
import { MatchingActivityPopup } from "@/components/MatchingActivityPopup";
import { useLocation } from "wouter";

interface Topic {
  id: string;
  topic: string;
  short_summary?: string;
  challengesubject?: string;
  image?: string;
  parentid?: string;
  showstudent?: boolean;
}
interface Image {
  id: string;
  imagelink: string | null;
  contentid: string | null;
  default: string | null;
}

const Topics = () => {
  const [location] = useLocation();
  const [openContent, setOpenContent] = useState<string[]>([]);
  const [selectedContentInfo, setSelectedContentInfo] = useState<{
    content: Content;
    contextList: Content[];
    imageUrl: string | null;
  } | null>(null);
  const [quizContentId, setQuizContentId] = useState<string | null>(null);
  const [quizLevel, setQuizLevel] = useState<'Easy' | 'Hard' | null>(null);
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [topicQuizInfo, setTopicQuizInfo] = useState<{
    topicId: string;
    level: 'Overview' | 'Easy' | 'Hard';
    topicName: string;
  } | null>(null);
  const [topicMatchingInfo, setTopicMatchingInfo] = useState<{
    topicId: string;
    topicName: string;
  } | null>(null);
  const [selectedMatchingActivity, setSelectedMatchingActivity] = useState<{
    matchingId: string;
    matchingTitle: string;
  } | null>(null);

  // Parse URL parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const activeTab = urlParams.get('tab');
  const subjectFilter = urlParams.get('subject');

  // Fetch topics where parentid is blank and topic is not blank, ordered alphabetically
  const {
    data: topics,
    isLoading,
    error
  } = useQuery({
    queryKey: ['bowl-challenge-topics'],
    queryFn: async () => {
      console.log('Fetching Bowl & Challenge topics from API...');
      const response = await fetch('/api/topics/bowl-challenge');
      if (!response.ok) {
        throw new Error('Failed to fetch bowl challenge topics');
      }
      const data = await response.json();
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
      const response = await fetch('/api/topics');
      if (!response.ok) {
        throw new Error('Failed to fetch all topics');
      }
      const data = await response.json();
      console.log('All topics fetched:', data);
      return data as Topic[];
    }
  });

  // Fetch all content to show related content for each topic
  const {
    data: allContent
  } = useContent();

  const {
    data: allImages,
    isLoading: isImagesLoading
  } = useQuery({
    queryKey: ['images'],
    queryFn: async () => {
      console.log('Fetching all images from API...');
      const response = await fetch('/api/images');
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      const data = await response.json();
      console.log('All images fetched:', data);
      return data as Image[];
    }
  });

  const findImageUrl = (content: Content): string | null => {
    if (content.imageid && allImages) {
      const image = allImages.find(img => img.id === content.imageid);
      if (image && image.imagelink) {
        return image.imagelink;
      }
    }
    return content.imagelink || null;
  }

  const handleToggleTopic = (topicId: string) => {
    setExpandedTopicId(currentId => (currentId === topicId ? null : topicId));
  };

  const toggleContent = (contentKey: string) => {
    setOpenContent(prev => prev.includes(contentKey) ? prev.filter(key => key !== contentKey) : [...prev, contentKey]);
  };
  const handleSubtopicClick = (topicId: string) => {
    if (!allContent) return;
    const topicContent = getTopicContent(topicId);
    const firstContent = topicContent[0];
    if (firstContent) {
      setSelectedContentInfo({
        content: firstContent,
        contextList: topicContent,
        imageUrl: findImageUrl(firstContent),
      });
    } else {
      console.warn(`Content for topic ID ${topicId} not found`);
    }
  };
  const handleContentClick = (info: { content: Content; contextList: Content[] }) => {
    setSelectedContentInfo({
      content: info.content,
      contextList: info.contextList,
      imageUrl: findImageUrl(info.content),
    });
  };
  const handleStartQuiz = (content: Content, contextList: Content[], level?: 'Easy' | 'Hard') => {
    if (level) {
      // Start quiz directly without opening content popup
      setSelectedContentInfo({
        content,
        contextList,
        imageUrl: findImageUrl(content),
      });
      setQuizContentId(content.id);
      setQuizLevel(level);
    } else {
      // Original behavior - open content popup
      setSelectedContentInfo({
        content,
        contextList,
        imageUrl: findImageUrl(content),
      });
      setQuizContentId(content.id);
    }
  };
  const closePopup = useCallback(() => {
    setSelectedContentInfo(null);
    setQuizContentId(null);
    setQuizLevel(null);
  }, []);
  const handleStartTopicQuiz = (topicId: string, level: 'Overview' | 'Easy' | 'Hard', topicName: string) => {
    setTopicQuizInfo({ topicId, level, topicName });
  };
  const closeTopicQuiz = useCallback(() => {
    setTopicQuizInfo(null);
  }, []);

  const handleStartTopicMatching = (topicId: string, topicName: string) => {
    setTopicMatchingInfo({ topicId, topicName });
  };
  const closeTopicMatching = useCallback(() => {
    setTopicMatchingInfo(null);
  }, []);

  const handleSelectMatchingActivity = (matchingId: string, matchingTitle: string) => {
    setSelectedMatchingActivity({ matchingId, matchingTitle });
  };
  const closeMatchingActivity = useCallback(() => {
    setSelectedMatchingActivity(null);
  }, []);

  const getSubtopics = (parentId: string) => {
    if (!allTopics) return [];
    return allTopics.filter(topic => topic.parentid === parentId).sort((a, b) => a.topic.localeCompare(b.topic));
  };
  const getTopicContent = (topicId: string) => {
    if (!allContent) return [];
    return allContent.filter(content => content.topicid === topicId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <Header />
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-3">Topics</h1>
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
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <Header />
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-3">Topics</h1>
              <p className="text-lg text-white/80">
                Error loading topics
              </p>
            </div>
            <div className="text-center py-12">
              <p className="text-white">Error loading topics. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <Header />
      <div className="p-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-3">
                {activeTab ? `Quiz Mode: ${activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}` : 'Bowl & Challenge Topics'}
              </h1>
              {activeTab && (
                <p className="text-lg text-white/80">
                  Select a topic below to start your {activeTab.replace('-', ' ')} quiz
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {topics?.map(topic => {
                const subtopics = getSubtopics(topic.id);
                const topicContent = getTopicContent(topic.id);
                const isExpanded = expandedTopicId === topic.id;

                return (
                  <TopicListItem
                    key={topic.id}
                    topic={topic}
                    subtopics={subtopics}
                    topicContent={topicContent}
                    allImages={allImages}
                    isExpanded={isExpanded}
                    openContent={openContent}
                    onToggleTopic={handleToggleTopic}
                    onToggleContent={toggleContent}
                    onContentClick={handleContentClick}
                    onSubtopicClick={handleSubtopicClick}
                    onStartQuiz={handleStartQuiz}
                    getTopicContent={getTopicContent}
                    onStartTopicQuiz={handleStartTopicQuiz}
                    onStartTopicMatching={handleStartTopicMatching}
                  />
                );
              })}
            </div>
          </div>
        </div>

      <ContentPopup
        isOpen={!!selectedContentInfo}
        onClose={closePopup}
        content={selectedContentInfo?.content ?? null}
        contentList={selectedContentInfo?.contextList ?? []}
        onContentChange={newContent => {
          if (selectedContentInfo) {
            setSelectedContentInfo({ 
              ...selectedContentInfo, 
              content: newContent,
              imageUrl: findImageUrl(newContent),
            });
          }
        }}
        startQuizDirectly={selectedContentInfo?.content?.id === quizContentId}
        quizLevel={quizLevel}
        imageUrl={selectedContentInfo?.imageUrl ?? null}
        isImageLoading={isImagesLoading}
      />

      {topicQuizInfo && (
        <TopicQuizRunner
          topicId={topicQuizInfo.topicId}
          level={topicQuizInfo.level}
          topicName={topicQuizInfo.topicName}
          onClose={closeTopicQuiz}
        />
      )}

      {topicMatchingInfo && (
        <MatchingListPopup
          isOpen={!!topicMatchingInfo}
          onClose={closeTopicMatching}
          topicId={topicMatchingInfo.topicId}
          topicName={topicMatchingInfo.topicName}
          onSelectMatching={handleSelectMatchingActivity}
        />
      )}

      {selectedMatchingActivity && (
        <MatchingActivityPopup
          isOpen={!!selectedMatchingActivity}
          onClose={closeMatchingActivity}
          matchingId={selectedMatchingActivity.matchingId}
        />
      )}
    </div>
  );
};
export default Topics;
