import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useContent, Content } from "@/hooks/useContent";
import ContentPopup from "@/components/ContentPopup";
import { ModularTopicListItem } from "@/components/topic/ModularTopicListItem";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import TopicQuizRunner from "@/components/TopicQuizRunner";
import TopicMatchingPopup from "@/components/TopicMatchingPopup";
import MatchingListPopup from "@/components/MatchingListPopup";
import { MatchingActivityPopup } from "@/components/MatchingActivityPopup";
import { useLocation } from "wouter";
import { trackContentAccess, getCurrentUserId } from "@/lib/contentTracking";

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
    quizLevel?: 'easy' | 'hard' | null;
  } | null>(null);
  const [quizContentId, setQuizContentId] = useState<string | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedGroupCards, setExpandedGroupCards] = useState<Set<string>>(new Set()); // This state will control the group card expansion
  const [activeContentId, setActiveContentId] = useState<string | null>(null);
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

  // Fetch all content to filter by challenge subjects
  const {
    data: allContent,
    isLoading: isContentLoading,
    error: contentError
  } = useContent();

  const {
    data: allImages,
    isLoading: isImagesLoading // Correctly named variable
  } = useQuery({
    queryKey: ['images'],
    queryFn: async () => {
      const response = await fetch('/api/images');
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      const data = await response.json();
      return data as Image[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Helper function to get content for a specific challenge subject
  const getContentBySubject = useCallback((subject: string): Content[] => {
    if (!allContent) return [];
    return allContent.filter(content =>
      content && content.challengesubject && content.challengesubject.includes(subject)
    );
  }, [allContent]);

  // Helper function to find image URL for content
  const findImageUrl = useCallback((content: Content | null | undefined): string | null => {
    if (!content) return null;

    if (!allImages) return content.imagelink || null;

    if (content.imageid) {
      const image = allImages.find(img => img.id === content.imageid);
      if (image && image.imagelink) {
        return image.imagelink;
      }
    }
    return content.imagelink || null;
  }, [allImages]);

  // Helper function to find topic image
  const findTopicImage = useCallback((topicContent: Content[]): string | null => {
    if (!allImages || topicContent.length === 0) return null;

    for (const content of topicContent) {
      if (content.imageid) {
        const image = allImages.find(img => img.id === content.imageid && img.default === 'Yes');
        if (image && image.imagelink) {
          return image.imagelink;
        }
      }
    }
    return null;
  }, [allImages]);

  const handleToggleSubject = useCallback((subjectId: string) => {
    // For challenge subjects, we want to use handleToggleGroupCard instead
    // if the intention is to expand the content section within the card itself.
    // If this is meant for overall subject filtering/display, keep it.
    // For this specific request, we want `isGroupCardExpanded` to control the width.
    setExpandedSubjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subjectId)) {
        newSet.delete(subjectId);
      } else {
        newSet.add(subjectId);
      }
      return newSet;
    });
  }, []);

  const toggleContent = useCallback((contentKey: string) => {
    setOpenContent(prev =>
      prev.includes(contentKey)
        ? prev.filter(key => key !== contentKey)
        : [...prev, contentKey]
    );
  }, []);

  const handleContentClick = useCallback(({ content, contextList }: {
    content: Content | null | undefined;
    contextList: Content[];
  }) => {
    if (!content) {
      console.warn("Attempted to click on undefined content.");
      return;
    }
    setActiveContentId(content.id);
    const imageUrl = findImageUrl(content);
    setSelectedContentInfo({ content, contextList, imageUrl, quizLevel: null });

    const currentUserId = getCurrentUserId();
    if (currentUserId) {
      trackContentAccess(currentUserId, content.id);
    }
  }, [findImageUrl]);

  const closePopup = useCallback(() => {
    setSelectedContentInfo(null);
    setQuizContentId(null);
  }, []);

  const handleStartQuiz = useCallback((content: Content | null | undefined, contextList: Content[], level?: 'Easy' | 'Hard') => {
    if (!content) {
      console.warn("Attempted to start quiz on undefined content.");
      return;
    }
    const imageUrl = findImageUrl(content);
    setQuizContentId(content.id);
    const dbLevel = level?.toLowerCase() as 'easy' | 'hard' | undefined;
    setSelectedContentInfo({ content, contextList, imageUrl, quizLevel: dbLevel });
  }, [findImageUrl]);

  const handleStartTopicQuiz = useCallback((topicId: string, level: 'Overview' | 'Easy' | 'Hard', topicName: string) => {
    setTopicQuizInfo({ topicId, level, topicName });
  }, []);

  const closeTopicQuiz = useCallback(() => {
    setTopicQuizInfo(null);
  }, []);

  const handleStartTopicMatching = useCallback((topicId: string, topicName: string) => {
    setTopicMatchingInfo({ topicId, topicName });
  }, []);

  const closeTopicMatching = useCallback(() => {
    setTopicMatchingInfo(null);
  }, []);

  const handleMatchingActivitySelect = useCallback((matchingId: string, matchingTitle: string) => {
    setSelectedMatchingActivity({ matchingId, matchingTitle });
    setTopicMatchingInfo(null);
  }, []);

  const closeMatchingActivity = useCallback(() => {
    setSelectedMatchingActivity(null);
  }, []);

  const handleStartGroupMatching = useCallback((matchingId: string, matchingTitle: string) => {
    setSelectedMatchingActivity({ matchingId, matchingTitle });
  }, []);

  const handleSubtopicClick = useCallback((topicId: string) => {
    console.log(`Subtopic click on ID: ${topicId}`);
  }, []);

  const getTopicContent = useCallback((topicId: string): Content[] => {
    if (!allContent) return [];
    return allContent.filter(content => content && content.topicid === topicId);
  }, [allContent]);

  // This function will control the expansion of the group card (and its width)
  const handleToggleGroupCard = useCallback((groupCardId: string) => {
    setExpandedGroupCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupCardId)) {
        newSet.delete(groupCardId);
      } else {
        newSet.add(groupCardId);
      }
      return newSet;
    });
  }, []);

  const isGroupCardExpanded = useCallback((groupCardId: string) => {
    return expandedGroupCards.has(groupCardId);
  }, [expandedGroupCards]);

  // Create virtual "topics" for each challenge subject
  const subjectTopics = CHALLENGE_SUBJECTS.map(subject => {
    const contentForSubject = getContentBySubject(subject);
    const topicImageUrl = findTopicImage(contentForSubject);

    return {
      id: subject.toLowerCase().replace(/\s+/g, '-'),
      topic: subject,
      short_summary: `Explore content for ${subject}`,
      challengesubject: subject,
      image: topicImageUrl || '',
      parentid: undefined,
      showstudent: true,
      contentCount: contentForSubject.length,
      topicContent: contentForSubject
    };
  }).filter(topic => topic.contentCount > 0);

  if (isContentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <Header />
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="ml-3 text-white">Loading content...</span>
        </div>
      </div>
    );
  }

  if (contentError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <Header />
        <div className="p-4 text-center text-white">
          <h1 className="text-3xl font-bold mb-3">Challenge Subjects</h1>
          <p>Error loading content. Please try again later.</p>
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

          {/* Use the same grid layout as Topics page */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectTopics.map(subject => {
              // Pass the group card's expanded state to the isExpanded prop
              const isCardExpanded = isGroupCardExpanded(subject.id);
              // The 'isActive' here refers to some other state (like highlighting)
              // If you want isActive to also be tied to group card expansion, adjust accordingly.
              const isActive = expandedSubjects.has(subject.id); // This seems to be for the overall subject expansion, not necessarily the content visibility within the group card.

              return (
                <ModularTopicListItem
                  key={subject.id}
                  topic={subject}
                  subtopics={[]} // No subtopics for challenge subjects
                  topicContent={subject.topicContent}
                  allImages={allImages}
                  isExpanded={isCardExpanded} // This controls the width (md:col-span-1 vs md:col-span-2) AND the content visibility
                  isActive={isActive}
                  openContent={openContent}
                  onToggleTopic={handleToggleGroupCard} // Change this to control the group card expansion
                  onToggleContent={toggleContent}
                  onContentClick={handleContentClick}
                  onSubtopicClick={handleSubtopicClick}
                  onStartQuiz={handleStartQuiz}
                  getTopicContent={getTopicContent}
                  onStartTopicQuiz={handleStartTopicQuiz}
                  onStartTopicMatching={handleStartTopicMatching}
                  onStartGroupMatching={handleStartGroupMatching}
                  onToggleGroupCard={handleToggleGroupCard} // Keep this for consistency if needed elsewhere
                  isGroupCardExpanded={isGroupCardExpanded} // Keep this for consistency if needed elsewhere
                  activeContentId={activeContentId}
                />
              );
            })}
          </div>

          {subjectTopics.length === 0 && !isContentLoading && !contentError && (
            <p className="text-white/70 text-center py-4">No challenge subjects with content found.</p>
          )}
        </div>
      </div>

      <ContentPopup
        isOpen={!!selectedContentInfo}
        onClose={closePopup}
        content={selectedContentInfo?.content ?? null}
        contentList={selectedContentInfo?.contextList ?? []}
        onContentChange={newContent => {
          if (selectedContentInfo && newContent) {
            setSelectedContentInfo({
              ...selectedContentInfo,
              content: newContent,
              imageUrl: findImageUrl(newContent),
            });
          }
        }}
        startQuizDirectly={selectedContentInfo?.content?.id === quizContentId}
        quizLevel={selectedContentInfo?.quizLevel}
        imageUrl={selectedContentInfo?.imageUrl ?? null}
        isImageLoading={isImagesLoading} // **FIXED TYPO HERE**
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
          topicId={topicMatchingInfo.topicId}
          topicName={topicMatchingInfo.topicName}
          onClose={closeTopicMatching}
          onSelectMatching={handleMatchingActivitySelect}
        />
      )}

      {selectedMatchingActivity && (
        <MatchingActivityPopup
          isOpen={!!selectedMatchingActivity}
          matchingId={selectedMatchingActivity.matchingId}
          onClose={closeMatchingActivity}
        />
      )}
    </div>
  );
};

export default ChallengeSubject;