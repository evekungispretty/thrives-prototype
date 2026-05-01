import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown, ChevronUp, Plus, Trash2, X,
  ExternalLink, Tag, ArrowLeft, Check,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useParams, useLocation } from 'wouter';
import { AdminShell } from '../../components/layout/AdminShell';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { MODULES } from '../../data/modules';
import { moduleStore } from '../../stores/moduleStore';
import type { Lesson, Module, TopicTag } from '../../types';

// ─── Static options ────────────────────────────────────────────────────────────

const INITIAL_TOPIC_OPTIONS: { value: string; label: string }[] = [
  { value: 'infant-feeding',      label: 'Infant Feeding' },
  { value: 'tummy-time',          label: 'Tummy Time' },
  { value: 'screen-time',         label: 'Screen Time' },
  { value: 'sleep',               label: 'Sleep' },
  { value: 'development',         label: 'Development' },
  { value: 'caregiver-wellbeing', label: 'Caregiver Wellbeing' },
];

const QUIZ_OPTIONS = [
  { value: '', label: 'No quiz assigned' },
  ...MODULES.map(m => ({ value: m.quizId, label: `${m.quizId} — ${m.title}` })),
];

// ─── Form state ────────────────────────────────────────────────────────────────

interface ModuleFormState {
  title: string;
  description: string;
  tag: string;
  estimatedMinutes: string;
  publishState: 'published' | 'draft';
  thumbnail: string;
  quizId: string;
}

const EMPTY_FORM: ModuleFormState = {
  title: '',
  description: '',
  tag: 'infant-feeding',
  estimatedMinutes: '30',
  publishState: 'draft',
  thumbnail: '',
  quizId: '',
};

function moduleToForm(mod: Module): ModuleFormState {
  return {
    title: mod.title,
    description: mod.description,
    tag: mod.tag,
    estimatedMinutes: String(mod.estimatedMinutes),
    publishState: mod.publishState,
    thumbnail: mod.thumbnail ?? '',
    quizId: mod.quizId ?? '',
  };
}

// ─── Lesson draft ──────────────────────────────────────────────────────────────

interface ResourceDraft { label: string; url: string; }

interface LessonDraft {
  _key: string;
  id: string;
  title: string;
  description: string;
  durationMinutes: string;
  videoUrl: string;
  videoThumb: string;
  bodyContent: string;
  topics: string;
  resources: ResourceDraft[];
  _original?: Lesson;
}

function lessonToDraft(lesson: Lesson): LessonDraft {
  return {
    _key: lesson.id,
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    durationMinutes: String(lesson.durationMinutes),
    videoUrl: lesson.videoUrl ?? '',
    videoThumb: lesson.videoThumb ?? '#E2E8F0',
    bodyContent: lesson.bodyContent ?? '',
    topics: (lesson.topics ?? []).join(', '),
    resources: lesson.resources.length > 0 ? lesson.resources.map(r => ({ ...r })) : [],
    _original: lesson,
  };
}

function draftToLesson(draft: LessonDraft, moduleId: string, order: number): Lesson {
  const base: Lesson = draft._original ?? {
    id: draft.id,
    moduleId,
    title: '',
    description: '',
    durationMinutes: 0,
    videoThumb: '#E2E8F0',
    bodyContent: '',
    resources: [],
    order,
    status: 'not_started',
  };
  return {
    ...base,
    id: draft.id,
    moduleId,
    title: draft.title.trim(),
    description: draft.description.trim(),
    durationMinutes: Math.max(1, Number(draft.durationMinutes) || 1),
    videoUrl: draft.videoUrl.trim() || undefined,
    videoThumb: draft.videoThumb,
    bodyContent: draft.bodyContent,
    topics: draft.topics.split(',').map(t => t.trim()).filter(Boolean),
    resources: draft.resources.filter(r => r.label.trim()),
    order,
  };
}

const EMPTY_LESSON_DRAFT = (): LessonDraft => {
  const key = `new-${Date.now()}-${Math.random()}`;
  return {
    _key: key, id: key, title: '', description: '',
    durationMinutes: '5', videoUrl: '', videoThumb: '#E2E8F0',
    bodyContent: '', topics: '', resources: [],
  };
};

// ─── Component ─────────────────────────────────────────────────────────────────

export function ModuleEditor() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const isNew = id === 'new';

  const existingModule = isNew ? undefined : moduleStore.getById(id);

  const [newId] = useState(() => `mod-${Date.now()}`);
  const moduleId = isNew ? newId : id;

  const [form, setForm] = useState<ModuleFormState>(() =>
    existingModule ? moduleToForm(existingModule) : EMPTY_FORM
  );
  const [errors, setErrors] = useState<Partial<ModuleFormState>>({});
  const [lessonDrafts, setLessonDrafts] = useState<LessonDraft[]>(() =>
    existingModule ? existingModule.lessons.map(lessonToDraft) : []
  );
  const [expandedLessonKeys, setExpandedLessonKeys] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const [showPublishDropdown, setShowPublishDropdown] = useState(false);

  // ── Topic dropdown state ───────────────────────────────────────────────────
  const [topicOptions, setTopicOptions] = useState(INITIAL_TOPIC_OPTIONS);
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [addingNewTopic, setAddingNewTopic] = useState(false);
  const [newTopicInput, setNewTopicInput] = useState('');
  const topicRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showTopicDropdown) return;
    const handler = (e: MouseEvent) => {
      if (topicRef.current && !topicRef.current.contains(e.target as Node)) {
        setShowTopicDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTopicDropdown]);

  const handleAddTopic = () => {
    const label = newTopicInput.trim();
    if (!label) return;
    const value = label.toLowerCase().replace(/\s+/g, '-');
    setTopicOptions(prev => [...prev, { value, label }]);
    setForm(f => ({ ...f, tag: value }));
    setAddingNewTopic(false);
    setNewTopicInput('');
  };

  // ── Thumbnail drag-and-drop ────────────────────────────────────────────────
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setForm(f => ({ ...f, thumbnail: url }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files[0] ?? null);
  };

  // ── Lesson helpers ─────────────────────────────────────────────────────────

  const toggleLessonExpand = (key: string) => {
    setExpandedLessonKeys(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const updateLesson = (key: string, patch: Partial<LessonDraft>) => {
    setLessonDrafts(prev => prev.map(d => d._key === key ? { ...d, ...patch } : d));
  };

  const addLesson = () => {
    const draft = EMPTY_LESSON_DRAFT();
    setLessonDrafts(prev => [...prev, draft]);
    setExpandedLessonKeys(prev => new Set(prev).add(draft._key));
  };

  const deleteLesson = (key: string) => {
    setLessonDrafts(prev => prev.filter(d => d._key !== key));
    setExpandedLessonKeys(prev => { const next = new Set(prev); next.delete(key); return next; });
  };

  const addResource = (key: string) => {
    updateLesson(key, {
      resources: [...(lessonDrafts.find(d => d._key === key)?.resources ?? []), { label: '', url: '' }],
    });
  };

  const updateResource = (lessonKey: string, idx: number, patch: Partial<ResourceDraft>) => {
    setLessonDrafts(prev => prev.map(d => {
      if (d._key !== lessonKey) return d;
      return { ...d, resources: d.resources.map((r, i) => i === idx ? { ...r, ...patch } : r) };
    }));
  };

  const removeResource = (lessonKey: string, idx: number) => {
    setLessonDrafts(prev => prev.map(d => {
      if (d._key !== lessonKey) return d;
      return { ...d, resources: d.resources.filter((_, i) => i !== idx) };
    }));
  };

  // ── Validate & save ────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errs: Partial<ModuleFormState> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    const mins = Number(form.estimatedMinutes);
    if (!form.estimatedMinutes || isNaN(mins) || mins < 1) errs.estimatedMinutes = 'Enter a valid number of minutes';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const mins = Number(form.estimatedMinutes);
    const lessons = lessonDrafts
      .filter(d => d.title.trim())
      .map((d, i) => draftToLesson(d, moduleId, i + 1));

    if (existingModule) {
      moduleStore.update({
        ...existingModule,
        title: form.title.trim(),
        description: form.description.trim(),
        tag: form.tag as TopicTag,
        estimatedMinutes: mins,
        publishState: form.publishState,
        thumbnail: form.thumbnail || undefined,
        quizId: form.quizId,
        lessons,
      });
    } else {
      const newMod: Module = {
        id: moduleId,
        title: form.title.trim(),
        description: form.description.trim(),
        tag: form.tag as TopicTag,
        estimatedMinutes: mins,
        publishState: form.publishState,
        thumbnail: form.thumbnail || undefined,
        quizId: form.quizId,
        order: moduleStore.getAll().length + 1,
        status: 'not_started',
        completedLessons: 0,
        lessons: lessons.map(l => ({ ...l, moduleId })),
      };
      moduleStore.add(newMod);
    }
    navigate('/admin/content');
  };

  const handleDelete = () => {
    moduleStore.delete(id);
    navigate(`/admin/content?deleted=${encodeURIComponent(form.title || 'Module')}`);
  };

  // ── Not found ──────────────────────────────────────────────────────────────

  if (!isNew && !existingModule) {
    return (
      <AdminShell>
        <p className="text-neutral-500">Module not found.</p>
      </AdminShell>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AdminShell>
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/content')}
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            <ArrowLeft size={15} /> Back
          </button>
          <span className="text-neutral-200">|</span>
          <h1 className="text-xl font-bold text-neutral-900">
            {isNew ? 'New Module' : 'Edit Module'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Published / Draft dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPublishDropdown(p => !p)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              {form.publishState === 'published' ? 'Published' : 'Draft'}
              <ChevronDown size={14} />
            </button>
            {showPublishDropdown && (
              <>
                <div className="fixed inset-0 z-[5]" onClick={() => setShowPublishDropdown(false)} />
                <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-neutral-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  {['published', 'draft'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setForm(f => ({ ...f, publishState: opt as 'published' | 'draft' })); setShowPublishDropdown(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors capitalize"
                    >
                      {form.publishState === opt && <Check size={13} className="text-brand-navy" />}
                      <span className={form.publishState === opt ? 'ml-0' : 'ml-[21px]'}>{opt === 'published' ? 'Published' : 'Draft'}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <Button onClick={handleSave}>
            {isNew ? 'Create Module' : 'Save Changes'}
          </Button>
          {!isNew && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 hover:text-red-600 transition-colors border border-red-100"
              title="Delete module"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">

      {/* Left column — module details */}
      <div className="flex flex-col gap-8">

        <section className="flex flex-col gap-4">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Module Details</p>
          <Input
            label="Title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Sleep Safety"
            error={errors.title}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Brief overview of the module…"
            rows={3}
            error={errors.description}
          />

          {/* Topic — Carbon-style custom dropdown */}
          <div className="flex flex-col gap-1.5" ref={topicRef}>
            <label className="text-sm font-medium text-neutral-700">Topic</label>
            {addingNewTopic ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  type="text"
                  value={newTopicInput}
                  onChange={e => setNewTopicInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddTopic();
                    if (e.key === 'Escape') { setAddingNewTopic(false); setNewTopicInput(''); }
                  }}
                  placeholder="New topic name"
                  className="flex-1 h-10 border border-neutral-400 bg-white px-3 text-sm text-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy"
                />
                <button
                  type="button"
                  onClick={handleAddTopic}
                  className="h-10 px-3 rounded-lg bg-brand-navy text-white text-sm hover:bg-brand-navy/90 transition-colors flex items-center"
                  title="Confirm"
                >
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => { setAddingNewTopic(false); setNewTopicInput(''); }}
                  className="h-10 px-3 rounded-lg border border-neutral-300 bg-white text-neutral-600 text-sm hover:bg-neutral-50 transition-colors flex items-center"
                  title="Cancel"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTopicDropdown(p => !p)}
                  className="w-full h-10 border border-neutral-400 bg-white pl-3 pr-8 text-sm text-neutral-900 text-left rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy flex items-center"
                >
                  {topicOptions.find(o => o.value === form.tag)?.label ?? 'Select topic'}
                </button>
                <ChevronDown
                  size={16}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500"
                />
                {showTopicDropdown && (
                  <div className="absolute left-0 right-0 top-full border border-neutral-400 border-t-0 bg-white z-20 shadow-md max-h-64 overflow-y-auto">
                    {topicOptions.map(o => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => { setForm(f => ({ ...f, tag: o.value })); setShowTopicDropdown(false); }}
                        className={clsx(
                          'w-full px-3 py-2.5 text-sm text-left hover:bg-neutral-50 flex items-center gap-2',
                          form.tag === o.value && 'bg-neutral-50 font-medium text-brand-navy'
                        )}
                      >
                        {form.tag === o.value
                          ? <Check size={13} className="flex-shrink-0 text-brand-navy" />
                          : <span className="w-[13px] flex-shrink-0" />
                        }
                        {o.label}
                      </button>
                    ))}
                    <div className="border-t border-neutral-200" />
                    <button
                      type="button"
                      onClick={() => { setShowTopicDropdown(false); setAddingNewTopic(true); }}
                      className="w-full px-3 py-2.5 text-sm text-left text-brand-navy hover:bg-neutral-50 flex items-center gap-2"
                    >
                      <Plus size={13} className="flex-shrink-0" /> Add new topic
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <Input
            label="Estimated minutes"
            type="number"
            min={1}
            value={form.estimatedMinutes}
            onChange={e => setForm(f => ({ ...f, estimatedMinutes: e.target.value }))}
            error={errors.estimatedMinutes}
          />

          {/* Assign Quiz */}
          <Select
            label="Assign Quiz"
            value={form.quizId}
            onChange={e => setForm(f => ({ ...f, quizId: e.target.value }))}
            options={QUIZ_OPTIONS}
          />

          {/* Module Thumbnail — drag-and-drop zone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Module Thumbnail</label>
            {form.thumbnail ? (
              <div className="flex items-start gap-4">
                <img
                  src={form.thumbnail}
                  alt="Thumbnail preview"
                  className="w-32 h-32 object-cover border border-neutral-200"
                />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, thumbnail: '' }))}
                  className="text-sm text-neutral-500 hover:text-red-500 transition-colors mt-1"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label
                className={clsx(
                  'flex flex-col items-center justify-center gap-3 border-2 border-dashed border-neutral-300 h-36 cursor-pointer bg-white transition-colors',
                  isDragging ? 'border-brand-navy bg-blue-50' : 'hover:border-neutral-400'
                )}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={e => handleFileSelect(e.target.files?.[0] ?? null)}
                />
                <span className="px-4 py-1.5 border border-neutral-300 bg-white text-sm text-neutral-700 hover:bg-neutral-50 transition-colors pointer-events-none">
                  Add File
                </span>
                <span className="text-xs text-neutral-400 pointer-events-none">Or drag and drop files</span>
              </label>
            )}
          </div>
        </section>

      </div>

      {/* Right column — lessons */}
      <div className="flex flex-col gap-3 sticky top-6">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          Lessons <span className="ml-1 font-normal normal-case">({lessonDrafts.length})</span>
        </p>

        {lessonDrafts.length === 0 && (
          <p className="text-sm text-neutral-400 py-2">No lessons yet. Add one below.</p>
        )}

        {lessonDrafts.map((draft, idx) => {
          const isOpen = expandedLessonKeys.has(draft._key);
          return (
            <div key={draft._key} className="border border-neutral-200 rounded-xl overflow-hidden">
              {/* Lesson header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50">
                <span className="w-6 h-6 rounded bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-500 flex-shrink-0">
                  {idx + 1}
                </span>
                <p className="flex-1 text-base font-semibold text-neutral-800 truncate min-w-0">
                  {draft.title.trim() || <span className="text-neutral-400 font-normal">Untitled lesson</span>}
                </p>
                <span className="text-xs text-neutral-400 flex-shrink-0">{draft.durationMinutes} min</span>
                <button
                  onClick={() => toggleLessonExpand(draft._key)}
                  className="w-7 h-7 rounded-lg hover:bg-neutral-200 flex items-center justify-center text-neutral-400 transition-colors flex-shrink-0"
                  title={isOpen ? 'Collapse' : 'Expand'}
                >
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <button
                  onClick={() => setLessonToDelete(draft._key)}
                  className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-neutral-300 hover:text-red-500 transition-colors flex-shrink-0"
                  title="Delete lesson"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Lesson fields */}
              {isOpen && (
                <div className="px-4 py-4 flex flex-col gap-4 border-t border-neutral-100">
                  <Input
                    label="Lesson title"
                    value={draft.title}
                    onChange={e => updateLesson(draft._key, { title: e.target.value })}
                    placeholder="e.g. Understanding Hunger Cues"
                  />
                  <Textarea
                    label="Description"
                    value={draft.description}
                    onChange={e => updateLesson(draft._key, { description: e.target.value })}
                    placeholder="Short summary shown in the lesson list…"
                    rows={2}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Duration (minutes)"
                      type="number"
                      min={1}
                      value={draft.durationMinutes}
                      onChange={e => updateLesson(draft._key, { durationMinutes: e.target.value })}
                    />
                    <Input
                      label="Video URL"
                      value={draft.videoUrl}
                      onChange={e => updateLesson(draft._key, { videoUrl: e.target.value })}
                      placeholder="https://player.vimeo.com/…"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-neutral-700 flex-shrink-0">
                      Video placeholder colour
                    </label>
                    <input
                      type="color"
                      value={draft.videoThumb}
                      onChange={e => updateLesson(draft._key, { videoThumb: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border border-neutral-200"
                      title="Shown when no video URL is set"
                    />
                    <span className="text-xs text-neutral-400 font-mono">{draft.videoThumb}</span>
                  </div>
                  <Textarea
                    label="Lesson body content (HTML)"
                    value={draft.bodyContent}
                    onChange={e => updateLesson(draft._key, { bodyContent: e.target.value })}
                    placeholder="<p>Enter lesson content…</p>"
                    rows={5}
                  />

                  {/* Topics */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
                      <Tag size={13} className="text-neutral-400" /> Topics — "What You'll Learn"
                    </label>
                    <Input
                      label=""
                      value={draft.topics}
                      onChange={e => updateLesson(draft._key, { topics: e.target.value })}
                      placeholder="Hunger cues, Responsive feeding, Baby behavior"
                    />
                    <p className="text-xs text-neutral-400">Comma-separated. Shown as pill tags on the module overview.</p>
                    {draft.topics && (
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {draft.topics.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                          <span key={t} className="px-2.5 py-1 rounded-full bg-brand-blue-pale text-brand-navy text-xs">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Resources */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
                      <ExternalLink size={13} className="text-neutral-400" /> Resource links
                    </label>
                    {draft.resources.map((res, rIdx) => (
                      <div key={rIdx} className="flex items-center gap-2">
                        <Input
                          label=""
                          value={res.label}
                          onChange={e => updateResource(draft._key, rIdx, { label: e.target.value })}
                          placeholder="Link label"
                        />
                        <Input
                          label=""
                          value={res.url}
                          onChange={e => updateResource(draft._key, rIdx, { url: e.target.value })}
                          placeholder="https://…"
                        />
                        <button
                          onClick={() => removeResource(draft._key, rIdx)}
                          className="w-7 h-7 flex-shrink-0 rounded-lg hover:bg-red-50 flex items-center justify-center text-neutral-300 hover:text-red-500 transition-colors"
                          title="Remove resource"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addResource(draft._key)}
                      className="flex items-center gap-1.5 text-xs text-brand-navy hover:text-brand-navy/80 transition-colors self-start"
                    >
                      <Plus size={12} /> Add resource link
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <button
          onClick={addLesson}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-neutral-300 text-sm text-brand-navy hover:border-brand-navy hover:bg-brand-mint-pale transition-colors w-full justify-center"
        >
          <Plus size={14} /> Add lesson
        </button>
      </div>

      </div>

      {/* Lesson delete confirmation modal */}
      <Modal
        open={lessonToDelete !== null}
        onClose={() => setLessonToDelete(null)}
        title="Delete Lesson"
        size="sm"
      >
        <p className="text-sm text-neutral-600 mb-5">
          Are you sure you want to delete{' '}
          <strong>
            {lessonDrafts.find(d => d._key === lessonToDelete)?.title.trim() || 'this lesson'}
          </strong>
          ? This can't be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setLessonToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => {
            if (lessonToDelete) deleteLesson(lessonToDelete);
            setLessonToDelete(null);
          }}>Delete</Button>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Module"
        size="sm"
      >
        <p className="text-sm text-neutral-600 mb-5">
          Are you sure you want to delete <strong>{form.title || 'this module'}</strong> and all its lessons? This can't be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </AdminShell>
  );
}
