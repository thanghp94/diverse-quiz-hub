import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Play, Eye, BookOpen, Clock } from 'lucide-react';

interface LiveClass {
  id: string;
  title: string;
  teacher: string;
  participants: number;
  status: 'active' | 'waiting' | 'ended';
  startTime: string;
  description: string;
}

const LiveClassPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<LiveClass | null>(null);

  // Check if user is teacher (GV0002) - default to teacher for demonstration
  const currentUserStr = localStorage.getItem('currentUser');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : { id: 'GV0002' };
  const isTeacher = currentUser.id === 'GV0002';

  // Mock live classes data - replace with real API call
  const mockLiveClasses: LiveClass[] = [
    {
      id: 'live-1',
      title: 'Future Technologies Quiz Session',
      teacher: 'Prof. Smith',
      participants: 12,
      status: 'active',
      startTime: '3:00 PM',
      description: 'Interactive quiz on emerging technologies and their impact on society'
    },
    {
      id: 'live-2', 
      title: 'Historical Empires Discussion',
      teacher: 'Dr. Johnson',
      participants: 8,
      status: 'waiting',
      startTime: '3:30 PM',
      description: 'Live discussion about the rise and fall of historical empires'
    },
    {
      id: 'live-3',
      title: 'Social Media Impact Study',
      teacher: 'Prof. Williams',
      participants: 15,
      status: 'active',
      startTime: '2:45 PM',
      description: 'Real-time analysis of social media effects on modern society'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'waiting': return 'bg-yellow-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const handleJoinClass = (liveClass: LiveClass) => {
    // For students: join the quiz directly
    console.log('Joining live class:', liveClass.id);
    // Implement quiz joining logic here
  };

  const handleViewProgress = (liveClass: LiveClass) => {
    // For teachers: view student progress
    setSelectedClass(liveClass);
    // Implement progress viewing logic
  };

  // Always show for demonstration - remove this check
  // if (!isTeacher) {
  //   return null; // Only show for teacher GV0002
  // }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Live Class
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Live Classes
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {mockLiveClasses.map((liveClass) => (
            <Card key={liveClass.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{liveClass.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(liveClass.status)} text-white border-none`}
                    >
                      {liveClass.status.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {liveClass.participants}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-3">{liveClass.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {liveClass.teacher}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {liveClass.startTime}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {liveClass.status === 'active' && (
                      <>
                        <Button 
                          size="sm" 
                          className="flex items-center gap-2"
                          onClick={() => handleJoinClass(liveClass)}
                        >
                          <Play className="h-4 w-4" />
                          Join as Student
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-2"
                          onClick={() => handleViewProgress(liveClass)}
                        >
                          <Eye className="h-4 w-4" />
                          View Progress
                        </Button>
                      </>
                    )}
                    {liveClass.status === 'waiting' && (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        disabled
                        className="flex items-center gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        Waiting to Start
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Student Progress Modal */}
        {selectedClass && (
          <Dialog open={!!selectedClass} onOpenChange={() => setSelectedClass(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Student Progress - {selectedClass.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Real-time view of student quiz progress and performance for {selectedClass.title}
                </p>
                {/* Add actual student progress implementation here */}
                <div className="border rounded-lg p-4 text-center text-gray-500">
                  Student progress tracking will be implemented here
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LiveClassPanel;