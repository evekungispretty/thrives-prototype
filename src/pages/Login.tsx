import { useLocation } from 'wouter';
import { ArrowRight } from 'lucide-react';

export function Login() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-mint-pale via-neutral-50 to-brand-blue-pale flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-10">
            <img src="/images/logo.png" alt="THRIVES logo" className="w-100 h-1-- object-contain" />
        </div>

        {/* Role select card */}
        <div className="bg-white rounded-2xl shadow-card-lg border border-neutral-200 p-6">
          <p className="text-sm font-medium text-neutral-700 mb-4">Select a demo view to continue</p>

          <div className="flex flex-col gap-3">
            {/* Participant */}
            <button
              onClick={() => navigate('/participant/dashboard')}
              className="group w-full flex items-center justify-between p-4 rounded-xl border-2 border-brand-mint bg-brand-mint/30 hover:bg-brand-mint/60 transition-all text-left"
            >
              <div>
                <p className="font-semibold text-brand-navy">Caregiver / Participant</p>
                <p className="text-xs text-brand-navy/60 mt-0.5">Browse modules, complete lessons, take quizzes</p>
              </div>
              <ArrowRight size={18} className="text-brand-navy group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </button>

            {/* Admin */}
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="group w-full flex items-center justify-between p-4 rounded-xl border-2 border-brand-blue bg-brand-blue/30 hover:bg-brand-blue/60 transition-all text-left"
            >
              <div>
                <p className="font-semibold text-brand-navy">Researcher / Admin</p>
                <p className="text-xs text-brand-navy/60 mt-0.5">Manage users, view progress, author quiz questions</p>
              </div>
              <ArrowRight size={18} className="text-brand-navy group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </button>
          </div>

          <p className="mt-5 text-xs text-neutral-400 text-center leading-relaxed">
            Portfolio prototype — no credentials required.
            <br />Built to demonstrate the THRIVES learning system.
          </p>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          University of Florida · College of Education · THRIVES Program
        </p>
      </div>
    </div>
  );
}
