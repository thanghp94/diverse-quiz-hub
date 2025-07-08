import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface NoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  studentId: string;
}

export const NoteDialog: React.FC<NoteDialogProps> = ({
  isOpen,
  onClose,
  contentId,
  studentId
}) => {
  const [noteText, setNoteText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing note
  const { data: existingRating } = useQuery<{ rating: string; personal_note?: string } | null>({
    queryKey: ['/api/content-ratings', studentId, contentId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/content-ratings/${studentId}/${contentId}`);
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error('Failed to fetch rating');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching rating:', error);
        return null;
      }
    },
  });

  // Update note text when data is loaded
  React.useEffect(() => {
    if (existingRating) {
      setNoteText(existingRating.personal_note || '');
    }
  }, [existingRating]);

  // Save note mutation
  const saveNoteMutation = useMutation({
    mutationFn: async (note: string) => {
      const response = await fetch(`/api/content-ratings/${studentId}/${contentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personal_note: note
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save note');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Note saved",
        description: "Your personal note has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/content-ratings', studentId, contentId] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSaveNote = () => {
    setIsLoading(true);
    saveNoteMutation.mutate(noteText);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-white border-gray-300">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-gray-900 text-lg font-medium">Personal Note</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:bg-gray-200 flex-shrink-0"
          >
            ✕
          </Button>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Add your personal notes about this content. Only you can see these notes.
            </p>

            <div>
              <Label htmlFor="note-text" className="text-gray-700">Your Note</Label>
              <Textarea
                id="note-text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write your personal note here..."
                className="min-h-[100px] mt-2"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <Button variant="outline" onClick={onClose} className="mb-2 sm:mb-0">
                Cancel
              </Button>
              <Button 
                onClick={handleSaveNote} 
                disabled={isLoading || saveNoteMutation.isPending}
              >
                {isLoading || saveNoteMutation.isPending ? "Saving..." : "Save Note"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
