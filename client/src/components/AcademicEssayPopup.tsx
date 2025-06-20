import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Save, Clock, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  hook: string;
  mainIdea: string;
  body: string;
  conclusion: string;
}

interface TimerState {
  timeRemaining: number; // in seconds
  isActive: boolean;
}

export default function AcademicEssayPopup({ 
  isOpen, 
  onClose, 
  contentTitle, 
  studentId, 
  contentId 
}: AcademicEssayPopupProps) {
  const [phase, setPhase] = useState<'outline' | 'writing'>('outline');
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
    hook: '',
    mainIdea: '',
    body: '',
    conclusion: ''
  });
  const [timer, setTimer] = useState<TimerState>({ timeRemaining: 45 * 60, isActive: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<keyof EssayData>('introduction');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Load existing draft when opening
  useEffect(() => {
    if (isOpen && studentId && contentId) {
      loadExistingDraft();
    }
  }, [isOpen, studentId, contentId]);

  // Timer management
  useEffect(() => {
    if (timer.isActive && timer.timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1)
        }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer.isActive, timer.timeRemaining]);

  // Auto-save when user types or changes phase
  useEffect(() => {
    if (isOpen && (outlineData.hook || essayData.introduction)) {
      const saveTimeout = setTimeout(() => {
        saveDraft();
      }, 2000);
      return () => clearTimeout(saveTimeout);
    }
  }, [outlineData, essayData, phase, timer]);

  const loadExistingDraft = async () => {
    try {
      const response = await fetch(`/api/writing-submissions/draft/${studentId}/${contentId}`);
      if (response.ok) {
        const draft = await response.json();
        if (draft.outline_data) {
          setOutlineData(draft.outline_data);
        }
        if (draft.essay_data) {
          setEssayData(draft.essay_data);
          setPhase('writing');
        }
        if (draft.timer_remaining) {
          setTimer({
            timeRemaining: draft.timer_remaining,
            isActive: draft.phase === 'writing' && !draft.submitted_at
          });
        }
        if (draft.phase) {
          setPhase(draft.phase);
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const saveDraft = async () => {
    if (!studentId || !contentId) return;

    try {
      await fetch('/api/writing-submissions/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          content_id: contentId,
          content_title: contentTitle,
          outline_data: outlineData,
          essay_data: essayData,
          phase,
          timer_remaining: timer.timeRemaining,
          timer_active: timer.isActive
        })
      });
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleOutlineChange = (field: keyof OutlineData, value: string) => {
    setOutlineData(prev => ({ ...prev, [field]: value }));
  };

  const handleEssayChange = (field: keyof EssayData, value: string) => {
    setEssayData(prev => ({ ...prev, [field]: value }));
  };

  const proceedToWriting = () => {
    // Copy outline data to essay structure
    setEssayData(prev => ({
      ...prev,
      hook: outlineData.hook,
      mainIdea: outlineData.thesis,
      introduction: `${outlineData.hook}\n\n${outlineData.thesis}`,
      body: `${outlineData.bodyParagraph1}\n\n${outlineData.bodyParagraph2}\n\n${outlineData.bodyParagraph3}`,
      conclusion: outlineData.conclusion
    }));
    setPhase('writing');
    setTimer(prev => ({ ...prev, isActive: true }));
  };

  const submitEssay = async () => {
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
          time_spent: (45 * 60) - timer.timeRemaining,
          submitted_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        toast({
          title: "Essay Submitted",
          description: "Your academic essay has been submitted successfully.",
        });
        
        // Clear draft and reset form
        await fetch(`/api/writing-submissions/draft/${studentId}/${contentId}`, {
          method: 'DELETE'
        });
        
        resetForm();
        onClose();
      } else {
        throw new Error('Failed to submit essay');
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your essay. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
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
      hook: '',
      mainIdea: '',
      body: '',
      conclusion: ''
    });
    setPhase('outline');
    setTimer({ timeRemaining: 45 * 60, isActive: false });
    setActiveSection('introduction');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const handleClose = () => {
    setTimer(prev => ({ ...prev, isActive: false }));
    saveDraft();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">Academic Essay</DialogTitle>
              {contentTitle && (
                <p className="text-sm text-gray-600">Topic: {contentTitle}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={timer.timeRemaining < 300 ? "destructive" : "secondary"} className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(timer.timeRemaining)}
              </Badge>
              <Badge variant="outline">
                {phase === 'outline' ? 'Outline Phase' : 'Writing Phase'}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {phase === 'outline' ? (
          <div className="space-y-6 p-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Essay Outline</h3>
              <p className="text-sm text-gray-600">Plan your essay structure before writing</p>
            </div>

            {/* Visual Essay Structure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left side - Visual structure */}
              <div className="space-y-4">
                <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                  <h4 className="font-semibold text-blue-800 mb-2">Introduction</h4>
                  <div className="space-y-2">
                    <div className="bg-white p-2 rounded border">
                      <Label className="text-xs">Hook</Label>
                      <Input
                        placeholder="Attention-grabbing opening..."
                        value={outlineData.hook}
                        onChange={(e) => handleOutlineChange('hook', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <Label className="text-xs">Thesis (Main Idea)</Label>
                      <Textarea
                        placeholder="Your main argument..."
                        value={outlineData.thesis}
                        onChange={(e) => handleOutlineChange('thesis', e.target.value)}
                        className="mt-1 min-h-[60px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                  <h4 className="font-semibold text-green-800 mb-2">Body</h4>
                  <div className="space-y-2">
                    <div className="bg-white p-2 rounded border">
                      <Label className="text-xs">Body Paragraph 1</Label>
                      <Textarea
                        placeholder="First main point..."
                        value={outlineData.bodyParagraph1}
                        onChange={(e) => handleOutlineChange('bodyParagraph1', e.target.value)}
                        className="mt-1 min-h-[60px]"
                      />
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <Label className="text-xs">Body Paragraph 2</Label>
                      <Textarea
                        placeholder="Second main point..."
                        value={outlineData.bodyParagraph2}
                        onChange={(e) => handleOutlineChange('bodyParagraph2', e.target.value)}
                        className="mt-1 min-h-[60px]"
                      />
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <Label className="text-xs">Body Paragraph 3</Label>
                      <Textarea
                        placeholder="Third main point..."
                        value={outlineData.bodyParagraph3}
                        onChange={(e) => handleOutlineChange('bodyParagraph3', e.target.value)}
                        className="mt-1 min-h-[60px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                  <h4 className="font-semibold text-purple-800 mb-2">Conclusion</h4>
                  <div className="bg-white p-2 rounded border">
                    <Textarea
                      placeholder="Summarize and conclude..."
                      value={outlineData.conclusion}
                      onChange={(e) => handleOutlineChange('conclusion', e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              {/* Right side - Structure guide */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Essay Structure Guide</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <h5 className="font-medium text-blue-600">Introduction</h5>
                    <ul className="list-disc list-inside text-xs text-gray-600 ml-2">
                      <li>Hook: Question, quote, or interesting fact</li>
                      <li>Thesis: Clear main argument or position</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-green-600">Body Paragraphs</h5>
                    <ul className="list-disc list-inside text-xs text-gray-600 ml-2">
                      <li>Topic sentence</li>
                      <li>Supporting evidence</li>
                      <li>Analysis and explanation</li>
                      <li>Transition to next point</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-purple-600">Conclusion</h5>
                    <ul className="list-disc list-inside text-xs text-gray-600 ml-2">
                      <li>Restate thesis</li>
                      <li>Summarize main points</li>
                      <li>Final thought or call to action</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleClose}>
                Save Draft & Close
              </Button>
              <Button 
                onClick={proceedToWriting}
                disabled={!outlineData.hook || !outlineData.thesis}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Proceed to Writing
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Write Your Essay</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPhase('outline')}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Outline
                </Button>
              </div>
            </div>

            {/* Section tabs */}
            <div className="flex gap-2 mb-4">
              {[
                { key: 'introduction', label: 'Introduction', count: getWordCount(essayData.introduction) },
                { key: 'body', label: 'Body', count: getWordCount(essayData.body) },
                { key: 'conclusion', label: 'Conclusion', count: getWordCount(essayData.conclusion) }
              ].map((section) => (
                <Button
                  key={section.key}
                  variant={activeSection === section.key ? "default" : "outline"}
                  onClick={() => setActiveSection(section.key as keyof EssayData)}
                  className="flex flex-col items-center"
                  size="sm"
                >
                  <span>{section.label}</span>
                  <span className="text-xs">{section.count} words</span>
                </Button>
              ))}
            </div>

            {/* Reference outline */}
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <h5 className="font-medium text-sm mb-2">Your Outline Reference:</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div>
                  <strong>Hook:</strong> {outlineData.hook || 'Not provided'}
                </div>
                <div>
                  <strong>Main Idea:</strong> {outlineData.thesis || 'Not provided'}
                </div>
                <div>
                  <strong>Body Points:</strong> {[outlineData.bodyParagraph1, outlineData.bodyParagraph2, outlineData.bodyParagraph3].filter(Boolean).join('; ') || 'Not provided'}
                </div>
              </div>
            </div>

            {/* Writing area */}
            <div className="space-y-4">
              {activeSection === 'introduction' && (
                <div>
                  <Label className="text-base font-medium">Introduction</Label>
                  <Textarea
                    placeholder="Start with your hook and develop your thesis statement..."
                    value={essayData.introduction}
                    onChange={(e) => handleEssayChange('introduction', e.target.value)}
                    className="min-h-[200px] mt-2"
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {getWordCount(essayData.introduction)} words
                  </div>
                </div>
              )}

              {activeSection === 'body' && (
                <div>
                  <Label className="text-base font-medium">Body Paragraphs</Label>
                  <Textarea
                    placeholder="Develop your main arguments with evidence and analysis..."
                    value={essayData.body}
                    onChange={(e) => handleEssayChange('body', e.target.value)}
                    className="min-h-[300px] mt-2"
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {getWordCount(essayData.body)} words
                  </div>
                </div>
              )}

              {activeSection === 'conclusion' && (
                <div>
                  <Label className="text-base font-medium">Conclusion</Label>
                  <Textarea
                    placeholder="Summarize your arguments and provide a strong closing..."
                    value={essayData.conclusion}
                    onChange={(e) => handleEssayChange('conclusion', e.target.value)}
                    className="min-h-[150px] mt-2"
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {getWordCount(essayData.conclusion)} words
                  </div>
                </div>
              )}
            </div>

            {/* Total word count */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Word Count:</span>
                <span className="text-lg font-bold text-blue-600">
                  {getWordCount(essayData.introduction) + getWordCount(essayData.body) + getWordCount(essayData.conclusion)} words
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleClose}>
                Save Draft & Close
              </Button>
              <Button 
                onClick={submitEssay}
                disabled={isSubmitting || !essayData.introduction || !essayData.body || !essayData.conclusion}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Essay'}
                <FileText className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}