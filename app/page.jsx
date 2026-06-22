'use client'

import { useState } from 'react'
import { Sparkles, Shield, Target } from 'lucide-react'
import InputForm from '@/components/InputForm'
import ScoreBadge from '@/components/ScoreBadge'
import SkillPills from '@/components/SkillPills'
import BulletRewrite from '@/components/BulletRewrite'
import ErrorState from '@/components/ErrorState'
import Footer from '@/components/Footer'

// ─── Skeleton loaders ────────────────────────────────────────────────────────

function SkeletonBadge() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="skeleton rounded-full" style={{ width: 160, height: 160 }} />
      <div className="skeleton rounded-full w-28 h-7" />
      <div className="skeleton rounded w-32 h-4" />
    </div>
  )
}

function SkeletonPills() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-4 w-32 rounded" />
      <div className="flex flex-wrap gap-2">
        {[80, 60, 90, 70, 55, 75].map((w, i) => (
          <div key={i} className="skeleton rounded-full h-7" style={{ width: w }} />
        ))}
      </div>
      <div className="skeleton h-4 w-40 rounded mt-4" />
      <div className="flex flex-wrap gap-2">
        {[70, 85, 65, 90].map((w, i) => (
          <div key={i} className="skeleton rounded-full h-7" style={{ width: w }} />
        ))}
      </div>
    </div>
  )
}

function SkeletonBullets() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-xl overflow-hidden border border-slate-700/30">
          <div className="px-4 py-3 bg-slate-800/20 space-y-2">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-3/4 rounded" />
          </div>
          <div className="flex justify-center py-2 bg-slate-800/10">
            <div className="skeleton h-3 w-16 rounded" />
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-5/6 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Empty / hero state ───────────────────────────────────────────────────────

function HeroEmpty() {
  const features = [
    {
      icon: <Target className="w-5 h-5 text-indigo-400" />,
      title: 'Match Score',
      desc: 'Instant 0-100 score showing how well your resume aligns with the role.',
    },
    {
      icon: <Shield className="w-5 h-5 text-indigo-400" />,
      title: 'Skill Gap Analysis',
      desc: 'Every missing skill ranked by importance — critical, important, or nice-to-have.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-indigo-400" />,
      title: 'Resume Rewrites',
      desc: "AI-polished bullet points that surface skills you already have, phrased for ATS.",
    },
  ]

  return (
    <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
      {features.map((f, i) => (
        <div
          key={i}
          className="glass-card rounded-2xl p-5 flex flex-col gap-3"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.2)' }}
          >
            {f.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200 mb-1">{f.title}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Results section ──────────────────────────────────────────────────────────

function ResultsSection({ data, isLoading }) {
  return (
    <div id="results-section" className="mt-12 space-y-8 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
        <h2 className="text-sm font-semibold text-indigo-400 uppercase tracking-widest px-2">
          Analysis Results
        </h2>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-indigo-500/30 to-transparent" />
      </div>

      {/* Score + Skills row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Badge */}
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center gap-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
            Match Score
          </h3>
          {isLoading ? (
            <SkeletonBadge />
          ) : (
            <ScoreBadge score={data.matchScore} />
          )}
        </div>

        {/* Skills */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Skills Breakdown
          </h3>
          {isLoading ? (
            <SkeletonPills />
          ) : (
            <SkillPills
              matchedSkills={data.matchedSkills}
              missingSkills={data.missingSkills}
            />
          )}
        </div>
      </div>

      {/* Bullet Rewrites */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            AI Resume Rewrites
          </h3>
        </div>
        {isLoading ? (
          <SkeletonBullets />
        ) : (
          <BulletRewrite bullets={data.bulletRewrites} />
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'success' | 'error'
  const [result, setResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const handleAnalyze = async ({ jdText, resumeText }) => {
    setStatus('loading')
    setResult(null)
    setErrorMessage('')

    // Scroll to results area immediately so skeleton is visible
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jdText, resumeText }),
      })

      const data = await res.json()

      if (!res.ok) {
        const msg = data?.error || `Request failed with status ${res.status}.`
        setErrorMessage(msg)
        setStatus('error')
        return
      }

      setResult(data)
      setStatus('success')

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    } catch (fetchError) {
      console.error('Fetch error:', fetchError)
      setErrorMessage(
        'Network error — could not reach the server. Please check your connection and try again.'
      )
      setStatus('error')
    }
  }

  const handleRetry = () => {
    setStatus('idle')
    setErrorMessage('')
    setResult(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-8">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-medium text-indigo-300"
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Google Gemini AI
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
            <span className="gradient-text">GapCheck</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Paste any Job Description and your Resume — get an instant match score,
            ranked skill gaps, and AI-polished resume bullets tailored to the role.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-5 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              No signup required
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              No data stored
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Real AI analysis, not keywords
            </span>
          </div>
        </header>

        {/* Input Form card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 glow-border">
          <InputForm onSubmit={handleAnalyze} isLoading={status === 'loading'} />
        </div>

        {/* Error */}
        {status === 'error' && (
          <div className="mt-8 animate-fade-in">
            <ErrorState message={errorMessage} onRetry={handleRetry} />
          </div>
        )}

        {/* Results (loading or success) */}
        {(status === 'loading' || status === 'success') && (
          <ResultsSection
            data={result || {}}
            isLoading={status === 'loading'}
          />
        )}

        {/* Empty state — only before any submission */}
        {status === 'idle' && <HeroEmpty />}
      </main>

      <Footer />
    </div>
  )
}
