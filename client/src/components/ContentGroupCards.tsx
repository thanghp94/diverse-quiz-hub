import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ContentGroup {
  contentgroup: string;
  url: string;
  content_count: number;
}

interface ContentGroupCardsProps {
  onGroupSelect: (groupName: string) => void;
}

export function ContentGroupCards({ onGroupSelect }: ContentGroupCardsProps) {
  const { data: groups, isLoading, error } = useQuery<ContentGroup[]>({
    queryKey: ['/api/content-groups'],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        Failed to load content groups
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="text-center p-8 text-gray-600">
        No content groups available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {groups.map((group) => (
        <Card 
          key={group.contentgroup}
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          onClick={() => onGroupSelect(group.contentgroup)}
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              {group.contentgroup}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              {group.url || 'No description available'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {group.content_count} {group.content_count === 1 ? 'item' : 'items'}
              </span>
              <div className="text-blue-600 dark:text-blue-400 font-medium">
                View Content →
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}