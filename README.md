# AllergyAtlas 🌿

Find allergy-friendly baby products based on Australian ASCIA guidelines.

## What it does
- Searches 200,000+ products via the Open Beauty Facts API (no API key needed)
- Scores every product against ASCIA, NAC, A&AA, NACE and FSANZ guidelines
- Flags food derivatives (oat, nut oils, wheat) that can sensitise pre-solid infants
- Shows a detailed breakdown of why each point was gained or lost

## Deploy to Vercel (5 minutes)

### Option A — GitHub + Vercel (recommended)
1. Push this folder to a new GitHub repo
2. Go to vercel.com → New Project → Import your repo
3. Vercel auto-detects Vite. Click Deploy. Done.

### Option B — Vercel CLI
```bash
npm install -g vercel
vercel
```
Follow the prompts. Your app will be live at a `.vercel.app` URL.

## Local development
```bash
npm install
npm run dev
```

## Tech stack
- React + Vite
- Open Beauty Facts API (free, no key)
- Open Food Facts API (free, no key)
- Scoring engine: `src/scoring.js`
- API layer: `src/api.js`
- Guidelines data: `src/guidelines.js`
