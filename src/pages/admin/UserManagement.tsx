import { useState } from 'react';
import { Search, Plus, MoreHorizontal, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';
import { AdminShell } from '../../components/layout/AdminShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ParticipantStatusBadge } from '../../components/ui/Badge';
import { ALL_PARTICIPANTS } from '../../data/users';
import { MODULES } from '../../data/modules';
import type { ParticipantStatus } from '../../types';

const COHORTS = ['All Cohorts', 'Spring 2024 — Alachua County', 'Spring 2024 — Marion County', 'Fall 2023 — Alachua County', 'Fall 2023 — Marion County'];
const STATUSES: { value: string; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'completed', label: 'Completed' },
  { value: 'enrolled', label: 'Enrolled' },
];

type FormData = {
  name: string;
  email: string;
  cohort: string;
  status: ParticipantStatus;
};

const INITIAL_FORM: FormData = { name: '', email: '', cohort: COHORTS[1], status: 'enrolled' };

export function UserManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cohortFilter, setCohortFilter] = useState('All Cohorts');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const totalModules = MODULES.filter(m => m.publishState === 'published').length;

  const filtered = ALL_PARTICIPANTS.filter(u => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchCohort = cohortFilter === 'All Cohorts' || u.cohort === cohortFilter;
    return matchSearch && matchStatus && matchCohort;
  });

  const handleSave = () => {
    // In a real app: dispatch to state. For demo, just close.
    setModalOpen(false);
    setForm(INITIAL_FORM);
  };

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Participants</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{ALL_PARTICIPANTS.length} total enrolled</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={15} /> Add Participant
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="h-9 w-full rounded-lg border border-neutral-300 pl-9 pr-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-neutral-300 px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-navy"
          >
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select
            value={cohortFilter}
            onChange={e => setCohortFilter(e.target.value)}
            className="h-9 rounded-lg border border-neutral-300 px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-navy"
          >
            {COHORTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-150 bg-neutral-50">
                {['Participant', 'Cohort', 'Status', 'Progress', 'Last Active', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map(user => {
                const completedMods = user.progress.filter(p => p.status === 'completed').length;
                const pct = Math.round((completedMods / totalModules) * 100);
                return (
                  <tr key={user.id} className="hover:bg-neutral-50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-800">{user.name}</p>
                          <p className="text-xs text-neutral-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-neutral-600">{user.cohort}</p>
                    </td>
                    <td className="px-4 py-3">
                      <ParticipantStatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3 min-w-[140px]">
                      <div>
                        <div className="flex justify-between text-xs text-neutral-500 mb-1">
                          <span>{completedMods}/{totalModules} modules</span>
                          <span>{pct}%</span>
                        </div>
                        <ProgressBar value={pct} size="sm" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-neutral-500">{formatDate(user.lastActiveAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/users/${user.id}`}>
                          <button className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors">
                            <ChevronRight size={14} />
                          </button>
                        </Link>
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                            className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
                          >
                            <MoreHorizontal size={14} />
                          </button>
                          {openMenuId === user.id && (
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-neutral-200 rounded-xl shadow-card-md z-20 py-1">
                              {['Edit Participant', 'Send Reminder', 'Remove'].map(action => (
                                <button
                                  key={action}
                                  onClick={() => setOpenMenuId(null)}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 transition-colors ${action === 'Remove' ? 'text-red-500' : 'text-neutral-700'}`}
                                >
                                  {action}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-neutral-400 text-sm">
                    No participants match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-neutral-150 flex items-center justify-between">
          <p className="text-xs text-neutral-400">
            Showing {filtered.length} of {ALL_PARTICIPANTS.length} participants
          </p>
        </div>
      </Card>

      {/* Add participant modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Participant">
        <div className="flex flex-col gap-4">
          <Input
            label="Full Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Maria Santos"
          />
          <Input
            label="Email Address"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="e.g. maria@example.com"
          />
          <Select
            label="Cohort"
            value={form.cohort}
            onChange={e => setForm(f => ({ ...f, cohort: e.target.value }))}
            options={COHORTS.slice(1).map(c => ({ value: c, label: c }))}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value as ParticipantStatus }))}
            options={STATUSES.slice(1)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-150 mt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.email}>Add Participant</Button>
          </div>
        </div>
      </Modal>
    </AdminShell>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
