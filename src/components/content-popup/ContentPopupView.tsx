
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ArrowLeft, ArrowRight, HelpCircle, Languages, ChevronDown, ImageOff } from "lucide-react";
import { Content } from "@/hooks/useContent";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentPopupViewProps {
    content: Content;
    contentListLength: number;
    currentIndex: number;
    handlePrevious: () => void;
    handleNext: () => void;
    startQuiz: () => void;
    imageUrl: string | null | undefined;
    isImageLoading: boolean;
    videoEmbedUrl: string | null;
    video2EmbedUrl: string | null;
    videoData: { video_name?: string | null } | null;
    video2Data: { video_name?: string | null } | null;
}

const formatText = (text: string | null | undefined) => {
    if (!text) return '';
    return text.split('\n').map((line, index) => <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>);
};

export const ContentPopupView = ({
    content,
    contentListLength,
    currentIndex,
    handlePrevious,
    handleNext,
    startQuiz,
    imageUrl,
    isImageLoading,
    videoEmbedUrl,
    video2EmbedUrl,
    videoData,
    video2Data,
}: ContentPopupViewProps) => {
    const [isSecondBlurbOpen, setIsSecondBlurbOpen] = useState(false);
    const [imageLoadError, setImageLoadError] = useState(false);

    useEffect(() => {
        setImageLoadError(false);
    }, [imageUrl]);

    console.log('ContentPopupView debug - content.imageid:', content.imageid, 'content.imagelink:', content.imagelink, 'final imageUrl:', imageUrl, 'isImageLoading:', isImageLoading);

    return (
        <div className="py-4 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border">
                <div className="flex items-center gap-2">
                    <Button onClick={handlePrevious} disabled={currentIndex <= 0} size="sm">
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <Button onClick={handleNext} disabled={contentListLength === 0 || currentIndex >= contentListLength - 1} size="sm">
                        Next
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                    {contentListLength > 0 && <div className="text-sm text-gray-500">
                        {currentIndex + 1} / {contentListLength}
                    </div>}
                </div>
            
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={startQuiz}>
                        <HelpCircle className="h-4 w-4" />
                        Quiz
                    </Button>
                    <Button variant="outline" size="sm">
                        <Languages className="h-4 w-4" />
                        Translation
                    </Button>
                </div>
            </div>

            <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                {isImageLoading ? (
                    <Skeleton className="w-full h-full" />
                ) : imageLoadError ? (
                    <div className="text-red-500 flex flex-col items-center">
                        <ImageOff className="h-12 w-12 mb-2" />
                        <span className="text-lg font-semibold">Error loading image</span>
                        <span className="text-sm mt-1">URL: {imageUrl}</span>
                    </div>
                ) : imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt={content.title} 
                        className="w-full h-full object-cover" 
                        onError={() => {
                            console.error('Image failed to load:', imageUrl);
                            setImageLoadError(true);
                        }}
                        onLoad={() => {
                            console.log('Image loaded successfully:', imageUrl);
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 via-orange-600 to-red-600 flex items-center justify-center text-center p-4">
                        <div>
                            <span className="text-white text-xl font-semibold">{content.title}</span>
                            <div className="text-white/70 text-sm mt-2">
                                No image available (imageid: {content.imageid || 'none'})
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {content.short_blurb && <Card>
                <CardHeader>
                    <h3 className="font-semibold text-lg">Short Blurb</h3>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">{formatText(content.short_blurb)}</p>
                </CardContent>
            </Card>}

            {content.second_short_blurb && <Card>
                <Collapsible open={isSecondBlurbOpen} onOpenChange={setIsSecondBlurbOpen}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between p-6 text-left rounded-lg hover:bg-muted/50">
                        <h3 className="font-semibold text-lg">Second Short Blurb</h3>
                        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isSecondBlurbOpen ? "rotate-180" : ""}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="pt-0 pb-6 px-6">
                            <p className="text-sm">{formatText(content.second_short_blurb)}</p>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>}
        
            {content.short_description && <Card>
                <CardHeader>
                    <h3 className="font-semibold text-lg">Description</h3>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">{formatText(content.short_description)}</p>
                </CardContent>
            </Card>}

            {(videoEmbedUrl || video2EmbedUrl) && <Card>
                <CardHeader>
                    <h3 className="font-semibold text-lg">Videos</h3>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {videoEmbedUrl && <div>
                            {videoData?.video_name && <h4 className="font-medium text-sm text-gray-600 mb-2">{videoData.video_name}</h4>}
                            <div className="aspect-video">
                                <iframe className="w-full h-full rounded-lg" src={videoEmbedUrl} title={videoData?.video_name || 'YouTube video player'} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                            </div>
                        </div>}
                        {video2EmbedUrl && <div>
                            {video2Data?.video_name && <h4 className="font-medium text-sm text-gray-600 mb-2">{video2Data.video_name}</h4>}
                            <div className="aspect-video">
                                <iframe className="w-full h-full rounded-lg" src={video2EmbedUrl} title={video2Data?.video_name || 'YouTube video player 2'} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                            </div>
                        </div>}
                    </div>
                </CardContent>
            </Card>}

            {(content.translation || content.vocabulary) && <Card>
                <CardHeader>
                    <h3 className="font-semibold text-lg">Language Support</h3>
                </CardHeader>
                <CardContent>
                    {content.translation && <div className="mb-3">
                        <h4 className="font-medium text-sm text-gray-600 mb-1">Translation:</h4>
                        <p className="text-sm">{formatText(content.translation)}</p>
                    </div>}
                    
                    {content.vocabulary && <div>
                        <h4 className="font-medium text-sm text-gray-600 mb-1">Vocabulary:</h4>
                        <p className="text-sm">{formatText(content.vocabulary)}</p>
                    </div>}
                </CardContent>
            </Card>}

            {content.url && <Card>
                <CardHeader>
                    <h3 className="font-semibold text-lg">External Link</h3>
                </CardHeader>
                <CardContent>
                    <a href={content.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline break-all">
                        {content.url}
                    </a>
                </CardContent>
            </Card>}
        </div>
    )
}
