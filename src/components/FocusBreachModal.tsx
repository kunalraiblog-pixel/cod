import React, { useState, useEffect, useRef } from 'react';
import { MathQuestion, AlarmDifficulty, SoundPreset } from '../types';
import { generateFiveQuestions } from '../utils/mathQuestions';
import { audioService } from '../services/audioService';
import { 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  Home, 
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FocusBreachModalProps {
  domain: string;
  difficulty?: AlarmDifficulty;
  soundPreset?: SoundPreset;
  volume?: number;
  safeUrl?: string;
  strictMode?: boolean;
  onCompleted: () => void;
  onReturnToSafeUrl: (url: string) => void;
  onContinueToDomain?: () => void;
  onEmergencyOverride?: () => void;
}

export const FocusBreachModal: React.FC<FocusBreachModalProps> = ({
  domain,
  difficulty = 'normal',
  soundPreset = 'urgent-pulse',
  volume = 0.75,
  safeUrl = 'https://calendar.google.com',
  strictMode = false,
  onCompleted,
  onReturnToSafeUrl,
  onContinueToDomain,
  onEmergencyOverride,
}) => {
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [audioBlocked, setAudioBlocked] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showOverrideConfirm, setShowOverrideConfirm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const completionLoggedRef = useRef<boolean>(false);

  // Initialize fresh challenge and start sound on mount
  useEffect(() => {
    const freshQuestions = generateFiveQuestions(difficulty);
    setQuestions(freshQuestions);
    setCurrentIndex(0);
    setUserInput('');
    setIsCompleted(false);
    completionLoggedRef.current = false;

    // Hook audio autoplay feedback
    audioService.setAutoplayCallback((blocked) => {
      setAudioBlocked(blocked);
    });

    // Start alarm sound
    audioService.startAlarm(soundPreset, volume);

    // Focus input field
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);

    return () => {
      clearTimeout(timer);
      audioService.stopAlarm();
    };
  }, [difficulty, soundPreset, volume]);

  const handleUnmuteClick = async () => {
    const success = await audioService.resumeAudio();
    if (success) {
      setAudioBlocked(false);
      audioService.startAlarm(soundPreset, volume);
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      audioService.startAlarm(soundPreset, volume);
      setIsMuted(false);
    } else {
      audioService.stopAlarm();
      setIsMuted(true);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting || isCompleted || questions.length === 0) return;

    const trimmed = userInput.trim();
    if (!trimmed) {
      setIsError(true);
      setFeedback('Please enter your answer.');
      inputRef.current?.focus();
      return;
    }

    const currentQ = questions[currentIndex];
    const numericAns = parseInt(trimmed, 10);

    if (isNaN(numericAns)) {
      setIsError(true);
      setFeedback('Please enter a valid number.');
      inputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    if (numericAns === currentQ.answer) {
      // Correct answer!
      setIsError(false);
      setFeedback('Correct! Well done.');

      if (currentIndex + 1 < 5) {
        // Advance to next question
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          setUserInput('');
          setFeedback(null);
          setIsSubmitting(false);
          inputRef.current?.focus();
        }, 250);
      } else {
        // 5th question answered correctly! Challenge complete!
        audioService.stopAlarm();
        audioService.playSuccessChime();
        setIsCompleted(true);
        setIsSubmitting(false);

        // Confetti explosion
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#C9F27A', '#26734D', '#DDF7EE', '#26352D'],
          });
        } catch {
          // Ignore
        }

        if (!completionLoggedRef.current) {
          completionLoggedRef.current = true;
          onCompleted();
        }
      }
    } else {
      // Incorrect answer: do not advance, prompt calm retry
      setIsError(true);
      setFeedback('Not quite. Take a breath and try again.');
      setTimeout(() => {
        setIsSubmitting(false);
        setUserInput('');
        inputRef.current?.focus();
      }, 400);
    }
  };

  const handleEmergencyOverride = () => {
    audioService.stopAlarm();
    if (onEmergencyOverride) {
      onEmergencyOverride();
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#26352D]/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border-2 border-uz-border overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="breach-heading"
      >
        {/* Top Urgency Header Bar */}
        <div className={`p-4 transition-colors ${isCompleted ? 'bg-uz-mint text-uz-success' : 'bg-[#FFF1F0] border-b border-[#FCE1E0]'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isCompleted ? (
                <div className="p-1.5 bg-uz-success text-white rounded-full">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-1.5 bg-uz-error text-white rounded-full animate-bounce">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              )}
              <div>
                <span className="text-xs font-bold tracking-wider uppercase opacity-80">
                  {isCompleted ? 'Challenge Complete' : 'Active Intervention'}
                </span>
                <h2 id="breach-heading" className="text-lg font-extrabold font-heading text-uz-text leading-tight">
                  {isCompleted ? 'Focus Restored' : 'FOCUS BREACH DETECTED'}
                </h2>
              </div>
            </div>

            {/* Audio Autoplay / Mute Controls */}
            <div className="flex items-center space-x-2">
              {audioBlocked && !isCompleted && (
                <button
                  type="button"
                  onClick={handleUnmuteClick}
                  className="flex items-center space-x-1 px-3 py-1 bg-uz-primary hover:bg-uz-primary-hover text-uz-text text-xs font-semibold rounded-full shadow-sm animate-pulse"
                  title="Browser prevented autoplay. Click to unmute alarm."
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Unmute Alarm</span>
                </button>
              )}

              {!isCompleted && !audioBlocked && (
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="p-1.5 text-uz-muted hover:text-uz-text rounded-full hover:bg-black/5 transition"
                  title={isMuted ? 'Resume alarm sound' : 'Mute alarm sound'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-uz-error" /> : <Volume2 className="w-4 h-4 text-uz-success animate-pulse" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!isCompleted ? (
            <div>
              {/* Breach Explanation */}
              <div className="mb-5 text-center">
                <p className="text-sm text-uz-muted">
                  You chose to restrict <span className="font-semibold text-uz-text bg-uz-mint/60 px-2 py-0.5 rounded">{domain}</span>.
                </p>
                <p className="text-sm font-medium text-uz-text mt-1">
                  Complete the five-question focus challenge to silence the alarm.
                </p>
              </div>

              {/* 5-Step Progress Indicators */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-uz-muted uppercase tracking-wider">
                    Question {currentIndex + 1} of 5
                  </span>
                  <span className="text-xs font-bold text-uz-text">
                    {Math.round(((currentIndex) / 5) * 100)}% Complete
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4].map((idx) => {
                    let stepBg = 'bg-gray-200';
                    if (idx < currentIndex) stepBg = 'bg-uz-success';
                    else if (idx === currentIndex) stepBg = 'bg-uz-primary ring-2 ring-uz-primary/50';

                    return (
                      <div
                        key={idx}
                        className={`h-2.5 rounded-full transition-all duration-300 ${stepBg}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Math Question Card */}
              {currentQ && (
                <div className="bg-uz-bg rounded-xl p-6 border border-uz-border text-center mb-5">
                  <span className="text-xs font-medium text-uz-muted uppercase tracking-wider block mb-1">
                    Calculate Mentally
                  </span>
                  <div className="text-4xl font-extrabold font-heading text-uz-text tracking-wider my-3">
                    {currentQ.promptText}
                  </div>

                  <form onSubmit={handleSubmit} className="mt-4">
                    <div className="relative max-w-xs mx-auto">
                      <input
                        ref={inputRef}
                        type="number"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        value={userInput}
                        onChange={(e) => {
                          setUserInput(e.target.value);
                          if (isError) setIsError(false);
                          if (feedback) setFeedback(null);
                        }}
                        placeholder="Your answer"
                        className={`w-full text-center text-2xl font-bold py-3 px-4 rounded-xl border-2 transition outline-none ${
                          isError
                            ? 'border-uz-error bg-red-50 text-uz-error animate-shake'
                            : 'border-uz-border focus:border-uz-text bg-white text-uz-text'
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Feedback message */}
                    {feedback && (
                      <p className={`text-xs font-medium mt-2.5 ${isError ? 'text-uz-error' : 'text-uz-success'}`}>
                        {feedback}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || !userInput.trim()}
                      className="mt-4 w-full max-w-xs mx-auto flex items-center justify-center space-x-2 py-3 px-5 bg-uz-text hover:bg-black text-white font-semibold rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span>{currentIndex === 4 ? 'Submit Final Answer' : 'Submit & Next Question'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* Emergency / Accessibility Override Option */}
              <div className="mt-4 pt-3 border-t border-uz-border/60 flex items-center justify-between text-xs text-uz-muted">
                <span className="flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Voluntary habit protection</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowOverrideConfirm(true)}
                  className="text-uz-muted hover:text-uz-error hover:underline transition"
                >
                  Emergency / Accessibility override
                </button>
              </div>

              {/* Override confirmation dialog */}
              {showOverrideConfirm && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  <p className="font-semibold mb-1">Legitimate Urgent Need / Audio Sensitivity?</p>
                  <p className="mb-2">This voluntary override immediately silences the alarm and logs the exit.</p>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleEmergencyOverride}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded transition"
                    >
                      Confirm Silence Alarm
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowOverrideConfirm(false)}
                      className="px-3 py-1 bg-white border border-amber-300 text-amber-900 rounded transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Challenge Completed Screen */
            <div className="text-center py-4 animate-fadeIn">
              <div className="w-16 h-16 bg-uz-mint text-uz-success rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="text-2xl font-extrabold font-heading text-uz-text mb-1">
                Challenge Complete!
              </h3>
              <p className="text-sm text-uz-muted max-w-sm mx-auto mb-6">
                You successfully solved all 5 mental calculations. The alarm is silenced and your focus streak is recorded.
              </p>

              <div className="bg-uz-bg rounded-xl p-3 border border-uz-border max-w-xs mx-auto mb-6 flex justify-around items-center text-xs">
                <div>
                  <span className="text-uz-muted block">Questions</span>
                  <span className="font-bold text-uz-text text-sm">5 of 5</span>
                </div>
                <div className="h-6 w-px bg-uz-border" />
                <div>
                  <span className="text-uz-muted block">Alarm Sound</span>
                  <span className="font-bold text-uz-success text-sm">Silenced</span>
                </div>
                <div className="h-6 w-px bg-uz-border" />
                <div>
                  <span className="text-uz-muted block">Mindful Pause</span>
                  <span className="font-bold text-uz-text text-sm">Maintained</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2.5 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => onReturnToSafeUrl(safeUrl)}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-uz-primary hover:bg-uz-primary-hover text-uz-text font-bold rounded-xl transition shadow-sm cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>Return to Safe Destination</span>
                </button>

                {!strictMode && onContinueToDomain && (
                  <button
                    type="button"
                    onClick={onContinueToDomain}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-white hover:bg-uz-bg text-uz-muted hover:text-uz-text border border-uz-border font-medium rounded-xl text-sm transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Continue to {domain} (5 min pass)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onReturnToSafeUrl('/#dashboard')}
                  className="w-full text-xs text-uz-muted hover:text-uz-text py-1 transition"
                >
                  Open Urge Zero Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
