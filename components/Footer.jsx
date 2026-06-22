'use client'

import { ExternalLink, Zap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-800/60 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Attribution */}
        <div className="text-sm text-slate-500 text-center sm:text-left">
          <span className="text-slate-400 font-medium">Built by [YOUR FULL NAME]</span>
          {' — '}
          <a
            href="mailto:[your.email@example.com]"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            [your.email@example.com]
          </a>
        </div>

        {/* Digital Heroes Button */}
        <a
          id="digital-heroes-link"
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 group"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#a5b4fc',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.25))'
            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))'
            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)'
          }}
        >
          <Zap className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
          Built for Digital Heroes
          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
        </a>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-4 text-center">
        <p className="text-xs text-slate-600">
          Powered by Google Gemini AI · No data stored · Analysis runs in real-time
        </p>
      </div>
    </footer>
  )
}
