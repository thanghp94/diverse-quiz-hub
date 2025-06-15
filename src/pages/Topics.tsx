
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, BookOpen, Play, Image } from "lucide-react";
import { Link } from "react-router-dom";

interface ContentItem {
  id: number;
  title: string;
  type: 'video' | 'article' | 'quiz';
  duration?: string;
}

interface Topic {
  id: number;
  title: string;
  description: string;
  category: string;
  contentCount: number;
  contents: ContentItem[];
}

const topicsData: Topic[] = [
  {
    id: 1,
    title: "Ancient Civilizations",
    description: "Explore the great civilizations of antiquity",
    category: "History",
    contentCount: 6,
    contents: [
      { id: 1, title: "Egyptian Pyramids", type: "video", duration: "12 min" },
      { id: 2, title: "Roman Empire", type: "article" },
      { id: 3, title: "Greek Philosophy", type: "video", duration: "15 min" },
      { id: 4, title: "Mesopotamian Culture", type: "article" },
      { id: 5, title: "Ancient China", type: "video", duration: "18 min" },
      { id: 6, title: "Civilization Quiz", type: "quiz" }
    ]
  },
  {
    id: 2,
    title: "Renaissance Art",
    description: "Masters of the Renaissance period",
    category: "Art",
    contentCount: 5,
    contents: [
      { id: 7, title: "Leonardo da Vinci", type: "video", duration: "20 min" },
      { id: 8, title: "Michelangelo's Works", type: "article" },
      { id: 9, title: "Renaissance Techniques", type: "video", duration: "14 min" },
      { id: 10, title: "Patron System", type: "article" },
      { id: 11, title: "Art History Quiz", type: "quiz" }
    ]
  },
  {
    id: 3,
    title: "Modern Physics",
    description: "Understanding quantum mechanics and relativity",
    category: "Science",
    contentCount: 6,
    contents: [
      { id: 12, title: "Quantum Theory", type: "video", duration: "25 min" },
      { id: 13, title: "Einstein's Relativity", type: "article" },
      { id: 14, title: "Particle Physics", type: "video", duration: "22 min" },
      { id: 15, title: "Wave-Particle Duality", type: "article" },
      { id: 16, title: "Schrödinger's Cat", type: "video", duration: "16 min" },
      { id: 17, title: "Physics Quiz", type: "quiz" }
    ]
  },
  {
    id: 4,
    title: "World Literature",
    description: "Classic works from around the globe",
    category: "Literature",
    contentCount: 5,
    contents: [
      { id: 18, title: "Shakespeare's Plays", type: "video", duration: "30 min" },
      { id: 19, title: "Russian Novels", type: "article" },
      { id: 20, title: "Japanese Poetry", type: "video", duration: "18 min" },
      { id: 21, title: "Latin American Magic Realism", type: "article" },
      { id: 22, title: "Literature Quiz", type: "quiz" }
    ]
  },
  {
    id: 5,
    title: "Economics Fundamentals",
    description: "Basic principles of economic theory",
    category: "Economics",
    contentCount: 6,
    contents: [
      { id: 23, title: "Supply and Demand", type: "video", duration: "15 min" },
      { id: 24, title: "Market Structures", type: "article" },
      { id: 25, title: "Monetary Policy", type: "video", duration: "20 min" },
      { id: 26, title: "Fiscal Policy", type: "article" },
      { id: 27, title: "International Trade", type: "video", duration: "18 min" },
      { id: 28, title: "Economics Quiz", type: "quiz" }
    ]
  },
  {
    id: 6,
    title: "Environmental Science",
    description: "Climate change and ecosystem studies",
    category: "Science",
    contentCount: 5,
    contents: [
      { id: 29, title: "Climate Systems", type: "video", duration: "22 min" },
      { id: 30, title: "Biodiversity Loss", type: "article" },
      { id: 31, title: "Renewable Energy", type: "video", duration: "17 min" },
      { id: 32, title: "Conservation Biology", type: "article" },
      { id: 33, title: "Environment Quiz", type: "quiz" }
    ]
  },
  {
    id: 7,
    title: "Philosophy Ethics",
    description: "Moral philosophy and ethical frameworks",
    category: "Philosophy",
    contentCount: 6,
    contents: [
      { id: 34, title: "Utilitarianism", type: "video", duration: "19 min" },
      { id: 35, title: "Deontological Ethics", type: "article" },
      { id: 36, title: "Virtue Ethics", type: "video", duration: "16 min" },
      { id: 37, title: "Applied Ethics", type: "article" },
      { id: 38, title: "Moral Dilemmas", type: "video", duration: "21 min" },
      { id: 39, title: "Ethics Quiz", type: "quiz" }
    ]
  },
  {
    id: 8,
    title: "Computer Science",
    description: "Programming and algorithmic thinking",
    category: "Technology",
    contentCount: 5,
    contents: [
      { id: 40, title: "Data Structures", type: "video", duration: "28 min" },
      { id: 41, title: "Algorithm Analysis", type: "article" },
      { id: 42, title: "Object-Oriented Programming", type: "video", duration: "24 min" },
      { id: 43, title: "Database Design", type: "article" },
      { id: 44, title: "Programming Quiz", type: "quiz" }
    ]
  },
  {
    id: 9,
    title: "Political Science",
    description: "Government systems and political theory",
    category: "Politics",
    contentCount: 6,
    contents: [
      { id: 45, title: "Democratic Systems", type: "video", duration: "23 min" },
      { id: 46, title: "Constitutional Law", type: "article" },
      { id: 47, title: "International Relations", type: "video", duration: "26 min" },
      { id: 48, title: "Political Ideologies", type: "article" },
      { id: 49, title: "Electoral Systems", type: "video", duration: "19 min" },
      { id: 50, title: "Politics Quiz", type: "quiz" }
    ]
  },
  {
    id: 10,
    title: "Psychology Basics",
    description: "Human behavior and mental processes",
    category: "Psychology",
    contentCount: 5,
    contents: [
      { id: 51, title: "Cognitive Psychology", type: "video", duration: "21 min" },
      { id: 52, title: "Behavioral Theories", type: "article" },
      { id: 53, title: "Social Psychology", type: "video", duration: "18 min" },
      { id: 54, title: "Developmental Psychology", type: "article" },
      { id: 55, title: "Psychology Quiz", type: "quiz" }
    ]
  },
  {
    id: 11,
    title: "Music Theory",
    description: "Harmony, rhythm, and musical structure",
    category: "Music",
    contentCount: 6,
    contents: [
      { id: 56, title: "Scales and Modes", type: "video", duration: "17 min" },
      { id: 57, title: "Chord Progressions", type: "article" },
      { id: 58, title: "Rhythm Patterns", type: "video", duration: "14 min" },
      { id: 59, title: "Musical Forms", type: "article" },
      { id: 60, title: "Composition Techniques", type: "video", duration: "22 min" },
      { id: 61, title: "Music Theory Quiz", type: "quiz" }
    ]
  },
  {
    id: 12,
    title: "Mathematics",
    description: "Advanced mathematical concepts",
    category: "Mathematics",
    contentCount: 5,
    contents: [
      { id: 62, title: "Calculus Fundamentals", type: "video", duration: "27 min" },
      { id: 63, title: "Linear Algebra", type: "article" },
      { id: 64, title: "Statistics", type: "video", duration: "20 min" },
      { id: 65, title: "Probability Theory", type: "article" },
      { id: 66, title: "Math Quiz", type: "quiz" }
    ]
  },
  {
    id: 13,
    title: "Astronomy",
    description: "Stars, planets, and the universe",
    category: "Science",
    contentCount: 6,
    contents: [
      { id: 67, title: "Solar System", type: "video", duration: "25 min" },
      { id: 68, title: "Stellar Evolution", type: "article" },
      { id: 69, title: "Galaxies and Beyond", type: "video", duration: "29 min" },
      { id: 70, title: "Black Holes", type: "article" },
      { id: 71, title: "Exoplanets", type: "video", duration: "18 min" },
      { id: 72, title: "Astronomy Quiz", type: "quiz" }
    ]
  },
  {
    id: 14,
    title: "Anthropology",
    description: "Human cultures and societies",
    category: "Anthropology",
    contentCount: 5,
    contents: [
      { id: 73, title: "Cultural Anthropology", type: "video", duration: "24 min" },
      { id: 74, title: "Archaeological Methods", type: "article" },
      { id: 75, title: "Human Evolution", type: "video", duration: "21 min" },
      { id: 76, title: "Linguistic Anthropology", type: "article" },
      { id: 77, title: "Anthropology Quiz", type: "quiz" }
    ]
  }
];

const Topics = () => {
  const [openTopics, setOpenTopics] = useState<number[]>([]);

  const toggleTopic = (topicId: number) => {
    setOpenTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-3 w-3" />;
      case 'article':
        return <BookOpen className="h-3 w-3" />;
      case 'quiz':
        return <Image className="h-3 w-3" />;
      default:
        return <BookOpen className="h-3 w-3" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-500/20 text-red-200';
      case 'article':
        return 'bg-blue-500/20 text-blue-200';
      case 'quiz':
        return 'bg-green-500/20 text-green-200';
      default:
        return 'bg-gray-500/20 text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-3">Bowl & Challenge Topics</h1>
          <p className="text-lg text-white/80">
            Comprehensive learning materials across 14 academic subjects
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {topicsData.map((topic) => (
            <Card key={topic.id} className="bg-white/10 backdrop-blur-lg border-white/20">
              <Collapsible 
                open={openTopics.includes(topic.id)} 
                onOpenChange={() => toggleTopic(topic.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors py-3">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-white text-lg">{topic.title}</CardTitle>
                          <Badge variant="outline" className="border-white/30 text-white/70 text-xs">
                            {topic.category}
                          </Badge>
                        </div>
                        <p className="text-white/80 text-sm">{topic.description}</p>
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 mt-1 text-xs">
                          {topic.contentCount} items
                        </Badge>
                      </div>
                      <ChevronDown 
                        className={`h-5 w-5 text-white transition-transform duration-200 ${
                          openTopics.includes(topic.id) ? 'rotate-180' : ''
                        }`} 
                      />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-3">
                    <div className="space-y-2">
                      {topic.contents.map((content) => (
                        <Link 
                          key={content.id} 
                          to={`/content/${content.id}`}
                          className="block"
                        >
                          <div className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 hover:scale-[1.02] rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  className={`${getContentTypeColor(content.type)} text-xs`}
                                >
                                  {getContentIcon(content.type)}
                                  <span className="ml-1 capitalize">{content.type}</span>
                                </Badge>
                                <span className="text-white font-medium text-sm">{content.title}</span>
                              </div>
                              {content.duration && (
                                <Badge variant="outline" className="border-white/30 text-white/70 text-xs">
                                  {content.duration}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Topics;
