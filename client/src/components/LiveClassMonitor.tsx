import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Users, BookOpen, Star, Clock, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

interface StudentActivity {
  student_id: string;
  student_name: string;
  content_viewed: number;
  content_rated: number;
  quiz_accuracy: number;
  last_activity: string;
  activities: Array<{
    type: 'content_view' | 'content_rating' | 'quiz_attempt';
    content_id: string;
    content_title: string;
    timestamp: string;
    rating?: string;
    quiz_score?: number;
  }>;
}

interface LiveClassMonitorProps {
  startTime?: string;
}

export const LiveClassMonitor: React.FC<LiveClassMonitorProps> = ({ startTime }) => {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [monitorStartTime, setMonitorStartTime] = useState(startTime || new Date().toISOString());
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showActivityDetails, setShowActivityDetails] = useState<string | null>(null);

  // Fetch all students
  const { data: allStudents = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/users'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch student activities (only when monitoring is active)
  const { data: studentActivities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['/api/live-class-activities', selectedStudents, monitorStartTime],
    enabled: isMonitoring && selectedStudents.length > 0,
    refetchInterval: 5000, // Refresh every 5 seconds for live updates
  });

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === allStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(allStudents.map((s: Student) => s.id));
    }
  };

  const startMonitoring = () => {
    if (selectedStudents.length === 0) return;
    setMonitorStartTime(new Date().toISOString());
    setIsMonitoring(true);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'content_view': return 'bg-blue-100 text-blue-800';
      case 'content_rating': return 'bg-green-100 text-green-800';
      case 'quiz_attempt': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm:ss');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Live Class Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Student Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Select Students to Monitor:</label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={studentsLoading}
              >
                {selectedStudents.length === allStudents.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
              {studentsLoading ? (
                <div className="col-span-full text-center text-gray-500">Loading students...</div>
              ) : (
                allStudents.map((student: Student) => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={student.id}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => handleStudentToggle(student.id)}
                    />
                    <label
                      htmlFor={student.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {student.first_name} {student.last_name}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Monitor Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Monitor from: {format(new Date(monitorStartTime), 'MMM dd, HH:mm')}</span>
            </div>
            
            {!isMonitoring ? (
              <Button
                onClick={startMonitoring}
                disabled={selectedStudents.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                Start Monitoring ({selectedStudents.length} students)
              </Button>
            ) : (
              <Button
                onClick={stopMonitoring}
                variant="destructive"
              >
                Stop Monitoring
              </Button>
            )}
          </div>

          {isMonitoring && (
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700">
                Live monitoring active - Updates every 5 seconds
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Activities */}
      {isMonitoring && (
        <Card>
          <CardHeader>
            <CardTitle>Student Activity Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="text-center py-8">Loading activities...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Student</th>
                      <th className="text-left p-3">Content Viewed</th>
                      <th className="text-left p-3">Content Rated</th>
                      <th className="text-left p-3">Quiz Accuracy</th>
                      <th className="text-left p-3">Last Activity</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudents.map(studentId => {
                      const student = allStudents.find((s: Student) => s.id === studentId);
                      const activity = studentActivities.find((a: StudentActivity) => a.student_id === studentId);
                      
                      if (!student) return null;
                      
                      return (
                        <tr key={studentId} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="font-medium">{student.first_name} {student.last_name}</div>
                            <div className="text-sm text-gray-500">{student.id}</div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="bg-blue-50">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {activity?.content_viewed || 0}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="bg-green-50">
                              <Star className="w-3 h-3 mr-1" />
                              {activity?.content_rated || 0}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="bg-purple-50">
                              {activity?.quiz_accuracy ? `${activity.quiz_accuracy}%` : 'N/A'}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm">
                            {activity?.last_activity ? formatTime(activity.last_activity) : 'No activity'}
                          </td>
                          <td className="p-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowActivityDetails(
                                showActivityDetails === studentId ? null : studentId
                              )}
                              disabled={!activity?.activities?.length}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Activity Details Modal */}
      {showActivityDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Activity Details - {allStudents.find((s: Student) => s.id === showActivityDetails)?.first_name}</span>
              <Button variant="outline" size="sm" onClick={() => setShowActivityDetails(null)}>
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {studentActivities
                .find((a: StudentActivity) => a.student_id === showActivityDetails)
                ?.activities?.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getActivityColor(activity.type)}>
                        {activity.type.replace('_', ' ')}
                      </Badge>
                      <span className="font-medium">{activity.content_title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {activity.rating && (
                        <Badge variant="outline">Rating: {activity.rating}</Badge>
                      )}
                      {activity.quiz_score && (
                        <Badge variant="outline">Score: {activity.quiz_score}%</Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                )) || <div className="text-center text-gray-500">No activities yet</div>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveClassMonitor;