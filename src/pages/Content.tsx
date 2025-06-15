
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, BookOpen, Image as ImageIcon } from "lucide-react";

// This would typically come from an API or database
const contentData: Record<string, any> = {
  "1": {
    id: 1,
    title: "Variables and Data Types",
    type: "video",
    duration: "15 min",
    image: "photo-1461749280684-dccba630e2f6",
    videoUrl: "https://www.youtube.com/embed/PkZNo7MFNFg",
    description: "Understanding JavaScript variables, strings, numbers, and boolean values",
    content: `
      <h2>What are Variables?</h2>
      <p>Variables are containers that store data values. In JavaScript, you can create variables using the <code>var</code>, <code>let</code>, or <code>const</code> keywords.</p>
      
      <h3>Data Types in JavaScript</h3>
      <ul>
        <li><strong>String:</strong> Text data enclosed in quotes</li>
        <li><strong>Number:</strong> Numeric values (integers and decimals)</li>
        <li><strong>Boolean:</strong> True or false values</li>
        <li><strong>Undefined:</strong> Variables that haven't been assigned a value</li>
        <li><strong>Null:</strong> Intentionally empty values</li>
      </ul>
      
      <h3>Examples</h3>
      <pre><code>let name = "John Doe";        // String
let age = 25;                 // Number
let isStudent = true;         // Boolean
let course;                   // Undefined
let grade = null;             // Null</code></pre>
    `
  },
  "2": {
    id: 2,
    title: "Functions and Scope",
    type: "video",
    duration: "20 min",
    image: "photo-1488590528505-98d2b5aba04b",
    videoUrl: "https://www.youtube.com/embed/xUI5Tsl2JpY",
    description: "How to create and use functions in JavaScript",
    content: `
      <h2>JavaScript Functions</h2>
      <p>Functions are reusable blocks of code that perform specific tasks. They help organize your code and avoid repetition.</p>
      
      <h3>Function Declaration</h3>
      <pre><code>function greetUser(name) {
    return "Hello, " + name + "!";
}</code></pre>
      
      <h3>Function Expression</h3>
      <pre><code>const greetUser = function(name) {
    return "Hello, " + name + "!";
};</code></pre>
      
      <h3>Arrow Functions</h3>
      <pre><code>const greetUser = (name) => {
    return "Hello, " + name + "!";
};</code></pre>
    `
  },
  "3": {
    id: 3,
    title: "DOM Manipulation",
    type: "article",
    image: "photo-1518770660439-4636190af475",
    description: "Interactive exercises on manipulating HTML elements with JavaScript",
    content: `
      <h2>Document Object Model (DOM)</h2>
      <p>The DOM is a programming interface for web documents. It represents the page so that programs can change the document structure, style, and content.</p>
      
      <h3>Selecting Elements</h3>
      <pre><code>// Select by ID
const element = document.getElementById('myId');

// Select by class
const elements = document.getElementsByClassName('myClass');

// Select using CSS selectors
const element = document.querySelector('.myClass');
const elements = document.querySelectorAll('div.myClass');</code></pre>
      
      <h3>Modifying Elements</h3>
      <pre><code>// Change text content
element.textContent = 'New text';

// Change HTML content
element.innerHTML = '<strong>Bold text</strong>';

// Change attributes
element.setAttribute('class', 'newClass');

// Change styles
element.style.color = 'red';</code></pre>
    `
  }
};

const Content = () => {
  const { id } = useParams<{ id: string }>();
  const content = id ? contentData[id] : null;

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Content Not Found</h1>
          <p className="text-white/80 mb-6">The requested content could not be found.</p>
          <Link to="/topics">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Topics
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-5 w-5" />;
      case 'article':
        return <BookOpen className="h-5 w-5" />;
      case 'quiz':
        return <ImageIcon className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/topics">
            <Button 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Topics
            </Button>
          </Link>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 overflow-hidden">
          <div className="relative">
            <img 
              src={`https://images.unsplash.com/${content.image}?w=800&h=400&fit=crop`}
              alt={content.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute top-4 right-4">
              <Badge className={`${getContentTypeColor(content.type)}`}>
                {getContentIcon(content.type)}
                <span className="ml-2 capitalize">{content.type}</span>
              </Badge>
            </div>
          </div>

          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-3xl">{content.title}</CardTitle>
              {content.duration && (
                <Badge variant="outline" className="border-white/30 text-white/70">
                  {content.duration}
                </Badge>
              )}
            </div>
            <p className="text-white/80 text-lg">{content.description}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {content.type === 'video' && content.videoUrl && (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={content.videoUrl}
                  title={content.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}

            <div 
              className="prose prose-invert max-w-none text-white/90"
              dangerouslySetInnerHTML={{ __html: content.content }}
              style={{
                fontSize: '16px',
                lineHeight: '1.6'
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Content;
