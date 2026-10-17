# Urge Zero — Deployment Guide

## 🌐 Deploying the Web Dashboard (SPA)

### Vercel Deployment (Recommended)
1. **Repository Push:** Push the contents of `cod` to your GitHub/GitLab repository.
2. **Connect to Vercel:**
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. `vercel.json` is already included with SPA rewrites (`"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]`), ensuring all client-side routes and hash navigation resolve without 404s.

### Netlify Deployment
- Build Command: `npm run build`
- Publish Directory: `dist`
- Create `_redirects` in `dist` or root with `/* /index.html 200`.

---

## 🧩 Packaging the Chrome Extension (Manifest V3)

### For Local Developer Testing
1. Run `npm run build`.
2. Go to `chrome://extensions/` in Chrome or Brave.
3. Toggle **Developer mode** to ON.
4. Click **Load unpacked** and select `d:\projects\urgezero\cod\extension` (or `dist`).
5. Open any configured website (e.g., `youtube.com`) to test navigation redirection and the Focus Breach Alarm challenge!

### For Chrome Web Store Submission
1. In the `extension` or `dist` directory, select all contents (`manifest.json`, `background.js`, `content.js`, `popup.html`, `intervention.html`, `icons/`, `assets/`, `logo.png`).
2. Compress into a `.zip` file (e.g. `urgezero-extension-v1.0.0.zip`).
3. Upload the `.zip` file to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
4. Fill in store listing details:
   - Category: Productivity
   - Privacy Policy: Local-only storage declaration.
