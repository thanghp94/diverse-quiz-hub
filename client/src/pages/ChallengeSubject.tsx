import { useState, useCallback, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useContent, Content } from "@/hooks/useContent";
import ContentPopup from "@/components/ContentPopup";
import { TopicListItem } from "@/components/TopicListItem";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import TopicQuizRunner from "@/components/TopicQuizRunner";
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

// Define the challenge subjects we want to display
const CHALLENGE_SUBJECTS = [
  'Art',
  'Media', 
  'Literature',
  'Music',
  'Science and Technology',
  'Special Areas',
  'History',
  'Social Studies'
];

const ChallengeSubject = () => {
  const [location] = useLocation();
  const [openContent, setOpenContent] = useState<string[]>([]);
  const [selectedContentInfo, setSelectedContentInfo] = useState<{
    content: Content;
    contextList: Content[];
    imageUrl: string | null;
  } | null>(null);
  const [quizContentId, setQuizContentId] = useState<string | null>(null);
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [topicQuizInfo, setTopicQuizInfo] = useState<{
    topicId: string;
    level: 'Overview' | 'Easy' | 'Hard';
    topicName: string;
  } | null>(null);

  // Parse URL parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const activeTab = urlParams.get('tab');

  // Fetch all content to filter by challenge subjects
  const {
    data: allContent
  } = useContent();

  const {
    data: allImages,
    isLoading: isImagesLoading
  } = useQuery({
    queryKey: ['images'],
    queryFn: async () => {
      const response = await fetch('/api/images');
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      const data = await response.json();
      return data as Image[];
    }
  });

  // Helper function to get content for a specific challenge subject
  const getContentBySubject = useCallback((subject: string): Content[] => {
    if (!allContent) return [];
    
    return allContent.filter(content => 
      content.challengesubject && 
      content.challengesubject.includes(subject)
    );
  }, [allContent]);

  // Helper function to find image URL for content
  const findImageUrl = useCallback((content: Content): string | null => {
    if (!allImages || !content.imageid) return null;
    const image = allImages.find(img => img.id === content.imageid);
    return image?.imagelink || null;
  }, [allImages]);

  const handleToggleSubject = useCallback((subjectId: string) => {
    setExpandedSubjectId(prev => prev === subjectId ? null : subjectId);
  }, []);

  const toggleContent = useCallback((contentKey: string) => {
    setOpenContent(prev => 
      prev.includes(contentKey) 
        ? prev.filter(key => key !== contentKey)
        : [...prev, contentKey]
    );
  }, []);

  const handleContentClick = useCallback(({ content, contextList }: { 
    content: Content; 
    contextList: Content[]; 
  }) => {
    const imageUrl = findImageUrl(content);
    setSelectedContentInfo({ content, contextList, imageUrl });
  }, [findImageUrl]);

  const closePopup = useCallback(() => {
    setSelectedContentInfo(null);
    setQuizContentId(null);
  }, []);

  const handleStartQuiz = useCallback((content: Content, contextList: Content[]) => {
    const imageUrl = findImageUrl(content);
    setQuizContentId(content.id);
    setSelectedContentInfo({ content, contextList, imageUrl });
  }, [findImageUrl]);

  const handleStartTopicQuiz = useCallback((topicId: string, level: 'Overview' | 'Easy' | 'Hard', topicName: string) => {
    setTopicQuizInfo({ topicId, level, topicName });
  }, []);

  const closeTopicQuiz = useCallback(() => {
    setTopicQuizInfo(null);
  }, []);

  // Create virtual "topics" for each challenge subject
  const subjectTopics = CHALLENGE_SUBJECTS.map(subject => {
    const content = getContentBySubject(subject);
    return {
      id: subject.toLowerCase().replace(/\s+/g, '-'),
      topic: subject,
      short_summary: `Content related to ${subject}`,
      challengesubject: subject,
      image: '',
      parentid: null,
      showstudent: true,
      contentCount: content.length
    };
  }).filter(topic => topic.contentCount > 0); // Only show subjects that have content

  if (!allContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <Header />
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
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
              {activeTab ? `Quiz Mode: ${activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}` : 'Challenge Subjects'}
            </h1>
            {activeTab && (
              <p className="text-lg text-white/80">
                Select a subject below to start your {activeTab.replace('-', ' ')} quiz
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {subjectTopics.map(subject => {
              const subjectContent = getContentBySubject(subject.challengesubject || subject.topic);
              const isExpanded = expandedSubjectId === subject.id;

              return (
                <div
                  key={subject.id}
                  className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
                >
                  <button
                    onClick={() => handleToggleSubject(subject.id)}
                    className="w-full p-4 text-left hover:bg-white/5 transition-colors rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {subject.topic}
                        </h3>
                        <p className="text-sm text-white/70">
                          {subject.contentCount} content items
                        </p>
                      </div>
                      <div className="text-white/70">
                        {isExpanded ? '−' : '+'}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <div className="space-y-2">
                        {subjectContent.map(content => (
                          <div
                            key={content.id}
                            className="bg-white/5 rounded p-3 hover:bg-white/10 transition-colors cursor-pointer"
                            onClick={() => handleContentClick({ 
                              content, 
                              contextList: subjectContent 
                            })}
                          >
                            <h4 className="text-white font-medium text-sm mb-1">
                              {content.title}
                            </h4>
                            {content.short_description && (
                              <p className="text-white/70 text-xs">
                                {content.short_description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {activeTab && (
                        <div className="mt-4 pt-3 border-t border-white/20">
                          <button
                            onClick={() => handleStartTopicQuiz(
                              subject.id, 
                              activeTab === 'overview-quiz' ? 'Overview' : 
                              activeTab === 'easy-quiz' ? 'Easy' : 'Hard',
                              subject.topic
                            )}
                            className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded transition-colors text-sm font-medium"
                          >
                            Start {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Quiz
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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

export default ChallengeSubject;