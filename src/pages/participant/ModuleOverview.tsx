import { useParams, Link } from 'wouter';
import { ArrowLeft, Clock, PlayCircle, CheckCircle2, Lock, FileQuestion } from 'lucide-react';
import { ParticipantShell } from '../../components/layout/ParticipantShell';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { TopicBadge, ModuleStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { MODULES } from '../../data/modules';
import { DEMO_PARTICIPANT } from '../../data/users';

export function ModuleOverview() {
  const { id } = useParams<{ id: string }>();
  const mod = MODULES.find(m => m.id === id);
  const user = DEMO_PARTICIPANT;
  const prog = user.progress.find(p => p.moduleId === id);

  if (!mod) {
    return (
      <ParticipantShell>
        <p className="text-neutral-500">Module not found.</p>
      </ParticipantShell>
    );
  }

  const completedLessons = prog?.completedLessons ?? 0;
  const pct = Math.round((completedLessons / mod.lessons.length) * 100);

  // Find the next incomplete lesson
  const nextLesson = mod.lessons.find((_l, idx) => idx >= completedLessons);

  return (
    <ParticipantShell>
      {/* Back */}
      <Link href="/participant/modules" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to Modules
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <TopicBadge tag={mod.tag} />
          <ModuleStatusBadge status={prog?.status ?? 'not_started'} />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">{mod.title}</h1>
        <p className="text-neutral-600 leading-relaxed max-w-2xl">{mod.description}</p>

        <div className="flex items-center gap-5 mt-4 text-sm text-neutral-500">
          <span className="flex items-center gap-1.5"><Clock size={14} /> {mod.estimatedMinutes} min</span>
          <span className="flex items-center gap-1.5"><PlayCircle size={14} /> {mod.lessons.length} lessons</span>
          <span className="flex items-center gap-1.5"><FileQuestion size={14} /> Knowledge check</span>
        </div>

        {pct > 0 && (
          <div className="mt-4 max-w-sm">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>{completedLessons} of {mod.lessons.length} lessons</span>
              <span>{pct}%</span>
            </div>
            <ProgressBar value={pct} />
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lesson list */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-semibold text-neutral-800 mb-3">Lessons</h2>
          <div className="flex flex-col gap-2">
            {mod.lessons.map((lesson, idx) => {
              const isCompleted = idx < completedLessons;
              const isCurrent = idx === completedLessons;
              const isLocked = idx > completedLessons;

              return (
                <Link
                  key={lesson.id}
                  href={isLocked ? '#' : `/participant/modules/${mod.id}/lesson/${lesson.id}`}
                  className={isLocked ? 'cursor-default' : ''}
                >
                  <Card
                    hover={!isLocked}
                    className={`transition-all ${isCurrent ? 'border-brand-mint bg-brand-mint-pale' : ''} ${isLocked ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Status icon */}
                      <div
                        className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-semibold ${
                          isCompleted
                            ? 'bg-brand-navy text-white'
                            : isCurrent
                            ? 'bg-brand-peach text-white'
                            : 'bg-neutral-100 text-neutral-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={16} />
                        ) : isLocked ? (
                          <Lock size={14} />
                        ) : (
                          idx + 1
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isLocked ? 'text-neutral-400' : 'text-neutral-800'}`}>
                          {lesson.title}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5 truncate">{lesson.description}</p>
                      </div>

                      {/* Duration */}
                      <span className="text-xs text-neutral-400 flex-shrink-0 flex items-center gap-1">
                        <Clock size={11} /> {lesson.durationMinutes} min
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}

            {/* Quiz row */}
            <div className={`mt-1 ${prog?.status !== 'completed' ? 'opacity-50' : ''}`}>
              <Link
                href={prog?.status === 'completed' ? `/participant/modules/${mod.id}/quiz` : '#'}
                className={prog?.status !== 'completed' ? 'cursor-default' : ''}
              >
                <Card hover={prog?.status === 'completed'} className="border-dashed border-2 border-neutral-300 bg-neutral-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-mint-pale flex items-center justify-center flex-shrink-0">
                      <FileQuestion size={16} className="text-brand-navy" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-700">Knowledge Check Quiz</p>
                      <p className="text-xs text-neutral-400">Complete all lessons to unlock</p>
                    </div>
                    {prog?.quizScore !== undefined && (
                      <div className="ml-auto text-right">
                        <p className="text-sm font-semibold text-brand-navy">{prog.quizScore}/{prog.quizMaxScore}</p>
                        <p className="text-xs text-neutral-400">Score</p>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* CTA */}
          <Card className="bg-brand-navy text-white border-0">
            {nextLesson ? (
              <>
                <p className="text-xs text-brand-mint font-medium uppercase tracking-wide mb-1">
                  {completedLessons === 0 ? 'Start Here' : 'Continue'}
                </p>
                <p className="font-semibold mb-3">{nextLesson.title}</p>
                <Link href={`/participant/modules/${mod.id}/lesson/${nextLesson.id}`}>
                  <Button variant="secondary" size="sm" className="w-full">
                    {completedLessons === 0 ? 'Begin Lesson' : 'Resume'}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <p className="text-xs text-brand-mint font-medium uppercase tracking-wide mb-1">Module Complete</p>
                <p className="font-semibold mb-3">All lessons done!</p>
                {prog?.quizScore === undefined && (
                  <Link href={`/participant/modules/${mod.id}/quiz`}>
                    <Button variant="secondary" size="sm" className="w-full">Take Quiz</Button>
                  </Link>
                )}
              </>
            )}
          </Card>

          {/* What you'll learn */}
          <Card>
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">What You'll Learn</h3>
            <ul className="flex flex-col gap-2">
              {mod.lessons.slice(0, 4).map(l => (
                <li key={l.id} className="flex items-start gap-2 text-sm text-neutral-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-mint mt-1.5 flex-shrink-0" />
                  {l.title}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </ParticipantShell>
  );
}
