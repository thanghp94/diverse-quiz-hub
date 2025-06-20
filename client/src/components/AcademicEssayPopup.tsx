import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Edit, FileText, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AcademicEssayPopupProps {
  isOpen: boolean;
  onClose: () => void;
  contentTitle?: string;
  studentId: string;
  contentId?: string;
}

interface OutlineData {
  hook: string;
  thesis: string;
  bodyParagraph1: string;
  bodyParagraph2: string;
  bodyParagraph3: string;
  conclusion: string;
}

interface EssayData {
  introduction: string;
  body1: string;
  body2: string;
  body3: string;
  conclusion: string;
}

export default function AcademicEssayPopup({ 
  isOpen, 
  onClose, 
  contentTitle, 
  studentId, 
  contentId 
}: AcademicEssayPopupProps) {
  const TOTAL_TIME = 15 * 60; // 15 minutes in seconds
  
  const [phase, setPhase] = useState<'outline' | 'writing'>('outline');
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [outlineData, setOutlineData] = useState<OutlineData>({
    hook: '',
    thesis: '',
    bodyParagraph1: '',
    bodyParagraph2: '',
    bodyParagraph3: '',
    conclusion: ''
  });

  const [essayData, setEssayData] = useState<EssayData>({
    introduction: '',
    body1: '',
    body2: '',
    body3: '',
    conclusion: ''
  });

  // Load saved data on open
  useEffect(() => {
    if (isOpen && studentId && contentId) {
      const storageKey = `academic_essay_${studentId}_${contentId}`;
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setPhase(parsed.phase || 'outline');
          setOutlineData(parsed.outlineData || {
            hook: '',
            thesis: '',
            bodyParagraph1: '',
            bodyParagraph2: '',
            bodyParagraph3: '',
            conclusion: ''
          });
          setEssayData(parsed.essayData || {
            introduction: '',
            body1: '',
            body2: '',
            body3: '',
            conclusion: ''
          });
          setTimeRemaining(parsed.timeRemaining || TOTAL_TIME);
          setIsTimerActive(false); // Always start paused when reopening
        } catch (error) {
          console.error('Failed to parse saved essay data:', error);
        }
      } else {
        // Reset to initial state for new content
        setPhase('outline');
        setOutlineData({
          hook: '',
          thesis: '',
          bodyParagraph1: '',
          bodyParagraph2: '',
          bodyParagraph3: '',
          conclusion: ''
        });
        setEssayData({
          introduction: '',
          body1: '',
          body2: '',
          body3: '',
          conclusion: ''
        });
        setTimeRemaining(TOTAL_TIME);
        setIsTimerActive(false);
      }
    }
  }, [isOpen, studentId, contentId]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeRemaining > 0 && phase === 'outline') {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            // Auto-proceed to writing when outline timer expires
            if (phase === 'outline') {
              setPhase('writing');
              toast({
                title: "Time's Up!",
                description: "Outline phase complete. Proceeding to writing phase.",
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining, phase]);

  // Start timer when outline phase begins
  useEffect(() => {
    if (phase === 'outline' && isOpen) {
      setIsTimerActive(true);
    }
  }, [phase, isOpen]);

  // Save data when popup closes
  useEffect(() => {
    if (!isOpen && studentId && contentId && (phase === 'writing' || Object.values(outlineData).some(val => val.trim()) || Object.values(essayData).some(val => val.trim()))) {
      const storageKey = `academic_essay_${studentId}_${contentId}`;
      const dataToSave = {
        phase,
        outlineData,
        essayData,
        timeRemaining,
        isTimerActive: false
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      saveToDatabase();
    }
  }, [isOpen, phase, outlineData, essayData, timeRemaining, studentId, contentId]);

  // Save data when browser closes
  useEffect(() => {
    const saveOnUnload = () => {
      if (studentId && contentId && (phase === 'writing' || Object.values(outlineData).some(val => val.trim()) || Object.values(essayData).some(val => val.trim()))) {
        const storageKey = `academic_essay_${studentId}_${contentId}`;
        const dataToSave = {
          phase,
          outlineData,
          essayData,
          timeRemaining,
          isTimerActive: false
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
        saveToDatabase();
      }
    };

    window.addEventListener('beforeunload', saveOnUnload);
    return () => window.removeEventListener('beforeunload', saveOnUnload);
  }, [phase, outlineData, essayData, timeRemaining, studentId, contentId]);

  const saveToDatabase = async () => {
    try {
      const response = await fetch('/api/writing-submissions/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          content_id: contentId,
          content_title: contentTitle,
          essay_data: essayData,
          outline_data: outlineData,
          phase,
          timer_remaining: timeRemaining,
          timer_active: isTimerActive
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save to database');
      }
    } catch (error) {
      console.error('Database save error:', error);
    }
  };

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const getTotalWordCount = () => {
    return getWordCount(essayData.introduction) + 
           getWordCount(essayData.body1) + 
           getWordCount(essayData.body2) + 
           getWordCount(essayData.body3) + 
           getWordCount(essayData.conclusion);
  };

  const proceedToWriting = () => {
    setPhase('writing');
    setIsTimerActive(false);
    
    // Update localStorage immediately and trigger storage event
    if (studentId && contentId) {
      const storageKey = `academic_essay_${studentId}_${contentId}`;
      const dataToSave = {
        phase: 'writing',
        outlineData,
        essayData,
        timeRemaining,
        isTimerActive: false
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      window.dispatchEvent(new Event('storage'));
    }
    
    toast({
      title: "Outline Complete",
      description: "You can now begin writing your essay.",
    });
  };

  const submitEssay = async () => {
    if (!studentId || !contentId) {
      toast({
        title: "Submission Failed",
        description: "Missing student or content information.",
        variant: "destructive",
      });
      return;
    }

    const totalWords = getTotalWordCount();
    if (totalWords < 100) {
      toast({
        title: "Submission Failed",
        description: "Essay must be at least 100 words to submit.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/writing-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          content_id: contentId,
          content_title: contentTitle,
          outline_data: outlineData,
          essay_data: essayData,
          time_spent: TOTAL_TIME - timeRemaining,
          word_count: totalWords,
          submitted_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Essay Submitted",
          description: `Your academic essay has been submitted successfully (${totalWords} words).`,
        });
        
        // Clear localStorage and trigger a page refresh to hide progress button
        const storageKey = `academic_essay_${studentId}_${contentId}`;
        localStorage.removeItem(storageKey);
        window.dispatchEvent(new Event('storage'));
        
        onClose();
        
        // Reset form
        setPhase('outline');
        setEssayData({ introduction: '', body1: '', body2: '', body3: '', conclusion: '' });
        setOutlineData({ hook: '', thesis: '', bodyParagraph1: '', bodyParagraph2: '', bodyParagraph3: '', conclusion: '' });
        setTimeRemaining(TOTAL_TIME);
        setIsTimerActive(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit essay');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "There was an error submitting your essay. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DialogTitle className="text-xl font-bold">Academic Essay</DialogTitle>
              <Badge 
                variant={phase === 'outline' ? 'default' : 'secondary'}
                className="px-6 py-1 text-sm whitespace-nowrap"
              >
                {phase === 'outline' ? 'Outline Phase (15 min)' : 'Writing Phase'}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {contentTitle && (
            <div className="mt-3 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700 uppercase tracking-wide">Essay Prompt</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800 leading-relaxed">{contentTitle}</p>
                </div>
              </div>
            </div>
          )}
        </DialogHeader>

        {phase === 'outline' && (
          <div className="space-y-6 p-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Essay Outline</h3>
              <p className="text-sm text-gray-600 mb-4">Plan your essay structure before writing</p>
              
              {/* Timer */}
              <div className="bg-orange-100 p-3 rounded-lg inline-block">
                <div className="text-2xl font-mono font-bold text-orange-700">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </div>
                <p className="text-sm text-orange-600">Time Remaining</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Introduction */}
              <div className="bg-blue-50 p-4 rounded-lg border">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-blue-800">Introduction</h4>
                  <div className="bg-blue-100 px-3 py-1 rounded-md text-xs text-blue-700">
                    Hook: Question, quote, or interesting fact • Thesis: Clear main argument or position
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Hook</Label>
                    <Textarea
                      placeholder="Attention-grabbing opening..."
                      value={outlineData.hook}
                      onChange={(e) => setOutlineData(prev => ({ ...prev, hook: e.target.value }))}
                      className="mt-1 min-h-[60px]"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Thesis (Main Idea)</Label>
                    <Textarea
                      placeholder="Your main argument..."
                      value={outlineData.thesis}
                      onChange={(e) => setOutlineData(prev => ({ ...prev, thesis: e.target.value }))}
                      className="mt-1 min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="bg-green-50 p-4 rounded-lg border">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-green-800">Body</h4>
                  <div className="bg-green-100 px-3 py-1 rounded-md text-xs text-green-700">
                    Topic sentence • Supporting evidence • Analysis and explanation • Transition to next point
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Body Paragraph 1</Label>
                    <Textarea
                      placeholder="First main point..."
                      value={outlineData.bodyParagraph1}
                      onChange={(e) => setOutlineData(prev => ({ ...prev, bodyParagraph1: e.target.value }))}
                      className="mt-1 min-h-[60px]"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Body Paragraph 2</Label>
                    <Textarea
                      placeholder="Second main point..."
                      value={outlineData.bodyParagraph2}
                      onChange={(e) => setOutlineData(prev => ({ ...prev, bodyParagraph2: e.target.value }))}
                      className="mt-1 min-h-[60px]"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Body Paragraph 3</Label>
                    <Textarea
                      placeholder="Third main point..."
                      value={outlineData.bodyParagraph3}
                      onChange={(e) => setOutlineData(prev => ({ ...prev, bodyParagraph3: e.target.value }))}
                      className="mt-1 min-h-[60px]"
                    />
                  </div>
                </div>
              </div>

              {/* Conclusion */}
              <div className="bg-purple-50 p-4 rounded-lg border">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-purple-800">Conclusion</h4>
                  <div className="bg-purple-100 px-3 py-1 rounded-md text-xs text-purple-700">
                    Restate thesis • Summarize main points • Final thought or call to action
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Summary and Final Thoughts</Label>
                  <Textarea
                    placeholder="Summarize and conclude..."
                    value={outlineData.conclusion}
                    onChange={(e) => setOutlineData(prev => ({ ...prev, conclusion: e.target.value }))}
                    className="mt-1 min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button onClick={proceedToWriting} className="bg-blue-600 hover:bg-blue-700">
                <Edit className="h-4 w-4 mr-2" />
                Proceed to Writing
              </Button>
            </div>
          </div>
        )}

        {phase === 'writing' && (
          <div className="space-y-6 p-4">
            {/* Writing Phase Header with Sections Navigation */}
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold">Writing Phase</h3>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Button variant="ghost" size="sm" className="text-xs bg-blue-100">
                    Introduction: {getWordCount(essayData.introduction)} words
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs bg-green-100">
                    Body 1: {getWordCount(essayData.body1)} words
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs bg-green-100">
                    Body 2: {getWordCount(essayData.body2)} words
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs bg-green-100">
                    Body 3: {getWordCount(essayData.body3)} words
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs bg-purple-100">
                    Conclusion: {getWordCount(essayData.conclusion)} words
                  </Button>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-semibold text-blue-600">
                  Total: {getTotalWordCount()} words
                </div>
                <p className="text-xs text-gray-600">Keep writing to develop your ideas</p>
              </div>
            </div>

            <div className="space-y-3">
                {/* Introduction */}
                <div className="bg-blue-50 p-4 rounded-lg border"></div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h4 className="font-semibold text-blue-800">Introduction</h4>
                        <div className="flex gap-2">
                          {outlineData.hook && (
                            <div className="bg-blue-100 px-3 py-2 rounded-md border-l-4 border-blue-400">
                              <span className="text-sm font-bold text-blue-800">Hook:</span>
                              <span className="text-sm text-blue-700 ml-2">{outlineData.hook}</span>
                            </div>
                          )}
                          {outlineData.thesis && (
                            <div className="bg-blue-100 px-3 py-2 rounded-md border-l-4 border-blue-400">
                              <span className="text-sm font-bold text-blue-800">Thesis:</span>
                              <span className="text-sm text-blue-700 ml-2">{outlineData.thesis}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-blue-600">
                      {getWordCount(essayData.introduction)} words
                    </span>
                  </div>
                  <Textarea
                    placeholder="Write your introduction with hook and thesis..."
                    value={essayData.introduction}
                    onChange={(e) => setEssayData(prev => ({ ...prev, introduction: e.target.value }))}
                    className="min-h-[150px] border-blue-200 w-full"
                  />
                </div>

                {/* Body Sections */}
                <div className="bg-green-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-green-800 mb-4">Body Paragraphs</h4>
                  
                  <div className="space-y-4">
                    {/* Body 1 */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-4">
                          <Label className="text-sm font-medium text-green-700">Body 1</Label>
                          {outlineData.bodyParagraph1 && (
                            <div className="bg-green-100 px-3 py-2 rounded-md border-l-4 border-green-400">
                              <p className="text-sm text-green-700">{outlineData.bodyParagraph1}</p>
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs">
                          {getWordCount(essayData.body1)} words
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Write your first body paragraph..."
                        value={essayData.body1}
                        onChange={(e) => setEssayData(prev => ({ ...prev, body1: e.target.value }))}
                        className="min-h-[120px] border-green-200 w-full"
                      />
                    </div>

                    {/* Body 2 */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-4">
                          <Label className="text-sm font-medium text-green-700">Body 2</Label>
                          {outlineData.bodyParagraph2 && (
                            <div className="bg-green-100 px-3 py-2 rounded-md border-l-4 border-green-400">
                              <p className="text-sm text-green-700">{outlineData.bodyParagraph2}</p>
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs">
                          {getWordCount(essayData.body2)} words
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Write your second body paragraph..."
                        value={essayData.body2}
                        onChange={(e) => setEssayData(prev => ({ ...prev, body2: e.target.value }))}
                        className="min-h-[120px] border-green-200 w-full"
                      />
                    </div>

                    {/* Body 3 */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-4">
                          <Label className="text-sm font-medium text-green-700">Body 3</Label>
                          {outlineData.bodyParagraph3 && (
                            <div className="bg-green-100 px-3 py-2 rounded-md border-l-4 border-green-400">
                              <p className="text-sm text-green-700">{outlineData.bodyParagraph3}</p>
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs">
                          {getWordCount(essayData.body3)} words
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Write your third body paragraph..."
                        value={essayData.body3}
                        onChange={(e) => setEssayData(prev => ({ ...prev, body3: e.target.value }))}
                        className="min-h-[120px] border-green-200 w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Conclusion */}
                <div className="bg-purple-50 p-4 rounded-lg border">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-4">
                      <h4 className="font-semibold text-purple-800">Conclusion</h4>
                      {outlineData.conclusion && (
                        <div className="bg-purple-100 px-3 py-2 rounded-md border-l-4 border-purple-400">
                          <p className="text-sm text-purple-700">{outlineData.conclusion}</p>
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-purple-600">
                      {getWordCount(essayData.conclusion)} words
                    </span>
                  </div>
                  <Textarea
                    placeholder="Write your conclusion with summary and final thoughts..."
                    value={essayData.conclusion}
                    onChange={(e) => setEssayData(prev => ({ ...prev, conclusion: e.target.value }))}
                    className="min-h-[150px] border-purple-200 w-full"
                  />
                </div>
              </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-lg font-semibold">Total: {getTotalWordCount()} words</span>
                  <p className="text-sm text-gray-600">Continue developing your essay</p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Save Draft
                  </Button>
                  <Button 
                    onClick={submitEssay}
                    disabled={isSubmitting || getTotalWordCount() < 100}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Essay'}
                    <FileText className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}