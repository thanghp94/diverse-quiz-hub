import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Users, BookOpen, Star, Clock, Filter, Search, X, ChevronDown, Play, Pause } from 'lucide-react';
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
  const [customStartTime, setCustomStartTime] = useState(format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'));
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showActivityDetails, setShowActivityDetails] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [minContentViewed, setMinContentViewed] = useState<number>(0);
  const [minContentRated, setMinContentRated] = useState<number>(0);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [timePreset, setTimePreset] = useState<string>('now');
  const studentSelectorRef = useRef<HTMLDivElement>(null);

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

  const removeStudent = (studentId: string) => {
    setSelectedStudents(prev => prev.filter(id => id !== studentId));
  };

  const getSelectedStudentNames = () => {
    return selectedStudents.map(id => {
      const student = (allStudents as Student[]).find((s: Student) => s.id === id);
      return student ? (student.full_name || `${student.first_name} ${student.last_name}`) : id;
    });
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (studentSelectorRef.current && !studentSelectorRef.current.contains(event.target as Node)) {
        setShowStudentSelector(false);
      }
    };

    if (showStudentSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStudentSelector]);

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

  const applyTimePreset = (preset: string) => {
    const now = new Date();
    let targetTime: Date;
    
    switch (preset) {
      case '4pm_today':
        targetTime = new Date();
        targetTime.setHours(16, 0, 0, 0);
        break;
      case '8pm_today':
        targetTime = new Date();
        targetTime.setHours(20, 0, 0, 0);
        break;
      case 'yesterday':
        targetTime = new Date();
        targetTime.setDate(targetTime.getDate() - 1);
        targetTime.setHours(0, 0, 0, 0);
        break;
      case 'today':
        targetTime = new Date();
        targetTime.setHours(0, 0, 0, 0);
        break;
      case '7_days_ago':
        targetTime = new Date();
        targetTime.setDate(targetTime.getDate() - 7);
        targetTime.setHours(0, 0, 0, 0);
        break;
      case 'custom':
        targetTime = new Date(customStartTime);
        break;
      default: // 'now'
        targetTime = now;
    }
    
    setMonitorStartTime(targetTime.toISOString());
    if (preset === 'custom') {
      setCustomStartTime(format(targetTime, 'yyyy-MM-dd\'T\'HH:mm'));
    }
  };

  const startMonitoring = () => {
    if (selectedStudents.length === 0) return;
    if (timePreset !== 'custom') {
      applyTimePreset(timePreset);
    }
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
    // Handle time-only format (HH:MM:SS) from quiz activities
    if (timestamp && timestamp.match(/^[0-9]{2}:[0-9]{2}:[0-9]{2}$/)) {
      return timestamp; // Already in HH:MM:SS format
    }
    
    // Handle full timestamp format
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return timestamp; // Return as-is if can't parse
      }
      return format(date, 'HH:mm:ss');
    } catch (error) {
      return timestamp || 'Invalid time';
    }
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
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Students to Monitor</label>
            
            {/* Selected Students Display */}
            <div className="relative" ref={studentSelectorRef}>
              <div 
                className="min-h-12 p-3 border rounded-lg bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setShowStudentSelector(!showStudentSelector)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {selectedStudents.length === 0 ? (
                      <span className="text-gray-500">Click to select students...</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {getSelectedStudentNames().slice(0, 3).map((name, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {name}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeStudent(selectedStudents[index]);
                              }}
                              className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </Badge>
                        ))}
                        {selectedStudents.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{selectedStudents.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showStudentSelector ? 'transform rotate-180' : ''}`} />
                </div>
              </div>

              {/* Student Selector Popup */}
              {showStudentSelector && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10">
                  <div className="p-3 space-y-3">
                    {/* Search Box */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        disabled={studentsLoading}
                      >
                        {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStudents([])}
                        disabled={selectedStudents.length === 0}
                      >
                        Clear Selection
                      </Button>
                    </div>
                    
                    {/* Student List */}
                    <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-lg border">
                      {studentsLoading ? (
                        <div className="text-center text-gray-500 py-6">Loading students...</div>
                      ) : filteredStudents.length === 0 ? (
                        <div className="text-center text-gray-500 py-6">No students found</div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {filteredStudents.map((student: Student) => (
                            <div key={student.id} className="flex items-center p-3 hover:bg-gray-100 transition-colors">
                              <Checkbox
                                id={`popup-${student.id}`}
                                checked={selectedStudents.includes(student.id)}
                                onCheckedChange={() => handleStudentToggle(student.id)}
                                className="mr-3"
                              />
                              <label
                                htmlFor={`popup-${student.id}`}
                                className="text-sm cursor-pointer flex-1 truncate font-medium"
                                title={student.full_name || `${student.first_name} ${student.last_name}`}
                              >
                                {student.full_name || `${student.first_name} ${student.last_name}`}
                              </label>
                              <span className="text-xs text-gray-400 ml-2">{student.id}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Selection Summary */}
                    <div className="text-xs text-gray-600 text-center">
                      {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Monitor Configuration */}
          <div className="space-y-4">
            {/* Monitor Start Time & Activity Filters */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monitor Start Time */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Monitor Start Time
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-xs text-gray-600">Time Preset:</label>
                      <Select value={timePreset} onValueChange={(value) => {
                        setTimePreset(value);
                        if (value !== 'custom') {
                          applyTimePreset(value);
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="now">Now</SelectItem>
                          <SelectItem value="4pm_today">4 PM Today</SelectItem>
                          <SelectItem value="8pm_today">8 PM Today</SelectItem>
                          <SelectItem value="today">Start of Today</SelectItem>
                          <SelectItem value="yesterday">Yesterday</SelectItem>
                          <SelectItem value="7_days_ago">7 Days Ago</SelectItem>
                          <SelectItem value="custom">Custom Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {timePreset === 'custom' && (
                      <div>
                        <label className="text-xs text-gray-600">Custom DateTime:</label>
                        <Input
                          type="datetime-local"
                          value={customStartTime}
                          onChange={(e) => {
                            setCustomStartTime(e.target.value);
                            setMonitorStartTime(new Date(e.target.value).toISOString());
                          }}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Current: {format(new Date(monitorStartTime), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>

                {/* Activity Filters */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Activity Filters
                  </label>
                  <div className="grid grid-cols-1 gap-3">
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
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600">Min Viewed:</label>
                        <Input
                          type="number"
                          min="0"
                          value={minContentViewed}
                          onChange={(e) => setMinContentViewed(parseInt(e.target.value) || 0)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Min Rated:</label>
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
                </div>
              </div>
            </div>

            {/* Monitor Controls */}
            <div className="flex items-center gap-4 flex-wrap">
              {!isMonitoring ? (
                <Button
                  onClick={startMonitoring}
                  disabled={selectedStudents.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Monitoring ({selectedStudents.length} students)
                </Button>
              ) : (
                <Button
                  onClick={stopMonitoring}
                  variant="destructive"
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Stop Monitoring
                </Button>
              )}
            </div>
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
                      <th className="text-left p-3">Quiz Attempts</th>
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
                            <Badge variant="outline" className="bg-orange-50">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {activity?.quiz_attempts || 0}
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