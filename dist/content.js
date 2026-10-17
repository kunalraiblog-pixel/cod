/**
 * Urge Zero — Content Script Bridge
 * Bridges web dashboard state with Chrome Extension storage
 */

const STORAGE_KEY = 'urgezero_app_state_v1';

// Listen to web page window messages
window.addEventListener('message', (event) => {
  if (!event.data || typeof event.data !== 'object') return;

  // Extension presence ping
  if (event.data.type === 'URGEZERO_PING') {
    window.postMessage({ type: 'URGEZERO_PONG', version: '1.0.0' }, '*');
  }

  // Dashboard state update broadcast
  if (event.data.type === 'URGEZERO_SYNC_TO_EXTENSION') {
    const payload = event.data.payload;
    if (payload && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [STORAGE_KEY]: payload });
    }
  }
});

// Notify page when storage is modified from extension popup
if (chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[STORAGE_KEY]) {
      window.postMessage({
        type: 'URGEZERO_STORAGE_CHANGED',
        payload: changes[STORAGE_KEY].newValue
      }, '*');
    }
  });
}
