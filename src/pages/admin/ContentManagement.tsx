import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit2, Eye, EyeOff, GripVertical, BookOpen, Clock, FileQuestion, Trash2, ChevronUp } from 'lucide-react';
import { AdminShell } from '../../components/layout/AdminShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { TopicBadge } from '../../components/ui/Badge';
import { MODULES } from '../../data/modules';
import type { Lesson, Module, TopicTag } from '../../types';

const TOPIC_OPTIONS: { value: TopicTag; label: string }[] = [
  { value: 'infant-feeding',      label: 'Infant Feeding' },
  { value: 'tummy-time',          label: 'Tummy Time' },
  { value: 'screen-time',         label: 'Screen Time' },
  { value: 'sleep',               label: 'Sleep' },
  { value: 'development',         label: 'Development' },
  { value: 'caregiver-wellbeing', label: 'Caregiver Wellbeing' },
];

const PUBLISH_OPTIONS = [
  { value: 'draft',     label: 'Draft' },
  { value: 'published', label: 'Published' },
];

// ─── Module form ──────────────────────────────────────────────────────────────

interface ModuleFormState {
  title: string;
  description: string;
  tag: TopicTag;
  estimatedMinutes: string;
  publishState: 'published' | 'draft';
  thumbnail: string;
}

const EMPTY_FORM: ModuleFormState = {
  title: '',
  description: '',
  tag: 'infant-feeding',
  estimatedMinutes: '30',
  publishState: 'draft',
  thumbnail: '',
};

function moduleToForm(mod: Module): ModuleFormState {
  return {
    title: mod.title,
    description: mod.description,
    tag: mod.tag,
    estimatedMinutes: String(mod.estimatedMinutes),
    publishState: mod.publishState,
    thumbnail: mod.thumbnail ?? '',
  };
}

// ─── Lesson draft ─────────────────────────────────────────────────────────────

interface LessonDraft {
  _key: string; // stable React key (id for existing, temp id for new)
  id: string;
  title: string;
  description: string;
  durationMinutes: string;
  videoUrl: string;
  // preserve fields we don't edit so the Lesson object stays complete
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
    order,
  };
}

const EMPTY_LESSON_DRAFT = (): LessonDraft => {
  const key = `new-${Date.now()}-${Math.random()}`;
  return { _key: key, id: key, title: '', description: '', durationMinutes: '5', videoUrl: '' };
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ContentManagement() {
  const [modules, setModules] = useState<Module[]>(MODULES);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['mod-1']));
  const [publishState, setPublishState] = useState<Record<string, 'published' | 'draft'>>(
    Object.fromEntries(MODULES.map(m => [m.id, m.publishState]))
  );

  // Modal state: undefined = closed, null = creating new, Module = editing
  const [editingModule, setEditingModule] = useState<Module | null | undefined>(undefined);
  const modalOpen = editingModule !== undefined;
  const [form, setForm] = useState<ModuleFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<ModuleFormState>>({});

  // Lesson drafts for the modal
  const [lessonDrafts, setLessonDrafts] = useState<LessonDraft[]>([]);
  const [expandedLessonKeys, setExpandedLessonKeys] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const togglePublish = (id: string) => {
    setPublishState(prev => ({
      ...prev,
      [id]: prev[id] === 'published' ? 'draft' : 'published',
    }));
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setLessonDrafts([]);
    setExpandedLessonKeys(new Set());
    setEditingModule(null);
  };

  const openEdit = (mod: Module) => {
    setForm(moduleToForm(mod));
    setErrors({});
    const drafts = mod.lessons.map(lessonToDraft);
    setLessonDrafts(drafts);
    setExpandedLessonKeys(new Set());
    setEditingModule(mod);
  };

  const closeModal = () => setEditingModule(undefined);

  // ── Lesson draft helpers ──────────────────────────────────────────────────

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

  // ── Validate & save ───────────────────────────────────────────────────────

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
      .map((d, i) => draftToLesson(d, editingModule?.id ?? '', i + 1));

    if (editingModule) {
      setModules(prev => prev.map(m =>
        m.id === editingModule.id
          ? {
              ...m,
              title: form.title.trim(),
              description: form.description.trim(),
              tag: form.tag,
              estimatedMinutes: mins,
              publishState: form.publishState,
              thumbnail: form.thumbnail || undefined,
              lessons,
            }
          : m
      ));
      setPublishState(prev => ({ ...prev, [editingModule.id]: form.publishState }));
    } else {
      const newId = `mod-${Date.now()}`;
      const newMod: Module = {
        id: newId,
        title: form.title.trim(),
        description: form.description.trim(),
        tag: form.tag,
        estimatedMinutes: mins,
        publishState: form.publishState,
        thumbnail: form.thumbnail || undefined,
        quizId: `quiz-${newId}`,
        order: modules.length + 1,
        status: 'not_started',
        completedLessons: 0,
        lessons: lessons.map(l => ({ ...l, moduleId: newId })),
      };
      setModules(prev => [...prev, newMod]);
      setPublishState(prev => ({ ...prev, [newId]: form.publishState }));
    }
    closeModal();
  };

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Content Management</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {modules.length} modules · {modules.reduce((s, m) => s + m.lessons.length, 0)} lessons
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={15} /> New Module
        </Button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Modules', value: modules.length },
          { label: 'Published', value: Object.values(publishState).filter(s => s === 'published').length, color: 'text-brand-navy' },
          { label: 'Draft', value: Object.values(publishState).filter(s => s === 'draft').length, color: 'text-brand-navy' },
          { label: 'Total Lessons', value: modules.reduce((s, m) => s + m.lessons.length, 0) },
        ].map(s => (
          <Card key={s.label}>
            <p className="text-xs text-neutral-500 font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color ?? 'text-neutral-900'}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Module list */}
      <div className="flex flex-col gap-3">
        {modules.map((mod, modIdx) => {
          const expanded = expandedIds.has(mod.id);
          const state = publishState[mod.id] ?? mod.publishState;
          const isPublished = state === 'published';

          return (
            <Card key={mod.id} padding="none">
              {/* Module row */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-neutral-50 transition-colors group"
                onClick={() => toggle(mod.id)}
              >
                <GripVertical size={16} className="text-neutral-300 flex-shrink-0" />
                <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-xs font-semibold text-neutral-500 flex-shrink-0">
                  {modIdx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-neutral-800">{mod.title}</p>
                    <TopicBadge tag={mod.tag} />
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isPublished ? 'bg-brand-mint-pale text-brand-navy' : 'bg-brand-yellow-pale text-brand-navy'}`}>
                      {isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-neutral-400">
                    <span className="flex items-center gap-1"><BookOpen size={11} /> {mod.lessons.length} lessons</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {mod.estimatedMinutes} min</span>
                    {mod.quizId && <span className="flex items-center gap-1"><FileQuestion size={11} /> Quiz attached</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); togglePublish(mod.id); }}
                    className="flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-xs font-medium border transition-colors hover:bg-neutral-50"
                    title={isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {isPublished
                      ? <><EyeOff size={12} /> Unpublish</>
                      : <><Eye size={12} /> Publish</>}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); openEdit(mod); }}
                    className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
                    title="Edit module"
                  >
                    <Edit2 size={13} />
                  </button>
                  {expanded
                    ? <ChevronDown size={16} className="text-neutral-400" />
                    : <ChevronRight size={16} className="text-neutral-400" />}
                </div>
              </div>

              {/* Lessons list */}
              {expanded && (
                <div className="border-t border-neutral-100">
                  {mod.lessons.map((lesson, lessonIdx) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 group/lesson transition-colors"
                    >
                      <GripVertical size={14} className="text-neutral-200 flex-shrink-0 ml-9" />
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-medium flex-shrink-0"
                        style={{ background: lesson.videoThumb }}
                      >
                        {lessonIdx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-800 font-medium">{lesson.title}</p>
                        <p className="text-xs text-neutral-400">{lesson.description}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-neutral-400 flex items-center gap-1">
                          <Clock size={11} /> {lesson.durationMinutes} min
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(mod)}
                            className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
                            title="Edit lesson"
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => openEdit(mod)}
                    className="flex items-center gap-2 px-4 py-3 w-full text-sm text-brand-navy ml-9"
                  >
                    <Plus size={14} /> Add lesson
                  </button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Create / Edit Module Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingModule ? 'Edit Module' : 'New Module'}
        size="lg"
      >
        {/* Scrollable body */}
        <div className="overflow-y-auto max-h-[70vh] -mx-6 px-6 flex flex-col gap-5">

          {/* Module fields */}
          <div className="flex flex-col gap-4">
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
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Topic"
                value={form.tag}
                onChange={e => setForm(f => ({ ...f, tag: e.target.value as TopicTag }))}
                options={TOPIC_OPTIONS}
              />
              <Select
                label="Status"
                value={form.publishState}
                onChange={e => setForm(f => ({ ...f, publishState: e.target.value as 'published' | 'draft' }))}
                options={PUBLISH_OPTIONS}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Estimated minutes"
                type="number"
                min={1}
                value={form.estimatedMinutes}
                onChange={e => setForm(f => ({ ...f, estimatedMinutes: e.target.value }))}
                error={errors.estimatedMinutes}
              />
              <Input
                label="Thumbnail URL"
                value={form.thumbnail}
                onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))}
                placeholder="/images/my-module.jpg"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-neutral-100" />

          {/* Lessons section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Lessons <span className="ml-1 font-normal normal-case">({lessonDrafts.length})</span>
              </p>
            </div>

            {lessonDrafts.length === 0 && (
              <p className="text-sm text-neutral-400 py-2">No lessons yet. Add one below.</p>
            )}

            {lessonDrafts.map((draft, idx) => {
              const isOpen = expandedLessonKeys.has(draft._key);
              return (
                <div key={draft._key} className="border border-neutral-200 rounded-xl overflow-hidden">
                  {/* Lesson header row */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50">
                    <span className="w-5 h-5 rounded bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-500 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <p className="flex-1 text-sm font-medium text-neutral-700 truncate min-w-0">
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
                      onClick={() => deleteLesson(draft._key)}
                      className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-neutral-300 hover:text-red-500 transition-colors flex-shrink-0"
                      title="Delete lesson"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Lesson edit fields */}
                  {isOpen && (
                    <div className="px-4 py-4 flex flex-col gap-3 border-t border-neutral-100">
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

          {/* Bottom padding so last item isn't clipped by scroll */}
          <div className="h-1" />
        </div>

        {/* Sticky footer */}
        <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-neutral-100">
          <Button variant="ghost" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSave}>
            {editingModule ? 'Save Changes' : 'Create Module'}
          </Button>
        </div>
      </Modal>
    </AdminShell>
  );
}
