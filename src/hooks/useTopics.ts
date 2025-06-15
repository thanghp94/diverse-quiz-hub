
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Topic {
  id: string;
  topic: string;
  short_summary?: string;
  challengesubject?: string;
  image?: string;
  parentid?: string;
  showstudent?: boolean;
}

export const useTopics = () => {
  return useQuery({
    queryKey: ['topics'],
    queryFn: async () => {
      console.log('Fetching topics from Supabase...');
      const { data, error } = await supabase
        .from('topic')
        .select('*')
        .eq('showstudent', true)
        .order('Order', { ascending: true });
      
      if (error) {
        console.error('Error fetching topics:', error);
        throw error;
      }
      
      console.log('Topics fetched:', data);
      return data as Topic[];
    },
  });
};
