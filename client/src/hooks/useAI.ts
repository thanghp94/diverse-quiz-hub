
import { useMutation, useQuery } from '@tanstack/react-query';

export interface AIContentRequest {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  contentType: 'explanation' | 'quiz' | 'summary' | 'practice';
  studentLevel?: string;
  context?: string;
}

export interface AIQuestionRequest {
  content: string;
  difficulty: 'easy' | 'hard';
  questionType: 'multiple_choice' | 'fill_blank' | 'essay';
  count?: number;
}

export interface AITutorRequest {
  studentQuestion: string;
  contentContext?: string;
  studentLevel?: string;
}

// Hook for generating AI content
export const useGenerateContent = () => {
  return useMutation({
    mutationFn: async (request: AIContentRequest) => {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate content');
      }
      
      const data = await response.json();
      return data.content;
    },
  });
};

// Hook for generating AI questions
export const useGenerateQuestions = () => {
  return useMutation({
    mutationFn: async (request: AIQuestionRequest) => {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }
      
      const data = await response.json();
      return data.questions;
    },
  });
};

// Hook for AI tutor help
export const useAITutor = () => {
  return useMutation({
    mutationFn: async (request: AITutorRequest) => {
      const response = await fetch('/api/ai/tutor-help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get tutor help');
      }
      
      const data = await response.json();
      return data.response;
    },
  });
};

// Hook for personalizing content
export const usePersonalizeContent = () => {
  return useMutation({
    mutationFn: async ({ content, studentId }: { content: string; studentId: string }) => {
      const response = await fetch('/api/ai/personalize-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, studentId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to personalize content');
      }
      
      const data = await response.json();
      return data.content;
    },
  });
};

// Hook for generating study plans
export const useGenerateStudyPlan = () => {
  return useMutation({
    mutationFn: async ({ studentId, goals }: { studentId: string; goals: string }) => {
      const response = await fetch('/api/ai/generate-study-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId, goals }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate study plan');
      }
      
      const data = await response.json();
      return data.studyPlan;
    },
  });
};
