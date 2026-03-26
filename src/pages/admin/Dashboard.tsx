import { Users, BookOpen, CheckCircle2, TrendingUp, Activity } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { AdminShell } from '../../components/layout/AdminShell';
import { Card, StatCard } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ParticipantStatusBadge } from '../../components/ui/Badge';
import { ALL_PARTICIPANTS } from '../../data/users';
import { MODULES } from '../../data/modules';

// Derived stats
const totalParticipants = ALL_PARTICIPANTS.length;
const activeParticipants = ALL_PARTICIPANTS.filter(u => u.status === 'active').length;
const completedParticipants = ALL_PARTICIPANTS.filter(u => u.status === 'completed').length;

const moduleCompletionData = MODULES.filter(m => m.publishState === 'published').map(mod => {
  const completions = ALL_PARTICIPANTS.filter(u =>
    u.progress.some(p => p.moduleId === mod.id && p.status === 'completed')
  ).length;
  return {
    name: mod.title.split(' ').slice(0, 2).join(' '),
    completions,
    total: totalParticipants,
    pct: Math.round((completions / totalParticipants) * 100),
  };
});

const engagementData = [
  { week: 'Jan W1', logins: 3,  completions: 1 },
  { week: 'Jan W2', logins: 5,  completions: 2 },
  { week: 'Jan W3', logins: 6,  completions: 3 },
  { week: 'Feb W1', logins: 8,  completions: 4 },
  { week: 'Feb W2', logins: 7,  completions: 3 },
  { week: 'Feb W3', logins: 10, completions: 5 },
  { week: 'Mar W1', logins: 9,  completions: 4 },
  { week: 'Mar W2', logins: 12, completions: 6 },
];

const recentActivity = ALL_PARTICIPANTS
  .sort((a, b) => (b.lastActiveAt > a.lastActiveAt ? 1 : -1))
  .slice(0, 5);

export function AdminDashboard() {
  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Researcher Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-1">
          THRIVES Program · Spring 2024 Overview
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Participants"
          value={totalParticipants}
          subtitle={`${activeParticipants} active`}
          icon={<Users size={18} />}
          color="mint"
        />
        <StatCard
          label="Completed Program"
          value={completedParticipants}
          subtitle={`${Math.round((completedParticipants / totalParticipants) * 100)}% graduation rate`}
          icon={<CheckCircle2 size={18} />}
          color="blue"
        />
        <StatCard
          label="Modules Published"
          value={MODULES.filter(m => m.publishState === 'published').length}
          subtitle="1 in draft"
          icon={<BookOpen size={18} />}
          color="yellow"
        />
        <StatCard
          label="Avg. Completion Rate"
          value={`${Math.round(moduleCompletionData.reduce((s,d) => s + d.pct, 0) / moduleCompletionData.length)}%`}
          subtitle="across all modules"
          icon={<TrendingUp size={18} />}
          color="mint"
        />
      </div>

      <div className="grid xl:grid-cols-3 gap-6 mb-6">
        {/* Module completions bar chart */}
        <Card className="xl:col-span-2">
          <h2 className="text-sm font-semibold text-neutral-800 mb-4">Module Completion Rate</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={moduleCompletionData} barSize={28}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip
                formatter={(val) => [`${val}%`, 'Completion rate']}
                contentStyle={{ borderRadius: 8, border: '1px solid #E8E5E0', fontSize: 12 }}
              />
              <Bar dataKey="pct" fill="#00476b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Quick module summary */}
        <Card>
          <h2 className="text-sm font-semibold text-neutral-800 mb-4">Completions by Module</h2>
          <div className="flex flex-col gap-3">
            {moduleCompletionData.map(m => (
              <div key={m.name}>
                <div className="flex justify-between text-xs text-neutral-600 mb-1">
                  <span>{m.name}</span>
                  <span className="tabular-nums text-neutral-400">{m.completions}/{m.total}</span>
                </div>
                <ProgressBar value={m.pct} size="sm" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        {/* Engagement trend */}
        <Card className="xl:col-span-2">
          <h2 className="text-sm font-semibold text-neutral-800 mb-4">Weekly Engagement</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F4F2" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#78716C' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#78716C' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E8E5E0', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="logins" stroke="#00476b" strokeWidth={2} dot={false} name="Logins" />
              <Line type="monotone" dataKey="completions" stroke="#fbbd80" strokeWidth={2} dot={false} name="Module completions" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent activity */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} className="text-neutral-500" />
            <h2 className="text-sm font-semibold text-neutral-800">Recent Activity</h2>
          </div>
          <div className="flex flex-col gap-3">
            {recentActivity.map(user => {
              const completed = user.progress.filter(p => p.status === 'completed').length;
              const total = MODULES.filter(m => m.publishState === 'published').length;
              return (
                <div key={user.id} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-brand-navy flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 truncate">{user.name}</p>
                    <p className="text-xs text-neutral-400">{completed}/{total} modules</p>
                  </div>
                  <ParticipantStatusBadge status={user.status} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
