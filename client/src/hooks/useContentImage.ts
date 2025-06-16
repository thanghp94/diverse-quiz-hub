
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
                console.log('Looking for image record with id:', imageid);
                
                const { data: imageRecord, error } = await supabase
                    .from('image')
                    .select('*')
                    .eq('id', imageid)
                    .maybeSingle();
                
                if (error) {
                    console.error('Error fetching image record:', error);
                    console.log('Falling back to content imagelink:', fallbackImageLink);
                    return fallbackImageLink || null;
                }
                
                console.log('Image record found:', imageRecord);
                
                if (imageRecord?.imagelink) {
                    console.log('Using imagelink from image table:', imageRecord.imagelink);
                    return imageRecord.imagelink;
                }
                
                console.log('No imagelink in image record, falling back to content imagelink:', fallbackImageLink);
                return fallbackImageLink || null;
            }
            
            // If no imageid but we have fallback, use it
            console.log('No imageid, using fallback imagelink:', fallbackImageLink);
            return fallbackImageLink || null;
        },
        enabled: !!(imageid || fallbackImageLink)
    });
};
