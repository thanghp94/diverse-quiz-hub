import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, Users, Play, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import QuizView from '@/components/QuizView';

interface Assignment {
  id: string;
  assignmentname: string;
  category: string;
  description: string;
  type: string;
  status: string;
  noofquestion: number;
  expiring_date: string;
  subject: string;
  topicid: string;
  contentid: string;
  created_at: string;
}

interface Question {
  id: string;
  contentid: string;
  topicid: string;
  question: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  answer: string;
}

const AssignmentPage: React.FC = () => {
  const [selectedLiveClass, setSelectedLiveClass] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const [assignmentStudentTryId, setAssignmentStudentTryId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Current user check - in a real app this would come from auth context
  const currentUser = { id: 'GV0002', email: 'thanghuynh@meraki.edu.vn' };
  const isTeacher = currentUser.id === 'GV0002' || currentUser.email === 'thanghuynh@meraki.edu.vn';

  // Fetch all assignments
  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['/api/assignments'],
    queryFn: async () => {
      const response = await fetch('/api/assignments');
      if (!response.ok) throw new Error('Failed to fetch assignments');
      return response.json();
    }
  });

  // Fetch assignment student tries for live classes
  const { data: studentTries = [] } = useQuery({
    queryKey: ['/api/assignment-student-tries'],
    queryFn: async () => {
      const response = await fetch('/api/assignment-student-tries');
      if (!response.ok) throw new Error('Failed to fetch student tries');
      return response.json();
    }
  });

  // Fetch questions for quiz
  const { data: questions = [] } = useQuery({
    queryKey: ['/api/questions'],
    queryFn: async () => {
      const response = await fetch('/api/questions');
      if (!response.ok) throw new Error('Failed to fetch questions');
      return response.json();
    }
  });

  // Fetch content for assignments
  const { data: content = [] } = useQuery({
    queryKey: ['/api/content'],
    queryFn: async () => {
      const response = await fetch('/api/content');
      if (!response.ok) throw new Error('Failed to fetch content');
      return response.json();
    }
  });

  // Duplicate assignment mutation
  const duplicateAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const response = await fetch(`/api/assignments/${assignmentId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'live class' })
      });
      if (!response.ok) throw new Error('Failed to duplicate assignment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assignments'] });
      toast({
        title: "Live Class Created",
        description: "Assignment duplicated as live class."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create live class.",
        variant: "destructive"
      });
    }
  });

  // Create assignment student try mutation
  const createStudentTryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/assignment-student-tries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create student try');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/assignment-student-tries'] });
      setAssignmentStudentTryId(data.id.toString());
      toast({
        title: "Quiz Started",
        description: "You have joined the assignment quiz."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start quiz.",
        variant: "destructive"
      });
    }
  });

  // Filter assignments by type
  const homeworkAssignments = assignments.filter((a: Assignment) => a.type === 'homework');
  const mockTestAssignments = assignments.filter((a: Assignment) => a.type === 'mock test');
  
  // Filter live classes to show only those within 4 hours
  const now = new Date();
  const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  const liveClassAssignments = assignments.filter((a: Assignment) => {
    if (a.type !== 'live class') return false;
    const createdAt = new Date(a.created_at);
    return createdAt >= now && createdAt <= fourHoursFromNow;
  });

  // Get student progress for a live class
  const getStudentProgress = (assignmentId: string) => {
    const relatedTries = studentTries.filter((st: any) => st.assignmentid === assignmentId);
    return relatedTries.map((st: any, index: number) => ({
      student_id: st.hocsinh_id || `student_${index + 1}`,
      student_name: `Student ${index + 1}`,
      correct_answers: Math.floor(Math.random() * 10),
      wrong_answers: Math.floor(Math.random() * 5),
      unanswered: Math.floor(Math.random() * 3),
      total_questions: 15
    }));
  };

  const handleDuplicateAssignment = (assignmentId: string) => {
    duplicateAssignmentMutation.mutate(assignmentId);
  };

  const handleJoinLiveClass = (assignment: Assignment) => {
    // Get content IDs for this assignment
    const assignmentContent = content.filter((c: any) => c.topicid === assignment.topicid);
    const contentIds = assignmentContent.map((c: any) => c.id);
    
    // Get questions for this assignment
    const assignmentQuestions = questions.filter((q: Question) => 
      contentIds.includes(q.contentid) || q.topicid === assignment.topicid
    );
    
    // Randomize question order
    const shuffledQuestions = [...assignmentQuestions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffledQuestions.slice(0, assignment.noofquestion || 15);
    const selectedQuestionIds = selectedQuestions.map((q: Question) => q.id);
    
    // Create assignment student try
    const studentTryData = {
      assignmentid: assignment.id,
      hocsinh_id: currentUser.id,
      contentid: contentIds.join(','),
      questionids: JSON.stringify(selectedQuestionIds),
      start_time: new Date().toISOString(),
      typeoftaking: assignment.type === 'homework' ? 'homework' : 'live_class',
      number_of_question: assignment.noofquestion || selectedQuestionIds.length
    };

    // Set up quiz data for the proper QuizView component
    setSelectedAssignment(assignment);
    setQuestionIds(selectedQuestionIds);
    createStudentTryMutation.mutate(studentTryData);
    setShowQuiz(true);
  };

  const closeQuiz = () => {
    setShowQuiz(false);
    setSelectedAssignment(null);
    setQuestionIds([]);
    setAssignmentStudentTryId(null);
  };

  const CompactAssignmentTable = ({ assignments, title, showActions = false, isLiveClass = false }: { 
    assignments: Assignment[], 
    title: string, 
    showActions?: boolean,
    isLiveClass?: boolean
  }) => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title} ({assignments.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No {title.toLowerCase()}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                {!isLiveClass && <TableHead>Subject</TableHead>}
                <TableHead>Questions</TableHead>
                {!isLiveClass && <TableHead>Status</TableHead>}
                {showActions && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow 
                  key={assignment.id}
                  className={assignment.type === 'homework' ? 'cursor-pointer hover:bg-gray-50' : ''}
                  onClick={assignment.type === 'homework' ? () => handleJoinLiveClass(assignment) : undefined}
                >
                  <TableCell className="font-medium">{assignment.assignmentname}</TableCell>
                  {!isLiveClass && <TableCell>{assignment.subject}</TableCell>}
                  <TableCell>{assignment.noofquestion}</TableCell>
                  {!isLiveClass && <TableCell>{assignment.status}</TableCell>}
                  {showActions && (
                    <TableCell>
                      <div className="flex gap-1">
                        {isTeacher && assignment.type === 'homework' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateAssignment(assignment.id);
                            }}
                            disabled={duplicateAssignmentMutation.isPending}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        )}
                        {isTeacher && assignment.type === 'live class' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLiveClass(
                              selectedLiveClass === assignment.id ? null : assignment.id
                            )}
                          >
                            <Users className="w-3 h-3" />
                          </Button>
                        )}
                        {assignment.type === 'live class' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleJoinLiveClass(assignment)}
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {/* Student Progress for Live Classes */}
        {selectedLiveClass && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">Student Progress</h4>
            {getStudentProgress(selectedLiveClass).map((progress, index) => (
              <div key={index} className="flex items-center justify-between py-1">
                <span className="text-sm">{progress.student_name}</span>
                <div className="flex gap-1">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded"></div>
                    <span className="text-xs">{progress.correct_answers}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded"></div>
                    <span className="text-xs">{progress.wrong_answers}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-300 rounded"></div>
                    <span className="text-xs">{progress.unanswered}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loadingAssignments) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading assignments...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Assignment Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <CompactAssignmentTable 
              assignments={homeworkAssignments} 
              title="Homework" 
              showActions={true}
              isLiveClass={false}
            />
          </div>
          
          <div className="lg:col-span-3">
            <CompactAssignmentTable 
              assignments={liveClassAssignments} 
              title="Live Class" 
              showActions={true}
              isLiveClass={true}
            />
          </div>
          
          <div className="lg:col-span-3">
            <CompactAssignmentTable 
              assignments={mockTestAssignments} 
              title="Mock Test" 
              showActions={true}
              isLiveClass={false}
            />
          </div>
        </div>
      </div>

      {/* Assignment Quiz Dialog */}
      <Dialog open={showQuiz} onOpenChange={(open) => { if(!open) setShowQuiz(false); }}>
        <DialogContent className={cn("max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto", "max-w-6xl")}>
          {questionIds.length > 0 && assignmentStudentTryId && selectedAssignment ? (
            <QuizView 
              questionIds={questionIds} 
              onQuizFinish={closeQuiz}
              assignmentStudentTryId={assignmentStudentTryId}
              contentId={selectedAssignment.contentid}
            />
          ) : (
            <div className="p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Loading Quiz...</h3>
              <p className="text-gray-600">Preparing your assignment questions.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentPage;