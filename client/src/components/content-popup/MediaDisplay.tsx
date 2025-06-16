
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ImageOff } from "lucide-react";
import { Content } from "@/hooks/useContent";

interface MediaDisplayProps {
  imageUrl: string | null | undefined;
  isImageLoading: boolean;
  title: Content['title'];
  imageid: Content['imageid'];
  content?: Content;
  isFullWidth?: boolean;
}

export const MediaDisplay = ({ imageUrl, isImageLoading, title, imageid, content, isFullWidth = false }: MediaDisplayProps) => {
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);

  // Determine the actual image URL to use - prioritize direct imageid URLs over imageUrl from image table
  const actualImageUrl = (imageid && (imageid.startsWith('http://') || imageid.startsWith('https://'))) 
    ? imageid 
    : imageUrl;

  useEffect(() => {
    setImageLoadError(false);
  }, [actualImageUrl]);

  const handleImageClick = () => {
    if (actualImageUrl && !imageLoadError) {
      setIsImagePopupOpen(true);
    }
  };
  
  return (
    <>
      <div className={`relative w-full ${isFullWidth ? 'h-full' : 'h-64'} bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center`}>
          {isImageLoading ? <Skeleton className="w-full h-full" /> : imageLoadError ? <div className="text-red-500 flex flex-col items-center">
                  <ImageOff className="h-12 w-12 mb-2" />
                  <span className="text-lg font-semibold">Error loading image</span>
                  <span className="text-sm mt-1">URL: {actualImageUrl}</span>
              </div> : actualImageUrl ? <img 
                src={actualImageUrl} 
                alt={title} 
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                onClick={handleImageClick}
                onError={() => {
                  console.error('Image failed to load:', actualImageUrl);
                  setImageLoadError(true);
                }} 
                onLoad={() => {
                  console.log('Image loaded successfully:', actualImageUrl);
                }} 
              /> : <div className="w-full h-full bg-gradient-to-br from-blue-600 via-orange-600 to-red-600 flex items-center justify-center text-center p-4">
                  <div className="max-w-full">
                      <h1 className="text-white text-2xl font-semibold break-words leading-tight">{title}</h1>
                      <div className="text-white/70 text-sm mt-2">
                          No image available (imageid: {imageid || 'none'})
                      </div>
                  </div>
              </div>}
      </div>

      {/* Image popup modal */}
      <Dialog open={isImagePopupOpen} onOpenChange={setIsImagePopupOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0">
          <VisuallyHidden>
            <DialogTitle>Image View</DialogTitle>
            <DialogDescription>Full size view of {title}</DialogDescription>
          </VisuallyHidden>
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt={title} 
                className="max-w-full max-h-[85vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
