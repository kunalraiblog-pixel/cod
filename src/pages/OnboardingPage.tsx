import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Target, 
  ShieldAlert, 
  Globe, 
  Sparkles, 
  KeyRound, 
  CheckCircle2 
} from 'lucide-react';
import { normalizeDomain, isValidDomain } from '../utils/domain';

interface OnboardingPageProps {
  onComplete: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const { addRule, addGoal, updateAlarmSettings, updateAppSettings } = useApp();

  const [step, setStep] = useState(1);

  // Step 2: Goal selection
  const [selectedGoalTitle, setSelectedGoalTitle] = useState('Deep Work & Uninterrupted Focus');
  const [goalDesc, setGoalDesc] = useState('Protect my high-value creative and engineering time from mindless feed scrolling.');

  // Step 3: First restricted website
  const [firstDomain, setFirstDomain] = useState('youtube.com');
  const [domainError, setDomainError] = useState<string | null>(null);

  // Step 4: Focus Breach Alarm preferences
  const [alarmDifficulty, setAlarmDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [enableAlarm, setEnableAlarm] = useState(true);

  const handleNextFromDomain = () => {
    const norm = normalizeDomain(firstDomain);
    if (!norm || !isValidDomain(norm)) {
      setDomainError('Please enter a valid hostname (e.g. reddit.com or youtube.com)');
      return;
    }
    setDomainError(null);
    setStep(4);
  };

  const handleFinishOnboarding = () => {
    // 1. Add configured goal
    addGoal({
      title: selectedGoalTitle,
      description: goalDesc,
      category: 'focus',
      dailyPauseTarget: 5,
      safeUrl: 'https://calendar.google.com',
      active: true,
    });

    // 2. Add first rule
    const norm = normalizeDomain(firstDomain);
    if (isValidDomain(norm)) {
      addRule(norm, 'entertainment', enableAlarm);
    }

    // 3. Save alarm settings
    updateAlarmSettings({
      masterEnabled: enableAlarm,
      difficulty: alarmDifficulty,
    });

    // 4. Mark onboarding complete
    updateAppSettings({
      hasCompletedOnboarding: true,
    });

    onComplete();
  };

  return (
    <div className="min-h-screen bg-uz-bg flex flex-col justify-between p-4 sm:p-6 md:p-10 font-body selection:bg-uz-primary">
      {/* Top Header */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Urge Zero" className="w-8 h-8 rounded-xl object-contain shadow-xs" />
          <span className="font-heading font-extrabold text-base text-uz-text">Urge Zero</span>
        </div>
        <div className="text-xs font-semibold text-uz-muted">
          Step {step} of 5
        </div>
      </header>

      {/* Main Form Step Container */}
      <main className="max-w-xl mx-auto w-full my-auto py-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-uz-border shadow-xl">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-uz-mint text-uz-success rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xs">
                <Sparkles className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-uz-muted">Welcome to Urge Zero</span>
              <h1 className="text-3xl font-extrabold font-heading text-uz-text leading-tight">
                A pause can change everything.
              </h1>
              <p className="text-sm text-uz-muted leading-relaxed max-w-md mx-auto">
                Modern platforms are engineered to capture your automatic attention. Urge Zero creates deliberate cognitive friction, giving your prefrontal cortex time to choose what truly matters.
              </p>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 px-6 bg-uz-primary hover:bg-uz-primary-hover text-uz-text font-bold rounded-2xl transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Begin Guided Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Core Intention */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-uz-powder text-blue-700 rounded-xl">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-heading text-uz-text">Define Your Primary Goal</h2>
                  <p className="text-xs text-uz-muted">What are you making space for?</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    title: 'Deep Work & Uninterrupted Focus',
                    desc: 'Protect my high-value creative and engineering time from mindless feed scrolling.',
                  },
                  {
                    title: 'Digital Minimalism & Peace of Mind',
                    desc: 'Reduce ambient anxiety caused by breaking news loops and dopamine chasing.',
                  },
                  {
                    title: 'Intentional Living & Mindful Presence',
                    desc: 'Be fully present with family, reading, and offline health instead of screens.',
                  },
                ].map((item) => {
                  const selected = selectedGoalTitle === item.title;
                  return (
                    <div
                      key={item.title}
                      onClick={() => {
                        setSelectedGoalTitle(item.title);
                        setGoalDesc(item.desc);
                      }}
                      className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                        selected
                          ? 'bg-uz-mint/40 border-uz-text ring-2 ring-uz-text/10'
                          : 'bg-uz-bg border-uz-border hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-bold text-sm text-uz-text flex items-center justify-between">
                        <span>{item.title}</span>
                        {selected && <Check className="w-4 h-4 text-uz-success" />}
                      </div>
                      <p className="text-xs text-uz-muted mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-uz-muted hover:text-uz-text font-medium flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="py-2.5 px-6 bg-uz-primary hover:bg-uz-primary-hover text-uz-text font-bold rounded-xl text-sm transition shadow-xs cursor-pointer"
                >
                  Continue &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Add First Website Restriction */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-red-50 text-uz-error rounded-xl">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-heading text-uz-text">Choose Your First Restriction</h2>
                  <p className="text-xs text-uz-muted">Which website triggers your biggest impulse loops?</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-uz-muted mb-1.5">
                  Website Domain
                </label>
                <input
                  type="text"
                  value={firstDomain}
                  onChange={(e) => {
                    setFirstDomain(e.target.value);
                    if (domainError) setDomainError(null);
                  }}
                  placeholder="e.g. youtube.com or reddit.com"
                  className="w-full text-base font-bold p-3 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text outline-none text-uz-text"
                />
                {domainError && (
                  <p className="text-xs text-uz-error font-medium mt-1.5">{domainError}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-uz-muted self-center">Suggestions:</span>
                {['youtube.com', 'twitter.com', 'instagram.com', 'reddit.com', 'tiktok.com'].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setFirstDomain(sug)}
                    className="px-2.5 py-1 bg-uz-bg hover:bg-uz-border rounded-lg text-uz-text font-medium transition cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-uz-muted hover:text-uz-text font-medium flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextFromDomain}
                  className="py-2.5 px-6 bg-uz-primary hover:bg-uz-primary-hover text-uz-text font-bold rounded-xl text-sm transition shadow-xs cursor-pointer"
                >
                  Continue &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Configure Focus Breach Alarm */}
          {step === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-uz-mint text-uz-success rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-heading text-uz-text">Focus Breach Alarm</h2>
                  <p className="text-xs text-uz-muted">Require 5 quick mental calculations to silence the alarm.</p>
                </div>
              </div>

              <div className="p-4 bg-uz-bg rounded-2xl border border-uz-border space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableAlarm}
                    onChange={(e) => setEnableAlarm(e.target.checked)}
                    className="rounded text-uz-text focus:ring-uz-primary w-4 h-4"
                  />
                  <span className="text-sm font-bold text-uz-text">
                    Enable 5-Question Focus Breach Alarm
                  </span>
                </label>

                {enableAlarm && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-uz-muted mb-1.5">
                      Challenge Difficulty
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['easy', 'normal', 'hard'] as const).map((diff) => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setAlarmDifficulty(diff)}
                          className={`py-2 px-3 text-xs font-bold rounded-xl capitalize border transition cursor-pointer ${
                            alarmDifficulty === diff
                              ? 'bg-uz-text text-white border-uz-text'
                              : 'bg-white border-uz-border text-uz-muted hover:bg-gray-50'
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs text-uz-muted hover:text-uz-text font-medium flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="py-2.5 px-6 bg-uz-primary hover:bg-uz-primary-hover text-uz-text font-bold rounded-xl text-sm transition shadow-xs cursor-pointer"
                >
                  Continue &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Extension Permissions & Finish */}
          {step === 5 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-uz-mint text-uz-success rounded-xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-heading text-uz-text">Ready to Protect Your Attention</h2>
                  <p className="text-xs text-uz-muted">Extension permissions & privacy transparency.</p>
                </div>
              </div>

              <div className="p-4 bg-uz-bg rounded-2xl border border-uz-border text-xs space-y-2.5">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-uz-success shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-uz-text">Local-only processing:</strong> No browsing data leaves your machine.
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-uz-success shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-uz-text">declarativeNetRequest & storage:</strong> Used exclusively to detect your chosen domain boundaries and load the intervention.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleFinishOnboarding}
                  className="w-full py-3.5 px-6 bg-uz-primary hover:bg-uz-primary-hover text-uz-text font-bold rounded-2xl transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Launch Urge Zero Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center text-xs text-uz-muted py-2">
        Dual Core — Kunal Rai & Akshay Yadav
      </footer>
    </div>
  );
};
