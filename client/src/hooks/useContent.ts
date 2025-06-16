
import { useQuery } from "@tanstack/react-query";

export interface Content {
  id: string;
  topicid?: string;
  imageid?: string;
  videoid?: string;
  videoid2?: string;
  challengesubject?: string[];
  parentid?: string;
  prompt?: string;
  information?: string;
  title: string;
  short_blurb?: string;
  second_short_blurb?: string;
  mindmap?: string;
  mindmapurl?: string;
  translation?: string;
  vocabulary?: string;
  classdone?: string;
  studentseen?: string;
  show?: string;
  showtranslation?: string;
  showstudent?: string;
  order?: string; // Changed from number to string to match database
  contentgroup?: string;
  typeoftaking?: string;
  short_description?: string;
  url?: string;
  header?: string;
  update?: string;
  imagelink?: string;
}

export const useContent = (topicId?: string) => {
  return useQuery({
    queryKey: ['content', topicId],
    queryFn: async () => {
      console.log('Fetching content from API...', topicId ? `for topic ${topicId}` : 'all content');
      
      const url = topicId ? `/api/content?topicId=${topicId}` : '/api/content';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      
      const data = await response.json();
      console.log('Content fetched:', data);
      return data as Content[];
    },
    enabled: true,
  });
};

export const useContentById = (contentId: string) => {
  return useQuery({
    queryKey: ['content', contentId],
    queryFn: async () => {
      console.log('Fetching content by ID from API...', contentId);
      
      const response = await fetch(`/api/content/${contentId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch content by ID');
      }
      
      const data = await response.json();
      console.log('Content by ID fetched:', data);
      return data as Content | null;
    },
    enabled: !!contentId,
  });
};
