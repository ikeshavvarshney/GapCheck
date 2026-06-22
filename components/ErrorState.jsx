'use client'

import { AlertTriangle, RefreshCw, WifiOff, ServerCrash, AlertCircle } from 'lucide-react'

const errorTypes = {
  network: {
    icon: <WifiOff className="w-8 h-8" />,
    title: 'Network Error',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  server: {
    icon: <ServerCrash className="w-8 h-8" />,
    title: 'Server Error',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
  validation: {
    icon: <AlertCircle className="w-8 h-8" />,
    title: 'Input Error',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  default: {
    icon: <AlertTriangle className="w-8 h-8" />,
    title: 'Something went wrong',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
}

function getErrorType(message) {
  if (!message) return 'default'
  const lower = message.toLowerCase()
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('connection')) return 'network'
  if (lower.includes('required') || lower.includes('short') || lower.includes('long') || lower.includes('invalid request')) return 'validation'
  if (lower.includes('server') || lower.includes('api') || lower.includes('gemini') || lower.includes('500') || lower.includes('502')) return 'server'
  return 'default'
}

export default function ErrorState({ message, onRetry }) {
  const type = getErrorType(message)
  const config = errorTypes[type] || errorTypes.default

  return (
    <div
      className={`rounded-2xl border p-6 flex flex-col items-center text-center gap-4 animate-fade-in ${config.bg}`}
      role="alert"
      aria-live="assertive"
    >
      <div className={config.color}>{config.icon}</div>

      <div>
        <h3 className={`text-base font-semibold mb-1 ${config.color}`}>{config.title}</h3>
        <p className="text-sm text-slate-400 max-w-md leading-relaxed">
          {message || 'An unexpected error occurred. Please try again.'}
        </p>
      </div>

      {onRetry && (
        <button
          id="retry-btn"
          onClick={onRetry}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-slate-700/60 border border-slate-600/40 text-slate-300 hover:bg-slate-600/60 hover:text-white transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  )
}
