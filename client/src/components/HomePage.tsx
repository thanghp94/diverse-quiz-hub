
import Header from "./Header";
import ContentSection from "./ContentSection";
import TopicCard from "./TopicCard";
import MatchingActivityButton from "./MatchingActivityButton";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { useTopics } from "@/hooks/useTopics";
import { 
  Book, 
  Trophy, 
  Users, 
  Edit, 
  BarChart3, 
  User,
  Star,
  Award,
  Clock,
  Zap,
  BookOpen,
  Target,
  Loader2
} from "lucide-react";

const HomePage = () => {
  const { data: topics, isLoading, error } = useTopics();

  const advanceItems = [
    {
      id: "subject",
      title: "Subject (Art, History...)",
      icon: <Book className="h-4 w-4 text-red-600" />,
      color: "bg-red-100",
      starred: true
    },
    {
      id: "hard-quizzes",
      title: "Hard Quizzes",
      icon: <Trophy className="h-4 w-4 text-orange-600" />,
      color: "bg-orange-100",
      starred: true,
      difficulty: "hard" as const
    },
    {
      id: "overview-quizzes",
      title: "Overview Quizzes", 
      icon: <BarChart3 className="h-4 w-4 text-orange-600" />,
      color: "bg-orange-100",
      starred: true,
      difficulty: "medium" as const
    }
  ];

  const bowlChallengeItems = [
    {
      id: "bowl-challenge-content",
      title: "Bowl & Challenge content",
      icon: <Target className="h-4 w-4 text-blue-600" />,
      color: "bg-blue-100",
      starred: true,
      link: "/topics"
    },
    {
      id: "bowl-challenge-homework", 
      title: "Bowl & Challenge homework",
      icon: <Edit className="h-4 w-4 text-blue-600" />,
      color: "bg-blue-100"
    },
    {
      id: "live-quiz",
      title: "Live Quiz",
      icon: <Zap className="h-4 w-4 text-blue-600" />,
      color: "bg-blue-100"
    },
    {
      id: "matching",
      title: "Matching",
      icon: <Target className="h-4 w-4 text-blue-600" />,
      color: "bg-blue-100"
    }
  ];

  const debateItems = [
    {
      id: "debate-content",
      title: "Debate content",
      icon: <Users className="h-4 w-4 text-purple-600" />,
      color: "bg-purple-100"
    },
    {
      id: "debate-homework",
      title: "Debate homework", 
      icon: <Edit className="h-4 w-4 text-purple-600" />,
      color: "bg-purple-100"
    },
    {
      id: "debate-motion",
      title: "Debate motion",
      icon: <Book className="h-4 w-4 text-purple-600" />,
      color: "bg-purple-100"
    },
    {
      id: "debate-schedule",
      title: "Debate Schedule",
      icon: <Clock className="h-4 w-4 text-purple-600" />,
      color: "bg-purple-100"
    }
  ];

  const writingItems = [
    {
      id: "writing-content",
      title: "Writing content",
      icon: <Edit className="h-4 w-4 text-green-600" />,
      color: "bg-green-100"
    },
    {
      id: "writing-homework",
      title: "Writing homework",
      icon: <Book className="h-4 w-4 text-green-600" />,
      color: "bg-green-100"
    },
    {
      id: "writing-prompt",
      title: "Writing Prompt",
      icon: <Edit className="h-4 w-4 text-green-600" />,
      color: "bg-green-100"
    }
  ];

  const dashboardItems = [
    {
      id: "leaderboard",
      title: "Leaderboard",
      icon: <Award className="h-4 w-4 text-pink-600" />,
      color: "bg-pink-100",
      link: "/leaderboard"
    },
    {
      id: "personal",
      title: "Personal",
      icon: <User className="h-4 w-4 text-pink-600" />,
      color: "bg-pink-100"
    }
  ];

  const renderDashboardItems = (items: any[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        if (item.link) {
          return (
            <Link key={item.id} to={item.link}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {item.starred && (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    )}
                    <div className={`p-1 rounded ${item.color}`}>
                      {item.icon}
                    </div>
                  </div>
                </div>
                <h3 className="font-medium text-gray-800 text-sm">{item.title}</h3>
              </Card>
            </Link>
          );
        }
        
        return (
          <div key={item.id}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {item.starred && (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  )}
                  <div className={`p-1 rounded ${item.color}`}>
                    {item.icon}
                  </div>
                </div>
              </div>
              <h3 className="font-medium text-gray-800 text-sm">{item.title}</h3>
            </Card>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="p-6">
        <nav className="mb-6">
          <span className="text-sm text-gray-600">Home</span>
        </nav>

        <ContentSection
          title="Advance"
          icon={<Trophy className="h-4 w-4 text-red-600" />}
          items={advanceItems}
          color="bg-red-100"
        />

        <ContentSection
          title="Bowl & Challenge"
          icon={<Target className="h-4 w-4 text-blue-600" />}
          items={bowlChallengeItems}
          color="bg-blue-100"
        />

        {/* Main Topics Section from Database */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1 rounded bg-green-100">
              <BookOpen className="h-4 w-4 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Main Topics</h2>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600">Loading topics...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading topics. Please try again later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topics?.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          )}
        </div>

        <ContentSection
          title="Debate"
          icon={<Users className="h-4 w-4 text-purple-600" />}
          items={debateItems}
          color="bg-purple-100"
        />

        <ContentSection
          title="Writing"
          icon={<Edit className="h-4 w-4 text-green-600" />}
          items={writingItems}
          color="bg-green-100"
        />

        {/* Matching Activities Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1 rounded bg-orange-100">
              <Target className="h-4 w-4 text-orange-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Matching Activities</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-gray-800">Infrastructure Projects</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Picture-title and title-description matching using real content from prompt1-6 fields
                </p>
                <MatchingActivityButton
                  matchingId="1"
                  title="Start Activity"
                  description="Failed mega projects - costs, delays, and frustrations"
                  variant="default"
                  size="sm"
                />
              </div>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Test Activity 10</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Another matching activity to test different content combinations
                </p>
                <MatchingActivityButton
                  matchingId="10"
                  title="Try Activity"
                  variant="outline"
                  size="sm"
                />
              </div>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-gray-800">Test Activity 13</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Additional matching activity for comprehensive testing
                </p>
                <MatchingActivityButton
                  matchingId="13"
                  title="Launch Activity"
                  variant="secondary"
                  size="sm"
                />
              </div>
            </Card>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1 rounded bg-pink-100">
              <BarChart3 className="h-4 w-4 text-pink-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Your dashboard</h2>
          </div>
          {renderDashboardItems(dashboardItems)}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
