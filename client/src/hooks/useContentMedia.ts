
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Content } from "@/hooks/useContent";

const getYouTubeEmbedUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
};

export const useContentMedia = (content: Content | null) => {
    console.log('useContentMedia hook triggered. Content:', content);
    
    // Fetch related video data
    const { data: videoData } = useQuery({
        queryKey: ['video', content?.videoid],
        queryFn: async () => {
            if (!content?.videoid) return null;
            const { data, error } = await supabase.from('video').select('*').eq('id', content.videoid).maybeSingle();
            if (error) throw error;
            return data;
        },
        enabled: !!content?.videoid
    });

    // Fetch related video data for videoid2
    const { data: video2Data } = useQuery({
        queryKey: ['video2', content?.videoid2],
        queryFn: async () => {
            if (!content?.videoid2) return null;
            const { data, error } = await supabase.from('video').select('*').eq('id', content.videoid2).maybeSingle();
            if (error) throw error;
            return data;
        },
        enabled: !!content?.videoid2
    });

    const videoEmbedUrl = getYouTubeEmbedUrl(videoData?.videolink);
    const video2EmbedUrl = getYouTubeEmbedUrl(video2Data?.videolink);

    return { videoData, video2Data, videoEmbedUrl, video2EmbedUrl };
};
