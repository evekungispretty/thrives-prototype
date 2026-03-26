import { Link } from 'wouter';
import { Clock, BookOpen, CheckCircle2, Lock, ChevronRight } from 'lucide-react';
import { ParticipantShell } from '../../components/layout/ParticipantShell';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { TopicBadge, ModuleStatusBadge } from '../../components/ui/Badge';
import { MODULES } from '../../data/modules';
import { DEMO_PARTICIPANT } from '../../data/users';

const TOPIC_BG: Record<string, string> = {
  'infant-feeding':     'from-brand-peach-pale  to-white',
  'tummy-time':         'from-brand-mint-pale   to-white',
  'screen-time':        'from-brand-blue-pale   to-white',
  'sleep':              'from-brand-pink-pale   to-white',
  'development':        'from-brand-yellow-pale to-white',
  'caregiver-wellbeing':'from-brand-pink-pale   to-white',
};

const TOPIC_ICON_COLOR: Record<string, string> = {
  'infant-feeding':     'bg-brand-peach',
  'tummy-time':         'bg-brand-mint',
  'screen-time':        'bg-brand-blue',
  'sleep':              'bg-brand-pink',
  'development':        'bg-brand-yellow',
  'caregiver-wellbeing':'bg-brand-pink',
};

export function ModuleLibrary() {
  const user = DEMO_PARTICIPANT;
  const publishedModules = MODULES.filter(m => m.publishState === 'published');

  return (
    <ParticipantShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Learning Modules</h1>
        <p className="text-neutral-500 mt-1 text-sm">
          Six evidence-based topics to help you build healthy routines in your baby's early stages.
        </p>
      </div>

      {/* Learning path */}
      <div className="flex flex-col gap-4">
        {publishedModules.map((mod, idx) => {
          const prog = user.progress.find(p => p.moduleId === mod.id);
          const status = prog?.status ?? 'not_started';
          const pct = prog ? Math.round((prog.completedLessons / prog.totalLessons) * 100) : 0;
          const isLocked = status === 'locked';
          const isCompleted = status === 'completed';

          return (
            <div key={mod.id} className="flex gap-4 items-start">
              {/* Step indicator */}
              <div className="flex flex-col items-center flex-shrink-0 pt-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 flex-shrink-0 ${
                    isCompleted
                      ? 'bg-brand-navy border-brand-navy text-white'
                      : isLocked
                      ? 'bg-neutral-100 border-neutral-200 text-neutral-300'
                      : status === 'in_progress'
                      ? 'bg-brand-peach border-brand-peach text-brand-navy'
                      : 'bg-white border-neutral-300 text-neutral-600'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : isLocked ? <Lock size={14} /> : idx + 1}
                </div>
                {idx < publishedModules.length - 1 && (
                  <div className={`w-px flex-1 mt-1 min-h-6 ${isCompleted ? 'bg-brand-mint' : 'bg-neutral-200'}`} />
                )}
              </div>

              {/* Card */}
              <Link
                href={isLocked ? '#' : `/participant/modules/${mod.id}`}
                className={`flex-1 block mb-2 ${isLocked ? 'cursor-default opacity-50' : ''}`}
              >
                <Card
                  hover={!isLocked}
                  className={`bg-gradient-to-br ${TOPIC_BG[mod.tag]} border-0`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Icon dot */}
                      <div className={`w-10 h-10 rounded-xl flex-shrink-0 ${TOPIC_ICON_COLOR[mod.tag]} flex items-center justify-center mt-0.5`}>
                        <BookOpen size={18} className="text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-neutral-900">{mod.title}</h3>
                          <TopicBadge tag={mod.tag} />
                          <ModuleStatusBadge status={status} />
                        </div>
                        <p className="text-sm text-neutral-600 leading-relaxed mb-3">{mod.description}</p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {mod.estimatedMinutes} min
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen size={12} /> {mod.lessons.length} lessons
                          </span>
                          {prog && prog.completedLessons > 0 && (
                            <span>{prog.completedLessons}/{mod.lessons.length} complete</span>
                          )}
                        </div>

                        {pct > 0 && (
                          <ProgressBar value={pct} size="sm" className="mt-3 max-w-xs" showLabel />
                        )}
                      </div>
                    </div>

                    {!isLocked && (
                      <ChevronRight size={18} className="text-neutral-400 flex-shrink-0 mt-1" />
                    )}
                  </div>
                </Card>
              </Link>
            </div>
          );
        })}

        {/* Locked module */}
        {MODULES.filter(m => m.publishState === 'draft').map(mod => (
          <div key={mod.id} className="flex gap-4 items-start opacity-40">
            <div className="flex flex-col items-center flex-shrink-0 pt-4">
              <div className="w-8 h-8 rounded-full bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center">
                <Lock size={14} className="text-neutral-300" />
              </div>
            </div>
            <div className="flex-1 mb-2">
              <Card className="bg-neutral-50 border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-200 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} className="text-neutral-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-500">{mod.title}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">Coming soon · {mod.estimatedMinutes} min</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </ParticipantShell>
  );
}
