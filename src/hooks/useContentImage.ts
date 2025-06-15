
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useContentImage = (imageid: string | null | undefined) => {
    return useQuery({
        queryKey: ['image', imageid],
        queryFn: async () => {
            if (!imageid) return null;
            console.log('Fetching image for imageid:', imageid);
            
            const { data, error } = await supabase
                .from('image')
                .select('imagelink')
                .eq('id', imageid)
                .maybeSingle();
            
            if (error) {
                console.error('Error fetching image:', error);
                throw error;
            }
            
            console.log('Image data fetched:', data);
            return data?.imagelink || null;
        },
        enabled: !!imageid
    });
};
