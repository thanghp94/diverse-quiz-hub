import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Assignment {
  id: string;
  assignmentname: string;
  description: string;
  expiring_date: string;
  category: string;
  status: string;
  noofquestion: number;
}

interface StudentProgress {
  assignment_student_try: {
    id: number;
    assignmentid: string;
    hocsinh_id: string;
    start_time: string;
    end_time: string | null;
    typeoftaking: string;
  };
  student_tries: {
    id: string;
    question_id: string;
    answer_choice: string;
    quiz_result: string;
    score: number;
    currentindex: number;
  } | null;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
  } | null;
}

interface QuizProgress {
  id: string;
  question_id: string;
  answer_choice: string;
  quiz_result: string;
  score: number;
  time_start: string;
  time_end: string;
  currentindex: number;
}

export const LiveClassMonitor = () => {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showProgressDialog, setShowProgressDialog] = useState(false);

  // Fetch live assignments within 3 hours
  const { data: liveAssignments = [], isLoading: assignmentsLoading, refetch: refetchAssignments } = useQuery({
    queryKey: ['/api/live-assignments'],
    queryFn: () => fetch('/api/live-assignments').then(res => res.json()),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch student progress for selected assignment
  const { data: studentProgress = [], isLoading: progressLoading } = useQuery<StudentProgress[]>({
    queryKey: ['/api/assignments', selectedAssignment?.id, 'progress'],
    queryFn: () => fetch(`/api/assignments/${selectedAssignment?.id}/progress`).then(res => res.json()),
    enabled: !!selectedAssignment,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const getVietnamTime = () => {
    const now = new Date();
    return new Date(now.getTime() + (7 * 60 * 60 * 1000));
  };

  const formatTimeRemaining = (expiringDate: string) => {
    const vietnamTime = getVietnamTime();
    const expiry = new Date(expiringDate);
    const timeDiff = expiry.getTime() - vietnamTime.getTime();
    
    if (timeDiff <= 0) return 'Expired';
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleAssignmentClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowProgressDialog(true);
  };

  const calculateProgress = (progress: StudentProgress[]) => {
    const activeStudents = progress.filter(p => p.assignment_student_try.end_time === null).length;
    const completedStudents = progress.filter(p => p.assignment_student_try.end_time !== null).length;
    return { activeStudents, completedStudents, totalStudents: progress.length };
  };

  if (assignmentsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Live Class Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading live assignments...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Live Class Monitor
            <Badge variant="outline">{liveAssignments?.length || 0} Active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!liveAssignments || liveAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No live assignments within the last 3 hours</p>
              <p className="text-sm mt-1">Vietnam Time: {getVietnamTime().toLocaleString()}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {liveAssignments.map((assignment: Assignment) => (
                <Card 
                  key={assignment.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleAssignmentClick(assignment)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{assignment.assignmentname}</h3>
                        <p className="text-gray-600 text-sm mt-1">{assignment.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge className={getStatusColor(assignment.status)}>
                            {assignment.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {assignment.noofquestion} questions
                          </span>
                          <span className="text-sm text-gray-500">
                            Category: {assignment.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-blue-600">
                          {formatTimeRemaining(assignment.expiring_date)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Expires: {new Date(assignment.expiring_date).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Progress Dialog */}
      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Student Progress: {selectedAssignment?.assignmentname}
            </DialogTitle>
          </DialogHeader>
          
          {progressLoading ? (
            <div className="text-center py-8">Loading student progress...</div>
          ) : studentProgress && studentProgress.length > 0 ? (
            <div className="space-y-4">
              {/* Progress Summary */}
              <Card>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {calculateProgress(studentProgress).activeStudents}
                      </div>
                      <div className="text-sm text-gray-600">Active Students</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {calculateProgress(studentProgress).completedStudents}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-600">
                        {calculateProgress(studentProgress).totalStudents}
                      </div>
                      <div className="text-sm text-gray-600">Total Students</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Student Progress */}
              <div className="space-y-3">
                {studentProgress.map((progress: StudentProgress, index: number) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600">
                              {progress.user?.first_name?.[0] || progress.assignment_student_try.hocsinh_id[0]}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {progress.user?.full_name || progress.user?.first_name + ' ' + progress.user?.last_name || progress.assignment_student_try.hocsinh_id}
                            </h4>
                            <p className="text-sm text-gray-600">{progress.user?.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {progress.student_tries && (
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                Question {progress.student_tries.currentindex || 1}
                              </div>
                              <div className="text-xs text-gray-500">
                                Score: {progress.student_tries.score || 0}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            {progress.assignment_student_try.end_time ? (
                              <Badge className="bg-blue-500">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            ) : (
                              <Badge className="bg-green-500">
                                <Clock className="h-3 w-3 mr-1" />
                                In Progress
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-500">
                        Started: {new Date(progress.assignment_student_try.start_time).toLocaleString()}
                        {progress.assignment_student_try.end_time && (
                          <span className="ml-4">
                            Ended: {new Date(progress.assignment_student_try.end_time).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No student progress data available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};