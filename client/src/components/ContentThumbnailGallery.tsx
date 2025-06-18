import React from 'react';
import { useContentImage } from '@/hooks/useContentImage';

interface ContentThumbnailGalleryProps {
  groupedContent: any[];
  onThumbnailClick?: (content: any) => void;
}

const LocalContentThumbnail = ({ content, onClick, isGroupCard = false }: { 
  content: any, 
  onClick?: () => void, 
  isGroupCard?: boolean 
}) => {
  const { data: imageUrl } = useContentImage(content.imageid);

  // Only show thumbnail if there's an imageid
  if (!content.imageid || !imageUrl) {
    return null;
  }

  // For group card thumbnails in the gallery, use fixed sizing
  if (isGroupCard) {
    return (
      <div className="w-6 h-7 rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity" onClick={onClick}>
        <img 
          src={imageUrl} 
          alt={content.title} 
          className="w-full h-full object-contain bg-white/10"
        />
      </div>
    );
  }

  return (
    <div className="w-24 h-28 rounded-md overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={onClick}>
      <img 
        src={imageUrl} 
        alt={content.title} 
        className="w-full h-full object-cover"
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
          <div key={`thumb-${groupItem.id}`} className="w-12 h-8 sm:w-16 sm:h-10 md:w-20 md:h-12 rounded-md overflow-hidden flex-shrink-0">
            <LocalContentThumbnail 
              content={groupItem} 
              isGroupCard={true}
              onClick={() => handleThumbnailClick(groupItem, {} as React.MouseEvent)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};