import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit2, Eye, EyeOff, GripVertical, BookOpen, Clock, FileQuestion, ImageIcon, CheckSquare, Square, Copy, Trash2, Archive, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { AdminShell } from '../../components/layout/AdminShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/ui/Toast';
import { TopicBadge } from '../../components/ui/Badge';
import { moduleStore } from '../../stores/moduleStore';
import { useToast } from '../../hooks/useToast';

type FilterStatus = 'all' | 'published' | 'draft' | 'archived';
type ModuleStatus = 'published' | 'draft' | 'archived';
type SortOrder = 'default' | 'az' | 'za' | 'date-new' | 'date-old';

export function ContentManagement() {
  const [, navigate] = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);
  const modules = useMemo(() => moduleStore.getAll(), [refreshKey]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['mod-1']));
  const [publishState, setPublishState] = useState<Record<string, ModuleStatus>>(
    () => Object.fromEntries(moduleStore.getAll().map(m => [m.id, m.publishState as ModuleStatus]))
  );
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { toast, show, dismiss } = useToast();

  const visibleModules = useMemo(() => {
    let list = [...modules];
    if (filterStatus !== 'all') list = list.filter(m => (publishState[m.id] ?? m.publishState as ModuleStatus) === filterStatus);
    if (sortOrder === 'az') list.sort((a, b) => a.title.localeCompare(b.title));
    if (sortOrder === 'za') list.sort((a, b) => b.title.localeCompare(a.title));
    if (sortOrder === 'date-new') list.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
    if (sortOrder === 'date-old') list.sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));
    return list;
  }, [modules, filterStatus, sortOrder, publishState]);

  const allSelected = visibleModules.length > 0 && visibleModules.every(m => selectedIds.has(m.id));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleModules.map(m => m.id)));
    }
  };

  const bulkSetStatus = (status: ModuleStatus) => {
    const count = selectedIds.size;
    setPublishState(prev => {
      const next = { ...prev };
      selectedIds.forEach(id => { next[id] = status; });
      return next;
    });
    const label = status === 'published' ? 'published' : status === 'draft' ? 'set to draft' : 'archived';
    show(`${count} module${count > 1 ? 's' : ''} ${label}.`);
    setSelectedIds(new Set());
  };

  const bulkDuplicate = () => {
    const count = selectedIds.size;
    selectedIds.forEach(id => {
      const mod = moduleStore.getById(id);
      if (!mod) return;
      const newId = `mod-copy-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      moduleStore.add({ ...mod, id: newId, title: `${mod.title} (Copy)` });
      setPublishState(prev => ({ ...prev, [newId]: 'draft' }));
    });
    setRefreshKey(k => k + 1);
    show(`${count} module${count > 1 ? 's' : ''} duplicated.`);
    setSelectedIds(new Set());
  };

  const bulkDelete = () => {
    const count = selectedIds.size;
    selectedIds.forEach(id => moduleStore.delete(id));
    setRefreshKey(k => k + 1);
    show(`${count} module${count > 1 ? 's' : ''} deleted.`);
    setSelectedIds(new Set());
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const deleted = params.get('deleted');
    const saved = params.get('saved');
    const created = params.get('created');
    if (!deleted && !saved && !created) return;
    window.history.replaceState(null, '', '/admin/content');
    if (deleted) {
      show(`"${deleted}" was deleted.`, {
        variant: 'delete',
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
      {toast && <Toast message={toast.message} onUndo={toast.onUndo} onDismiss={dismiss} variant={toast.variant} />}
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

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Select all */}
        <button
          onClick={toggleSelectAll}
          className="flex-shrink-0 text-neutral-300 hover:text-brand-navy transition-colors"
          title={allSelected ? 'Deselect all' : 'Select all'}
        >
          {allSelected
            ? <CheckSquare size={16} className="text-brand-navy" />
            : <Square size={16} />}
        </button>

        {/* Filter pills */}
        <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
          {(['all', 'published', 'draft', 'archived'] as FilterStatus[]).map(f => (
            <button
              key={f}
              onClick={() => { setFilterStatus(f); setSelectedIds(new Set()); }}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${filterStatus === f ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value as SortOrder)}
          className="h-8 px-2 rounded-lg border border-neutral-200 text-xs text-neutral-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
        >
          <option value="default">Sort: Default</option>
          <option value="az">Sort: A → Z</option>
          <option value="za">Sort: Z → A</option>
          <option value="date-new">Sort: Newest first</option>
          <option value="date-old">Sort: Oldest first</option>
        </select>
      </div>

      {/* Module list */}
      <div className="flex flex-col gap-3">
        {visibleModules.map((mod) => {
          const expanded = expandedIds.has(mod.id);
          const state: ModuleStatus = (publishState[mod.id] ?? mod.publishState) as ModuleStatus;
          const isPublished = state === 'published';
          const isArchived = state === 'archived';

          return (
            <Card key={mod.id} padding="none">
              {/* Module row */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-neutral-50 transition-colors group"
                onClick={() => toggle(mod.id)}
              >
                <button
                  onClick={e => { e.stopPropagation(); toggleSelect(mod.id); }}
                  className="flex-shrink-0 text-neutral-300 hover:text-brand-navy transition-colors"
                >
                  {selectedIds.has(mod.id)
                    ? <CheckSquare size={16} className="text-brand-navy" />
                    : <Square size={16} />}
                </button>
                <GripVertical size={16} className="text-neutral-300 flex-shrink-0" />
                {mod.thumbnail
                  ? <img src={mod.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-neutral-200" />
                  : <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 border border-neutral-200">
                      <ImageIcon size={16} className="text-neutral-300" />
                    </div>
                }

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-neutral-800">{mod.title}</p>
                    <TopicBadge tag={mod.tag} />
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isPublished ? 'bg-brand-mint-pale text-brand-navy' : isArchived ? 'bg-neutral-100 text-neutral-500' : 'bg-brand-yellow-pale text-brand-navy'}`}>
                      {isPublished ? 'Published' : isArchived ? 'Archived' : 'Draft'}
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
                    className="flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-semibold bg-brand-navy text-white hover:bg-brand-navy/90 transition-colors"
                    title="Edit module"
                  >
                    <Edit2 size={12} /> Edit
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

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-white border border-neutral-200 rounded-2xl shadow-xl px-3 py-2">
          <div className="flex items-center gap-2 pr-3 border-r border-neutral-200 mr-1">
            <span className="w-6 h-6 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center justify-center">
              {selectedIds.size}
            </span>
            <span className="text-sm font-medium text-neutral-700 whitespace-nowrap">
              {selectedIds.size === 1 ? 'module' : 'modules'} selected
            </span>
          </div>
          <button
            onClick={bulkDuplicate}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
            title="Duplicate"
          >
            <Copy size={16} />
            <span className="text-[10px] font-medium">Duplicate</span>
          </button>
          <button
            onClick={() => bulkSetStatus('published')}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
            title="Publish"
          >
            <Eye size={16} />
            <span className="text-[10px] font-medium">Publish</span>
          </button>
          <button
            onClick={() => bulkSetStatus('draft')}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
            title="Unpublish"
          >
            <EyeOff size={16} />
            <span className="text-[10px] font-medium">Unpublish</span>
          </button>
          <button
            onClick={() => bulkSetStatus('archived')}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
            title="Archive"
          >
            <Archive size={16} />
            <span className="text-[10px] font-medium">Archive</span>
          </button>
          <button
            onClick={bulkDelete}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
            <span className="text-[10px] font-medium">Delete</span>
          </button>
          <div className="w-px h-6 bg-neutral-200 mx-1" />
          <button
            onClick={() => setSelectedIds(new Set())}
            className="p-1.5 rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
            title="Clear selection"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </AdminShell>
  );
}
