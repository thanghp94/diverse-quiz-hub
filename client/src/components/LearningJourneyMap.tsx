import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Star, 
  Trophy, 
  Target,
  ChevronRight,
  Play,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Topic {
  id: string;
  topic: string;
  short_summary?: string;
  showstudent?: boolean;
  parentid?: string;
}

interface Content {
  id: string;
  topicid: string;
  title?: string;
  short_description?: string;
}

interface LearningProgress {
  topicId: string;
  contentId: string;
  completed: boolean;
  score?: number;
  timeSpent?: number;
  lastAccessed?: Date;
}

interface JourneyNode {
  id: string;
  type: 'topic' | 'content';
  title: string;
  description?: string;
  position: { x: number; y: number };
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  progress: number;
  connections: string[];
  metadata?: {
    difficulty?: 'easy' | 'medium' | 'hard';
    estimatedTime?: number;
    points?: number;
  };
}

interface LearningJourneyMapProps {
  studentId?: string;
  onNodeClick?: (nodeId: string, nodeType: 'topic' | 'content') => void;
  className?: string;
}

export const LearningJourneyMap: React.FC<LearningJourneyMapProps> = ({
  studentId,
  onNodeClick,
  className
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [journeyNodes, setJourneyNodes] = useState<JourneyNode[]>([]);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Get current user ID
  const currentUserId = studentId || (typeof window !== 'undefined' && localStorage.getItem('currentUser') 
    ? JSON.parse(localStorage.getItem('currentUser')!).id 
    : 'GV0002');

  // Fetch topics and content
  const { data: topics = [] } = useQuery<Topic[]>({
    queryKey: ['/api/topics'],
  });

  const { data: content = [] } = useQuery<Content[]>({
    queryKey: ['/api/content'],
  });

  // Mock progress data (in real app, this would come from user progress API)
  const mockProgress: LearningProgress[] = [
    {
      topicId: 'dbc19831',
      contentId: '08a2c37c',
      completed: true,
      score: 85,
      timeSpent: 45,
      lastAccessed: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      topicId: 'dbc19831',
      contentId: '1a2b3c4d',
      completed: false,
      score: 0,
      timeSpent: 15,
      lastAccessed: new Date()
    }
  ];

  // Generate journey nodes from topics and content
  useEffect(() => {
    if (topics.length === 0) return;

    const visibleTopics = topics.filter(topic => topic.showstudent !== false);
    const nodes: JourneyNode[] = [];

    // Create topic nodes in a flowing path layout
    visibleTopics.forEach((topic, index) => {
      const angle = (index * 45) * (Math.PI / 180); // 45 degrees between nodes
      const radius = 200 + (index % 3) * 100; // Varying radius for visual appeal
      
      const x = 400 + Math.cos(angle) * radius;
      const y = 300 + Math.sin(angle) * radius;

      // Determine status based on progress
      const topicProgress = mockProgress.filter(p => p.topicId === topic.id);
      const completedContent = topicProgress.filter(p => p.completed).length;
      const totalContent = content.filter(c => c.topicid === topic.id).length || 1;
      const progress = (completedContent / totalContent) * 100;
      
      let status: JourneyNode['status'] = 'available';
      if (progress === 100) status = 'completed';
      else if (progress > 0) status = 'in-progress';
      else if (index > 2) status = 'locked'; // Lock nodes after first few

      nodes.push({
        id: topic.id,
        type: 'topic',
        title: topic.topic,
        description: topic.short_summary,
        position: { x, y },
        status,
        progress,
        connections: index < visibleTopics.length - 1 ? [visibleTopics[index + 1].id] : [],
        metadata: {
          difficulty: index % 3 === 0 ? 'easy' : index % 3 === 1 ? 'medium' : 'hard',
          estimatedTime: 30 + (index * 10),
          points: 100 + (index * 50)
        }
      });
    });

    setJourneyNodes(nodes);
  }, [topics, content]);

  // Animation sequence
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleNodeClick = (node: JourneyNode) => {
    if (node.status === 'locked') return;
    setSelectedNode(node.id);
    onNodeClick?.(node.id, node.type);
  };

  const getNodeColor = (status: JourneyNode['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'available': return 'bg-yellow-500';
      case 'locked': return 'bg-gray-400';
      default: return 'bg-gray-300';
    }
  };

  const getNodeIcon = (status: JourneyNode['status']) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in-progress': return Play;
      case 'available': return Target;
      case 'locked': return Lock;
      default: return BookOpen;
    }
  };

  const PathLine: React.FC<{ from: JourneyNode; to: JourneyNode; animated?: boolean }> = ({ 
    from, 
    to, 
    animated = false 
  }) => {
    const pathId = `path-${from.id}-${to.id}`;
    
    return (
      <g>
        <defs>
          <linearGradient id={`gradient-${from.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        
        <motion.path
          d={`M ${from.position.x} ${from.position.y} Q ${(from.position.x + to.position.x) / 2} ${from.position.y - 50} ${to.position.x} ${to.position.y}`}
          stroke={`url(#gradient-${from.id})`}
          strokeWidth="3"
          fill="none"
          strokeDasharray={animated ? "10,5" : "none"}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: 1, 
            opacity: 1,
            strokeDashoffset: animated ? [0, -15] : 0
          }}
          transition={{ 
            duration: 2, 
            delay: 0.5,
            strokeDashoffset: { 
              duration: 2, 
              repeat: Infinity, 
              ease: "linear" 
            }
          }}
        />
        
        {/* Animated particles */}
        {animated && (
          <motion.circle
            r="4"
            fill="#3b82f6"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              offsetDistance: ["0%", "100%"]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              offsetPath: `path('M ${from.position.x} ${from.position.y} Q ${(from.position.x + to.position.x) / 2} ${from.position.y - 50} ${to.position.x} ${to.position.y}')`
            }}
          />
        )}
      </g>
    );
  };

  return (
    <div className={cn("relative w-full h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden", className)}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#3b82f6" strokeWidth="1"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Journey Map Container */}
      <div className="relative w-full h-full">
        <svg width="100%" height="100%" className="absolute inset-0">
          {/* Render connection paths */}
          {journeyNodes.map(node => 
            node.connections.map(connectionId => {
              const targetNode = journeyNodes.find(n => n.id === connectionId);
              if (!targetNode) return null;
              
              const isAnimated = node.status === 'completed' || node.status === 'in-progress';
              
              return (
                <PathLine
                  key={`${node.id}-${connectionId}`}
                  from={node}
                  to={targetNode}
                  animated={isAnimated}
                />
              );
            })
          )}
        </svg>

        {/* Journey Nodes */}
        <AnimatePresence>
          {journeyNodes.map((node, index) => {
            const Icon = getNodeIcon(node.status);
            
            return (
              <motion.div
                key={node.id}
                className="absolute"
                style={{
                  left: node.position.x - 40,
                  top: node.position.y - 40,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ 
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "relative w-20 h-20 rounded-full p-0 border-4 border-white shadow-lg transition-all duration-300",
                    getNodeColor(node.status),
                    node.status === 'locked' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-xl',
                    selectedNode === node.id && 'ring-4 ring-blue-300'
                  )}
                  onClick={() => handleNodeClick(node)}
                  disabled={node.status === 'locked'}
                >
                  <Icon className="w-8 h-8 text-white" />
                  
                  {/* Progress ring */}
                  {node.progress > 0 && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="8"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(255,255,255,0.9)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                        animate={{ 
                          strokeDashoffset: 2 * Math.PI * 45 * (1 - node.progress / 100)
                        }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </svg>
                  )}
                  
                  {/* Status indicators */}
                  {node.status === 'completed' && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.2 + 0.5 }}
                    >
                      <Star className="w-4 h-4 text-yellow-600" />
                    </motion.div>
                  )}
                </Button>

                {/* Node label */}
                <motion.div
                  className="absolute top-24 left-1/2 transform -translate-x-1/2 min-w-max"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 + 0.3 }}
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border text-center">
                    <div className="text-sm font-semibold text-gray-800 max-w-32 truncate">
                      {node.title}
                    </div>
                    {node.metadata && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {node.metadata.difficulty}
                        </Badge>
                        <span className="text-xs text-gray-600">
                          {node.metadata.estimatedTime}min
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Legend */}
        <Card className="absolute top-4 right-4 w-64">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-gray-800">Learning Journey</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">In Progress</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Locked</span>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">
                  {Math.round(journeyNodes.reduce((acc, node) => acc + node.progress, 0) / journeyNodes.length || 0)}%
                </span>
              </div>
              <Progress 
                value={journeyNodes.reduce((acc, node) => acc + node.progress, 0) / journeyNodes.length || 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Selected Node Details */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              <Card className="w-96">
                <CardContent className="p-4">
                  {(() => {
                    const node = journeyNodes.find(n => n.id === selectedNode);
                    if (!node) return null;
                    
                    return (
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", getNodeColor(node.status))}>
                            {React.createElement(getNodeIcon(node.status), { className: "w-6 h-6 text-white" })}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{node.title}</h3>
                            <Badge variant="outline">{node.status.replace('-', ' ')}</Badge>
                          </div>
                        </div>
                        
                        {node.description && (
                          <p className="text-sm text-gray-600 mb-3">{node.description}</p>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Progress</div>
                            <div className="text-lg font-semibold">{Math.round(node.progress)}%</div>
                          </div>
                          {node.metadata?.points && (
                            <div>
                              <div className="text-xs text-gray-500 uppercase tracking-wide">Points</div>
                              <div className="text-lg font-semibold">{node.metadata.points}</div>
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          className="w-full mt-4" 
                          disabled={node.status === 'locked'}
                          onClick={() => onNodeClick?.(node.id, node.type)}
                        >
                          {node.status === 'completed' ? 'Review' : 'Continue Learning'}
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};