import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const extensionDir = path.resolve(rootDir, 'extension');

// Ensure dist exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy manifest.json into dist
fs.copyFileSync(
  path.join(extensionDir, 'manifest.json'),
  path.join(distDir, 'manifest.json')
);

// Copy background.js into dist
fs.copyFileSync(
  path.join(extensionDir, 'background.js'),
  path.join(distDir, 'background.js')
);

// Copy content.js into dist
fs.copyFileSync(
  path.join(extensionDir, 'content.js'),
  path.join(distDir, 'content.js')
);

// Copy icons into dist/icons
const distIconsDir = path.join(distDir, 'icons');
if (!fs.existsSync(distIconsDir)) {
  fs.mkdirSync(distIconsDir, { recursive: true });
}

const extIconsDir = path.join(extensionDir, 'icons');
if (fs.existsSync(extIconsDir)) {
  for (const file of fs.readdirSync(extIconsDir)) {
    fs.copyFileSync(path.join(extIconsDir, file), path.join(distIconsDir, file));
  }
}

// Copy logo.png into dist and extension
if (fs.existsSync(path.join(rootDir, 'public', 'logo.png'))) {
  fs.copyFileSync(
    path.join(rootDir, 'public', 'logo.png'),
    path.join(distDir, 'logo.png')
  );
  fs.copyFileSync(
    path.join(rootDir, 'public', 'logo.png'),
    path.join(extensionDir, 'logo.png')
  );
}

// Also sync dist built assets into extension directory for direct loading from extension folder!
if (fs.existsSync(path.join(distDir, 'popup.html'))) {
  fs.copyFileSync(path.join(distDir, 'popup.html'), path.join(extensionDir, 'popup.html'));
}
if (fs.existsSync(path.join(distDir, 'intervention.html'))) {
  fs.copyFileSync(path.join(distDir, 'intervention.html'), path.join(extensionDir, 'intervention.html'));
}

// Copy dist/assets into extension/assets
const extAssetsDir = path.join(extensionDir, 'assets');
const distAssetsDir = path.join(distDir, 'assets');
if (fs.existsSync(distAssetsDir)) {
  if (!fs.existsSync(extAssetsDir)) {
    fs.mkdirSync(extAssetsDir, { recursive: true });
  }
  for (const file of fs.readdirSync(distAssetsDir)) {
    fs.copyFileSync(path.join(distAssetsDir, file), path.join(extAssetsDir, file));
  }
}

console.log('✓ Successfully packaged Chrome Extension Manifest V3 in both dist/ and extension/ folders!');
