import { useParams, Link } from 'wouter';
import { ArrowLeft, Mail, Tag, Calendar, MessageSquare, CheckCircle2, Clock } from 'lucide-react';
import { AdminShell } from '../../components/layout/AdminShell';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { TopicBadge, ModuleStatusBadge, ParticipantStatusBadge } from '../../components/ui/Badge';
import { MODULES } from '../../data/modules';
import { ALL_PARTICIPANTS } from '../../data/users';
import { QUESTIONS } from '../../data/questions';
import { quizStore } from '../../stores/quizStore';

export function ParticipantDetail() {
  const { id } = useParams<{ id: string }>();
  const user = ALL_PARTICIPANTS.find(u => u.id === id);

  if (!user) {
    return (
      <AdminShell>
        <p className="text-neutral-500">Participant not found.</p>
      </AdminShell>
    );
  }

  const completedMods = user.progress.filter(p => p.status === 'completed').length;
  const totalMods = MODULES.filter(m => m.publishState === 'published').length;
  const completedLessons = user.progress.reduce((s, p) => s + p.completedLessons, 0);
  const totalLessons = MODULES.reduce((s, m) => s + m.lessons.length, 0);

  const quizMod1Questions = QUESTIONS.filter(q => q.moduleId === 'mod-1');
  const mod1Attempt = quizStore.getForUser(user.id).find(a => a.moduleId === 'mod-1');

  return (
    <AdminShell>
      {/* Back */}
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-6 transition-colors">
        <ArrowLeft size={15} /> All Participants
      </Link>

      {/* Profile header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-brand-navy flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {user.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-neutral-900">{user.name}</h1>
            <ParticipantStatusBadge status={user.status} />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
            <span className="flex items-center gap-1.5"><Mail size={13} /> {user.email}</span>
            <span className="flex items-center gap-1.5"><Calendar size={13} /> Enrolled {formatDate(user.enrolledAt)}</span>
            <span className="flex items-center gap-1.5"><Clock size={13} /> Last active {formatDate(user.lastActiveAt)}</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">{user.cohort}</p>
        </div>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        {/* Left main */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Progress summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Card>
              <p className="text-xs text-neutral-500 font-medium">Modules Complete</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{completedMods}<span className="text-base text-neutral-400">/{totalMods}</span></p>
              <ProgressBar value={Math.round(completedMods/totalMods*100)} size="sm" className="mt-2" />
            </Card>
            <Card>
              <p className="text-xs text-neutral-500 font-medium">Lessons Done</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{completedLessons}<span className="text-base text-neutral-400">/{totalLessons}</span></p>
            </Card>
            <Card>
              <p className="text-xs text-neutral-500 font-medium">Quiz Avg</p>
              {(() => {
                const quizzes = user.progress.filter(p => p.quizScore !== undefined);
                if (quizzes.length === 0) return <p className="text-2xl font-bold text-neutral-400 mt-1">—</p>;
                const avg = Math.round(quizzes.reduce((s,p) => s + ((p.quizScore!/ p.quizMaxScore!)*100), 0) / quizzes.length);
                return (
                  <>
                    <p className="text-2xl font-bold text-neutral-900 mt-1">{avg}%</p>
                    <ProgressBar value={avg} size="sm" className="mt-2" color={avg >= 80 ? 'mint' : 'peach'} />
                  </>
                );
              })()}
            </Card>
          </div>

          {/* Module progress timeline */}
          <Card>
            <h2 className="text-sm font-semibold text-neutral-800 mb-4">Module Progress</h2>
            <div className="flex flex-col gap-4">
              {MODULES.filter(m => m.publishState === 'published').map(mod => {
                const prog = user.progress.find(p => p.moduleId === mod.id);
                const status = prog?.status ?? 'not_started';
                const pct = prog ? Math.round((prog.completedLessons / prog.totalLessons) * 100) : 0;
                return (
                  <div key={mod.id}>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <TopicBadge tag={mod.tag} />
                      <p className="text-sm font-medium text-neutral-800">{mod.title}</p>
                      <ModuleStatusBadge status={status} />
                      {prog?.quizScore !== undefined && (
                        <span className="ml-auto text-xs font-semibold text-brand-navy">
                          Quiz: {prog.quizScore}/{prog.quizMaxScore}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <ProgressBar value={pct} className="flex-1" />
                      <span className="text-xs text-neutral-400 tabular-nums w-8 text-right">{pct}%</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {prog?.completedLessons ?? 0} of {mod.lessons.length} lessons
                      {prog?.completedAt && ` · Completed ${formatDate(prog.completedAt)}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Question-level response view (Module 1) */}
          <Card>
            <h2 className="text-sm font-semibold text-neutral-800 mb-1">Quiz Responses — Feeding Your Baby</h2>
            <p className="text-xs text-neutral-400 mb-4">Showing question-level detail for completed module</p>
            {!mod1Attempt && (
              <p className="text-sm text-neutral-400 italic">No quiz attempt on record.</p>
            )}
            <div className="flex flex-col gap-4">
              {quizMod1Questions.map((q, idx) => {
                const result = mod1Attempt?.results.find(r => r.questionId === q.id);
                const ans = typeof result?.answer === 'string' ? result.answer : undefined;
                const correctOpt = q.options?.find(o => o.isCorrect);
                const selectedOpt = q.options?.find(o => o.id === ans);
                const isCorrect = result?.isCorrect ?? false;

                return (
                  <div key={q.id} className="border border-neutral-150 rounded-xl p-4">
                    <div className="flex items-start gap-2 mb-2">
                      {q.type !== 'short_text' && q.type !== 'matching' && (
                        isCorrect
                          ? <CheckCircle2 size={15} className="text-brand-navy mt-0.5 flex-shrink-0" />
                          : <div className="w-4 h-4 rounded-full border-2 border-brand-peach mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-0.5">
                          Q{idx + 1} · {q.type.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-neutral-800 font-medium">{q.prompt}</p>
                      </div>
                    </div>

                    <div className="ml-5 text-sm">
                      {q.type === 'multiple_choice' && (
                        <>
                          <p className="text-neutral-600">
                            <span className="font-medium text-neutral-700">Response:</span> {selectedOpt?.text ?? '—'}
                          </p>
                          {!isCorrect && (
                            <p className="text-brand-navy mt-0.5">
                              <span className="font-medium">Correct:</span> {correctOpt?.text}
                            </p>
                          )}
                        </>
                      )}
                      {q.type === 'short_text' && (
                        <div className="bg-neutral-50 rounded-lg p-2.5 text-neutral-700 text-xs leading-relaxed">
                          {ans ?? '(no response)'}
                        </div>
                      )}
                      {q.type === 'matching' && (
                        <p className="text-neutral-500 text-xs">Matching question — see detailed view for breakdown</p>
                      )}
                      {q.type === 'multi_select' && (
                        <p className="text-neutral-600">
                          <span className="font-medium">Selected:</span> {ans}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          {/* Tags */}
          {user.tags && user.tags.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-1.5">
                <Tag size={14} className="text-neutral-500" /> Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {user.tags.map(tag => (
                  <span key={tag} className="text-xs bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <h3 className="text-sm font-semibold text-neutral-800 mb-2 flex items-center gap-1.5">
              <MessageSquare size={14} className="text-neutral-500" /> Notes
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {user.notes ?? 'No notes added yet.'}
            </p>
            <button className="mt-3 text-xs text-brand-navy hover:text-brand-navy font-medium">
              + Add note
            </button>
          </Card>

          {/* Module score table */}
          <Card>
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">Quiz Scores</h3>
            <div className="flex flex-col gap-2">
              {MODULES.filter(m => m.publishState === 'published').map(mod => {
                const prog = user.progress.find(p => p.moduleId === mod.id);
                if (prog?.quizScore === undefined) return null;
                const pct = Math.round((prog.quizScore / prog.quizMaxScore!) * 100);
                return (
                  <div key={mod.id} className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600 truncate flex-1 mr-2 text-xs">{mod.title.split(' ').slice(0,3).join(' ')}</span>
                    <span className={`font-semibold text-xs flex-shrink-0 ${pct >= 80 ? 'text-brand-navy' : 'text-brand-navy'}`}>
                      {prog.quizScore}/{prog.quizMaxScore}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
