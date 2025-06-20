import React from 'react';
import { LiveClassMonitor } from '@/components/LiveClassMonitor';

const LiveClassPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Clean Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Live Class Monitor
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Track student activities in real-time during live classes
          </p>
        </div>

        {/* Live Class Monitor Component */}
        <LiveClassMonitor />
      </div>
    </div>
  );
};

export default LiveClassPage;