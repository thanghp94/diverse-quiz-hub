import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Save, X, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Content } from '@shared/schema';

interface ContentEditorProps {
  content: Content;
  onContentUpdate?: (updatedContent: Content) => void;
}

export function ContentEditor({ content, onContentUpdate }: ContentEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    short_description: content.short_description || '',
    short_blurb: content.short_blurb || '',
    imageid: content.imageid || '',
    videoid: content.videoid || '',
    videoid2: content.videoid2 || '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (updates: typeof editData) => {
      const response = await fetch(`/api/content/${content.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update content');
      }

      return response.json();
    },
    onSuccess: (updatedContent) => {
      // Invalidate all content-related queries using the correct cache keys
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.invalidateQueries({ queryKey: ['bowl-challenge-topics'] });
      queryClient.invalidateQueries({ queryKey: ['all-topics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/content-groups'] });
      
      // Update the specific content item in cache
      queryClient.setQueryData(['content', content.id], updatedContent);
      
      // Update content in all topic-based caches
      queryClient.setQueriesData(
        { queryKey: ['content'] },
        (oldData: any) => {
          if (Array.isArray(oldData)) {
            return oldData.map(item => 
              item.id === content.id ? updatedContent : item
            );
          }
          return oldData;
        }
      );
      
      if (onContentUpdate) {
        onContentUpdate(updatedContent);
      }
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Content updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update content',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  const handleCancel = () => {
    setEditData({
      short_description: content.short_description || '',
      short_blurb: content.short_blurb || '',
      imageid: content.imageid || '',
      videoid: content.videoid || '',
      videoid2: content.videoid2 || '',
    });
    setIsEditing(false);
  };

  // Check if current user is GV0002
  const currentUser = localStorage.getItem('currentUser');
  const isAuthorized = currentUser ? JSON.parse(currentUser).id === 'GV0002' : false;

  if (!isAuthorized) {
    return null;
  }

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Content Editor (Admin: GV0002)
          </CardTitle>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-blue-600 border-blue-300 hover:bg-blue-100"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="text-green-600 border-green-300 hover:bg-green-100"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
                className="text-red-600 border-red-300 hover:bg-red-100"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Short Description */}
        <div className="space-y-2">
          <Label htmlFor="short_description">Short Description</Label>
          {isEditing ? (
            <Textarea
              id="short_description"
              value={editData.short_description}
              onChange={(e) => setEditData(prev => ({ ...prev, short_description: e.target.value }))}
              placeholder="Enter short description..."
              className="min-h-[100px]"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              {content.short_description || 'No description available'}
            </div>
          )}
        </div>

        {/* Short Blurb */}
        <div className="space-y-2">
          <Label htmlFor="short_blurb">Short Blurb</Label>
          {isEditing ? (
            <Textarea
              id="short_blurb"
              value={editData.short_blurb}
              onChange={(e) => setEditData(prev => ({ ...prev, short_blurb: e.target.value }))}
              placeholder="Enter short blurb..."
              className="min-h-[100px]"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              {content.short_blurb || 'No blurb available'}
            </div>
          )}
        </div>

        {/* Image ID */}
        <div className="space-y-2">
          <Label htmlFor="imageid">Image ID</Label>
          {isEditing ? (
            <Input
              id="imageid"
              value={editData.imageid}
              onChange={(e) => setEditData(prev => ({ ...prev, imageid: e.target.value }))}
              placeholder="Enter image ID..."
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              {content.imageid || 'No image ID'}
            </div>
          )}
        </div>

        {/* Video Links */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-red-600" />
            <Label className="text-base font-medium">Video Links</Label>
          </div>

          {/* Video 1 */}
          <div className="space-y-2">
            <Label htmlFor="videoid">Video 1 ID</Label>
            {isEditing ? (
              <Input
                id="videoid"
                value={editData.videoid}
                onChange={(e) => setEditData(prev => ({ ...prev, videoid: e.target.value }))}
                placeholder="Enter video 1 ID..."
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                {content.videoid || 'No video 1 ID'}
              </div>
            )}
          </div>

          {/* Video 2 */}
          <div className="space-y-2">
            <Label htmlFor="videoid2">Video 2 ID</Label>
            {isEditing ? (
              <Input
                id="videoid2"
                value={editData.videoid2}
                onChange={(e) => setEditData(prev => ({ ...prev, videoid2: e.target.value }))}
                placeholder="Enter video 2 ID..."
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                {content.videoid2 || 'No video 2 ID'}
              </div>
            )}
          </div>
        </div>

        {updateMutation.isPending && (
          <div className="text-center text-sm text-gray-600">
            Saving changes...
          </div>
        )}
      </CardContent>
    </Card>
  );
}