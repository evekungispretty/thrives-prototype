import { useState } from 'react';
import { CheckCircle2, Clock, Trophy, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { ParticipantShell } from '../../components/layout/ParticipantShell';
import { Card } from '../../components/ui/Card';
import { ProgressBar, CircleProgress } from '../../components/ui/ProgressBar';
import { TopicBadge, ModuleStatusBadge } from '../../components/ui/Badge';
import { MODULES } from '../../data/modules';
import { DEMO_PARTICIPANT } from '../../data/users';
import { quizStore } from '../../stores/quizStore';
import { QUESTIONS } from '../../data/questions';
import type { Question } from '../../types';

export function ParticipantProgress() {
  const user = DEMO_PARTICIPANT;
  const publishedMods = MODULES.filter(m => m.publishState === 'published');
  const completedMods = user.progress.filter(p => p.status === 'completed').length;
  const totalLessons = publishedMods.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = user.progress.reduce((sum, p) => sum + p.completedLessons, 0);

  const quizResults = user.progress.filter(p => p.quizScore !== undefined);
  const totalQuizScore = quizResults.reduce((sum, p) => sum + (p.quizScore ?? 0), 0);
  const totalQuizMax = quizResults.reduce((sum, p) => sum + (p.quizMaxScore ?? 0), 0);
  const avgScore = totalQuizMax > 0 ? Math.round((totalQuizScore / totalQuizMax) * 100) : 0;

  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);

  return (
    <ParticipantShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">My Progress</h1>
        <p className="text-neutral-500 mt-1 text-sm">
          Your learning journey for {user.cohort}
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Modules Completed', value: `${completedMods} / ${publishedMods.length}`, icon: <CheckCircle2 size={18} />, pct: Math.round((completedMods/publishedMods.length)*100) },
          { label: 'Lessons Completed', value: `${completedLessons} / ${totalLessons}`, icon: <BookOpen size={18} />, pct: Math.round((completedLessons/totalLessons)*100) },
          { label: 'Quiz Average', value: totalQuizMax > 0 ? `${avgScore}%` : '—', icon: <Trophy size={18} />, pct: avgScore },
          { label: 'Time Spent', value: '~2h 10m', icon: <Clock size={18} />, pct: null },
        ].map(s => (
          <Card key={s.label}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-brand-navy">{s.icon}</span>
              <p className="text-xs text-neutral-500 font-medium">{s.label}</p>
            </div>
            <p className="text-xl font-bold text-neutral-900">{s.value}</p>
            {s.pct !== null && (
              <ProgressBar value={s.pct} size="sm" className="mt-2" />
            )}
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Module detail */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-semibold text-neutral-800 mb-4">Module Progress</h2>
          <div className="flex flex-col gap-3">
            {publishedMods.map(mod => {
              const prog = user.progress.find(p => p.moduleId === mod.id);
              const status = prog?.status ?? 'not_started';
              const pct = prog ? Math.round((prog.completedLessons / prog.totalLessons) * 100) : 0;
              const attempt = quizStore.getForUser(user.id).find(a => a.moduleId === mod.id);
              const isOpen = expandedQuiz === mod.id;
              const modQuestions = QUESTIONS.filter(q => q.moduleId === mod.id);

              return (
                <Card key={mod.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <p className="text-sm font-semibold text-neutral-800">{mod.title}</p>
                        <TopicBadge tag={mod.tag} />
                        <ModuleStatusBadge status={status} />
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <ProgressBar value={pct} className="flex-1" />
                        <span className="text-xs text-neutral-500 tabular-nums flex-shrink-0">{pct}%</span>
                      </div>

                      <p className="text-xs text-neutral-500">
                        {prog?.completedLessons ?? 0} of {mod.lessons.length} lessons complete
                        {prog?.completedAt && ` · Completed ${formatDate(prog.completedAt)}`}
                      </p>
                    </div>

                    {/* Quiz score */}
                    {prog?.quizScore !== undefined && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-brand-navy">{prog.quizScore}/{prog.quizMaxScore}</p>
                        <p className="text-xs text-neutral-400">Quiz score</p>
                      </div>
                    )}
                  </div>

                  {/* Quiz responses toggle */}
                  {attempt && modQuestions.length > 0 && (
                    <div className="mt-3 border-t border-neutral-100 pt-3">
                      <button
                        onClick={() => setExpandedQuiz(isOpen ? null : mod.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-brand-navy hover:text-brand-navy-dark transition-colors"
                      >
                        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {isOpen ? 'Hide quiz responses' : 'View quiz responses'}
                      </button>

                      {isOpen && (
                        <div className="mt-3 flex flex-col gap-4">
                          {modQuestions.map((q, idx) => {
                            const result = attempt.results.find(r => r.questionId === q.id);
                            return (
                              <QuizResponseItem
                                key={q.id}
                                index={idx + 1}
                                question={q}
                                answer={result?.answer}
                                score={result?.score}
                                isCorrect={result?.isCorrect}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right: completion ring */}
        <div className="flex flex-col gap-6">
          <Card className="text-center">
            <p className="text-sm font-medium text-neutral-700 mb-4">Overall Completion</p>
            <div className="flex justify-center mb-3">
              <div className="relative">
                <CircleProgress
                  value={Math.round((completedMods / publishedMods.length) * 100)}
                  size={120}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-neutral-900">
                    {Math.round((completedMods / publishedMods.length) * 100)}%
                  </span>
                  <span className="text-xs text-neutral-400">{completedMods}/{publishedMods.length}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-neutral-400">modules completed</p>
          </Card>

          {/* Quiz score summary */}
          {quizResults.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-neutral-800 mb-3">Quiz Scores</h3>
              <div className="flex flex-col gap-2.5">
                {quizResults.map(p => {
                  const mod = MODULES.find(m => m.id === p.moduleId);
                  if (!mod) return null;
                  const pct = Math.round(((p.quizScore ?? 0) / (p.quizMaxScore ?? 1)) * 100);
                  return (
                    <div key={p.moduleId}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-neutral-600 truncate pr-2">{mod.title}</p>
                        <span className="text-xs font-semibold text-brand-navy flex-shrink-0">
                          {p.quizScore}/{p.quizMaxScore}
                        </span>
                      </div>
                      <ProgressBar value={pct} size="sm" />
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </ParticipantShell>
  );
}

// ─── Quiz response item ────────────────────────────────────────────────────────

function QuizResponseItem({
  index,
  question,
  answer,
  score,
  isCorrect,
}: {
  index: number;
  question: Question;
  answer?: string | string[];
  score?: number;
  isCorrect?: boolean;
}) {
  const scoreLabel = score !== undefined
    ? `${score}/${question.points} pt${question.points !== 1 ? 's' : ''}`
    : null;

  const statusColor =
    isCorrect === true ? 'text-green-600 bg-green-50' :
    isCorrect === false ? 'text-red-500 bg-red-50' :
    'text-amber-600 bg-amber-50'; // undefined = open-ended / partial

  return (
    <div className="text-sm">
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Q{index}</p>
        {scoreLabel && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor}`}>
            {scoreLabel}
          </span>
        )}
      </div>
      <p className="text-sm text-neutral-800 mb-2 leading-snug">{question.prompt}</p>
      <div className="rounded-lg bg-neutral-50 border border-neutral-100 px-3 py-2">
        <p className="text-xs text-neutral-500 mb-0.5 font-medium">Your answer</p>
        <AnswerDisplay question={question} answer={answer} />
      </div>
      {/* Show model answer for short_text */}
      {question.type === 'short_text' && question.correctAnswer && (
        <div className="mt-1.5 rounded-lg bg-brand-mint-pale border border-brand-mint px-3 py-2">
          <p className="text-xs text-neutral-500 mb-0.5 font-medium">Model answer</p>
          <p className="text-sm text-neutral-700">{question.correctAnswer}</p>
        </div>
      )}
    </div>
  );
}

function AnswerDisplay({ question, answer }: { question: Question; answer?: string | string[] }) {
  if (answer === undefined || answer === null) {
    return <p className="text-sm text-neutral-400 italic">No answer recorded</p>;
  }

  if (question.type === 'multiple_choice' && typeof answer === 'string') {
    const opt = question.options?.find(o => o.id === answer);
    return (
      <div className="flex items-center gap-1.5">
        {opt?.isCorrect
          ? <CheckCircle2 size={13} className="text-green-500 flex-shrink-0" />
          : <span className="w-3.5 h-3.5 rounded-full border-2 border-red-400 flex-shrink-0" />}
        <p className="text-sm text-neutral-800">{opt?.text ?? answer}</p>
      </div>
    );
  }

  if (question.type === 'multi_select' && Array.isArray(answer)) {
    const correctIds = new Set(question.options?.filter(o => o.isCorrect).map(o => o.id));
    return (
      <ul className="flex flex-col gap-1">
        {(answer as string[]).map(id => {
          const opt = question.options?.find(o => o.id === id);
          const correct = correctIds.has(id);
          return (
            <li key={id} className="flex items-center gap-1.5">
              {correct
                ? <CheckCircle2 size={13} className="text-green-500 flex-shrink-0" />
                : <span className="w-3.5 h-3.5 rounded-full border-2 border-red-400 flex-shrink-0" />}
              <span className="text-sm text-neutral-800">{opt?.text ?? id}</span>
            </li>
          );
        })}
        {/* Show missed correct options */}
        {question.options?.filter(o => o.isCorrect && !(answer as string[]).includes(o.id)).map(o => (
          <li key={o.id} className="flex items-center gap-1.5 opacity-50">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-neutral-300 flex-shrink-0" />
            <span className="text-sm text-neutral-500 line-through">{o.text}</span>
            <span className="text-xs text-neutral-400">(missed)</span>
          </li>
        ))}
      </ul>
    );
  }

  if (question.type === 'matching' && typeof answer === 'string') {
    const pairs = answer.split('|').map(p => {
      const colonIdx = p.indexOf(':');
      return { pairId: p.slice(0, colonIdx), right: p.slice(colonIdx + 1) };
    });
    return (
      <ul className="flex flex-col gap-1.5">
        {question.pairs?.map(pair => {
          const matched = pairs.find(p => p.pairId === pair.id);
          const correct = matched?.right === pair.right;
          return (
            <li key={pair.id} className="flex items-center gap-2 text-sm">
              <CheckCircle2 size={13} className={correct ? 'text-green-500 flex-shrink-0' : 'text-red-400 flex-shrink-0'} />
              <span className="text-neutral-600 font-medium">{pair.left}</span>
              <span className="text-neutral-400">→</span>
              <span className="text-neutral-800">{matched?.right ?? '—'}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  if (question.type === 'short_text' || question.type === 'scale') {
    return <p className="text-sm text-neutral-800 italic">"{String(answer)}"</p>;
  }

  return <p className="text-sm text-neutral-800">{String(answer)}</p>;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
