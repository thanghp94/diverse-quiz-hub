import React from 'react';
import { useContentImage } from '@/hooks/useContentImage';

interface ContentThumbnailGalleryProps {
  groupedContent: any[];
  onThumbnailClick?: (content: any) => void;
}

const GalleryThumbnail = ({ content, onClick }: { 
  content: any, 
  onClick?: () => void
}) => {
  const { data: imageUrl } = useContentImage(content.imageid);

  // Only show thumbnail if there's an imageid
  if (!content.imageid || !imageUrl) {
    return null;
  }

  return (
    <div className="w-24 h-28 rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity" onClick={onClick}>
      <img 
        src={imageUrl} 
        alt={content.title} 
        className="w-full h-full object-contain bg-white/10"
      />
    </div>
  );
};

export const ContentThumbnailGallery = ({ 
  groupedContent, 
  onThumbnailClick 
}: ContentThumbnailGalleryProps) => {
  const handleThumbnailClick = (groupItem: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onThumbnailClick) {
      onThumbnailClick(groupItem);
      return;
    }
    
    // Default behavior: Show image in dialog
    if (groupItem.imageid) {
      const imageDialog = document.createElement('div');
      imageDialog.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
      imageDialog.onclick = () => document.body.removeChild(imageDialog);
      const img = document.createElement('img');
      img.src = groupItem.imageid;
      img.className = 'max-w-[90vw] max-h-[90vh] object-contain';
      imageDialog.appendChild(img);
      document.body.appendChild(imageDialog);
    }
  };

  if (groupedContent.length === 0) {
    return null;
  }

  return (
    <div className="mb-3 w-full">
      <div className="flex flex-wrap gap-2 justify-center w-full">
        {groupedContent.map((groupItem) => (
          <div key={`thumb-${groupItem.id}`} className="flex-shrink-0">
            <GalleryThumbnail 
              content={groupItem} 
              onClick={() => handleThumbnailClick(groupItem, {} as React.MouseEvent)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};