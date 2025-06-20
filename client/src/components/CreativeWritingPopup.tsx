import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, FileText, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface CreativeWritingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  contentTitle?: string;
  studentId: string;
  contentId?: string;
  outlineData: {
    title: string;
    directions: string;
    setting: string;
    characters: string;
    first: string;
    andThen1: string;
    andThen2: string;
    andFinally: string;
  };
}

interface WritingData {
  title: string;
  story: string;
}

export default function CreativeWritingPopup({ 
  isOpen, 
  onClose, 
  contentTitle, 
  studentId, 
  contentId,
  outlineData 
}: CreativeWritingPopupProps) {
  const [writingData, setWritingData] = useState<WritingData>({
    title: outlineData.title || '',
    story: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleStoryChange = (value: string) => {
    setWritingData(prev => ({ ...prev, story: value }));
  };

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const submitStory = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/writing-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          prompt_id: contentId,
          title: writingData.title,
          full_essay: writingData.story,
          opening_paragraph: writingData.story.split('\n\n')[0] || writingData.story.substring(0, 500),
          body_paragraph_1: writingData.story.substring(500, 1000) || '',
          body_paragraph_2: writingData.story.substring(1000, 1500) || '',
          body_paragraph_3: writingData.story.substring(1500, 2000) || '',
          conclusion_paragraph: writingData.story.split('\n\n').pop() || writingData.story.substring(-500),
          word_count: getWordCount(writingData.story),
          status: 'submitted'
        })
      });

      if (response.ok) {
        toast({
          title: "Story Submitted",
          description: "Your creative writing has been submitted successfully.",
        });
        
        onClose();
        setWritingData({ title: '', story: '' });
      } else {
        throw new Error('Failed to submit story');
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">Creative Writing</DialogTitle>
              {contentTitle && (
                <p className="text-sm text-gray-600">Topic: {contentTitle}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Creative Story
              </Badge>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* Outline Summary */}
          <div className="bg-blue-50 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Your Outline Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Title:</strong> {outlineData.title || 'Not provided'}
              </div>
              <div>
                <strong>Setting:</strong> {outlineData.setting || 'Not provided'}
              </div>
              <div>
                <strong>Characters:</strong> {outlineData.characters || 'Not provided'}
              </div>
              <div>
                <strong>Directions:</strong> {outlineData.directions || 'Not provided'}
              </div>
            </div>
            
            <div className="mt-3">
              <strong>Story Structure:</strong>
              <div className="mt-2 space-y-1 text-sm">
                <div><strong>First:</strong> {outlineData.first || 'Not provided'}</div>
                <div><strong>And then:</strong> {outlineData.andThen1 || 'Not provided'}</div>
                <div><strong>And then:</strong> {outlineData.andThen2 || 'Not provided'}</div>
                <div><strong>And finally:</strong> {outlineData.andFinally || 'Not provided'}</div>
              </div>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <Label className="text-base font-medium">Story Title</Label>
            <input
              type="text"
              value={writingData.title}
              onChange={(e) => setWritingData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-3 border rounded-lg text-lg font-medium mt-2"
              placeholder="Enter your story title..."
            />
          </div>

          {/* Writing Area */}
          <div>
            <Label className="text-base font-medium">Write Your Story</Label>
            <p className="text-sm text-gray-600 mb-2">
              Use your outline to guide your creative writing. Tell your story with vivid details and engaging narrative.
            </p>
            <Textarea
              placeholder="Begin writing your story here... Use your outline as a guide to create an engaging narrative with vivid descriptions and character development."
              value={writingData.story}
              onChange={(e) => handleStoryChange(e.target.value)}
              className="min-h-[400px] mt-2 text-base leading-relaxed"
            />
            <div className="text-right text-sm text-gray-500 mt-2">
              {getWordCount(writingData.story)} words
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Save Draft & Close
            </Button>
            <Button 
              onClick={submitStory}
              disabled={isSubmitting || !writingData.title.trim() || !writingData.story.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Story'}
              <Edit className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}