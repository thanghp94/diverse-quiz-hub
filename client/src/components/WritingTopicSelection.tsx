import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface WritingTopic {
  id: string;
  title: string;
  description: string;
  prompts: string[];
}

interface WritingTopicSelectionProps {
  category: string;
  onBack: () => void;
  onTopicSelect: (topicId: string) => void;
}

const topicsByCategory = {
  creative_writing: [
    {
      id: 'adventure_story',
      title: 'Adventure Story',
      description: 'Create an exciting story about an adventure in a faraway place.',
      prompts: [
        'Who is your main character and what makes them special?',
        'What challenge or quest are they facing?',
        'What surprising twist happens in your story?'
      ]
    },
    {
      id: 'my_superhero',
      title: 'My Superhero',
      description: 'Invent your own superhero with amazing powers.',
      prompts: [
        'What special powers does your superhero have?',
        'How did they get their powers?',
        'What problem does your superhero solve?'
      ]
    },
    {
      id: 'time_travel_adventure',
      title: 'Time Travel Adventure',
      description: 'Imagine you could travel to any time in history or the future.',
      prompts: [
        'Where and when would you go?',
        'What would you see or do there?',
        'Would you change anything or just observe?'
      ]
    },
    {
      id: 'magical_creature',
      title: 'Magical Creature',
      description: 'Create a magical creature that no one has ever seen before.',
      prompts: [
        'What does your creature look like?',
        'What special abilities does it have?',
        'Where does it live and what does it eat?'
      ]
    },
    {
      id: 'life_in_future',
      title: 'Life in the Future',
      description: 'Imagine what life might be like 100 years from now.',
      prompts: [
        'How will schools be different?',
        'What new technology might exist?',
        'What problems might be solved in the future?'
      ]
    },
    {
      id: 'mystery_story',
      title: 'Mystery Story',
      description: 'Write a mystery story where you solve a puzzling case.',
      prompts: [
        'What mysterious event needs to be solved?',
        'What clues do you discover along the way?',
        'Who turns out to be behind the mystery?'
      ]
    }
  ]
};

export const WritingTopicSelection = ({ category, onBack, onTopicSelect }: WritingTopicSelectionProps) => {
  const topics = topicsByCategory[category as keyof typeof topicsByCategory] || [];
  
  const getCategoryTitle = (cat: string) => {
    const titles = {
      creative_writing: 'Creative Writing Topics',
      personal_experience: 'Personal Experience Topics',
      opinions_ideas: 'Opinion & Ideas Topics',
      school_homework: 'School Homework Topics',
      free_writing: 'Free Writing Topics'
    };
    return titles[cat as keyof typeof titles] || 'Writing Topics';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to topics
          </Button>
          <h1 className="text-3xl font-bold text-purple-600">
            ✨ {getCategoryTitle(category)}
          </h1>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map((topic) => (
            <Card 
              key={topic.id}
              className="bg-white/80 backdrop-blur-sm border-purple-200 hover:border-purple-400 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
                <CardTitle className="text-purple-600 text-xl">
                  {topic.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">{topic.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-purple-600 mb-2">Ideas to get you started:</h4>
                  <ul className="space-y-1">
                    {topic.prompts.map((prompt, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-purple-400 mt-1">•</span>
                        {prompt}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  onClick={() => onTopicSelect(topic.id)}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                >
                  Write about this
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};