
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
  image: string;
  description: string;
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
    title: "Introduction to JavaScript",
    description: "Learn the fundamentals of JavaScript programming language",
    category: "Programming",
    contentCount: 4,
    contents: [
      {
        id: 1,
        title: "Variables and Data Types",
        type: "video",
        duration: "15 min",
        image: "photo-1461749280684-dccba630e2f6",
        description: "Understanding JavaScript variables, strings, numbers, and boolean values"
      },
      {
        id: 2,
        title: "Functions and Scope",
        type: "video",
        duration: "20 min",
        image: "photo-1488590528505-98d2b5aba04b",
        description: "How to create and use functions in JavaScript"
      },
      {
        id: 3,
        title: "DOM Manipulation",
        type: "article",
        image: "photo-1518770660439-4636190af475",
        description: "Interactive exercises on manipulating HTML elements with JavaScript"
      },
      {
        id: 4,
        title: "JavaScript Basics Quiz",
        type: "quiz",
        image: "photo-1649972904349-6e44c42644a7",
        description: "Test your knowledge of JavaScript fundamentals"
      }
    ]
  },
  {
    id: 2,
    title: "React Development",
    description: "Master modern React development with hooks and components",
    category: "Frontend",
    contentCount: 3,
    contents: [
      {
        id: 5,
        title: "React Components",
        type: "video",
        duration: "25 min",
        image: "photo-1581091226825-a6a2a5aee158",
        description: "Building reusable components in React"
      },
      {
        id: 6,
        title: "State Management with Hooks",
        type: "video",
        duration: "30 min",
        image: "photo-1461749280684-dccba630e2f6",
        description: "Using useState and useEffect hooks effectively"
      },
      {
        id: 7,
        title: "React Best Practices",
        type: "article",
        image: "photo-1488590528505-98d2b5aba04b",
        description: "Learn the best practices for React development"
      }
    ]
  },
  {
    id: 3,
    title: "Web Design Fundamentals",
    description: "Essential principles of modern web design and user experience",
    category: "Design",
    contentCount: 5,
    contents: [
      {
        id: 8,
        title: "Color Theory in Web Design",
        type: "video",
        duration: "18 min",
        image: "photo-1518770660439-4636190af475",
        description: "Understanding color psychology and application in web design"
      },
      {
        id: 9,
        title: "Typography Guidelines",
        type: "article",
        image: "photo-1649972904349-6e44c42644a7",
        description: "Choosing and implementing effective typography"
      },
      {
        id: 10,
        title: "Responsive Design Principles",
        type: "video",
        duration: "22 min",
        image: "photo-1581091226825-a6a2a5aee158",
        description: "Creating designs that work across all devices"
      },
      {
        id: 11,
        title: "UI/UX Design Quiz",
        type: "quiz",
        image: "photo-1461749280684-dccba630e2f6",
        description: "Test your understanding of design principles"
      },
      {
        id: 12,
        title: "Design Tools Overview",
        type: "article",
        image: "photo-1488590528505-98d2b5aba04b",
        description: "Overview of popular design tools and when to use them"
      }
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
        return <Play className="h-4 w-4" />;
      case 'article':
        return <BookOpen className="h-4 w-4" />;
      case 'quiz':
        return <Image className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
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
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Learning Topics</h1>
          <p className="text-xl text-white/80">
            Explore our comprehensive learning materials organized by topic
          </p>
        </div>

        <div className="grid gap-6">
          {topicsData.map((topic) => (
            <Card key={topic.id} className="bg-white/10 backdrop-blur-lg border-white/20">
              <Collapsible 
                open={openTopics.includes(topic.id)} 
                onOpenChange={() => toggleTopic(topic.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-white text-xl">{topic.title}</CardTitle>
                          <Badge variant="outline" className="border-white/30 text-white/70">
                            {topic.category}
                          </Badge>
                        </div>
                        <p className="text-white/80">{topic.description}</p>
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 mt-2">
                          {topic.contentCount} items
                        </Badge>
                      </div>
                      <ChevronDown 
                        className={`h-6 w-6 text-white transition-transform duration-200 ${
                          openTopics.includes(topic.id) ? 'rotate-180' : ''
                        }`} 
                      />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {topic.contents.map((content) => (
                        <Link 
                          key={content.id} 
                          to={`/content/${content.id}`}
                          className="block"
                        >
                          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                            <div className="relative">
                              <img 
                                src={`https://images.unsplash.com/${content.image}?w=400&h=200&fit=crop`}
                                alt={content.title}
                                className="w-full h-32 object-cover rounded-t-lg"
                              />
                              <Badge 
                                className={`absolute top-2 right-2 ${getContentTypeColor(content.type)}`}
                              >
                                {getContentIcon(content.type)}
                                <span className="ml-1 capitalize">{content.type}</span>
                              </Badge>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="text-white font-semibold mb-2">{content.title}</h3>
                              <p className="text-white/70 text-sm mb-2">{content.description}</p>
                              {content.duration && (
                                <Badge variant="outline" className="border-white/30 text-white/70 text-xs">
                                  {content.duration}
                                </Badge>
                              )}
                            </CardContent>
                          </Card>
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
