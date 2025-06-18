import React, { useState, useRef, useEffect } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface TranslationTooltipProps {
  children: string;
  translationDictionary?: Record<string, string> | null;
  className?: string;
}

const TranslationTooltip: React.FC<TranslationTooltipProps> = ({ 
  children, 
  translationDictionary, 
  className = "" 
}) => {
  if (!translationDictionary || Object.keys(translationDictionary).length === 0) {
    return <span className={className}>{children}</span>;
  }

  // Function to replace matched terms with tooltips
  const processTextWithTooltips = (text: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Sort keys by length (longest first) to match longer phrases first
    const sortedKeys = Object.keys(translationDictionary).sort((a, b) => b.length - a.length);
    
    // Find all matches in the text
    const matches: Array<{ start: number; end: number; key: string; translation: string }> = [];
    
    sortedKeys.forEach(key => {
      const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        // Check if this match overlaps with existing matches
        const overlaps = matches.some(existing => 
          (match.index >= existing.start && match.index < existing.end) ||
          (match.index + match[0].length > existing.start && match.index + match[0].length <= existing.end)
        );
        
        if (!overlaps) {
          matches.push({
            start: match.index,
            end: match.index + match[0].length,
            key: match[0],
            translation: translationDictionary[key]
          });
        }
      }
    });
    
    // Sort matches by start position
    matches.sort((a, b) => a.start - b.start);
    
    // Build the elements array with tooltips
    matches.forEach((match, index) => {
      // Add text before this match
      if (match.start > lastIndex) {
        elements.push(text.slice(lastIndex, match.start));
      }
      
      // Add the tooltip for this match
      elements.push(
        <HoverCard key={`tooltip-${index}`} openDelay={200} closeDelay={100}>
          <HoverCardTrigger asChild>
            <span className="cursor-help underline decoration-dotted decoration-blue-400 hover:decoration-solid hover:bg-blue-50 rounded px-0.5 transition-all duration-200">
              {match.key}
            </span>
          </HoverCardTrigger>
          <HoverCardContent 
            side="top" 
            className="w-auto max-w-xs bg-slate-900 text-white border-slate-700 text-sm p-2 rounded-md shadow-lg"
          >
            <div className="font-medium text-blue-200 text-xs uppercase tracking-wide mb-1">
              Vietnamese
            </div>
            <div className="text-white">
              {match.translation}
            </div>
          </HoverCardContent>
        </HoverCard>
      );
      
      lastIndex = match.end;
    });
    
    // Add remaining text after last match
    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }
    
    return elements.length > 0 ? elements : [text];
  };

  return (
    <span className={className}>
      {processTextWithTooltips(children)}
    </span>
  );
};

export default TranslationTooltip;