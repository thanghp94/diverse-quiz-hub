import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Image as ImageIcon, Download, Eye, Wand2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Content {
  id: string;
  title: string;
  short_blurb: string;
  imagelink?: string;
}

interface ImageStatus {
  contentId: string;
  hasImage: boolean;
  imageUrl: string | null;
  title: string;
}

export default function ImageGenerator() {
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: content = [], isLoading } = useQuery<Content[]>({
    queryKey: ['/api/content'],
  });

  const generateImageMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const response = await apiRequest(`/api/generate-image/${contentId}`, {
        method: 'POST',
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
    },
  });

  const batchGenerateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/generate-images-batch', {
        method: 'POST',
        body: JSON.stringify({ limit: 50 }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
    },
  });

  const contentWithoutImages = content.filter(item => !item.imagelink);
  const contentWithImages = content.filter(item => item.imagelink);

  const handleGenerateImage = async (contentId: string) => {
    try {
      await generateImageMutation.mutateAsync(contentId);
    } catch (error) {
      console.error('Failed to generate image:', error);
    }
  };

  const handleBatchGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      await batchGenerateMutation.mutateAsync();
      
      // Simulate progress updates
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 2000);

      // Final completion after some time
      setTimeout(() => {
        setGenerationProgress(100);
        setIsGenerating(false);
        clearInterval(interval);
      }, 20000);
      
    } catch (error) {
      console.error('Failed to start batch generation:', error);
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Image Generator</h1>
          <p className="text-muted-foreground">
            Generate educational images for content using AI
          </p>
        </div>
        <Button
          onClick={handleBatchGenerate}
          disabled={isGenerating || contentWithoutImages.length === 0}
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate All Missing Images
            </>
          )}
        </Button>
      </div>

      {isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle>Batch Generation Progress</CardTitle>
            <CardDescription>
              Generating images for {contentWithoutImages.length} content items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={generationProgress} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {generationProgress}% complete
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-red-500" />
              Content Without Images
              <Badge variant="destructive">{contentWithoutImages.length}</Badge>
            </CardTitle>
            <CardDescription>
              These content items need generated images
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {contentWithoutImages.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{item.title}</h3>
                  {item.short_blurb && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {item.short_blurb.substring(0, 100)}...
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleGenerateImage(item.id)}
                  disabled={generateImageMutation.isPending}
                >
                  {generateImageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  Generate
                </Button>
              </div>
            ))}
            {contentWithoutImages.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                All content items have images!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-green-500" />
              Content With Images
              <Badge variant="secondary">{contentWithImages.length}</Badge>
            </CardTitle>
            <CardDescription>
              These content items already have generated images
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {contentWithImages.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 border rounded-lg"
              >
                {item.imagelink && (
                  <img
                    src={item.imagelink}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{item.title}</h3>
                  {item.short_blurb && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {item.short_blurb.substring(0, 100)}...
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      Has Image
                    </Badge>
                    {item.imagelink && (
                      <a
                        href={item.imagelink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {contentWithImages.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No content with images yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{content.length}</div>
              <div className="text-sm text-muted-foreground">Total Content</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {contentWithImages.length}
              </div>
              <div className="text-sm text-muted-foreground">With Images</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {contentWithoutImages.length}
              </div>
              <div className="text-sm text-muted-foreground">Need Images</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Completion Rate</span>
              <span>
                {content.length > 0
                  ? Math.round((contentWithImages.length / content.length) * 100)
                  : 0}%
              </span>
            </div>
            <Progress
              value={
                content.length > 0
                  ? (contentWithImages.length / content.length) * 100
                  : 0
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}