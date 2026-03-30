import { useState } from 'react';
import { useParams, Link } from 'wouter';
import {
  CheckCircle2, XCircle, ArrowLeft, Trophy, BookOpen,
  HelpCircle, Lightbulb, ExternalLink, AlertCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { ParticipantShell } from '../../components/layout/ParticipantShell';
import { Card } from '../../components/ui/Card';
import { MODULES } from '../../data/modules';
import { DEMO_PARTICIPANT } from '../../data/users';
import { quizStore } from '../../stores/quizStore';
import { QUESTIONS } from '../../data/questions';
import type { Question } from '../../types';

type Tab = 'summary' | 'review' | 'resources';

export function QuizReview() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('summary');

  const mod = MODULES.find(m => m.id === id);
  const attempt = quizStore.getForUser(DEMO_PARTICIPANT.id).find(a => a.moduleId === id);
  const questions = QUESTIONS.filter(q => q.moduleId === id);

  if (!mod || !attempt) {
    return (
      <ParticipantShell>
        <div className="text-center py-20">
          <p className="text-neutral-500">No quiz results found for this module.</p>
          <Link href="/participant/progress" className="text-brand-navy text-sm font-medium mt-3 inline-block hover:underline">
            ← Back to Progress
          </Link>
        </div>
      </ParticipantShell>
    );
  }

  const pct = Math.round((attempt.totalScore / attempt.maxScore) * 100);
  const correctCount = attempt.results.filter(r => r.isCorrect).length;
  const incorrectCount = attempt.results.filter(r => r.isCorrect === false).length;
  const openCount = questions.length - correctCount - incorrectCount;

  const allResources = mod.lessons.flatMap(l =>
    (l.resources ?? []).map(r => ({ ...r, lessonTitle: l.title }))
  );

  const TABS: { id: Tab; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'review', label: 'Review Questions' },
    { id: 'resources', label: 'Resources' },
  ];

  return (
    <ParticipantShell>
      {/* Back */}
      <Link
        href="/participant/progress"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-5"
      >
        <ArrowLeft size={15} />
        Back to My Progress
      </Link>

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-medium text-brand-teal uppercase tracking-widest mb-1">{mod.title}</p>
        <h1 className="text-2xl font-bold text-neutral-900">Quiz Review</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Completed {formatDate(attempt.completedAt)} · {questions.length} questions
        </p>
      </div>

      {/* Score hero */}
      <div className={clsx(
        'rounded-2xl p-6 mb-6 flex flex-wrap items-center gap-6',
        attempt.passed ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
      )}>
        <div className={clsx(
          'w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0',
          attempt.passed ? 'bg-green-100' : 'bg-amber-100'
        )}>
          <Trophy size={28} className={attempt.passed ? 'text-green-600' : 'text-amber-600'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={clsx('text-3xl font-bold', attempt.passed ? 'text-green-700' : 'text-amber-700')}>
            {attempt.totalScore} / {attempt.maxScore}
            <span className="text-lg font-semibold ml-2 opacity-70">({pct}%)</span>
          </p>
        </div>
        <div className="flex gap-4 flex-shrink-0">
          <Stat icon={<CheckCircle2 size={15} className="text-green-500" />} label="Correct" value={correctCount} />
          <Stat icon={<XCircle size={15} className="text-red-400" />} label="Incorrect" value={incorrectCount} />
          {openCount > 0 && (
            <Stat icon={<HelpCircle size={15} className="text-amber-400" />} label="Open-ended" value={openCount} />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 mb-6">
        <nav className="flex gap-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={clsx(
                'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
                activeTab === t.id
                  ? 'border-black text-black'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'summary' && (
        <SummaryTab questions={questions} attempt={attempt} />
      )}
      {activeTab === 'review' && (
        <ReviewTab questions={questions} attempt={attempt} />
      )}
      {activeTab === 'resources' && (
        <ResourcesTab resources={allResources} mod={mod} />
      )}
    </ParticipantShell>
  );
}

// ─── Summary tab ─────────────────────────────────────────────────────────────

function SummaryTab({ questions, attempt }: { questions: Question[]; attempt: ReturnType<typeof quizStore.getForUser>[number] }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-neutral-500 mb-1">
        Here's a quick look at each question. Switch to <strong>Review Questions</strong> for full explanations.
      </p>
      {questions.map((q, idx) => {
        const result = attempt.results.find(r => r.questionId === q.id);
        const correct = result?.isCorrect;
        return (
          <div
            key={q.id}
            className={clsx(
              'flex items-start gap-4 p-4 rounded-xl border',
              correct === true ? 'bg-green-50 border-green-100' :
              correct === false ? 'bg-red-50 border-red-100' :
              'bg-neutral-50 border-neutral-100'
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {correct === true && <CheckCircle2 size={18} className="text-green-500" />}
              {correct === false && <XCircle size={18} className="text-red-400" />}
              {correct === undefined && <HelpCircle size={18} className="text-amber-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-0.5">Q{idx + 1}</p>
              <p className="text-sm text-neutral-800 leading-snug">{q.prompt}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <span className={clsx(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                correct === true ? 'bg-green-100 text-green-700' :
                correct === false ? 'bg-red-100 text-red-600' :
                'bg-amber-100 text-amber-700'
              )}>
                {result?.score ?? 0}/{q.points}pt{q.points !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Review tab ───────────────────────────────────────────────────────────────

function ReviewTab({ questions, attempt }: { questions: Question[]; attempt: ReturnType<typeof quizStore.getForUser>[number] }) {
  return (
    <div className="flex flex-col gap-6">
      {questions.map((q, idx) => {
        const result = attempt.results.find(r => r.questionId === q.id);
        return (
          <ReviewCard
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
  );
}

function ReviewCard({
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
  const [activeSection, setActiveSection] = useState<'your' | 'correct' | 'why'>('your');

  const statusColor =
    isCorrect === true ? 'text-green-600 bg-green-50 border-green-200' :
    isCorrect === false ? 'text-red-500 bg-red-50 border-red-200' :
    'text-amber-600 bg-amber-50 border-amber-200';

  const SECTIONS = [
    { id: 'your' as const, label: 'Your Answer' },
    ...(isCorrect === false ? [{ id: 'correct' as const, label: 'Correct Answer' }] : []),
    { id: 'why' as const, label: 'Why' },
  ];

  return (
    <Card className="overflow-hidden !p-0">
      {/* Question header */}
      <div className={clsx('px-5 py-4 border-b', statusColor)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            {isCorrect === true && <CheckCircle2 size={16} className="text-green-600 flex-shrink-0 mt-0.5" />}
            {isCorrect === false && <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />}
            {isCorrect === undefined && <HelpCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-0.5">Question {index}</p>
              <p className="text-sm font-medium text-neutral-900 leading-snug">{question.prompt}</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/70 flex-shrink-0">
            {score ?? 0}/{question.points}pt{question.points !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex border-b border-neutral-100 bg-neutral-50">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={clsx(
              'px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px',
              activeSection === s.id
                ? 'text-black border-black bg-white'
                : 'text-neutral-400 border-transparent hover:text-neutral-600'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="px-5 py-4">
        {activeSection === 'your' && (
          <div>
            <AnswerDisplay question={question} answer={answer} showCorrectness />
            {answer === undefined && (
              <p className="text-sm text-neutral-400 italic">No answer recorded.</p>
            )}
          </div>
        )}

        {activeSection === 'correct' && (
          <CorrectAnswerDisplay question={question} />
        )}

        {activeSection === 'why' && (
          <div>
            {question.feedback ? (
              <div className="flex gap-3">
                <Lightbulb size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-700 leading-relaxed">{question.feedback}</p>
              </div>
            ) : (
              <p className="text-sm text-neutral-400 italic">No explanation available for this question.</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Resources tab ────────────────────────────────────────────────────────────

function ResourcesTab({
  resources,
  mod,
}: {
  resources: { label: string; url: string; lessonTitle: string }[];
  mod: (typeof MODULES)[number];
}) {
  const byLesson = resources.reduce<Record<string, { label: string; url: string }[]>>((acc, r) => {
    if (!acc[r.lessonTitle]) acc[r.lessonTitle] = [];
    acc[r.lessonTitle].push({ label: r.label, url: r.url });
    return acc;
  }, {});

  if (resources.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-neutral-400">
          <AlertCircle size={18} />
          <p className="text-sm">No additional resources are linked to this module yet.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-neutral-500">
        These resources come from the lessons in <strong>{mod.title}</strong>. Reviewing them will help reinforce what you learned.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {mod.lessons.map(lesson => {
        const items = byLesson[lesson.title];
        if (!items?.length) return null;
        return (
          <Card key={lesson.id}>
            <div className="flex items-start gap-3 mb-4">
              <BookOpen size={16} className="text-brand-navy flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Lesson</p>
                <p className="text-sm font-semibold text-neutral-800">{lesson.title}</p>
              </div>
            </div>
            <ul className="flex flex-col gap-2">
              {items.map((r, i) => (
                <li key={i}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-brand-navy font-medium hover:underline group"
                  >
                    <ExternalLink size={13} className="flex-shrink-0 opacity-60 group-hover:opacity-100" />
                    {r.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-neutral-100">
              <Link
                href={`/participant/modules/${mod.id}/lesson/${lesson.id}`}
                className="text-xs font-medium text-neutral-500 hover:text-brand-navy transition-colors"
              >
                Revisit lesson →
              </Link>
            </div>
          </Card>
        );
      })}
      </div>
    </div>
  );
}

// ─── Answer displays ──────────────────────────────────────────────────────────

function AnswerDisplay({
  question,
  answer,
  showCorrectness = false,
}: {
  question: Question;
  answer?: string | string[];
  showCorrectness?: boolean;
}) {
  if (answer === undefined || answer === null) return null;

  if (question.type === 'multiple_choice' && typeof answer === 'string') {
    const opt = question.options?.find(o => o.id === answer);
    return (
      <div className="flex items-center gap-2">
        {showCorrectness && (
          opt?.isCorrect
            ? <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
            : <XCircle size={15} className="text-red-400 flex-shrink-0" />
        )}
        <p className="text-sm text-neutral-800">{opt?.text ?? answer}</p>
      </div>
    );
  }

  if (question.type === 'multi_select' && Array.isArray(answer)) {
    const correctIds = new Set(question.options?.filter(o => o.isCorrect).map(o => o.id));
    return (
      <ul className="flex flex-col gap-1.5">
        {(answer as string[]).map(id => {
          const opt = question.options?.find(o => o.id === id);
          const correct = correctIds.has(id);
          return (
            <li key={id} className="flex items-center gap-2">
              {showCorrectness && (
                correct
                  ? <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                  : <XCircle size={14} className="text-red-400 flex-shrink-0" />
              )}
              <span className="text-sm text-neutral-800">{opt?.text ?? id}</span>
            </li>
          );
        })}
        {showCorrectness && question.options?.filter(o => o.isCorrect && !(answer as string[]).includes(o.id)).map(o => (
          <li key={o.id} className="flex items-center gap-2 opacity-50">
            <span className="w-3.5 h-3.5 rounded-full border border-neutral-300 flex-shrink-0" />
            <span className="text-sm text-neutral-500 line-through">{o.text}</span>
            <span className="text-xs text-neutral-400 ml-1">(missed)</span>
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
              {showCorrectness && (
                correct
                  ? <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                  : <XCircle size={14} className="text-red-400 flex-shrink-0" />
              )}
              <span className="text-neutral-600 font-medium">{pair.left}</span>
              <span className="text-neutral-400 mx-0.5">→</span>
              <span className="text-neutral-800">{matched?.right ?? '—'}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  return <p className="text-sm text-neutral-800 italic">"{String(answer)}"</p>;
}

function CorrectAnswerDisplay({ question }: { question: Question }) {
  if (question.type === 'multiple_choice') {
    const correct = question.options?.find(o => o.isCorrect);
    return correct ? (
      <div className="flex items-center gap-2">
        <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
        <p className="text-sm text-neutral-800">{correct.text}</p>
      </div>
    ) : <p className="text-sm text-neutral-400 italic">No correct answer defined.</p>;
  }

  if (question.type === 'multi_select') {
    const correct = question.options?.filter(o => o.isCorrect) ?? [];
    return (
      <ul className="flex flex-col gap-1.5">
        {correct.map(o => (
          <li key={o.id} className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
            <span className="text-sm text-neutral-800">{o.text}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (question.type === 'matching') {
    return (
      <ul className="flex flex-col gap-1.5">
        {question.pairs?.map(pair => (
          <li key={pair.id} className="flex items-center gap-2 text-sm">
            <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
            <span className="text-neutral-600 font-medium">{pair.left}</span>
            <span className="text-neutral-400 mx-0.5">→</span>
            <span className="text-neutral-800">{pair.right}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (question.type === 'short_text' && question.correctAnswer) {
    return (
      <div className="rounded-lg bg-brand-mint-pale border border-brand-mint px-3 py-2.5">
        <p className="text-xs text-neutral-500 font-medium mb-1">Model answer</p>
        <p className="text-sm text-neutral-700 leading-relaxed">{question.correctAnswer}</p>
      </div>
    );
  }

  if (question.type === 'scale') {
    return (
      <p className="text-sm text-neutral-400 italic">This is a reflection question — there is no single correct answer.</p>
    );
  }

  return <p className="text-sm text-neutral-400 italic">No correct answer defined.</p>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="flex items-center gap-1 justify-center mb-0.5">{icon}</div>
      <p className="text-lg font-bold text-neutral-800">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
