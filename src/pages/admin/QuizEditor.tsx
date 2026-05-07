import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, Trash2, Plus, GripVertical, X, ChevronDown, Check, Info, ArrowRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useParams, useLocation } from 'wouter';
import { AdminShell } from '../../components/layout/AdminShell';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { MODULES } from '../../data/modules';
import { quizDataStore } from '../../stores/quizDataStore';
import type { SimpleQuestionType } from '../../stores/quizDataStore';

// ─── Draft types ───────────────────────────────────────────────────────────────

interface OptionDraft {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
  showFeedback: boolean;
}

interface QuestionDraft {
  _key: string;
  type: SimpleQuestionType;
  text: string;
  options: OptionDraft[];
  modelAnswer: string;
  points: string;
  deleteConfirm: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function blankOption(id: string, text = ''): OptionDraft {
  return { id, text, isCorrect: false, feedback: '', showFeedback: false };
}

function newQuestion(type: SimpleQuestionType): QuestionDraft {
  const key = `q-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  if (type === 'multiple_choice') {
    return {
      _key: key, type, text: '',
      options: [blankOption('a'), blankOption('b'), blankOption('c'), blankOption('d')],
      modelAnswer: '', points: '1', deleteConfirm: false,
    };
  }
  if (type === 'true_false') {
    return {
      _key: key, type, text: '',
      options: [
        { id: 'true',  text: 'True',  isCorrect: false, feedback: '', showFeedback: false },
        { id: 'false', text: 'False', isCorrect: false, feedback: '', showFeedback: false },
      ],
      modelAnswer: '', points: '1', deleteConfirm: false,
    };
  }
  return { _key: key, type: 'short_answer', text: '', options: [], modelAnswer: '', points: '0', deleteConfirm: false };
}

const TYPE_LABELS: Record<SimpleQuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  true_false:      'True/False',
  short_answer:    'Short Answer',
};

// ─── Component ─────────────────────────────────────────────────────────────────

export function QuizEditor() {
  const { id } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const isNew = !id;

  const existing = isNew ? undefined : quizDataStore.getById(id!);

  const [newId] = useState(() => `quiz-${Date.now()}`);
  const quizId = isNew ? newId : id!;

  // ── Form fields ────────────────────────────────────────────────────────────
  const [title, setTitle]           = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [moduleId]                   = useState(existing?.moduleId ?? '');
  const [dueAt, setDueAt]           = useState(existing?.dueAt ?? '');
  const [status, setStatus]         = useState<'published' | 'draft'>(existing?.status ?? 'draft');
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const assignedModule = MODULES.find(m => m.id === moduleId);

  // ── Questions ──────────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState<QuestionDraft[]>(() => {
    if (!existing?.questions?.length) return [];
    return existing.questions.map(q => ({
      _key: q.id,
      type: q.type,
      text: q.text,
      options: q.options.map(o => ({ ...o, showFeedback: !!o.feedback })),
      modelAnswer: q.modelAnswer,
      points: String(q.points),
      deleteConfirm: false,
    }));
  });

  const [showTypePicker, setShowTypePicker] = useState(false);
  const typePickerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showTypePicker) return;
    const handler = (e: MouseEvent) => {
      if (typePickerRef.current && !typePickerRef.current.contains(e.target as Node)) setShowTypePicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTypePicker]);

  // ── Drag reorder ───────────────────────────────────────────────────────────
  const [dragState, setDragState] = useState<{ fromIdx: number; overIdx: number } | null>(null);

  const handleDragStart = (fromIdx: number) => setDragState({ fromIdx, overIdx: fromIdx });
  const handleDragOver  = (e: React.DragEvent, overIdx: number) => {
    e.preventDefault();
    setDragState(s => s ? { ...s, overIdx } : s);
  };
  const handleDrop = () => {
    if (!dragState || dragState.fromIdx === dragState.overIdx) { setDragState(null); return; }
    setQuestions(qs => {
      const next = [...qs];
      const [moved] = next.splice(dragState.fromIdx, 1);
      next.splice(dragState.overIdx, 0, moved);
      return next;
    });
    setDragState(null);
  };

  // auto-calculate total points
  const totalPoints = questions.reduce((s, q) => s + (Number(q.points) || 0), 0);

  // ── Question helpers ───────────────────────────────────────────────────────

  const updateQ = (key: string, patch: Partial<QuestionDraft>) =>
    setQuestions(qs => qs.map(q => q._key === key ? { ...q, ...patch } : q));

  const updateOption = (qKey: string, optId: string, patch: Partial<OptionDraft>) =>
    setQuestions(qs => qs.map(q => {
      if (q._key !== qKey) return q;
      return { ...q, options: q.options.map(o => o.id === optId ? { ...o, ...patch } : o) };
    }));

  const markCorrect = (qKey: string, optId: string) =>
    setQuestions(qs => qs.map(q => {
      if (q._key !== qKey) return q;
      return { ...q, options: q.options.map(o => ({ ...o, isCorrect: o.id === optId })) };
    }));

  const addOption = (qKey: string) =>
    setQuestions(qs => qs.map(q => {
      if (q._key !== qKey) return q;
      const nextId = String.fromCharCode(97 + q.options.length);
      return { ...q, options: [...q.options, blankOption(nextId)] };
    }));

  const removeOption = (qKey: string, optId: string) =>
    setQuestions(qs => qs.map(q => {
      if (q._key !== qKey) return q;
      return { ...q, options: q.options.filter(o => o.id !== optId) };
    }));

  const addQuestion = (type: SimpleQuestionType) => {
    setQuestions(qs => [...qs, newQuestion(type)]);
    setShowTypePicker(false);
  };

  const deleteQuestion = (key: string) =>
    setQuestions(qs => qs.filter(q => q._key !== key));

  // ── Save & Delete ──────────────────────────────────────────────────────────

  const handleSave = () => {
    if (!title.trim()) return;
    const trimmedTitle = title.trim();
    const data = {
      id: quizId,
      title: trimmedTitle,
      description,
      moduleId,
      dueAt,
      status,
      questions: questions.map((q, i) => ({
        id: q._key,
        type: q.type,
        text: q.text,
        options: q.options.map(({ showFeedback: _sf, ...o }) => o),
        modelAnswer: q.modelAnswer,
        points: Number(q.points) || 0,
        order: i + 1,
      })),
    };
    if (existing) {
      quizDataStore.update(data);
      navigate(`/admin/questions?saved=${encodeURIComponent(trimmedTitle)}`);
    } else {
      quizDataStore.add(data);
      navigate(`/admin/questions?created=${encodeURIComponent(trimmedTitle)}`);
    }
  };

  const handleDelete = () => {
    quizDataStore.delete(quizId);
    navigate(`/admin/questions?deleted=${encodeURIComponent(title || 'Quiz')}`);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AdminShell>
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/questions')}
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            <ArrowLeft size={15} /> Back
          </button>
          <span className="text-neutral-200">|</span>
          <h1 className="text-xl font-bold text-neutral-900">
            {isNew ? 'New Quiz' : 'Edit Quiz'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Published / Draft toggle */}
          <div className="relative">
            <button
              onClick={() => setShowStatusDrop(p => !p)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              {status === 'published' ? 'Published' : 'Draft'}
              <ChevronDown size={14} />
            </button>
            {showStatusDrop && (
              <>
                <div className="fixed inset-0 z-[5]" onClick={() => setShowStatusDrop(false)} />
                <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-neutral-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  {(['published', 'draft'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setStatus(opt); setShowStatusDrop(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      {status === opt
                        ? <Check size={13} className="text-brand-navy" />
                        : <span className="w-[13px]" />}
                      <span>{opt === 'published' ? 'Published' : 'Draft'}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <Button onClick={handleSave} disabled={!title.trim()}>
            Save Changes
          </Button>

          {!isNew && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 hover:text-red-600 transition-colors border border-red-100"
              title="Delete quiz"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-8 items-start">

        {/* Left — Quiz Details */}
        <div className="flex flex-col gap-5">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Quiz Details</p>

          <Input
            label="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Module 1 Quiz"
          />

          <Textarea
            label="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief overview of this quiz…"
            rows={3}
          />

          {/* Module assignment callout */}
          {assignedModule ? (
            <div className="p-4 rounded-xl bg-brand-mint-pale border border-brand-mint text-brand-navy text-sm">
              <div className="flex items-center gap-2 mb-2">
                <Info size={15} className="flex-shrink-0" />
                <span className="font-medium">Quiz is assigned to {assignedModule.title}</span>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/admin/modules/${assignedModule.id}/edit`)}
                className="flex items-center gap-1 text-sm font-medium hover:underline"
              >
                Go to module <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-500">
              <Info size={15} className="flex-shrink-0" />
              <span>Not assigned to any module. Assign this quiz from the module editor.</span>
            </div>
          )}

          <Input
            label="Due Date"
            type="date"
            value={dueAt}
            onChange={e => setDueAt(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Points Total</label>
            <input
              type="number"
              readOnly
              value={totalPoints}
              className="h-9 w-full rounded-lg border border-neutral-200 px-3 text-sm text-neutral-500 bg-neutral-50 cursor-not-allowed"
            />
            <p className="text-xs text-neutral-400">Auto-calculated from question points.</p>
          </div>
        </div>

        {/* Right — Questions */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Questions <span className="ml-1 font-normal normal-case">({questions.length})</span>
          </p>

          {questions.length === 0 && (
            <p className="text-sm text-neutral-400 py-2">No questions yet. Add one below.</p>
          )}

          {questions.map((q, idx) => {
            const isDragging = dragState?.fromIdx === idx;
            const isOver = dragState !== null && dragState.overIdx === idx && dragState.fromIdx !== idx;
            const isChoiceType = q.type === 'multiple_choice' || q.type === 'true_false';

            return (
              <div
                key={q._key}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={e => handleDragOver(e, idx)}
                onDrop={handleDrop}
                onDragEnd={() => setDragState(null)}
                className={clsx(
                  'border rounded-xl overflow-hidden bg-white shadow-sm transition-all',
                  isDragging ? 'opacity-40' : 'opacity-100',
                  isOver ? 'border-brand-navy ring-2 ring-brand-navy/20' : 'border-neutral-200',
                )}
              >
                {/* Card header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50 border-b border-neutral-200">
                  <GripVertical
                    size={15}
                    className="text-neutral-400 flex-shrink-0 cursor-grab active:cursor-grabbing"
                  />
                  <span className="flex-1 text-sm font-semibold text-neutral-700 flex items-center gap-2 min-w-0">
                    <span className="flex-shrink-0">Question {idx + 1}</span>
                    <span className="px-2 py-0.5 rounded-full bg-neutral-200 text-xs font-medium text-neutral-500 flex-shrink-0">
                      {TYPE_LABELS[q.type]}
                    </span>
                  </span>

                  {/* Points input */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input
                      type="number"
                      min={0}
                      value={q.points}
                      onChange={e => updateQ(q._key, { points: e.target.value })}
                      className="w-14 h-7 border border-neutral-300 rounded-lg px-2 text-xs text-neutral-700 bg-white text-center focus:outline-none focus:ring-2 focus:ring-brand-navy"
                      title="Points"
                    />
                    <span className="text-xs text-neutral-400">pts</span>
                  </div>

                  {/* Delete with inline confirm */}
                  {q.deleteConfirm ? (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs text-red-600 font-medium">Delete?</span>
                      <button
                        onClick={() => deleteQuestion(q._key)}
                        className="px-2 h-7 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => updateQ(q._key, { deleteConfirm: false })}
                        className="px-2 h-7 rounded-lg border border-neutral-300 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => updateQ(q._key, { deleteConfirm: true })}
                      className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-neutral-300 hover:text-red-500 transition-colors flex-shrink-0"
                      title="Delete question"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                {/* Card body */}
                <div className="px-4 py-4 flex flex-col gap-4">
                  {/* Question text */}
                  <textarea
                    value={q.text}
                    onChange={e => updateQ(q._key, { text: e.target.value })}
                    placeholder="Enter question text…"
                    rows={2}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy"
                  />

                  {/* Multiple Choice / True-False options */}
                  {isChoiceType && (
                    <div className="flex flex-col gap-2">
                      {q.options.map(opt => (
                        <div key={opt.id} className="flex flex-col gap-1">
                          <div className={clsx(
                            'flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors',
                            opt.isCorrect ? 'border-green-400 bg-green-50' : 'border-neutral-200 bg-white',
                          )}>
                            {/* Radio indicator — click to mark correct */}
                            <button
                              type="button"
                              onClick={() => markCorrect(q._key, opt.id)}
                              className={clsx(
                                'w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                                opt.isCorrect
                                  ? 'border-green-500 bg-green-500'
                                  : 'border-neutral-300 hover:border-green-400',
                              )}
                              title="Mark as correct"
                            >
                              {opt.isCorrect && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </button>

                            {/* Option text (read-only for TF) */}
                            {q.type === 'true_false' ? (
                              <span className="flex-1 text-sm text-neutral-700">{opt.text}</span>
                            ) : (
                              <input
                                type="text"
                                value={opt.text}
                                onChange={e => updateOption(q._key, opt.id, { text: e.target.value })}
                                placeholder={`Option ${opt.id.toUpperCase()}…`}
                                className="flex-1 h-7 bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
                              />
                            )}

                            {/* Correct label */}
                            {opt.isCorrect && (
                              <span className="text-xs text-green-700 font-medium flex-shrink-0 flex items-center gap-0.5">
                                <Check size={11} strokeWidth={3} /> Correct
                              </span>
                            )}

                            {/* Add feedback link */}
                            {!opt.showFeedback && (
                              <button
                                type="button"
                                onClick={() => updateOption(q._key, opt.id, { showFeedback: true })}
                                className="text-xs text-neutral-400 hover:text-brand-navy transition-colors flex-shrink-0 whitespace-nowrap"
                              >
                                Add feedback
                              </button>
                            )}

                            {/* Remove option (MC only, min 2) */}
                            {q.type === 'multiple_choice' && q.options.length > 2 && (
                              <button
                                onClick={() => removeOption(q._key, opt.id)}
                                className="w-5 h-5 rounded flex items-center justify-center text-neutral-300 hover:text-red-400 transition-colors flex-shrink-0"
                                title="Remove option"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>

                          {/* Feedback field */}
                          {opt.showFeedback && (
                            <div className="ml-7 flex items-center gap-1.5">
                              <input
                                type="text"
                                value={opt.feedback}
                                onChange={e => updateOption(q._key, opt.id, { feedback: e.target.value })}
                                placeholder="Feedback for this option…"
                                className="flex-1 h-7 rounded border border-neutral-200 px-2 text-xs text-neutral-700 bg-neutral-50 focus:outline-none focus:ring-1 focus:ring-brand-navy"
                              />
                              <button
                                onClick={() => updateOption(q._key, opt.id, { showFeedback: false, feedback: '' })}
                                className="text-neutral-300 hover:text-neutral-500 transition-colors"
                                title="Remove feedback"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add option (MC only) */}
                      {q.type === 'multiple_choice' && (
                        <button
                          onClick={() => addOption(q._key)}
                          className="flex items-center gap-1 text-xs text-brand-navy hover:text-brand-navy/80 transition-colors self-start mt-1"
                        >
                          <Plus size={12} /> Add option
                        </button>
                      )}
                    </div>
                  )}

                  {/* Short Answer */}
                  {q.type === 'short_answer' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-neutral-500">Model Answer (optional)</label>
                      <input
                        type="text"
                        value={q.modelAnswer}
                        onChange={e => updateQ(q._key, { modelAnswer: e.target.value })}
                        placeholder="Enter the ideal answer shown after submission…"
                        className="h-8 rounded-lg border border-neutral-300 px-3 text-sm text-neutral-900 bg-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-navy"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add Question + type picker */}
          <div className="relative">
            <button
              onClick={() => setShowTypePicker(p => !p)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-neutral-300 text-sm text-brand-navy hover:border-brand-navy hover:bg-brand-mint-pale transition-colors w-full justify-center"
            >
              <Plus size={14} /> Add Question
            </button>
            {showTypePicker && (
              <div
                ref={typePickerRef}
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden z-20 min-w-[180px]"
              >
                {(['multiple_choice', 'true_false', 'short_answer'] as SimpleQuestionType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => addQuestion(type)}
                    className="w-full px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 text-left transition-colors"
                  >
                    {TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Quiz"
        size="sm"
      >
        <p className="text-sm text-neutral-600 mb-5">
          Are you sure you want to delete <strong>{title || 'this quiz'}</strong> and all its questions? This can't be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </AdminShell>
  );
}
