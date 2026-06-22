# GapCheck — JD vs Resume Skill-Gap Analyzer

GapCheck is a free, AI-powered tool that compares a Job Description against your Resume and instantly shows you:

- **Match Score** — How well your resume aligns with the JD (0-100)
- **Matched Skills** — Skills you already have that the JD wants
- **Missing Skills** — Gaps ranked by importance (critical / important / nice-to-have), with reasons
- **Resume Bullet Rewrites** — 3-5 improved bullet points that better surface skills you already have, tailored to the JD

No account needed. No data stored. Everything runs in real-time via Google Gemini AI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| AI | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| Icons | lucide-react |
| Deployment | Vercel |

---

## Running Locally

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/gapcheck.git
cd gapcheck
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your Gemini API key

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and replace `your_key_here` with your actual Gemini API key. You can get one free at [Google AI Studio](https://aistudio.google.com/apikey).

```
GEMINI_API_KEY=your_actual_key_here
```

### 4. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) — the app and the API route (`/api/analyze`) both run together.

---

## Deploying on Vercel

1. **Push to GitHub** — Push this repo to a public (or private) GitHub repository.

2. **Import into Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click **"Import Git Repository"** and select your repo
   - Vercel auto-detects Next.js — no configuration needed

3. **Set the Environment Variable**
   - In the Vercel project settings → **Environment Variables**
   - Add: `GEMINI_API_KEY` = `your_actual_gemini_api_key`
   - Apply to **Production**, **Preview**, and **Development** environments

4. **Deploy**
   - Click **Deploy**
   - Vercel builds and deploys both the frontend and the `/api/analyze` serverless route automatically

---

## Project Structure

```
gapcheck/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.js       # POST — Gemini API call (server-side)
│   ├── globals.css            # Tailwind base + custom styles
│   ├── layout.jsx             # Root layout with metadata
│   └── page.jsx               # Main single-page app
├── components/
│   ├── BulletRewrite.jsx      # Before/after resume bullet cards
│   ├── ErrorState.jsx         # Error display component
│   ├── Footer.jsx             # Footer with attribution
│   ├── InputForm.jsx          # JD + Resume textareas + submit
│   ├── ScoreBadge.jsx         # Circular match score display
│   └── SkillPills.jsx         # Matched/missing skill badges
├── .env.local.example         # Env variable template
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── README.md
└── tailwind.config.js
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key — **never commit this** |

---

## License

MIT