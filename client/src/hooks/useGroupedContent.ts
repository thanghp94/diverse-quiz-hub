import { useMemo } from 'react';
import { Content } from './useContent';

interface GroupedContentResult {
  groupCards: Content[];
  ungroupedContent: Content[];
  groupedContentMap: Map<string, Content[]>;
}

export const useGroupedContent = (content: Content[]): GroupedContentResult => {
  return useMemo(() => {
    const groupCards: Content[] = [];
    const ungroupedContent: Content[] = [];
    const groupedContentMap = new Map<string, Content[]>();

    // First pass: identify group cards and initialize their content arrays
    content.forEach(item => {
      if (item.prompt === "groupcard") {
        groupCards.push(item);
        groupedContentMap.set(item.id, []);
      } else if (!item.contentgroup || item.contentgroup.trim() === '') {
        ungroupedContent.push(item);
      }
    });

    // Second pass: organize content into their respective groups
    content.forEach(item => {
      if (item.prompt !== "groupcard" && item.contentgroup && item.contentgroup.trim() !== '') {
        const groupContent = groupedContentMap.get(item.contentgroup);
        if (groupContent) {
          groupContent.push(item);
        }
      }
    });

    // Sort group cards by order
    groupCards.sort((a, b) => {
      const aOrder = (a.order !== null && a.order !== undefined && a.order !== '') ? parseInt(a.order) : 999999;
      const bOrder = (b.order !== null && b.order !== undefined && b.order !== '') ? parseInt(b.order) : 999999;
      return aOrder - bOrder;
    });

    // Sort ungrouped content by order
    ungroupedContent.sort((a, b) => {
      const aOrder = (a.order !== null && a.order !== undefined && a.order !== '') ? parseInt(a.order) : 999999;
      const bOrder = (b.order !== null && b.order !== undefined && b.order !== '') ? parseInt(b.order) : 999999;
      return aOrder - bOrder;
    });

    // Sort grouped content within each group
    groupedContentMap.forEach((groupContent) => {
      groupContent.sort((a, b) => {
        const aOrder = (a.order !== null && a.order !== undefined && a.order !== '') ? parseInt(a.order) : 999999;
        const bOrder = (b.order !== null && b.order !== undefined && b.order !== '') ? parseInt(b.order) : 999999;
        return aOrder - bOrder;
      });
    });

    return { groupCards, ungroupedContent, groupedContentMap };
  }, [content]);
};
