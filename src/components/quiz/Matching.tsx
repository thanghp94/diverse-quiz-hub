
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question } from "@/types/quiz";

interface MatchingProps {
  question: Question;
  onAnswer: (answer: any, isCorrect: boolean) => void;
}

const Matching = ({ question, onAnswer }: MatchingProps) => {
  const [matches, setMatches] = useState<{[key: string]: string}>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const dragCounter = useRef(0);

  const leftItems = question.pairs?.map(pair => pair.left) || [];
  const rightItems = question.pairs?.map(pair => pair.right) || [];
  const shuffledRightItems = [...rightItems].sort(() => Math.random() - 0.5);

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

  const handleSubmit = () => {
    let correctCount = 0;
    const correctPairs = question.pairs || [];
    
    correctPairs.forEach(pair => {
      if (matches[pair.left] === pair.right) {
        correctCount++;
      }
    });
    
    const isCorrect = correctCount === correctPairs.length;
    onAnswer(matches, isCorrect);
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
            {leftItems.map(item => (
              <div
                key={item}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                className="p-4 bg-blue-500/20 rounded-lg text-white cursor-move hover:bg-blue-500/30 transition-colors border-2 border-blue-400/30"
              >
                {item}
              </div>
            ))}
          </div>
          
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-lg">Drop here:</h3>
            {shuffledRightItems.map(item => {
              const matchedLeft = Object.keys(matches).find(left => matches[left] === item);
              return (
                <div
                  key={item}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, item)}
                  className="p-4 bg-purple-500/20 rounded-lg text-white min-h-[60px] border-2 border-dashed border-purple-400/30 hover:border-purple-400/60 transition-colors"
                >
                  <div className="font-semibold">{item}</div>
                  {matchedLeft && (
                    <div className="text-sm text-blue-200 mt-1">← {matchedLeft}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={!isComplete}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 text-lg"
        >
          Submit Matches
        </Button>
      </CardContent>
    </Card>
  );
};

export default Matching;
