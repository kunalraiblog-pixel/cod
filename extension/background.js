/**
 * Urge Zero — Background Service Worker (Manifest V3)
 * "A pause can change everything"
 */

const STORAGE_KEY = 'urgezero_app_state_v1';

// In-memory cache for fast, non-blocking navigation evaluation
let cachedState = null;
let lastNavigationTimes = new Map(); // tabId -> { url, time }

// Helper: Normalize domain matching
function normalizeDomain(input) {
  if (!input) return '';
  let cleaned = input.trim().toLowerCase();
  if (cleaned.startsWith('http://')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('https://')) cleaned = cleaned.slice(8);
  const slash = cleaned.indexOf('/');
  if (slash !== -1) cleaned = cleaned.slice(0, slash);
  const colon = cleaned.indexOf(':');
  if (colon !== -1) cleaned = cleaned.slice(0, colon);
  if (cleaned.startsWith('www.')) cleaned = cleaned.slice(4);
  if (cleaned.endsWith('.')) cleaned = cleaned.slice(0, -1);
  return cleaned.trim();
}

function isDomainMatched(targetHostname, ruleDomain) {
  const normTarget = normalizeDomain(targetHostname);
  const normRule = normalizeDomain(ruleDomain);
  if (!normTarget || !normRule) return false;
  if (normTarget === normRule) return true;
  if (normTarget.endsWith('.' + normRule)) return true;
  return false;
}

function isScheduleActive(schedule, date = new Date()) {
  if (!schedule || !schedule.enabled) return true;
  const currentDay = date.getDay();
  if (schedule.days && schedule.days.length > 0 && !schedule.days.includes(currentDay)) {
    return false;
  }
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const startMinutes = (schedule.startHour || 0) * 60 + (schedule.startMinute || 0);
  const endMinutes = (schedule.endHour || 0) * 60 + (schedule.endMinute || 0);
  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}

// Reload state from storage
async function loadState() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (res) => {
      cachedState = res[STORAGE_KEY] || null;
      updateBadge();
      resolve(cachedState);
    });
  });
}

function updateBadge() {
  if (!cachedState) return;
  const activeCount = (cachedState.rules || []).filter((r) => r.enabled).length;
  chrome.action.setBadgeText({ text: activeCount > 0 ? String(activeCount) : '' });
  chrome.action.setBadgeBackgroundColor({ color: '#26352D' });
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[STORAGE_KEY]) {
    cachedState = changes[STORAGE_KEY].newValue;
    updateBadge();
  }
});

// Intercept navigation
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only intercept main frame navigation
  if (details.frameId !== 0) return;

  const url = details.url;
  if (!url) return;

  // Ignore chrome, extension, file, and blank URLs
  if (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('about:') ||
    url.startsWith('edge://') ||
    url.startsWith('view-source:')
  ) {
    return;
  }

  // Parse hostname safely
  let targetHostname = '';
  try {
    const parsed = new URL(url);
    targetHostname = parsed.hostname;
  } catch {
    return;
  }

  if (!targetHostname) return;

  // Ensure state is loaded
  if (!cachedState) {
    await loadState();
  }
  if (!cachedState || !cachedState.rules) return;

  // Check temporary bypass
  const now = Date.now();
  const normTarget = normalizeDomain(targetHostname);
  const bypassExpiry = cachedState.settings?.bypasses?.[normTarget];
  if (bypassExpiry && bypassExpiry > now) {
    // Domain has active temporary pass (e.g. 5 minutes conscious continuation)
    return;
  }

  // Find matching active rule
  const matchedRule = cachedState.rules.find((r) => {
    if (!r.enabled) return false;
    if (!isDomainMatched(normTarget, r.domain)) return false;
    if (!isScheduleActive(r.schedule)) return false;
    return true;
  });

  if (!matchedRule) return;

  // Prevent duplicate redirect loop within 2 seconds for same tab
  const lastNav = lastNavigationTimes.get(details.tabId);
  if (lastNav && lastNav.url === url && now - lastNav.time < 2000) {
    return;
  }
  lastNavigationTimes.set(details.tabId, { url, time: now });

  // Direct user to Urge Zero intervention page
  const interventionUrl = chrome.runtime.getURL(
    `intervention.html?domain=${encodeURIComponent(normTarget)}&alarm=${matchedRule.alarmEnabled ? 'true' : 'false'}&originalUrl=${encodeURIComponent(url)}`
  );

  chrome.tabs.update(details.tabId, { url: interventionUrl });
});

// Clean up closed tabs from memory
chrome.tabs.onRemoved.addListener((tabId) => {
  lastNavigationTimes.delete(tabId);
});

// Initial startup
chrome.runtime.onInstalled.addListener(() => {
  loadState();
});

chrome.runtime.onStartup.addListener(() => {
  loadState();
});

// Initialize right away
loadState();
