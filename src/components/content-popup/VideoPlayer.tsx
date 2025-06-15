import { Card, CardContent } from "@/components/ui/card";
interface VideoPlayerProps {
  videoEmbedUrl: string | null;
  video2EmbedUrl: string | null;
  videoData: {
    video_name?: string | null;
  } | null;
  video2Data: {
    video_name?: string | null;
  } | null;
}
export const VideoPlayer = ({
  videoEmbedUrl,
  video2EmbedUrl,
  videoData,
  video2Data
}: VideoPlayerProps) => {
  if (!videoEmbedUrl && !video2EmbedUrl) {
    return null;
  }
  return <Card>
      <CardContent className="pt-6">
          <div className="space-y-4">
              {videoEmbedUrl && <div>
                  {videoData?.video_name && <h4 className="font-medium text-sm text-gray-600 mb-2">{videoData.video_name}</h4>}
                  <div className="aspect-video">
                      <iframe className="w-full h-full rounded-lg" src={videoEmbedUrl} title={videoData?.video_name || 'YouTube video player'} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                  </div>
              </div>}
              {video2EmbedUrl && <div>
                  {video2Data?.video_name}
                  <div className="aspect-video">
                      <iframe className="w-full h-full rounded-lg" src={video2EmbedUrl} title={video2Data?.video_name || 'YouTube video player 2'} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                  </div>
              </div>}
          </div>
      </CardContent>
    </Card>;
};