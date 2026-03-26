import { clsx } from 'clsx';
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const FOCUS = 'focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={clsx(
          'h-9 w-full rounded-lg border px-3 text-sm text-neutral-900 bg-white placeholder:text-neutral-400 transition-colors',
          FOCUS,
          error ? 'border-red-400' : 'border-neutral-300',
          className,
        )}
      />
      {hint && !error && <p className="text-xs text-neutral-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        {...props}
        className={clsx(
          'h-9 w-full rounded-lg border px-3 text-sm text-neutral-900 bg-white transition-colors',
          FOCUS,
          error ? 'border-red-400' : 'border-neutral-300',
          className,
        )}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  const areaId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={areaId} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <textarea
        id={areaId}
        {...props}
        className={clsx(
          'w-full rounded-lg border px-3 py-2 text-sm text-neutral-900 bg-white placeholder:text-neutral-400 resize-none transition-colors',
          FOCUS,
          error ? 'border-red-400' : 'border-neutral-300',
          className,
        )}
      />
      {hint && !error && <p className="text-xs text-neutral-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
