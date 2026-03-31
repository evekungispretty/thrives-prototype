import { Link, useLocation } from 'wouter';
import { clsx } from 'clsx';
import { LayoutDashboard, BookOpen, BarChart2, LogOut } from 'lucide-react';
import { DEMO_PARTICIPANT } from '../../data/users';

const NAV_LINKS = [
  { href: '/participant/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/participant/modules',   label: 'My Modules',  icon: BookOpen },
  { href: '/participant/progress',  label: 'My Progress', icon: BarChart2 },
];

export function ParticipantShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-card">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/participant/dashboard" className="flex items-center gap-2 group">
            <div className="w-20 h-20 rounded-lg flex items-center justify-center">
              <img src="/images/logo.png" alt="THRIVES" className="object-contain" />
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isQuizReview = /\/participant\/modules\/[^/]+\/quiz\/review/.test(location);
              const active = isQuizReview
                ? href === '/participant/progress'
                : location.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-brand-mint-pale text-brand-navy'
                      : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100',
                  )}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-neutral-800 leading-none">{DEMO_PARTICIPANT.name}</p>
              <p className="text-xs text-neutral-400 mt-0.5">Participant</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {DEMO_PARTICIPANT.name.split(' ').map(n => n[0]).join('')}
            </div>
            <Link href="/" className="text-neutral-400 hover:text-neutral-600 transition-colors" title="Sign out">
              <LogOut size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
