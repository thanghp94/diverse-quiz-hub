
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useContentImage = (imageid: string | null | undefined, fallbackImageLink?: string | null) => {
    return useQuery({
        queryKey: ['image', imageid, fallbackImageLink],
        queryFn: async () => {
            console.log('useContentImage called with imageid:', imageid, 'fallbackImageLink:', fallbackImageLink);
            
            if (!imageid && !fallbackImageLink) {
                console.log('No imageid or fallback provided, returning null');
                return null;
            }
            
            if (imageid) {
                console.log('Fetching image from database for imageid:', imageid);
                
                const { data, error } = await supabase
                    .from('image')
                    .select('*')
                    .eq('id', imageid)
                    .maybeSingle();
                
                if (error) {
                    console.error('Error fetching image:', error);
                    // Fall back to content imagelink if database fetch fails
                    console.log('Falling back to content imagelink:', fallbackImageLink);
                    return fallbackImageLink || null;
                }
                
                console.log('Full image data fetched:', data);
                
                if (data?.imagelink) {
                    console.log('Using imagelink from database:', data.imagelink);
                    return data.imagelink;
                }
                
                console.log('No imagelink in database record, falling back to content imagelink:', fallbackImageLink);
                return fallbackImageLink || null;
            }
            
            // If no imageid but we have fallback, use it
            console.log('No imageid, using fallback imagelink:', fallbackImageLink);
            return fallbackImageLink || null;
        },
        enabled: !!(imageid || fallbackImageLink)
    });
};
