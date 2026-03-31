import { Link } from 'wouter';
import { Target, CheckCircle2, ArrowLeft, ArrowRight, Calendar, AlertCircle, Lightbulb } from 'lucide-react';
import { ParticipantShell } from '../../components/layout/ParticipantShell';
import { Card } from '../../components/ui/Card';
import { MODULES } from '../../data/modules';
import { DEMO_PARTICIPANT } from '../../data/users';
import { GOAL_CONFIGS } from '../../data/goals';
import { goalsStore } from '../../stores/goalsStore';

export function GoalsView() {
  const user = DEMO_PARTICIPANT;
  const goalEntries = goalsStore.getForUser(user.id);

  return (
    <ParticipantShell>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/participant/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-4 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Target size={22} className="text-brand-navy" />
            <h1 className="text-2xl font-bold text-neutral-900">My Goals</h1>
          </div>
          <p className="text-neutral-500 mt-1 text-sm">
            Your personal goals and action plans from each module.
          </p>
        </div>

        {goalEntries.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Target size={36} className="text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600 font-medium mb-1">No goals set yet</p>
              <p className="text-sm text-neutral-400 mb-5">
                Complete a module and set your goals to track your progress here.
              </p>
              {GOAL_CONFIGS.map(config => {
                const mod = MODULES.find(m => m.id === config.moduleId);
                return (
                  <Link
                    key={config.moduleId}
                    href={`/participant/modules/${config.moduleId}/goals`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-navy hover:text-brand-navy-dark transition-colors"
                  >
                    Set goals for {mod?.title ?? config.moduleTitle} <ArrowRight size={13} />
                  </Link>
                );
              })}
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            {goalEntries.map(entry => {
              const mod = MODULES.find(m => m.id === entry.moduleId);
              const config = GOAL_CONFIGS.find(g => g.moduleId === entry.moduleId);
              return (
                <Card key={entry.id}>
                  {/* Module header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-medium text-brand-navy uppercase tracking-wide mb-0.5">
                        {config?.programLabel}
                      </p>
                      <h2 className="text-base font-semibold text-neutral-800">
                        {mod?.title ?? entry.moduleId}
                      </h2>
                    </div>
                    {entry.completedAt && (
                      <span className="text-xs text-neutral-400">
                        Set {formatDate(entry.completedAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-5">
                    {/* Selected goals */}
                    <div>
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                        My goals are to:
                      </p>
                      <ul className="flex flex-col gap-1.5">
                        {entry.selectedGoals.map((g, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                            <CheckCircle2 size={15} className="text-brand-navy mt-0.5 flex-shrink-0" />
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Steps */}
                    {entry.steps && (
                      <div className="bg-neutral-50 rounded-xl p-4">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <ArrowRight size={13} className="text-brand-navy" />
                          <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                            Steps I'll take
                          </p>
                        </div>
                        <p className="text-sm text-neutral-700 leading-relaxed">{entry.steps}</p>
                      </div>
                    )}

                    {/* Start date */}
                    {entry.startDate && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Calendar size={14} className="text-brand-navy flex-shrink-0" />
                        <span>Starting <span className="font-medium">{formatDate(entry.startDate)}</span></span>
                      </div>
                    )}

                    {/* Challenges */}
                    {entry.challenges && (
                      <div className="bg-neutral-50 rounded-xl p-4">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <AlertCircle size={13} className="text-brand-navy" />
                          <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                            Possible challenges
                          </p>
                        </div>
                        <p className="text-sm text-neutral-700 leading-relaxed">{entry.challenges}</p>
                      </div>
                    )}

                    {/* How to overcome */}
                    {entry.overcome && (
                      <div className="bg-neutral-50 rounded-xl p-4">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Lightbulb size={13} className="text-brand-navy" />
                          <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                            How I'll overcome them
                          </p>
                        </div>
                        <p className="text-sm text-neutral-700 leading-relaxed">{entry.overcome}</p>
                      </div>
                    )}
                  </div>

                  {/* Link to redo goals */}
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <Link
                      href={`/participant/modules/${entry.moduleId}/goals`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-navy hover:text-brand-navy-dark transition-colors"
                    >
                      Update goals <ArrowRight size={12} />
                    </Link>
                  </div>
                </Card>
              );
            })}

            {/* Prompt for modules without goals yet */}
            {GOAL_CONFIGS.filter(config =>
              !goalEntries.some(e => e.moduleId === config.moduleId)
            ).map(config => {
              const mod = MODULES.find(m => m.id === config.moduleId);
              return (
                <Card key={config.moduleId} className="border-dashed border-neutral-200 bg-neutral-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">{mod?.title ?? config.moduleTitle}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">Goals not set yet</p>
                    </div>
                    <Link
                      href={`/participant/modules/${config.moduleId}/goals`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-navy hover:text-brand-navy-dark transition-colors flex-shrink-0"
                    >
                      Set goals <ArrowRight size={12} />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ParticipantShell>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
