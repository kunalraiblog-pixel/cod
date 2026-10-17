# Urge Zero

> **A pause can change everything.**  
> *Make space for what matters.*

**Team Dual Core:** Kunal Rai & Akshay Yadav  
**Architecture:** Chrome Extension (Manifest V3) + React / TypeScript Dashboard + Synthesized Web Audio Engine

---

## 🌟 Overview

Modern websites and feeds are engineered to trigger subconscious dopamine response loops. **Urge Zero** interrupts impulsive browsing with deliberate, mindful friction:
1. **INTERRUPT:** Detects attempts to visit user-restricted domains and halts navigation.
2. **REFLECT:** Prompts users with their personal intentions, guided breathing pauses, or the **Focus Breach Alarm**.
3. **CONNECT:** Supports voluntary, consent-based accountability partnerships without leaking sensitive browsing histories.

---

## 🚀 Core Features

### 1. Website Restrictions & Domain-Boundary Matching
- **Boundary-aware Hostname Matching:** A restriction on `youtube.com` reliably matches `youtube.com`, `m.youtube.com`, and `music.youtube.com`, while never falsely blocking `notyoutube.com`.
- **Domain Normalization:** Strips protocols (`http://`, `https://`), trailing slashes, paths, and query arguments.
- **Per-Domain Configuration:** Individual toggles for the 5-Question Focus Breach Alarm, category tagging, and time/day schedules.

### 2. Focus Breach Alarm (5-Question Arithmetic Challenge)
- **Urgent Cognitive Interruption:** Navigating to an alarm-enabled restricted site immediately activates an alarm tone.
- **Continuous Siren Loop:** The alarm sound loops persistently until the user solves **five arithmetic problems** mentally.
- **Local Web Audio API Synthesis:** Zero external audio dependencies or network requests; 100% locally synthesized tones (`Urgent Pulse`, `Radar Siren`, `Chime Beep`).
- **Autoplay Resilience:** Automatically detects browser autoplay blocks and provides an accessible *Unmute Alarm* button.
- **Rigorous Validation:**
  - Empty or invalid input is rejected without skipping.
  - Incorrect answers prompt calm retry feedback without advancing.
  - Correct answers advance the counter by exactly 1.
  - Anti-bounce protection prevents rapid Enter key or click double-submissions.
  - Solving the 5th question stops the siren immediately, plays a success chime, triggers a celebration effect, and records the achievement.
- **Emergency / Accessibility Override:** A clearly disclosed voluntary bypass button for legitimate urgent needs or audio sensitivity.

### 3. Streak System & Shields
- **Daily Streak Tracking:** Tracks consecutive days of mindful browsing and pause adherence.
- **Streak Shields / Freezes:** Built-in freeze protection shields users from losing their streak during an occasional missed day.
- **Milestone Badges:** Unlocks achievements at 3 days (🌱 Initial Spark), 7 days (🔥 One Week Momentum), 14 days (⚡ Iron Focus), 30 days (🛡️ Mindful Architect), 60 days (🧘 Zen Clarity), and 100 days (⭐ Urge Zero Legend).

### 4. URL Redirection & Temporary Bypass Windows
- **Safe Return Navigation:** Directs users back to their configured safe URL (e.g. Google Calendar, Notion, or project dashboard) with one click.
- **Conscious Continuation (5-Minute Window):** Users can reflect, state their intentional reason, and receive a temporary 5-minute bypass pass before restrictions re-arm.
- **Strict Mode:** Optional toggle that disables the continuation bypass completely, enforcing the 5-question challenge.

### 5. Goals & Insights
- Define and track personal intentions and daily pause targets.
- Real recorded intervention statistics (Returns to Goal, Breathing Pauses, Alarms Solved, Intentional Continues).
- Ethical disclosure ensuring data is never presented as medical/clinical addiction diagnosis.

### 6. Voluntary Accountability Partner
- Trusted contact configuration with explicit consent confirmation.
- Transparent alert preview: *"Urge Zero Alert: [User] paused before accessing [Domain] to stay aligned with goal: [Goal]"*.
- Simulated test notification trigger and instant revoke/disconnect controls.

### 7. Chrome Extension Manifest V3
- **Background Service Worker (`background.js`):** Intercepts main-frame navigation via `chrome.webNavigation.onBeforeNavigate` and redirects to the intervention page without infinite loops.
- **Extension Popup (`popup.html`):** Displays live protection status, current tab domain quick-restriction, active rule count, streak counter, and dashboard shortcuts.
- **Content Script Bridge (`content.js`):** Synchronizes state seamlessly between web dashboard and extension `chrome.storage.local`.

---

## 🎨 Design Tokens

- **Background:** `#F8FAF7`
- **Surface:** `#FFFFFF`
- **Primary Lime Mint:** `#C9F27A`
- **Primary Hover:** `#B8E75F`
- **Mint:** `#DDF7EE`
- **Powder Blue:** `#DCEBFF`
- **Primary Text:** `#26352D`
- **Secondary Text:** `#65736B`
- **Border:** `#E2E9E1`
- **Peach:** `#FFE5D6`
- **Success:** `#26734D`
- **Error:** `#B93838`
- **Typography:** Manrope (Headings), Inter (Body)

---

## 💻 Run & Development Instructions

### Prerequisites
- Node.js v18+ (tested on Node v22)
- npm v9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Visit `http://localhost:5173` in your browser.

### 3. Run Automated Tests
```bash
npm run test
```
Executes the comprehensive Vitest suite and Node test runner covering domain boundary matching, arithmetic generation, streak progression, and storage consistency.

### 4. Build for Production & Extension Packaging
```bash
npm run build
```
This builds both:
1. `dist/` — Web application ready for static hosting (Vercel, Netlify, Cloudflare).
2. `extension/` and `dist/` — Unpacked Chrome Manifest V3 extension ready to load into Chrome.

---

## 🧩 Loading the Extension into Google Chrome

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** using the toggle in the top-right corner.
3. Click the **Load unpacked** button.
4. Select the `cod/extension` (or `cod/dist`) directory.
5. The **Urge Zero** icon will appear in your Chrome toolbar. Pin it for quick access!

---

## 🔒 Privacy & Security

Urge Zero operates entirely **locally in your browser**.
- No full URLs or browsing histories are uploaded or tracked.
- No analytics trackers or external API keys required.
- Full backup export and factory reset controls in Settings.

---

## 👥 Credits
**Dual Core**
- **Kunal Rai**
- **Akshay Yadav**
