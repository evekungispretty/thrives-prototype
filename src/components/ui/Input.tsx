import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, Check } from 'lucide-react';
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

export function Select({ label, error, options, className, id, value, onChange, disabled }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selectedLabel = options.find(o => o.value === String(value ?? ''))?.label;

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          id={selectId}
          type="button"
          disabled={disabled}
          onClick={() => setOpen(p => !p)}
          className={clsx(
            'h-9 w-full rounded-lg border pl-3 pr-8 text-sm bg-white text-left flex items-center transition-colors',
            FOCUS,
            error ? 'border-red-400' : 'border-neutral-300',
            disabled ? 'opacity-50 cursor-not-allowed' : 'text-neutral-900',
            className,
          )}
        >
          {selectedLabel ?? <span className="text-neutral-400">Select…</span>}
        </button>
        <ChevronDown size={15} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500" />
        {open && (
          <div className="absolute left-0 right-0 top-full mt-1 border border-neutral-200 bg-white rounded-lg shadow-lg z-20 overflow-hidden max-h-64 overflow-y-auto">
            {options.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange?.({ target: { value: o.value } } as React.ChangeEvent<HTMLSelectElement>);
                  setOpen(false);
                }}
                className={clsx(
                  'w-full px-3 py-2.5 text-sm text-left hover:bg-neutral-50 flex items-center gap-2',
                  String(value ?? '') === o.value && 'bg-neutral-50 font-medium text-brand-navy'
                )}
              >
                {String(value ?? '') === o.value
                  ? <Check size={13} className="flex-shrink-0 text-brand-navy" />
                  : <span className="w-[13px] flex-shrink-0" />
                }
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
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
