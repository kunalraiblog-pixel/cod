import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { RulesPage } from './pages/RulesPage';
import { GoalsPage } from './pages/GoalsPage';
import { AccountabilityPage } from './pages/AccountabilityPage';
import { SettingsPage } from './pages/SettingsPage';
import { InterventionPage } from './pages/InterventionPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Target, 
  Users, 
  Sliders, 
  Flame, 
  Play, 
  Menu, 
  X 
} from 'lucide-react';

export const App: React.FC = () => {
  const { state } = useApp();

  const [currentRoute, setCurrentRoute] = useState<string>('overview');
  const [routeParams, setRouteParams] = useState<{ domain?: string; alarm?: boolean }>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(!state.settings.hasCompletedOnboarding);

  // Synchronize hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (!hash) {
        setCurrentRoute('overview');
        return;
      }

      if (hash.startsWith('intervention')) {
        const queryIndex = hash.indexOf('?');
        if (queryIndex !== -1) {
          const params = new URLSearchParams(hash.slice(queryIndex));
          setRouteParams({
            domain: params.get('domain') || 'youtube.com',
            alarm: params.get('alarm') === 'true',
          });
        }
        setCurrentRoute('intervention');
      } else {
        const clean = hash.split('?')[0];
        setCurrentRoute(clean || 'overview');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route: string) => {
    window.location.hash = route;
    setCurrentRoute(route);
    setMobileMenuOpen(false);
  };

  // If on intervention route, render dedicated intervention view
  if (currentRoute === 'intervention') {
    return <InterventionPage initialDomain={routeParams.domain} initialAlarm={routeParams.alarm} />;
  }

  // If onboarding not completed, render onboarding wizard
  if (showOnboarding) {
    return <OnboardingPage onComplete={() => setShowOnboarding(false)} />;
  }

  const activeRulesCount = state.rules.filter((r) => r.enabled).length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'rules', label: 'Restrictions', icon: ShieldAlert, badge: activeRulesCount },
    { id: 'goals', label: 'Goals & Insights', icon: Target },
    { id: 'accountability', label: 'Accountability', icon: Users },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-uz-bg flex font-body text-uz-text">
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-uz-border shrink-0 justify-between p-5 sticky top-0 h-screen">
        <div>
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 mb-8 px-2 cursor-pointer" onClick={() => navigateTo('overview')}>
            <img src="/logo.png" alt="Urge Zero" className="w-9 h-9 rounded-xl object-contain shadow-xs" />
            <div>
              <span className="font-heading font-extrabold text-base tracking-tight text-uz-text block">
                Urge Zero
              </span>
              <span className="text-[11px] text-uz-muted block">
                A pause can change everything
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-uz-primary text-uz-text shadow-xs'
                      : 'text-uz-muted hover:text-uz-text hover:bg-uz-bg'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white text-uz-text border border-uz-border">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Live Simulator Shortcut */}
          <div className="mt-8 pt-6 border-t border-uz-border px-1">
            <span className="text-[11px] font-bold text-uz-muted uppercase tracking-wider block mb-2">
              Action Testing
            </span>
            <a
              href="#intervention?domain=youtube.com&alarm=true"
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-uz-mint text-uz-success hover:bg-[#cbf1e4] rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-uz-success" />
              <span>Simulate 5Q Alarm</span>
            </a>
          </div>
        </div>

        {/* Bottom Sidebar Widget: Streak Status */}
        <div className="p-3.5 bg-uz-bg rounded-2xl border border-uz-border">
          <div className="flex items-center space-x-2.5 mb-1.5">
            <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
              <Flame className="w-4 h-4 fill-orange-500" />
            </div>
            <div>
              <span className="text-xs font-bold text-uz-text block">
                {state.streak.currentStreak} Day Streak
              </span>
              <span className="text-[10px] text-uz-muted block">
                {state.streak.todayPaused ? 'Protected Today' : 'Awaiting Pauses'}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-orange-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (state.streak.currentStreak / 7) * 100)}%` }}
            />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-6">
        {/* Mobile Header Bar */}
        <header className="md:hidden bg-white border-b border-uz-border p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-2.5" onClick={() => navigateTo('overview')}>
            <img src="/logo.png" alt="Urge Zero" className="w-7 h-7 rounded-lg object-contain shadow-xs" />
            <span className="font-heading font-extrabold text-sm text-uz-text">Urge Zero</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold">
              <Flame className="w-3.5 h-3.5 fill-orange-500" />
              <span>{state.streak.currentStreak}d</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-uz-muted hover:text-uz-text rounded-lg transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-uz-border p-4 space-y-1.5 animate-fadeIn z-20">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    isActive ? 'bg-uz-primary text-uz-text' : 'text-uz-muted hover:bg-uz-bg'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white border border-uz-border">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          {currentRoute === 'overview' && <OverviewDashboard />}
          {currentRoute === 'rules' && <RulesPage />}
          {currentRoute === 'goals' && <GoalsPage />}
          {currentRoute === 'accountability' && <AccountabilityPage />}
          {currentRoute === 'settings' && <SettingsPage />}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-uz-border flex justify-around p-2 z-30 shadow-lg"
          aria-label="Mobile Navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTo(item.id)}
                className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition ${
                  isActive ? 'text-uz-text font-bold' : 'text-uz-muted'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-uz-text' : 'text-uz-muted'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
