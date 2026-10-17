import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Flame, 
  Target, 
  Bell, 
  Play, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  Shield 
} from 'lucide-react';
import { STREAK_MILESTONES } from '../services/streakService';

export const OverviewDashboard: React.FC = () => {
  const { state } = useApp();

  const activeRulesCount = state.rules.filter((r) => r.enabled).length;
  const activeGoal = state.goals.find((g) => g.active) || state.goals[0];

  // Calculate statistics from actual events
  const totalEvents = state.events.length;
  const returnedCount = state.events.filter((e) => e.actionTaken === 'returned_to_goal').length;
  const alarmsCompletedCount = state.events.filter((e) => e.actionTaken === 'alarm_completed').length;
  const pausesCount = state.events.filter((e) => e.actionTaken === 'paused').length;

  const currentStreak = state.streak.currentStreak;
  const longestStreak = state.streak.longestStreak;
  const freezes = state.streak.freezesRemaining;

  // Next milestone
  const nextMilestone = STREAK_MILESTONES.find((m) => m.days > currentStreak) || STREAK_MILESTONES[STREAK_MILESTONES.length - 1];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-white via-white to-uz-mint/30 rounded-3xl p-6 sm:p-8 border border-uz-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-uz-mint text-uz-success text-xs font-semibold rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>A pause can change everything</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-uz-text tracking-tight">
            Make space for what matters.
          </h1>
          <p className="text-sm sm:text-base text-uz-muted mt-2 max-w-xl">
            Urge Zero is guarding your attention across <span className="font-bold text-uz-text">{activeRulesCount} active restrictions</span>. You have deliberate control of your impulses.
          </p>
        </div>

        {/* Quick Test Intervention Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <a
            href="#intervention?domain=youtube.com&alarm=true"
            className="flex items-center justify-center space-x-2 py-3 px-5 bg-uz-primary hover:bg-uz-primary-hover text-uz-text font-bold rounded-2xl text-sm transition shadow-xs cursor-pointer"
          >
            <Play className="w-4 h-4 fill-uz-text" />
            <span>Simulate Alarm Challenge</span>
          </a>
        </div>
      </div>

      {/* Grid of 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Streak System */}
        <div className="bg-white rounded-2xl p-5 border border-uz-border shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-uz-muted">Daily Streak</span>
            <div className="p-2 bg-orange-50 text-orange-500 rounded-xl">
              <Flame className="w-5 h-5 fill-orange-500" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-heading text-uz-text mb-1 flex items-baseline space-x-1.5">
            <span>{currentStreak}</span>
            <span className="text-sm font-semibold text-uz-muted">days</span>
          </div>
          <div className="text-xs text-uz-muted flex items-center justify-between mt-2 pt-2 border-t border-uz-border/60">
            <span>Best: {longestStreak} days</span>
            <span className="text-orange-600 font-medium">{freezes} Shield{freezes !== 1 ? 's' : ''} left</span>
          </div>
        </div>

        {/* Card 2: Active Restrictions */}
        <div className="bg-white rounded-2xl p-5 border border-uz-border shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-uz-muted">Protected Sites</span>
            <div className="p-2 bg-uz-mint text-uz-success rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-heading text-uz-text mb-1">
            {activeRulesCount}
          </div>
          <div className="text-xs text-uz-muted flex items-center justify-between mt-2 pt-2 border-t border-uz-border/60">
            <span>{state.rules.length} total rules</span>
            <a href="#rules" className="text-uz-text font-semibold hover:underline">
              Manage &rarr;
            </a>
          </div>
        </div>

        {/* Card 3: Returns to Goal */}
        <div className="bg-white rounded-2xl p-5 border border-uz-border shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-uz-muted">Pauses Respected</span>
            <div className="p-2 bg-uz-powder text-blue-600 rounded-xl">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-heading text-uz-text mb-1">
            {returnedCount + pausesCount}
          </div>
          <div className="text-xs text-uz-muted flex items-center justify-between mt-2 pt-2 border-t border-uz-border/60">
            <span>{returnedCount} returned directly</span>
            <span className="text-uz-success font-medium">{totalEvents > 0 ? Math.round(((returnedCount + pausesCount) / totalEvents) * 100) : 100}% mindful</span>
          </div>
        </div>

        {/* Card 4: Focus Breach Alarm Status */}
        <div className="bg-white rounded-2xl p-5 border border-uz-border shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-uz-muted">5Q Alarm Engine</span>
            <div className={`p-2 rounded-xl ${state.alarmSettings.masterEnabled ? 'bg-red-50 text-uz-error' : 'bg-gray-100 text-gray-400'}`}>
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-heading text-uz-text mb-1">
            {state.alarmSettings.masterEnabled ? 'Active' : 'Muted'}
          </div>
          <div className="text-xs text-uz-muted flex items-center justify-between mt-2 pt-2 border-t border-uz-border/60">
            <span>{alarmsCompletedCount} challenges solved</span>
            <a href="#settings" className="text-uz-text font-semibold hover:underline">
              Settings &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Current Goal & Extension Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column: Active Intention & Streak Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Intention Card */}
          {activeGoal && (
            <div className="bg-white rounded-2xl p-6 border border-uz-border shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-uz-muted flex items-center space-x-1.5">
                  <Target className="w-4 h-4 text-uz-text" />
                  <span>Current Personal Goal</span>
                </span>
                <a href="#goals" className="text-xs font-semibold text-uz-text hover:underline">
                  View All Goals
                </a>
              </div>

              <div className="p-4 bg-uz-bg rounded-xl border border-uz-border">
                <h3 className="text-base font-bold text-uz-text mb-1">{activeGoal.title}</h3>
                <p className="text-xs sm:text-sm text-uz-muted leading-relaxed mb-3">{activeGoal.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="px-2.5 py-1 bg-white border border-uz-border rounded-lg text-uz-text font-medium">
                    Daily target: {activeGoal.dailyPauseTarget} mindful pauses
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-uz-border rounded-lg text-uz-muted truncate max-w-xs">
                    Safe URL: {activeGoal.safeUrl}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Streak Milestone Progress Card */}
          <div className="bg-white rounded-2xl p-6 border border-uz-border shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold font-heading text-uz-text">Streak Milestones</h3>
                <p className="text-xs text-uz-muted">Consistency builds automatic self-regulation.</p>
              </div>
              <span className="text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                Next: {nextMilestone.badge} {nextMilestone.title} ({nextMilestone.days}d)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {STREAK_MILESTONES.slice(0, 3).map((m) => {
                const unlocked = currentStreak >= m.days;
                return (
                  <div
                    key={m.days}
                    className={`p-3 rounded-xl border text-center transition ${
                      unlocked ? 'bg-uz-mint/40 border-emerald-200 text-uz-text' : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <span className="text-2xl mb-1 block">{m.badge}</span>
                    <span className="text-xs font-bold block">{m.title}</span>
                    <span className="text-[10px] text-uz-muted block">{m.days} days</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Intervention Events */}
          <div className="bg-white rounded-2xl border border-uz-border shadow-xs overflow-hidden">
            <div className="p-5 border-b border-uz-border flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-uz-text">
                Recent Intervention Activity
              </h3>
              <span className="text-xs text-uz-muted">{state.events.length} recorded events</span>
            </div>

            {state.events.length === 0 ? (
              <div className="p-8 text-center text-uz-muted">
                <Clock className="w-8 h-8 mx-auto text-uz-border mb-2" />
                <p className="text-sm font-semibold text-uz-text">No activity recorded yet.</p>
                <p className="text-xs mt-1">Interventions will be logged here whenever a restricted site is paused.</p>
              </div>
            ) : (
              <div className="divide-y divide-uz-border">
                {state.events.slice(0, 5).map((evt) => {
                  let badge = { text: 'Returned to Goal', color: 'bg-uz-mint text-uz-success' };
                  if (evt.actionTaken === 'alarm_completed') {
                    badge = { text: 'Solved 5Q Alarm', color: 'bg-blue-50 text-blue-700' };
                  } else if (evt.actionTaken === 'paused') {
                    badge = { text: 'Breathing Pause', color: 'bg-emerald-50 text-emerald-700' };
                  } else if (evt.actionTaken === 'continued_intentionally') {
                    badge = { text: 'Conscious Continuation', color: 'bg-amber-50 text-amber-700' };
                  } else if (evt.actionTaken === 'emergency_override') {
                    badge = { text: 'Emergency Override', color: 'bg-red-50 text-red-700' };
                  }

                  const timeAgo = new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={evt.id} className="p-4 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-uz-text" />
                        <div>
                          <span className="font-bold text-uz-text text-sm">{evt.domain}</span>
                          {evt.reflectionNote && (
                            <p className="text-xs text-uz-muted italic mt-0.5">"{evt.reflectionNote}"</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className={`px-2.5 py-1 rounded-full font-semibold text-[11px] ${badge.color}`}>
                          {badge.text}
                        </span>
                        <span className="text-uz-muted text-[11px]">{timeAgo}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chrome Extension Status & Quick Setup Guide */}
        <div className="space-y-6">
          {/* Chrome Extension Status Box */}
          <div className="bg-white rounded-2xl p-6 border border-uz-border shadow-xs">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 bg-uz-mint text-uz-success rounded-xl">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-heading text-uz-text">Browser Extension</h3>
                <span className="text-xs text-uz-muted">Chrome Manifest V3</span>
              </div>
            </div>

            <div className="p-4 bg-uz-bg rounded-xl border border-uz-border text-xs space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-uz-muted">Extension Engine:</span>
                <span className="font-semibold text-uz-success flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Ready to Load</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-uz-muted">Navigation Interception:</span>
                <span className="font-semibold text-uz-text">declarativeNetRequest + webNavigation</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-uz-muted">Active Rules Synced:</span>
                <span className="font-semibold text-uz-text">{activeRulesCount}</span>
              </div>
            </div>

            <div className="text-xs text-uz-muted space-y-2 mb-4">
              <p className="font-semibold text-uz-text">How to load in Chrome:</p>
              <ol className="list-decimal list-inside space-y-1 text-uz-muted">
                <li>Open <code className="bg-gray-100 px-1 py-0.5 rounded">chrome://extensions</code></li>
                <li>Toggle <span className="font-medium text-uz-text">Developer mode</span> on</li>
                <li>Click <span className="font-medium text-uz-text">Load unpacked</span></li>
                <li>Select the <code className="bg-gray-100 px-1 py-0.5 rounded">cod/extension</code> folder</li>
              </ol>
            </div>

            <a
              href="#settings"
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-uz-bg hover:bg-uz-border text-uz-text text-xs font-semibold rounded-xl transition"
            >
              <span>View Extension & Sync Settings</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          {/* Quick Intention Tips */}
          <div className="bg-uz-powder/40 rounded-2xl p-5 border border-blue-100 text-xs text-blue-900 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-blue-950">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>The 10-Second Principle</span>
            </div>
            <p className="leading-relaxed">
              Neurological urge waves typically subside within 90 seconds. By introducing a mandatory math challenge or breathing pause, Urge Zero shifts brain activity from the autonomic impulse loop back to your conscious prefrontal cortex.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
