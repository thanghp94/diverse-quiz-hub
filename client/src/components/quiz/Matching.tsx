
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question } from "@/features/quiz/types";
import { useToast } from "@/hooks/use-toast";

interface MatchingProps {
  question: Question;
  onAnswer: (answer: any, isCorrect: boolean) => void;
}

const Matching = ({ question, onAnswer }: MatchingProps) => {
  const [matches, setMatches] = useState<{[key: string]: string}>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(new Date());
  const dragCounter = useRef(0);
  const { toast } = useToast();

  const leftItems = question.pairs?.map(pair => pair.left) || [];
  const rightItems = question.pairs?.map(pair => pair.right) || [];
  // Keep right items in consistent order instead of shuffling
  const fixedRightItems = [...rightItems];
  
  // Check if any items are images
  const isImageItem = (item: string) => {
    return item.startsWith('http') && (item.includes('.jpg') || item.includes('.jpeg') || item.includes('.png') || item.includes('.webp') || item.includes('.gif'));
  };

  const handleDragStart = (e: React.DragEvent, item: string) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
  };

  const handleDragLeave = (e: React.DragEvent) => {
    dragCounter.current--;
  };

  const handleDrop = (e: React.DragEvent, rightItem: string) => {
    e.preventDefault();
    dragCounter.current = 0;
    
    if (draggedItem) {
      const newMatches = { ...matches };
      
      // Remove any existing match for this right item
      Object.keys(newMatches).forEach(key => {
        if (newMatches[key] === rightItem) {
          delete newMatches[key];
        }
      });
      
      newMatches[draggedItem] = rightItem;
      setMatches(newMatches);
    }
    setDraggedItem(null);
  };

  const saveStudentAttempt = async (studentMatches: {[key: string]: string}, score: number, isCorrect: boolean) => {
    try {
      const endTime = new Date();
      const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
      
      // Create correct matches object for reference
      const correctMatches: {[key: string]: string} = {};
      question.pairs?.forEach(pair => {
        correctMatches[pair.left] = pair.right;
      });

      const studentId = 'user-123-placeholder'; // Replace with actual auth.uid() when authentication is implemented
      
      // Note: Student attempt tracking will be implemented when authentication is added
      console.log('Student attempt completed:', {
        score,
        isCorrect,
        durationSeconds
      });
    } catch (error) {
      console.error('Error in saveStudentAttempt:', error);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    let correctCount = 0;
    const correctPairs = question.pairs || [];
    
    correctPairs.forEach(pair => {
      if (matches[pair.left] === pair.right) {
        correctCount++;
      }
    });
    
    const totalPairs = correctPairs.length;
    const score = Math.round((correctCount / totalPairs) * 100);
    const isCorrect = correctCount === totalPairs;
    
    // Save attempt to database
    await saveStudentAttempt(matches, score, isCorrect);
    
    // Call the original onAnswer callback
    onAnswer(matches, isCorrect);
    
    setIsSubmitting(false);
  };

  const isComplete = Object.keys(matches).length === leftItems.length;

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-white text-2xl">{question.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-lg">Drag from here:</h3>
            {leftItems.map(item => {
              const isUsed = Object.keys(matches).includes(item);
              return (
              <div
                key={item}
                draggable={!isUsed}
                onDragStart={(e) => handleDragStart(e, item)}
                className={`p-4 rounded-lg text-white transition-all border-2 flex items-center justify-center min-h-[120px] ${
                  isUsed 
                    ? 'bg-gray-500/30 border-gray-400/50 opacity-60 cursor-not-allowed' 
                    : 'bg-blue-500/30 border-blue-400/50 cursor-move hover:bg-blue-500/40 hover:border-blue-400/70'
                }`}
              >
                {isImageItem(item) ? (
                  <img 
                    src={item} 
                    alt="Matching item" 
                    className="max-w-full max-h-24 object-contain rounded"
                    onError={() => {
                      // Image failed to load - fallback text will show instead
                    }}
                  />
                ) : (
                  <span className="text-center">{item}</span>
                )}
                {isImageItem(item) && (
                  <span className="text-center text-sm hidden">Image failed to load</span>
                )}
              </div>
              );
            })}
          </div>
          
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-lg">Drop here:</h3>
            {fixedRightItems.map((item: string) => {
              const matchedLeft = Object.keys(matches).find(left => matches[left] === item);
              return (
                <div
                  key={item}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, item)}
                  className="p-4 bg-purple-500/20 rounded-lg text-white min-h-[120px] border-2 border-dashed border-purple-400/30 hover:border-purple-400/60 transition-colors"
                >
                  <div className="font-semibold mb-2">{item}</div>
                  {matchedLeft && (
                    <div className="flex items-center gap-3 text-sm text-blue-200 mt-2 p-2 bg-blue-500/20 rounded border-l-2 border-blue-400">
                      <span>Matched with:</span>
                      {isImageItem(matchedLeft) ? (
                        <div className="flex items-center gap-2">
                          <img 
                            src={matchedLeft} 
                            alt="Matched item" 
                            className="w-12 h-12 object-contain rounded border border-blue-300"
                            onError={() => {
                              // Image failed to load - fallback will show
                            }}
                          />
                          <span className="text-xs text-gray-300">Image</span>
                        </div>
                      ) : (
                        <span className="font-medium">{matchedLeft}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={!isComplete || isSubmitting}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 text-lg disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Matches'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default Matching;
