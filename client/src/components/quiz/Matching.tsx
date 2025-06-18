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
}

const Matching = ({ question, onAnswer, studentTryId, onNextActivity, onGoBack }: MatchingProps) => {
  const [matches, setMatches] = useState<{[key: string]: string}>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [correctMatches, setCorrectMatches] = useState<{[key: string]: boolean}>({});
  const [startTime] = useState(new Date());
  const dragCounter = useRef(0);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

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
    const newCorrectMatches: {[key: string]: boolean} = {};

    correctPairs.forEach(pair => {
      const isMatchCorrect = matches[pair.left] === pair.right;
      newCorrectMatches[pair.left] = isMatchCorrect;
      if (isMatchCorrect) {
        correctCount++;
      }
    });

    const totalPairs = correctPairs.length;
    const score = Math.round((correctCount / totalPairs) * 100);
    const isCorrect = correctCount === totalPairs;

    // Set correctness state for visual feedback
    setCorrectMatches(newCorrectMatches);
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
                const isCorrect = isSubmitted && correctMatches[item];
                const isIncorrect = isSubmitted && correctMatches[item] === false;

                return (
                  <div
                    key={item}
                    draggable={!isUsed && !isSubmitted}
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
                    {isUsed && (
                      <div className={`absolute top-1 right-1 text-white rounded-full p-1 z-10 ${
                        isCorrect ? 'bg-green-500' : isIncorrect ? 'bg-red-500' : 'bg-green-500'
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
                              // Hide broken image and show fallback with clickable link
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `<div class="text-xs text-center p-2 bg-gray-100 rounded border">
                                  <div class="mb-1 font-medium">Image failed to load</div>
                                  <a href="${item}" target="_blank" class="text-blue-600 hover:text-blue-800 underline break-all">${item}</a>
                                </div>`;
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
                const isCorrect = isSubmitted && correctMatches[item];
                const isIncorrect = isSubmitted && correctMatches[item] === false;

                return (
                  <div
                    key={item}
                    draggable={!isUsed && !isSubmitted}
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
                    {isUsed && (
                      <div className={`absolute top-1 right-1 text-white rounded-full p-1 z-10 ${
                        isCorrect ? 'bg-green-500' : isIncorrect ? 'bg-red-500' : 'bg-green-500'
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
                    <span className="text-center text-xs font-medium leading-tight whitespace-pre-line text-center">{item}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Row - Descriptions/Drop Zones */}
          <div className="flex-1">
            <div 
              className={`grid gap-1 h-[140px] overflow-y-auto ${
                fixedRightItems.length <= 4 
                  ? 'grid-cols-4' 
                  : fixedRightItems.length <= 5 
                  ? 'grid-cols-5' 
                  : fixedRightItems.length <= 6 
                  ? 'grid-cols-6' 
                  : 'grid-cols-7'
              }`}
            >
              {fixedRightItems.map((item: string) => {
                const matchedLeft = Object.keys(matches).find(left => matches[left] === item);
                const isCorrect = isSubmitted && matchedLeft && correctMatches[matchedLeft];
                const isIncorrect = isSubmitted && matchedLeft && correctMatches[matchedLeft] === false;

                return (
                  <div
                    key={item}
                    onDragOver={!isSubmitted ? handleDragOver : undefined}
                    onDragEnter={!isSubmitted ? handleDragEnter : undefined}
                    onDragLeave={!isSubmitted ? handleDragLeave : undefined}
                    onDrop={!isSubmitted ? (e) => handleDrop(e, item) : undefined}
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
                                // Hide broken image and show fallback with clickable link
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div class="text-xs text-center p-2 bg-gray-100 rounded border">
                                    <div class="mb-1 font-medium">Image failed to load</div>
                                    <a href="${item}" target="_blank" class="text-blue-600 hover:text-blue-800 underline break-all">${item}</a>
                                  </div>`;
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
                      <div className="font-medium text-base leading-tight whitespace-pre-line text-left">{item}</div>
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
        <Button
          onClick={handleSubmit}
          disabled={!isComplete || isSubmitting || isSubmitted}
          className={`w-full text-lg py-3 font-bold rounded-xl shadow-lg transform transition-all duration-300 ${
            isSubmitted 
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-2 border-green-400" 
              : isComplete
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
          ) : isSubmitted ? (
            <span className="flex items-center gap-2">
              ✓ Completed
            </span>
          ) : (
            'Submit Answers'
          )}
        </Button>
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