import { useParams, useLocation } from 'wouter';
import { useState } from 'react';
import { ArrowRight, ArrowLeft, Target } from 'lucide-react';
import { ParticipantShell } from '../../components/layout/ParticipantShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { GOAL_CONFIGS } from '../../data/goals';
import { goalsStore } from '../../stores/goalsStore';

type GoalStep = 1 | 2 | 3;

export function GoalsFlow() {
  const { id: moduleId } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const config = GOAL_CONFIGS.find(g => g.moduleId === moduleId);

  const [step, setStep] = useState<GoalStep>(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [customGoalChecked, setCustomGoalChecked] = useState(false);
  const [customGoal, setCustomGoal] = useState('');
  const [steps, setSteps] = useState('');
  const [startDate, setStartDate] = useState('');
  const [challenges, setChallenges] = useState('');
  const [overcome, setOvercome] = useState('');

  if (!config) {
    return (
      <ParticipantShell>
        <p className="text-neutral-500">Goals not available for this module.</p>
      </ParticipantShell>
    );
  }

  const toggleGoal = (option: string) => {
    setSelectedGoals(prev =>
      prev.includes(option) ? prev.filter(g => g !== option) : [...prev, option]
    );
  };

  const canAdvanceStep1 = selectedGoals.length > 0 || (customGoalChecked && customGoal.trim() !== '');
  const canAdvanceStep2 = steps.trim() !== '' && startDate !== '';
  const canAdvanceStep3 = challenges.trim() !== '' && overcome.trim() !== '';

  const handleComplete = () => {
    const allGoals = [...selectedGoals];
    if (customGoalChecked && customGoal.trim()) allGoals.push(customGoal.trim());

    goalsStore.add({
      id: `goal-${Date.now()}`,
      userId: 'user-demo',
      moduleId: moduleId!,
      completedAt: new Date().toISOString().split('T')[0],
      selectedGoals: allGoals,
      customGoal: customGoalChecked ? customGoal.trim() : undefined,
      steps,
      startDate,
      challenges,
      overcome,
    });
    navigate('/participant/goals');
  };

  const stepTitles: Record<GoalStep, string> = {
    1: 'Goals (1/3)',
    2: 'Goals (2/3)',
    3: 'Goals (3/3)',
  };

  return (
    <ParticipantShell>
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-mint rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
          <span className="text-xs text-neutral-500 tabular-nums flex-shrink-0">
            {step} / 3
          </span>
        </div>

        <Card className="animate-slide-up">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-brand-navy uppercase tracking-wide">
              {config.programLabel}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">{stepTitles[step]}</h1>

          {/* ── Step 1: Goal selection ── */}
          {step === 1 && (
            <>
              <p className="text-sm text-neutral-600 mb-3 leading-relaxed">{config.intro}</p>
              <p className="text-sm text-neutral-600 mb-6 leading-relaxed">{config.instructions}</p>

              <div className="bg-white rounded-2xl border border-neutral-200 p-5">
                <p className="text-sm font-bold text-neutral-900 mb-4">
                  My goals are to: <span className="font-normal text-neutral-500">(select all that apply or create a new goal)</span>
                </p>

                <div className="flex flex-col gap-3">
                  {config.goalOptions.map(option => (
                    <label key={option} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedGoals.includes(option)}
                        onChange={() => toggleGoal(option)}
                        className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-brand-navy accent-brand-navy cursor-pointer flex-shrink-0"
                      />
                      <span className="text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors leading-snug">
                        {option}
                      </span>
                    </label>
                  ))}

                  {/* Other */}
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={customGoalChecked}
                        onChange={e => setCustomGoalChecked(e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-300 accent-brand-navy cursor-pointer flex-shrink-0"
                      />
                      <span className="text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors">
                        Other:
                      </span>
                    </label>
                    {customGoalChecked && (
                      <input
                        type="text"
                        value={customGoal}
                        onChange={e => setCustomGoal(e.target.value)}
                        placeholder="Please specify"
                        className="ml-7 border-2 border-neutral-200 rounded-xl px-3 py-2 text-sm text-neutral-700 focus:border-brand-navy focus:outline-none"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={() => navigate(`/participant/modules/${moduleId}`)}>
                  <ArrowLeft size={14} /> Back
                </Button>
                <Button disabled={!canAdvanceStep1} onClick={() => setStep(2)}>
                  Next <ArrowRight size={14} />
                </Button>
              </div>
            </>
          )}

          {/* ── Step 2: Action plan ── */}
          {step === 2 && (
            <>
              <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
                Great goals! Now let's make a plan. Writing down the steps you'll take makes it much more likely you'll follow through.
              </p>

              <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-2">
                    What steps will you take to reach your goal?
                  </label>
                  <textarea
                    rows={4}
                    value={steps}
                    onChange={e => setSteps(e.target.value)}
                    placeholder="e.g. I will watch for hunger cues before each feeding and note them in a journal..."
                    className="w-full border-2 border-neutral-200 rounded-xl p-3 text-sm text-neutral-700 focus:border-brand-navy focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-2">
                    When do you plan to start?
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="border-2 border-neutral-200 rounded-xl px-3 py-2 text-sm text-neutral-700 focus:border-brand-navy focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft size={14} /> Back
                </Button>
                <Button disabled={!canAdvanceStep2} onClick={() => setStep(3)}>
                  Next <ArrowRight size={14} />
                </Button>
              </div>
            </>
          )}

          {/* ── Step 3: Challenges ── */}
          {step === 3 && (
            <>
              <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
                Almost done! Thinking ahead about challenges helps you stay on track. Remember, your home visitor is here to support you.
              </p>

              <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-2">
                    What challenges might come up?
                  </label>
                  <textarea
                    rows={3}
                    value={challenges}
                    onChange={e => setChallenges(e.target.value)}
                    placeholder="e.g. I might be too tired after night feedings to track hunger cues..."
                    className="w-full border-2 border-neutral-200 rounded-xl p-3 text-sm text-neutral-700 focus:border-brand-navy focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-2">
                    How will you overcome them?
                  </label>
                  <textarea
                    rows={3}
                    value={overcome}
                    onChange={e => setOvercome(e.target.value)}
                    placeholder="e.g. I'll ask my partner to help track feedings during the night shift..."
                    className="w-full border-2 border-neutral-200 rounded-xl p-3 text-sm text-neutral-700 focus:border-brand-navy focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  <ArrowLeft size={14} /> Back
                </Button>
                <Button disabled={!canAdvanceStep3} onClick={handleComplete}>
                  Finish <Target size={14} />
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </ParticipantShell>
  );
}
