import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, ChevronDown, X, CheckCircle2, Check } from 'lucide-react';
import { AdminShell } from '../../components/layout/AdminShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { QUESTIONS as SEED_QUESTIONS } from '../../data/questions';
import { MODULES } from '../../data/modules';
import type { QuestionType, Question, ChoiceOption, MatchingPair } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  multi_select:    'Select All That Apply',
  matching:        'Matching',
  short_text:      'Short Response',
  scale:           'Rating Scale',
};

const QUESTION_TYPE_COLORS: Record<QuestionType, string> = {
  multiple_choice: 'bg-brand-blue-pale   text-brand-navy',
  multi_select:    'bg-brand-mint-pale   text-brand-navy',
  matching:        'bg-brand-pink-pale   text-brand-navy',
  short_text:      'bg-brand-yellow-pale text-brand-navy',
  scale:           'bg-neutral-100       text-neutral-600',
};

// ─── Form types ───────────────────────────────────────────────────────────────

type EditForm = {
  prompt: string;
  type: QuestionType;
  moduleId: string;
  points: string;
  options: ChoiceOption[];
  pairs: MatchingPair[];
  correctAnswer: string;
  scaleMin: string;
  scaleMax: string;
  scaleLabelMin: string;
  scaleLabelMax: string;
};

const BLANK_FORM: EditForm = {
  prompt: '',
  type: 'multiple_choice',
  moduleId: 'mod-1',
  points: '1',
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
  scaleMin: '1',
  scaleMax: '5',
  scaleLabelMin: 'Strongly disagree',
  scaleLabelMax: 'Strongly agree',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formToQuestion(form: EditForm, id: string, order: number): Question {
  const mod = MODULES.find(m => m.id === form.moduleId);
  const base = {
    id,
    moduleId: form.moduleId,
    quizId: mod?.quizId ?? '',
    type: form.type,
    prompt: form.prompt.trim(),
    points: Number(form.points) || 0,
    order,
  };
  switch (form.type) {
    case 'multiple_choice':
    case 'multi_select':
      return { ...base, options: form.options.filter(o => o.text.trim()) };
    case 'matching':
      return { ...base, pairs: form.pairs.filter(p => p.left.trim() && p.right.trim()) };
    case 'short_text':
      return { ...base, correctAnswer: form.correctAnswer };
    case 'scale':
      return {
        ...base,
        scaleMin: Number(form.scaleMin),
        scaleMax: Number(form.scaleMax),
        scaleLabels: [form.scaleLabelMin, form.scaleLabelMax] as [string, string],
      };
  }
}

function questionToForm(q: Question): EditForm {
  return {
    prompt: q.prompt,
    type: q.type,
    moduleId: q.moduleId,
    points: String(q.points),
    options: q.options ? q.options.map(o => ({ ...o })) : BLANK_FORM.options,
    pairs: q.pairs ? q.pairs.map(p => ({ ...p })) : BLANK_FORM.pairs,
    correctAnswer: q.correctAnswer ?? '',
    scaleMin: String(q.scaleMin ?? 1),
    scaleMax: String(q.scaleMax ?? 5),
    scaleLabelMin: q.scaleLabels?.[0] ?? 'Strongly disagree',
    scaleLabelMax: q.scaleLabels?.[1] ?? 'Strongly agree',
  };
}

let nextId = 100;
function genId() { return `q-new-${++nextId}`; }

// ─── Component ────────────────────────────────────────────────────────────────

export function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>(SEED_QUESTIONS);
  const [search, setSearch]       = useState('');
  const [modFilter, setModFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm]           = useState<EditForm>(BLANK_FORM);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  // ─── Derived ──────────────────────────────────────────────────────────────

  const filtered = questions.filter(q => {
    const matchSearch = !search || q.prompt.toLowerCase().includes(search.toLowerCase());
    const matchMod    = modFilter === 'all' || q.moduleId === modFilter;
    const matchType   = typeFilter === 'all' || q.type === typeFilter;
    return matchSearch && matchMod && matchType;
  });

  const modOptions = [
    { value: 'all', label: 'All Modules' },
    ...MODULES.filter(m => m.publishState === 'published').map(m => ({ value: m.id, label: m.title })),
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    ...Object.entries(QUESTION_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })),
  ];

  // ─── Validation ───────────────────────────────────────────────────────────

  const isValid = (() => {
    if (!form.prompt.trim()) return false;
    if (form.type === 'multiple_choice' || form.type === 'multi_select') {
      const filled = form.options.filter(o => o.text.trim());
      if (filled.length < 2) return false;
      if (!filled.some(o => o.isCorrect)) return false;
    }
    if (form.type === 'matching') {
      const filledPairs = form.pairs.filter(p => p.left.trim() && p.right.trim());
      if (filledPairs.length < 2) return false;
    }
    return true;
  })();

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...BLANK_FORM });
    setModalOpen(true);
  };

  const openEdit = (q: Question) => {
    setEditingId(q.id);
    setForm(questionToForm(q));
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!isValid) return;

    if (editingId) {
      setQuestions(qs =>
        qs.map(q => q.id === editingId ? formToQuestion(form, editingId, q.order) : q)
      );
      setSavedId(editingId);
      setExpandedId(editingId);
    } else {
      const id = genId();
      const order = questions.filter(q => q.moduleId === form.moduleId).length + 1;
      const newQ = formToQuestion(form, id, order);
      setQuestions(qs => [...qs, newQ]);
      setSavedId(id);
      setExpandedId(id);
    }

    setModalOpen(false);
    setTimeout(() => setSavedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    setQuestions(qs => qs.filter(q => q.id !== id));
    setDeleteConfirmId(null);
    if (expandedId === id) setExpandedId(null);
  };

  // ─── Form helpers ─────────────────────────────────────────────────────────

  const setOpt = (i: number, patch: Partial<ChoiceOption>) =>
    setForm(f => ({ ...f, options: f.options.map((o, oi) => oi === i ? { ...o, ...patch } : o) }));

  const addOption = () =>
    setForm(f => ({
      ...f,
      options: [...f.options, { id: String.fromCharCode(97 + f.options.length), text: '', isCorrect: false }],
    }));

  const removeOption = (i: number) =>
    setForm(f => ({ ...f, options: f.options.filter((_, oi) => oi !== i) }));

  const setPair = (i: number, patch: Partial<MatchingPair>) =>
    setForm(f => ({ ...f, pairs: f.pairs.map((p, pi) => pi === i ? { ...p, ...patch } : p) }));

  const addPair = () =>
    setForm(f => ({
      ...f,
      pairs: [...f.pairs, { id: `p${f.pairs.length + 1}`, left: '', right: '' }],
    }));

  const removePair = (i: number) =>
    setForm(f => ({ ...f, pairs: f.pairs.filter((_, pi) => pi !== i) }));

  const handleTypeChange = (newType: QuestionType) => {
    setForm(f => ({
      ...BLANK_FORM,
      prompt: f.prompt,
      moduleId: f.moduleId,
      points: f.points,
      type: newType,
    }));
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Question Bank</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{questions.length} questions across all modules</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={15} /> New Question
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions…"
              className="h-9 w-full rounded-lg border border-neutral-300 pl-9 pr-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy"
            />
          </div>
          <select
            value={modFilter}
            onChange={e => setModFilter(e.target.value)}
            className="h-9 rounded-lg border border-neutral-300 px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-navy"
          >
            {modOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="h-9 rounded-lg border border-neutral-300 px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-navy"
          >
            {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </Card>

      {/* Question list */}
      <Card padding="none">
        <div className="divide-y divide-neutral-100">
          {filtered.map((q, idx) => {
            const mod = MODULES.find(m => m.id === q.moduleId);
            const expanded = expandedId === q.id;
            const justSaved = savedId === q.id;

            return (
              <div key={q.id} className={`group transition-colors ${justSaved ? 'bg-brand-mint-pale' : ''}`}>
                <div
                  className="flex items-start gap-3 p-4 hover:bg-neutral-50 cursor-pointer transition-colors"
                  onClick={() => setExpandedId(expanded ? null : q.id)}
                >
                  <div className="mt-0.5 text-xs font-semibold text-neutral-400 w-5 flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${QUESTION_TYPE_COLORS[q.type]}`}>
                        {QUESTION_TYPE_LABELS[q.type]}
                      </span>
                      {mod && (
                        <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                          {mod.title.split(' ').slice(0,3).join(' ')}
                        </span>
                      )}
                      {q.points > 0 && (
                        <span className="text-xs text-neutral-400">{q.points} pt{q.points !== 1 ? 's' : ''}</span>
                      )}
                      {justSaved && (
                        <span className="text-xs text-brand-navy font-medium flex items-center gap-1">
                          <CheckCircle2 size={12} /> Saved
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-neutral-800 leading-snug">{q.prompt}</p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); openEdit(q); }}
                      className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setDeleteConfirmId(q.id); }}
                      className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                    <ChevronDown size={14} className={`text-neutral-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded preview */}
                {expanded && (
                  <div className="px-4 pb-4 ml-8 animate-fade-in">
                    {(q.type === 'multiple_choice' || q.type === 'multi_select') && q.options && (
                      <div className="flex flex-col gap-1.5">
                        {q.options.map(opt => (
                          <div
                            key={opt.id}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${opt.isCorrect ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-neutral-50 text-neutral-700 border border-neutral-200'}`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${opt.isCorrect ? 'border-green-500 bg-green-500' : 'border-neutral-300'}`}>
                              {opt.isCorrect && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            {opt.text}
                            {opt.isCorrect && <span className="ml-auto text-xs text-green-600 font-medium">Correct</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    {q.type === 'matching' && q.pairs && (
                      <div className="grid grid-cols-2 gap-2">
                        <p className="text-xs font-medium text-neutral-500">Item</p>
                        <p className="text-xs font-medium text-neutral-500">Matches with</p>
                        {q.pairs.map(p => (
                          <div key={p.id} className="contents">
                            <div className="bg-neutral-50 rounded-lg px-3 py-2 text-sm text-neutral-700 border border-neutral-200">{p.left}</div>
                            <div className="bg-green-50 rounded-lg px-3 py-2 text-sm text-green-800 border border-green-200">{p.right}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {q.type === 'short_text' && (
                      <div className="bg-brand-blue-pale rounded-lg px-3 py-2.5 text-sm text-brand-navy border border-brand-blue">
                        <span className="font-medium">Model answer: </span>{q.correctAnswer}
                      </div>
                    )}
                    {q.type === 'scale' && (
                      <div className="flex items-center gap-3">
                        {Array.from({ length: (q.scaleMax ?? 5) - (q.scaleMin ?? 1) + 1 }, (_, i) => i + (q.scaleMin ?? 1)).map(val => (
                          <div key={val} className="w-10 h-10 rounded-xl border-2 border-neutral-200 flex items-center justify-center text-sm font-semibold text-neutral-600 bg-neutral-50">
                            {val}
                          </div>
                        ))}
                        <div className="ml-2 text-xs text-neutral-500">
                          {q.scaleLabels?.[0]} → {q.scaleLabels?.[1]}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-neutral-400 text-sm">No questions match your filters.</div>
          )}
        </div>
      </Card>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Question"
        size="sm"
      >
        <p className="text-sm text-neutral-600 mb-5">
          Are you sure you want to delete this question? This can't be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => handleDelete(deleteConfirmId!)}>Delete</Button>
        </div>
      </Modal>

      {/* Add / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Question' : 'New Question'}
        size="lg"
      >
        <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Module + Type row */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Module"
              value={form.moduleId}
              onChange={e => setForm(f => ({ ...f, moduleId: e.target.value }))}
              options={MODULES.filter(m => m.publishState === 'published').map(m => ({ value: m.id, label: m.title }))}
            />
            <Select
              label="Question Type"
              value={form.type}
              onChange={e => handleTypeChange(e.target.value as QuestionType)}
              options={Object.entries(QUESTION_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            />
          </div>

          {/* Prompt */}
          <Textarea
            label="Question Prompt"
            value={form.prompt}
            onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
            placeholder="Enter the question text…"
            rows={3}
          />

          {/* ── Multiple choice / Select-all ── */}
          {(form.type === 'multiple_choice' || form.type === 'multi_select') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-neutral-700">Answer Options</label>
                <p className="text-xs text-neutral-400">
                  {form.type === 'multiple_choice'
                    ? 'Click "Correct" to mark the right answer'
                    : 'Mark all correct answers'}
                </p>
              </div>

              {/* Correct-answer status indicator */}
              {(() => {
                const correctCount = form.options.filter(o => o.isCorrect).length;
                if (correctCount === 0 && form.options.filter(o => o.text.trim()).length >= 2) {
                  return (
                    <div className="flex items-center gap-1.5 text-xs text-brand-navy bg-brand-yellow-pale border border-brand-yellow rounded-lg px-3 py-2 mb-3">
                      <span className="font-medium">No correct answer set.</span>
                      <span className="text-brand-navy/70">
                        {form.type === 'multiple_choice'
                          ? 'Click the "Correct" button on the right answer.'
                          : 'Click "Correct" on every answer that applies.'}
                      </span>
                    </div>
                  );
                }
                if (correctCount > 0) {
                  return (
                    <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
                      <CheckCircle2 size={13} />
                      <span className="font-medium">
                        {correctCount} correct answer{correctCount !== 1 ? 's' : ''} set.
                      </span>
                      {form.type === 'multiple_choice' && correctCount > 1 && (
                        <span className="text-neutral-600 ml-1">Multiple choice allows only one — deselect extras.</span>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

              <div className="flex flex-col gap-2">
                {form.options.map((opt, i) => (
                  <div
                    key={opt.id}
                    className={`flex items-center gap-2 rounded-xl border-2 p-2 transition-colors ${
                      opt.isCorrect
                        ? 'border-green-400 bg-green-50'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    {/* Letter label */}
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      opt.isCorrect ? 'bg-green-500 text-white' : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      {opt.id.toUpperCase()}
                    </span>

                    {/* Text input */}
                    <input
                      type="text"
                      value={opt.text}
                      onChange={e => setOpt(i, { text: e.target.value })}
                      placeholder={`Enter option ${opt.id.toUpperCase()}…`}
                      className="flex-1 h-8 bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
                    />

                    {/* Mark correct button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (form.type === 'multiple_choice') {
                          setForm(f => ({ ...f, options: f.options.map((o, oi) => ({ ...o, isCorrect: oi === i })) }));
                        } else {
                          setOpt(i, { isCorrect: !opt.isCorrect });
                        }
                      }}
                      className={`flex items-center gap-1 px-2.5 h-7 rounded-lg text-xs font-semibold border transition-all flex-shrink-0 ${
                        opt.isCorrect
                          ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
                          : 'border-neutral-300 text-neutral-500 hover:border-green-400 hover:text-green-600 hover:bg-green-50'
                      }`}
                      title={opt.isCorrect ? 'Remove correct answer' : 'Mark as correct'}
                    >
                      <Check size={11} strokeWidth={3} />
                      {opt.isCorrect ? 'Correct' : 'Mark correct'}
                    </button>

                    {/* Remove option */}
                    {form.options.length > 2 && (
                      <button
                        onClick={() => removeOption(i)}
                        className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-neutral-300 hover:text-red-400 transition-colors flex-shrink-0"
                        title="Remove option"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addOption}
                  className="text-xs text-green-600 hover:text-green-700 font-medium text-left mt-1 py-1 flex items-center gap-1"
                >
                  <Plus size={12} /> Add option
                </button>
              </div>
            </div>
          )}

          {/* ── Matching ── */}
          {form.type === 'matching' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-neutral-700">Correct Pairings</label>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
                <CheckCircle2 size={13} />
                <span>Each row defines a correct match. Right-side options will be shuffled for learners.</span>
              </div>
              <div className="grid grid-cols-[1fr_1fr_28px] gap-x-2 gap-y-2 items-center">
                <p className="text-xs font-semibold text-neutral-600 flex items-center gap-1">Item (left column)</p>
                <p className="text-xs font-semibold text-green-700 flex items-center gap-1">
                  <Check size={11} strokeWidth={3} /> Correct match (right column)
                </p>
                <div />
                {form.pairs.map((pair, i) => (
                  <>
                    <input
                      key={`l-${pair.id}`}
                      type="text"
                      value={pair.left}
                      onChange={e => setPair(i, { left: e.target.value })}
                      placeholder={`Item ${i + 1}`}
                      className="h-8 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy"
                    />
                    <div key={`r-${pair.id}`} className="relative">
                      <Check size={12} strokeWidth={3} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none" />
                      <input
                        type="text"
                        value={pair.right}
                        onChange={e => setPair(i, { right: e.target.value })}
                        placeholder={`Correct match ${i + 1}`}
                        className="h-8 w-full rounded-lg border border-green-300 bg-green-50 pl-7 pr-3 text-sm text-green-900 placeholder:text-green-400 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy"
                      />
                    </div>
                    {form.pairs.length > 2 ? (
                      <button
                        key={`del-${pair.id}`}
                        onClick={() => removePair(i)}
                        className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-neutral-300 hover:text-red-400 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    ) : <div key={`del-${pair.id}`} />}
                  </>
                ))}
              </div>
              <button onClick={addPair} className="text-xs text-brand-navy hover:text-brand-navy-mid font-medium mt-2 py-1">
                + Add pair
              </button>
            </div>
          )}

          {/* ── Short text ── */}
          {form.type === 'short_text' && (
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={15} className="text-green-600 flex-shrink-0" />
                  <label className="text-sm font-semibold text-green-800">Correct Answer / Model Response</label>
                </div>
                <textarea
                  value={form.correctAnswer}
                  onChange={e => setForm(f => ({ ...f, correctAnswer: e.target.value }))}
                  placeholder="Enter the ideal answer here. This will be shown to learners as feedback after they submit, and is visible to researchers reviewing responses."
                  rows={3}
                  className="w-full bg-white border border-green-300 rounded-lg px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy resize-none"
                />
                <p className="text-xs text-green-700 mt-2">
                  Shown to learners after submission as a reference. Researchers see this alongside each learner's actual response.
                </p>
              </div>
            </div>
          )}

          {/* ── Scale ── */}
          {form.type === 'scale' && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Minimum value"
                  type="number"
                  value={form.scaleMin}
                  onChange={e => setForm(f => ({ ...f, scaleMin: e.target.value }))}
                  min={0}
                />
                <Input
                  label="Maximum value"
                  type="number"
                  value={form.scaleMax}
                  onChange={e => setForm(f => ({ ...f, scaleMax: e.target.value }))}
                  min={1}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min label"
                  value={form.scaleLabelMin}
                  onChange={e => setForm(f => ({ ...f, scaleLabelMin: e.target.value }))}
                  placeholder="e.g. Not confident"
                />
                <Input
                  label="Max label"
                  value={form.scaleLabelMax}
                  onChange={e => setForm(f => ({ ...f, scaleLabelMax: e.target.value }))}
                  placeholder="e.g. Very confident"
                />
              </div>
              {/* Preview */}
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-2">Preview</p>
                <div className="flex items-center gap-2">
                  {Array.from(
                    { length: Math.min(10, Math.max(2, Number(form.scaleMax) - Number(form.scaleMin) + 1)) },
                    (_, i) => i + Number(form.scaleMin)
                  ).map(val => (
                    <div key={val} className="w-10 h-10 rounded-xl border-2 border-neutral-200 flex items-center justify-center text-sm font-semibold text-neutral-600 bg-neutral-50">
                      {val}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-neutral-400 mt-1">
                  <span>{form.scaleLabelMin}</span>
                  <span>{form.scaleLabelMax}</span>
                </div>
              </div>
            </div>
          )}

          {/* Point value */}
          <div className="flex items-end gap-3">
            <Input
              label="Point Value"
              type="number"
              value={form.points}
              onChange={e => setForm(f => ({ ...f, points: e.target.value }))}
              className="w-24"
              min={0}
            />
            {form.type === 'scale' && (
              <p className="text-xs text-neutral-400 pb-2">Rating questions are typically worth 0 points (reflection only)</p>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-neutral-150 mt-4">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {editingId ? 'Save Changes' : 'Add Question'}
          </Button>
        </div>
      </Modal>
    </AdminShell>
  );
}
