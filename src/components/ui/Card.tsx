import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const PADDING = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
};

export function Card({ children, className, padding = 'md', hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-xl shadow-card border border-neutral-200',
        PADDING[padding],
        hover && 'cursor-pointer transition-shadow hover:shadow-card-md',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  subtitle,
  icon,
  color = 'navy',
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'navy' | 'peach' | 'blue' | 'mint' | 'pink' | 'yellow';
}) {
  const colorMap = {
    navy:   'bg-brand-mint-pale  text-brand-navy',
    peach:  'bg-brand-peach-pale text-brand-navy',
    blue:   'bg-brand-blue-pale  text-brand-navy',
    mint:   'bg-brand-mint-pale  text-brand-navy',
    pink:   'bg-brand-pink-pale  text-brand-navy',
    yellow: 'bg-brand-yellow-pale text-brand-navy',
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 font-medium">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-neutral-400">{subtitle}</p>}
        </div>
        {icon && (
          <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', colorMap[color])}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
