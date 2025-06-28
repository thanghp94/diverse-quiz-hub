import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Question } from "@/features/quiz/types";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface MatchingProps {
  question: Question;
  onAnswer: (answer: any, isCorrect: boolean) => void;
  studentTryId?: string;
  onNextActivity?: () => void;
  onGoBack?: () => void;
  currentQuizPhase?: 'picture-title' | 'title-description' | null;
  onNextPhase?: () => void;
}

const Matching = ({ question, onAnswer, studentTryId, onNextActivity, onGoBack, currentQuizPhase, onNextPhase }: MatchingProps) => {
  // Simple state - no complex objects or computed values in state
  const [matches, setMatches] = useState<{[key: string]: string}>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [correctMatches, setCorrectMatches] = useState<{[key: string]: boolean}>({});
  const [startTime] = useState(new Date());
  const [shuffledRightItems, setShuffledRightItems] = useState<string[]>([]);

  // Use refs to store values that shouldn't trigger re-renders
  const dragCounter = useRef(0);
  const hasInitialized = useRef(false);
  const lastQuestionId = useRef<string | undefined>(undefined);
  const lastPhase = useRef<string | null | undefined>(undefined);

  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Helper functions (these are stable and won't cause re-renders)
  const isImageItem = (item: string) => {
    return item.startsWith('http') && (item.includes('.jpg') || item.includes('.jpeg') || item.includes('.png') || item.includes('.webp') || item.includes('.gif'));
  };

  const shuffleArray = (array: string[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Check if this is a sequential matching quiz
  const questionIdStr = String(question.id);
  const hasSequentialMatching = questionIdStr.includes('picture-title') || questionIdStr.includes('title-description');
  const isSequentialPictureTitle = questionIdStr.includes('picture-title');
  const isSequentialTitleDescription = questionIdStr.includes('title-description');

  // Determine the current phase
  const inferredPhase = isSequentialPictureTitle ? 'picture-title' : isSequentialTitleDescription ? 'title-description' : null;
  const effectiveMatchingType = currentQuizPhase || inferredPhase || question.type;

  // Process pairs only when needed - keep this simple
  const allPairs = question.pairs || [];
  const filteredPairs = hasSequentialMatching && currentQuizPhase 
    ? allPairs.filter(pair => {
        const isImageLeft = isImageItem(pair.left);
        const isImageRight = isImageItem(pair.right);
        if (currentQuizPhase === 'picture-title') {
          return isImageLeft || isImageRight;
        } else {
          return !isImageLeft && !isImageRight;
        }
      })
    : allPairs;

  const leftItems = filteredPairs.map(pair => pair.left);
  const rightItems = filteredPairs.map(pair => pair.right);

  // Simple initialization effect - runs only once per question or phase change
  useEffect(() => {
    const currentQuestionId = question?.id;
    const currentPhase = currentQuizPhase;

    // Only reset if question or phase actually changed
    const questionChanged = lastQuestionId.current !== currentQuestionId;
    const phaseChanged = hasSequentialMatching && lastPhase.current !== currentPhase;

    if (!hasInitialized.current || questionChanged || phaseChanged) {
      console.log('Initializing matching component:', { questionChanged, phaseChanged, currentQuestionId, currentPhase });

      // Reset all state
      setMatches({});
      setDraggedItem(null);
      setIsSubmitting(false);
      setIsSubmitted(false);
      setShowResults(false);
      setCorrectMatches({});

      // Shuffle right items
      setShuffledRightItems(shuffleArray(rightItems));

      // Update refs
      lastQuestionId.current = currentQuestionId;
      lastPhase.current = currentPhase;
      hasInitialized.current = true;

      dragCounter.current = 0;
    }
  }, [question?.id, currentQuizPhase, hasSequentialMatching, rightItems.join(',')]); // Include rightItems serialized to detect changes

  const getTextStyling = (text: string) => {
    const wordCount = text.split(/\s+/).length;

    if (effectiveMatchingType === 'title-description' || effectiveMatchingType?.includes('title-description')) {
      return {
        fontSize: wordCount > 30 ? 'text-xs' : wordCount > 20 ? 'text-sm' : 'text-base',
        alignment: 'text-left',
        weight: 'font-medium'
      };
    } else if (effectiveMatchingType === 'picture-title' || effectiveMatchingType?.includes('picture-title')) {
      return {
        fontSize: wordCount > 15 ? 'text-lg' : wordCount > 10 ? 'text-xl' : 'text-2xl',
        alignment: 'text-center',
        weight: 'font-bold'
      };
    }

    return {
      fontSize: 'text-base',
      alignment: 'text-left',
      weight: 'font-medium'
    };
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

  const handleCheckResults = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    let correctCount = 0;
    const relevantPairs = filteredPairs;
    const newCorrectMatches: {[key: string]: boolean} = {};

    console.log('Checking results for pairs:', relevantPairs);
    console.log('User matches:', matches);

    relevantPairs.forEach(pair => {
      const userMatch = matches[pair.left];
      const correctMatch = pair.right;
      
      let isMatchCorrect = false;
      
      // For image comparisons, compare URLs directly
      if (isImageItem(userMatch) || isImageItem(correctMatch)) {
        isMatchCorrect = userMatch === correctMatch;
      } else {
        // For text comparisons, normalize and compare
        const normalizedUserMatch = userMatch?.trim().toLowerCase();
        const normalizedCorrectMatch = correctMatch?.trim().toLowerCase();
        isMatchCorrect = normalizedUserMatch === normalizedCorrectMatch;
      }

      console.log(`Pair: ${pair.left} -> ${pair.right}`);
      console.log(`User matched: ${userMatch}`);
      console.log(`Correct: ${isMatchCorrect}`);

      newCorrectMatches[pair.left] = isMatchCorrect;
      if (isMatchCorrect) {
        correctCount++;
      }
    });

    const totalPairs = relevantPairs.length;
    const score = Math.round((correctCount / totalPairs) * 100);
    const isCorrect = correctCount === totalPairs;

    console.log(`Score: ${correctCount}/${totalPairs} = ${score}%`);

    setCorrectMatches(newCorrectMatches);
    setShowResults(true);
    setIsSubmitted(true);

    onAnswer(matches, isCorrect);
    setIsSubmitting(false);
  };

  const isComplete = Object.keys(matches).length === leftItems.length;

  return (
    <Card className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 border-2 border-purple-200 shadow-2xl h-full flex flex-col">
      <CardHeader className="pb-3 pt-4 bg-white/80 backdrop-blur-sm border-b-2 border-purple-200">
        <div className="flex justify-between items-center mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200 hover:border-purple-400 font-medium"
            onClick={onGoBack || (() => setLocation('/topics'))}
          >
            ← Go Back
          </Button>
          
          {!isSubmitted && (
            <Button
              onClick={handleCheckResults}
              disabled={!isComplete || isSubmitting}
              size="sm"
              className={`text-sm py-2 px-4 font-bold rounded-xl shadow-lg transform transition-all duration-300 ${
                isComplete
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-2 border-purple-400 hover:scale-105 hover:shadow-xl"
                  : "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-2 border-gray-300 cursor-not-allowed"
              }`}
              variant="default"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Checking...
                </span>
              ) : (
                'Check Results'
              )}
            </Button>
          )}
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          {question.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-2">
        <div className="flex flex-col gap-1 h-full">
          {/* Top Row - Left Items */}
          <div className="flex-1">
            <div 
              className={`grid gap-2 h-[240px] overflow-y-auto ${
                leftItems.length <= 4 
                  ? 'grid-cols-4' 
                  : leftItems.length <= 5 
                  ? 'grid-cols-5' 
                  : leftItems.length <= 6 
                  ? 'grid-cols-6' 
                  : 'grid-cols-7'
              }`}
            >
              {leftItems.map(item => {
                const isUsed = Object.keys(matches).includes(item);
                const isCorrect = showResults && correctMatches[item];
                const isIncorrect = showResults && correctMatches[item] === false;

                return (
                  <div
                    key={item}
                    draggable={!isUsed && !showResults}
                    onDragStart={(e) => handleDragStart(e, item)}
                    className={`relative p-2 rounded-xl text-black transition-all duration-300 border-3 flex items-center justify-center shadow-lg transform hover:scale-105 ${
                      isCorrect 
                        ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-500 cursor-not-allowed'
                        : isIncorrect
                        ? 'bg-gradient-to-br from-red-100 to-red-200 border-red-500 cursor-not-allowed'
                        : isUsed 
                        ? 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400 opacity-50 cursor-not-allowed' 
                        : 'bg-gradient-to-br from-blue-100 to-purple-100 border-blue-400 cursor-move hover:from-blue-200 hover:to-purple-200 hover:border-purple-500 hover:shadow-xl'
                    }`}
                  >
                    {isImageItem(item) ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="w-full h-full flex items-center justify-center">
                            <img 
                              src={item} 
                              alt="Matching item" 
                              className="max-w-full max-h-36 object-contain rounded cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-[98vw] max-h-[98vh] w-[98vw] h-[98vh] flex items-center justify-center p-2">
                          <img 
                            src={item} 
                            alt="Full size matching item" 
                            className="max-w-full max-h-full object-contain"
                          />
                        </DialogContent>
                      </Dialog>
                    ) : (
                      (() => {
                        const styling = getTextStyling(item);
                        return (
                          <span className={`${styling.weight} ${styling.fontSize} leading-tight whitespace-pre-line ${styling.alignment}`}>
                            {item}
                          </span>
                        );
                      })()
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Row - Right Items (Drop Zones) */}
          <div className="flex-1">
            <div 
              className={`grid gap-1 h-[220px] overflow-y-auto ${
                shuffledRightItems.length <= 4 
                  ? 'grid-cols-4' 
                  : shuffledRightItems.length <= 5 
                  ? 'grid-cols-5' 
                  : shuffledRightItems.length <= 6 
                  ? 'grid-cols-6' 
                  : 'grid-cols-7'
              }`}
            >
              {shuffledRightItems.map((item: string) => {
                const matchedLeft = Object.keys(matches).find(left => matches[left] === item);
                const isCorrect = showResults && matchedLeft && correctMatches[matchedLeft];
                const isIncorrect = showResults && matchedLeft && correctMatches[matchedLeft] === false;

                return (
                  <div
                    key={item}
                    onDragOver={!showResults ? handleDragOver : undefined}
                    onDragEnter={!showResults ? handleDragEnter : undefined}
                    onDragLeave={!showResults ? handleDragLeave : undefined}
                    onDrop={!showResults ? (e) => handleDrop(e, item) : undefined}
                    className={`p-1 rounded-lg text-black border-2 border-dashed transition-all duration-300 ${
                      isCorrect
                        ? 'bg-green-100 border-green-400 shadow-lg'
                        : isIncorrect
                        ? 'bg-red-100 border-red-400 shadow-lg'
                        : matchedLeft 
                        ? 'bg-gray-100 border-gray-400 shadow-lg' 
                        : 'bg-purple-50 border-purple-300 hover:border-purple-400 hover:bg-purple-100'
                    }`}
                  >
                    {isImageItem(item) ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="w-full h-full flex items-center justify-center">
                            <img 
                              src={item} 
                              alt="Matching target" 
                              className="w-full max-h-28 object-contain rounded cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-[98vw] max-h-[98vh] w-[98vw] h-[98vh] flex items-center justify-center p-2">
                          <img 
                            src={item} 
                            alt="Full size matching target" 
                            className="max-w-full max-h-full object-contain"
                          />
                        </DialogContent>
                      </Dialog>
                    ) : (
                      (() => {
                        const styling = getTextStyling(item);
                        return (
                          <div className={`${styling.weight} ${styling.fontSize} leading-tight whitespace-pre-line ${styling.alignment}`}>
                            {item}
                          </div>
                        );
                      })()
                    )}
                    {matchedLeft && (
                      <div className={`flex items-center gap-1 text-xs mt-1 p-1 rounded border ${
                        isCorrect 
                          ? 'text-green-700 bg-green-200 border-green-300'
                          : isIncorrect
                          ? 'text-red-700 bg-red-200 border-red-300'
                          : 'text-blue-700 bg-blue-200 border-blue-300'
                      }`}>
                        <span className="font-medium">Matched with:</span>
                        {isImageItem(matchedLeft) ? (
                          <div className="flex items-center gap-1">
                            <img 
                              src={matchedLeft} 
                              alt="Matched item" 
                              className="w-6 h-6 object-cover rounded border"
                            />
                            <span className="font-semibold text-sm">Image</span>
                          </div>
                        ) : (
                          <span className="font-semibold text-sm">{matchedLeft}</span>
                        )}
                        {isSubmitted && (
                          <div className={`ml-auto text-sm font-bold ${
                            isCorrect ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
      <div className="p-6 border-t-2 border-purple-200 bg-white/80 backdrop-blur-sm">
        <div className="space-y-3">
          {isSubmitted && (
            <>
              {hasSequentialMatching && currentQuizPhase === 'picture-title' ? (
                <Button
                  onClick={onNextPhase}
                  className="w-full text-lg py-3 font-bold rounded-xl shadow-lg transform transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-2 border-blue-400 hover:scale-105 hover:shadow-xl"
                  variant="default"
                >
                  Continue to Title-Description Matching →
                </Button>
              ) : (
                <Button
                  onClick={onNextActivity}
                  className="w-full text-lg py-3 font-bold rounded-xl shadow-lg transform transition-all duration-300 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-2 border-green-400 hover:scale-105 hover:shadow-xl"
                  variant="default"
                >
                  Next Activity →
                </Button>
              )}
            </>
          )}
        </div>

        {hasSequentialMatching && (
          <div className="mt-3 text-center">
            <div className="text-sm font-medium text-purple-700">
              {currentQuizPhase === 'picture-title' ? 'Phase 1: Picture-Title Matching' : 'Phase 2: Title-Description Matching'}
            </div>
            <div className="flex justify-center mt-2 gap-2">
              <div className={`w-3 h-3 rounded-full ${currentQuizPhase === 'picture-title' ? 'bg-purple-600' : 'bg-purple-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${currentQuizPhase === 'title-description' ? 'bg-purple-600' : 'bg-purple-300'}`}></div>
            </div>
          </div>
        )}

        {isComplete && !isSubmitted && (
          <p className="text-sm text-purple-700 mt-3 text-center font-medium bg-purple-100 p-2 rounded-lg">
            All pairs matched! Click Check Results to complete.
          </p>
        )}
      </div>
    </Card>
  );
};

export default Matching;