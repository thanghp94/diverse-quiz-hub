import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question } from "@/features/quiz/types";
import { useToast } from "@/hooks/use-toast";

interface MatchingProps {
  question: Question;
  onAnswer: (answer: any, isCorrect: boolean) => void;
  studentTryId?: string;
  onNextActivity?: () => void;
  onGoBack?: () => void;
  currentQuizPhase?: 'picture-title' | 'title-description' | null;
  onNextPhase?: () => void;
}

const Matching = ({ question, onAnswer }: MatchingProps) => {
  const [matches, setMatches] = useState<{[key: string]: string}>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [correctMatches, setCorrectMatches] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  // Simple check if any items are images
  const isImageItem = (item: string) => {
    return item.startsWith('http') && (item.includes('.jpg') || item.includes('.jpeg') || item.includes('.png') || item.includes('.webp') || item.includes('.gif'));
  };

  // Get pairs and items - simplified without complex filtering
  const allPairs = question.pairs || [];
  const leftItems = allPairs.map(pair => pair.left);
  const rightItems = allPairs.map(pair => pair.right);
  
  // Shuffle right items for initial render only
  const getShuffledItems = () => {
    const items = [...rightItems];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  };
  
  const [shuffledRightItems] = useState(() => getShuffledItems());

  // Check if all items are matched
  const isComplete = leftItems.length > 0 && leftItems.every(item => matches[item]);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, item: string) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, leftItem: string) => {
    e.preventDefault();
    if (draggedItem) {
      const newMatches = { ...matches };
      
      // Remove any existing match for this dragged item
      Object.keys(newMatches).forEach(key => {
        if (newMatches[key] === draggedItem) {
          delete newMatches[key];
        }
      });
      
      // Set new match
      newMatches[leftItem] = draggedItem;
      setMatches(newMatches);
    }
    setDraggedItem(null);
  };

  // Handle click to match on mobile/touch devices
  const handleItemClick = (rightItem: string) => {
    if (!draggedItem) {
      setDraggedItem(rightItem);
    } else {
      // Find first unmatched left item or let user select
      const unmatchedLeftItem = leftItems.find(item => !matches[item]);
      if (unmatchedLeftItem) {
        const newMatches = { ...matches };
        
        // Remove any existing match for this dragged item
        Object.keys(newMatches).forEach(key => {
          if (newMatches[key] === draggedItem) {
            delete newMatches[key];
          }
        });
        
        newMatches[unmatchedLeftItem] = draggedItem;
        setMatches(newMatches);
      }
      setDraggedItem(null);
    }
  };

  // Handle left item click to match
  const handleLeftItemClick = (leftItem: string) => {
    if (draggedItem) {
      const newMatches = { ...matches };
      
      // Remove any existing match for this dragged item
      Object.keys(newMatches).forEach(key => {
        if (newMatches[key] === draggedItem) {
          delete newMatches[key];
        }
      });
      
      newMatches[leftItem] = draggedItem;
      setMatches(newMatches);
      setDraggedItem(null);
    }
  };

  // Submit answers
  const handleSubmit = async () => {
    if (isSubmitting || isSubmitted) return;
    
    setIsSubmitting(true);
    
    // Calculate correctness
    let correctCount = 0;
    const results: {[key: string]: boolean} = {};
    
    allPairs.forEach(pair => {
      const isCorrect = matches[pair.left] === pair.right;
      results[pair.left] = isCorrect;
      if (isCorrect) correctCount++;
    });
    
    setCorrectMatches(results);
    setShowResults(true);
    setIsSubmitted(true);
    
    const isAllCorrect = correctCount === allPairs.length;
    const score = allPairs.length > 0 ? Math.round((correctCount / allPairs.length) * 100) : 0;
    
    // Call onAnswer callback
    onAnswer(matches, isAllCorrect);
    
    // Show toast
    toast({
      title: isAllCorrect ? 'Perfect Match!' : 'Good Try!',
      description: `You got ${correctCount} out of ${allPairs.length} matches correct (${score}%)`,
      variant: isAllCorrect ? 'default' : 'destructive',
    });
    
    setIsSubmitting(false);
  };

  // Clear a specific match
  const clearMatch = (leftItem: string) => {
    const newMatches = { ...matches };
    delete newMatches[leftItem];
    setMatches(newMatches);
  };

  // Get text styling based on content length
  const getTextStyling = (text: string) => {
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 15) {
      return "text-xs leading-tight";
    } else if (wordCount > 8) {
      return "text-sm leading-snug";
    }
    return "text-sm";
  };

  return (
    <Card className="w-full max-w-6xl mx-auto bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold text-purple-800 mb-2">
          {question.question || "Match the items"}
        </CardTitle>
        <p className="text-purple-600 text-sm">
          Drag items from the right to match with items on the left, or click to select
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Items to match to */}
          <div className="space-y-3">
            <h3 className="font-semibold text-purple-700 mb-4 text-center">Items to Match</h3>
            {leftItems.map((leftItem, index) => (
              <div
                key={`left-${index}`}
                className={`
                  relative p-3 border-2 border-dashed rounded-lg min-h-[80px] flex items-center justify-center
                  transition-all duration-200 cursor-pointer
                  ${matches[leftItem] 
                    ? (showResults && correctMatches[leftItem] 
                        ? 'border-green-400 bg-green-50' 
                        : showResults && !correctMatches[leftItem]
                        ? 'border-red-400 bg-red-50'
                        : 'border-purple-400 bg-purple-50') 
                    : 'border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50'
                  }
                `}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, leftItem)}
                onClick={() => handleLeftItemClick(leftItem)}
              >
                {/* Left item content */}
                <div className="flex-1 text-center">
                  {isImageItem(leftItem) ? (
                    <img 
                      src={leftItem} 
                      alt="Match item" 
                      className="w-full h-16 object-cover rounded mx-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextSibling) nextSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    <span className={`text-gray-800 font-medium ${getTextStyling(leftItem)}`}>
                      {leftItem}
                    </span>
                  )}
                </div>
                
                {/* Matched item */}
                {matches[leftItem] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg">
                    <div className="text-center w-full px-2">
                      {isImageItem(matches[leftItem]) ? (
                        <img 
                          src={matches[leftItem]} 
                          alt="Matched item" 
                          className="w-full h-12 object-cover rounded mx-auto mb-1"
                        />
                      ) : (
                        <span className={`text-purple-800 font-medium ${getTextStyling(matches[leftItem])}`}>
                          {matches[leftItem]}
                        </span>
                      )}
                      {!isSubmitted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearMatch(leftItem);
                          }}
                          className="mt-1 h-6 px-2 text-xs text-red-600 hover:text-red-800"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Column - Available options */}
          <div className="space-y-3">
            <h3 className="font-semibold text-purple-700 mb-4 text-center">Available Options</h3>
            {shuffledRightItems.map((rightItem, index) => {
              const isUsed = Object.values(matches).includes(rightItem);
              const isSelected = draggedItem === rightItem;
              
              return (
                <div
                  key={`right-${index}`}
                  draggable={!isUsed}
                  onDragStart={(e) => !isUsed && handleDragStart(e, rightItem)}
                  onClick={() => !isUsed && handleItemClick(rightItem)}
                  className={`
                    p-3 border-2 rounded-lg min-h-[80px] flex items-center justify-center
                    transition-all duration-200 cursor-pointer
                    ${isUsed 
                      ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed' 
                      : isSelected
                      ? 'border-yellow-400 bg-yellow-50 shadow-md transform scale-105'
                      : 'border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 hover:shadow-sm'
                    }
                  `}
                >
                  {isImageItem(rightItem) ? (
                    <img 
                      src={rightItem} 
                      alt="Option" 
                      className="w-full h-16 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextSibling) nextSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    <span className={`text-gray-800 font-medium text-center ${getTextStyling(rightItem)}`}>
                      {rightItem}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit button */}
        {isComplete && !isSubmitted && (
          <div className="mt-6 text-center">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Answers'}
            </Button>
          </div>
        )}

        {isComplete && !isSubmitted && (
          <p className="text-sm text-purple-700 mt-3 text-center font-medium bg-purple-100 p-2 rounded-lg">
            All pairs matched! Click Submit to complete.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default Matching;