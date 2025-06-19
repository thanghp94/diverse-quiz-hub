
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export class AIService {
  
  async generateContent(request: AIContentRequest): Promise<string> {
    try {
      const systemPrompt = `You are an expert educational content creator. Create ${request.contentType} content about ${request.topic} at ${request.difficulty} difficulty level. 
      ${request.studentLevel ? `The student is at ${request.studentLevel} level.` : ''}
      Make the content engaging, clear, and educational.`;

      const userPrompt = `Create ${request.contentType} content about: ${request.topic}
      ${request.context ? `Additional context: ${request.context}` : ''}
      
      Requirements:
      - Difficulty: ${request.difficulty}
      - Content type: ${request.contentType}
      - Include relevant examples and explanations
      - Format for easy reading`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating content:', error);
      throw new Error('Failed to generate content');
    }
  }

  async generateQuestions(request: AIQuestionRequest): Promise<any[]> {
    try {
      const count = request.count || 5;
      const systemPrompt = `You are an expert quiz creator. Generate ${count} ${request.questionType} questions based on the provided content at ${request.difficulty} difficulty level.
      
      For multiple_choice: Return JSON array with {question, options: [a,b,c,d], correct_answer, explanation}
      For fill_blank: Return JSON array with {question_with_blank, correct_answer, explanation}
      For essay: Return JSON array with {question, sample_points, rubric}`;

      const userPrompt = `Content: ${request.content}
      
      Generate ${count} ${request.questionType} questions at ${request.difficulty} difficulty.
      Return valid JSON only.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 2000
      });

      const content = response.choices[0].message.content || '[]';
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating questions:', error);
      throw new Error('Failed to generate questions');
    }
  }

  async provideTutorHelp(request: AITutorRequest): Promise<string> {
    try {
      const systemPrompt = `You are a helpful AI tutor. Provide clear, encouraging, and educational responses to student questions.
      ${request.studentLevel ? `The student is at ${request.studentLevel} level.` : ''}
      
      Guidelines:
      - Be patient and encouraging
      - Break down complex concepts
      - Provide examples when helpful
      - Ask follow-up questions to check understanding`;

      const userPrompt = `Student question: ${request.studentQuestion}
      ${request.contentContext ? `Related content context: ${request.contentContext}` : ''}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 1000
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error providing tutor help:', error);
      throw new Error('Failed to provide tutoring assistance');
    }
  }

  async personalizeContent(content: string, studentData: any): Promise<string> {
    try {
      const systemPrompt = `You are an AI that personalizes educational content based on student performance and preferences.
      
      Analyze the student's data and adapt the content accordingly:
      - If student struggles with certain topics, provide more scaffolding
      - If student excels, provide more challenging extensions
      - Adapt to learning style preferences`;

      const userPrompt = `Original content: ${content}
      
      Student data: ${JSON.stringify(studentData)}
      
      Personalize this content for this specific student.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.6,
        max_tokens: 1500
      });

      return response.choices[0].message.content || content;
    } catch (error) {
      console.error('Error personalizing content:', error);
      return content; // Return original content if personalization fails
    }
  }

  async generateStudyPlan(studentId: string, topics: string[], goals: string): Promise<any> {
    try {
      const systemPrompt = `You are an AI educational planner. Create personalized study plans based on student goals and available topics.
      
      Return a JSON study plan with:
      - weekly_schedule: array of weeks with topics and activities
      - milestones: key checkpoints
      - adaptive_recommendations: suggestions based on progress`;

      const userPrompt = `Create a study plan for student ${studentId}
      
      Available topics: ${topics.join(', ')}
      Student goals: ${goals}
      
      Return valid JSON only.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 2000
      });

      const content = response.choices[0].message.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating study plan:', error);
      throw new Error('Failed to generate study plan');
    }
  }
}

export const aiService = new AIService();
