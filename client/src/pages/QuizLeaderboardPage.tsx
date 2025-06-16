import { QuizLeaderboard } from "@/components/QuizLeaderboard";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const QuizLeaderboardPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Topics
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Quiz Leaderboard</h1>
        </div>
        
        <QuizLeaderboard />
      </div>
    </div>
  );
};

export default QuizLeaderboardPage;