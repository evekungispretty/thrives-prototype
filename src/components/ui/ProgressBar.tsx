import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number; // 0–100
  size?: 'sm' | 'md';
  color?: 'navy' | 'peach' | 'mint';
  showLabel?: boolean;
  className?: string;
}

const COLORS = {
  navy:  'bg-brand-navy',
  peach: 'bg-brand-peach',
  mint:  'bg-brand-mint',
};

const HEIGHTS = {
  sm: 'h-1.5',
  md: 'h-2',
};

export function ProgressBar({ value, size = 'md', color = 'navy', showLabel, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className={clsx('flex-1 rounded-full bg-neutral-150 overflow-hidden', HEIGHTS[size])}>
        <div
          className={clsx('h-full rounded-full transition-all duration-500', COLORS[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-neutral-500 w-8 text-right tabular-nums">{pct}%</span>
      )}
    </div>
  );
}

export function CircleProgress({ value, size = 64 }: { value: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E8E5E0" strokeWidth="5" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="#00476b" strokeWidth="5"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}
