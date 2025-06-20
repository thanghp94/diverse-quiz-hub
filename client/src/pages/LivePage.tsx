import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Users, Clock, BookOpen, Trophy, AlertCircle, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';

interface LiveQuizSession {
  id: string;
  title: string;
  topic: string;
  status: 'waiting' | 'active' | 'completed';
  participants: number;
  duration: number;
  startTime?: string;
  questions: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  difficulty: string;
}

interface ParticipantResponse {
  student_id: string;
  student_name: string;
  answer: number;
  time_taken: number;
  is_correct: boolean;
}

const LivePage: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<LiveQuizSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'active' | 'paused'>('idle');
  const [responses, setResponses] = useState<ParticipantResponse[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  // Fetch topics for quiz creation
  const { data: topics = [] } = useQuery({
    queryKey: ['/api/topics']
  });

  // Mock quiz sessions - in real app, fetch from API
  const sampleQuestions: QuizQuestion[] = [
    {
      id: '1',
      question: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correct_answer: 2,
      difficulty: 'easy'
    },
    {
      id: '2',
      question: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correct_answer: 1,
      difficulty: 'medium'
    }
  ];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionStatus === 'active' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleNextQuestion();
            return 30; // Reset for next question
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStatus, timeRemaining]);

  const startNewSession = () => {
    const newSession: LiveQuizSession = {
      id: `session_${Date.now()}`,
      title: 'Live Quiz Session',
      topic: selectedTopic || 'General Knowledge',
      status: 'active',
      participants: 0,
      duration: 30,
      startTime: new Date().toISOString(),
      questions: sampleQuestions
    };
    
    setCurrentSession(newSession);
    setSessionStatus('active');
    setCurrentQuestionIndex(0);
    setTimeRemaining(30);
    setResponses([]);
  };

  const pauseSession = () => {
    setSessionStatus('paused');
  };

  const resumeSession = () => {
    setSessionStatus('active');
  };

  const handleNextQuestion = () => {
    if (currentSession && currentQuestionIndex < currentSession.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeRemaining(30);
      setResponses([]);
    } else {
      endSession();
    }
  };

  const endSession = () => {
    setSessionStatus('idle');
    if (currentSession) {
      setCurrentSession({ ...currentSession, status: 'completed' });
    }
  };

  const getCurrentQuestion = () => {
    return currentSession?.questions[currentQuestionIndex];
  };

  const getResponseStats = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || responses.length === 0) {
      return { total: 0, correct: 0, percentage: 0 };
    }

    const correct = responses.filter(r => r.is_correct).length;
    return {
      total: responses.length,
      correct,
      percentage: Math.round((correct / responses.length) * 100)
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live Quiz Monitor</h1>
            <p className="text-gray-600 mt-1">Real-time quiz sessions and student responses</p>
          </div>
          
          {sessionStatus === 'idle' && (
            <div className="flex items-center gap-4">
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic: any) => (
                    <SelectItem key={topic.id} value={topic.topic}>
                      {topic.topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={startNewSession} className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                Start Quiz Session
              </Button>
            </div>
          )}
        </div>

        {/* Session Status */}
        {currentSession && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {currentSession.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Topic: {currentSession.topic}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={sessionStatus === 'active' ? 'default' : 'secondary'}>
                    {sessionStatus === 'active' ? 'Live' : sessionStatus === 'paused' ? 'Paused' : 'Ended'}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    {responses.length} participants
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    Question {currentQuestionIndex + 1} of {currentSession.questions.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className={`font-mono ${timeRemaining <= 10 ? 'text-red-600' : ''}`}>
                      {timeRemaining}s
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {sessionStatus === 'active' ? (
                    <Button variant="outline" onClick={pauseSession}>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  ) : sessionStatus === 'paused' ? (
                    <Button onClick={resumeSession} className="bg-green-600 hover:bg-green-700">
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </Button>
                  ) : null}
                  
                  {sessionStatus !== 'idle' && (
                    <Button variant="outline" onClick={handleNextQuestion}>
                      Next Question
                    </Button>
                  )}
                  
                  <Button variant="destructive" onClick={endSession}>
                    End Session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Question */}
        {currentSession && sessionStatus !== 'idle' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Question Display */}
            <Card>
              <CardHeader>
                <CardTitle>Current Question</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-lg font-medium">
                  {getCurrentQuestion()?.question}
                </div>
                
                <div className="space-y-2">
                  {getCurrentQuestion()?.options.map((option, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border ${
                        index === getCurrentQuestion()?.correct_answer 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                        <span>{option}</span>
                        {index === getCurrentQuestion()?.correct_answer && (
                          <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Response Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Response Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {getResponseStats().total}
                      </div>
                      <div className="text-sm text-gray-600">Total Responses</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {getResponseStats().correct}
                      </div>
                      <div className="text-sm text-gray-600">Correct</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {getResponseStats().percentage}%
                      </div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                    </div>
                  </div>

                  {responses.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      Waiting for student responses...
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {responses.map((response, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium">{response.student_name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={response.is_correct ? 'default' : 'destructive'}>
                              {String.fromCharCode(65 + response.answer)}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {response.time_taken}s
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Active Session */}
        {!currentSession && (
          <Card>
            <CardContent className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Quiz Session</h3>
              <p className="text-gray-600 mb-4">
                Start a new live quiz session to engage with your students in real-time.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LivePage;