import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle, XCircle } from 'lucide-react';

interface Question {
  id: string;
  topic: string;
  questiontext: string;
  A: string;
  B: string;
  C: string;
  D: string;
  answer: string;
  level: string;
}

interface QuizDialogProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  assignmentName: string;
  totalQuestions: number;
}

const QuizDialog: React.FC<QuizDialogProps> = ({ 
  isOpen, 
  onClose, 
  questions, 
  assignmentName,
  totalQuestions 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculate final score
      let correctAnswers = 0;
      questions.forEach((question, index) => {
        if (selectedAnswers[index] === question.answer) {
          correctAnswers++;
        }
      });
      setScore(correctAnswers);
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const getQuestionNumbers = () => {
    return Array.from({ length: Math.min(totalQuestions, 10) }, (_, i) => i + 1);
  };

  if (!currentQuestion && !showResults) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-white flex items-center gap-2">
            {showResults ? 'Quiz Results' : `Question ${currentQuestionIndex + 1}/${totalQuestions}`}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-400">
              Progress: {Math.round(progress)}% | {Math.round(progress) === 100 ? totalQuestions : currentQuestionIndex + 1}/{totalQuestions}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {showResults ? (
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                    score >= questions.length * 0.7 ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {score >= questions.length * 0.7 ? 
                      <CheckCircle className="h-8 w-8 text-white" /> : 
                      <XCircle className="h-8 w-8 text-white" />
                    }
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {score >= questions.length * 0.7 ? 'Great Job!' : 'Keep Practicing!'}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    You scored {score} out of {questions.length} questions correctly
                  </p>
                  <Badge className={`text-lg px-4 py-2 ${
                    score >= questions.length * 0.7 ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {Math.round((score / questions.length) * 100)}%
                  </Badge>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button onClick={resetQuiz} className="bg-blue-600 hover:bg-blue-700">
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300">
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Question Numbers */}
            <div className="flex gap-2 justify-center flex-wrap">
              {getQuestionNumbers().map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentQuestionIndex(num - 1)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                    num - 1 === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : selectedAnswers[num - 1]
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {num}
                </button>
              ))}
              {totalQuestions > 10 && (
                <span className="text-gray-400 text-sm self-center">...</span>
              )}
            </div>

            {/* Question */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6">
                  {currentQuestion.questiontext}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswerSelect(option)}
                      className={`p-4 text-left rounded-lg border transition-all ${
                        selectedAnswers[currentQuestionIndex] === option
                          ? 'bg-blue-600/20 border-blue-400 text-blue-200'
                          : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                          selectedAnswers[currentQuestionIndex] === option
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-600 text-gray-300'
                        }`}>
                          {option}
                        </div>
                        <div className="flex-1">
                          {currentQuestion[option as keyof Question] as string}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="border-gray-600 text-gray-300 disabled:opacity-50"
              >
                Previous
              </Button>
              
              <div className="text-sm text-gray-400">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </div>

              <Button
                onClick={handleNext}
                disabled={!selectedAnswers[currentQuestionIndex]}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuizDialog;