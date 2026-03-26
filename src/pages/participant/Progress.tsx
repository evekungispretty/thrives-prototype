import { CheckCircle2, Clock, Trophy, BookOpen } from 'lucide-react';
import { ParticipantShell } from '../../components/layout/ParticipantShell';
import { Card } from '../../components/ui/Card';
import { ProgressBar, CircleProgress } from '../../components/ui/ProgressBar';
import { TopicBadge, ModuleStatusBadge } from '../../components/ui/Badge';
import { MODULES } from '../../data/modules';
import { DEMO_PARTICIPANT } from '../../data/users';

export function ParticipantProgress() {
  const user = DEMO_PARTICIPANT;
  const publishedMods = MODULES.filter(m => m.publishState === 'published');
  const completedMods = user.progress.filter(p => p.status === 'completed').length;
  const totalLessons = publishedMods.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = user.progress.reduce((sum, p) => sum + p.completedLessons, 0);

  // Quiz scores
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
                        <p className="text-xs text-neutral-400">Quiz</p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right: ring + achievements */}
        <div className="flex flex-col gap-6">
          {/* Big ring */}
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

          {/* Achievements */}
          <Card>
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">Achievements</h3>
            <div className="flex flex-col gap-2.5">
              {[
                { icon: '🌱', label: 'First Lesson', sub: 'Completed your first lesson', earned: completedLessons >= 1 },
                { icon: '📚', label: 'Module 1 Complete', sub: 'Finished Feeding Your Baby', earned: completedMods >= 1 },
                { icon: '⭐', label: 'Quiz Ace', sub: 'Scored 90%+ on a quiz', earned: quizResults.some(p => ((p.quizScore ?? 0) / (p.quizMaxScore ?? 1)) >= 0.9) },
                { icon: '🏆', label: 'Halfway There', sub: 'Completed 3 modules', earned: completedMods >= 3 },
                { icon: '🎓', label: 'THRIVES Graduate', sub: 'Completed all 5 modules', earned: completedMods >= 5 },
              ].map(a => (
                <div key={a.label} className={`flex items-center gap-2.5 ${!a.earned ? 'opacity-40' : ''}`}>
                  <span className="text-xl">{a.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{a.label}</p>
                    <p className="text-xs text-neutral-500">{a.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </ParticipantShell>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
