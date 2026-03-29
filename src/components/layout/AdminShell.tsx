import { Link, useLocation } from 'wouter';
import { clsx } from 'clsx';
import { LayoutDashboard, Users, HelpCircle, BookOpen, BarChart2, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { DEMO_ADMIN } from '../../data/users';

const NAV_LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/users',     label: 'Participants',  icon: Users },
  { href: '/admin/questions', label: 'Quizzes',       icon: HelpCircle },
  { href: '/admin/content',   label: 'Content',       icon: BookOpen },
  { href: '/admin/research',  label: 'Research',      icon: BarChart2 },
];

function SidebarNav({ location, onNavClick }: { location: string; onNavClick?: () => void }) {
  return (
    <>
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-white/10">
        <img src="/images/logo.png" alt="THRIVES" className="w-7 h-7 rounded-lg object-contain flex-shrink-0" />
        <div>
          <div className="font-semibold text-white text-sm tracking-tight">THRIVES</div>
          <div className="text-xs text-white/50 -mt-0.5">Researcher Portal</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = location.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              className={clsx(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10',
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4">
        <div className="flex items-center gap-2.5 px-3">
          <div className="w-7 h-7 rounded-full bg-brand-mint flex items-center justify-center text-brand-navy text-xs font-semibold flex-shrink-0">
            {DEMO_ADMIN.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{DEMO_ADMIN.name}</p>
            <p className="text-xs text-white/50 truncate">{DEMO_ADMIN.email}</p>
          </div>
          <Link href="/" className="text-white/40 hover:text-white transition-colors" title="Sign out">
            <LogOut size={14} />
          </Link>
        </div>
      </div>
    </>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 fixed inset-y-0 left-0 z-30" style={{ backgroundColor: '#00476b' }}>
        <SidebarNav location={location} />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-brand-navy/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 flex flex-col" style={{ backgroundColor: '#00476b' }}>
            <SidebarNav location={location} onNavClick={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col lg:pl-56">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-neutral-200 shadow-card">
          <div className="px-4 h-14 flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="text-neutral-500 hover:text-neutral-700 transition-colors">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <img src="/images/logo.png" alt="THRIVES" className="w-6 h-6 rounded object-contain" />
              <span className="font-semibold text-sm text-neutral-900">THRIVES Researcher</span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
