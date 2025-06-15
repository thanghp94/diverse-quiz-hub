import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useContent, Content } from "@/hooks/useContent";
import ContentPopup from "@/components/ContentPopup";
import { TopicListItem } from "@/components/TopicListItem";
import { cn } from "@/lib/utils";
import SharedNav from "@/components/SharedNav";
import TopicQuizRunner from "@/components/TopicQuizRunner";

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
  const [openContent, setOpenContent] = useState<string[]>([]);
  const [selectedContentInfo, setSelectedContentInfo] = useState<{
    content: Content;
    contextList: Content[];
    imageUrl: string | null;
  } | null>(null);
  const [quizContentId, setQuizContentId] = useState<string | null>(null);
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [topicQuizInfo, setTopicQuizInfo] = useState<{
    topicId: string;
    level: 'Overview' | 'Easy' | 'Hard';
    topicName: string;
  } | null>(null);

  // Fetch topics where parentid is blank and topic is not blank, ordered alphabetically
  const {
    data: topics,
    isLoading,
    error
  } = useQuery({
    queryKey: ['bowl-challenge-topics'],
    queryFn: async () => {
      console.log('Fetching Bowl & Challenge topics from Supabase...');
      const {
        data,
        error
      } = await supabase.from('topic').select('*').is('parentid', null).not('topic', 'is', null).neq('topic', '').order('topic', {
        ascending: true
      });
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
  const {
    data: allContent
  } = useContent();

  const {
    data: allImages,
    isLoading: isImagesLoading
  } = useQuery({
    queryKey: ['images'],
    queryFn: async () => {
      console.log('Fetching all images from Supabase...');
      const {
        data,
        error
      } = await supabase.from('image').select('*');
      if (error) {
        console.error('Error fetching images:', error);
        throw error;
      }
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
  const handleStartQuiz = (content: Content, contextList: Content[]) => {
    setSelectedContentInfo({
      content,
      contextList,
      imageUrl: findImageUrl(content),
    });
    setQuizContentId(content.id);
  };
  const closePopup = useCallback(() => {
    setSelectedContentInfo(null);
    setQuizContentId(null);
  }, []);
  const handleStartTopicQuiz = (topicId: string, level: 'Overview' | 'Easy' | 'Hard', topicName: string) => {
    setTopicQuizInfo({ topicId, level, topicName });
  };
  const closeTopicQuiz = useCallback(() => {
    setTopicQuizInfo(null);
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
    return <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
        <div className="max-w-7xl mx-auto">
          <SharedNav />
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
          <SharedNav />
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
      <div className="max-w-7xl mx-auto">
        <SharedNav />
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-3">Bowl & Challenge Topics</h1>
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
              />
            );
          })}
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
    </div>
  );
};
export default Topics;
