
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Loader2, Send, Bot, User, Lightbulb, BookOpen, Brain } from 'lucide-react';
import { useAITutor, useGenerateContent, useGenerateQuestions } from '@/hooks/useAI';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  currentContent?: any;
  studentId?: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ 
  currentContent, 
  studentId = 'default' 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const tutorMutation = useAITutor();
  const contentMutation = useGenerateContent();
  const questionsMutation = useGenerateQuestions();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type: 'user' | 'ai', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage('user', userMessage);

    try {
      const response = await tutorMutation.mutateAsync({
        studentQuestion: userMessage,
        contentContext: currentContent ? 
          `Current content: ${currentContent.title}\n${currentContent.short_blurb}` : 
          undefined,
        studentLevel: 'intermediate', // This could be dynamic based on student data
      });

      addMessage('ai', response);
    } catch (error) {
      addMessage('ai', 'I apologize, but I encountered an error. Please try asking your question again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const generateExplanation = async () => {
    if (!currentContent) return;

    try {
      const explanation = await contentMutation.mutateAsync({
        topic: currentContent.title || 'Current Topic',
        difficulty: 'medium',
        contentType: 'explanation',
        context: currentContent.information || currentContent.short_blurb,
      });

      addMessage('ai', `Here's an explanation of ${currentContent.title}:\n\n${explanation}`);
    } catch (error) {
      addMessage('ai', 'I had trouble generating an explanation. Please try again.');
    }
  };

  const generatePracticeQuestions = async () => {
    if (!currentContent) return;

    try {
      const questions = await questionsMutation.mutateAsync({
        content: currentContent.information || currentContent.short_blurb || '',
        difficulty: 'easy',
        questionType: 'multiple_choice',
        count: 3,
      });

      let questionsText = `Here are some practice questions about ${currentContent.title}:\n\n`;
      questions.forEach((q: any, index: number) => {
        questionsText += `**Question ${index + 1}:** ${q.question}\n`;
        if (q.options) {
          q.options.forEach((option: string, i: number) => {
            questionsText += `${String.fromCharCode(65 + i)}. ${option}\n`;
          });
        }
        questionsText += `\n*Answer: ${q.correct_answer}*\n`;
        if (q.explanation) {
          questionsText += `*Explanation: ${q.explanation}*\n\n`;
        }
      });

      addMessage('ai', questionsText);
    } catch (error) {
      addMessage('ai', 'I had trouble generating practice questions. Please try again.');
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <Bot className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[500px]">
      <Card className="h-full flex flex-col shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">AI Learning Assistant</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-4 pt-0">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <Bot className="w-12 h-12 mx-auto mb-2 text-blue-400" />
                      <p>Hello! I'm your AI learning assistant.</p>
                      <p className="text-sm">Ask me questions about your studies!</p>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.type === 'ai' && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                          {message.type === 'user' && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {tutorMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4" />
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  disabled={tutorMutation.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || tutorMutation.isPending}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="tools" className="flex-1 flex flex-col">
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Quick AI tools for the current content:
                </div>
                
                {currentContent && (
                  <div className="space-y-2">
                    <Badge variant="outline" className="mb-2">
                      {currentContent.title || 'Current Content'}
                    </Badge>
                    
                    <Button
                      onClick={generateExplanation}
                      disabled={contentMutation.isPending}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      {contentMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <BookOpen className="w-4 h-4 mr-2" />
                      )}
                      Generate Explanation
                    </Button>
                    
                    <Button
                      onClick={generatePracticeQuestions}
                      disabled={questionsMutation.isPending}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      {questionsMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Brain className="w-4 h-4 mr-2" />
                      )}
                      Generate Practice Questions
                    </Button>
                  </div>
                )}
                
                {!currentContent && (
                  <div className="text-center text-gray-500 py-8">
                    <Lightbulb className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Select content to see AI tools</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistant;
