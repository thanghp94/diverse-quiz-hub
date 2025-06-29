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
  const [matches, setMatches] = useState<{[key: string]: string}>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [correctMatches, setCorrectMatches] = useState<{[key: string]: boolean}>({});
  const [startTime] = useState(new Date());
  const dragCounter = useRef(0);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Check if any items are images
  const isImageItem = (item: string) => {
    return item.startsWith('http') && (item.includes('.jpg') || item.includes('.jpeg') || item.includes('.png') || item.includes('.webp') || item.includes('.gif'));
  };

  // Check if this is a sequential matching quiz - look for both types in question id
  const questionIdStr = String(question.id);
  const hasSequentialMatching = questionIdStr.includes('picture-title') || questionIdStr.includes('title-description');
  const isSequentialPictureTitle = questionIdStr.includes('picture-title');
  const isSequentialTitleDescription = questionIdStr.includes('title-description');

  // Determine the current phase based on question ID if not explicitly set
  const inferredPhase = isSequentialPictureTitle ? 'picture-title' : isSequentialTitleDescription ? 'title-description' : null;

  const effectiveMatchingType = currentQuizPhase || inferredPhase || question.type;

  // Reset state when phase changes for sequential matching or when question changes
  useEffect(() => {
    console.log('State reset triggered:', { 
      hasSequentialMatching, 
      currentQuizPhase, 
      questionId: question.id 
    });

    // Reset all state when:
    // 1. Phase changes in sequential matching
    // 2. Question changes (different question.id)
    // 3. Component first loads
    setMatches({});
    setShowResults(false);
    setIsSubmitted(false);
    setIsSubmitting(false);
    setCorrectMatches({});
    setDraggedItem(null);
    dragCounter.current = 0;

    console.log('State reset completed for phase:', currentQuizPhase);
  }, [currentQuizPhase, hasSequentialMatching, question.id]);

  // Filter pairs based on current phase
  const allPairs = question.pairs || [];
  const filteredPairs = hasSequentialMatching && currentQuizPhase 
    ? allPairs.filter(pair => {
        const isImageLeft = isImageItem(pair.left);
        const isImageRight = isImageItem(pair.right);

        if (currentQuizPhase === 'picture-title') {
          // Show pairs where either left or right is an image
          return isImageLeft || isImageRight;
        } else {
          // Show pairs where both are text (title-description)
          return !isImageLeft && !isImageRight;
        }
      })
    : allPairs;

  const leftItems = filteredPairs.map(pair => pair.left);
  const rightItems = filteredPairs.map(pair => pair.right);
  
  // Shuffle right items to randomize the options
  const [shuffledRightItems, setShuffledRightItems] = useState([...rightItems]);

  useEffect(() => {
    // Function to shuffle array
    const shuffleArray = (array: any[]) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };

    // Shuffle right items when component mounts or rightItems change
    setShuffledRightItems(shuffleArray(rightItems));
  }, [rightItems]);



  // Get text styling based on matching type and word count
  const getTextStyling = (text: string) => {
    const wordCount = text.split(/\s+/).length;

    if (effectiveMatchingType === 'title-description' || effectiveMatchingType?.includes('title-description')) {
      // For title-description: smaller text, left aligned for second row
      return {
        fontSize: wordCount > 30 ? 'text-xs' : wordCount > 20 ? 'text-sm' : 'text-base',
        alignment: 'text-left',
        weight: 'font-medium'
      };
    } else if (effectiveMatchingType === 'picture-title' || effectiveMatchingType?.includes('picture-title')) {
      // For picture-title: bigger text, center aligned
      return {
        fontSize: wordCount > 15 ? 'text-lg' : wordCount > 10 ? 'text-xl' : 'text-2xl',
        alignment: 'text-center',
        weight: 'font-bold'
      };
    }

    // Default styling
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

  const handleCheckResults = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    let correctCount = 0;
    const relevantPairs = filteredPairs; // Use filtered pairs for current phase
    const newCorrectMatches: {[key: string]: boolean} = {};

    // Debug logging
    console.log('Checking results for matches:', matches);
    console.log('Against relevant pairs:', relevantPairs);

    relevantPairs.forEach(pair => {
      const userMatch = matches[pair.left];
      const correctMatch = pair.right;
      // Normalize strings for comparison - trim whitespace and compare case-insensitively
      const normalizedUserMatch = userMatch?.trim().toLowerCase();
      const normalizedCorrectMatch = correctMatch?.trim().toLowerCase();
      const isMatchCorrect = normalizedUserMatch === normalizedCorrectMatch;

      console.log(`Checking: "${pair.left}" -> user: "${userMatch}" vs correct: "${correctMatch}" = ${isMatchCorrect}`);

      newCorrectMatches[pair.left] = isMatchCorrect;
      if (isMatchCorrect) {
        correctCount++;
      }
    });

    const totalPairs = relevantPairs.length;
    const score = Math.round((correctCount / totalPairs) * 100);
    const isCorrect = correctCount === totalPairs;

    console.log(`Final score: ${correctCount}/${totalPairs} = ${score}% (${isCorrect ? 'PASS' : 'FAIL'})`);

    // Set correctness state for visual feedback
    setCorrectMatches(newCorrectMatches);
    setShowResults(true);
    setIsSubmitted(true);

    // Save attempt to database
    await saveStudentAttempt(matches, score, isCorrect);

    // Call the original onAnswer callback
    onAnswer(matches, isCorrect);

    setIsSubmitting(false);
  };

  const isComplete = Object.keys(matches).length === leftItems.length;

  return (
    <Card className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 border-2 border-purple-200 shadow-2xl h-full flex flex-col">
      <CardHeader className="pb-3 pt-4 bg-white/80 backdrop-blur-sm border-b-2 border-purple-200">
        <div className="flex justify-start items-center mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200 hover:border-purple-400 font-medium"
            onClick={onGoBack || (() => setLocation('/topics'))}
          >
            ← Go Back
          </Button>
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          {question.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-2">
        <div className="flex flex-col gap-1 h-full">
          {/* Top Row - Images */}
          <div className="flex-1">
            <div 
              className={`grid gap-2 h-[160px] overflow-y-auto ${
                leftItems.length <= 4 
                  ? 'grid-cols-4' 
                  : leftItems.length <= 5 
                  ? 'grid-cols-5' 
                  : leftItems.length <= 6 
                  ? 'grid-cols-6' 
                  : 'grid-cols-7'
              }`}
            >
              {leftItems.filter(item => isImageItem(item)).map(item => {
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
                    {showResults && isUsed && (
                      <div className={`absolute top-1 right-1 text-white rounded-full p-1 z-10 ${
                        isCorrect ? 'bg-green-500' : isIncorrect ? 'bg-red-500' : 'bg-gray-500'
                      }`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          {isCorrect ? (
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          ) : isIncorrect ? (
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          )}
                        </svg>
                      </div>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="w-full h-full flex items-center justify-center">
                          <img 
                            src={item} 
                            alt="Matching item" 
                            className="max-w-full max-h-36 object-contain rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onError={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              img.style.display = 'none';
                              const parent = img.parentElement?.parentElement;
                              if (parent && !parent.querySelector('.fallback-content')) {
                                const fallbackDiv = document.createElement('div');
                                fallbackDiv.className = 'fallback-content text-xs text-center p-2 bg-gray-100 rounded border h-full flex flex-col justify-center';
                                fallbackDiv.innerHTML = `
                                  <div class="mb-1 font-medium text-gray-800">Image unavailable</div>
                                  <div class="text-gray-600 break-all text-[10px] leading-tight">${item.substring(0, 50)}...</div>
                                `;
                                parent.appendChild(fallbackDiv);
                              }
                            }}
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
                  </div>
                );
              })}
              {/* Text items from left side */}
              {leftItems.filter(item => !isImageItem(item)).map(item => {
                const isUsed = Object.keys(matches).includes(item);
                const isCorrect = showResults && correctMatches[item];
                const isIncorrect = showResults && correctMatches[item] === false;

                return (
                  <div
                    key={item}
                    draggable={!isUsed && !showResults}
                    onDragStart={(e) => handleDragStart(e, item)}
                    className={`relative p-1 rounded-lg text-black transition-all duration-300 border-2 flex items-center justify-center shadow-sm ${
                      isCorrect 
                        ? 'bg-green-100 border-green-400 cursor-not-allowed'
                        : isIncorrect
                        ? 'bg-red-100 border-red-400 cursor-not-allowed'
                        : isUsed 
                        ? 'bg-gray-200 border-gray-300 opacity-50 cursor-not-allowed' 
                        : 'bg-blue-50 border-blue-300 cursor-move hover:bg-blue-100 hover:border-blue-400'
                    }`}
                  >
                    {showResults && isUsed && (
                      <div className={`absolute top-1 right-1 text-white rounded-full p-1 z-10 ${
                        isCorrect ? 'bg-green-500' : isIncorrect ? 'bg-red-500' : 'bg-gray-500'
                      }`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          {isCorrect ? (
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          ) : isIncorrect ? (
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          )}
                        </svg>
                      </div>
                    )}
                    {(() => {
                      const styling = getTextStyling(item);
                      return (
                        <span className={`${styling.weight} ${styling.fontSize} leading-tight whitespace-pre-line ${styling.alignment}`}>
                          {item}
                        </span>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Row - Descriptions/Drop Zones */}
          <div className="flex-1">
            <div 
              className={`grid gap-1 h-[140px] overflow-y-auto ${
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
                              onError={(e) => {
                                const img = e.currentTarget as HTMLImageElement;
                                img.style.display = 'none';
                                const parent = img.parentElement?.parentElement;
                                if (parent && !parent.querySelector('.fallback-content')) {
                                  const fallbackDiv = document.createElement('div');
                                  fallbackDiv.className = 'fallback-content text-xs text-center p-2 bg-gray-100 rounded border h-full flex flex-col justify-center';
                                  fallbackDiv.innerHTML = `
                                    <div class="mb-1 font-medium text-gray-800">Image unavailable</div>
                                    <div class="text-gray-600 break-all text-[10px] leading-tight">${item.substring(0, 50)}...</div>
                                  `;
                                  parent.appendChild(fallbackDiv);
                                }
                              }}
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
                            <Dialog>
                              <DialogTrigger asChild>
                                <div className="w-8 h-8 flex items-center justify-center">
                                  <img 
                                    src={matchedLeft} 
                                    alt="Matched item" 
                                    className="w-8 h-8 object-contain rounded border border-blue-300 cursor-pointer hover:opacity-80 transition-opacity"
                                    onError={(e) => {
                                      // Hide broken image and show fallback with link
                                      e.currentTarget.style.display = 'none';
                                      const parent = e.currentTarget.parentElement;
                                      if (parent) {
                                        parent.innerHTML = `<a href="${matchedLeft}" target="_blank" class="w-8 h-8 text-xs bg-gray-100 rounded border flex items-center justify-center text-blue-600 hover:text-blue-800 underline" title="${matchedLeft}">IMG</a>`;
                                      }
                                    }}
                                  />
                                </div>
                              </DialogTrigger>
                              <DialogContent className="max-w-[98vw] max-h-[98vh] w-[98vw] h-[98vh] flex items-center justify-center p-2">
                                <img 
                                  src={matchedLeft} 
                                  alt="Full size matched item" 
                                  className="max-w-full max-h-full object-contain"
                                />
                              </DialogContent>
                            </Dialog>
                            <span className="text-sm text-gray-600 font-medium">Image</span>
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
          {/* Check Results Button - Always shown first when matches are complete but not yet submitted */}
          {!isSubmitted && (
            <Button
              onClick={handleCheckResults}
              disabled={!isComplete || isSubmitting}
              className={`w-full text-lg py-3 font-bold rounded-xl shadow-lg transform transition-all duration-300 ${
                isComplete
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-2 border-purple-400 hover:scale-105 hover:shadow-xl"
                  : "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-2 border-gray-300 cursor-not-allowed"
              }`}
              variant="default"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </span>
              ) : (
                'Check Results'
              )}
            </Button>
          )}

          {/* Next Phase/Activity Buttons - Only shown after results are checked */}
          {isSubmitted && (
            <>
              {hasSequentialMatching && currentQuizPhase === 'picture-title' ? (
                <Button
                  onClick={onNextPhase}
                  className="w-full text-lg py-3 font-bold rounded-xl shadow-lg transform transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-2 border-blue-400 hover:scale-105 hover:shadow-xl"
                  variant="default"
                >
                  <span className="flex items-center gap-2">
                    Continue to Title-Description Matching →
                  </span>
                </Button>
              ) : (
                <Button
                  onClick={onNextActivity}
                  className="w-full text-lg py-3 font-bold rounded-xl shadow-lg transform transition-all duration-300 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-2 border-green-400 hover:scale-105 hover:shadow-xl"
                  variant="default"
                >
                  <span className="flex items-center gap-2">
                    {hasSequentialMatching && currentQuizPhase === 'title-description' ? 'Next Activity' : 'Next'} →
                  </span>
                </Button>
              )}
            </>
          )}
        </div>

        {/* Phase indicator for sequential matching */}
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
            All pairs matched! Click Submit to complete.
          </p>
        )}
      </div>
    </Card>
  );
};

export default Matching;