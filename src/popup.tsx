import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider, useApp } from './context/AppContext';
import { 
  ShieldCheck, 
  Flame, 
  ExternalLink, 
  Plus, 
  Bell, 
  Check 
} from 'lucide-react';
import { normalizeDomain, isValidDomain } from './utils/domain';
import './index.css';

const PopupApp: React.FC = () => {
  const { state, addRule, updateAlarmSettings } = useApp();

  const [currentTabDomain, setCurrentTabDomain] = useState<string>('');
  const [isCurrentDomainRestricted, setIsCurrentDomainRestricted] = useState<boolean>(false);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  useEffect(() => {
    // Detect active tab domain using Chrome Tabs API if available
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].url) {
          try {
            const urlObj = new URL(tabs[0].url);
            const norm = normalizeDomain(urlObj.hostname);
            setCurrentTabDomain(norm);
            const exists = state.rules.some((r) => r.domain.toLowerCase() === norm.toLowerCase());
            setIsCurrentDomainRestricted(exists);
          } catch {
            // Ignore chrome:// or non-standard URLs
          }
        }
      });
    }
  }, [state.rules]);

  const handleQuickAddCurrentTab = () => {
    if (!currentTabDomain || !isValidDomain(currentTabDomain)) return;
    addRule(currentTabDomain, 'custom', true);
    setIsCurrentDomainRestricted(true);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleOpenDashboard = (hash = 'overview') => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      // In extension, open dashboard in full tab
      chrome.tabs.create({ url: `index.html#${hash}` });
    } else {
      window.open(`/#${hash}`, '_blank');
    }
  };

  const activeRulesCount = state.rules.filter((r) => r.enabled).length;

  return (
    <div className="w-[360px] min-h-[480px] bg-uz-bg text-uz-text p-4 font-body flex flex-col justify-between select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-uz-border">
          <div className="flex items-center space-x-2.5">
            <img src="/logo.png" alt="Urge Zero Logo" className="w-7 h-7 rounded-lg object-contain shadow-xs" />
            <div>
              <span className="font-heading font-extrabold text-sm tracking-tight text-uz-text block">
                Urge Zero
              </span>
              <span className="text-[10px] text-uz-muted block">
                A pause can change everything
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-600 rounded-full text-xs font-bold">
            <Flame className="w-3.5 h-3.5 fill-orange-500" />
            <span>{state.streak.currentStreak}d</span>
          </div>
        </div>

        {/* Protection Status Banner */}
        <div className="my-3 p-3 bg-white rounded-xl border border-uz-border shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-uz-mint text-uz-success rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-uz-text block">Focus Shield Active</span>
              <span className="text-[10px] text-uz-muted block">{activeRulesCount} websites restricted</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => updateAlarmSettings({ masterEnabled: !state.alarmSettings.masterEnabled })}
            className={`p-1.5 rounded-lg border text-xs font-semibold transition ${
              state.alarmSettings.masterEnabled
                ? 'bg-red-50 text-uz-error border-red-200'
                : 'bg-gray-100 text-gray-500 border-gray-200'
            }`}
            title="Toggle 5Q Alarm Engine"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Protect Current Website */}
        {currentTabDomain && (
          <div className="mb-3 p-3 bg-white rounded-xl border border-uz-border">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-uz-muted font-medium">Current Tab:</span>
              <span className="font-bold text-uz-text truncate max-w-[170px]">{currentTabDomain}</span>
            </div>

            {isCurrentDomainRestricted ? (
              <div className="text-[11px] font-semibold text-uz-success flex items-center space-x-1 bg-uz-mint/50 py-1 px-2 rounded-lg">
                <Check className="w-3.5 h-3.5" />
                <span>Restricted by Urge Zero</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleQuickAddCurrentTab}
                className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-uz-primary hover:bg-uz-primary-hover text-uz-text text-xs font-bold rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Restrict this website</span>
              </button>
            )}

            {addedNotice && (
              <p className="text-[10px] text-uz-success font-medium mt-1">✓ Added to restrictions!</p>
            )}
          </div>
        )}

        {/* Recent Pauses Snapshot */}
        <div className="mb-3 bg-white rounded-xl border border-uz-border p-3">
          <div className="flex items-center justify-between text-xs font-bold text-uz-muted mb-2">
            <span>Recent Pauses</span>
            <span className="text-[10px] text-uz-text">{state.events.length} total</span>
          </div>

          {state.events.length === 0 ? (
            <p className="text-[11px] text-uz-muted text-center py-2">No pauses triggered yet today.</p>
          ) : (
            <div className="space-y-1.5">
              {state.events.slice(0, 3).map((e) => (
                <div key={e.id} className="flex items-center justify-between text-[11px] py-1 border-b border-gray-100 last:border-0">
                  <span className="font-medium text-uz-text truncate max-w-[180px]">{e.domain}</span>
                  <span className="text-uz-muted text-[10px]">
                    {e.actionTaken === 'alarm_completed' ? '5Q Solved' : 'Paused'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="space-y-2 pt-2 border-t border-uz-border">
        <button
          type="button"
          onClick={() => handleOpenDashboard('overview')}
          className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-uz-text hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer"
        >
          <span>Open Full Dashboard</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        <div className="flex justify-between items-center text-[10px] text-uz-muted px-1">
          <button onClick={() => handleOpenDashboard('rules')} className="hover:text-uz-text hover:underline">
            Manage Rules
          </button>
          <span>•</span>
          <button onClick={() => handleOpenDashboard('settings')} className="hover:text-uz-text hover:underline">
            Alarm Settings
          </button>
          <span>•</span>
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  );
};

const root = document.getElementById('popup-root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <AppProvider>
        <PopupApp />
      </AppProvider>
    </React.StrictMode>
  );
}
