import { Link } from 'wouter';
import { ArrowRight, CheckCircle2, Clock, PlayCircle, Star } from 'lucide-react';
import { ParticipantShell } from '../../components/layout/ParticipantShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressBar, CircleProgress } from '../../components/ui/ProgressBar';
import { TopicBadge } from '../../components/ui/Badge';
import { MODULES } from '../../data/modules';
import { DEMO_PARTICIPANT } from '../../data/users';

export function ParticipantDashboard() {
  const user = DEMO_PARTICIPANT;
  const totalModules = MODULES.filter(m => m.publishState === 'published').length;
  const completedModules = user.progress.filter(p => p.status === 'completed').length;
  const inProgressModule = MODULES.find(m => {
    const prog = user.progress.find(p => p.moduleId === m.id);
    return prog?.status === 'in_progress';
  });
  const inProgressData = inProgressModule
    ? user.progress.find(p => p.moduleId === inProgressModule.id)
    : null;

  const overallPct = Math.round((completedModules / totalModules) * 100);
  const completedLessons = user.progress.reduce((sum, p) => sum + p.completedLessons, 0);
  const totalLessons = MODULES.reduce((sum, m) => sum + m.lessons.length, 0);

  // Recent activity (last 3 completed modules)
  const recentCompletions = user.progress
    .filter(p => p.status === 'completed' && p.completedAt)
    .sort((a, b) => (b.completedAt! > a.completedAt! ? 1 : -1))
    .slice(0, 3)
    .map(p => MODULES.find(m => m.id === p.moduleId))
    .filter(Boolean);

  return (
    <ParticipantShell>
      {/* Welcome Header */}
      <div className="mb-8">
        <p className="text-sm text-neutral-500 mb-1">Good morning</p>
        <h1 className="text-2xl font-bold text-neutral-900">
          Welcome back, {user.name.split(' ')[0]}
        </h1>
        <p className="text-neutral-500 mt-1 text-sm">
          {user.cohort} · Keep going — you're making great progress.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Modules Completed', value: `${completedModules}/${totalModules}`, icon: <CheckCircle2 size={18} />, color: 'green' },
          { label: 'Lessons Done', value: `${completedLessons}/${totalLessons}`, icon: <PlayCircle size={18} />, color: 'amber' },
          { label: 'Overall Progress', value: `${overallPct}%`, icon: <Star size={18} />, color: 'blue' },
          { label: 'Current Streak', value: '5 days', icon: <Clock size={18} />, color: 'purple' },
        ].map(stat => (
          <Card key={stat.label}>
            <p className="text-xs text-neutral-500 font-medium">{stat.label}</p>
            <p className="mt-1 text-xl font-bold text-neutral-900">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue Learning CTA */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {inProgressModule && inProgressData ? (
            <Card className="border-brand-mint bg-white">
              <p className="text-xs font-medium text-brand-navy uppercase tracking-wide mb-3">Continue Learning</p>
              <div className="flex gap-4">
                <div className="w-32 h-28 rounded-lg flex-shrink-0 overflow-hidden bg-neutral-200">
                  {inProgressModule.thumbnail ? (
                    <img
                      src={inProgressModule.thumbnail}
                      alt={inProgressModule.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full" style={{ background: topicColor(inProgressModule.tag) }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-neutral-900 mb-1">{inProgressModule.title}</h2>
                  <p className="text-sm text-neutral-600 mb-3 leading-relaxed">{inProgressModule.description}</p>
                  <p className="text-xs text-neutral-500 mb-3">
                    {inProgressData.completedLessons} of {inProgressData.totalLessons} lessons complete
                  </p>
                  <Link href={`/participant/modules/${inProgressModule.id}`}>
                    <Button size="sm">Continue <ArrowRight size={14} /></Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border-brand-mint bg-brand-mint-pale">
              <p className="text-sm font-medium text-brand-navy">Start your first module!</p>
              <Link href="/participant/modules" className="mt-3 inline-block">
                <Button size="sm">Browse Modules <ArrowRight size={14} /></Button>
              </Link>
            </Card>
          )}

          {/* Module overview list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-neutral-800">Your Modules</h3>
              <Link href="/participant/modules" className="text-sm text-brand-navy hover:text-brand-navy font-medium">
                View all
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {MODULES.filter(m => m.publishState === 'published').map(mod => {
                const prog = user.progress.find(p => p.moduleId === mod.id);
                const pct = prog
                  ? Math.round((prog.completedLessons / prog.totalLessons) * 100)
                  : 0;
                const isLocked = prog?.status === 'locked';
                return (
                  <Link
                    key={mod.id}
                    href={isLocked ? '#' : `/participant/modules/${mod.id}`}
                    className={`flex items-center gap-4 p-3 bg-white rounded-xl border border-neutral-100 shadow-sm transition-all ${isLocked ? 'opacity-40 cursor-default' : 'hover:shadow-md hover:border-neutral-200'}`}
                  >
                    <div className="w-20 h-16 rounded-lg flex-shrink-0 overflow-hidden bg-neutral-100">
                      {mod.thumbnail ? (
                        <img
                          src={mod.thumbnail}
                          alt={mod.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full" style={{ background: topicColor(mod.tag) }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <p className="text-sm font-semibold text-neutral-800 truncate">{mod.title}</p>
                        <span className="text-xs text-neutral-400 flex-shrink-0">
                          {prog?.completedLessons ?? 0}/{mod.lessons.length}
                        </span>
                      </div>
                      <ProgressBar value={pct} size="sm" color={pct > 0 ? 'mint' : 'navy'} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Overall progress ring */}
          <Card className="text-center">
            <p className="text-sm font-medium text-neutral-700 mb-3">Overall Completion</p>
            <div className="flex justify-center mb-2">
              <div className="relative">
                <CircleProgress value={overallPct} size={96} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-neutral-900">{overallPct}%</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-neutral-400">{completedModules} of {totalModules} modules</p>
          </Card>

          {/* Recent completions */}
          {recentCompletions.length > 0 && (
            <Card>
              <h3 className="font-semibold text-neutral-800 mb-3">Recently Completed</h3>
              <div className="flex flex-col gap-2.5">
                {recentCompletions.map(mod => mod && (
                  <div key={mod.id} className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-brand-navy flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{mod.title}</p>
                      <TopicBadge tag={mod.tag} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Next up */}
          <Card className="bg-brand-peach-pale border-brand-peach">
            <p className="text-xs font-medium text-brand-navy uppercase tracking-wide mb-2">Up Next</p>
            {(() => {
              const nextMod = MODULES.find(m => {
                const prog = user.progress.find(p => p.moduleId === m.id);
                return prog?.status === 'not_started' && m.publishState === 'published';
              });
              if (!nextMod) return <p className="text-sm text-brand-navy">All modules completed!</p>;
              return (
                <>
                  <p className="text-sm font-semibold text-neutral-800">{nextMod.title}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{nextMod.estimatedMinutes} min · {nextMod.lessons.length} lessons</p>
                  <Link
                    href={`/participant/modules/${nextMod.id}`}
                    className="inline-flex items-center gap-1 mt-3 text-brand-navy text-sm font-medium hover:underline"
                  >
                    Start module <ArrowRight size={13} />
                  </Link>
                </>
              );
            })()}
          </Card>
        </div>
      </div>
    </ParticipantShell>
  );
}

function topicColor(tag: string): string {
  const map: Record<string, string> = {
    'infant-feeding':     '#fde8ce', // brand-peach-pale
    'tummy-time':         '#e0f8eb', // brand-mint-pale
    'screen-time':        '#d5f1f8', // brand-blue-pale
    'sleep':              '#fce8f1', // brand-pink-pale
    'development':        '#f9f7d3', // brand-yellow-pale
    'caregiver-wellbeing':'#fce8f1', // brand-pink-pale
  };
  return map[tag] ?? '#F5F4F2';
}
