# Deployment & Operations Guide: GapCheck

This document provides step-by-step instructions for running GapCheck locally and deploying it to cloud platforms like Vercel.

---

## 1. Local Environment Setup

### Prerequisites
- **Node.js**: Version `18.x` or higher (recommended: `20.x` LTS).
- **npm**: Installed automatically with Node.js.
- **Google Gemini API Key**: Required for AI analysis. Obtain a free or pay-as-you-go key from [Google AI Studio](https://aistudio.google.com/apikey).

### Execution Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/ikeshavvarshney/GapCheck.git
   cd GapCheck
   ```
2. **Install Node dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env.local` file by copying the template:
   ```bash
   cp .env.local.example .env.local
   ```
   Open `.env.local` and paste your Gemini API key:
   ```env
   GEMINI_API_KEY=AIzaSy...your_gemini_api_key...
   ```
4. **Launch Developer Web Server**:
   ```bash
   npm run dev
   ```
5. **View Local Build**:
   Open your browser to [http://localhost:3000](http://localhost:3000). Both frontend components and API endpoints (`/api/analyze` and `/api/parse-file`) run together concurrently.

---

## 2. Cloud Deployment (Vercel)

Vercel is the recommended hosting platform for GapCheck because of first-class Next.js optimizations.

### Steps to Deploy

1. **Push Changes to GitHub**:
   Ensure all of your changes are committed and pushed to a remote repository on GitHub, GitLab, or Bitbucket.

2. **Connect to Vercel**:
   - Navigate to [Vercel Dashboard](https://vercel.com).
   - Click **"Add New..."** -> **"Project"**.
   - Import the target repository containing GapCheck.

3. **Configure Settings**:
   - **Framework Preset**: Vercel automatically detects `Next.js`. Leave this as default.
   - **Build & Development Settings**: Keep defaults (Build command: `next build`, Output directory: `.next`).

4. **Add Environment Variables**:
   Under the **"Environment Variables"** dropdown, add the following entry:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `[Your Actual Google Gemini API Key]`
   - **Environments**: Check `Production`, `Preview`, and `Development`.

5. **Deploy**:
   - Click **"Deploy"**.
   - Vercel will bundle assets, configure edge assets, and generate Serverless Functions for `/api/analyze` and `/api/parse-file`.

---

## 3. Serverless Runtime & Architectural Constraints

When deploying or maintaining GapCheck, keep these serverless execution characteristics in mind:

### A. Next.js Node.js Runtime
The `/api/parse-file` endpoint explicitly specifies the Node.js runtime environment:
```javascript
export const runtime = 'nodejs'
```
This is required because document parsers like `pdf-parse` rely on Node.js core libraries (such as `Buffer`, `events`, and stream readers). Attempting to run this endpoint on Vercel's Edge Runtime will result in application compilation crashes.

### B. Execution Timeouts (Vercel Hobby Tier)
- **Vercel Hobby Tier**: Serverless execution limits are capped at **10 seconds** per request.
- **Analysis Execution**: The call to Gemini API using the `gemini-2.5-flash-lite` model completes in 1.5 to 3 seconds under normal load, which fits comfortably within this window.
- **Parsing Execution**: Large, text-heavy PDFs (close to the 5MB limit) may take 2 to 4 seconds to parse. It is recommended to keep files small or copy-paste text directly if experiencing platform timeout thresholds.

### C. Serverless Regions
By default, Vercel deployments run serverless execution handlers in the Washington, D.C., USA region (`iad1`). To reduce latency, place your Vercel deployment region as close as possible to Google's Gemini API endpoints.
