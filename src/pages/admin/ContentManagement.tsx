import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit2, Eye, EyeOff, GripVertical, BookOpen, Clock, FileQuestion, ImageIcon } from 'lucide-react';
import { useLocation } from 'wouter';
import { AdminShell } from '../../components/layout/AdminShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/ui/Toast';
import { TopicBadge } from '../../components/ui/Badge';
import { moduleStore } from '../../stores/moduleStore';
import { useToast } from '../../hooks/useToast';

export function ContentManagement() {
  const [, navigate] = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);
  const modules = useMemo(() => moduleStore.getAll(), [refreshKey]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['mod-1']));
  const [publishState, setPublishState] = useState<Record<string, 'published' | 'draft'>>(
    () => Object.fromEntries(moduleStore.getAll().map(m => [m.id, m.publishState]))
  );
  const { toast, show, dismiss } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const deleted = params.get('deleted');
    const saved = params.get('saved');
    const created = params.get('created');
    if (!deleted && !saved && !created) return;
    window.history.replaceState(null, '', '/admin/content');
    if (deleted) {
      show(`"${deleted}" was deleted.`, {
        onUndo: () => {
          const restored = moduleStore.undoDelete();
          if (restored) {
            setPublishState(prev => ({ ...prev, [restored.id]: restored.publishState }));
            setRefreshKey(k => k + 1);
          }
        },
      });
    } else if (saved) {
      show(`"${saved}" was saved.`);
    } else if (created) {
      show(`"${created}" was created!`);
    }
  }, []);

  const toggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const togglePublish = (id: string) => {
    const next = publishState[id] === 'published' ? 'draft' : 'published';
    setPublishState(prev => ({ ...prev, [id]: next }));
    const title = modules.find(m => m.id === id)?.title ?? 'Module';
    show(next === 'published' ? `"${title}" is now published.` : `"${title}" is set to draft.`);
  };

  return (
    <AdminShell>
      {toast && <Toast message={toast.message} onUndo={toast.onUndo} onDismiss={dismiss} />}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Content Management</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {modules.length} modules · {modules.reduce((s, m) => s + m.lessons.length, 0)} lessons
          </p>
        </div>
        <Button onClick={() => navigate('/admin/modules/new/edit')}>
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
                {mod.thumbnail
                  ? <img src={mod.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-neutral-200" />
                  : <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 border border-neutral-200">
                      <ImageIcon size={16} className="text-neutral-300" />
                    </div>
                }
                <div className="w-5 h-5 rounded bg-neutral-100 flex items-center justify-center text-xs font-semibold text-neutral-500 flex-shrink-0">
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
                    onClick={e => { e.stopPropagation(); navigate(`/admin/modules/${mod.id}/edit`); }}
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
                      <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-medium flex-shrink-0 bg-brand-mint-pale text-brand-navy">
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
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => navigate(`/admin/modules/${mod.id}/edit`)}
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
    </AdminShell>
  );
}
