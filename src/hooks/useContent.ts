
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Content {
  id: string;
  topicid?: number;
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
  order?: number;
  contentgroup?: string;
  typeoftaking?: string;
  short_description?: string;
  url?: string;
  header?: string;
  update?: string;
}

export const useContent = (topicId?: number) => {
  return useQuery({
    queryKey: ['content', topicId],
    queryFn: async () => {
      console.log('Fetching content from Supabase...', topicId ? `for topic ${topicId}` : 'all content');
      
      let query = supabase
        .from('content')
        .select('*');
      
      if (topicId) {
        query = query.eq('topicid', topicId);
      }
      
      const { data, error } = await query.order('order', { ascending: true, nullsFirst: false });
      
      if (error) {
        console.error('Error fetching content:', error);
        throw error;
      }
      
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
      console.log('Fetching content by ID from Supabase...', contentId);
      
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('id', contentId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching content by ID:', error);
        throw error;
      }
      
      console.log('Content by ID fetched:', data);
      return data as Content | null;
    },
    enabled: !!contentId,
  });
};
