import type { GoalAttempt } from '../types';

const _attempts: GoalAttempt[] = [];

export const goalsStore = {
  getAll: (): GoalAttempt[] => [..._attempts],
  getForUser: (userId: string): GoalAttempt[] =>
    _attempts.filter(a => a.userId === userId),
  getForModule: (moduleId: string): GoalAttempt[] =>
    _attempts.filter(a => a.moduleId === moduleId),
  getForUserModule: (userId: string, moduleId: string): GoalAttempt | undefined =>
    [..._attempts].reverse().find(a => a.userId === userId && a.moduleId === moduleId),
  add: (attempt: GoalAttempt): void => { _attempts.push(attempt); },
};
