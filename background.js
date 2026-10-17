import {loadState,matchesDomain,record} from './shared/core.js';
const recentlyRedirected=new Map();
chrome.webNavigation.onBeforeNavigate.addListener(async ({tabId,url,frameId})=>{
  if(frameId!==0 || !/^https?:/i.test(url) || url.startsWith(chrome.runtime.getURL(''))) return;
  const now=Date.now(); if(recentlyRedirected.get(tabId)>now-1500) return;
  try { const host=new URL(url).hostname.toLowerCase(); const s=await loadState(); const rule=s.rules.find(r=>r.enabled&&matchesDomain(host,r.domain)); if(!rule)return; recentlyRedirected.set(tabId,now); await record('intervention',rule.domain,{alarm:!!(rule.alarm&&s.settings.alarmEnabled)}); const next=chrome.runtime.getURL(`intervention.html?domain=${encodeURIComponent(rule.domain)}&alarm=${rule.alarm&&s.settings.alarmEnabled?'1':'0'}`); await chrome.tabs.update(tabId,{url:next}); }catch(e){console.warn('Urge Zero navigation handling failed',e)}
});
chrome.tabs.onRemoved.addListener(id=>recentlyRedirected.delete(id));
