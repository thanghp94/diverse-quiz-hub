import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ContentGroupCards } from '@/components/ContentGroupCards';
import { ContentList } from '@/components/ContentList';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Content } from '@shared/schema';

export function ContentGroupsPage() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  
  const { data: groupContent, isLoading } = useQuery<Content[]>({
    queryKey: ['/api/content/group', selectedGroup],
    enabled: !!selectedGroup,
  });

  const handleGroupSelect = (groupName: string) => {
    setSelectedGroup(groupName);
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
  };

  if (selectedGroup) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToGroups}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Groups
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedGroup}
            </h1>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="text-lg">Loading content...</div>
            </div>
          ) : (
            <ContentList content={groupContent || []} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Content Groups
        </h1>
        <ContentGroupCards onGroupSelect={handleGroupSelect} />
      </div>
    </div>
  );
}