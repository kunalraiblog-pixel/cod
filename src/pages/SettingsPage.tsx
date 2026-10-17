import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlarmDifficulty, SoundPreset } from '../types';
import { audioService } from '../services/audioService';
import { 
  Sliders, 
  Bell, 
  Volume2, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Check, 
  Play, 
  Pause 
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { 
    state, 
    updateAlarmSettings, 
    updateAppSettings, 
    clearEvents, 
    resetAll, 
    exportData, 
    importData 
  } = useApp();

  const alarm = state.alarmSettings;
  const appSettings = state.settings;

  const [previewing, setPreviewing] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleTestSound = () => {
    if (previewing) {
      audioService.stopAlarm();
      setPreviewing(false);
    } else {
      setPreviewing(true);
      audioService.previewPreset(alarm.soundPreset, alarm.volume);
      setTimeout(() => setPreviewing(false), 2000);
    }
  };

  const handleExport = () => {
    const dataStr = exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urgezero-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Settings exported successfully.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const ok = importData(importText);
    if (ok) {
      setStatusMessage('Data imported successfully.');
      setShowImportBox(false);
      setImportText('');
    } else {
      setStatusMessage('Failed to parse backup JSON.');
    }
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-uz-text">
          Settings & Preferences
        </h1>
        <p className="text-sm text-uz-muted mt-1">
          Tune your Focus Breach Alarm, general intervention policies, and data controls.
        </p>
      </div>

      {statusMessage && (
        <div className="p-3.5 bg-uz-mint border border-emerald-200 text-uz-success text-xs font-semibold rounded-xl flex items-center space-x-2 animate-fadeIn">
          <Check className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Focus Breach Alarm Settings Card */}
      <div className="bg-white rounded-2xl p-6 border border-uz-border shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-uz-border">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-50 text-uz-error rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-heading text-uz-text">Focus Breach Alarm Engine</h2>
              <p className="text-xs text-uz-muted">5-question arithmetic challenge required to silence alarm</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={alarm.masterEnabled}
              onChange={(e) => updateAlarmSettings({ masterEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-uz-text"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Sound Preset & Preview */}
          <div>
            <label className="block text-xs font-semibold text-uz-muted mb-2">Sound Tone Preset</label>
            <div className="flex space-x-2">
              <select
                value={alarm.soundPreset}
                onChange={(e) => updateAlarmSettings({ soundPreset: e.target.value as SoundPreset })}
                className="flex-1 text-sm p-2.5 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text outline-none text-uz-text"
              >
                <option value="urgent-pulse">Urgent Pulse (Dual-Tone)</option>
                <option value="radar-siren">Radar Siren (Modulated)</option>
                <option value="chime-beep">Chime Beep (Triple Alert)</option>
              </select>
              <button
                type="button"
                onClick={handleTestSound}
                className="px-3.5 py-2 bg-uz-bg hover:bg-uz-border text-uz-text text-xs font-semibold rounded-xl border border-uz-border transition flex items-center space-x-1.5 cursor-pointer"
                title="Preview Tone"
              >
                {previewing ? <Pause className="w-3.5 h-3.5 text-uz-error" /> : <Play className="w-3.5 h-3.5" />}
                <span>{previewing ? 'Stop' : 'Test'}</span>
              </button>
            </div>
          </div>

          {/* Volume slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-uz-muted flex items-center space-x-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Alarm Volume</span>
              </label>
              <span className="text-xs font-bold text-uz-text">{Math.round(alarm.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={alarm.volume}
              onChange={(e) => updateAlarmSettings({ volume: parseFloat(e.target.value) })}
              className="w-full accent-uz-text h-2 bg-gray-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Math Challenge Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-uz-muted mb-2">Challenge Difficulty</label>
            <select
              value={alarm.difficulty}
              onChange={(e) => updateAlarmSettings({ difficulty: e.target.value as AlarmDifficulty })}
              className="w-full text-sm p-2.5 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text outline-none text-uz-text"
            >
              <option value="easy">Easy (Single-digit arithmetic & simple tables)</option>
              <option value="normal">Normal (Two-digit arithmetic, standard tables)</option>
              <option value="hard">Hard (Multi-step mental arithmetic)</option>
            </select>
          </div>

          {/* Activation Delay */}
          <div>
            <label className="block text-xs font-semibold text-uz-muted mb-2">Activation Delay</label>
            <select
              value={alarm.activationDelaySeconds}
              onChange={(e) => updateAlarmSettings({ activationDelaySeconds: parseInt(e.target.value, 10) })}
              className="w-full text-sm p-2.5 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text outline-none text-uz-text"
            >
              <option value={0}>Immediate (0 seconds)</option>
              <option value={3}>3 seconds pause before sound</option>
              <option value={5}>5 seconds pause before sound</option>
            </select>
          </div>
        </div>

        {/* Emergency Override Disclosed Settings */}
        <div className="pt-2">
          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={alarm.emergencyOverrideAllowed}
              onChange={(e) => updateAlarmSettings({ emergencyOverrideAllowed: e.target.checked })}
              className="rounded text-uz-text focus:ring-uz-primary w-4 h-4"
            />
            <span className="text-xs font-medium text-uz-text">
              Allow voluntary emergency / accessibility override button in challenge modal
            </span>
          </label>
        </div>
      </div>

      {/* General Intervention Preferences Card */}
      <div className="bg-white rounded-2xl p-6 border border-uz-border shadow-xs space-y-4">
        <h2 className="text-base font-bold font-heading text-uz-text mb-2 flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-uz-text" />
          <span>General Intervention Policies</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-uz-muted mb-1">
              Default Safe Return Destination URL
            </label>
            <input
              type="url"
              value={appSettings.defaultSafeUrl}
              onChange={(e) => updateAppSettings({ defaultSafeUrl: e.target.value })}
              placeholder="https://calendar.google.com"
              className="w-full text-sm p-2.5 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text outline-none text-uz-text"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-uz-muted mb-1">
              Default Breathing Pause Duration
            </label>
            <select
              value={appSettings.defaultPauseDuration}
              onChange={(e) => updateAppSettings({ defaultPauseDuration: parseInt(e.target.value, 10) })}
              className="w-full text-sm p-2.5 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text outline-none text-uz-text"
            >
              <option value={15}>15 seconds</option>
              <option value={30}>30 seconds (Recommended)</option>
              <option value={60}>60 seconds (Deep calm)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={appSettings.strictMode}
              onChange={(e) => updateAppSettings({ strictMode: e.target.checked })}
              className="rounded text-uz-text focus:ring-uz-primary w-4 h-4"
            />
            <span className="text-xs font-semibold text-uz-text">
              Strict Mode (Disables intentional continuation bypass entirely)
            </span>
          </label>

          <div className="text-xs text-uz-muted pl-6">
            When enabled, restricted sites can only be bypassed after solving the 5-question Focus Breach Alarm.
          </div>
        </div>
      </div>

      {/* Data Management, Import/Export & Factory Reset */}
      <div className="bg-white rounded-2xl p-6 border border-uz-border shadow-xs space-y-4">
        <h2 className="text-base font-bold font-heading text-uz-text mb-2">Data & Privacy Controls</h2>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center space-x-2 py-2 px-3.5 bg-uz-bg hover:bg-uz-border text-uz-text text-xs font-semibold rounded-xl border border-uz-border transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Configuration JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setShowImportBox(!showImportBox)}
            className="flex items-center space-x-2 py-2 px-3.5 bg-uz-bg hover:bg-uz-border text-uz-text text-xs font-semibold rounded-xl border border-uz-border transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Configuration</span>
          </button>

          <button
            type="button"
            onClick={clearEvents}
            className="flex items-center space-x-2 py-2 px-3.5 bg-uz-bg hover:bg-red-50 text-uz-muted hover:text-uz-error text-xs font-semibold rounded-xl border border-uz-border transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Event History</span>
          </button>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center space-x-2 py-2 px-3.5 bg-red-50 hover:bg-red-100 text-uz-error text-xs font-semibold rounded-xl border border-red-200 transition cursor-pointer ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Factory Reset</span>
          </button>
        </div>

        {showImportBox && (
          <div className="p-4 bg-uz-bg rounded-xl border border-uz-border space-y-3 animate-fadeIn">
            <label className="block text-xs font-semibold text-uz-text">Paste exported JSON:</label>
            <textarea
              rows={4}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full text-xs font-mono p-2 bg-white border border-uz-border rounded-lg outline-none"
              placeholder='{"rules": [...], "alarmSettings": {...}}'
            />
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleImport}
                className="py-1.5 px-4 bg-uz-text text-white text-xs font-bold rounded-lg hover:bg-black transition"
              >
                Apply Import
              </button>
              <button
                type="button"
                onClick={() => setShowImportBox(false)}
                className="py-1.5 px-3 bg-white text-uz-muted text-xs rounded-lg border border-uz-border"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showResetConfirm && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2 animate-fadeIn">
            <h4 className="text-xs font-bold text-uz-error">Are you completely sure?</h4>
            <p className="text-xs text-red-700">
              This will restore all default rules, reset your streaks, and remove all customized restrictions.
            </p>
            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  resetAll();
                  setShowResetConfirm(false);
                  setStatusMessage('Application reset to factory defaults.');
                }}
                className="py-1.5 px-4 bg-uz-error text-white text-xs font-bold rounded-lg hover:bg-red-700 transition"
              >
                Yes, Reset Everything
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="py-1.5 px-3 bg-white text-uz-muted text-xs rounded-lg border border-uz-border"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Team & Product Identity Card */}
      <div className="p-6 bg-uz-bg rounded-2xl border border-uz-border text-xs text-uz-muted space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-bold text-uz-text text-sm">Urge Zero v1.0.0</div>
          <span className="text-[11px] bg-white px-2.5 py-0.5 rounded-full border border-uz-border">
            Manifest V3 Compatible
          </span>
        </div>
        <p className="text-uz-muted">
          Created with intentional craft by <strong className="text-uz-text">Dual Core</strong> — Kunal Rai and Akshay Yadav.
        </p>
        <p className="text-[11px] text-uz-muted pt-1">
          Urge Zero operates under a 100% local-first privacy architecture. All restriction logic, audio synthesis, and math questions run entirely inside your browser. No personal browsing URLs or habit logs are transmitted to external servers.
        </p>
      </div>
    </div>
  );
};
