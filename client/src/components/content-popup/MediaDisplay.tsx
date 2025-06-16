
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageOff } from "lucide-react";
import { Content } from "@/hooks/useContent";

interface MediaDisplayProps {
  imageUrl: string | null | undefined;
  isImageLoading: boolean;
  title: Content['title'];
  imageid: Content['imageid'];
}

export const MediaDisplay = ({ imageUrl, isImageLoading, title, imageid }: MediaDisplayProps) => {
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    setImageLoadError(false);
  }, [imageUrl]);
  
  return (
    <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
        {isImageLoading ? <Skeleton className="w-full h-full" /> : imageLoadError ? <div className="text-red-500 flex flex-col items-center">
                <ImageOff className="h-12 w-12 mb-2" />
                <span className="text-lg font-semibold">Error loading image</span>
                <span className="text-sm mt-1">URL: {imageUrl}</span>
            </div> : imageUrl ? <img src={imageUrl} alt={title} className="w-full h-full object-cover" onError={() => {
        console.error('Image failed to load:', imageUrl);
        setImageLoadError(true);
      }} onLoad={() => {
        console.log('Image loaded successfully:', imageUrl);
      }} /> : <div className="w-full h-full bg-gradient-to-br from-blue-600 via-orange-600 to-red-600 flex items-center justify-center text-center p-4">
                <div className="max-w-full">
                    <h1 className="text-white text-2xl font-semibold break-words leading-tight">{title}</h1>
                    <div className="text-white/70 text-sm mt-2">
                        No image available (imageid: {imageid || 'none'})
                    </div>
                </div>
            </div>}
    </div>
  );
};
