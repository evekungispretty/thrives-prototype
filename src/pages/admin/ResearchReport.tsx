import { useState, useMemo } from 'react';
import { BarChart2, Users, CheckCircle2, TrendingUp, Download } from 'lucide-react';
import { AdminShell } from '../../components/layout/AdminShell';
import { Card } from '../../components/ui/Card';
import { QUESTIONS } from '../../data/questions';
import { MODULES } from '../../data/modules';
import { ALL_PARTICIPANTS } from '../../data/users';
import { quizStore } from '../../stores/quizStore';
import type { QuizAttempt } from '../../types';

// ─── Section labels ────────────────────────────────────────────────────────────

const SECTIONS: { label: string; orders: number[] }[] = [
  { label: 'Feeding From the Start',              orders: [1, 2, 3, 4, 5] },
  { label: 'Safe Eats: Foods & Drinks to Avoid',  orders: [6, 7, 8] },
  { label: 'Tiny Tummies: Starting Solids',       orders: [9, 10, 11, 12] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getOptionCounts(attempts: QuizAttempt[], questionId: string): Record<string, number> {
  const counts: Record<string, number> = {};
  attempts.forEach(att => {
    const result = att.results.find(r => r.questionId === questionId);
    if (result && typeof result.answer === 'string' && result.answer) {
      counts[result.answer] = (counts[result.answer] ?? 0) + 1;
    }
  });
  return counts;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ResearchReport() {
  const [moduleFilter, setModuleFilter] = useState('mod-1');
  const [cohortFilter, setCohortFilter] = useState('all');

  const cohorts = useMemo(() => {
    const set = new Set(ALL_PARTICIPANTS.map(u => u.cohort));
    return ['all', ...Array.from(set)];
  }, []);

  const allAttempts = quizStore.getForModule(moduleFilter);

  const filteredAttempts = useMemo(() => {
    if (cohortFilter === 'all') return allAttempts;
    return allAttempts.filter(att => {
      const user = ALL_PARTICIPANTS.find(u => u.id === att.userId);
      return user?.cohort === cohortFilter;
    });
  }, [allAttempts, cohortFilter]);

  const questions = QUESTIONS.filter(q => q.moduleId === moduleFilter).sort((a, b) => a.order - b.order);
  const mod = MODULES.find(m => m.id === moduleFilter);

  // Summary stats
  const totalResponses = filteredAttempts.length;
  const avgScore = totalResponses > 0
    ? filteredAttempts.reduce((s, a) => s + a.totalScore, 0) / totalResponses
    : 0;
  const maxScore = filteredAttempts[0]?.maxScore ?? questions.length;
  const passCount = filteredAttempts.filter(a => a.passed).length;
  const passRate = totalResponses > 0 ? Math.round((passCount / totalResponses) * 100) : 0;
  const avgPct = maxScore > 0 ? Math.round((avgScore / maxScore) * 100) : 0;

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Research Report</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Quiz response data across all participants</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors flex-shrink-0">
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-neutral-500 mb-1 block">Module</label>
            <select
              value={moduleFilter}
              onChange={e => setModuleFilter(e.target.value)}
              className="h-9 w-full rounded-lg border border-neutral-300 px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-navy"
            >
              {MODULES.filter(m => m.publishState === 'published').map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-neutral-500 mb-1 block">Cohort</label>
            <select
              value={cohortFilter}
              onChange={e => setCohortFilter(e.target.value)}
              className="h-9 w-full rounded-lg border border-neutral-300 px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-navy"
            >
              {cohorts.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'All Cohorts' : c}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Users size={15} className="text-brand-navy" />
            <p className="text-xs font-medium text-neutral-500">Responses</p>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{totalResponses}</p>
          <p className="text-xs text-neutral-400 mt-0.5">participants</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 size={15} className="text-brand-navy" />
            <p className="text-xs font-medium text-neutral-500">Avg Score</p>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {totalResponses > 0 ? avgScore.toFixed(1) : '—'}
            <span className="text-base font-normal text-neutral-400">/{maxScore}</span>
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">{totalResponses > 0 ? `${avgPct}%` : '—'}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={15} className="text-brand-navy" />
            <p className="text-xs font-medium text-neutral-500">Pass Rate</p>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{totalResponses > 0 ? `${passRate}%` : '—'}</p>
          <p className="text-xs text-neutral-400 mt-0.5">{passCount} of {totalResponses} passed</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={15} className="text-brand-navy" />
            <p className="text-xs font-medium text-neutral-500">Questions</p>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{questions.length}</p>
          <p className="text-xs text-neutral-400 mt-0.5">{mod?.title.split(' ').slice(0, 3).join(' ')}</p>
        </Card>
      </div>

      {/* Per-question breakdown */}
      {totalResponses === 0 ? (
        <Card className="text-center py-12">
          <p className="text-neutral-400 text-sm">No responses yet for this module{cohortFilter !== 'all' ? ' in this cohort' : ''}.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {SECTIONS.map(section => {
            const sectionQs = questions.filter(q => section.orders.includes(q.order));
            if (sectionQs.length === 0) return null;
            return (
              <div key={section.label}>
                <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="flex-1 border-b border-neutral-200" />
                  <span className="flex-shrink-0">{section.label}</span>
                  <span className="flex-1 border-b border-neutral-200" />
                </h2>
                <div className="flex flex-col gap-4">
                  {sectionQs.map((q, _qi) => {
                    const counts = getOptionCounts(filteredAttempts, q.id);
                    const totalAnswered = Object.values(counts).reduce((s, c) => s + c, 0);
                    const correctId = q.options?.find(o => o.isCorrect)?.id;
                    const correctCount = counts[correctId ?? ''] ?? 0;
                    const correctPct = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

                    return (
                      <Card key={q.id} padding="none">
                        {/* Question header */}
                        <div className="px-5 py-4 border-b border-neutral-100">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                                Q{q.order}
                              </span>
                              <p className="text-sm font-medium text-neutral-800 mt-0.5 leading-snug">
                                {q.prompt}
                              </p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <p className={`text-lg font-bold ${correctPct >= 70 ? 'text-brand-navy' : correctPct >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                                {correctPct}%
                              </p>
                              <p className="text-xs text-neutral-400">correct</p>
                            </div>
                          </div>
                        </div>

                        {/* Options */}
                        <div className="px-5 py-4 flex flex-col gap-2.5">
                          {q.options?.map(opt => {
                            const count = counts[opt.id] ?? 0;
                            const pct = totalAnswered > 0 ? Math.round((count / totalAnswered) * 100) : 0;
                            const isCorrect = opt.isCorrect;

                            return (
                              <div key={opt.id} className="flex items-center gap-3">
                                {/* Option label */}
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                  isCorrect ? 'bg-brand-navy text-white' : 'bg-neutral-100 text-neutral-500'
                                }`}>
                                  {opt.id.toUpperCase()}
                                </div>

                                {/* Text + bar */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <p className={`text-xs truncate ${isCorrect ? 'font-semibold text-neutral-800' : 'text-neutral-600'}`}>
                                      {opt.text}
                                      {isCorrect && (
                                        <span className="ml-1.5 text-brand-navy font-normal">(correct)</span>
                                      )}
                                    </p>
                                    <span className="text-xs font-semibold text-neutral-700 flex-shrink-0 tabular-nums">
                                      {count} <span className="text-neutral-400 font-normal">({pct}%)</span>
                                    </span>
                                  </div>
                                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        isCorrect ? 'bg-brand-navy' : 'bg-neutral-300'
                                      }`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* Response count */}
                          <p className="text-xs text-neutral-400 mt-1 text-right">
                            {totalAnswered} response{totalAnswered !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Individual response table */}
      {totalResponses > 0 && (
        <div className="mt-8">
          <h2 className="text-base font-semibold text-neutral-800 mb-4">Individual Responses</h2>
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Participant</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Cohort</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Date</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Score</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {filteredAttempts.map(att => {
                    const user = ALL_PARTICIPANTS.find(u => u.id === att.userId);
                    const name = user?.name ?? 'Demo Participant';
                    const cohort = user?.cohort ?? '—';
                    const pct = Math.round((att.totalScore / att.maxScore) * 100);
                    return (
                      <tr key={att.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-5 py-3 font-medium text-neutral-800">{name}</td>
                        <td className="px-5 py-3 text-neutral-500 text-xs">{cohort}</td>
                        <td className="px-5 py-3 text-neutral-500 text-xs">{att.completedAt}</td>
                        <td className="px-5 py-3 text-right font-semibold text-neutral-800">
                          {att.totalScore}/{att.maxScore}
                          <span className="text-neutral-400 font-normal ml-1 text-xs">({pct}%)</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            att.passed ? 'bg-brand-mint-pale text-brand-navy' : 'bg-brand-peach-pale text-brand-navy'
                          }`}>
                            {att.passed ? 'Passed' : 'Review'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </AdminShell>
  );
}
