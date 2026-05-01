import { QUESTIONS } from '../data/questions';

export type SimpleQuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface QuizQuestion {
  id: string;
  type: SimpleQuestionType;
  text: string;
  options: QuizOption[];
  modelAnswer: string;
  points: number;
  order: number;
}

export interface QuizData {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  dueAt: string;
  status: 'published' | 'draft';
  questions: QuizQuestion[];
}

// Convert seed questions (which may include multi_select) to the simpler editor format.
// question-level feedback goes onto the correct option so it's preserved.
function convertQuestions(quizId: string): QuizQuestion[] {
  return QUESTIONS
    .filter(q => q.quizId === quizId)
    .map(q => {
      const type: SimpleQuestionType =
        q.type === 'short_text' ? 'short_answer' : 'multiple_choice';

      const options: QuizOption[] = (q.options ?? []).map(o => ({
        id: o.id,
        text: o.text,
        isCorrect: o.isCorrect ?? false,
        // attach the question-level feedback string to the correct option
        feedback: o.isCorrect && q.feedback ? q.feedback : '',
      }));

      return {
        id: q.id,
        type,
        text: q.prompt,
        options,
        modelAnswer: q.correctAnswer ?? '',
        points: q.points,
        order: q.order,
      };
    });
}

const SEED: QuizData[] = [
  { id: 'quiz-1',   title: 'Quiz 1',              description: '', moduleId: 'mod-1', dueAt: '', status: 'draft', questions: convertQuestions('quiz-1')   },
  { id: 'quiz-2',   title: 'Quiz 2',              description: '', moduleId: 'mod-2', dueAt: '', status: 'draft', questions: convertQuestions('quiz-2')   },
  { id: 'quiz-3',   title: 'Quiz 3',              description: '', moduleId: 'mod-3', dueAt: '', status: 'draft', questions: convertQuestions('quiz-3')   },
  { id: 'quiz-inf', title: 'Infant Feeding Quiz', description: '', moduleId: 'mod-1', dueAt: '', status: 'draft', questions: convertQuestions('quiz-inf') },
];

const _quizzes: QuizData[] = [...SEED];

export const quizDataStore = {
  getAll: (): QuizData[] => [..._quizzes],
  getById: (id: string): QuizData | undefined => _quizzes.find(q => q.id === id),
  add: (quiz: QuizData): void => { _quizzes.push(quiz); },
  update: (quiz: QuizData): void => {
    const idx = _quizzes.findIndex(q => q.id === quiz.id);
    if (idx !== -1) _quizzes[idx] = quiz;
  },
  delete: (id: string): void => {
    const idx = _quizzes.findIndex(q => q.id === id);
    if (idx !== -1) _quizzes.splice(idx, 1);
  },
};
