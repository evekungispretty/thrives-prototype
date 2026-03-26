import { useParams, Link, useLocation } from 'wouter';
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, Play, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { ParticipantShell } from '../../components/layout/ParticipantShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { MODULES } from '../../data/modules';
import { DEMO_PARTICIPANT } from '../../data/users';

export function LessonDetail() {
  const { id: moduleId, lessonId } = useParams<{ id: string; lessonId: string }>();
  const [, navigate] = useLocation();
  const [videoPlaying, setVideoPlaying] = useState(false);

  const mod = MODULES.find(m => m.id === moduleId);
  const lesson = mod?.lessons.find(l => l.id === lessonId);
  const user = DEMO_PARTICIPANT;
  const prog = user.progress.find(p => p.moduleId === moduleId);

  if (!mod || !lesson) {
    return (
      <ParticipantShell>
        <p className="text-neutral-500">Lesson not found.</p>
      </ParticipantShell>
    );
  }

  const lessonIndex = mod.lessons.findIndex(l => l.id === lessonId);
  const prevLesson = lessonIndex > 0 ? mod.lessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < mod.lessons.length - 1 ? mod.lessons[lessonIndex + 1] : null;
  const isLastLesson = lessonIndex === mod.lessons.length - 1;
  const isCompleted = lessonIndex < (prog?.completedLessons ?? 0);

  const handleComplete = () => {
    if (nextLesson) {
      navigate(`/participant/modules/${moduleId}/lesson/${nextLesson.id}`);
    } else if (isLastLesson) {
      navigate(`/participant/modules/${moduleId}/quiz`);
    } else {
      navigate(`/participant/modules/${moduleId}`);
    }
  };

  return (
    <ParticipantShell>
      {/* Back nav */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/participant/modules/${moduleId}`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeft size={15} /> {mod.title}
        </Link>

        {/* Lesson progress dots */}
        <div className="hidden sm:flex items-center gap-1.5">
          {mod.lessons.map((l, idx) => (
            <Link key={l.id} href={`/participant/modules/${moduleId}/lesson/${l.id}`}>
              <div
                className={`w-2 h-2 rounded-full transition-all ${
                  l.id === lessonId
                    ? 'bg-brand-navy w-4'
                    : idx < (prog?.completedLessons ?? 0)
                    ? 'bg-brand-mint'
                    : 'bg-neutral-300'
                }`}
              />
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Video area */}
          <div
            className="relative w-full rounded-2xl overflow-hidden mb-6 cursor-pointer group"
            style={{
              aspectRatio: '16/9',
              background: lesson.videoThumb,
            }}
            onClick={() => setVideoPlaying(!videoPlaying)}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {videoPlaying ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                    <div className="w-4 h-4 border-l-2 border-r-2 border-white" />
                  </div>
                  <p className="text-white/80 text-sm font-medium">Lesson in progress…</p>
                  <p className="text-white/60 text-xs mt-1">(Demo prototype — no actual video)</p>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/90 shadow-card-md flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Play size={22} className="text-neutral-800 ml-1" />
                </div>
              )}
            </div>

            {/* Duration badge */}
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
              {lesson.durationMinutes}:00
            </div>
          </div>

          {/* Lesson header */}
          <div className="mb-6">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
              Lesson {lessonIndex + 1} of {mod.lessons.length}
            </p>
            <h1 className="text-xl font-bold text-neutral-900 mb-2">{lesson.title}</h1>
            <p className="text-neutral-600">{lesson.description}</p>
          </div>

          {/* Body content */}
          <Card className="prose prose-sm max-w-none mb-6">
            <div
              className="text-sm text-neutral-700 leading-relaxed space-y-3"
              dangerouslySetInnerHTML={{ __html: lesson.bodyContent }}
            />
          </Card>

          {/* Resources */}
          {lesson.resources.length > 0 && (
            <Card className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                <BookOpen size={15} className="text-brand-navy" /> Resources
              </h3>
              <div className="flex flex-col gap-2">
                {lesson.resources.map(r => (
                  <a
                    key={r.label}
                    href={r.url}
                    className="flex items-center gap-2 text-sm text-brand-navy hover:text-brand-navy hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={13} />
                    {r.label}
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {prevLesson ? (
              <Link href={`/participant/modules/${moduleId}/lesson/${prevLesson.id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft size={14} /> Previous
                </Button>
              </Link>
            ) : <div />}

            <Button onClick={handleComplete} size="md">
              {isCompleted ? (
                <>Review complete <CheckCircle2 size={14} /></>
              ) : isLastLesson ? (
                <>Finish & take quiz <ArrowRight size={14} /></>
              ) : (
                <>Mark complete & continue <ArrowRight size={14} /></>
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar — lesson list */}
        <div>
          <Card padding="none">
            <div className="p-4 border-b border-neutral-150">
              <p className="text-sm font-semibold text-neutral-800">{mod.title}</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {prog?.completedLessons ?? 0} of {mod.lessons.length} complete
              </p>
            </div>
            <div className="divide-y divide-neutral-100">
              {mod.lessons.map((l, idx) => {
                const done = idx < (prog?.completedLessons ?? 0);
                const current = l.id === lessonId;
                return (
                  <Link
                    key={l.id}
                    href={`/participant/modules/${moduleId}/lesson/${l.id}`}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      current ? 'bg-brand-mint-pale' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold ${
                        done
                          ? 'bg-brand-navy text-white'
                          : current
                          ? 'bg-brand-peach text-white'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {done ? <CheckCircle2 size={12} /> : idx + 1}
                    </div>
                    <p className={`text-xs ${current ? 'font-semibold text-brand-navy' : done ? 'text-neutral-500' : 'text-neutral-700'}`}>
                      {l.title}
                    </p>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </ParticipantShell>
  );
}
