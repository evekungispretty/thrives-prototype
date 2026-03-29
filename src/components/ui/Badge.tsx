import { clsx } from 'clsx';
import type { TopicTag, ModuleStatus, ParticipantStatus } from '../../types';

// ─── Topic Tag Badge ──────────────────────────────────────────────────────────

const TAG_STYLES: Record<TopicTag, string> = {
  'infant-feeding':     'bg-brand-peach-pale    text-brand-navy',
  'tummy-time':         'bg-brand-mint-pale     text-brand-navy',
  'screen-time':        'bg-brand-blue-pale     text-brand-navy',
  'sleep':              'bg-brand-pink-pale     text-brand-navy',
  'development':        'bg-brand-yellow-pale   text-brand-navy',
  'caregiver-wellbeing':'bg-brand-pink-pale     text-brand-navy',
};

const TAG_LABELS: Record<TopicTag, string> = {
  'infant-feeding':     'Infant Feeding',
  'tummy-time':         'Tummy Time',
  'screen-time':        'Screen Time',
  'sleep':              'Sleep',
  'development':        'Development',
  'caregiver-wellbeing':'Caregiver Wellbeing',
};

export function TopicBadge({ tag }: { tag: TopicTag }) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', TAG_STYLES[tag])}>
      {TAG_LABELS[tag]}
    </span>
  );
}

// ─── Module Status Badge ──────────────────────────────────────────────────────

const STATUS_STYLES: Record<ModuleStatus, string> = {
  not_started: 'bg-neutral-100 text-neutral-500',
  in_progress: 'bg-brand-yellow-pale text-brand-navy',
  completed:   'bg-brand-mint-pale text-brand-navy',
  locked:      'bg-neutral-100 text-neutral-400',
};

const STATUS_LABELS: Record<ModuleStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed:   'Completed',
  locked:      'Locked',
};

export function ModuleStatusBadge({ status }: { status: ModuleStatus }) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}

// ─── Participant Status Badge ─────────────────────────────────────────────────

const PART_STATUS_STYLES: Record<ParticipantStatus, string> = {
  active:    'bg-brand-mint-pale text-brand-navy',
  inactive:  'bg-neutral-100 text-neutral-500',
  completed: 'bg-brand-blue-pale text-brand-navy',
  enrolled:  'bg-brand-yellow-pale text-brand-navy',
};

// ─── Completed Lesson Badge ───────────────────────────────────────────────────

export function CompletedBadge() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      Completed
    </span>
  );
}

export function ParticipantStatusBadge({ status }: { status: ParticipantStatus }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', PART_STATUS_STYLES[status])}>
      {label}
    </span>
  );
}
