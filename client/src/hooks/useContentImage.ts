
import { useQuery } from "@tanstack/react-query";

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
                // Use imageid directly as it now contains the image URL
                console.log('Using imageid directly as image URL:', imageid);
                return imageid;
            }
            
            // If no imageid but we have fallback, use it
            console.log('No imageid, using fallback imagelink:', fallbackImageLink);
            return fallbackImageLink || null;
        },
        enabled: !!(imageid || fallbackImageLink)
    });
};
