import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Users, BookOpen, Star, Clock, Search, Play, Pause } from 'lucide-react';
import { format } from 'date-fns';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
}

interface StudentActivity {
  student_id: string;
  student_name: string;
  content_viewed: number;
  content_rated: number;
  quiz_attempts: number;
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
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all students
  const { data: allStudents = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/users'],
    refetchInterval: 30000,
    staleTime: 5 * 60 * 1000,
  });

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return allStudents as Student[];
    const searchLower = searchTerm.toLowerCase();
    return (allStudents as Student[]).filter((student: Student) => {
      const fullName = student.full_name || `${student.first_name} ${student.last_name}`;
      return fullName.toLowerCase().includes(searchLower) || 
             student.id.toLowerCase().includes(searchLower);
    });
  }, [allStudents, searchTerm]);

  // Fetch student activities (only when monitoring is active)
  const { data: studentActivities = [], isLoading: activitiesLoading } = useQuery<StudentActivity[]>({
    queryKey: ['/api/live-class-activities', selectedStudents, monitorStartTime],
    enabled: isMonitoring && selectedStudents.length > 0,
    refetchInterval: 10000,
    staleTime: 15000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((s: Student) => s.id));
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
    if (timestamp && timestamp.match(/^[0-9]{2}:[0-9]{2}:[0-9]{2}$/)) {
      return timestamp;
    }

    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return timestamp;
      }
      return format(date, 'HH:mm:ss');
    } catch (error) {
      return timestamp || 'Invalid time';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Streamlined Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl">Live Class Monitor</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Track student activity in real-time</p>
              </div>
            </div>
            {isMonitoring && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live monitoring
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Student Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Students</label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="max-h-32 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                <div className="flex items-center space-x-2 mb-2 pb-2 border-b">
                  <Checkbox
                    id="select-all"
                    checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                    onCheckedChange={handleSelectAll}
                    disabled={studentsLoading}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                    Select All ({filteredStudents.length})
                  </label>
                </div>
                {studentsLoading ? (
                  <div className="text-center text-gray-500 py-2">Loading...</div>
                ) : (
                  <div className="grid grid-cols-1 gap-1">
                    {filteredStudents.map((student: Student) => (
                      <div key={student.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={student.id}
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => handleStudentToggle(student.id)}
                        />
                        <label
                          htmlFor={student.id}
                          className="text-sm cursor-pointer flex-1 truncate"
                          title={student.full_name || `${student.first_name} ${student.last_name}`}
                        >
                          {student.full_name || `${student.first_name} ${student.last_name}`}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedStudents.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">{selectedStudents.length} students selected</p>
              )}
            </div>

            {/* Monitor Controls */}
            <div className="space-y-3">
              <label className="text-sm font-medium block">Monitor Control</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  Started: {format(new Date(monitorStartTime), 'MMM dd, HH:mm')}
                </div>

                {!isMonitoring ? (
                  <Button
                    onClick={startMonitoring}
                    disabled={selectedStudents.length === 0}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Monitoring ({selectedStudents.length} students)
                  </Button>
                ) : (
                  <Button
                    onClick={stopMonitoring}
                    variant="destructive"
                    className="w-full"
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Stop Monitoring
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Dashboard */}
      {isMonitoring && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Student Activity Dashboard</span>
              {activitiesLoading && (
                <div className="text-sm text-gray-500">Updating...</div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading && studentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Loading activities...</div>
            ) : (
              <div className="space-y-3">
                {selectedStudents.map(studentId => {
                  const student = (allStudents as Student[]).find((s: Student) => s.id === studentId);
                  const activity = (studentActivities as StudentActivity[]).find((a: StudentActivity) => a.student_id === studentId);

                  if (!student) return null;

                  return (
                    <div key={studentId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium">{student.first_name} {student.last_name}</div>
                        <div className="text-sm text-gray-500">{student.id}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-blue-600" />
                          <span className="text-sm">{activity?.content_viewed || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-600" />
                          <span className="text-sm">{activity?.content_rated || 0}</span>
                        </div>
                        <div className="text-xs text-gray-500 min-w-16">
                          {activity?.last_activity ? formatTime(activity.last_activity) : 'No activity'}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowActivityDetails(
                            showActivityDetails === studentId ? null : studentId
                          )}
                          disabled={!activity?.activities?.length}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Activity Details */}
      {showActivityDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Activity Details - {(allStudents as Student[]).find((s: Student) => s.id === showActivityDetails)?.first_name}
              </span>
              <Button variant="outline" size="sm" onClick={() => setShowActivityDetails(null)}>
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(studentActivities as StudentActivity[])
                .find((a: StudentActivity) => a.student_id === showActivityDetails)
                ?.activities?.map((activity: any, index: number) => (
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