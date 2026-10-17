export const DEFAULTS = { rules: [], goals: [], events: [], settings: { alarmEnabled: true, difficulty: 'normal', volume: 0.35, delay: 0, sound: 'tone' } };
const key = 'urgezero-state-v1';
const clone = (v) => JSON.parse(JSON.stringify(v));
export async function loadState() {
  try {
    if (globalThis.chrome?.storage?.local) {
      const out = await chrome.storage.local.get(key);
      return { ...clone(DEFAULTS), ...(out[key] || {}), settings: { ...DEFAULTS.settings, ...(out[key]?.settings || {}) } };
    }
    return { ...clone(DEFAULTS), ...(JSON.parse(localStorage.getItem(key) || '{}')), settings: { ...DEFAULTS.settings, ...(JSON.parse(localStorage.getItem(key) || '{}').settings || {}) } };
  } catch { return clone(DEFAULTS); }
}
export async function saveState(state) {
  if (globalThis.chrome?.storage?.local) return chrome.storage.local.set({ [key]: state });
  localStorage.setItem(key, JSON.stringify(state));
}
export function normalizeDomain(input) {
  const raw = input.trim().toLowerCase();
  if (!raw || /\s/.test(raw)) throw new Error('Enter a domain, such as example.com.');
  let host;
  try { host = new URL(raw.includes('://') ? raw : `https://${raw}`).hostname; } catch { throw new Error('That domain is not valid.'); }
  if (!host || host === 'localhost' || !host.includes('.') || /[^a-z0-9.-]/.test(host)) throw new Error('Enter a public hostname, not a full path.');
  return host.replace(/^www\./, '');
}
export function matchesDomain(host, domain) { return host === domain || host.endsWith(`.${domain}`); }
export function currentStreak(events) {
  const activeDays = new Set(events.filter(e => ['intervention','returned-safe','challenge-complete'].includes(e.type)).map(e => new Date(e.at).toDateString()));
  let streak = 0, day = new Date(); day.setHours(0,0,0,0);
  while (activeDays.has(day.toDateString())) { streak++; day.setDate(day.getDate() - 1); }
  return streak;
}
export function makeQuestions(difficulty = 'normal') {
  const range = difficulty === 'easy' ? [2, 15] : difficulty === 'hard' ? [12, 80] : [5, 45];
  const rand = (a,b) => Math.floor(Math.random() * (b-a+1))+a;
  return Array.from({length:5}, (_, i) => {
    const kind = i % 4;
    let a = rand(...range), b = rand(...range);
    if (kind === 0) return { text: `${a} + ${b} = ?`, answer: a+b };
    if (kind === 1) { if (b>a) [a,b]=[b,a]; return { text: `${a} − ${b} = ?`, answer:a-b }; }
    if (kind === 2) { a = rand(2, difficulty === 'hard' ? 15 : 10); b=rand(2, difficulty === 'easy' ? 8 : 12); return {text:`${a} × ${b} = ?`,answer:a*b}; }
    b=rand(2, difficulty === 'hard' ? 15 : 10); const q=rand(2, difficulty === 'hard' ? 15 : 10); return {text:`${b*q} ÷ ${b} = ?`,answer:q};
  });
}
export async function record(type, domain, extra = {}) { const s=await loadState(); s.events.unshift({ id: crypto.randomUUID(), type, domain, at: Date.now(), ...extra }); s.events=s.events.slice(0,100); await saveState(s); return s; }
