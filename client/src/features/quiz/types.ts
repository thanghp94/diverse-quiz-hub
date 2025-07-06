import type { Question as BackendQuestion, QuestionResponse, BaseQuestion } from "@shared/schema";

// Frontend-specific question interface that extends the base question
export interface Question extends BaseQuestion {
  // Frontend-specific fields for quiz UI
  pairs?: { left: string; right: string }[];
  blanks?: { text: string; answers: string[] }[];
  categories?: { name: string; items: string[] }[];
  items?: string[];
}

// Helper type for quiz question types based on backend question_type field
export type QuizQuestionType = 'multiple-choice' | 'matching' | 'fill-blank' | 'categorize';

// Re-export backend types with different names to avoid circular imports
export type { BackendQuestion as DatabaseQuestion, QuestionResponse as ApiQuestionResponse };

// Utility function to convert backend question to frontend question format
export function convertBackendQuestion(backendQuestion: BackendQuestion): Question {
  const questionType = backendQuestion.question_type?.toLowerCase() as QuizQuestionType;

  const baseQuestion: Question = {
    id: backendQuestion.id,
    type: questionType || 'multiple-choice',
    question: backendQuestion.noi_dung || '',
    options: [
      backendQuestion.cau_tra_loi_1,
      backendQuestion.cau_tra_loi_2,
      backendQuestion.cau_tra_loi_3,
      backendQuestion.cau_tra_loi_4
    ].filter((option): option is string => Boolean(option)),
    correct: backendQuestion.correct_choice || undefined
  };

  // Add type-specific fields
  switch (questionType) {
    case 'matching':
      baseQuestion.pairs = [
        { left: backendQuestion.cau_tra_loi_1 || '', right: backendQuestion.cau_tra_loi_2 || '' },
        { left: backendQuestion.cau_tra_loi_3 || '', right: backendQuestion.cau_tra_loi_4 || '' }
      ].filter(pair => pair.left && pair.right);
      break;
    case 'fill-blank':
      baseQuestion.blanks = [{
        text: backendQuestion.noi_dung || '',
        answers: [backendQuestion.correct_choice || ''].filter(Boolean)
      }];
      break;
    case 'categorize':
      // For categorize questions, we'll need to parse the answers into categories
      // This is just an example - adjust based on your actual data structure
      const categories = new Map<string, string[]>();
      [
        backendQuestion.cau_tra_loi_1,
        backendQuestion.cau_tra_loi_2,
        backendQuestion.cau_tra_loi_3,
        backendQuestion.cau_tra_loi_4
      ].forEach(answer => {
        if (answer) {
          const parts = answer.split(':').map(s => s.trim());
          if (parts.length >= 2) {
            const [category, item] = parts;
            if (!categories.has(category)) {
              categories.set(category, []);
            }
            categories.get(category)?.push(item);
          }
        }
      });
      baseQuestion.categories = Array.from(categories.entries()).map(([name, items]) => ({
        name,
        items
      }));
      break;
  }

  return baseQuestion;
}
