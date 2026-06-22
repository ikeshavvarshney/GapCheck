'use client'

import { useState } from 'react'
import { Copy, Check, Sparkles, ArrowRight } from 'lucide-react'

function BulletCard({ before, after, index }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(after)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for environments where clipboard API is unavailable
      const el = document.createElement('textarea')
      el.value = after
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      className="rounded-xl overflow-hidden border border-slate-700/50 animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Before */}
      <div className="px-4 py-3 bg-slate-800/30 border-b border-slate-700/40">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Before</span>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">{before}</p>
      </div>

      {/* Arrow divider */}
      <div className="flex items-center justify-center py-2 bg-slate-800/10 border-b border-slate-700/40">
        <div className="flex items-center gap-2 text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
          <ArrowRight className="w-4 h-4" />
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* After */}
      <div className="px-4 py-3 bg-indigo-950/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">After</span>
          <button
            id={`copy-btn-${index}`}
            onClick={handleCopy}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all duration-200 ${
              copied
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-700/50 text-slate-400 border border-slate-600/40 hover:bg-indigo-600/20 hover:text-indigo-300 hover:border-indigo-500/30'
            }`}
            aria-label={copied ? 'Copied!' : 'Copy improved bullet to clipboard'}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed font-medium">{after}</p>
      </div>
    </div>
  )
}

export default function BulletRewrite({ bullets = [] }) {
  if (bullets.length === 0) {
    return (
      <p className="text-sm text-slate-500 italic">No bullet rewrites available.</p>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        These are your existing resume bullets, rewritten to better match the JD's language and requirements.
      </p>
      {bullets.map((bullet, i) => (
        <BulletCard
          key={i}
          index={i}
          before={bullet.before}
          after={bullet.after}
        />
      ))}
    </div>
  )
}
