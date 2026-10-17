# Urge Zero — Testing & Quality Assurance Report

## 🧪 Automated Test Suite

Run the full automated test suite with:
```bash
npm run test
```

### Test Coverage Details

#### 1. Domain Normalization & Boundary-Matching (`tests/domain.test.ts`)
- [x] Canonical normalization of URLs with protocols, trailing slashes, ports, query strings, and `www.` prefixes.
- [x] Hostname syntax validation (rejects empty, spaces, invalid symbols, lack of dots).
- [x] Exact-domain matching (`youtube.com` matches `youtube.com`).
- [x] Subdomain boundary matching (`m.youtube.com`, `music.youtube.com` match `youtube.com`).
- [x] Prefix/Suffix negative protection (`notyoutube.com` and `myoutube.com` do NOT match `youtube.com`).
- [x] Schedule window evaluation (handles active days, standard day hours, and overnight hour windows).

#### 2. Focus Breach Alarm Mathematics Generator (`tests/mathQuestions.test.ts`)
- [x] Exactly five questions generated per challenge sequence.
- [x] Guarantees valid integer answers without decimals or fractions across Easy, Normal, and Hard.
- [x] Non-negative subtraction guarantees (`a - b >= 0`).
- [x] Exact division guarantees (`operand1 % operand2 === 0`).
- [x] High randomness and fresh question prompts across distinct runs.

#### 3. Streak & Shield Engine (`tests/streak.test.ts`)
- [x] Daily consecutive day increments.
- [x] Same-day multiple activity protection (streak does not over-increment).
- [x] Automatic freeze shield consumption when a single day is missed.
- [x] Accurate milestone unlocking across 3, 7, 14, 30, 60, and 100 days.

#### 4. Storage & State Consistency (`tests/storage.test.ts`)
- [x] Safe default state with initial rules and master alarm enabled.
- [x] Normalized domain integrity in default rule sets.
- [x] Serialization and deserialization integrity across JSON round-trips.

---

## 🔍 Manual QA Acceptance Verification

1. **Focus Breach Alarm Challenge:**
   - Navigating to `#intervention?domain=youtube.com&alarm=true` triggers the alarm modal.
   - Synthesizer loops tone continuously until the 5th math question is solved.
   - Autoplay audio block is detected with accessible unmute button.
   - Empty input is rejected without skipping.
   - Wrong answers show calm retry prompt and shake animation without advancing.
   - Correct answers advance step counter by 1.
   - 5th correct answer immediately silences siren, plays harmonic victory chime, and explodes confetti.
   - Emergency / accessibility override stops alarm cleanly.

2. **URL Redirection & Navigation:**
   - "Return to my goal" navigates directly to user's configured safe destination.
   - "Take a 30-second breathing pause" triggers calming breath animation.
   - "Continue intentionally" logs conscious note and grants 5-minute temporary bypass.
