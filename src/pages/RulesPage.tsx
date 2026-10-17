import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WebsiteRule, DomainCategory, ScheduleConfig } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Bell, 
  BellOff, 
  Calendar, 
  AlertCircle, 
  Check, 
  X, 
  Globe, 
  Play 
} from 'lucide-react';
import { normalizeDomain, isValidDomain } from '../utils/domain';

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const RulesPage: React.FC = () => {
  const { state, addRule, updateRule, deleteRule, toggleRule } = useApp();

  const [inputDomain, setInputDomain] = useState('');
  const [inputCategory, setInputCategory] = useState<DomainCategory>('social');
  const [inputAlarm, setInputAlarm] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit dialog state
  const [editingRule, setEditingRule] = useState<WebsiteRule | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<WebsiteRule | null>(null);

  // New rule schedule toggle
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleDays, setScheduleDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(17);
  const [endMinute, setEndMinute] = useState(0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const schedule: ScheduleConfig = {
      enabled: showScheduleForm,
      days: scheduleDays,
      startHour,
      startMinute,
      endHour,
      endMinute,
    };

    const res = addRule(inputDomain, inputCategory, inputAlarm, schedule);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to add rule.');
    } else {
      setSuccessMessage(`Successfully added ${normalizeDomain(inputDomain)} to restrictions.`);
      setInputDomain('');
      setShowScheduleForm(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    const norm = normalizeDomain(editingRule.domain);
    if (!isValidDomain(norm)) {
      setErrorMessage('Please enter a valid domain name.');
      return;
    }

    updateRule(editingRule.id, editingRule);
    setEditingRule(null);
    setSuccessMessage(`Updated restriction for ${norm}.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleConfirmDelete = () => {
    if (ruleToDelete) {
      deleteRule(ruleToDelete.id);
      setRuleToDelete(null);
      setSuccessMessage('Restriction removed.');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleToggleDay = (dayIndex: number) => {
    if (scheduleDays.includes(dayIndex)) {
      setScheduleDays(scheduleDays.filter((d) => d !== dayIndex));
    } else {
      setScheduleDays([...scheduleDays, dayIndex].sort());
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-uz-text">
            Website Restrictions
          </h1>
          <p className="text-sm text-uz-muted mt-1">
            Configure domains where Urge Zero initiates an intentional pause and Focus Breach Alarm.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-uz-muted bg-white border border-uz-border px-3 py-1.5 rounded-xl">
          <Globe className="w-3.5 h-3.5 text-uz-text" />
          <span>{state.rules.filter((r) => r.enabled).length} active / {state.rules.length} configured</span>
        </div>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-uz-error rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-uz-error/70 hover:text-uz-error">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 bg-uz-mint border border-emerald-200 text-uz-success rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-uz-success/70 hover:text-uz-success">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add New Rule Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-uz-border shadow-xs">
        <h2 className="text-base font-bold font-heading text-uz-text mb-4 flex items-center space-x-2">
          <Plus className="w-4 h-4 text-uz-text" />
          <span>Add New Restriction</span>
        </h2>

        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Domain input */}
            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-uz-muted mb-1">
                Domain or Website
              </label>
              <input
                type="text"
                value={inputDomain}
                onChange={(e) => {
                  setInputDomain(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="e.g. reddit.com or youtube.com"
                className="w-full text-sm py-2.5 px-3.5 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text focus:bg-white outline-none text-uz-text transition"
              />
            </div>

            {/* Category selection */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-uz-muted mb-1">
                Category
              </label>
              <select
                value={inputCategory}
                onChange={(e) => setInputCategory(e.target.value as DomainCategory)}
                className="w-full text-sm py-2.5 px-3 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text focus:bg-white outline-none text-uz-text transition"
              >
                <option value="social">Social Media</option>
                <option value="entertainment">Entertainment / Video</option>
                <option value="news">News & Media</option>
                <option value="shopping">Shopping</option>
                <option value="gaming">Gaming</option>
                <option value="custom">Other / Custom</option>
              </select>
            </div>

            {/* Alarm checkbox */}
            <div className="sm:col-span-3 flex items-end">
              <label className="flex items-center space-x-2 py-2.5 px-3 bg-uz-bg border border-uz-border rounded-xl w-full cursor-pointer hover:bg-white transition">
                <input
                  type="checkbox"
                  checked={inputAlarm}
                  onChange={(e) => setInputAlarm(e.target.checked)}
                  className="rounded text-uz-text focus:ring-uz-primary w-4 h-4"
                />
                <span className="text-xs font-semibold text-uz-text select-none">
                  Focus Alarm
                </span>
              </label>
            </div>
          </div>

          {/* Schedule toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowScheduleForm(!showScheduleForm)}
              className="text-xs font-medium text-uz-muted hover:text-uz-text flex items-center space-x-1.5 transition"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{showScheduleForm ? 'Hide Schedule Options' : '+ Add Specific Active Hours / Days'}</span>
            </button>

            {showScheduleForm && (
              <div className="mt-3 p-4 bg-uz-bg rounded-xl border border-uz-border space-y-3 animate-fadeIn">
                <span className="text-xs font-semibold text-uz-text block">Active Days:</span>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS_SHORT.map((name, idx) => {
                    const active = scheduleDays.includes(idx);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleToggleDay(idx)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                          active ? 'bg-uz-text text-white' : 'bg-white border border-uz-border text-uz-muted'
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center space-x-3 text-xs text-uz-text pt-1">
                  <span>Hours:</span>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={startHour}
                    onChange={(e) => setStartHour(parseInt(e.target.value, 10))}
                    className="w-14 p-1.5 bg-white border border-uz-border rounded-lg text-center"
                  />
                  <span>:</span>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={startMinute}
                    onChange={(e) => setStartMinute(parseInt(e.target.value, 10))}
                    className="w-14 p-1.5 bg-white border border-uz-border rounded-lg text-center"
                  />
                  <span className="px-1 text-uz-muted">to</span>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={endHour}
                    onChange={(e) => setEndHour(parseInt(e.target.value, 10))}
                    className="w-14 p-1.5 bg-white border border-uz-border rounded-lg text-center"
                  />
                  <span>:</span>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={endMinute}
                    onChange={(e) => setEndMinute(parseInt(e.target.value, 10))}
                    className="w-14 p-1.5 bg-white border border-uz-border rounded-lg text-center"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!inputDomain.trim()}
              className="py-2.5 px-6 bg-uz-primary hover:bg-uz-primary-hover text-uz-text font-bold rounded-xl text-sm transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Add Restriction Rule
            </button>
          </div>
        </form>
      </div>

      {/* Rules List Table / Cards */}
      <div className="bg-white rounded-2xl border border-uz-border shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-uz-border flex items-center justify-between">
          <h2 className="text-base font-bold font-heading text-uz-text">
            Configured Restrictions ({state.rules.length})
          </h2>
          <span className="text-xs text-uz-muted">
            Subdomains like m.domain.com automatically covered
          </span>
        </div>

        {state.rules.length === 0 ? (
          <div className="p-10 text-center text-uz-muted">
            <Globe className="w-10 h-10 mx-auto text-uz-border mb-3" />
            <p className="font-semibold text-uz-text">No restrictions configured yet.</p>
            <p className="text-xs mt-1">Add your first domain above to start protecting your focus.</p>
          </div>
        ) : (
          <div className="divide-y divide-uz-border">
            {state.rules.map((rule) => (
              <div
                key={rule.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                  rule.enabled ? 'bg-white' : 'bg-gray-50/70 opacity-75'
                }`}
              >
                {/* Domain & details */}
                <div className="flex items-center space-x-3.5">
                  <button
                    type="button"
                    onClick={() => toggleRule(rule.id)}
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition cursor-pointer ${
                      rule.enabled ? 'bg-uz-primary text-uz-text' : 'bg-gray-200 text-gray-500'
                    }`}
                    title={rule.enabled ? 'Click to disable' : 'Click to enable'}
                  >
                    {rule.enabled ? <Check className="w-4 h-4" /> : <X className="w-3 h-3" />}
                  </button>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-bold text-uz-text">{rule.domain}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-uz-bg text-uz-muted border border-uz-border">
                        {rule.category}
                      </span>
                      {rule.alarmEnabled ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-uz-error border border-red-200 flex items-center space-x-1">
                          <Bell className="w-2.5 h-2.5" />
                          <span>5Q Alarm</span>
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 flex items-center space-x-1">
                          <BellOff className="w-2.5 h-2.5" />
                          <span>Pause only</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-uz-muted mt-1 flex items-center space-x-3">
                      <span>{rule.breachCount} pauses triggered</span>
                      {rule.schedule.enabled && (
                        <span className="flex items-center space-x-1 text-uz-text font-medium">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {rule.schedule.startHour}:{String(rule.schedule.startMinute).padStart(2, '0')} - {rule.schedule.endHour}:{String(rule.schedule.endMinute).padStart(2, '0')}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  {/* Test Intervention Link */}
                  <a
                    href={`#intervention?domain=${encodeURIComponent(rule.domain)}&alarm=${rule.alarmEnabled}`}
                    className="p-2 text-xs font-medium text-uz-muted hover:text-uz-text rounded-lg hover:bg-uz-bg transition flex items-center space-x-1"
                    title="Test intervention flow for this rule"
                  >
                    <Play className="w-3.5 h-3.5 text-uz-success" />
                    <span className="hidden sm:inline">Test Pause</span>
                  </a>

                  {/* Toggle Alarm Button */}
                  <button
                    type="button"
                    onClick={() => updateRule(rule.id, { alarmEnabled: !rule.alarmEnabled })}
                    className={`p-2 rounded-lg transition text-xs font-medium ${
                      rule.alarmEnabled ? 'text-uz-error hover:bg-red-50' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={rule.alarmEnabled ? 'Alarm enabled. Click to switch to calm pause' : 'Alarm disabled. Click to enable 5Q alarm'}
                  >
                    {rule.alarmEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => setEditingRule(rule)}
                    className="p-2 text-uz-muted hover:text-uz-text rounded-lg hover:bg-uz-bg transition"
                    title="Edit rule"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setRuleToDelete(rule)}
                    className="p-2 text-uz-muted hover:text-uz-error rounded-lg hover:bg-red-50 transition"
                    title="Delete rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-uz-border shadow-xl">
            <h3 className="text-lg font-bold font-heading text-uz-text mb-4">Edit Restriction</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-uz-muted mb-1">Domain</label>
                <input
                  type="text"
                  value={editingRule.domain}
                  onChange={(e) => setEditingRule({ ...editingRule, domain: e.target.value })}
                  className="w-full text-sm p-2.5 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-uz-muted mb-1">Category</label>
                <select
                  value={editingRule.category}
                  onChange={(e) => setEditingRule({ ...editingRule, category: e.target.value as DomainCategory })}
                  className="w-full text-sm p-2.5 bg-uz-bg border border-uz-border rounded-xl"
                >
                  <option value="social">Social Media</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="news">News</option>
                  <option value="shopping">Shopping</option>
                  <option value="gaming">Gaming</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editAlarm"
                  checked={editingRule.alarmEnabled}
                  onChange={(e) => setEditingRule({ ...editingRule, alarmEnabled: e.target.checked })}
                  className="rounded text-uz-text"
                />
                <label htmlFor="editAlarm" className="text-xs font-semibold text-uz-text cursor-pointer">
                  Require 5-Question Focus Breach Alarm Challenge
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 text-xs font-semibold text-uz-muted hover:text-uz-text rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-uz-text text-white rounded-xl hover:bg-black transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {ruleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-uz-border shadow-xl text-center">
            <div className="w-12 h-12 bg-red-100 text-uz-error rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-heading text-uz-text mb-1">Remove Restriction?</h3>
            <p className="text-xs text-uz-muted mb-5">
              Are you sure you want to remove <span className="font-bold text-uz-text">{ruleToDelete.domain}</span>? Pauses will no longer trigger for this site.
            </p>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setRuleToDelete(null)}
                className="flex-1 py-2 text-xs font-semibold text-uz-muted hover:text-uz-text rounded-xl border border-uz-border"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2 text-xs font-bold bg-uz-error text-white rounded-xl hover:bg-red-700 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
