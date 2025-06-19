import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Users, BookOpen, Star, Clock, Filter, Search } from 'lucide-react';
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
  const [customStartTime, setCustomStartTime] = useState(format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'));
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showActivityDetails, setShowActivityDetails] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [minContentViewed, setMinContentViewed] = useState<number>(0);
  const [minContentRated, setMinContentRated] = useState<number>(0);

  // Fetch all students
  const { data: allStudents = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/users'],
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
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
  const { data: studentActivities = [], isLoading: activitiesLoading, isFetching } = useQuery<StudentActivity[]>({
    queryKey: ['/api/live-class-activities', selectedStudents, monitorStartTime],
    enabled: isMonitoring && selectedStudents.length > 0,
    refetchInterval: 10000, // Refresh every 10 seconds to reduce flickering
    staleTime: 15000, // Keep data fresh for 15 seconds to prevent constant refetching
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Prevent refetch on component mount
    retry: 1, // Reduce retry attempts
  });

  // Filter activities based on criteria
  const filteredActivities = useMemo(() => {
    if (!studentActivities) return [];
    return (studentActivities as StudentActivity[]).filter((activity: StudentActivity) => {
      if (activityFilter === 'active' && activity.content_viewed === 0 && activity.content_rated === 0) {
        return false;
      }
      if (activity.content_viewed < minContentViewed) return false;
      if (activity.content_rated < minContentRated) return false;
      return true;
    });
  }, [studentActivities, activityFilter, minContentViewed, minContentRated]);

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

  const handleSelectAllVisible = () => {
    const visibleStudentIds = filteredStudents.map((s: Student) => s.id);
    const combined = [...selectedStudents, ...visibleStudentIds];
    const uniqueIds = combined.filter((id, index) => combined.indexOf(id) === index);
    setSelectedStudents(uniqueIds);
  };

  const handleCustomTimeStart = () => {
    if (selectedStudents.length === 0) return;
    setMonitorStartTime(new Date(customStartTime).toISOString());
    setIsMonitoring(true);
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
          {/* Time Selection Controls */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Monitor Start Time:</label>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Input
                  type="datetime-local"
                  value={customStartTime}
                  onChange={(e) => setCustomStartTime(e.target.value)}
                  className="w-48"
                />
                <Button
                  onClick={handleCustomTimeStart}
                  disabled={selectedStudents.length === 0}
                  variant="outline"
                  size="sm"
                >
                  Use Custom Time
                </Button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={() => {
                    const now = new Date();
                    now.setHours(16, 0, 0, 0); // 4 PM today
                    setCustomStartTime(format(now, 'yyyy-MM-dd\'T\'HH:mm'));
                  }}
                  variant="outline"
                  size="sm"
                >
                  4 PM Today
                </Button>
                <Button
                  onClick={() => {
                    const now = new Date();
                    now.setHours(20, 0, 0, 0); // 8 PM today
                    setCustomStartTime(format(now, 'yyyy-MM-dd\'T\'HH:mm'));
                  }}
                  variant="outline"
                  size="sm"
                >
                  8 PM Today
                </Button>
                <Button
                  onClick={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    yesterday.setHours(16, 0, 0, 0); // 4 PM yesterday
                    setCustomStartTime(format(yesterday, 'yyyy-MM-dd\'T\'HH:mm'));
                  }}
                  variant="outline"
                  size="sm"
                >
                  4 PM Yesterday
                </Button>
                <Button
                  onClick={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    yesterday.setHours(20, 0, 0, 0); // 8 PM yesterday
                    setCustomStartTime(format(yesterday, 'yyyy-MM-dd\'T\'HH:mm'));
                  }}
                  variant="outline"
                  size="sm"
                >
                  8 PM Yesterday
                </Button>
              </div>
            </div>
          </div>

          {/* Student Search and Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Select Students to Monitor:</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={studentsLoading}
                >
                  {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All Filtered'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllVisible}
                  disabled={studentsLoading}
                >
                  Add All Visible
                </Button>
              </div>
            </div>
            
            {/* Student Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search students by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
              {studentsLoading ? (
                <div className="col-span-full text-center text-gray-500">Loading students...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="col-span-full text-center text-gray-500">No students found</div>
              ) : (
                filteredStudents.map((student: Student) => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={student.id}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => handleStudentToggle(student.id)}
                    />
                    <label
                      htmlFor={student.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      title={student.full_name || `${student.first_name} ${student.last_name}`}
                    >
                      {student.full_name || `${student.first_name} ${student.last_name}`}
                    </label>
                  </div>
                ))
              )}
            </div>
            {selectedStudents.length > 0 && (
              <div className="text-xs text-gray-600">
                Selected: {selectedStudents.length} students
              </div>
            )}
          </div>

          {/* Activity Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Activity Filters:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-gray-600">Activity Level:</label>
                <Select value={activityFilter} onValueChange={setActivityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-gray-600">Min Content Viewed:</label>
                <Input
                  type="number"
                  min="0"
                  value={minContentViewed}
                  onChange={(e) => setMinContentViewed(parseInt(e.target.value) || 0)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Min Content Rated:</label>
                <Input
                  type="number"
                  min="0"
                  value={minContentRated}
                  onChange={(e) => setMinContentRated(parseInt(e.target.value) || 0)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Monitor Controls */}
          <div className="flex items-center gap-4 flex-wrap">
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
                Start Monitoring Now ({selectedStudents.length} students)
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
                      const student = (allStudents as Student[]).find((s: Student) => s.id === studentId);
                      const activity = (studentActivities as StudentActivity[]).find((a: StudentActivity) => a.student_id === studentId);
                      
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
              <span>Activity Details - {(allStudents as Student[]).find((s: Student) => s.id === showActivityDetails)?.first_name}</span>
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