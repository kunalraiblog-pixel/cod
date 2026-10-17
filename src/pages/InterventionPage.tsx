import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FocusBreachModal } from '../components/FocusBreachModal';
import { 
  ShieldAlert, 
  ArrowLeft, 
  Clock, 
  Target, 
  LifeBuoy, 
  Flame 
} from 'lucide-react';

interface InterventionPageProps {
  initialDomain?: string;
  initialAlarm?: boolean;
}

export const InterventionPage: React.FC<InterventionPageProps> = ({ 
  initialDomain,
  initialAlarm 
}) => {
  const { state, logInterventionEvent, setDomainBypass } = useApp();

  // Extract query params if available
  const [targetDomain, setTargetDomain] = useState<string>('youtube.com');
  const [alarmActive, setAlarmActive] = useState<boolean>(false);
  const [pauseModeActive, setPauseModeActive] = useState<boolean>(false);
  const [pauseSecondsLeft, setPauseSecondsLeft] = useState<number>(30);
  const [pauseInitialDuration, setPauseInitialDuration] = useState<number>(30);
  const [reflectionText, setReflectionText] = useState<string>('');
  const [showContinueForm, setShowContinueForm] = useState<boolean>(false);
  const [showCheckinNotice, setShowCheckinNotice] = useState<boolean>(false);

  // Active goal
  const activeGoal = state.goals.find((g) => g.active) || state.goals[0];
  const safeUrl = activeGoal?.safeUrl || state.settings.defaultSafeUrl || 'https://calendar.google.com';

  useEffect(() => {
    // Read from window location params if present
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlDomain = params.get('domain') || params.get('url');
      const urlAlarm = params.get('alarm');

      if (urlDomain) {
        setTargetDomain(urlDomain);
      } else if (initialDomain) {
        setTargetDomain(initialDomain);
      }

      // Check if domain rule has alarm enabled
      const matched = state.rules.find((r) => r.domain.toLowerCase() === (urlDomain || initialDomain || 'youtube.com').toLowerCase());
      if (urlAlarm === 'true' || (matched && matched.alarmEnabled && state.alarmSettings.masterEnabled)) {
        setAlarmActive(true);
      } else if (initialAlarm) {
        setAlarmActive(true);
      }
    }
  }, [initialDomain, initialAlarm, state.rules, state.alarmSettings.masterEnabled]);

  // Breathing timer countdown
  useEffect(() => {
    let interval: number | null = null;
    if (pauseModeActive && pauseSecondsLeft > 0) {
      interval = window.setInterval(() => {
        setPauseSecondsLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pauseModeActive, pauseSecondsLeft]);

  const handleReturnToGoal = () => {
    logInterventionEvent({
      domain: targetDomain,
      actionTaken: 'returned_to_goal',
      durationSeconds: pauseInitialDuration - pauseSecondsLeft,
    });

    if (safeUrl.startsWith('http://') || safeUrl.startsWith('https://')) {
      window.location.href = safeUrl;
    } else {
      window.location.hash = safeUrl;
    }
  };

  const handleStartPause = (duration = state.settings.defaultPauseDuration || 30) => {
    setPauseInitialDuration(duration);
    setPauseSecondsLeft(duration);
    setPauseModeActive(true);
  };

  const handleFinishPause = () => {
    setPauseModeActive(false);
    logInterventionEvent({
      domain: targetDomain,
      actionTaken: 'paused',
      durationSeconds: pauseInitialDuration,
    });
  };

  const handleAlarmCompleted = () => {
    logInterventionEvent({
      domain: targetDomain,
      actionTaken: 'alarm_completed',
      durationSeconds: 45,
    });
  };

  const handleEmergencyOverride = () => {
    setAlarmActive(false);
    logInterventionEvent({
      domain: targetDomain,
      actionTaken: 'emergency_override',
      durationSeconds: 10,
    });
  };

  const handleContinueIntentionally = () => {
    setDomainBypass(targetDomain, state.settings.temporaryBypassMinutes || 5);
    logInterventionEvent({
      domain: targetDomain,
      actionTaken: 'continued_intentionally',
      reflectionNote: reflectionText,
      durationSeconds: pauseInitialDuration - pauseSecondsLeft,
    });

    // Navigate to target domain
    const targetUrl = targetDomain.startsWith('http') ? targetDomain : `https://${targetDomain}`;
    window.location.href = targetUrl;
  };

  const handleCheckin = () => {
    setShowCheckinNotice(true);
    setTimeout(() => setShowCheckinNotice(false), 5000);
  };

  // Find matched rule
  const matchedRule = state.rules.find((r) => r.domain.toLowerCase() === targetDomain.toLowerCase());
  const isAlarmConfigured = matchedRule ? matchedRule.alarmEnabled : true;

  return (
    <div className="min-h-screen bg-uz-bg flex flex-col justify-between p-4 sm:p-6 md:p-10 font-body relative overflow-x-hidden selection:bg-uz-primary">
      {/* Top Navigation / Brand */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Urge Zero Logo" className="w-9 h-9 rounded-xl shadow-sm object-contain" />
          <div>
            <span className="font-heading font-extrabold text-base tracking-tight text-uz-text">Urge Zero</span>
            <span className="block text-[11px] text-uz-muted">A pause can change everything</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-uz-border rounded-full shadow-xs">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span className="font-bold text-uz-text">{state.streak.currentStreak} Day Streak</span>
          </div>
          <a
            href="/#dashboard"
            className="text-uz-muted hover:text-uz-text font-medium underline-offset-4 hover:underline transition"
          >
            Dashboard
          </a>
        </div>
      </header>

      {/* Main Intervention Card */}
      <main className="max-w-xl mx-auto w-full my-auto py-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-uz-border/80 text-center relative">
          {/* Subtle Tag */}
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 bg-uz-mint text-uz-success text-xs font-semibold rounded-full mb-5">
            <span className="w-2 h-2 rounded-full bg-uz-success animate-ping" />
            <span>Mindful Intervention</span>
          </div>

          {/* Core Copy Specified in Requirements */}
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-uz-text mb-3 tracking-tight">
            Take a moment.
          </h1>
          <p className="text-sm sm:text-base text-uz-muted max-w-md mx-auto mb-6 leading-relaxed">
            You chose to pause before visiting <span className="font-bold text-uz-text bg-uz-bg px-2 py-0.5 rounded border border-uz-border">{targetDomain}</span>. What would help you most right now?
          </p>

          {/* Active Personal Goal Reminder */}
          {activeGoal && (
            <div className="bg-uz-bg rounded-2xl p-4 border border-uz-border text-left mb-6 flex items-start space-x-3.5">
              <div className="p-2 bg-uz-powder rounded-xl text-blue-700 shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-uz-muted uppercase tracking-wider">Your Active Intention</div>
                <div className="text-sm font-bold text-uz-text truncate">{activeGoal.title}</div>
                <div className="text-xs text-uz-muted line-clamp-1 mt-0.5">{activeGoal.description}</div>
              </div>
            </div>
          )}

          {/* Pause Breathing Exercise Mode */}
          {pauseModeActive ? (
            <div className="py-6 animate-fadeIn">
              <div className="relative w-44 h-44 mx-auto flex items-center justify-center mb-6">
                <div className="absolute inset-0 bg-uz-mint rounded-full opacity-60 animate-breathe" />
                <div className="relative z-10 text-center">
                  <div className="text-4xl font-extrabold font-heading text-uz-text">{pauseSecondsLeft}s</div>
                  <span className="text-xs text-uz-muted font-medium">Breathe gently</span>
                </div>
              </div>

              <p className="text-xs text-uz-muted max-w-xs mx-auto mb-6">
                Inhale deeply... exhale slowly. Notice the physical urge and let it soften without reacting.
              </p>

              <div className="flex justify-center space-x-3">
                {pauseSecondsLeft === 0 ? (
                  <button
                    type="button"
                    onClick={handleFinishPause}
                    className="py-2.5 px-6 bg-uz-primary hover:bg-uz-primary-hover text-uz-text font-bold rounded-xl text-sm transition shadow-sm cursor-pointer"
                  >
                    Pause Finished — Return
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishPause}
                    className="py-2 px-4 bg-white border border-uz-border hover:bg-uz-bg text-xs font-semibold text-uz-text rounded-xl transition cursor-pointer"
                  >
                    End Pause Early
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Action Buttons Set */
            <div className="space-y-3">
              {/* Action 1: Return to Goal */}
              <button
                type="button"
                onClick={handleReturnToGoal}
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 bg-uz-primary hover:bg-uz-primary-hover text-uz-text font-bold rounded-2xl transition shadow-sm text-sm sm:text-base cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to my goal</span>
              </button>

              {/* Action 2: Take a Short Pause */}
              <button
                type="button"
                onClick={() => handleStartPause(30)}
                className="w-full flex items-center justify-center space-x-2 py-3 px-5 bg-uz-mint hover:bg-[#cbf1e4] text-[#1e5a3c] font-semibold rounded-2xl transition text-sm cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>Take a 30-second breathing pause</span>
              </button>

              {/* Action 3: Start Focus Breach Alarm Challenge */}
              {isAlarmConfigured && (
                <button
                  type="button"
                  onClick={() => setAlarmActive(true)}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-5 bg-[#FFF2F0] hover:bg-[#FFE6E2] text-uz-error border border-red-200 font-semibold rounded-2xl transition text-sm cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-uz-error" />
                  <span>Start Focus Breach Challenge (5 Questions)</span>
                </button>
              )}

              {/* Action 4: Continue Intentionally (if allowed) */}
              {!state.settings.strictMode && (
                <div>
                  {!showContinueForm ? (
                    <button
                      type="button"
                      onClick={() => setShowContinueForm(true)}
                      className="w-full text-xs text-uz-muted hover:text-uz-text py-2 transition hover:underline"
                    >
                      I have an intentional reason to visit this website
                    </button>
                  ) : (
                    <div className="mt-3 p-4 bg-uz-bg rounded-2xl border border-uz-border text-left animate-fadeIn">
                      <label className="block text-xs font-semibold text-uz-text mb-1.5">
                        State your conscious reason:
                      </label>
                      <input
                        type="text"
                        value={reflectionText}
                        onChange={(e) => setReflectionText(e.target.value)}
                        placeholder="e.g., Looking up a coding tutorial, responding to an urgent message..."
                        className="w-full text-xs p-2.5 bg-white border border-uz-border rounded-xl focus:border-uz-text outline-none text-uz-text mb-3"
                      />
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={handleContinueIntentionally}
                          className="flex-1 py-2 px-3 bg-uz-text text-white text-xs font-semibold rounded-xl hover:bg-black transition cursor-pointer"
                        >
                          Continue (5 min window)
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowContinueForm(false)}
                          className="py-2 px-3 bg-white border border-uz-border text-xs text-uz-muted rounded-xl transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action 5: Request check-in if accountability configured */}
              {state.accountability.enabled && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCheckin}
                    className="inline-flex items-center space-x-1.5 text-xs text-uz-muted hover:text-uz-text transition"
                  >
                    <LifeBuoy className="w-3.5 h-3.5 text-blue-500" />
                    <span>Request check-in from {state.accountability.contactName || 'partner'}</span>
                  </button>
                  {showCheckinNotice && (
                    <div className="mt-2 text-[11px] text-uz-success bg-uz-mint/50 py-1 px-3 rounded-lg animate-fadeIn">
                      ✓ Simulated notification ping logged for {state.accountability.contactName}.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer reassurance */}
      <footer className="max-w-md mx-auto text-center py-2 text-xs text-uz-muted">
        <p>Make space for what matters. Urge Zero provides voluntary self-reflection.</p>
      </footer>

      {/* Modal for Focus Breach Alarm when triggered */}
      {alarmActive && (
        <FocusBreachModal
          domain={targetDomain}
          difficulty={state.alarmSettings.difficulty}
          soundPreset={state.alarmSettings.soundPreset}
          volume={state.alarmSettings.volume}
          safeUrl={safeUrl}
          strictMode={state.settings.strictMode}
          onCompleted={handleAlarmCompleted}
          onReturnToSafeUrl={(url) => {
            setAlarmActive(false);
            if (url.startsWith('http')) {
              window.location.href = url;
            } else {
              window.location.hash = url;
            }
          }}
          onContinueToDomain={
            !state.settings.strictMode
              ? () => {
                  setAlarmActive(false);
                  handleContinueIntentionally();
                }
              : undefined
          }
          onEmergencyOverride={handleEmergencyOverride}
        />
      )}
    </div>
  );
};
