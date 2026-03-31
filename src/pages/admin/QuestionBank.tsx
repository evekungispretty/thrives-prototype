import { useState } from 'react';
import {
  Search, Plus, MoreVertical, Rocket, ChevronDown, ChevronRight,
  Edit2, Trash2, Copy, Check, GripVertical, CheckCircle2, X,
} from 'lucide-react';
import { AdminShell } from '../../components/layout/AdminShell';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { MODULES } from '../../data/modules';
import { QUESTIONS as SEED_QUESTIONS } from '../../data/questions';
import type { QuestionType, Question, ChoiceOption, MatchingPair } from '../../types';

// ─── Quiz types ───────────────────────────────────────────────────────────────

type QuizStatus = 'published' | 'draft' | 'closed' | 'unavailable';

interface Quiz {
  id: string;
  title: string;
  status: QuizStatus;
  moduleId?: string;
  availableFrom?: string;
  dueAt?: string;
  timeLimitMinutes?: number;
  totalPoints: number;
  completed: boolean;
}

const INITIAL_QUIZZES: Quiz[] = [
  { id: 'quiz-1',   title: 'Quiz 1',               status: 'closed',      moduleId: 'mod-1', dueAt: 'Feb 4 at 8pm',      totalPoints: 10, completed: true  },
  { id: 'quiz-2',   title: 'Quiz 2',               status: 'closed',      moduleId: 'mod-2', dueAt: 'Mar 9 at 9pm',      totalPoints: 10, completed: true  },
  { id: 'quiz-3',   title: 'Quiz 3',               status: 'unavailable', moduleId: 'mod-3', availableFrom: 'Apr 15 at 12:30pm', dueAt: 'Apr 15 at 1:30pm', totalPoints: 10, completed: true },
  { id: 'quiz-inf', title: 'Infant Feeding Quiz',  status: 'closed',      moduleId: 'mod-1', dueAt: 'Feb 28 at 11:59pm', totalPoints: 10, completed: true  },
];

// ─── Quiz form ────────────────────────────────────────────────────────────────

interface QuizForm {
  title: string; moduleId: string; status: QuizStatus;
  availableFrom: string; dueAt: string;
  timeLimitMinutes: string; totalPoints: string;
}

const EMPTY_QUIZ_FORM: QuizForm = {
  title: '', moduleId: '', status: 'draft',
  availableFrom: '', dueAt: '', timeLimitMinutes: '', totalPoints: '10',
};

const QUIZ_STATUS_OPTIONS = [
  { value: 'published',   label: 'Published' },
  { value: 'draft',       label: 'Draft' },
  { value: 'closed',      label: 'Closed' },
  { value: 'unavailable', label: 'Not Yet Available' },
];

// ─── Question form ────────────────────────────────────────────────────────────

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  multi_select:    'Select All That Apply',
  matching:        'Matching',
  short_text:      'Short Response',
  scale:           'Rating Scale',
};

interface QForm {
  prompt: string; type: QuestionType; points: string;
  options: ChoiceOption[]; pairs: MatchingPair[];
  correctAnswer: string;
  scaleMin: string; scaleMax: string;
  scaleLabelMin: string; scaleLabelMax: string;
}

const BLANK_Q_FORM: QForm = {
  prompt: '', type: 'multiple_choice', points: '1',
  options: [
    { id: 'a', text: '', isCorrect: false },
    { id: 'b', text: '', isCorrect: false },
    { id: 'c', text: '', isCorrect: false },
    { id: 'd', text: '', isCorrect: false },
  ],
  pairs: [
    { id: 'p1', left: '', right: '' },
    { id: 'p2', left: '', right: '' },
    { id: 'p3', left: '', right: '' },
    { id: 'p4', left: '', right: '' },
  ],
  correctAnswer: '',
  scaleMin: '1', scaleMax: '5',
  scaleLabelMin: 'Strongly disagree', scaleLabelMax: 'Strongly agree',
};

function questionToForm(q: Question): QForm {
  return {
    prompt: q.prompt, type: q.type, points: String(q.points),
    options: q.options ? q.options.map(o => ({ ...o })) : BLANK_Q_FORM.options,
    pairs: q.pairs ? q.pairs.map(p => ({ ...p })) : BLANK_Q_FORM.pairs,
    correctAnswer: q.correctAnswer ?? '',
    scaleMin: String(q.scaleMin ?? 1), scaleMax: String(q.scaleMax ?? 5),
    scaleLabelMin: q.scaleLabels?.[0] ?? 'Strongly disagree',
    scaleLabelMax: q.scaleLabels?.[1] ?? 'Strongly agree',
  };
}

let _nextQId = 200;
function genQId() { return `q-new-${++_nextQId}`; }

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a datetime-local string (YYYY-MM-DDTHH:mm) to display format (e.g. "Apr 15 at 12:30pm") */
function datetimeLocalToDisplay(value: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  const hours = d.getHours();
  const mins = d.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const h = hours % 12 || 12;
  const minStr = mins === 0 ? '' : `:${String(mins).padStart(2, '0')}`;
  return `${month} ${day} at ${h}${minStr}${ampm}`;
}

/** Convert a display string like "Apr 15 at 12:30pm" to datetime-local (YYYY-MM-DDTHH:mm) */
function displayToDatetimeLocal(value: string): string {
  if (!value) return '';
  // If already in datetime-local format, return as-is
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
  const d = new Date(value.replace(' at ', ' '));
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function statusLine(quiz: Quiz): string {
  if (quiz.status === 'closed')      return 'Closed';
  if (quiz.status === 'unavailable') return quiz.availableFrom ? `Not available until ${quiz.availableFrom}` : 'Not yet available';
  if (quiz.status === 'draft')       return 'Draft';
  return 'Published';
}

// Group seed questions by quizId
function seedQuestions(): Record<string, Question[]> {
  const map: Record<string, Question[]> = {};
  for (const q of SEED_QUESTIONS) {
    if (!map[q.quizId]) map[q.quizId] = [];
    map[q.quizId].push(q);
  }
  return map;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QuestionBank() {
  const [quizzes, setQuizzes]             = useState<Quiz[]>(INITIAL_QUIZZES);
  const [questionsByQuiz, setQByQuiz]     = useState<Record<string, Question[]>>(seedQuestions);
  const [search, setSearch]               = useState('');
  const [sectionOpen, setSectionOpen]     = useState(true);
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);
  const [activeKebab, setActiveKebab]     = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Quiz modal
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [quizForm, setQuizForm]           = useState<QuizForm>(EMPTY_QUIZ_FORM);

  // Question modal
  const [qModalOpen, setQModalOpen]       = useState(false);
  const [qModalQuizId, setQModalQuizId]   = useState<string>('');
  const [editingQId, setEditingQId]       = useState<string | null>(null);
  const [qForm, setQForm]                 = useState<QForm>(BLANK_Q_FORM);
  const [qDeleteId, setQDeleteId]         = useState<{ quizId: string; qId: string } | null>(null);

  // ── Derived ──────────────────────────────────────────────────────────────

  const filtered = quizzes.filter(q =>
    !search || q.title.toLowerCase().includes(search.toLowerCase())
  );

  const moduleOptions = [
    { value: '', label: 'None (unassigned)' },
    ...MODULES.map(m => ({ value: m.id, label: m.title })),
  ];

  // ── Quiz handlers ─────────────────────────────────────────────────────────

  const openCreateQuiz = () => {
    setEditingQuizId(null);
    setQuizForm(EMPTY_QUIZ_FORM);
    setQuizModalOpen(true);
  };

  const openEditQuiz = (quiz: Quiz) => {
    setEditingQuizId(quiz.id);
    setQuizForm({
      title: quiz.title, moduleId: quiz.moduleId ?? '',
      status: quiz.status,
      availableFrom: displayToDatetimeLocal(quiz.availableFrom ?? ''), dueAt: displayToDatetimeLocal(quiz.dueAt ?? ''),
      timeLimitMinutes: quiz.timeLimitMinutes ? String(quiz.timeLimitMinutes) : '',
      totalPoints: String(quiz.totalPoints),
    });
    setActiveKebab(null);
    setQuizModalOpen(true);
  };

  const handleSaveQuiz = () => {
    if (!quizForm.title.trim()) return;
    const patch = {
      title: quizForm.title.trim(),
      moduleId: quizForm.moduleId || undefined,
      status: quizForm.status,
      availableFrom: quizForm.availableFrom ? datetimeLocalToDisplay(quizForm.availableFrom) : undefined,
      dueAt: quizForm.dueAt ? datetimeLocalToDisplay(quizForm.dueAt) : undefined,
      timeLimitMinutes: quizForm.timeLimitMinutes ? Number(quizForm.timeLimitMinutes) : undefined,
      totalPoints: Number(quizForm.totalPoints) || 10,
    };
    if (editingQuizId) {
      setQuizzes(qs => qs.map(q => q.id === editingQuizId ? { ...q, ...patch } : q));
    } else {
      const newId = `quiz-${Date.now()}`;
      setQuizzes(qs => [...qs, { ...patch, id: newId, completed: false }]);
      setQByQuiz(m => ({ ...m, [newId]: [] }));
    }
    setQuizModalOpen(false);
  };

  const handleDuplicateQuiz = (quiz: Quiz) => {
    const newId = `quiz-${Date.now()}`;
    setQuizzes(qs => [...qs, { ...quiz, id: newId, title: `${quiz.title} (Copy)`, status: 'draft', completed: false }]);
    setQByQuiz(m => ({ ...m, [newId]: (m[quiz.id] ?? []).map(q => ({ ...q, id: genQId(), quizId: newId })) }));
    setActiveKebab(null);
  };

  const handleDeleteQuiz = (id: string) => {
    setQuizzes(qs => qs.filter(q => q.id !== id));
    setQByQuiz(m => { const next = { ...m }; delete next[id]; return next; });
    if (expandedQuizId === id) setExpandedQuizId(null);
    setDeleteConfirmId(null);
  };

  // ── Question handlers ──────────────────────────────────────────────────────

  const openAddQuestion = (quizId: string) => {
    setQModalQuizId(quizId);
    setEditingQId(null);
    setQForm({ ...BLANK_Q_FORM });
    setQModalOpen(true);
  };

  const openEditQuestion = (quizId: string, q: Question) => {
    setQModalQuizId(quizId);
    setEditingQId(q.id);
    setQForm(questionToForm(q));
    setQModalOpen(true);
  };

  const handleSaveQuestion = () => {
    if (!qForm.prompt.trim()) return;
    const quizId = qModalQuizId;
    const existing = questionsByQuiz[quizId] ?? [];

    const buildQ = (id: string, order: number): Question => {
      const base = { id, moduleId: quizzes.find(q => q.id === quizId)?.moduleId ?? '', quizId, type: qForm.type, prompt: qForm.prompt.trim(), points: Number(qForm.points) || 0, order };
      switch (qForm.type) {
        case 'multiple_choice':
        case 'multi_select':
          return { ...base, options: qForm.options.filter(o => o.text.trim()) };
        case 'matching':
          return { ...base, pairs: qForm.pairs.filter(p => p.left.trim() && p.right.trim()) };
        case 'short_text':
          return { ...base, correctAnswer: qForm.correctAnswer };
        case 'scale':
          return { ...base, scaleMin: Number(qForm.scaleMin), scaleMax: Number(qForm.scaleMax), scaleLabels: [qForm.scaleLabelMin, qForm.scaleLabelMax] };
      }
    };

    if (editingQId) {
      setQByQuiz(m => ({ ...m, [quizId]: existing.map(q => q.id === editingQId ? buildQ(editingQId, q.order) : q) }));
    } else {
      const id = genQId();
      setQByQuiz(m => ({ ...m, [quizId]: [...existing, buildQ(id, existing.length + 1)] }));
    }
    setQModalOpen(false);
  };

  const handleDeleteQuestion = () => {
    if (!qDeleteId) return;
    const { quizId, qId } = qDeleteId;
    setQByQuiz(m => ({ ...m, [quizId]: (m[quizId] ?? []).filter(q => q.id !== qId) }));
    setQDeleteId(null);
  };

  // ── Question form helpers ──────────────────────────────────────────────────

  const setOpt = (i: number, patch: Partial<ChoiceOption>) =>
    setQForm(f => ({ ...f, options: f.options.map((o, oi) => oi === i ? { ...o, ...patch } : o) }));

  const addOption = () =>
    setQForm(f => ({ ...f, options: [...f.options, { id: String.fromCharCode(97 + f.options.length), text: '', isCorrect: false }] }));

  const removeOption = (i: number) =>
    setQForm(f => ({ ...f, options: f.options.filter((_, oi) => oi !== i) }));

  const setPair = (i: number, patch: Partial<MatchingPair>) =>
    setQForm(f => ({ ...f, pairs: f.pairs.map((p, pi) => pi === i ? { ...p, ...patch } : p) }));

  const addPair = () =>
    setQForm(f => ({ ...f, pairs: [...f.pairs, { id: `p${f.pairs.length + 1}`, left: '', right: '' }] }));

  const removePair = (i: number) =>
    setQForm(f => ({ ...f, pairs: f.pairs.filter((_, pi) => pi !== i) }));

  const handleTypeChange = (newType: QuestionType) =>
    setQForm(f => ({ ...BLANK_Q_FORM, prompt: f.prompt, points: f.points, type: newType }));

  const isQValid = (() => {
    if (!qForm.prompt.trim()) return false;
    if (qForm.type === 'multiple_choice' || qForm.type === 'multi_select') {
      const filled = qForm.options.filter(o => o.text.trim());
      return filled.length >= 2 && filled.some(o => o.isCorrect);
    }
    if (qForm.type === 'matching') {
      return qForm.pairs.filter(p => p.left.trim() && p.right.trim()).length >= 2;
    }
    return true;
  })();

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <AdminShell>
      {/* Click-outside for kebab */}
      {activeKebab && <div className="fixed inset-0 z-10" onClick={() => setActiveKebab(null)} />}

      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search for Quiz"
            className="h-9 w-full rounded-lg border border-neutral-300 pl-9 pr-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy"
          />
        </div>
        <div className="flex-1" />
        <Button onClick={openCreateQuiz}><Plus size={15} /> Quiz/Survey</Button>
        <button className="w-9 h-9 rounded-lg border border-neutral-200 hover:bg-neutral-50 flex items-center justify-center text-neutral-500 transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Assignment Quizzes section */}
      <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
        <button
          onClick={() => setSectionOpen(v => !v)}
          className="w-full flex items-center gap-2 px-4 py-3 bg-neutral-50 hover:bg-neutral-100 transition-colors text-left border-b border-neutral-200"
        >
          {sectionOpen ? <ChevronDown size={15} className="text-neutral-600" /> : <ChevronRight size={15} className="text-neutral-600" />}
          <span className="text-sm font-semibold text-neutral-800">Assignment Quizzes</span>
        </button>

        {sectionOpen && (
          <div>
            {filtered.length === 0 && (
              <p className="py-10 text-center text-sm text-neutral-400">No quizzes match your search.</p>
            )}

            {filtered.map(quiz => {
              const mod = MODULES.find(m => m.id === quiz.moduleId);
              const kebabOpen = activeKebab === quiz.id;
              const isExpanded = expandedQuizId === quiz.id;
              const questions = questionsByQuiz[quiz.id] ?? [];

              return (
                <div key={quiz.id} className="border-b border-neutral-100 last:border-b-0">
                  {/* Quiz row */}
                  <div
                    className="relative flex items-center gap-4 pl-1 pr-5 py-4 hover:bg-neutral-50 transition-colors cursor-pointer group"
                    onClick={() => setExpandedQuizId(isExpanded ? null : quiz.id)}
                  >
                    <div className="w-1 self-stretch bg-brand-mint rounded-sm flex-shrink-0" />
                    <Rocket size={17} className="text-brand-navy flex-shrink-0 ml-1" strokeWidth={1.75} />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-900">{quiz.title}</p>
                      <div className="flex flex-wrap items-center gap-x-3 mt-0.5 text-xs text-neutral-500">
                        <span className={quiz.status === 'unavailable' ? 'font-medium text-neutral-700' : ''}>
                          {statusLine(quiz)}
                        </span>
                        {quiz.dueAt && <span>Due {quiz.dueAt}</span>}
                        <span>{quiz.totalPoints} pts</span>
                        <span>{questions.length} Question{questions.length !== 1 ? 's' : ''}</span>
                        {mod && <span className="text-neutral-400 hidden sm:inline">· {mod.title}</span>}
                      </div>
                    </div>

                    {/* Completed indicator */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${quiz.completed ? 'bg-brand-navy/75' : 'border-2 border-neutral-200'}`}>
                      {quiz.completed && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>

                    {/* Expand chevron */}
                    <ChevronDown size={15} className={`text-neutral-400 transition-transform flex-shrink-0 ${isExpanded ? '' : '-rotate-90'}`} />

                    {/* Kebab */}
                    <div className="relative z-20 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveKebab(kebabOpen ? null : quiz.id)}
                        className="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                        <MoreVertical size={15} />
                      </button>
                      {kebabOpen && (
                        <div className="absolute right-0 top-9 bg-white rounded-xl shadow-lg border border-neutral-200 py-1 w-44">
                          <button onClick={() => openEditQuiz(quiz)} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                            <Edit2 size={13} /> Edit Quiz Settings
                          </button>
                          <button onClick={() => handleDuplicateQuiz(quiz)} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                            <Copy size={13} /> Duplicate
                          </button>
                          <div className="border-t border-neutral-100 my-1" />
                          <button onClick={() => { setDeleteConfirmId(quiz.id); setActiveKebab(null); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={13} /> Delete Quiz
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded questions view */}
                  {isExpanded && (
                    <div className="bg-neutral-50 border-t border-neutral-100 px-6 py-4 flex flex-col gap-3">
                      {questions.length === 0 && (
                        <p className="text-sm text-neutral-400 py-2 text-center">No questions yet. Add one below.</p>
                      )}

                      {questions.map((q, idx) => (
                        <div key={q.id} className="border border-neutral-200 rounded-xl overflow-hidden bg-white group/q shadow-sm">
                          {/* Canvas-style question header */}
                          <div className="flex items-center gap-3 px-4 py-2.5 bg-neutral-100 border-b border-neutral-200">
                            <GripVertical size={15} className="text-neutral-400 flex-shrink-0 cursor-grab" />
                            <span className="text-sm font-semibold text-neutral-700 flex-1">
                              Question {idx + 1}
                              <span className="ml-2 text-xs font-normal text-neutral-400">{QUESTION_TYPE_LABELS[q.type]}</span>
                            </span>
                            <span className="text-sm text-neutral-500 mr-2">{q.points} pt{q.points !== 1 ? 's' : ''}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover/q:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditQuestion(quiz.id, q)}
                                className="w-7 h-7 rounded-lg hover:bg-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
                                title="Edit question"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => setQDeleteId({ quizId: quiz.id, qId: q.id })}
                                className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors"
                                title="Delete question"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Question body */}
                          <div className="px-4 py-3">
                            <p className="text-sm text-neutral-800">{q.prompt}</p>

                            {/* Answer preview */}
                            {(q.type === 'multiple_choice' || q.type === 'multi_select') && q.options && (
                              <div className="flex flex-col gap-1.5 mt-3">
                                {q.options.map(opt => (
                                  <div key={opt.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${opt.isCorrect ? 'bg-green-50 text-green-800 border-green-200' : 'bg-neutral-50 text-neutral-600 border-neutral-200'}`}>
                                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${opt.isCorrect ? 'border-green-500 bg-green-500' : 'border-neutral-300'}`}>
                                      {opt.isCorrect && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                    {opt.text}
                                    {opt.isCorrect && <span className="ml-auto text-green-600 font-medium">Correct</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                            {q.type === 'matching' && q.pairs && (
                              <div className="grid grid-cols-2 gap-1.5 mt-3">
                                {q.pairs.map(p => (
                                  <div key={p.id} className="contents text-xs">
                                    <div className="bg-neutral-50 rounded-lg px-3 py-1.5 border border-neutral-200 text-neutral-700">{p.left}</div>
                                    <div className="bg-green-50 rounded-lg px-3 py-1.5 border border-green-200 text-green-800">{p.right}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {q.type === 'short_text' && q.correctAnswer && (
                              <div className="mt-2 text-xs text-neutral-500 bg-neutral-50 rounded-lg px-3 py-2 border border-neutral-200">
                                <span className="font-medium">Model answer:</span> {q.correctAnswer}
                              </div>
                            )}
                            {q.type === 'scale' && (
                              <div className="flex items-center gap-2 mt-3">
                                {Array.from({ length: (q.scaleMax ?? 5) - (q.scaleMin ?? 1) + 1 }, (_, i) => i + (q.scaleMin ?? 1)).map(val => (
                                  <div key={val} className="w-8 h-8 rounded-lg border-2 border-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-600 bg-neutral-50">{val}</div>
                                ))}
                                <span className="text-xs text-neutral-400 ml-1">{q.scaleLabels?.[0]} → {q.scaleLabels?.[1]}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => openAddQuestion(quiz.id)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-neutral-300 text-sm text-brand-navy hover:border-brand-navy hover:bg-brand-mint-pale transition-colors w-full justify-center"
                      >
                        <Plus size={14} /> New Question
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}

      {/* Delete quiz confirmation */}
      <Modal open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Delete Quiz" size="sm">
        <p className="text-sm text-neutral-600 mb-5">Are you sure you want to delete this quiz and all its questions? This can't be undone.</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => handleDeleteQuiz(deleteConfirmId!)}>Delete</Button>
        </div>
      </Modal>

      {/* Delete question confirmation */}
      <Modal open={!!qDeleteId} onClose={() => setQDeleteId(null)} title="Delete Question" size="sm">
        <p className="text-sm text-neutral-600 mb-5">Are you sure you want to delete this question? This can't be undone.</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setQDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteQuestion}>Delete</Button>
        </div>
      </Modal>

      {/* Create / Edit Quiz */}
      <Modal open={quizModalOpen} onClose={() => setQuizModalOpen(false)} title={editingQuizId ? 'Edit Quiz Settings' : 'New Quiz'} size="md">
        <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
          <Input label="Quiz Title" value={quizForm.title} onChange={e => setQuizForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Module 1 Quiz" />
          <Select label="Assign to Module" value={quizForm.moduleId} onChange={e => setQuizForm(f => ({ ...f, moduleId: e.target.value }))} options={moduleOptions} />
          <Select label="Status" value={quizForm.status} onChange={e => setQuizForm(f => ({ ...f, status: e.target.value as QuizStatus }))} options={QUIZ_STATUS_OPTIONS} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Available From" type="datetime-local" value={quizForm.availableFrom} onChange={e => setQuizForm(f => ({ ...f, availableFrom: e.target.value }))} />
            <Input label="Due At" type="datetime-local" value={quizForm.dueAt} onChange={e => setQuizForm(f => ({ ...f, dueAt: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Time Limit (minutes)" type="number" value={quizForm.timeLimitMinutes} onChange={e => setQuizForm(f => ({ ...f, timeLimitMinutes: e.target.value }))} placeholder="No limit" min={1} />
            <Input label="Total Points" type="number" value={quizForm.totalPoints} onChange={e => setQuizForm(f => ({ ...f, totalPoints: e.target.value }))} min={0} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-neutral-100">
          <Button variant="ghost" onClick={() => setQuizModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveQuiz} disabled={!quizForm.title.trim()}>{editingQuizId ? 'Save Changes' : 'Create Quiz'}</Button>
        </div>
      </Modal>

      {/* Create / Edit Question */}
      <Modal open={qModalOpen} onClose={() => setQModalOpen(false)} title={editingQId ? 'Edit Question' : 'New Question'} size="lg">
        <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1">

          {/* Type selector */}
          <Select
            label="Question Type"
            value={qForm.type}
            onChange={e => handleTypeChange(e.target.value as QuestionType)}
            options={Object.entries(QUESTION_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
          />

          {/* Prompt */}
          <Textarea
            label="Question Prompt"
            value={qForm.prompt}
            onChange={e => setQForm(f => ({ ...f, prompt: e.target.value }))}
            placeholder="Enter the question text…"
            rows={3}
          />

          {/* ── Multiple choice / Select-all ── */}
          {(qForm.type === 'multiple_choice' || qForm.type === 'multi_select') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-neutral-700">Answer Options</label>
                <p className="text-xs text-neutral-400">
                  {qForm.type === 'multiple_choice' ? 'Click "Correct" to mark the right answer' : 'Mark all correct answers'}
                </p>
              </div>

              {/* Correct-answer status */}
              {(() => {
                const correctCount = qForm.options.filter(o => o.isCorrect).length;
                if (correctCount === 0 && qForm.options.filter(o => o.text.trim()).length >= 2) {
                  return (
                    <div className="flex items-center gap-1.5 text-xs text-brand-navy bg-brand-yellow-pale border border-brand-yellow rounded-lg px-3 py-2 mb-3">
                      <span className="font-medium">No correct answer set.</span>
                      <span className="text-brand-navy/70">{qForm.type === 'multiple_choice' ? 'Click "Correct" on the right answer.' : 'Click "Correct" on every answer that applies.'}</span>
                    </div>
                  );
                }
                if (correctCount > 0) {
                  return (
                    <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
                      <CheckCircle2 size={13} />
                      <span className="font-medium">{correctCount} correct answer{correctCount !== 1 ? 's' : ''} set.</span>
                      {qForm.type === 'multiple_choice' && correctCount > 1 && (
                        <span className="text-neutral-600 ml-1">Multiple choice allows only one — deselect extras.</span>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

              <div className="flex flex-col gap-2">
                {qForm.options.map((opt, i) => (
                  <div key={opt.id} className={`flex items-center gap-2 rounded-xl border-2 p-2 transition-colors ${opt.isCorrect ? 'border-green-400 bg-green-50' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}>
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${opt.isCorrect ? 'bg-green-500 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                      {opt.id.toUpperCase()}
                    </span>
                    <input
                      type="text" value={opt.text}
                      onChange={e => setOpt(i, { text: e.target.value })}
                      placeholder={`Enter option ${opt.id.toUpperCase()}…`}
                      className="flex-1 h-8 bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (qForm.type === 'multiple_choice') {
                          setQForm(f => ({ ...f, options: f.options.map((o, oi) => ({ ...o, isCorrect: oi === i })) }));
                        } else {
                          setOpt(i, { isCorrect: !opt.isCorrect });
                        }
                      }}
                      className={`flex items-center gap-1 px-2.5 h-7 rounded-lg text-xs font-semibold border transition-all flex-shrink-0 ${opt.isCorrect ? 'bg-green-500 border-green-500 text-white hover:bg-green-600' : 'border-neutral-300 text-neutral-500 hover:border-green-400 hover:text-green-600 hover:bg-green-50'}`}
                    >
                      <Check size={11} strokeWidth={3} />
                      {opt.isCorrect ? 'Correct' : 'Mark correct'}
                    </button>
                    {qForm.options.length > 2 && (
                      <button onClick={() => removeOption(i)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-neutral-300 hover:text-red-400 transition-colors flex-shrink-0">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={addOption} className="text-xs text-green-600 hover:text-green-700 font-medium text-left mt-1 py-1 flex items-center gap-1">
                  <Plus size={12} /> Add option
                </button>
              </div>
            </div>
          )}

          {/* ── Matching ── */}
          {qForm.type === 'matching' && (
            <div>
              <label className="text-sm font-medium text-neutral-700 block mb-2">Correct Pairings</label>
              <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
                <CheckCircle2 size={13} />
                <span>Each row defines a correct match. Right-side options will be shuffled for learners.</span>
              </div>
              <div className="grid grid-cols-[1fr_1fr_28px] gap-x-2 gap-y-2 items-center">
                <p className="text-xs font-semibold text-neutral-600">Item (left column)</p>
                <p className="text-xs font-semibold text-green-700 flex items-center gap-1"><Check size={11} strokeWidth={3} /> Correct match</p>
                <div />
                {qForm.pairs.map((pair, i) => (
                  <>
                    <input key={`l-${pair.id}`} type="text" value={pair.left} onChange={e => setPair(i, { left: e.target.value })} placeholder={`Item ${i + 1}`} className="h-8 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy" />
                    <div key={`r-${pair.id}`} className="relative">
                      <Check size={12} strokeWidth={3} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none" />
                      <input type="text" value={pair.right} onChange={e => setPair(i, { right: e.target.value })} placeholder={`Match ${i + 1}`} className="h-8 w-full rounded-lg border border-green-300 bg-green-50 pl-7 pr-3 text-sm text-green-900 placeholder:text-green-400 focus:outline-none focus:ring-2 focus:ring-brand-navy" />
                    </div>
                    {qForm.pairs.length > 2
                      ? <button key={`del-${pair.id}`} onClick={() => removePair(i)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-neutral-300 hover:text-red-400 transition-colors"><X size={13} /></button>
                      : <div key={`del-${pair.id}`} />}
                  </>
                ))}
              </div>
              <button onClick={addPair} className="text-xs text-brand-navy hover:text-brand-navy/80 font-medium mt-2 py-1">+ Add pair</button>
            </div>
          )}

          {/* ── Short text ── */}
          {qForm.type === 'short_text' && (
            <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={15} className="text-green-600 flex-shrink-0" />
                <label className="text-sm font-semibold text-green-800">Model Answer / Correct Response</label>
              </div>
              <textarea
                value={qForm.correctAnswer}
                onChange={e => setQForm(f => ({ ...f, correctAnswer: e.target.value }))}
                placeholder="Enter the ideal answer. Shown to learners after submission as a reference."
                rows={3}
                className="w-full bg-white border border-green-300 rounded-lg px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-navy resize-none"
              />
            </div>
          )}

          {/* ── Scale ── */}
          {qForm.type === 'scale' && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Minimum value" type="number" value={qForm.scaleMin} onChange={e => setQForm(f => ({ ...f, scaleMin: e.target.value }))} min={0} />
                <Input label="Maximum value" type="number" value={qForm.scaleMax} onChange={e => setQForm(f => ({ ...f, scaleMax: e.target.value }))} min={1} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Min label" value={qForm.scaleLabelMin} onChange={e => setQForm(f => ({ ...f, scaleLabelMin: e.target.value }))} placeholder="e.g. Not confident" />
                <Input label="Max label" value={qForm.scaleLabelMax} onChange={e => setQForm(f => ({ ...f, scaleLabelMax: e.target.value }))} placeholder="e.g. Very confident" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-2">Preview</p>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(10, Math.max(2, Number(qForm.scaleMax) - Number(qForm.scaleMin) + 1)) }, (_, i) => i + Number(qForm.scaleMin)).map(val => (
                    <div key={val} className="w-10 h-10 rounded-xl border-2 border-neutral-200 flex items-center justify-center text-sm font-semibold text-neutral-600 bg-neutral-50">{val}</div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-neutral-400 mt-1">
                  <span>{qForm.scaleLabelMin}</span><span>{qForm.scaleLabelMax}</span>
                </div>
              </div>
            </div>
          )}

          {/* Point value */}
          <div className="flex items-end gap-3">
            <Input
              label="Point Value" type="number" value={qForm.points}
              onChange={e => setQForm(f => ({ ...f, points: e.target.value }))}
              className="w-24" min={0}
            />
            {qForm.type === 'scale' && (
              <p className="text-xs text-neutral-400 pb-2">Rating questions are typically worth 0 points (reflection only)</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100 mt-4">
          <Button variant="ghost" onClick={() => setQModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveQuestion} disabled={!isQValid}>{editingQId ? 'Save Changes' : 'Add Question'}</Button>
        </div>
      </Modal>
    </AdminShell>
  );
}
