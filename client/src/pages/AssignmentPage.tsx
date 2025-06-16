import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Users, Clock, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

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

interface AssignmentStudentTry {
  id: number;
  assignmentid: string;
  hocsinh_id: string;
  start_time: string;
  end_time: string;
  typeoftaking: string;
}

interface StudentTryProgress {
  student_id: string;
  student_name: string;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  total_questions: number;
}

const AssignmentPage: React.FC = () => {
  const [selectedLiveClass, setSelectedLiveClass] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all assignments
  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['/api/assignments'],
    queryFn: async () => {
      const response = await fetch('/api/assignments');
      if (!response.ok) throw new Error('Failed to fetch assignments');
      return response.json() as Assignment[];
    }
  });

  // Fetch assignment student tries for live classes
  const { data: studentTries = [] } = useQuery({
    queryKey: ['/api/assignment-student-tries'],
    queryFn: async () => {
      const response = await fetch('/api/assignment-student-tries');
      if (!response.ok) throw new Error('Failed to fetch student tries');
      return response.json() as AssignmentStudentTry[];
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
        description: "Assignment has been duplicated as a live class successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create live class. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Filter assignments by type
  const homeworkAssignments = assignments.filter(a => a.type === 'homework');
  const liveClassAssignments = assignments.filter(a => a.type === 'live class');
  const mockTestAssignments = assignments.filter(a => a.type === 'mock test');

  // Get student progress for a live class
  const getStudentProgress = (assignmentId: string): StudentTryProgress[] => {
    const relatedTries = studentTries.filter(st => st.assignmentid === assignmentId);
    
    // Mock data for demonstration - in real implementation, this would come from student_try table
    return relatedTries.map((_, index) => ({
      student_id: `student_${index + 1}`,
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

  const AssignmentCard: React.FC<{ assignment: Assignment; showDuplicate?: boolean }> = ({ 
    assignment, 
    showDuplicate = false 
  }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{assignment.assignmentname}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
          </div>
          {showDuplicate && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDuplicateAssignment(assignment.id)}
              disabled={duplicateAssignmentMutation.isPending}
            >
              <Copy className="w-4 h-4 mr-1" />
              Create Live Class
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary">{assignment.subject}</Badge>
          <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'}>
            {assignment.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>Due: {new Date(assignment.expiring_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{assignment.noofquestion} questions</span>
          </div>
        </div>

        {assignment.type === 'live class' && (
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedLiveClass(selectedLiveClass === assignment.id ? null : assignment.id)}
            >
              <Users className="w-4 h-4 mr-1" />
              {selectedLiveClass === assignment.id ? 'Hide' : 'Show'} Student Progress
            </Button>
            
            {selectedLiveClass === assignment.id && (
              <div className="mt-3 space-y-2">
                {getStudentProgress(assignment.id).map((progress, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{progress.student_name}</span>
                    <div className="flex gap-1">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-sm">{progress.correct_answers}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span className="text-sm">{progress.wrong_answers}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-300 rounded"></div>
                        <span className="text-sm">{progress.unanswered}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Homework Column */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              Homework ({homeworkAssignments.length})
            </h2>
            {homeworkAssignments.map(assignment => (
              <AssignmentCard 
                key={assignment.id} 
                assignment={assignment} 
                showDuplicate={true}
              />
            ))}
            {homeworkAssignments.length === 0 && (
              <p className="text-gray-500 text-center py-8">No homework assignments</p>
            )}
          </div>

          {/* Live Class Column */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              Live Class ({liveClassAssignments.length})
            </h2>
            {liveClassAssignments.map(assignment => (
              <AssignmentCard 
                key={assignment.id} 
                assignment={assignment}
              />
            ))}
            {liveClassAssignments.length === 0 && (
              <p className="text-gray-500 text-center py-8">No live classes</p>
            )}
          </div>

          {/* Mock Test Column */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              Mock Test ({mockTestAssignments.length})
            </h2>
            {mockTestAssignments.map(assignment => (
              <AssignmentCard 
                key={assignment.id} 
                assignment={assignment} 
                showDuplicate={true}
              />
            ))}
            {mockTestAssignments.length === 0 && (
              <p className="text-gray-500 text-center py-8">No mock tests</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentPage;