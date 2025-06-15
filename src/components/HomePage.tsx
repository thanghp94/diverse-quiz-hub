
import Header from "./Header";
import ContentSection from "./ContentSection";
import { Card } from "@/components/ui/card";
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
  Target
} from "lucide-react";

const HomePage = () => {
  const blankItems = [
    {
      id: "class",
      title: "Class",
      icon: <Users className="h-4 w-4 text-gray-600" />,
      color: "bg-gray-100"
    },
    {
      id: "topic",
      title: "Topic", 
      icon: <BookOpen className="h-4 w-4 text-gray-600" />,
      color: "bg-gray-100"
    }
  ];

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
      starred: true
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
      color: "bg-pink-100"
    },
    {
      id: "personal",
      title: "Personal",
      icon: <User className="h-4 w-4 text-pink-600" />,
      color: "bg-pink-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="p-6">
        <nav className="mb-6">
          <span className="text-sm text-gray-600">Home</span>
        </nav>

        <div className="mb-6">
          <p className="text-gray-500 italic">blank</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {blankItems.map((item) => (
              <Card key={item.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${item.color}`}>
                    {item.icon}
                  </div>
                  <h3 className="font-medium text-gray-800 text-sm">{item.title}</h3>
                </div>
              </Card>
            ))}
          </div>
        </div>

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

        <ContentSection
          title="Your dashboard"
          icon={<BarChart3 className="h-4 w-4 text-pink-600" />}
          items={dashboardItems}
          color="bg-pink-100"
        />
      </div>
    </div>
  );
};

export default HomePage;
