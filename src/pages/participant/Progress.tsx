import { CheckCircle2, Clock, Trophy, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { ParticipantShell } from '../../components/layout/ParticipantShell';
import { Card } from '../../components/ui/Card';
import { ProgressBar, CircleProgress } from '../../components/ui/ProgressBar';
import { TopicBadge, ModuleStatusBadge } from '../../components/ui/Badge';
import { MODULES } from '../../data/modules';
import { DEMO_PARTICIPANT } from '../../data/users';
import { quizStore } from '../../stores/quizStore';
import { QUESTIONS } from '../../data/questions';

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

                  </div>

                  {/* Quiz review link */}
                  {attempt && modQuestions.length > 0 && (
                    <div className="mt-3 border-t border-neutral-100 pt-3">
                      <Link
                        href={`/participant/modules/${mod.id}/quiz/review`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-navy hover:text-brand-navy-dark transition-colors"
                      >
                        Review quiz responses
                        <ArrowRight size={13} />
                      </Link>
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


function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
