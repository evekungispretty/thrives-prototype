import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit2, Eye, EyeOff, GripVertical, BookOpen, Clock, FileQuestion } from 'lucide-react';
import { AdminShell } from '../../components/layout/AdminShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TopicBadge } from '../../components/ui/Badge';
import { MODULES } from '../../data/modules';

export function ContentManagement() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['mod-1']));
  const [publishState, setPublishState] = useState<Record<string, 'published' | 'draft'>>(
    Object.fromEntries(MODULES.map(m => [m.id, m.publishState]))
  );

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

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Content Management</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {MODULES.length} modules · {MODULES.reduce((s, m) => s + m.lessons.length, 0)} lessons
          </p>
        </div>
        <Button>
          <Plus size={15} /> New Module
        </Button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Modules', value: MODULES.length },
          { label: 'Published', value: Object.values(publishState).filter(s => s === 'published').length, color: 'text-brand-navy' },
          { label: 'Draft', value: Object.values(publishState).filter(s => s === 'draft').length, color: 'text-brand-navy' },
          { label: 'Total Lessons', value: MODULES.reduce((s, m) => s + m.lessons.length, 0) },
        ].map(s => (
          <Card key={s.label}>
            <p className="text-xs text-neutral-500 font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color ?? 'text-neutral-900'}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Module list */}
      <div className="flex flex-col gap-3">
        {MODULES.map((mod, modIdx) => {
          const expanded = expandedIds.has(mod.id);
          const state = publishState[mod.id];
          const isPublished = state === 'published';

          return (
            <Card key={mod.id} padding="none">
              {/* Module row */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-neutral-50 transition-colors group"
                onClick={() => toggle(mod.id)}
              >
                {/* Drag handle (visual only) */}
                <GripVertical size={16} className="text-neutral-300 flex-shrink-0" />

                {/* Number */}
                <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-xs font-semibold text-neutral-500 flex-shrink-0">
                  {modIdx + 1}
                </div>

                {/* Main info */}
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
                    <span className="flex items-center gap-1"><FileQuestion size={11} /> Quiz attached</span>
                  </div>
                </div>

                {/* Actions */}
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
                    onClick={e => e.stopPropagation()}
                    className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
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
                          <button className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors">
                            <Edit2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add lesson */}
                  <button className="flex items-center gap-2 px-4 py-3 w-full text-sm text-brand-navy hover:bg-brand-mint-pale transition-colors ml-9">
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
