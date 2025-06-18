
import React from "react";
import ReactMarkdown from "react-markdown";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

/**
 * MarkdownRenderer
 * Wraps ReactMarkdown with Tailwind `prose` classes for beautiful formatting.
 * Supports translation tooltips when translationDictionary is provided.
 */
export const MarkdownRenderer = ({
  children,
  className = "",
  translationDictionary,
}: {
  children: string;
  className?: string;
  translationDictionary?: Record<string, string> | null;
}) => {
  // Function to add translation tooltips to text nodes
  const addTranslationTooltips = (text: string): React.ReactNode => {
    if (!translationDictionary || Object.keys(translationDictionary).length === 0) {
      return text;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Sort keys by length (longest first) to match longer phrases first
    const sortedKeys = Object.keys(translationDictionary).sort((a, b) => b.length - a.length);
    
    // Find all matches in the text
    const matches: Array<{ start: number; end: number; key: string; translation: string }> = [];
    
    sortedKeys.forEach(key => {
      const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      let match: RegExpExecArray | null;
      
      while ((match = regex.exec(text)) !== null) {
        // Check if this match overlaps with existing matches
        const overlaps = matches.some(existing => 
          (match!.index >= existing.start && match!.index < existing.end) ||
          (match!.index + match![0].length > existing.start && match!.index + match![0].length <= existing.end)
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
        <HoverCard key={`tooltip-${match.start}-${index}`} openDelay={200} closeDelay={100}>
          <HoverCardTrigger asChild>
            <span className="cursor-help underline decoration-dotted decoration-blue-400 hover:decoration-solid hover:bg-blue-50 rounded px-0.5 transition-all duration-200">
              {match.key}
            </span>
          </HoverCardTrigger>
          <HoverCardContent 
            side="top" 
            className="w-auto max-w-sm bg-white text-black border-gray-300 text-base p-4 rounded-lg shadow-xl z-50"
          >
            <div className="font-medium text-gray-600 text-sm uppercase tracking-wide mb-2">
              Vietnamese
            </div>
            <div className="text-black font-medium text-base">
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

  // Custom components that process text nodes for translation tooltips
  const components = React.useMemo(() => {
    if (!translationDictionary || Object.keys(translationDictionary).length === 0) {
      return {};
    }

    return {
      // Handle text nodes in various markdown elements
      p: ({ children, ...props }: any) => (
        <p {...props}>
          {React.Children.map(children, (child) => 
            typeof child === 'string' ? addTranslationTooltips(child) : child
          )}
        </p>
      ),
      li: ({ children, ...props }: any) => (
        <li {...props}>
          {React.Children.map(children, (child) => 
            typeof child === 'string' ? addTranslationTooltips(child) : child
          )}
        </li>
      ),
      h1: ({ children, ...props }: any) => (
        <h1 {...props}>
          {React.Children.map(children, (child) => 
            typeof child === 'string' ? addTranslationTooltips(child) : child
          )}
        </h1>
      ),
      h2: ({ children, ...props }: any) => (
        <h2 {...props}>
          {React.Children.map(children, (child) => 
            typeof child === 'string' ? addTranslationTooltips(child) : child
          )}
        </h2>
      ),
      h3: ({ children, ...props }: any) => (
        <h3 {...props}>
          {React.Children.map(children, (child) => 
            typeof child === 'string' ? addTranslationTooltips(child) : child
          )}
        </h3>
      ),
      strong: ({ children, ...props }: any) => (
        <strong {...props}>
          {React.Children.map(children, (child) => 
            typeof child === 'string' ? addTranslationTooltips(child) : child
          )}
        </strong>
      ),
      em: ({ children, ...props }: any) => (
        <em {...props}>
          {React.Children.map(children, (child) => 
            typeof child === 'string' ? addTranslationTooltips(child) : child
          )}
        </em>
      ),
      // Handle plain text nodes
      text: ({ children, ...props }: any) => (
        <span {...props}>
          {typeof children === 'string' ? addTranslationTooltips(children) : children}
        </span>
      )
    };
  }, [translationDictionary]);

  return (
    <div className={`prose prose-blue dark:prose-invert max-w-none whitespace-pre-wrap font-sans prose-li:my-0 prose-li:mb-0 prose-li:mt-0 prose-li:leading-tight prose-li:pl-0 prose-p:my-0 prose-p:mb-0 prose-p:leading-tight prose-ul:my-0 prose-ul:mb-0 prose-ul:pl-1 prose-ul:mt-0 prose-ul:space-y-0 prose-ol:my-0 prose-ol:mb-0 prose-ol:pl-1 prose-ol:mt-0 prose-ol:space-y-0 ${className}`} style={{ lineHeight: '1.1' }}>
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
