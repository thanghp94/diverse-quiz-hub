
import { useQuery } from "@tanstack/react-query";
import { Content } from "@/hooks/useContent";

const getYouTubeEmbedUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
};

export const useContentMedia = (content: Content | null) => {
    console.log('useContentMedia hook triggered. Content:', content);
    
    // Use video links directly from content table columns
    const videoEmbedUrl = getYouTubeEmbedUrl(content?.videoid);
    const video2EmbedUrl = getYouTubeEmbedUrl(content?.videoid2);

    // Create mock video data objects for compatibility with existing components
    const videoData = content?.videoid ? { 
        id: content.videoid, 
        videolink: content.videoid,
        video_name: null
    } : null;
    
    const video2Data = content?.videoid2 ? { 
        id: content.videoid2, 
        videolink: content.videoid2,
        video_name: null
    } : null;

    return { videoData, video2Data, videoEmbedUrl, video2EmbedUrl };
};
