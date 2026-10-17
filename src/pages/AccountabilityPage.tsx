import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  ShieldCheck, 
  Send, 
  CheckCircle, 
  Lock, 
  Mail, 
  Phone 
} from 'lucide-react';

export const AccountabilityPage: React.FC = () => {
  const { state, updateAccountability, simulateNotification } = useApp();
  const acc = state.accountability;

  const [contactName, setContactName] = useState(acc.contactName);
  const [contactEmail, setContactEmail] = useState(acc.contactEmail);
  const [contactPhone, setContactPhone] = useState(acc.contactPhone);
  const [relationship, setRelationship] = useState(acc.relationship || 'Friend / Peer');
  const [notifyOnBreach, setNotifyOnBreach] = useState(acc.notifyOnBreach);
  const [notifyDailySummary, setNotifyDailySummary] = useState(acc.notifyDailySummary);
  const [consentGranted, setConsentGranted] = useState(acc.consentGranted);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAccountability({
      enabled: consentGranted && !!(contactEmail || contactPhone),
      contactName,
      contactEmail,
      contactPhone,
      relationship,
      notifyOnBreach,
      notifyDailySummary,
      consentGranted,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleRevokeConsent = () => {
    updateAccountability({
      enabled: false,
      consentGranted: false,
      verified: false,
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      lastSimulatedNotice: undefined,
    });
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setConsentGranted(false);
  };

  const activeGoal = state.goals.find((g) => g.active) || state.goals[0];

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-uz-text">
          Accountability Partner
        </h1>
        <p className="text-sm text-uz-muted mt-1">
          Optionally share your intentional pause milestones with a trusted contact. Completely voluntary and consent-based.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 bg-uz-mint border border-emerald-200 text-uz-success text-xs font-semibold rounded-xl flex items-center space-x-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4" />
          <span>Accountability preferences saved successfully.</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-white rounded-2xl p-6 border border-uz-border shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-uz-powder text-blue-700 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-heading text-uz-text">Trusted Contact Configuration</h2>
              <p className="text-xs text-uz-muted">Connect a mentor, friend, or partner.</p>
            </div>
          </div>

          {acc.enabled ? (
            <span className="px-3 py-1 bg-uz-mint text-uz-success text-xs font-bold rounded-full flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Partner Active</span>
            </span>
          ) : (
            <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
              Disconnected
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-uz-muted mb-1">Partner's Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full text-sm p-2.5 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text outline-none text-uz-text"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-uz-muted mb-1">Relationship</label>
              <input
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g. Peer, Mentor, Spouse"
                className="w-full text-sm p-2.5 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text outline-none text-uz-text"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-uz-muted mb-1 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5" />
                <span>Partner Email</span>
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full text-sm p-2.5 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text outline-none text-uz-text"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-uz-muted mb-1 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5" />
                <span>Partner Phone (Optional)</span>
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full text-sm p-2.5 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text outline-none text-uz-text"
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="pt-2 space-y-2.5">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyOnBreach}
                onChange={(e) => setNotifyOnBreach(e.target.checked)}
                className="rounded text-uz-text focus:ring-uz-primary w-4 h-4"
              />
              <span className="text-xs font-medium text-uz-text">
                Notify partner when an alarm challenge is completed
              </span>
            </label>

            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyDailySummary}
                onChange={(e) => setNotifyDailySummary(e.target.checked)}
                className="rounded text-uz-text focus:ring-uz-primary w-4 h-4"
              />
              <span className="text-xs font-medium text-uz-text">
                Send daily mindful pause streak summary
              </span>
            </label>
          </div>

          {/* Explicit Consent Box */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>Explicit Consent & Privacy Declaration</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Urge Zero will never transmit your browsing history, page titles, or full URLs. Only normalized domain names and pause outcomes are dispatched upon explicit confirmation.
            </p>
            <label className="flex items-start space-x-2.5 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={consentGranted}
                onChange={(e) => setConsentGranted(e.target.checked)}
                className="rounded text-amber-900 focus:ring-amber-500 w-4 h-4 mt-0.5"
                required
              />
              <span className="text-xs font-semibold text-amber-950">
                I explicitly grant permission to notify this partner regarding my intentional pause milestones.
              </span>
            </label>
          </div>

          {/* Message Preview */}
          <div className="p-4 bg-uz-bg rounded-xl border border-uz-border">
            <span className="text-[11px] font-bold text-uz-muted uppercase tracking-wider block mb-2">
              Sample Notification Preview
            </span>
            <div className="p-3 bg-white rounded-lg border border-uz-border text-xs text-uz-text font-mono leading-relaxed">
              "Urge Zero Alert: {contactName ? 'Your partner' : 'Kunal'} paused before accessing youtube.com to stay aligned with goal: '{activeGoal?.title || 'Deep Work'}'. Focus streak maintained."
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-uz-border">
            {acc.enabled ? (
              <button
                type="button"
                onClick={handleRevokeConsent}
                className="px-4 py-2 text-xs font-semibold text-uz-error hover:bg-red-50 rounded-xl border border-red-200 transition"
              >
                Revoke Consent & Disconnect
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={simulateNotification}
                className="px-4 py-2 text-xs font-semibold text-uz-text hover:bg-uz-bg rounded-xl border border-uz-border transition flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Test Alert</span>
              </button>
              <button
                type="submit"
                disabled={!consentGranted}
                className="px-6 py-2.5 text-xs font-bold bg-uz-primary hover:bg-uz-primary-hover text-uz-text rounded-xl shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </form>

        {acc.lastSimulatedNotice && (
          <div className="mt-4 p-3 bg-uz-mint/50 border border-emerald-200 text-uz-success text-xs rounded-xl flex items-center space-x-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{acc.lastSimulatedNotice}</span>
          </div>
        )}
      </div>
    </div>
  );
};
