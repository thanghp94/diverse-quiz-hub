import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Clock, Users, Play } from 'lucide-react';

interface LiveAssignment {
  id: string;
  assignmentname: string;
  description: string;
  type: string;
  created_at: string;
  assignmentid: string;
}

const LiveClassPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<LiveAssignment | null>(null);

  // Check if user is teacher (GV0002) - default to teacher for demonstration
  const currentUserStr = localStorage.getItem('currentUser');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : { id: 'GV0002' };
  const isTeacher = currentUser.id === 'GV0002';

  // Fetch real live class assignments from API
  const { data: liveAssignments = [], isLoading } = useQuery({
    queryKey: ['/api/assignments/live-class'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    // Convert to Vietnam timezone (UTC+7)
    const vietnamTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    return vietnamTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStatusBadge = (assignment: LiveAssignment) => {
    const createdTime = new Date(assignment.created_at);
    const now = new Date();
    const diffHours = (now.getTime() - createdTime.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return <Badge className="bg-green-500 text-white">Live Now</Badge>;
    } else if (diffHours < 3) {
      return <Badge className="bg-orange-500 text-white">Recent</Badge>;
    } else {
      return <Badge className="bg-gray-500 text-white">Ended</Badge>;
    }
  };

  const handleJoinClass = (assignment: LiveAssignment) => {
    setSelectedAssignment(assignment);
    console.log('Joining live class:', assignment.assignmentname);
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-400/30 text-white hover:from-blue-600/30 hover:to-purple-600/30 hover:border-blue-400/50 backdrop-blur-sm shadow-lg transition-all duration-300"
          >
            <Video className="h-4 w-4 mr-2" />
            Live Class
            <Badge className="ml-2 bg-blue-500/20 text-blue-200">Loading...</Badge>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Video className="h-6 w-6 text-blue-400" />
              Live Classes
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">Loading live classes...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-400/30 text-white hover:from-blue-600/30 hover:to-purple-600/30 hover:border-blue-400/50 backdrop-blur-sm shadow-lg transition-all duration-300"
        >
          <Video className="h-4 w-4 mr-2" />
          Live Class
          <Badge className="ml-2 bg-blue-500/20 text-blue-200">
            {liveAssignments.length}
          </Badge>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Video className="h-6 w-6 text-blue-400" />
            Live Classes
            <Badge variant="outline" className="text-blue-200 border-blue-400">
              {liveAssignments.length} Available
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {liveAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Live Classes Available</h3>
              <p className="text-sm">No live class assignments found within the last 3 hours.</p>
            </div>
          ) : (
            liveAssignments.map((assignment: LiveAssignment) => (
              <Card 
                key={assignment.id} 
                className="bg-gray-800/50 border-gray-600 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
                onClick={() => handleJoinClass(assignment)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{assignment.assignmentname}</h3>
                        {getStatusBadge(assignment)}
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{assignment.description || 'Live class session'}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Created: {formatTime(assignment.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Assignment ID: {assignment.assignmentid}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-blue-600/20 border-blue-400/50 text-blue-200 hover:bg-blue-600/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinClass(assignment);
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Join
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {selectedAssignment && (
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-400/30 rounded-lg">
            <h4 className="text-white font-medium mb-2">Selected: {selectedAssignment.assignmentname}</h4>
            <p className="text-blue-200 text-sm mb-3">{selectedAssignment.description}</p>
            <div className="flex gap-2">
              <Button 
                variant="default" 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="h-4 w-4 mr-1" />
                Start Quiz
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedAssignment(null)}
                className="text-gray-300 border-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LiveClassPanel;