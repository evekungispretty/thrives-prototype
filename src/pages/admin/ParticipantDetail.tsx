import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, Mail, Tag, Calendar, MessageSquare, CheckCircle2, Clock, Pencil, X, Plus, KeyRound, Eye, EyeOff } from 'lucide-react';
import { AdminShell } from '../../components/layout/AdminShell';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { TopicBadge, ModuleStatusBadge, ParticipantStatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { MODULES } from '../../data/modules';
import { ALL_PARTICIPANTS } from '../../data/users';
import { QUESTIONS } from '../../data/questions';
import { quizStore } from '../../stores/quizStore';
import type { User, ParticipantStatus } from '../../types';

const STATUS_OPTIONS: { value: ParticipantStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'enrolled', label: 'Enrolled' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'completed', label: 'Completed' },
];

export function ParticipantDetail() {
  const { id } = useParams<{ id: string }>();
  const initial = ALL_PARTICIPANTS.find(u => u.id === id);

  const [user, setUser] = useState<User | undefined>(initial);
  const [editOpen, setEditOpen] = useState(false);
  const [credOpen, setCredOpen] = useState(false);

  // Edit form state
  const [draft, setDraft] = useState<Partial<User>>({});
  const [tagInput, setTagInput] = useState('');
  const [draftTags, setDraftTags] = useState<string[]>([]);

  // Credential state (mock — prototype only)
  const [mockPassword, setMockPassword] = useState('••••••••••');
  const [credDraft, setCredDraft] = useState({ username: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [credError, setCredError] = useState('');

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

  function openEdit() {
    setDraft({
      name: user!.name,
      email: user!.email,
      cohort: user!.cohort,
      status: user!.status,
      notes: user!.notes ?? '',
    });
    setDraftTags([...(user!.tags ?? [])]);
    setTagInput('');
    setEditOpen(true);
  }

  function saveEdit() {
    setUser(prev => prev ? { ...prev, ...draft, tags: draftTags } : prev);
    setEditOpen(false);
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !draftTags.includes(t)) setDraftTags(prev => [...prev, t]);
    setTagInput('');
  }

  function removeTag(tag: string) {
    setDraftTags(prev => prev.filter(t => t !== tag));
  }

  function openCred() {
    setCredDraft({ username: user!.email, password: '', confirm: '' });
    setCredError('');
    setShowPass(false);
    setCredOpen(true);
  }

  function saveCred() {
    if (credDraft.password && credDraft.password !== credDraft.confirm) {
      setCredError('Passwords do not match.');
      return;
    }
    if (credDraft.password) setMockPassword('••••••••••');
    setUser(prev => prev ? { ...prev, email: credDraft.username } : prev);
    setCredOpen(false);
  }

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
            <button
              onClick={openEdit}
              className="ml-1 flex items-center gap-1.5 text-xs text-neutral-500 hover:text-brand-navy border border-neutral-200 hover:border-brand-navy/30 px-2.5 py-1 rounded-lg transition-colors"
            >
              <Pencil size={12} /> Edit
            </button>
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
          {/* Login Credentials */}
          <Card>
            <h3 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-1.5">
              <KeyRound size={14} className="text-neutral-500" /> Login Credentials
            </h3>
            <div className="flex flex-col gap-2.5">
              <div>
                <p className="text-xs text-neutral-400 mb-0.5">Username / Email</p>
                <p className="text-sm text-neutral-800 font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-0.5">Password</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-neutral-800 font-mono tracking-wider">{showPass ? 'demo-password' : mockPassword}</p>
                  <button
                    onClick={() => setShowPass(p => !p)}
                    className="text-neutral-400 hover:text-neutral-600 transition-colors"
                    title={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={openCred}
              className="mt-3 text-xs text-brand-navy hover:text-brand-navy/70 font-medium transition-colors"
            >
              Edit credentials
            </button>
          </Card>

          {/* Tags */}
          <Card>
            <h3 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-1.5">
              <Tag size={14} className="text-neutral-500" /> Tags
            </h3>
            {user.tags && user.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {user.tags.map(tag => (
                  <span key={tag} className="text-xs bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 mb-3">No tags.</p>
            )}
            <button onClick={openEdit} className="text-xs text-brand-navy hover:text-brand-navy/70 font-medium transition-colors">
              + Edit tags
            </button>
          </Card>

          {/* Notes */}
          <Card>
            <h3 className="text-sm font-semibold text-neutral-800 mb-2 flex items-center gap-1.5">
              <MessageSquare size={14} className="text-neutral-500" /> Notes
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {user.notes ?? 'No notes added yet.'}
            </p>
            <button onClick={openEdit} className="mt-3 text-xs text-brand-navy hover:text-brand-navy/70 font-medium transition-colors">
              + Edit notes
            </button>
          </Card>

          {/* Module score table */}
          <Card>
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">Quiz Scores</h3>
            <div className="flex flex-col gap-2">
              {MODULES.filter(m => m.publishState === 'published').map(mod => {
                const prog = user.progress.find(p => p.moduleId === mod.id);
                if (prog?.quizScore === undefined) return null;
                return (
                  <div key={mod.id} className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600 truncate flex-1 mr-2 text-xs">{mod.title.split(' ').slice(0,3).join(' ')}</span>
                    <span className="font-semibold text-xs flex-shrink-0 text-brand-navy">
                      {prog.quizScore}/{prog.quizMaxScore}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Edit Participant Modal ── */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Participant" size="md">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={draft.name ?? ''}
              onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
            />
            <Input
              label="Email"
              type="email"
              value={draft.email ?? ''}
              onChange={e => setDraft(d => ({ ...d, email: e.target.value }))}
            />
          </div>
          <Input
            label="Cohort / Course"
            value={draft.cohort ?? ''}
            onChange={e => setDraft(d => ({ ...d, cohort: e.target.value }))}
            placeholder="e.g. Spring 2024 — Marion County"
          />
          <Select
            label="Status"
            value={draft.status ?? user.status}
            options={STATUS_OPTIONS}
            onChange={e => setDraft(d => ({ ...d, status: e.target.value as ParticipantStatus }))}
          />

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-1">
              {draftTags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 text-xs bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-neutral-400 hover:text-red-500 transition-colors ml-0.5">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="h-9 flex-1 rounded-lg border border-neutral-300 px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy"
                placeholder="Add tag…"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              />
              <button
                type="button"
                onClick={addTag}
                className="h-9 px-3 rounded-lg border border-neutral-300 text-neutral-500 hover:text-brand-navy hover:border-brand-navy transition-colors"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          <Textarea
            label="Notes"
            rows={3}
            value={(draft.notes as string) ?? ''}
            onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))}
            placeholder="Internal notes about this participant…"
          />

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* ── Edit Credentials Modal ── */}
      <Modal open={credOpen} onClose={() => setCredOpen(false)} title="Edit Login Credentials" size="sm">
        <div className="flex flex-col gap-4">
          <Input
            label="Username / Email"
            type="email"
            value={credDraft.username}
            onChange={e => setCredDraft(d => ({ ...d, username: e.target.value }))}
          />
          <Input
            label="New Password"
            type="password"
            value={credDraft.password}
            onChange={e => setCredDraft(d => ({ ...d, password: e.target.value }))}
            placeholder="Leave blank to keep current"
          />
          <Input
            label="Confirm Password"
            type="password"
            value={credDraft.confirm}
            onChange={e => { setCredError(''); setCredDraft(d => ({ ...d, confirm: e.target.value })); }}
            error={credError}
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setCredOpen(false)}>Cancel</Button>
            <Button onClick={saveCred}>Save</Button>
          </div>
        </div>
      </Modal>
    </AdminShell>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
