import React from 'react';
import { useLocation } from 'wouter';
import { LearningJourneyMap } from '@/components/LearningJourneyMap';

const LearningJourneyPage: React.FC = () => {
  const [, setLocation] = useLocation();

  const handleNodeClick = (nodeId: string, nodeType: 'topic' | 'content') => {
    if (nodeType === 'topic') {
      setLocation('/');
    } else {
      // Navigate to content details or quiz
      setLocation(`/content/${nodeId}`);
    }
  };

  return (
    <div className="min-h-screen">
      <LearningJourneyMap onNodeClick={handleNodeClick} />
    </div>
  );
};

export default LearningJourneyPage;