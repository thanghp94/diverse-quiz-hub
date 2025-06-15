
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MultipleChoice from "./quiz/MultipleChoice";
import Matching from "./quiz/Matching";
import FillInBlank from "./quiz/FillInBlank";
import Categorize from "./quiz/Categorize";
import QuizResults from "./quiz/QuizResults";
import { Play, Trophy, Star } from "lucide-react";

export interface Question {
  id: number;
  type: 'multiple-choice' | 'matching' | 'fill-blank' | 'categorize';
  question: string;
  options?: string[];
  correct?: string | number;
  pairs?: { left: string; right: string }[];
  blanks?: { text: string; answers: string[] }[];
  categories?: { name: string; items: string[] }[];
  items?: string[];
}

const sampleQuizzes = [
  {
    id: 1,
    title: "General Knowledge Quiz",
    description: "Test your knowledge across various topics",
    questions: [
      {
        id: 1,
        type: 'multiple-choice' as const,
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correct: 2
      },
      {
        id: 2,
        type: 'matching' as const,
        question: "Match the countries with their capitals:",
        pairs: [
          { left: "Italy", right: "Rome" },
          { left: "Japan", right: "Tokyo" },
          { left: "Australia", right: "Canberra" },
          { left: "Brazil", right: "Brasília" }
        ]
      },
      {
        id: 3,
        type: 'fill-blank' as const,
        question: "Fill in the blanks:",
        blanks: [
          { text: "The largest planet in our solar system is ___.", answers: ["Jupiter", "jupiter"] },
          { text: "Water boils at ___ degrees Celsius.", answers: ["100", "one hundred"] }
        ]
      },
      {
        id: 4,
        type: 'categorize' as const,
        question: "Categorize these animals:",
        categories: [
          { name: "Mammals", items: [] },
          { name: "Birds", items: [] },
          { name: "Fish", items: [] }
        ],
        items: ["Dog", "Eagle", "Shark", "Cat", "Parrot", "Salmon", "Lion", "Penguin"]
      }
    ]
  },
  {
    id: 2,
    title: "Science Quiz",
    description: "Challenge your scientific knowledge",
    questions: [
      {
        id: 1,
        type: 'multiple-choice' as const,
        question: "What is H2O commonly known as?",
        options: ["Oxygen", "Hydrogen", "Water", "Carbon Dioxide"],
        correct: 2
      },
      {
        id: 2,
        type: 'fill-blank' as const,
        question: "Complete the scientific facts:",
        blanks: [
          { text: "The speed of light is approximately ___ meters per second.", answers: ["299792458", "300000000"] },
          { text: "DNA stands for ___ acid.", answers: ["Deoxyribonucleic", "deoxyribonucleic"] }
        ]
      }
    ]
  }
];

const QuizApp = () => {
  const [currentView, setCurrentView] = useState<'home' | 'quiz' | 'results'>('home');
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [score, setScore] = useState(0);

  const startQuiz = (quiz: any) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setScore(0);
    setCurrentView('quiz');
  };

  const handleAnswer = (answer: any, isCorrect: boolean) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
    
    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentView('results');
    }
  };

  const resetQuiz = () => {
    setCurrentView('home');
    setSelectedQuiz(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setScore(0);
  };

  const renderQuestion = () => {
    if (!selectedQuiz) return null;
    
    const question = selectedQuiz.questions[currentQuestionIndex];
    
    switch (question.type) {
      case 'multiple-choice':
        return <MultipleChoice question={question} onAnswer={handleAnswer} />;
      case 'matching':
        return <Matching question={question} onAnswer={handleAnswer} />;
      case 'fill-blank':
        return <FillInBlank question={question} onAnswer={handleAnswer} />;
      case 'categorize':
        return <Categorize question={question} onAnswer={handleAnswer} />;
      default:
        return null;
    }
  };

  if (currentView === 'results') {
    return (
      <QuizResults 
        score={score} 
        total={selectedQuiz.questions.length} 
        onRestart={resetQuiz}
        quizTitle={selectedQuiz.title}
      />
    );
  }

  if (currentView === 'quiz') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2 bg-white/10 text-white border-white/30">
                Score: {score}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{selectedQuiz.title}</h1>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100}%` }}
              />
            </div>
          </div>
          {renderQuestion()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-4xl w-full">
        <div className="mb-8 animate-fade-in">
          <Trophy className="mx-auto mb-4 text-yellow-300" size={64} />
          <h1 className="text-5xl font-bold text-white mb-4">Quiz Master</h1>
          <p className="text-xl text-white/80 mb-8">
            Challenge yourself with different types of questions and test your knowledge!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {sampleQuizzes.map((quiz) => (
            <Card key={quiz.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl">{quiz.title}</CardTitle>
                  <Star className="text-yellow-300" size={24} />
                </div>
                <p className="text-white/80">{quiz.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-200">
                    {quiz.questions.length} Questions
                  </Badge>
                  <div className="flex gap-2">
                    {quiz.questions.map((q, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-white/30 text-white/70">
                        {q.type === 'multiple-choice' ? 'MC' : 
                         q.type === 'matching' ? 'Match' :
                         q.type === 'fill-blank' ? 'Fill' : 'Cat'}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={() => startQuiz(quiz)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <Play className="mr-2" size={16} />
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizApp;
