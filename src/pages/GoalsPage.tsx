import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PersonalGoal } from '../types';
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  ExternalLink, 
  Info 
} from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const { state, addGoal, updateGoal, deleteGoal } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<PersonalGoal | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PersonalGoal['category']>('focus');
  const [dailyPauseTarget, setDailyPauseTarget] = useState(5);
  const [safeUrl, setSafeUrl] = useState('https://calendar.google.com');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addGoal({
      title: title.trim(),
      description: description.trim(),
      category,
      dailyPauseTarget: Math.max(1, dailyPauseTarget),
      safeUrl: safeUrl.trim() || 'https://calendar.google.com',
      active: true,
    });

    setTitle('');
    setDescription('');
    setShowAddForm(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || !editingGoal.title.trim()) return;

    updateGoal(editingGoal.id, editingGoal);
    setEditingGoal(null);
  };

  // Compute metrics from actual event logs
  const totalEvents = state.events.length;
  const returnedCount = state.events.filter((e) => e.actionTaken === 'returned_to_goal').length;
  const alarmSolves = state.events.filter((e) => e.actionTaken === 'alarm_completed').length;
  const pausesCount = state.events.filter((e) => e.actionTaken === 'paused').length;
  const continuations = state.events.filter((e) => e.actionTaken === 'continued_intentionally').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-uz-text">
            Goals & Habit Insights
          </h1>
          <p className="text-sm text-uz-muted mt-1">
            Define your core intentions and review your real pause-and-reflection progress.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 py-2.5 px-4 bg-uz-primary hover:bg-uz-primary-hover text-uz-text font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel' : 'New Goal'}</span>
        </button>
      </div>

      {/* Add Goal Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl p-6 border border-uz-border shadow-xs animate-fadeIn">
          <h2 className="text-base font-bold font-heading text-uz-text mb-4">Create Personal Goal</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-uz-muted mb-1">Goal Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Protect Deep Engineering Focus"
                  className="w-full text-sm p-2.5 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text outline-none text-uz-text"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-uz-muted mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PersonalGoal['category'])}
                  className="w-full text-sm p-2.5 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text outline-none text-uz-text"
                >
                  <option value="focus">Focus & Productivity</option>
                  <option value="health">Mental Health & Calm</option>
                  <option value="learning">Continuous Learning</option>
                  <option value="sleep">Sleep & Evening Wind-Down</option>
                  <option value="custom">Custom Intention</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-uz-muted mb-1">Intention Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why this matters to you right now..."
                  rows={2}
                  className="w-full text-sm p-2.5 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text outline-none text-uz-text"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-uz-muted mb-1">Daily Pause Target</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={dailyPauseTarget}
                  onChange={(e) => setDailyPauseTarget(parseInt(e.target.value, 10))}
                  className="w-full text-sm p-2.5 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text outline-none text-uz-text"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-uz-muted mb-1">Safe Return URL</label>
                <input
                  type="url"
                  value={safeUrl}
                  onChange={(e) => setSafeUrl(e.target.value)}
                  placeholder="https://calendar.google.com"
                  className="w-full text-sm p-2.5 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text outline-none text-uz-text"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-semibold text-uz-muted hover:text-uz-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-uz-text text-white rounded-xl hover:bg-black transition"
              >
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.goals.map((goal) => (
          <div
            key={goal.id}
            className={`p-6 rounded-2xl border transition shadow-xs ${
              goal.active ? 'bg-white border-uz-primary/80 ring-2 ring-uz-primary/20' : 'bg-gray-50/70 border-uz-border'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="p-2 bg-uz-mint text-uz-success rounded-xl">
                  <Target className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-uz-text">{goal.title}</h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-uz-muted px-2 py-0.5 rounded-full bg-uz-bg border border-uz-border">
                    {goal.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => updateGoal(goal.id, { active: !goal.active })}
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold transition ${
                    goal.active ? 'bg-uz-mint text-uz-success' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {goal.active ? 'Active' : 'Paused'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingGoal(goal)}
                  className="p-1.5 text-uz-muted hover:text-uz-text rounded-lg transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                {state.goals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1.5 text-uz-muted hover:text-uz-error rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-uz-muted mb-4 leading-relaxed">{goal.description}</p>

            <div className="pt-3 border-t border-uz-border flex items-center justify-between text-xs text-uz-muted">
              <span>Target: {goal.dailyPauseTarget} mindful pauses/day</span>
              <a
                href={goal.safeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-uz-text font-medium flex items-center space-x-1 hover:underline truncate max-w-[140px]"
              >
                <span>Safe Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Real Insights Summary Section */}
      <div className="bg-white rounded-2xl p-6 border border-uz-border shadow-xs">
        <h2 className="text-lg font-bold font-heading text-uz-text mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-uz-text" />
          <span>Intervention Outcomes Breakdown</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-uz-bg rounded-xl border border-uz-border text-center">
            <span className="text-xs font-medium text-uz-muted block mb-1">Returned to Goal</span>
            <span className="text-2xl font-extrabold text-uz-text">{returnedCount}</span>
            <span className="text-[10px] text-uz-success block mt-1">Direct safe return</span>
          </div>
          <div className="p-4 bg-uz-bg rounded-xl border border-uz-border text-center">
            <span className="text-xs font-medium text-uz-muted block mb-1">Breathing Pauses</span>
            <span className="text-2xl font-extrabold text-uz-text">{pausesCount}</span>
            <span className="text-[10px] text-emerald-600 block mt-1">Calm resets</span>
          </div>
          <div className="p-4 bg-uz-bg rounded-xl border border-uz-border text-center">
            <span className="text-xs font-medium text-uz-muted block mb-1">5Q Alarms Solved</span>
            <span className="text-2xl font-extrabold text-uz-text">{alarmSolves}</span>
            <span className="text-[10px] text-blue-600 block mt-1">Cognitive challenge</span>
          </div>
          <div className="p-4 bg-uz-bg rounded-xl border border-uz-border text-center">
            <span className="text-xs font-medium text-uz-muted block mb-1">Conscious Continues</span>
            <span className="text-2xl font-extrabold text-uz-text">{continuations}</span>
            <span className="text-[10px] text-amber-600 block mt-1">Intentional passes</span>
          </div>
        </div>

        {/* Informative medical / legal disclaimer required by prompt */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-uz-muted flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-uz-muted shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Urge Zero metrics reflect personal application pauses and habit self-monitoring ({totalEvents} total logged events). These statistics are not intended as clinical recovery diagnostics, medical addiction treatment, or a guaranteed behavioural outcome.
          </p>
        </div>
      </div>

      {/* Edit Goal Modal */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-uz-border shadow-xl">
            <h3 className="text-lg font-bold font-heading text-uz-text mb-4">Edit Goal</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-uz-muted mb-1">Title</label>
                <input
                  type="text"
                  value={editingGoal.title}
                  onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                  className="w-full text-sm p-2.5 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-uz-muted mb-1">Description</label>
                <textarea
                  value={editingGoal.description}
                  onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                  rows={2}
                  className="w-full text-sm p-2.5 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-uz-muted mb-1">Daily Pause Target</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={editingGoal.dailyPauseTarget}
                  onChange={(e) => setEditingGoal({ ...editingGoal, dailyPauseTarget: parseInt(e.target.value, 10) })}
                  className="w-full text-sm p-2.5 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-uz-muted mb-1">Safe URL</label>
                <input
                  type="url"
                  value={editingGoal.safeUrl}
                  onChange={(e) => setEditingGoal({ ...editingGoal, safeUrl: e.target.value })}
                  className="w-full text-sm p-2.5 bg-uz-bg border border-uz-border rounded-xl focus:border-uz-text outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                  className="px-4 py-2 text-xs font-semibold text-uz-muted hover:text-uz-text"
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
    </div>
  );
};
