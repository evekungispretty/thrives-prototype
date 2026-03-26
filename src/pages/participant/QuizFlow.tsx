import { useParams, useLocation } from 'wouter';
import { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { ParticipantShell } from '../../components/layout/ParticipantShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { MODULES } from '../../data/modules';
import { QUESTIONS } from '../../data/questions';
import type { Question } from '../../types';

type QuizPhase = 'intro' | 'question' | 'feedback' | 'complete';

function shuffleRight(pairs: { id: string; left: string; right: string }[]) {
  const rights = [...pairs.map(p => p.right)].sort(() => Math.random() - 0.5);
  return rights;
}

export function QuizFlow() {
  const { id: moduleId } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const mod = MODULES.find(m => m.id === moduleId);
  const questions = QUESTIONS.filter(q => q.moduleId === moduleId);

  const [phase, setPhase] = useState<QuizPhase>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [matchSelections, setMatchSelections] = useState<Record<string, string>>({});
  const [shuffledRights, setShuffledRights] = useState<string[]>([]);

  const currentQ = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;

  const initQuestion = (q: Question) => {
    if (q.type === 'matching' && q.pairs) {
      setShuffledRights(shuffleRight(q.pairs));
      setMatchSelections({});
    }
    setSubmitted(false);
  };

  const startQuiz = () => {
    if (questions.length === 0) return;
    setCurrentIdx(0);
    initQuestion(questions[0]);
    setPhase('question');
  };

  const handleAnswer = (qId: string, val: string | string[]) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmitAnswer = () => setSubmitted(true);

  const handleNext = () => {
    if (isLast) {
      setPhase('complete');
    } else {
      const next = currentIdx + 1;
      setCurrentIdx(next);
      initQuestion(questions[next]);
      setPhase('question');
    }
  };

  // Scoring
  const calcScore = () => {
    let earned = 0;
    let max = 0;
    questions.forEach(q => {
      max += q.points;
      if (q.points === 0) return; // scale = no points
      const ans = answers[q.id];
      if (q.type === 'multiple_choice' && ans) {
        const correct = q.options?.find(o => o.isCorrect)?.id;
        if (ans === correct) earned += q.points;
      } else if (q.type === 'multi_select' && Array.isArray(ans)) {
        const correctIds = q.options?.filter(o => o.isCorrect).map(o => o.id) ?? [];
        const allRight = correctIds.every(id => ans.includes(id)) && ans.every(id => correctIds.includes(id));
        if (allRight) earned += q.points;
      } else if (q.type === 'short_text' && ans) {
        // Award partial credit always for demo
        earned += Math.round(q.points * 0.75);
      } else if (q.type === 'matching' && q.pairs) {
        // Check match selections
        q.pairs.forEach(p => {
          if (matchSelections[p.id] === p.right) earned += 1;
        });
        max += q.pairs.length - q.points; // adjust
      }
    });
    return { earned, max };
  };

  if (!mod) return <ParticipantShell><p className="text-neutral-500">Module not found.</p></ParticipantShell>;

  return (
    <ParticipantShell>
      <div className="max-w-2xl mx-auto">
        {/* Intro */}
        {phase === 'intro' && (
          <Card className="text-center animate-slide-up">
            <div className="w-14 h-14 rounded-full bg-brand-mint-pale flex items-center justify-center mx-auto mb-4">
              <Trophy size={24} className="text-brand-navy" />
            </div>
            <h1 className="text-xl font-bold text-neutral-900 mb-2">Knowledge Check</h1>
            <p className="text-neutral-600 mb-1">{mod.title}</p>
            <p className="text-sm text-neutral-500 mb-6">
              {questions.length} questions · Estimated 5–8 minutes
            </p>
            <div className="bg-neutral-50 rounded-xl p-4 text-left mb-6">
              <p className="text-sm font-medium text-neutral-700 mb-2">Before you start:</p>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>• Answer each question based on what you learned in the module</li>
                <li>• Some questions are for reflection only and won't affect your score</li>
                <li>• You can review your responses at the end</li>
              </ul>
            </div>
            <Button onClick={startQuiz} size="lg" className="w-full">
              Begin Quiz <ArrowRight size={16} />
            </Button>
          </Card>
        )}

        {/* Question */}
        {(phase === 'question' || phase === 'feedback') && currentQ && (
          <div className="animate-slide-up">
            {/* Progress */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-mint rounded-full transition-all duration-500"
                  style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-neutral-500 tabular-nums flex-shrink-0">
                {currentIdx + 1} / {questions.length}
              </span>
            </div>

            <Card>
              {/* Question type label */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  currentQ.type === 'multiple_choice' ? 'bg-blue-100 text-blue-700' :
                  currentQ.type === 'matching' ? 'bg-purple-100 text-purple-700' :
                  currentQ.type === 'short_text' ? 'bg-brand-yellow-pale text-brand-navy' :
                  currentQ.type === 'multi_select' ? 'bg-brand-mint-pale text-brand-navy' :
                  'bg-neutral-100 text-neutral-600'
                }`}>
                  {currentQ.type === 'multiple_choice' ? 'Multiple Choice' :
                   currentQ.type === 'matching' ? 'Matching' :
                   currentQ.type === 'short_text' ? 'Short Response' :
                   currentQ.type === 'multi_select' ? 'Select All That Apply' :
                   'Rating Scale'}
                </span>
                {currentQ.points > 0 && (
                  <span className="text-xs text-neutral-400">{currentQ.points} pt{currentQ.points !== 1 ? 's' : ''}</span>
                )}
              </div>

              <p className="text-base font-medium text-neutral-900 mb-5 leading-relaxed">
                {currentQ.prompt}
              </p>

              {/* Multiple choice / multi-select */}
              {(currentQ.type === 'multiple_choice' || currentQ.type === 'multi_select') && currentQ.options && (
                <div className="flex flex-col gap-2">
                  {currentQ.options.map(opt => {
                    const selected = currentQ.type === 'multi_select'
                      ? (Array.isArray(answers[currentQ.id]) ? (answers[currentQ.id] as string[]).includes(opt.id) : false)
                      : answers[currentQ.id] === opt.id;
                    const showFeedback = submitted && currentQ.type === 'multiple_choice';
                    const isCorrect = opt.isCorrect;

                    return (
                      <button
                        key={opt.id}
                        disabled={submitted && currentQ.type === 'multiple_choice'}
                        onClick={() => {
                          if (submitted) return;
                          if (currentQ.type === 'multi_select') {
                            const prev = Array.isArray(answers[currentQ.id]) ? (answers[currentQ.id] as string[]) : [];
                            const next = prev.includes(opt.id) ? prev.filter(x => x !== opt.id) : [...prev, opt.id];
                            handleAnswer(currentQ.id, next);
                          } else {
                            handleAnswer(currentQ.id, opt.id);
                          }
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all text-sm font-medium ${
                          showFeedback
                            ? isCorrect
                              ? 'border-brand-mint bg-brand-mint-pale text-brand-navy'
                              : selected && !isCorrect
                              ? 'border-red-400 bg-red-50 text-red-800'
                              : 'border-neutral-200 text-neutral-500'
                            : selected
                            ? 'border-brand-navy bg-brand-mint-pale text-brand-navy'
                            : 'border-neutral-200 hover:border-brand-mint hover:bg-brand-mint-pale/50 text-neutral-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          showFeedback
                            ? isCorrect ? 'border-brand-navy bg-brand-navy' : selected ? 'border-red-500 bg-red-500' : 'border-neutral-300'
                            : selected ? 'border-brand-navy bg-brand-navy' : 'border-neutral-300'
                        }`}>
                          {selected && !showFeedback && <div className="w-2 h-2 rounded-full bg-white" />}
                          {showFeedback && isCorrect && <CheckCircle2 size={12} className="text-white" />}
                          {showFeedback && selected && !isCorrect && <XCircle size={12} className="text-white" />}
                        </div>
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Matching */}
              {currentQ.type === 'matching' && currentQ.pairs && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-neutral-500 mb-1">Item</p>
                    {currentQ.pairs.map(pair => (
                      <div key={pair.id} className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-700 font-medium min-h-10 flex items-center">
                        {pair.left}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-neutral-500 mb-1">Match</p>
                    {currentQ.pairs.map((pair, idx) => (
                      <select
                        key={pair.id}
                        value={matchSelections[pair.id] ?? ''}
                        disabled={submitted}
                        onChange={e => setMatchSelections(prev => ({ ...prev, [pair.id]: e.target.value }))}
                        className="p-2 rounded-xl border-2 border-neutral-200 text-sm focus:border-brand-navy focus:outline-none bg-white min-h-10"
                      >
                        <option value="">Select…</option>
                        {shuffledRights.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    ))}
                  </div>
                </div>
              )}

              {/* Short text */}
              {currentQ.type === 'short_text' && (
                <textarea
                  rows={4}
                  disabled={submitted}
                  value={typeof answers[currentQ.id] === 'string' ? answers[currentQ.id] as string : ''}
                  onChange={e => handleAnswer(currentQ.id, e.target.value)}
                  placeholder="Type your response here…"
                  className="w-full border-2 border-neutral-200 rounded-xl p-3 text-sm text-neutral-700 focus:border-brand-navy focus:outline-none resize-none"
                />
              )}

              {/* Scale */}
              {currentQ.type === 'scale' && currentQ.scaleMin !== undefined && currentQ.scaleMax !== undefined && (
                <div>
                  <div className="flex items-center gap-3 my-2">
                    {Array.from({ length: currentQ.scaleMax - currentQ.scaleMin + 1 }, (_, i) => i + currentQ.scaleMin!).map(val => (
                      <button
                        key={val}
                        onClick={() => handleAnswer(currentQ.id, String(val))}
                        className={`flex-1 h-12 rounded-xl border-2 text-sm font-semibold transition-all ${
                          answers[currentQ.id] === String(val)
                            ? 'border-brand-navy bg-brand-navy text-white'
                            : 'border-neutral-200 text-neutral-700 hover:border-brand-mint'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  {currentQ.scaleLabels && (
                    <div className="flex justify-between text-xs text-neutral-400 mt-1">
                      <span>{currentQ.scaleLabels[0]}</span>
                      <span>{currentQ.scaleLabels[1]}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Feedback message */}
              {submitted && currentQ.type === 'multiple_choice' && (
                <div className={`mt-4 p-3 rounded-xl text-sm ${
                  answers[currentQ.id] === currentQ.options?.find(o => o.isCorrect)?.id
                    ? 'bg-brand-mint-pale border border-brand-mint text-brand-navy'
                    : 'bg-brand-peach-pale border border-brand-peach text-brand-navy'
                }`}>
                  {answers[currentQ.id] === currentQ.options?.find(o => o.isCorrect)?.id
                    ? '✓ Correct! Well done.'
                    : `Not quite — the correct answer is highlighted above.`}
                </div>
              )}

              {submitted && currentQ.type === 'short_text' && (
                <div className="mt-4 p-3 rounded-xl text-sm bg-blue-50 border border-blue-200 text-blue-800">
                  <p className="font-medium mb-1">Model answer:</p>
                  <p>{currentQ.correctAnswer}</p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-2">
                {!submitted && (currentQ.type === 'multiple_choice' || currentQ.type === 'short_text') && (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!answers[currentQ.id]}
                    variant="outline"
                    size="sm"
                  >
                    Check Answer
                  </Button>
                )}
                <Button onClick={handleNext} size="sm">
                  {isLast ? 'See Results' : 'Next Question'} <ArrowRight size={14} />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Complete */}
        {phase === 'complete' && (
          <div className="animate-slide-up">
            {(() => {
              const { earned, max } = calcScore();
              const pct = Math.round((earned / max) * 100);
              const passed = pct >= 70;
              return (
                <Card className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? 'bg-brand-mint-pale' : 'bg-brand-yellow-pale'}`}>
                    {passed
                      ? <Trophy size={28} className="text-brand-navy" />
                      : <RotateCcw size={28} className="text-brand-navy" />}
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900 mb-1">
                    {passed ? 'Great work!' : 'Keep it up!'}
                  </h2>
                  <p className="text-neutral-500 mb-6">
                    {passed
                      ? `You completed the ${mod.title} knowledge check.`
                      : 'Review the module and try again — you\'re building something great.'}
                  </p>

                  <div className="bg-neutral-50 rounded-2xl p-6 mb-6">
                    <p className="text-4xl font-bold text-neutral-900 mb-1">{earned}<span className="text-xl text-neutral-400">/{max}</span></p>
                    <p className="text-sm text-neutral-500">Score · {pct}%</p>
                    <div className="mt-4 h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${passed ? 'bg-brand-mint' : 'bg-brand-peach'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Per-question summary */}
                  <div className="text-left mb-6 flex flex-col gap-2">
                    {questions.map((q, i) => {
                      const ans = q.type === 'matching' ? null : answers[q.id];
                      const correct = q.options?.find(o => o.isCorrect)?.id;
                      const isRight = q.type === 'multiple_choice' ? ans === correct : q.type === 'scale' ? true : !!ans;
                      return (
                        <div key={q.id} className="flex items-start gap-2 text-sm">
                          {isRight
                            ? <CheckCircle2 size={16} className="text-brand-navy mt-0.5 flex-shrink-0" />
                            : <XCircle size={16} className="text-brand-peach mt-0.5 flex-shrink-0" />}
                          <span className="text-neutral-700">{i + 1}. {q.prompt.slice(0, 60)}{q.prompt.length > 60 ? '…' : ''}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => { setPhase('intro'); setAnswers({}); setCurrentIdx(0); }}
                      className="flex-1"
                    >
                      <RotateCcw size={14} /> Retake
                    </Button>
                    <Button onClick={() => navigate(`/participant/modules/${moduleId}`)} className="flex-1">
                      Back to Module <ArrowRight size={14} />
                    </Button>
                  </div>
                </Card>
              );
            })()}
          </div>
        )}
      </div>
    </ParticipantShell>
  );
}
