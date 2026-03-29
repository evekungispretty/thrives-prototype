import type { QuizAttempt } from '../types';
import { ALL_PARTICIPANTS, DEMO_PARTICIPANT } from '../data/users';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Q_IDS = ['q-f-1','q-f-2','q-f-3','q-f-4','q-f-5','q-f-6','q-f-7','q-f-8','q-f-9','q-f-10','q-f-11','q-f-12'];
const CORRECT = ['c','c','d','a','d','d','d','c','c','c','c','d'];

function makeAttempt(
  id: string,
  userId: string,
  completedAt: string,
  answers: string[],
): QuizAttempt {
  const results = Q_IDS.map((qId, i) => ({
    questionId: qId,
    answer: answers[i],
    isCorrect: answers[i] === CORRECT[i],
    score: answers[i] === CORRECT[i] ? 1 : 0,
  }));
  const totalScore = results.reduce((s, r) => s + (r.score ?? 0), 0);
  return {
    id,
    userId,
    moduleId: 'mod-1',
    quizId: 'quiz-1',
    completedAt,
    results,
    totalScore,
    maxScore: 12,
    passed: totalScore / 12 >= 0.67,
  };
}

// ─── Seeded mock data ─────────────────────────────────────────────────────────
// Correct answers: c c d a d d d c c c c d

const SEEDED: QuizAttempt[] = [
  // Demo participant (Maria Santos, user-demo) — same answers as user-1
  makeAttempt('att-demo', 'user-demo', '2024-02-14', ['c','c','a','a','d','a','d','c','c','c','c','d']),
  // Maria Santos (admin view) — 10/12 (misses Q3 "all of above", Q6 "none are safe")
  makeAttempt('att-1', 'user-1', '2024-02-14', ['c','c','a','a','d','a','d','c','c','c','c','d']),
  // DeShawn Williams — 10/12 (misses Q3, Q7 juice timing)
  makeAttempt('att-2', 'user-2', '2024-02-20', ['c','c','b','a','d','d','c','c','c','c','c','d']),
  // Priya Mehta — 12/12 (perfect)
  makeAttempt('att-3', 'user-3', '2024-01-28', ['c','c','d','a','d','d','d','c','c','c','c','d']),
  // Jasmine Okafor — 8/12 (misses Q1 fullness cue, Q3, Q6, Q11 allergies)
  makeAttempt('att-4', 'user-4', '2023-09-30', ['b','c','a','a','d','a','d','c','c','c','d','d']),
  // Tomás Rivera — 9/12 (misses Q2 breastfeed duration, Q3, Q8 drinks)
  makeAttempt('att-5', 'user-5', '2024-02-22', ['c','b','a','a','d','d','d','b','c','c','c','d']),
  // Amanda Chen — 11/12 (misses Q7 juice timing)
  makeAttempt('att-6', 'user-6', '2023-09-10', ['c','c','d','a','d','d','c','c','c','c','c','d']),
  // Kevin Nguyen — 7/12 (misses Q2, Q3, Q6, Q7, Q11)
  makeAttempt('att-8', 'user-8', '2023-10-05', ['c','b','a','a','d','a','c','c','c','c','b','d']),
];

// ─── Store ────────────────────────────────────────────────────────────────────

const _attempts: QuizAttempt[] = [...SEEDED];

export const quizStore = {
  getAll: (): QuizAttempt[] => [..._attempts],
  getForModule: (moduleId: string): QuizAttempt[] =>
    _attempts.filter(a => a.moduleId === moduleId),
  getForUser: (userId: string): QuizAttempt[] =>
    _attempts.filter(a => a.userId === userId),
  add: (attempt: QuizAttempt): void => { _attempts.push(attempt); },
};

// ─── Participant lookup ───────────────────────────────────────────────────────

export function getParticipantName(userId: string): string {
  if (userId === DEMO_PARTICIPANT.id) return DEMO_PARTICIPANT.name;
  return ALL_PARTICIPANTS.find(u => u.id === userId)?.name ?? 'Unknown';
}

export function getParticipantCohort(userId: string): string {
  if (userId === DEMO_PARTICIPANT.id) return DEMO_PARTICIPANT.cohort;
  return ALL_PARTICIPANTS.find(u => u.id === userId)?.cohort ?? '';
}
